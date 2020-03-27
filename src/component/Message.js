import React, {Fragment, useCallback, useEffect, useRef, useState} from "react";
import ImageMessage from "./ImageMessage";
import Linkify from "react-linkify";
import Tapback from "./Tapback";
import DataStore from '../util/dataStore';
import './Message.css';
import DisplayTapback from "./DisplayTapback";
import GiphyMessage from "./GiphyMessage";

export default function Message(props) {

  /** @type {{current: HTMLDivElement}} */ const boxElem = useRef(null);
  /** @type {{current: boolean}} */ const openImageDetails = useRef(false);

  const [tapback, setTapback] = useState(null);

  const isOnlyEmoji = message =>
    !!message && !message
      .replace(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g, '')
      .replace(/[^\x00-\x7F]/g, "")
      .length;

  const openTapback = (e) =>
    setTimeout(() =>
      setTapback(e.target.closest("*[data-message=true]").dataset.messageId));

  // Tapback click hold
  useEffect(() => {
    const currBoxElem = boxElem.current;
    if (!currBoxElem) return;

    let timeoutId;
    const mouseDownListener =
      e => timeoutId = setTimeout(() => openTapback(e), 700);
    currBoxElem.addEventListener('mousedown', mouseDownListener);

    const mouseUpListener =
      () => clearTimeout(timeoutId);
    currBoxElem.addEventListener('mouseup', mouseUpListener);

    return () => {
      currBoxElem.removeEventListener('mouseup', mouseUpListener);
      currBoxElem.removeEventListener('mousedown', mouseDownListener);
    }
  }, []);

  // Tapback double tap
  useEffect(() => {
    const currBoxElem = boxElem.current;
    if (!currBoxElem) return;

    let tapped = false;
    let timeoutForTap;

    const touchStartListener = e => {
      if (tapped) {
        openTapback(e);
        clearTimeout(timeoutForTap);
        tapped = false;
      } else {
        tapped = true;
        timeoutForTap = setTimeout(() => {
          tapped = false;
          openImageDetails.current = true;
        }, 200);
      }
    };

    currBoxElem.addEventListener('touchstart', touchStartListener);

    return () => {
      currBoxElem.removeEventListener('touchstart', touchStartListener);
      clearTimeout(timeoutForTap);
    };
  }, []);

  const tap = (action, messageId) => {
    if (action) DataStore.sendTapback(action, messageId);
    setTapback(null);
  };

  const pastDoubleTap = useCallback(
    () => new Promise(resolve =>
      setTimeout(() => {
        resolve(openImageDetails.current);
        openImageDetails.current = false;
      }, 201)),
    []);

  const proceedWithDetailView = useCallback(async () =>
    tapback !== props.message.id
    && (!('ontouchstart' in window) || await pastDoubleTap()),
    [tapback, props.message.id, pastDoubleTap]);

  if (props.message.id == null) console.log("there's no message ID");

  return (
    <div className={"message-container" + (props.messageGap ? ' timestamped' : '')}>
      {props.messageGap && (<div className="timestamp">{props.messageGap}</div>)}
      <div className={'message-wrapper ' + (props.otherUser === props.message.from ? "from" : "to")}>
        {props.message.tapback && <DisplayTapback tapback={props.message.tapback} otherUser={props.otherUser}/>}
        {tapback === props.message.id && <Tapback tap={action => tap(action, props.message.id)}/>}
        <div
          ref={boxElem} data-message-id={props.message.id} data-message="true"
          className={"message" + ((props.message.image || props.message.giphy) ? " image" : "")}>
          {props.message.image ? (
            <ImageMessage placeholder={props.message.placeholder}
                          image={props.message.image}
                          proceedWithDetailView={proceedWithDetailView}/>
          ) : props.message.giphy ? (
            <GiphyMessage id={props.message.giphy}/>
          ) : (
            <>
              <div className="overlay"/>
              <p className={isOnlyEmoji(props.message.body.trim()) ? 'onlyEmoji' : ''}>
                <Linkify properties={{target: '_blank'}}>
                  {props.message.body.split('\n')
                    .map((m, idx) => (<Fragment key={idx}>{m}<br/></Fragment>))}
                </Linkify>
              </p>
            </>
          )}
        </div>
      </div>
      {props.lastOwnMessage && (
        <div className="status">
          {props.message.delivered
            ? 'Delivered'
            : (props.message._hasPendingWrites ? 'Sending' : 'Sent')}
        </div>
      )}
    </div>
  );
};
