import React, {useEffect, useRef, useState} from 'react';
import Share from "./Share";
import ContentEditable from "./ContentEditable";
import DataStore from "../util/dataStore";
import Storage from "../util/storage.js";
import './Foot.css';
import randomString from "../util/randomString";
import VideoChat from "./VideoChat";
import * as firebase from "firebase";
import {alert} from "../util/browser";

export default function Foot(props) {

  /** @type {{current: ElementContentEditable}} */ const inputField = useRef(null);
  /** @type {{current: HTMLFormElement}} */ const formEl = useRef(null);

  const [field, setField] = useState(['']);
  const [files, setFiles] = useState([]);
  const [inputFieldHeight, setInputFieldHeight] = useState(null);
  const [videoChat, setVideoChat] = useState(false);

  useEffect(() => {
    const documentKeydownHandler = e => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      return inputField.current.focus();
    };
    document.addEventListener('keydown', documentKeydownHandler);
    return () => document.removeEventListener('keydown', documentKeydownHandler);
  });

  const onSubmit = e => {
    e.preventDefault();

    const uploads = [];
    const now = Date.now();
    field.forEach((input, idx) => {
      const when = DataStore.timestampFromMillis(now + idx);
      if (typeof input === 'string') {
        input.trim() && DataStore.sendMessage({
          from: props.currentUser.uid,
          to: props.otherUser,
          body: input.trim(),
          when
        });
      } else {
        Storage.upload(input[1], input[0], props.otherUser, when.toMillis());
        uploads.push({when: when.toMillis(), file: input, otherUser: props.otherUser});
      }
    });

    props.uploads(uploads);

    setField(['']);
    setFiles([]);

    inputField.current.focus();
    formEl.current.reset();
  };

  const onGiphyClick = id =>
    DataStore.sendMessage({
      from: props.currentUser.uid,
      to: props.otherUser,
      body: null,
      giphy: id,
    });

  const onShareLocation = () => {
    navigator.geolocation.getCurrentPosition(position => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      DataStore.sendMessage({
        from: props.currentUser.uid,
        to: props.otherUser,
        body: null,
        location: new firebase.firestore.GeoPoint(latitude, longitude)
      });
    }, async () => {
      await alert('Could not get your current location for sending.');
    }, {enableHighAccuracy: true});
  };

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const onShareTargetListener = e => {
      if (!('shareTarget' in e.data)) return;
      const formData = e.data.shareTarget;
      const image = formData.find(x => x[0] === 'images');
      if (image) {
        setFiles(curr => [...curr, [randomString(), image[1]]]);
      } else {
        const message = [];

        const name = formData.find(x => x[0] === 'name');
        name && message.push(name[1], ' — ');

        const description = formData.find(x => x[0] === 'description');
        description && message.push(description[1], ' — ');

        const link = formData.find(x => x[0] === 'link');
        link && message.push(link[1], ' — ');

        message.splice(-1);
        setField([message.join('').trim()]);
      }
    };
    navigator.serviceWorker.addEventListener('message', onShareTargetListener);
    return () =>
      navigator.serviceWorker.removeEventListener('message', onShareTargetListener)
  }, []);

  useEffect(() => {
    const dropListener = e => {
      e.preventDefault();
      const files =
        (e.dataTransfer.items
          ? Array.from(e.dataTransfer.items).map(item => item.getAsFile())
          : Array.from(e.dataTransfer.files))
          .filter(Boolean)
          .filter(f => f.type.startsWith('image/'))
          .map(f => [randomString(), f]);
      !!files.length && setFiles(files);
    };
    window.addEventListener("drop", dropListener, false);
    const dragOverListener = e => e.preventDefault();
    window.addEventListener("dragover", dragOverListener, false);
    return () => {
      window.removeEventListener("dragover", dragOverListener, false);
      window.removeEventListener("drop", dropListener, false);
    }
  }, []);

  useEffect(() => {
    const currChatEl = props.chatEl.current;
    const currChatBodyEl = props.chatBodyEl.current;
    if (!currChatEl || !currChatBodyEl) return;
    currChatBodyEl.style.marginBottom = inputFieldHeight + 'px';
  }, [inputFieldHeight, props]);

  const onVideoCall = () =>
    setVideoChat(true);

  return (
    <form onSubmit={onSubmit} ref={formEl}>
      {videoChat && <VideoChat otherUser={props.otherUser} onClose={() => setVideoChat(false)}/>}
      <Share onFiles={setFiles}
             inputFieldHeight={inputFieldHeight}
             onShareLocation={onShareLocation}
             onGiphyClick={onGiphyClick}
             onVideoCall={onVideoCall}/>
      <ContentEditable
        onChange={setField}
        onResize={setInputFieldHeight}
        placeholder="Type here"
        value={field}
        ref={inputField}
        files={files}
        required/>
      <button type="submit"
              className="submit"
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onSubmit(e)}>
        &#10003;
      </button>
    </form>
  )
};
