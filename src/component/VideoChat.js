import React, {useEffect, useRef} from "react";
import './Camera.css';
import Overlay from "./Overlay";
import Peering from '../util/peering';

export default function VideoChat(props) {

  /** @type {{current: HTMLElement}} */ const videoElem = useRef(null);
  /** @type {{current: HTMLDivElement}} */ const cameraContainerElem = useRef(null);

  const displayStream = async stream => {
    (cameraContainerElem.current
      && cameraContainerElem.current.classList.add('onVideo'));
    videoElem.current.srcObject = stream;
    await videoElem.current.play();
    return stream.getVideoTracks()[0];
  };

  useEffect(() => {
    if (!props.stream) return;
    let videoTrack;
    displayStream(props.stream).then(vt => videoTrack = vt);
    return () => videoTrack && videoTrack.stop();
  }, [props.stream]);

  useEffect(() => {
    if (props.stream || !props.otherUser) return;

    let videoTrack;
    (async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Video chat is not supported on your device.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({video: true});
      videoTrack = await displayStream(stream);

      await Peering.requestCall(props.otherUser, stream);
    })();
    return () => videoTrack && videoTrack.stop();
  }, [props.stream, props.otherUser]);

  return (
    <Overlay onClose={props.onClose}>
      <div id="cameraContainer"
           ref={cameraContainerElem}
           tabIndex="10">
        <div className="videoWrapper">
          <video id="video" ref={videoElem}/>
        </div>
      </div>
    </Overlay>
  );
};
