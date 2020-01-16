import React, {useEffect, useState} from 'react';
import toName from '../util/toName';
import Dropdown from "./Dropdown";
import './ChatSelect.css';

export default function ChatSelect(props) {

  const [otherUserName, setOtherUserName] = useState(null);
  const [dropdownTrigger, setDropdownTrigger] = useState(null);

  useEffect(() => {
    setOtherUserName(toName(props.otherUser, props.names));
  }, [props.otherUser, props.names]);

  return (<>
    {props.otherUsers.length > 0 ? (
      <>
        <button className="otherUser" type="button" ref={setDropdownTrigger}>
          {otherUserName}
        </button>

        <Dropdown dropdownTrigger={dropdownTrigger} className="chatSelectMenu attachTopLeft">
          <ul>
            {props.otherUsers.map(user =>
              <li key={user} onClick={() => props.onSelect(user)}>
                {toName(user, props.names)}
              </li>)}
          </ul>
        </Dropdown>
      </>
    ) : (
      <div className="otherUser">
        {otherUserName}
      </div>
    )}
  </>)
}
