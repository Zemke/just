import React, {useEffect, useRef, useState} from 'react';
import './Chat.css';
import DataStore from './dataStore';
import extractOtherUser from "./otherUser";
import ChatMenu from "./ChatMenu";
import ChatSelect from "./ChatSelect";

export default function Chat(props) {

  const chatEl = useRef(null);
  const inputField = useRef(null);
  const [initMessages, setInitMessages] = useState(false);
  const [field, setField] = useState('');
  const otherUser = useState(extractOtherUser(
    props.currentUser.uid, props.messages.sort((c1, c2) => c1 - c2)));

  const arbitraryTolerance = 70;

  useEffect(() => {
    if (!chatEl.current) return;
    const maxScrollTop = chatEl.current.scrollHeight - chatEl.current.offsetHeight;
    if (chatEl.current.scrollTop >= maxScrollTop - arbitraryTolerance
          || (props.initMessages && !initMessages)) {
      chatEl.current.scrollTo(0, maxScrollTop);
      setInitMessages(true);
    }
  }, [props.initMessages, initMessages, props.messages]);

  useEffect(() => {
    const documentKeydownHandler = () => inputField.current.focus();
    document.addEventListener('keydown', documentKeydownHandler);
    return function cleanup() {
      document.removeEventListener('keydown', documentKeydownHandler);
    };
  });

  const onSubmit = async e => {
    e.preventDefault();
    const payload = {
      from: props.currentUser.uid,
      to: otherUser,
      body: field
    };
    await DataStore.sendMessage(payload);
    setField('');
  };

  const rename = async newName =>
    await DataStore.saveChatName(otherUser, newName);

  const otherUsers = props.messages
    .reduce((acc, m) => {
      const otherUser1 = extractOtherUser(props.currentUser.uid, [m]);
      if (otherUser1 === otherUser) return acc;
      if (acc.indexOf(otherUser1) === -1) acc.push(otherUser1);
      return acc;
    }, []);

  return (
    <div className="chat" ref={chatEl}>
      <div className="head">
        <ChatMenu goToShareYourCode={props.goToShareYourCode}
                  goToEnterAnotherCode={props.goToEnterAnotherCode}
                  rename={rename}/>
        <div className="changeChat">
          <ChatSelect otherUsers={otherUsers} otherUser={otherUser}/>
        </div>
      </div>
      <div className="body">
        {props.messages
          .filter(m =>
            extractOtherUser(props.currentUser.uid, [m]) === otherUser)
          .sort((c1, c2) => c1.when - c2.when)
          .map(message =>
            <div key={message.id} className="message-wrapper">
              <div className={"message " + (otherUser === message.from ? "from" : "to")}>
                <div className="overlay"/>
                <p>{message.body}</p>
              </div>
            </div>
          )}
      </div>
      <div className="foot">
        <form onSubmit={e => onSubmit(e)}>
          <input onChange={e => setField(e.target.value)}
                 placeholder="Type here"
                 value={field}
                 ref={inputField}/>
        </form>
      </div>
    </div>
  );
};
