import React, {useEffect, useRef} from 'react';
import Storage from '../util/storage.js';
import './ImageMessage.css';

export default function ImageMessage(props) {

  /** @type {{current: HTMLDivElement}} */ const elemRef = useRef(null);

  useEffect(() => {
    const currElemRef = elemRef.current;
    if (!currElemRef) return;

    (async () => {
      const imageSrc = props.message.placeholder
        ? URL.createObjectURL(props.message.placeholder)
        : await Storage.download(props.message.image);

      const imgEl = document.createElement('img');
      imgEl.src = imageSrc;
      currElemRef.innerHTML = '';
      currElemRef.appendChild(imgEl);
    })();
  }, [props.message]);

  return (
    <div className={'image' + (props.message.placeholder ? ' sending' : '')}>
      <div ref={elemRef}/>
      {props.message.placeholder && (<div className="status">Sending</div>)}
    </div>
  )
};