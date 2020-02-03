import React, {useEffect, useRef, useState} from 'react';
import Share from "./Share";
import ContentEditable from "./ContentEditable";
import DataStore from "../util/dataStore";
import Storage from "../util/storage.js";
import './Foot.css';

export default function Foot(props) {

  /** @type {{current: ElementContentEditable}} */ const inputField = useRef(null);
  /** @type {{current: HTMLFormElement}} */ const formEl = useRef(null);

  const [field, setField] = useState(['']);
  const [files, setFiles] = useState([]);

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
        uploads.push({when: when.toMillis(), file: input[0], otherUser: props.otherUser});
      }
    });

    props.uploads(uploads);

    setField(['']);
    setFiles([]);

    inputField.current.focus();
    formEl.current.reset();
  };

  const onInputFieldResize = height => {
    if (!props.chatBodyEl.current) return;
    props.chatBodyEl.current.style.marginBottom = height + 'px';
    props.chatEl.current.classList.remove('scrollSmooth');
    props.scrollToBottom();
  };

  return (
    <form onSubmit={onSubmit} ref={formEl}>
      <Share onFiles={setFiles}/>
      <ContentEditable
        onChange={setField}
        onResize={onInputFieldResize}
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