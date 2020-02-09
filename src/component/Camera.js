import React, {useCallback, useEffect, useRef} from "react";
import randomString from "../util/randomString";
import 'image-capture';
import './Camera.css';
import Overlay from "./Overlay";

export default function Camera(props) {

  /** @type {{current: HTMLElement}} */ const videoElem = useRef(null);
  /** @type {{current: HTMLDivElement}} */ const cameraContainerElem = useRef(null);
  /** @type {{current: *}} */ const imageCapture = useRef(null);

  const snap = useCallback(async e => {
    e.preventDefault();
    props.onSnap([randomString(), (await imageCapture.current.takePhoto())]);
  }, [props]);

  useEffect(() => {
    let videoTrack;
    (async () => {
      const currVideoElem = videoElem.current;
      if (!currVideoElem) return;

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Camera is not supported on your device.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({video: true});
      (cameraContainerElem.current
        && cameraContainerElem.current.classList.add('onVideo'));
      currVideoElem.srcObject = stream;
      await currVideoElem.play();
      videoTrack = stream.getVideoTracks()[0];
      imageCapture.current = new ImageCapture(videoTrack);
    })();
    return () => videoTrack && videoTrack.stop();
  }, []);

  useEffect(() => {
    const snap = document.getElementById('snap');
    snap && snap.focus && snap.focus();
  }, []);

  useEffect(() => {
    const keyDownListener = e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        snap(e);
      }
    };
    document.addEventListener('keydown', keyDownListener);
    return () => document.removeEventListener('keydown', keyDownListener)
  }, [props, snap]);

  return (
    <Overlay onClose={props.onClose}>
      <div id="cameraContainer"
           ref={cameraContainerElem}
           tabIndex="10">
        <div className="videoWrapper">
          <video id="video" ref={videoElem}/>
          <button id="snap" type="button" onClick={snap}/>
        </div>
      </div>
    </Overlay>
  );
};
