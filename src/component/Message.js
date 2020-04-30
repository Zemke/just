import React, {Fragment, useCallback, useEffect, useRef, useState} from "react";
import ImageMessage from "./ImageMessage";
import Tapback from "./Tapback";
import DataStore from '../util/dataStore';
import './Message.css';
import DisplayTapback from "./DisplayTapback";
import GiphyMessage from "./GiphyMessage";
import TextMessage from "./TextMessage";
import OpenStreetMapEmbed from "./OpenStreetMapEmbed";

export default function Message(props) {

  /** @type {{current: HTMLDivElement}} */ const boxElem = useRef(null);
  /** @type {{current: boolean}} */ const openImageDetails = useRef(false);

  const [tapback, setTapback] = useState(null);

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
          ) : props.message.location ? (
            <OpenStreetMapEmbed geo={props.message.location}/>
          ) : (
            <>
              <div className="overlay"/>
              {!!props.message.body ? (<TextMessage body={props.message.body}/>) : <h1>{props.message.id}</h1>}
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
