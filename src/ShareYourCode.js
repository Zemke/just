import React, {useEffect, useRef} from 'react';
import QRCode from 'bluedrop-qrcode-generator';

export default function ShareYourCode(props) {

  const qrCodeEl = useRef(null);

  useEffect(() => {
    new QRCode(qrCodeEl.current, props.currentUser.uid);
  });

  return (
    <div className="translucent translucent-center text-center">
      <h1>Share your code</h1>
      <p>{props.currentUser.uid}</p>
      <div className="margin-top">
        <div className="flex" ref={qrCodeEl}/>
      </div>
    </div>
  );
}