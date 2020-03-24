import React, {useEffect, useRef, useState} from "react";
import './Camera.css';
import './VideoChat.css';
import Overlay from "./Overlay";
import Peering from '../util/peering';
import getUserMedia from '../util/getUserMedia';
import toName from '../util/toName';
import DataStore from '../util/dataStore';

export default function VideoChat(props) {

  /** @type {{current: HTMLVideoElement}} */ const videoElem = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [names] = useState(DataStore.getCachedNames);
  const [requestCallFailure, setRequestCallFailure] = useState(null);
  const [hangingUp, setHangingUp] = useState(false);

  const displayStream = stream => {
    videoElem.current.srcObject = stream;
    videoElem.current.play().then(() => setPlaying(true));
  };

  useEffect(() => {
    if (!props.stream) return;
    displayStream(props.stream);
  }, [props.stream]);

  useEffect(() => {
    if (props.stream || !props.otherUser) return;
    (async () => {
      const ownStream = await getUserMedia();
      try {
        displayStream(await Peering.requestCall(props.otherUser, ownStream));
      } catch (e) {
        setRequestCallFailure(e);
        setTimeout(() => props.onClose(), 1000);
      }
    })();
  }, [props]);

  const hangUp = () => {
    setHangingUp(true);
    setTimeout(() => props.onClose(), 1000);
  };

  const toggleCamera = () =>
    videoElem.current.srcObject
      .getVideoTracks()
      .forEach(track => track.enabled = !track.enabled);

  const toggleMute = () =>
    videoElem.current.srcObject
      .getAudioTracks()
      .forEach(track => track.enabled = !track.enabled);

  return (
    <Overlay onClose={props.onClose}>
      {!playing && (
        <div className="translucent translucent-center text-center">
          {requestCallFailure ? (
            <>
              <span className="text-large">{toName(props.otherUser, names)}</span><br/>
              {requestCallFailure === 'timeout' && 'didn’t pick up'}
              {requestCallFailure === 'rejected' && 'rejected the call'}
              <div className="margin-top">
                <span role="img" aria-label="call failure">
                  🚫
                </span>
              </div>
            </>
          ) : (
            <>
              Calling<br/>
              <span className="text-large">{toName(props.otherUser, names)}</span><br/>
              <div className="margin-top">
                <span className="blink" role="img" aria-label="calling">
                  📞
                </span>
              </div>
              <div className="margin-top">
                <div>
                  <button className="form-control" onClick={props.onClose}>
                    Cancel
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      <div id="cameraContainer"
           className={playing ? 'onVideo' : ''}
           tabIndex="10">
        <div className="videoWrapper">
          <video id="video" ref={videoElem}/>
          {playing && (
            <>
              <div className="margin-top text-center">
                <button className="form-control circle" aria-label="Mute" onClick={toggleMute}>
                  <div className="cross-disabled"/>
                  <span role="img" aria-label="Microphone">🎙</span>
                </button>
                <button className="form-control circle" aria-label="Mute" onClick={toggleCamera}>
                  <div className="cross-disabled"/>
                  <span role="img" aria-label="Camera">📽</span>
                </button>
              </div>
              <div className="margin-top">
                <button className="form-control" onClick={hangUp} disabled={hangingUp}>
                  {hangingUp ? 'Hanging up' : 'Hang up!'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Overlay>
  );
};
