import React, {useEffect, useState} from 'react';
import Giphy from '../util/giphy';

export default function GiphyMessage({id}) {

  const [original, setOriginal] = useState(null);

  useEffect(() => {
    Giphy.getById(id).then(({data}) =>
      data && data.images && setOriginal({
        webp: data.images.original.webp,
        url: data.images.original.url,
        title: data.title,
        id: data.id,
      }));
  }, [id]);

  return original ? (
    <picture className="image">
      <source srcSet={original.webp} type="image/webp"/>
      <source srcSet={original.url} type="image/gif"/>
      <img src={original.url} alt={original.title}/>
    </picture>
  ) : '';
}
