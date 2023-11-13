'use strict';

let preferredResolution;
let mediaStream, videoSource, bitrate = 100000;
let stopped = false;
let preferredCodec = "VP8";
let mode = "L1T3";
let latencyPref = "realtime", bitPref = "variable";
let encHw = "no-preference", decHw = "no-preference";
let streamWorker;
let inputStream, outputStream;
let metrics = {
  all: [],
};
let e2e = {
  all: [],
};
let display_metrics = {
  all: [],
};

const rate = document.querySelector('#rate');
const framer = document.querySelector('#framer');
const connectButton = document.querySelector('#connect');
const stopButton = document.querySelector('#stop');
const codecButtons = document.querySelector('#codecButtons');
const resButtons = document.querySelector('#resButtons');
const modeButtons = document.querySelector('#modeButtons');
const decHwButtons = document.querySelector('#decHwButtons');
const encHwButtons = document.querySelector('#encHwButtons');
const chart_div = document.getElementById('chart_div');
const chart2_div = document.getElementById('chart2_div');
const chart3_div = document.getElementById('chart3_div');
const chart4_div = document.getElementById('chart4_div');
const videoSelect = document.querySelector('select#videoSource');
const outputVideo = document.getElementById('outputVideo');
const inputVideo = document.getElementById('inputVideo');
const selectors = [videoSelect];
chart_div.style.display = "none";
chart2_div.style.display = "none";
chart3_div.style.display = "none";
chart4_div.style.display = "none";
connectButton.disabled = false;
stopButton.disabled = true;

videoSelect.onchange = function () {
  videoSource = videoSelect.value;
};

const qvgaConstraints = { video: { width: 320, height: 240 } };
const vgaConstraints = { video: { width: 640, height: 480 } };
const hdConstraints = { video: { width: 1280, height: 720 } };
const fullHdConstraints = { video: { width: { min: 1920 }, height: { min: 1080 } } };
const tv4KConstraints = { video: { width: { exact: 3840 }, height: { exact: 2160 } } };
const cinema4KConstraints = { video: { width: { exact: 4096 }, height: { exact: 2160 } } };
const eightKConstraints = { video: { width: { min: 7680 }, height: { min: 4320 } } };
let constraints = qvgaConstraints;

function metrics_update(data) {
  metrics.all.push(data);
}

function metrics_report() {
  metrics.all.sort((a, b) => {
    return (100000 * (a.mediaTime - b.mediaTime) + a.output - b.output);
  });
  const len = metrics.all.length;
  if (len < 2) return;
  for (let i = 1; i < len; i++) {
    if ((metrics.all[i].output == 1) && (metrics.all[i - 1].output == 0)) {
      const frameno = metrics.all[i].presentedFrames;
      const fps = metrics.all[i].fps;
      const time = metrics.all[i].elapsed;
      const g2g = metrics.all[i].expectedDisplayTime - metrics.all[i - 1].captureTime;
      const mediaTime = metrics.all[i].mediaTime;
      const captureTime = metrics.all[i - 1].captureTime;
      const expectedDisplayTime = metrics.all[i].expectedDisplayTime;
      const delay = metrics.all[i].expectedDisplayTime - metrics.all[i - 1].expectedDisplayTime;
      const data = [frameno, g2g];
      const info = { frameno: frameno, fps: fps, time: time, g2g: g2g, mediaTime: mediaTime, captureTime: captureTime, expectedDisplayTime: expectedDisplayTime, delay: delay };
      e2e.all.push(data);
      display_metrics.all.push(info);
    }
  }
  // addToEventLog('Data dump: ' + JSON.stringify(e2e.all));
  return {
    count: metrics.all.length
  };
}

function addToEventLog(text, severity = 'info') {
  let log = document.querySelector('textarea');
  log.value += 'log-' + severity + ': ' + text + '\n';
  if (severity == 'fatal') stop();
}

function gotDevices(deviceInfos) {
  // Handles being called several times to update labels. Preserve values.
  const values = selectors.map(select => select.value);
  selectors.forEach(select => {
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
  });
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    const option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'videoinput') {
      option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);
    }
  }
  selectors.forEach((select, selectorIndex) => {
    if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
      select.value = values[selectorIndex];
    }
  });
}

async function getResValue(radio) {
  preferredResolution = radio.value;
  addToEventLog('Resolution selected: ' + preferredResolution);
  switch (preferredResolution) {
    case "qvga":
      constraints = qvgaConstraints;
      break;
    case "vga":
      constraints = vgaConstraints;
      break;
    case "hd":
      constraints = hdConstraints;
      break;
    case "full-hd":
      constraints = fullHdConstraints;
      break;
    case "tv4K":
      constraints = tv4KConstraints;
      break;
    case "cinema4K":
      constraints = cinema4KConstraints;
      break;
    case "eightK":
      constraints = eightKConstraints;
      break;
    default:
      constraints = qvgaConstraints;
      break;
  }
  // Get a MediaStream from the webcam, and reset the resolution.
  try {
    //stop the tracks
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => {
        track.stop();
      });
    }
    gotDevices(await navigator.mediaDevices.enumerateDevices());
    constraints.deviceId = (videoSource ? { exact: videoSource } : undefined);
    //addToEventLog('videoSource: ' + JSON.stringify(videoSource) + ' DeviceId: ' + constraints.deviceId);
  } catch (e) {
    addToEventLog(`EnumerateDevices error: ${e.message}`, 'fatal');
  }
  try {
    console.log("[constraints]", constraints)
    mediaStream = await navigator.mediaDevices.getDisplayMedia(constraints);
    document.getElementById('inputVideo').srcObject = mediaStream;
  } catch (e) {
    addToEventLog(`getUserMedia error: ${e.message}`, 'fatal');
  }
}

function getPrefValue(radio) {
  latencyPref = radio.value;
  addToEventLog('Latency preference selected: ' + latencyPref);
}

function getBitPrefValue(radio) {
  bitPref = radio.value;
  addToEventLog('Bitrate mode selected: ' + bitPref);
}

function getCodecValue(radio) {
  preferredCodec = radio.value;
  addToEventLog('Codec selected: ' + preferredCodec);
}

function getModeValue(radio) {
  mode = radio.value;
  addToEventLog('Mode selected: ' + mode);
}

function getDecHwValue(radio) {
  decHw = radio.value;
  addToEventLog('Decoder Hardware Acceleration preference: ' + decHw);
}

function getEncHwValue(radio) {
  encHw = radio.value;
  addToEventLog('Encoder Hardware Acceleration preference: ' + encHw);
}

function stop() {
  stopped = true;
  stopButton.disabled = true;
  connectButton.disabled = false;
  chart_div.style.display = "initial";
  chart2_div.style.display = "initial";
  chart3_div.style.display = "initial";
  chart4_div.style.display = "initial";
  streamWorker.postMessage({ type: "stop" });
  try {
    inputStream.cancel();
    addToEventLog('inputStream cancelled');
  } catch (e) {
    addToEventLog(`Could not cancel inputStream: ${e.message}`);
  }
  try {
    outputStream.abort();
    addToEventLog('outputStream aborted');
  } catch (e) {
    addToEventLog(`Could not abort outputStream: ${e.message}`);
  }
}

document.addEventListener('DOMContentLoaded', async function (event) {
  console.log('DOMContentLoaded');
  if (stopped) return;
  addToEventLog('DOM Content Loaded');

  if (typeof WebTransport === 'undefined') {
    addToEventLog('Your browser does not support the WebTransport API.', 'fatal');
    return;
  }

  // Need to support standard mediacapture-transform implementations

  if (typeof MediaStreamTrackProcessor === 'undefined' ||
    typeof MediaStreamTrackGenerator === 'undefined') {
    addToEventLog('Your browser does not support the MSTP and MSTG APIs.', 'fatal');
    return;
  }

  try {
    gotDevices(await navigator.mediaDevices.enumerateDevices());
  } catch (e) {
    addToEventLog('Error in Device enumeration', 'fatal');
  }
  constraints.deviceId = videoSource ? { exact: videoSource } : undefined;
  addToEventLog('videoSource: ' + JSON.stringify(videoSource) + ' DeviceId: ' + constraints.deviceId);
  // Get a MediaStream from the webcam.
  //mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
  mediaStream = await navigator.mediaDevices.getDisplayMedia(constraints);
  // Connect the webcam stream to the video element.
  document.getElementById('inputVideo').srcObject = mediaStream;
  // Create a new worker.
  streamWorker = new Worker("/static/js/stream_worker.js");
  addToEventLog('Worker created.');
  // Print messages from the worker in the text area

  stopButton.onclick = () => {
    addToEventLog('Stop button clicked.');
    stop();
  }

  connectButton.onclick = () => {
    connectButton.disabled = true;
    stopButton.disabled = false;
    decHwButtons.style.display = "none";
    encHwButtons.style.display = "none";
    prefButtons.style.display = "none";
    bitButtons.style.display = "none";
    codecButtons.style.display = "none";
    resButtons.style.display = "none";
    modeButtons.style.display = "none";
    rateInput.style.display = "none";
    frameInput.style.display = "none";
    keyInput.style.display = "none";
    startMedia();
  }

  async function startMedia() {
    // if (stopped) return;
    addToEventLog('startMedia called');
    // Collect the bitrate
    const rate = document.getElementById('rate').value;

    // Collect the framerate
    const framer = document.getElementById('framer').value;

    // Collect the keyframe gap
    const keygap = document.getElementById('keygap').value;

    // Create a MediaStreamTrackProcessor, which exposes frames from the track
    // as a ReadableStream of VideoFrames.
    let [track] = mediaStream.getVideoTracks();
    let ts = track.getSettings();
    // Uses non-standard Chrome-only API
    const processor = new MediaStreamTrackProcessor(track);
    inputStream = processor.readable;

    // Create a MediaStreamTrackGenerator, which exposes a track from a
    // WritableStream of VideoFrames, using non-standard Chrome API
    const generator = new MediaStreamTrackGenerator({ kind: 'video' });
    outputStream = generator.writable;
    outputVideo.srcObject = new MediaStream([generator]);

    // Initialize variables
    let paint_count = 0;
    let start_time = 0.0;

    const recordOutputFrames = (now, metadata) => {
      metadata.output = 1.;
      metadata.time = now;
      if (start_time == 0.0) start_time = now;
      let elapsed = (now - start_time) / 1000.;
      let fps = (++paint_count / elapsed).toFixed(3);
      metadata.fps = fps;
      metadata.elapsed = elapsed;
      metrics_update(metadata);
      outputVideo.requestVideoFrameCallback(recordOutputFrames);
    };

    outputVideo.requestVideoFrameCallback(recordOutputFrames);

    const recordInputFrames = (now, metadata) => {
      metadata.output = 0;
      metadata.time = now;
      if (start_time == 0.0) start_time = now;
      let elapsed = (now - start_time) / 1000.;
      let fps = (++paint_count / elapsed).toFixed(3);
      metadata.fps = fps;
      metadata.elapsed = elapsed;
      metrics_update(metadata);
      inputVideo.requestVideoFrameCallback(recordInputFrames);
    };

    inputVideo.requestVideoFrameCallback(recordInputFrames);

    //Create video Encoder configuration
    const vConfig = {
      keyInterval: keygap,
      resolutionScale: 1,
      framerateScale: 1.0,
    };

    let ssrcArr = new Uint32Array(1);
    window.crypto.getRandomValues(ssrcArr);
    const ssrc = ssrcArr[0];
    const framerat = Math.min(framer, ts.frameRate / vConfig.framerateScale);

    let config = {
      alpha: "discard",
      latencyMode: latencyPref,
      bitrateMode: bitPref,
      codec: preferredCodec,
      width: ts.width / vConfig.resolutionScale,
      height: ts.height / vConfig.resolutionScale,
      hardwareAcceleration: encHw,
      decHwAcceleration: decHw,
      bitrate: rate,
      framerate: framerat,
      keyInterval: vConfig.keyInterval,
      ssrc: ssrc
    };

    if (mode != "L1T1") {
      config.scalabilityMode = mode;
    }

    switch (preferredCodec) {
      case "H264":
        config.codec = "avc1.42002A";  // baseline profile, level 4.2
        config.avc = { format: "annexb" };
        config.pt = 1;
        break;
      case "H265":
        config.codec = "hev1.1.6.L120.B0";  // Main profile, level 4, up to 2048 x 1080@30
        // config.codec = "hev1.1.4.L93.B0"  Main 10
        // config.codec = "hev1.2.4.L120.B0" Main 10, Level 4.0
        // config.codec = "hev1.1.6.L93.B0"; // Main profile, level 3.1, up to 1280 x 720@33.7
        config.hevc = { format: "annexb" };
        config.pt = 2;
        break;
      case "VP8":
        config.codec = "vp8";
        config.pt = 3;
        break;
      case "VP9":
        config.codec = "vp09.00.10.08"; //VP9, Profile 0, level 1, bit depth 8
        config.pt = 4;
        break;
      case "AV1":
        config.codec = "av01.0.08M.10.0.110.09" // AV1 Main Profile, level 4.0, Main tier, 10-bit content, non-monochrome, with 4:2:0 chroma subsampling
        config.pt = 5;
        break;
    }

    // Collect the WebTransport URL
    const url = document.getElementById('url').value;

    // Transfer the readable stream to the worker, as well as other info from the user interface.
    // NOTE: transferring frameStream and reading it in the worker is more
    // efficient than reading frameStream here and transferring VideoFrames individually.
    console.log("streamWorker", streamWorker);
    //config = { "alpha": "discard", "latencyMode": "realtime", "bitrateMode": "variable", "codec": "vp8", "width": 1280, "height": 720, "hardwareAcceleration": "no-preference", "decHwAcceleration": "no-preference", "bitrate": "100000", "framerate": 30, "keyInterval": "3000", "ssrc": 42387539, "scalabilityMode": "L1T3", "pt": 3 }
    try {
      streamWorker.postMessage({ type: "stream", config: config, url: url, streams: { input: inputStream, output: outputStream } }, [inputStream, outputStream]);
    } catch (e) {
      addToEventLog(e.name + ": " + e.message, 'fatal');
    }
  }

  registerSocket();
}, false);


//-----------------new code------------------
window.addEventListener('beforeunload', function (event) {
  // Your code here
  // This code will be executed when the user is closing the webpage
  // You can perform any necessary actions or show a confirmation message
  // However, note that modern browsers may restrict what you can do in this event handler for security reasons
  // For example, you may not be able to show a custom message in some browsers
  console.log("beforeunload")
});

let socket;

function registerSocket(){
  // Your code here
  // This code will be executed when the webpage finishes loading
  console.log("registerSocket");
  socket = io();

  // Event handler for new connections.
  // The callback function is invoked when a connection with the
  // server is established.
  socket.on('connect', function () {
    socket.emit('my_event', { data: 'I\'m connected!' });
  });

  console.log('Connected to:', socket.io.uri);

  //message
  socket.on('message', function (data) {
    console.log('Received message:', data);
    if (data === "start_stream") {
      console.log("streaming1");
      connectButton.click();
    }
  });
}