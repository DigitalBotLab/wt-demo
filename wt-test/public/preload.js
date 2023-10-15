const { ipcRenderer, contextBridge } = require('electron');
let screenId;

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

function handleStream (stream) {
    console.log("handleStream", stream);
    const video = document.querySelector('#my-video')
    video.srcObject = stream
    video.onloadedmetadata = (e) => video.play()
  }
  
function handleError (e) {
console.log(e)
}

contextBridge.exposeInMainWorld('electronAPI', {
    setSize: (size) => ipcRenderer.send('set-size', size),
    getScreenId: (callback) => ipcRenderer.on('SET_SOURCE_ID', callback)
});