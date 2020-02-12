import React, {useEffect, useRef} from "react";
import ReactDOM from "react-dom";
import './Tapback.css';

export default function Tapback(props) {

  /** @type {{current: HTMLDivElement}} */ const elem = useRef(null);

  useEffect(() => {
    const currElem = elem.current;
    if (!currElem) return;
    const clickListener = () => props.tap(null);
    document.addEventListener('click', clickListener);
    return () => document.removeEventListener('click', clickListener);
  }, [props]);

  const tap = (e, action) => {
    e.preventDefault();
    e.stopPropagation();
    props.tap(action);
  };

  return ReactDOM.createPortal(
    (<div ref={elem} id="tapback">
      <ul>
        <li onClick={e => tap(e, 'thumbsUp')}><span role="img" aria-label="thumbs up">👍</span></li>
        <li onClick={e => tap(e, 'thumbsDown')}><span role="img" aria-label="thumbs down">👎</span></li>
        <li onClick={e => tap(e, 'exclamation')}><span role="img" aria-label="exclamation">️‼️</span></li>
        <li onClick={e => tap(e, 'question')}><span role="img" aria-label="question">❓</span></li>
        <li onClick={e => tap(e, 'funny')}><span role="img" aria-label="funny">😄</span></li>
      </ul>
    </div>),
    document.getElementById('appendToBodyContainer'));

};
