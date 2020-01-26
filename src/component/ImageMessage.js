import React, {useEffect, useRef} from 'react';
import Storage from '../util/storage.js';

export default function ImageMessage(props) {

  const imageRef = useRef(null);

  useEffect(() => {
    (async () => {
      const image = await Storage.download(props.message.image);
      console.log(image);
      imageRef.current.src = image;
    })();
  }, [props.message]);

  return (<img alt="Image message" ref={imageRef}/>)
};