import React, {useEffect} from 'react';
import Storage from '../util/storage.js';

export default function ImageMessage(props) {

  useEffect(() => {
    (async () => {
     const image = await Storage.download(props.message.image);

    })();
  }, [props.message]);

  return (<>{props.message.image}</>)
};