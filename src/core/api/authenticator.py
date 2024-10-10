#from functools import wraps
#import os
#import requests
#from jwt import PyJWKClient
#from flask import request, jsonify
#
## OIDC Konfiguration
#OIDC_CLIENT_ID = os.getenv("OIDC_CLIENT_ID", None)
#OIDC_CERT_URL = os.getenv("OIDC_CERT_URL", None)
#OIDC_ALLOWED_ROLES = os.getenv("OIDC_ALLOWED_ROLES", "admin").split(',')
#
## Erstelle den JWK-Client
#def get_jwk_client():
#    if OIDC_CERT_URL:
#        return PyJWKClient(OIDC_CERT_URL)
#    return None
#
## Verifiziere das JWT Token
#def verify_jwt(token):
#    if OIDC_CERT_URL and OIDC_CLIENT_ID:
#        try:
#            jwk_client = get_jwk_client()
#            signing_key = jwk_client.get_signing_key_from_jwt(token)
#            payload = signing_key.verify(token, audience=OIDC_CLIENT_ID)
#            return payload
#        except Exception as e:
#            raise ValueError(f'Token is invalid: {str(e)}')
#    return None
#
## Dekorator für Token-geschützte Routen
#def token_required(f):
#    """
#    Decorator function that checks if a valid token is present in the request headers and verifies its authenticity.
#    It also checks if the user has the required role to access the protected resource.
#
#    Args:
#        f (function): The function to be decorated.
#
#    Returns:
#        function: The decorated function.
#
#    Raises:
#        ValueError: If the token is invalid.
#    """
#    @wraps(f)
#    def decorated(*args, **kwargs):
#        if not OIDC_CLIENT_ID or not OIDC_CERT_URL:
#            # OIDC not configured, grant access
#            return f(*args, **kwargs)
#        print(request.headers)
#        token = request.headers.get('Authorization')
#        if not token:
#            return jsonify({'message': 'Token is missing!'}), 403
#        
#        token = token.replace('Bearer ', '')
#        
#        try:
#            payload = verify_jwt(token)
#        except ValueError as e:
#            return jsonify({'message': str(e)}), 403
#        
#        # Check if the user has the required role
#        if OIDC_ALLOWED_ROLES and not any(role in payload.get('realm_access', {}).get('roles', []) for role in OIDC_ALLOWED_ROLES):
#            return jsonify({'message': 'Insufficient permissions'}), 403
#        
#        return f(*args, **kwargs)
#    return decorated
#