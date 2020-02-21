import React, {useEffect, useRef} from 'react';
import './TapbackDisplay.css';

export default function DisplayTapback(props) {

  const {action, from} = props.tapback;
  /** @type {{current: HTMLDivElement}} */ const elem = useRef(null);

  useEffect(() => {
    const currElem = elem.current;
    if (!currElem) return;
    requestAnimationFrame(() => currElem.classList.add('appeared'))
  }, []);

  return (
    <div className={'tapback ' + (from === props.otherUser ? 'to' : 'from')} ref={elem}>
      {action === 'thumbsUp' && (<span role="img" aria-label="thumbs up">👍</span>)}
      {action === 'thumbsDown' && (<span role="img" aria-label="thumbs down">👎</span>)}
      {action === 'exclamation' && (<span role="img" aria-label="exclamation">❗️️</span>)}
      {action === 'funny' && (<span role="img" aria-label="funny">😄</span>)}
      {action === 'love' && (<span role="img" aria-label="love">❤️</span>)}
      {action === 'question' && (<span role="img" aria-label="question">❓</span>)}
    </div>
  )
}
