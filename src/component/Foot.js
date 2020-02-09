import React, {useEffect, useRef, useState} from 'react';
import Share from "./Share";
import ContentEditable from "./ContentEditable";
import DataStore from "../util/dataStore";
import Storage from "../util/storage.js";
import './Foot.css';
import randomString from "../util/randomString";

export default function Foot(props) {

  /** @type {{current: ElementContentEditable}} */ const inputField = useRef(null);
  /** @type {{current: HTMLFormElement}} */ const formEl = useRef(null);

  const [field, setField] = useState(['']);
  const [files, setFiles] = useState([]);
  const [inputFieldHeight, setInputFieldHeight] = useState(null);

  useEffect(() => {
    const documentKeydownHandler = e => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      return inputField.current.focus();
    };
    document.addEventListener('keydown', documentKeydownHandler);
    return () => document.removeEventListener('keydown', documentKeydownHandler);
  });

  useEffect(() => {
    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(() => {
        props.chatEl.current.classList.remove('scrollSmooth');
        props.scrollToBottom();
      });
      resizeObserver.observe(props.chatBodyEl.current);
      return () => resizeObserver.disconnect();
    } else {
      const onFocusListener = () => {
        window.isMobileJustDevice().then(isMobile => {
          if (!isMobile) return;
          props.chatEl.current.classList.remove('scrollSmooth');
          props.scrollToBottom();
        });
      };
      const inputFieldRef = inputField.current;
      inputFieldRef.addEventListener('focus', onFocusListener);
      return () => inputFieldRef.removeEventListener('focus', onFocusListener);
    }
  }, [props, props.scrollToBottom]);


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
          body: input,
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

  useEffect(() => {
    const dropListener = e => {
      e.preventDefault();

      const files =
        (e.dataTransfer.items
          ? Array.from(e.dataTransfer.items).map(item => item.getAsFile())
          : Array.from(e.dataTransfer.files))
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
    currChatEl.classList.remove('scrollSmooth');
    props.scrollToBottom();
  }, [inputFieldHeight, props]);

  return (
    <form onSubmit={onSubmit} ref={formEl}>
      <Share onFiles={setFiles} inputFieldHeight={inputFieldHeight}/>
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