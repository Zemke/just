import React, {useEffect, useRef, useState} from 'react';
import Storage from '../util/storage.js';
import './ImageMessage.css';
import Overlay from "./Overlay";

export default function ImageMessage(props) {

  /** @type {{current: HTMLDivElement}} */ const elemRef = useRef(null);

  const [detailView, setDetailView] = useState(null);

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
      const imgClickListener = e => {
        e.preventDefault();
        props.enableDetailView && setDetailView(e.target.src);
      };
      imgEl.addEventListener('click', imgClickListener);
      return () => imgEl.removeEventListener('click', imgClickListener);
    })();
  }, [props]);

  return (
    <div className={'image' + (props.message.placeholder ? ' sending' : '')}>
      {detailView && (
        <Overlay onClose={() => setDetailView(null)}>
          <a href={detailView} download>
            <img className="imageDetail" src={detailView}
                 alt="Message from other user"
                 title="Click to download"/>
          </a>
        </Overlay>
      )}
      <div ref={elemRef}/>
      {props.message.placeholder && (<div className="status">Sending</div>)}
    </div>
  );
};
