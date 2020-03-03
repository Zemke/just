import React, {useEffect, useRef, useState} from 'react';
import QRCode from 'bluedrop-qrcode-generator';
import Close from "./Close";

export default function ShareYourCode(props) {

  const [copyingCode, setCopyingCode] = useState(false);
  const [copyingInviteLink, setCopyingInviteLink] = useState(false);

  const codeInputEl = useRef(null);
  const inviteLinkInputEl = useRef(null);
  const qrCodeEl = useRef(null);
  const inviteLink = useRef(
    `${window.location.origin}/enter-code?code=${props.currentUser.uid}`);

  useEffect(() => {
    new QRCode(qrCodeEl.current, inviteLink.current);
  }, []);

  const copyInviteLink = () => {
    inviteLinkInputEl.current.select();
    inviteLinkInputEl.current.setSelectionRange(0, 99999);
    document.execCommand("copy");
    setCopyingInviteLink(true);
    setTimeout(() => setCopyingInviteLink(false), 1000);
  };

  const copyCode = () => {
    codeInputEl.current.select();
    codeInputEl.current.setSelectionRange(0, 99999);
    document.execCommand("copy");
    setCopyingCode(true);
    setTimeout(() => setCopyingCode(false), 1000);
  };

  return (
    <div className="translucent translucent-center text-center">
      <Close close={props.close}/>

      <h1>Share your code</h1>
      <p>{props.currentUser.uid}</p>
      <div className="margin-top split-button">
        <div>
          <button className="form-control" onClick={copyCode}>
            {copyingCode ? 'Copied' : 'Copy code'}
          </button>
        </div>
        <div>
          <button className="form-control" onClick={copyInviteLink}>
            {copyingInviteLink ? 'Copied' : 'Copy invite link'}
          </button>
        </div>
      </div>
      <div className="margin-top">
        <div className="flex" ref={qrCodeEl}/>
      </div>
      <input className="invisible" readOnly ref={codeInputEl} value={props.currentUser.uid}/>
      <input className="invisible" readOnly ref={inviteLinkInputEl} value={inviteLink.current}/>
    </div>
  );
}
