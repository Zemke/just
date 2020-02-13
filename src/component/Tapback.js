import React, {useEffect, useRef} from "react";
import './Tapback.css';

export default function Tapback(props) {

  /** @type {{current: HTMLDivElement}} */ const elem = useRef(null);

  useEffect(() => {
    // todo outside click
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
        <li onClick={e => tap(e, 'question')} role="button">
          <span role="img" aria-label="question">❓</span>
        </li>
        <li onClick={e => tap(e, 'funny')} role="button">
          <span role="img" aria-label="funny">😄</span>
        </li>
      </ul>
    </div>
  );
};
