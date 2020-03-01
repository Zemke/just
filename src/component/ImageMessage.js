import React, {useEffect, useMemo, useRef, useState} from 'react';
import Storage from '../util/storage.js';
import './ImageMessage.css';
import Overlay from "./Overlay";

export default React.memo(({image, placeholder, proceedWithDetailView}) => {

  /** @type {{current: HTMLDivElement}} */ const elemRef = useRef(null);

  const [detailView, setDetailView] = useState(null);

  useEffect(() => {
    const currElemRef = elemRef.current;
    if (!currElemRef) return;
    (async () => {
      const imageSrc = placeholder
        ? URL.createObjectURL(placeholder)
        : await Storage.download(image);
      const imgEl = document.createElement('img');
      imgEl.src = imageSrc;
      currElemRef.innerHTML = '';
      currElemRef.appendChild(imgEl);
      const imgClickListener = async e => {
        e.preventDefault();
        await proceedWithDetailView() && setDetailView(e.target.src);
      };
      imgEl.addEventListener('click', imgClickListener);
      return () => imgEl.removeEventListener('click', imgClickListener);
    })();
  }, [image, placeholder, proceedWithDetailView]);

  return useMemo(() => (
    <div className={'image' + (placeholder ? ' sending' : '')}>
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
      {placeholder && (<div className="status">Sending</div>)}
    </div>
  ), [detailView, placeholder]);
});
