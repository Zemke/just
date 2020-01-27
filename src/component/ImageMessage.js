import React, {useEffect, useRef, useState} from 'react';
import Storage from '../util/storage.js';
import './ImageMessage.css';

export default function ImageMessage(props) {

  const imageRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (imageRef.current == null) return;
      imageRef.current.src = await Storage.download(props.message.image);
      setLoading(false);
    })();
  }, [props.message]);

  return (
    <>
      <img alt="Image message"
           ref={imageRef}
           className={loading ? 'display-none' : ''}/>
      <div className={'loadingImage' + (loading ? '' : ' display-none')}>
        Loading
      </div>
    </>
  )
};