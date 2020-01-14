import React, {useEffect, useState} from 'react';
import toName from './toName';
import Dropdown from "./Dropdown";
import './ChatSelect.css';

export default function ChatSelect(props) {

  const [otherUserName, setOtherUserName] = useState(null);
  const [dropdownTrigger, setDropdownTrigger] = useState(null);

  useEffect(() => {
    const chatNameChangeListener = ({detail}) => setOtherUserName(detail);
    // noinspection JSCheckFunctionSignatures,SpellCheckingInspection // custom event
    window.addEventListener("chatnamechange", chatNameChangeListener);
    return () => {
      // noinspection JSCheckFunctionSignatures,SpellCheckingInspection // custom event
      window.removeEventListener("chatnamechange", chatNameChangeListener);
    };
  });

  useEffect(() => {
    setOtherUserName(toName(props.otherUser));
  }, [props.otherUser]);

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
                {toName(user)}
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
