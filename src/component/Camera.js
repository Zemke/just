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
      setTimeout(() =>
          requestAnimationFrame(() =>
            cameraContainerElem.current.classList.add('onVideo')),
        500);
      currVideoElem.srcObject = stream;
      await currVideoElem.play();
      videoTrack = stream.getVideoTracks()[0];
      imageCapture.current = new ImageCapture(videoTrack);
    })();
    return () => videoTrack && videoTrack.stop();
  }, [props]);

  useEffect(() => {
    const snap = document.getElementById('snap');
    snap && snap.focus && snap.focus();
  }, []);

  useEffect(() => {
    const keyDownListener = e => {
      e.preventDefault(); // stops chat input field auto focus (thereby re-renders)
      e.key === 'Escape' && props.onClose();
      e.key === 'Enter' && snap(e);
    };
    document.addEventListener('keydown', keyDownListener);
    return () => document.removeEventListener('keydown', keyDownListener)
  }, [props, snap]);

  useEffect(() => {
    const outsideClickListener = e => e.target.id === 'overlay' && props.onClose();
    document
      .getElementById('overlay')
      .addEventListener('click', outsideClickListener);
    return () => document
      .getElementById('overlay')
      .removeEventListener('click', outsideClickListener)
  });

  return (
    <Overlay>
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