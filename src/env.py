import os
from dotenv import load_dotenv, set_key

def manage_env_variable(var_name, new_value, env_file='.env'):
    """
    Überprüft, ob eine .env-Datei existiert. 
    Wenn nicht, wird sie erstellt und die Umgebungsvariable gesetzt.
    
    :param var_name: Name der Umgebungsvariable
    :param new_value: Wert, auf den die Umgebungsvariable gesetzt werden soll
    :param env_file: Pfad zur .env-Datei
    """
    if not os.path.exists(env_file):
        with open(env_file, 'w') as f:
            f.write(f'{var_name}=False\n')

    set_key(env_file, var_name, new_value)

    load_dotenv(env_file)

    current_value = os.getenv(var_name, "False").lower() == "true"
