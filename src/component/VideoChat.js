import React, {useEffect, useRef} from "react";
import './Camera.css';
import Overlay from "./Overlay";
import Peering from '../util/peering';
import getUserMedia from '../util/getUserMedia';

export default function VideoChat(props) {

  /** @type {{current: HTMLVideoElement}} */ const videoElem = useRef(null);
  /** @type {{current: HTMLDivElement}} */ const cameraContainerElem = useRef(null);

  const displayStream = async stream => {
    (cameraContainerElem.current
      && cameraContainerElem.current.classList.add('onVideo'));
    videoElem.current.srcObject = stream;
    await videoElem.current.play();
    return stream;
  };

  useEffect(() => {
    if (!props.stream) return;
    let videoTrack;
    (async () => videoTrack = (await displayStream(props.stream)).getVideoTracks()[0])();
    return () => videoTrack && videoTrack.stop();
  }, [props.stream]);

  useEffect(() => {
    if (props.stream || !props.otherUser) return;

    let videoTrack;
    (async () => {
      const ownStream = await getUserMedia();
      const otherStream = await Peering.requestCall(props.otherUser, ownStream);
      videoTrack = (await displayStream(otherStream)).getVideoTracks()[0];
    })();
    return () => videoTrack && videoTrack.stop();
  }, [props.stream, props.otherUser]);

  // todo mic and cam toggle buttons
  // hang up button

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
