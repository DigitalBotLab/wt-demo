const { ipcRenderer, contextBridge } = require('electron');

let stopped = false;
let screenId;
let mediaStream;
let streamWorker;
let inputStream, outputStream;
let stopButton, connectButton;



ipcRenderer.on('SET_SOURCE_ID', async (event, sourceId) => {
    console.log("[SET_SOURCE_ID]", sourceId);
    screenId = sourceId;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: sourceId,
                    minWidth: 1280,
                    maxWidth: 1280,
                    minHeight: 720,
                    maxHeight: 720
                }
            }
        })
        handleStream(stream)
    } catch (e) {
        handleError(e)
    }
});

ipcRenderer.on('SET_BUTTONS', (event) => {
    console.log("SET_BUTTONS");

    connectButton = document.querySelector('#connect');
    stopButton = document.querySelector('#stop');

    console.log("connectButton", connectButton);

    stopButton.onclick = () => {
        console.log('Stop button clicked.');
        stop();
    }

    connectButton.onclick = () => {
        console.log('connectButton button clicked.');
        connectButton.disabled = true;
        stopButton.disabled = false;
        startMedia();
    }
});

function handleStream(stream) {
    console.log("handleStream", stream);
    const video = document.querySelector('#input-video')
    video.srcObject = stream
    video.onloadedmetadata = (e) => video.play()

    mediaStream = stream;

    let [track] = mediaStream.getVideoTracks();
    console.log("track", track);

    const processor = new MediaStreamTrackProcessor(track);
    inputStream = processor.readable;

    const generator = new MediaStreamTrackGenerator({ kind: 'video' });
    outputStream = generator.writable;

    const outputVideo = document.querySelector('#output-video');
    outputVideo.srcObject = new MediaStream([generator]);

    const url = document.getElementById('url').value;
}

function handleError(e) {
    console.log(e)
}

contextBridge.exposeInMainWorld('electronAPI', {
    setSize: (size) => ipcRenderer.send('set-size', size),
    getScreenId: (callback) => ipcRenderer.on('SET_SOURCE_ID', callback)
});



function stop() {
    stopped = true;
    // stopButton.disabled = true;
    // connectButton.disabled = true;
    // streamWorker.postMessage({ type: "stop" });
    // try {
    //     inputStream.cancel();
    //     console.log('inputStream cancelled');
    // } catch (e) {
    //     console.log(`Could not cancel inputStream: ${e.message}`);
    // }
    // try {
    //     outputStream.abort();
    //     console.log('outputStream aborted');
    // } catch (e) {
    //     console.log(`Could not abort outputStream: ${e.message}`);
    // }
}

async function startMedia() {
    if (stopped) return;
    console.log('startMedia called');

    const url = "https://wt.digitalbotlab.com:6162/stream";
    const config = { "alpha": "discard", "latencyMode": "realtime", "bitrateMode": "variable", "codec": "vp8", "width": 1280, "height": 720, "hardwareAcceleration": "no-preference", "decHwAcceleration": "no-preference", "bitrate": "100000", "framerate": 30, "keyInterval": "3000", "ssrc": 42387539, "scalabilityMode": "L1T3", "pt": 3 }

    console.log("streamWorker", streamWorker);

    try {
        streamWorker.postMessage({ type: "stream", config: config, url: url, streams: { input: inputStream, output: outputStream } }, [inputStream, outputStream]);
    } catch (e) {
        console.log(e.name + ": " + e.message, 'fatal');
    }
}

//main 
window.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded");
    streamWorker = new Worker('stream_worker.js');
});