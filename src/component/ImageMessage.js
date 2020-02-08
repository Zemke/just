import React, {useEffect, useRef, useState} from 'react';
import Storage from '../util/storage.js';
import './ImageMessage.css';

export default function ImageMessage(props) {

  /** @type {{current: HTMLDivElement}} */ const elemRef = useRef(null);

  const [loading, setLoading] = useState(null);

  // todo loading indication on receiving
  //  (between message received and image downloaded)
  // todo image delivery takes longer than raw messages
  //  check on how the delivery process works and maybe have extra
  //  delivery status just for the image.

  useEffect(() => {
    (async () => {
      const currElemRef = elemRef.current;
      if (!currElemRef) return;

      let imageSrc;
      if (props.message.placeholder) {
        imageSrc = URL.createObjectURL(props.message.placeholder);
        setLoading(false);
      } else {
        setTimeout(() => setLoading(curr => curr === null ? true : curr), 1000);
        imageSrc = await Storage.download(props.message.image);
        setLoading(false);
      }
      const imgEl = document.createElement('img');
      imgEl.src = imageSrc;
      currElemRef.innerHTML = '';
      currElemRef.appendChild(imgEl);
    })();
  }, [props.message]);

  return (
    <div className="image">
      <div ref={elemRef}/>
      {loading === true && (<div className="loadingImage">Loading</div>)}
      {props.message.placeholder && (<div className="status">Sending</div>)}
    </div>
  )
};