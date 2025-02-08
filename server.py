import os
import eel
import time
import subprocess
import requests

def start_express_server():
    """Starts the Express server in the background."""
    try:
        subprocess.Popen(["node", "app.js"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print("Starting Express server...")
        time.sleep(5) 

    except Exception as e:
        print(f"Error starting Express server: {e}")

def check_express_server():
    """Checks if the Express server is running before proceeding."""
    try:
        response = requests.get("http://localhost:8000")  
        return response.status_code == 200
    except:
        return False

def start():
    """Starts the application with Eel and Express."""
    eel.init("views") 

    start_express_server()

    while not check_express_server():
        print("Waiting for Express server to start...")
        time.sleep(2)

    print("Express server is running. Opening browser...")
    
    os.system('start "" "msedge.exe" --app="http://localhost:8000"')

    eel.start("index.ejs", mode=None, host='localhost', block=True)

if __name__ == "__main__":
    start()
