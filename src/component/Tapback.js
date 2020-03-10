import React, {useEffect, useRef} from "react";
import './Tapback.css';

export default function Tapback(props) {

  /** @type {{current: HTMLDivElement}} */ const elem = useRef(null);
  const isHoldClick = useRef(true);

  useEffect(() => {
    const clickListener = e => {
      if (isHoldClick.current) {
        isHoldClick.current = false;
        return;
      }
      props.tap(null);
    };
    document.addEventListener('click', clickListener);
    return () => document.removeEventListener('click', clickListener);
  }, [props]);

  const tap = (e, action) => {
    e.preventDefault();
    e.stopPropagation();
    props.tap(action);
  };

  return (
    <div ref={elem} id="tapback">
      <ul>
        <li onClick={e => tap(e, 'thumbsUp')} role="button">
          <span role="img" aria-label="thumbs up">👍</span>
        </li>
        <li onClick={e => tap(e, 'thumbsDown')} role="button">
          <span role="img" aria-label="thumbs down">👎</span>
        </li>
        <li onClick={e => tap(e, 'exclamation')} role="button">
          <span role="img" aria-label="exclamation">❗️️</span>
        </li>
        <li onClick={e => tap(e, 'funny')} role="button">
          <span role="img" aria-label="funny">😄</span>
        </li>
        <li onClick={e => tap(e, 'love')} role="button">
          <span role="img" aria-label="love">❤️</span>
        </li>
        <li onClick={e => tap(e, 'question')} role="button">
          <span role="img" aria-label="question">❓</span>
        </li>
      </ul>
    </div>
  );
};
