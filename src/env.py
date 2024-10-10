import os
from dotenv import load_dotenv, set_key

def manage_env_variable(var_name, new_value, env_file='.env'):
    """
    Checks if a .env file exists. 
    If not, it creates one and sets the environment variable.
    
    :param var_name: Name of the environment variable
    :param new_value: Value to set the environment variable to
    :param env_file: Path to the .env file
    """
    if not os.path.exists(env_file):
        with open(env_file, 'w') as f:
            f.write(f'{var_name}=False\n')

    set_key(env_file, var_name, new_value)

    load_dotenv(env_file)

    current_value = os.getenv(var_name, "False").lower() == "true"
