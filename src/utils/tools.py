import os
import signal
import time
import settings
from threading import Thread
from datetime import datetime, timedelta
from src.utils.messyFunctions import load_config

start_date = datetime.now().date()

def daily_restart():
    global start_date

    def restart_thread():
        while True:
            daily_restart_time = load_config(settings.SYSTEM_SETTINGS_PATH)["daily_cleanup_time"]
            
            restart_hour, restart_minute = map(int, daily_restart_time.split(':'))

            now = datetime.now()
            restart_datetime = now.replace(hour=restart_hour, minute=restart_minute, second=0, microsecond=0)

            if now >= restart_datetime:
                restart_datetime += timedelta(days=1)

            if now.date() > start_date and now >= restart_datetime:
                print("Täglicher Neustart wird durchgeführt...")
                os.kill(os.getpid(), signal.SIGTERM)

            time.sleep(5)

    restart_thread_instance = Thread(target=restart_thread, daemon=True)
    restart_thread_instance.start()
    
    return True, "Neustartdienst ist aktiviert."
