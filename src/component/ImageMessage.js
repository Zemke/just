import React, {useEffect, useRef} from 'react';
import Storage from '../util/storage.js';
import './ImageMessage.css';

export default function ImageMessage(props) {

  const imageRef = useRef(null);

  useEffect(() => {
    (async () => {
      if (imageRef.current == null) return;
      const image = await Storage.download(props.message.image);
      console.log(image);
      imageRef.current.src = image;
    })();
  }, [props.message]);

  return (
    <>
      {(imageRef?.current?.src)
        ? (<img alt="Image message" ref={imageRef}/>)
        : (<div className="loadingImage">Loading</div>)}
    </>
  )
};