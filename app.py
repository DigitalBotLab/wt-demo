from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret_key'
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/stream')
def stream():
    return render_template('stream.html')

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

if __name__ == '__main__':
    socketio.run(app, host='localhost', debug=True) # port=8080