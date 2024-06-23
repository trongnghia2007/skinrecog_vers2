# Todo: to host 2 websites at once
import PySimpleGUI as sg
import os
import main
import cosoyte
import threading


def startServer():
    # Define the layout of your window
    layout = [
        [sg.Button('Run', key="-run-"), sg.Button('Exit')],
        [sg.Text("Server Log:")],
        [sg.Multiline(size=(120, 20), key="-output-", background_color="#000", text_color="#ffb6c1",
                      reroute_stdout=True, reroute_stderr=True, reroute_cprint=True, auto_size_text=True, autoscroll=True)],
    ]

    # Create the window
    window = sg.Window('Server', layout, finalize=True,
                       enable_close_attempted_event=False)

    # Event loop to process events and display output
    while True:
        event, values = window.read()
        if event in (sg.WINDOW_CLOSED, 'Exit'):
            window.close()
            os._exit(1)
        elif event == '-run-':
            # start server
            def runApp1():
                main.app.run("0.0.0.0", debug=False, port=5000)

            def runApp2():
                cosoyte.app.run("0.0.0.0", debug=False, port=80)

            server1 = threading.Thread(target=runApp1)
            server1.start()
            server2 = threading.Thread(target=runApp2)
            server2.start()

            # gray out the run button
            window["-run-"].update(disabled=True)


if (__name__ == "__main__"):
    startServer()

"""
import subprocess 
import threading 
import time
def run_main(): 
    subprocess.run(["python", "main.py"]) 
    
def run_cosoyte(): subprocess.run(["python", "cosoyte.py"]) 

def main(): 
    # Start main.py in a separate thread 
    main_thread = threading.Thread(target=run_main) 
    main_thread.start() 
    
    # Start cosoyte.py in the main thread 
    run_cosoyte() 
    
    # Wait for main.py thread to finish 
    main_thread.join() 
    
if __name__ == "__main__": main()
"""
