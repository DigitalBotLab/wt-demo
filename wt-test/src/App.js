import logo from './logo.svg';
import './App.css';
import {useEffect, useRef} from 'react';


function App() {
  //const { BrowserWindow, desktopCapturer } = require('electron');
  const videoRef = useRef(null);

  // navigator.mediaDevices.getDisplayMedia({
  //   audio: false,
  //   video: {
  //     mediaSource: 'screen',
  //     height: 1080,
  //     width: 1920,
  //   }
  // }).then((stream) => {
  //   videoRef.current.srcObject = stream;
  //   videoRef.current.play();
  // }).catch((err) => {
  //   console.error("get user media error", err);
  // });

  const getStream = async (screenId) => {
    try{
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: screenId,
          }
        }
      });
      
      handleStream(stream);

    } catch (e) {
      console.log("Error", e);
    }
  };

  const handleStream = (stream) => {
    // let {width, height} = stream.getTracks()[0].getSettings();
    // window.electronAPI.setSize(width, height);
    videoRef.current.srcObject = stream;
    videoRef.current.onloadedmetadata = (e) => videoRef.current.play();
  };

  // window.electronAPI.getScreenId((event, screenId) => {
  //   console.log("Rendering... [screenId]", screenId);
  // getStream(''screenId'');
  // });

  return (
    <div className="App">
      <header className="App-header">
        <video ref={videoRef} id="my-video" style={{width:960, height:540, backgroundColor:'white'}} autoPlay muted></video>
      </header>
    </div>
  );
}

export default App;
