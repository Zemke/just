import React, {useCallback, useEffect, useRef} from "react";
import randomString from "../util/randomString";
import 'image-capture';
import './Camera.css';
import Overlay from "./Overlay";
import getUserMedia from '../util/getUserMedia';

export default function Camera(props) {

  /** @type {{current: HTMLElement}} */ const videoElem = useRef(null);
  /** @type {{current: HTMLDivElement}} */ const cameraContainerElem = useRef(null);
  /** @type {{current: *}} */ const imageCapture = useRef(null);

  const snap = useCallback(async e => {
    e.preventDefault();
    props.onSnap([randomString(), (await imageCapture.current.takePhoto())]);
  }, [props]);

  useEffect(() => {
    let videoTracks;
    (async () => {
      const currVideoElem = videoElem.current;
      if (!currVideoElem) return;

      const stream = await getUserMedia({video: true});
      (cameraContainerElem.current
        && cameraContainerElem.current.classList.add('onVideo'));
      currVideoElem.srcObject = stream;
      await currVideoElem.play();
      videoTracks = stream.getVideoTracks();
      imageCapture.current = new ImageCapture(videoTracks[0]);
    })();
    return () => videoTracks && videoTracks.forEach(vt => vt.stop());
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
