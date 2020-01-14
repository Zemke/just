import React, {useEffect, useState} from 'react';
import toName from './toName';

export default function ChatSelect(props) {

  const [expanded, setExpanded] = useState(false);
  const [otherUserName, setOtherUserName] = useState(toName(props.otherUser));

  useEffect(() => {
    const chatNameChangeListener = ({detail}) => setOtherUserName(detail);
    // noinspection JSCheckFunctionSignatures,SpellCheckingInspection // custom event
    window.addEventListener("chatnamechange", chatNameChangeListener);
    return () => {
      // noinspection JSCheckFunctionSignatures,SpellCheckingInspection // custom event
      window.removeEventListener("chatnamechange", chatNameChangeListener);
    };
  });

  return (<>
    <div className="otherUser"
         onClick={() => props.otherUsers.length && setExpanded(!expanded)}>
      {otherUserName}
    </div>
    {!!props.otherUsers.length && (
      <div className={'dropdown attach-left' + (expanded ? ' expanded' : '')}>
        <ul>
          {props.otherUsers.map(user =>
            <li key={user} onChange={() => props.onSelect(user)}>
              {toName(user)}
            </li>)}
        </ul>
      </div>
    )}
  </>)
}
