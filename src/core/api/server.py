import json
import mimetypes
import os
from bson import ObjectId
import requests
import time
import settings
import urllib.parse
from redis import Redis
from datetime import datetime
from authlib.integrations.flask_client import OAuth
from flask import (Flask, jsonify, redirect, request, send_file, send_from_directory, Response, session, url_for)
from flask_cors import CORS
from flask_session import Session
from src.control import get_last_inference_frame
from src.core.cryptography import EncryptionManager
#from src.utils.authenticator import token_required
from src.utils.logger import Logger
from src.utils.messyFunctions import generateUUID, delete_session
from src.utils.schemes import validate_config, validate_mongo_data, validate_settings, validate_mqtt_data
from authlib.integrations.base_client.errors import OAuthError, MismatchingStateError


logger = Logger("Server", settings.LOG_PATH + "/server.log")

encryption_manager = EncryptionManager()

ALLOWED_ORIGINS = settings.ALLOWED_ORIGINS
SECRET_KEY = settings.SECRET_KEY


app = Flask(__name__, static_folder=settings.BUILD_PATH, static_url_path="/")
app.debug = settings.APP_DEV_MODE
app.config['SECRET_KEY'] = SECRET_KEY

if not settings.APP_DEV_MODE and settings.APP_REDIS_SERVER:
    app.config['SESSION_TYPE'] = 'redis'
    app.config['SESSION_PERMANENT'] = True
    app.config['SESSION_REDIS'] = Redis.from_url(f'redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}')
    Session(app)

CORS(
    app,
    resources={r"/*": {"origins": ALLOWED_ORIGINS}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Origin"],
)

# Authlib OAuth-Setup
if settings.USE_OIDC:
    oauth = OAuth(app)
    oauth.register(
        name='oidc',
        client_id=settings.OIDC_CLIENT_ID,
        client_secret=settings.OIDC_CLIENT_SECRET,
        server_metadata_url=settings.OIDC_SERVER_METADATA_URL,
        client_kwargs={
            'scope': settings.OIDC_SCOPES,
        }
    )
    
    def introspect_token(token):
        introspect_url = settings.OIDC_TOKEN_INTROSPECTION_URI
        client_id = settings.OIDC_CLIENT_ID
        client_secret = settings.OIDC_CLIENT_SECRET
        data = {
            'token': token,
            "grant_type": "client_credentials",
            'client_id': client_id,
            'client_secret': client_secret
        }

        response = requests.post(introspect_url, data=data)

        if response.status_code == 200:
            token_info = response.json()

            if token_info.get('active'):
                exp = token_info.get('exp')
                if exp and exp > int(time.time()):
                    return True  # Token ist aktiv und nicht abgelaufen
                else:
                    return False  # Token ist abgelaufen
            else:
                return False  # Token ist nicht aktiv
        else:
            #print(f"Fehler bei der Token-Introspektion: {response.status_code}")
            return False


@app.route("/")
def serve():
    if not settings.USE_OIDC:
        return send_from_directory(app.static_folder, "index.html")
    if 'oidc_auth_token' not in session:
        return redirect(url_for('login'))
    return send_from_directory(app.static_folder, "index.html")


def refresh_access_token():
    try:
        token_endpoint = f"{settings.OIDC_ISSUER}/protocol/openid-connect/token"
        refresh_token = session['oidc_auth_token'].get('refresh_token')
        
        if not refresh_token:
            return False
            
        data = {
            'grant_type': 'refresh_token',
            'client_id': settings.OIDC_CLIENT_ID,
            'client_secret': settings.OIDC_CLIENT_SECRET,
            'refresh_token': refresh_token
        }
        
        response = requests.post(token_endpoint, data=data)
        
        if response.status_code == 200:
            new_token = response.json()
            
            userinfo_response = requests.get(
                settings.OIDC_USERINFO_URI,
                headers={"Authorization": f"Bearer {new_token['access_token']}"}
            )
            
            if userinfo_response.status_code == 200:
                userinfo = userinfo_response.json()
                session['oidc_auth_token'] = {
                    'access_token': new_token['access_token'],
                    'refresh_token': new_token.get('refresh_token', refresh_token),
                    'expires_at': time.time() + new_token['expires_in'],
                    'id_token': new_token.get('id_token'),
                    **userinfo
                }
                return True
        return False
    except Exception as e:
        logger.error(f"Token refresh failed: {str(e)}")
        return False
    

@app.before_request
def require_auth():
    if not settings.USE_OIDC:
        return
    if request.endpoint in ['login', 'auth', 'logout']:
        return  # Keine Authentifizierung für diese Routen

    if 'oidc_auth_token' in session:
        token = session['oidc_auth_token'].get('access_token')
        expires_at = session['oidc_auth_token'].get('expires_at')

        #if expires_at and time.time() > (expires_at - 30):
        #    print("Token abgelaufen. Refreshing...")
        #    if not refresh_access_token():
        #        session.clear()
        #        return redirect(url_for('login'))

        if token:
            expiration_time = datetime.fromtimestamp(expires_at)
            #print("Token läuft ab um:", expiration_time.strftime("%Y-%m-%d %H:%M:%S"))

        # Überprüfen, ob das Token abgelaufen ist
        if not token or (expires_at and time.time() > expires_at):
            session.clear()  # Session leeren
            return redirect(url_for('login'))

        # Token Introspektion
        if not introspect_token(token):
            session.clear()
            return redirect(url_for('login'))

        return  # Benutzer ist eingeloggt und Token ist gültig

    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        if introspect_token(token):
            return
        else:
            return jsonify({"error": "Unauthorized"}), 401

    return redirect(url_for('login'))


@app.route('/login')
def login():
    if not settings.USE_OIDC:
        return jsonify({"message": "OIDC not configured."}), 200
    redirect_uri = url_for('auth', _external=True)
    return oauth.oidc.authorize_redirect(redirect_uri)


@app.errorhandler(404)
def not_found_error(error):
    return send_from_directory(app.static_folder, "index.html")


@app.route("/api/userinfo", methods=["GET"])
def userinfo():
    if not settings.USE_OIDC:
        return jsonify({"message": "OIDC not configured."}), 200
    # Abrufen der Benutzerinformationen aus der Session
    
    if not refresh_access_token():
        return jsonify({"error": "Token refresh failed."}), 401
    
    oidc_session_info = {
        "sub": session['oidc_auth_token'].get("sub"),
        "email_verified": session['oidc_auth_token'].get("email_verified"),
        "roles": session['oidc_auth_token'].get("roles"),
        "groups": session['oidc_auth_token'].get("groups"),
        "preferred_username": session['oidc_auth_token'].get("preferred_username"),
        "given_name": session['oidc_auth_token'].get("given_name"),
        "family_name": session['oidc_auth_token'].get("family_name"),
        "email": session['oidc_auth_token'].get("email"),
        "token_expires_at": session['oidc_auth_token'].get("expires_at"),
    }
    #print("token_expires_at:", oidc_session_info.get("token_expires_at"))

    return json.dumps(oidc_session_info), 200


@app.route('/auth')
def auth():
    if not settings.USE_OIDC:
        return jsonify({"message": "OIDC not configured."}), 200
    
    try:
        token = oauth.oidc.authorize_access_token()
    except MismatchingStateError as e:
        # Log the state mismatch error for debugging
        app.logger.error(f"MismatchingStateError: {str(e)}")
        return jsonify({"error": "Authentication failed due to a CSRF error.", "details": "State parameter mismatch."}), 401
    except OAuthError as e:
        # Log other OAuth errors
        app.logger.error(f"OAuthError: {str(e)}")
        return jsonify({"error": "Authentication failed.", "details": str(e)}), 401
    
    if token:
        userinfo_url = settings.OIDC_USERINFO_URI
        userinfo_response = requests.get(userinfo_url, headers={"Authorization": f"Bearer {token['access_token']}"})

        if userinfo_response.status_code == 200:
            userinfo = userinfo_response.json()
            session['oidc_auth_token'] = {
                'access_token': token['access_token'],
                'refresh_token': token.get('refresh_token'),
                'expires_at': time.time() + token['expires_in'],
                'id_token': token['id_token'],
                **userinfo
            }
            return redirect('/')
    
    return Response("Authentication failed.", status=401)


@app.route('/signout', methods=['POST'])
def logout():
    if request.method == 'POST':
        if not settings.USE_OIDC:
            return jsonify({"message": "OIDC not configured."}), 200

        id_token = session.get('oidc_auth_token', {}).get('id_token')

        if id_token:
            logout_url = (
                f"{settings.OIDC_ISSUER}/protocol/openid-connect/logout?"
                f"id_token_hint={urllib.parse.quote(id_token)}&"
                f"post_logout_redirect_uri={urllib.parse.quote(settings.APP_DOMAIN + '/', safe='')}"
            )
            try:
                # So loggt der Server den User beim OIDC Provider aus aus
                logout_response = requests.get(logout_url)

                if logout_response.status_code == 200:
                    #return Response(logout_url, status=200)
                    session.clear()
                    return Response(url_for('login'), status=200)
                    # So loggt der User sich selber aus. Weniger sicher
                    #return Response(logout_url, status=200)
                else:
                    return Response("Logout failed on external server.", status=500)
            except Exception as e:
                return Response(f"Error during logout request: {str(e)}", status=500)

        else:
            # kein id_token vorhanden
            return Response("No Session found.", status=404)


@app.route("/api/mqtt", methods=["POST", "DELETE", "GET"])
def mqtt():
    if request.method == "POST":
        data = request.json
        
        # Lade die vorhandenen Daten, wenn die Datei existiert
        encrypted_data = encryption_manager.load_data("mqtt") if os.path.exists(encryption_manager.MQTT_DATA_FILE) else None
        
        # Bestehende Daten entschlüsseln
        if encrypted_data:
            existing_data = json.loads(encryption_manager.decrypt_data(encrypted_data))
            
            # Altes Passwort aus den bestehenden Daten holen
            existing_password = existing_data.get("password")

            # Prüfen, ob ein neues Passwort gesetzt ist
            new_password = data.get("password")
            
            # Wenn ein Passwort in den Daten vorhanden ist und das neue Passwort ist ***,
            # dann soll das alte Passwort verwendet werden
            if new_password and new_password == "*" * len(new_password):
                data["password"] = existing_password


        # Validierung der Daten
        try:
            validate_mqtt_data(data)
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

        # Speichere die aktualisierten Daten
        encrypted_data = encryption_manager.encrypt_data(json.dumps(data))
        encryption_manager.save_data(encrypted_data, "mqtt")
        
        from src.control import mqtt_client
        status = mqtt_client.is_connected() if mqtt_client and hasattr(mqtt_client, 'is_connected') else False

        return jsonify({"message": "Gespeichert." + (" Neustart des MQTT-Clients empfohlen." if status else "")}), 200
    
    if request.method == "DELETE":
        # Lösche die gespeicherte verschlüsselte Konfiguration
        if os.path.exists(encryption_manager.MQTT_DATA_FILE):
            os.remove(encryption_manager.MQTT_DATA_FILE)
        return jsonify({"message": "Gelöscht."}), 200

    if request.method == "GET":
        # Lade die verschlüsselte Konfiguration
        encrypted_data = encryption_manager.load_data("mqtt")
        if encrypted_data:
            data = json.loads(encryption_manager.decrypt_data(encrypted_data))
            password = data.get("password")
            data["password"] = "*"*len(password) if password else None
            return jsonify(data)
        else:
            return jsonify({"message": "Keine Konfiguration gefunden"}), 404


@app.route("/api/mongo", methods=["POST", "DELETE", "GET"])
def mongo():
    if request.method == "POST":
        data = request.json
        
        # Lade die vorhandenen Daten, wenn die Datei existiert
        encrypted_data = encryption_manager.load_data("mongo") if os.path.exists(encryption_manager.MONGO_DATA_FILE) else None
        
        # Bestehende Daten entschlüsseln
        if encrypted_data:
            existing_data = json.loads(encryption_manager.decrypt_data(encrypted_data))
            
            # Altes Passwort aus den bestehenden Daten holen
            existing_password = existing_data.get("password")

            # Prüfen, ob ein neues Passwort gesetzt ist
            new_password = data.get("password")
            
            # Wenn ein Passwort in den Daten vorhanden ist und das neue Passwort ist ***,
            # dann soll das alte Passwort verwendet werden
            if new_password and new_password == "*" * len(new_password):
                data["password"] = existing_password

        # Validierung der Daten
        try:
            validate_mongo_data(data)
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

        # Speichere die aktualisierten Daten
        encrypted_data = encryption_manager.encrypt_data(json.dumps(data))
        encryption_manager.save_data(encrypted_data, "mongo")
        
        from src.control import mongo_client
        status = mongo_client.is_connected() if mongo_client and hasattr(mongo_client, 'is_connected') else False

        return jsonify({"message": "Gespeichert." + (" Neustart des MongoDB-Clients empfohlen." if status else "")}), 200
    
    if request.method == "DELETE":
        # Lösche die gespeicherte verschlüsselte Konfiguration
        if os.path.exists(encryption_manager.MONGO_DATA_FILE):
            os.remove(encryption_manager.MONGO_DATA_FILE)
        return jsonify({"message": "Gelöscht."}), 200

    if request.method == "GET":
        # Lade die verschlüsselte Konfiguration
        encrypted_data = encryption_manager.load_data("mongo")
        if encrypted_data:
            data = json.loads(encryption_manager.decrypt_data(encrypted_data))
            password = data.get("password")
            data["password"] = "*" * len(password) if password else None
            return jsonify(data)
        else:
            return jsonify({"message": "Keine Konfiguration gefunden"}), 404


@app.route("/api/config", methods=["GET", "POST"], endpoint='config')
def config():
    from src.utils.generateDefaults import generateDefaultConfigIfNotExists
    generateDefaultConfigIfNotExists()
    global update_stream
    update_stream = False

    if request.method == "GET":
        with open(settings.CONFIG_PATH, "r") as file:
            return json.load(file)

    elif request.method == "POST":
        data = request.json
        if not data.get("id"):
            data["id"] = generateUUID()

        # Manchmal kamen die Punkte als Dezimalzahlen an..
        for roi in data.get("deviceRois", []):
            for point in roi.get("points", []):
                if point.get("x"):
                    point["x"] = int(point["x"])
                if point.get("y"):
                    point["y"] = int(point["y"])
        try:
            validate_config(data)
        except ValueError as e:
            return Response(str(e), status=400)

        with open(settings.CONFIG_PATH, "w") as file:
            json.dump(data, file)
            
            return Response(status=200)


@app.route("/api/systemsettings", methods=["GET", "POST"], endpoint='systemsettings')
def systemsettings():
    from src.utils.generateDefaults import generateDefaultSystemSettingsIfNotExists
    generateDefaultSystemSettingsIfNotExists()
    
    if request.method == "GET":
        with open(settings.SYSTEM_SETTINGS_PATH, "r") as file:
            return json.load(file)
    elif request.method == "POST":
        data = request.json
        try:
            validate_settings(data)
        except ValueError as e:
            return Response(json.dumps({"error": str(e)}), status=400, mimetype='application/json')

        with open(settings.SYSTEM_SETTINGS_PATH, "w") as file:
            json.dump(data, file)
            return Response(json.dumps({"message": "Gespeichert."}), status=200, mimetype='application/json')


@app.route('/api/logs', methods=['GET'], endpoint='logs')
def logs():
    limit = request.args.get('limit', default=50, type=int)
    date_filter = request.args.get('date', None)  # Optionaler Tag-Parameter im Format YYYY-MM-DD

    if request.method == 'GET':
        #logger.info(f"Log request with limit: {limit}, date filter: {date_filter}")
        if os.path.exists(settings.LOG_PATH):
            log_files = [f for f in os.listdir(settings.LOG_PATH) if f.endswith(".log")]
            # entferne SYSTEM_RESTART.log
            log_files = [f for f in log_files if f != "SYSTEM_RESTART.log"]
            # entferne BENCHMARK
            log_files = [f for f in log_files if f != "BENCHMARK.log"]
            

            if log_files:
                logs_data = []
                for log_file in log_files:
                    with open(os.path.join(settings.LOG_PATH, log_file), 'r') as f:
                        lines = f.readlines()

                    # Filtere nach Datum, wenn gesetzt
                    if date_filter:
                        lines = [line for line in lines if date_filter in line]
                    
                    # Begrenze die Anzahl der Zeilen nach dem Datum
                    last_lines = lines[-limit:]
                    last_lines.reverse()
                    logs_data.append({log_file: last_lines})
                    #logs_data.reverse()
                    
                return jsonify(logs_data)
            else:
                return jsonify({"message": "Keine Log-Dateien gefunden."}), 200
        else:
            return jsonify({"message": "Keine Log-Dateien gefunden."}), 200


@app.route('/api/health', methods=['GET'], endpoint='health')
def health():
    from src.control import send_status
    if request.method == 'GET':
        return send_status()


@app.route('/api/benchmarks', methods=['GET', 'DELETE'], endpoint='benchmarks')
def benchmarks():
    if request.method == 'GET':
        if os.path.exists(settings.BENCHMARKS_PATH):
            benchmark_files = [f for f in os.listdir(settings.BENCHMARKS_PATH) if f.endswith(".json")]

            if benchmark_files:
                benchmarks_data = []
                for benchmark_file in benchmark_files:
                    with open(os.path.join(settings.BENCHMARKS_PATH, benchmark_file), 'r') as f:
                        data = json.load(f)
                    benchmarks_data.append(data)
                return jsonify(benchmarks_data)
            else:
                return jsonify({"message": "No benchmark files found."}), 200
        else:
            return jsonify({"message": "No benchmark files found."}), 200
    
    if request.method == 'DELETE':
        if os.path.exists(settings.BENCHMARKS_PATH):
            for filename in os.listdir(settings.BENCHMARKS_PATH):
                if filename.endswith('.json'):
                    file_path = os.path.join(settings.BENCHMARKS_PATH, filename)
                    os.remove(file_path)
            return jsonify({'message': 'Deleted all benchmark files.'}), 200
        else:
            return jsonify({'message': 'No benchmark files found.'}), 200


@app.route('/api/image', methods=['GET', 'POST'], endpoint='api_image')
def api_image():
    from src.control import take_snapshot
    image_path = settings.IMG_PATH + "/capture.jpg"

    #cam_solutions = load_config(settings.CAM_SOLUTIONS_PATH)
    #if not cam_solutions or (not cam_solutions.get("cv2", False) and not cam_solutions.get("picam2", False)):
    #    error = "Keine Kamera-Lösungen gefunden."
    #    logger.error(error)
    #    return Response(error, status=400)
    
    if request.args.get('snap') == 'true':
        logger.info('Received GET on /api/image with snap=true. Taking Snapshot...')
        take_snapshot()
    else:
        if not os.path.exists(image_path):
            logger.info('Received GET on /api/image with snap=false but no image found. Taking Snapshot...')
            take_snapshot()

    if os.path.exists(image_path):
        with open(image_path, 'rb') as f:
            image = f.read()
        return Response(image, mimetype='image/jpeg')
    else:
        logger.error('Image not found.')
        return Response(status=404)


@app.route('/api/action', methods=['POST'])
def action():
    from src.control import start_mqtt_client, stop_mqtt_client, start_stream, stop_stream, take_snapshot, take_video, start_counting, stop_counting, start_model_benchmark, stop_model_benchmark, restart_server, start_mongo_client, stop_mongo_client

    data = request.json
    action = data.get('action')
    target = data.get('target')
    params = data.get('params', {})

    if action not in ['start', 'stop', 'snap', 'video', 'restart']:
        return jsonify({"error": "Invalid action."}), 400

    if target not in ['camera', 'counting', 'benchmark', 'mqtt', 'mongo', 'server']:
        return jsonify({"error": "Invalid target. Use 'camera', 'counting','benchmark', 'mongo', or 'mqtt'."}), 400

    # Mapping der Targets zu den Funktionen
    action_map = {
        'camera': {
            'start': start_stream,
            'stop': stop_stream,
            'snap': take_snapshot,
            'video': take_video
        },
        'counting': {   # TODO: counting oder inference? siehe MQTT
            'start': start_counting,
            'stop': stop_counting
        },
        'benchmark': {
            'start': start_model_benchmark,
            'stop': stop_model_benchmark
        },
        'mqtt': {
            'start': start_mqtt_client,
            'stop': stop_mqtt_client
        },
        'server': {
            'restart': restart_server
        },
        'mongo': {
            'start': start_mongo_client,
            'stop': stop_mongo_client
        }
    }

    # Hole die passende Funktion
    func = action_map.get(target, {}).get(action)

    if func is None:
        return jsonify({"error": "Action not found for the target."}), 404

    try:
        if target == 'counting' and action == 'start':
            result = func(params)

        elif target == 'camera' and action == 'video':
            result = func(
                duration=params.get('duration', None)
            )
        else:
            result = func()
        return jsonify({"message": result}), 200
    except Exception as e:
        logger.error(f"Error during action execution: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/simulations', methods=['GET', 'DELETE'])
def simulations():
    if request.method == 'GET':
        simulation_data = []
        sim_type = request.args.get('type')

        if sim_type == 'simvid':
            path = settings.VID_PATH
            #file_extension = '.mp4'
        elif sim_type == 'simimg':
            path = settings.IMG_PATH
            #file_extension = None
        else:
            return jsonify({'error': 'Invalid type parameter'}), 400

        for filename in os.listdir(path):
            if filename.endswith('.json'):
                base_filename = filename.replace('.json', '')
                json_file = filename
                jpg_file = f"{base_filename}.jpg"
                json_file_path = os.path.join(path, json_file)
                jpg_file_path = os.path.join(path, jpg_file)

                if os.path.exists(jpg_file_path):
                    with open(json_file_path, 'r') as f:
                        json_content = json.load(f)

                    data_entry = {
                        'config': json_content,
                        'image_url': url_for('get_file', filename=jpg_file, _external=True),
                    }

                    if sim_type == 'simvid':
                        mp4_file = f"{base_filename}.mp4"
                        mp4_file_path = os.path.join(path, mp4_file)
                        if os.path.exists(mp4_file_path):
                            data_entry['video_url'] = url_for('get_file', filename=mp4_file, _external=True)

                    simulation_data.append(data_entry)

        return jsonify(simulation_data)
    
    if request.method == 'DELETE':
        sim_type = request.args.get('type')
        if sim_type == 'simvid':
            path = settings.VID_PATH
        elif sim_type == 'simimg':
            path = settings.IMG_PATH
        else:
            return jsonify({'error': 'Invalid type parameter'}), 400

        for filename in os.listdir(path):
            if filename.endswith('.json'):
                base_filename = filename.replace('.json', '')
                json_file = filename
                jpg_file = f"{base_filename}.jpg"
                json_file_path = os.path.join(path, json_file)
                jpg_file_path = os.path.join(path, jpg_file)

                if os.path.exists(jpg_file_path):
                    os.remove(jpg_file_path)
                    os.remove(json_file_path)

                if sim_type == 'simvid':
                    mp4_file = f"{base_filename}.mp4"
                    mp4_file_path = os.path.join(path, mp4_file)
                    if os.path.exists(mp4_file_path):
                        os.remove(mp4_file_path)

        return jsonify({'message': 'Deleted all simulation files.'}), 200


@app.route('/api/file/<path:filename>', methods=['GET'])
def get_file(filename):
    if 'simvid_' in filename:
        file_path = os.path.join(settings.VID_PATH, filename)
    elif 'simimg_' in filename:
        file_path = os.path.join(settings.IMG_PATH, filename)
    else:
        return jsonify({'error': 'File not found'}), 404

    #file_path = os.path.join(settings.VID_PATH, filename)
    if os.path.exists(file_path):
        # Bestimme den MIME-Typ dynamisch
        mime_type, _ = mimetypes.guess_type(file_path)

        if not mime_type:
            mime_type = 'application/octet-stream'
        
        response = send_file(
            file_path,
            mimetype= mime_type,
            as_attachment=False,
            conditional=True
        )
        
        response.headers['Accept-Ranges'] = 'bytes'
        return response
    else:
        return jsonify({'error': 'File not found'}), 404


@app.route('/api/data', methods=['GET'])
def get_mongo_data():
    
    if request.method == 'GET':
        from src.control import mongo_client

        if not mongo_client or not hasattr(mongo_client, 'is_connected') or not mongo_client.is_connected():
            return jsonify({'error': 'MongoDB not connected.'}), 503

        session_id = request.args.get('session_id', None)
        type = request.args.get('type', None)

        if type is None:
            return jsonify({'error': 'Missing type parameter.'}), 400

        if not session_id or not session_id:
            return jsonify({'error': 'Missing session_id parameters.'}), 400

        try:
            success, data = mongo_client.get_data(type, session_id)
            if not success:
                return jsonify({'error': 'Failed to retrieve data.'}), 500

            def serialize(data):
                if isinstance(data, ObjectId):
                    return str(data)
                elif isinstance(data, list):
                    return [serialize(item) for item in data]
                elif isinstance(data, dict):
                    return {key: serialize(value) for key, value in data.items()}
                else:
                    return data

            # Aggregation der Daten
            if type == "counts":
                aggregated_data = {}

                # Durchlaufe alle Datensätze und aggregiere sie
                for entry in data:
                    # Hier prüfen wir, ob die Struktur von entry den Erwartungen entspricht
                    if isinstance(entry, dict):
                        for roi, directions in entry.items():
                            if roi not in aggregated_data:
                                aggregated_data[roi] = {}

                            # Prüfe die Struktur von directions
                            if isinstance(directions, dict):
                                for direction, counts in directions.items():
                                    if direction not in aggregated_data[roi]:
                                        aggregated_data[roi][direction] = {"IN": {}, "OUT": {}}

                                    # Aggregiere IN
                                    if 'IN' in counts:
                                        for obj_class, count in counts['IN'].items():
                                            if obj_class not in aggregated_data[roi][direction]["IN"]:
                                                aggregated_data[roi][direction]["IN"][obj_class] = 0
                                            aggregated_data[roi][direction]["IN"][obj_class] += count

                                    # Aggregiere OUT
                                    if 'OUT' in counts:
                                        for obj_class, count in counts['OUT'].items():
                                            if obj_class not in aggregated_data[roi][direction]["OUT"]:
                                                aggregated_data[roi][direction]["OUT"][obj_class] = 0
                                            aggregated_data[roi][direction]["OUT"][obj_class] += count
                            else:
                                # Debugging-Ausgabe, falls directions keine dict-Struktur hat
                                # TODO !
                                # Im Prinzip eliminiert das hier nur die _id und timestamp, könnte ruhig so bleiben
                                #print(f"Unexpected structure for directions: {directions}")
                                pass

                return jsonify(serialize(aggregated_data))

            return jsonify(serialize(data))

        except ValueError:
            return jsonify({'error': 'Invalid format.'}), 400

    
last_frame_request = 0
request_interval = 5

@app.route('/api/inference/frame', methods=['GET'])
def get_inference_frame():
    global last_frame_request
    current_time = time.time()

    if current_time - last_frame_request < request_interval:
        return jsonify({'error': 'Too many requests.'}), 429
    
    last_frame_request = current_time

    frame = get_last_inference_frame()
    if frame is not None:
        return Response(frame, mimetype='image/jpeg')
    else:
        return jsonify({'error': 'No frame found.'}), 404
    

@app.route('/api/youtube', methods=['GET'])
def youtube_stream():
    url = request.args.get('url')
    if not url:
        return jsonify({'error': 'No URL provided.'}), 400
    try:
        from src.control import pafy_live
        pafy_live.set_url(url)
        formats = pafy_live.get_formats()
        return jsonify(formats)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/sessions', methods=['GET', 'DELETE'])
def get_sessions():
    import settings
    path = settings.SESSIONS_PATH

    if not os.path.exists(path):
        return jsonify({'error': 'No sessions found.'}), 404
    
    if request.method == 'GET':
        with open(path, 'r') as f:
            session_data = json.load(f)
            
        if 'sessions' in session_data:
            session_data['sessions'].reverse()
            
        return jsonify(session_data)
    
    if request.method == 'DELETE':
        id = request.args.get('id')
        
        try:
            delete_session(id, settings.SESSIONS_PATH)
            return jsonify({'message': 'Session deleted.'}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500