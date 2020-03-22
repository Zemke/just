import React, {useEffect, useState} from 'react';
import toName from '../util/toName';
import Dropdown from "./Dropdown";
import "./ChatSelect.css";
import DataStore from "../util/dataStore";

export default function ChatSelect(props) {

  const [otherUserName, setOtherUserName] = useState('');
  const [dropdownTrigger, setDropdownTrigger] = useState(null);
  const [names, setNames] = useState(null);

  useEffect(() => {
    setOtherUserName(names ? toName(props.otherUser, names) : '');
  }, [props.otherUser, names]);

  useEffect(() => {
    if (!props.currentUser) return;
    const onNamesSubscription =
      DataStore.onNames(doc => setNames(() => doc.data()));
    return async () => (await onNamesSubscription)();
  }, [props.currentUser]);

  return (<>
    {props.otherUsers.length > 0 ? (
      <>
        <button className="otherUser" type="button" ref={setDropdownTrigger}>
          {otherUserName}
        </button>

        <Dropdown dropdownTrigger={dropdownTrigger} className="attachTopLeft">
          <ul>
            {props.otherUsers.map(user =>
              <li key={user} onClick={() => props.onSelect(user)}>
                {toName(user, names)}
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
