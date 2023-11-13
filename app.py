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

@app.route('/start_stream')
def start_stream():
    message = 'start_stream'
    socketio.emit('message', message)
    return 'Message sent'

@app.route('/receive_stream')
def receive_stream():
    message = 'receive_stream'
    socketio.emit('message', message)
    return 'Message sent'

if __name__ == '__main__':
    socketio.run(app, host='localhost', debug=True) # port=8080