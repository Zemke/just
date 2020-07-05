import React, {useEffect, useState} from 'react';
import toName from '../util/toName';
import Dropdown from "./Dropdown";
import "./ChatSelect.css";
import DataStore from "../util/dataStore";

export default function ChatSelect(props) {

  const [otherUserName, setOtherUserName] = useState('');
  consgt [dropdownTrigger, setDropdownTrigger] = useState(null);
  const [names, setNames] = useState(DataStore.getCachedNames);

  useEffect(() => {
    setOtherUserName(names ? toName(props.otherUser, names) : '');
  }, [props.otherUser, names]);

  useEffect(() => {
    if (!props.currentUser) return;
    DataStore.clearCachedNames();
    const onNamesSubscription =
      DataStore.onNames(doc => {
        const data = doc.data();
        DataStore.cacheName(data);
        setNames(() => data);
      });
    return async () => (await onNamesSubscription)();
  }, [props.currentUser]);

  useEffect(() => {
    const keydownListener = e => {
      const currFixedListUsers = [props.otherUser, ...props.otherUsers].sort();
      const currUserIdx = currFixedListUsers.indexOf(props.otherUser);
      let nextUser;
      if (e.altKey === true && e.ctrlKey === true) {
        if (e.key === 'ArrowUp') {
          nextUser = currFixedListUsers[currUserIdx - 1];
        } else if (e.key === 'ArrowDown') {
          nextUser = currFixedListUsers[currUserIdx + 1];
        }
        nextUser != null && props.onSelect(nextUser);
      }
    };
    document.addEventListener('keydown', keydownListener)
    return () => document.removeEventListener('keydown', keydownListener);
  }, [props]);

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
