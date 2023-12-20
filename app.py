from flask import Flask, render_template, make_response
from flask_socketio import SocketIO, emit
from flask_cors import CORS

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret_key'
cors = CORS(app, origins='*')
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/stream')
def stream():
    response = make_response(render_template('stream.html'))
    response.headers["Permissions-Policy"] = "display-capture=self http://localhost:5173"
    return response

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@app.route('/send_message')
def send_message():
    message = 'Hello, client!'
    socketio.emit('message', message)
    return 'Message sent'

@app.route('/send_stream')
def start_stream():
    message = 'send_stream'
    socketio.emit('message', message)
    return 'Message sent'

@app.route('/stop_send_stream')
def stop_send_stream():
    message = 'stop_send_stream'
    socketio.emit('message', message)
    return 'Message sent'

@app.route('/receive_stream')
def receive_stream():
    message = 'receive_stream'
    socketio.emit('message', message)
    return 'Message sent'

@app.route('/stop_receive_stream')
def stop_receive_stream():
    message = 'stop_receive_stream'
    socketio.emit('message', message)
    return 'Message sent'

@app.route('/run_electron_app')
def run_electron_app():
    import os
    folder_path = "C:\\Users\\ov-user\\Desktop\\CGDesktop"
    # os.chdir("D:\\Temp\\CGDesktop")
    command = "npm start"

    os.chdir(folder_path)
    os.system(command)

    # import subprocess

    # # Run the command line command
    # result = subprocess.run(command, cwd=folder_path, capture_output=True, text=True)

    # # Get the output and error message
    # output = result.stdout
    # error = result.stderr

    # # Print the output and error message
    # print("Output:", output)
    # print("Error:", error)

    return "electron app started"

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', debug=True, 
        ssl_context=('./server/v1/dbl_wild.crt', './server/v1/dbl_wild.key')) # port=8080