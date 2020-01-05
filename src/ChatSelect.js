import React, {useState} from 'react';
import toName from './toName';

export default function ChatSelect(props) {
  const [expanded, setExpanded] = useState(false);

  return (<>
    <div className="otherUser"
         onClick={() => props.otherUsers.length && setExpanded(!expanded)}>
      {toName(props.otherUser)}
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
