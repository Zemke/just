import React, {useEffect, useRef, useState} from 'react';
import './Chat.css';
import DataStore from './dataStore';
import ChatMenu from "./ChatMenu";
import ChatSelect from "./ChatSelect";
import MessageUtils from './messageUtils';

export default function Chat(props) {

  const chatEl = useRef(null);
  const inputField = useRef(null);
  const [initMessages, setInitMessages] = useState(false);
  const [field, setField] = useState('');
  const [otherUser, setOtherUser] = useState(MessageUtils.extractOtherUser(
    props.currentUser.uid, props.messages.sort((c1, c2) => c1 - c2)));
  const [otherUsers, setOtherUsers] = useState([]);

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
    return () => document.removeEventListener('keydown', documentKeydownHandler);
  });

  const onSubmit = async e => {
    e.preventDefault();
    const payload = {
      from: props.currentUser.uid,
      to: otherUser,
      body: field
    };
    setField('');
    try {
      await DataStore.sendMessage(payload);
    } catch (e) {
      alert('Sending message failed: ' + e)
    }
  };

  const rename = async newName =>
    await DataStore.saveChatName(otherUser, newName);

  const deleteChat = async () =>
    await DataStore.deleteChatWithUser(otherUser);

  const onSelect = otherUser =>
    setOtherUser(otherUser);

  useEffect(() => {
    const otherUsers = props.messages
      .reduce((acc, m) => {
        const otherUser1 = MessageUtils.extractOtherUser(props.currentUser.uid, [m]);
        if (otherUser1 === otherUser) return acc;
        if (acc.indexOf(otherUser1) === -1) acc.push(otherUser1);
        return acc;
      }, []);
    setOtherUsers(otherUsers);
  }, [otherUser, props.messages, props.currentUser]);

  return (
    <div className="chat" ref={chatEl}>
      <div className="head">
        <ChatMenu goToShareYourCode={props.goToShareYourCode}
                  goToEnterAnotherCode={props.goToEnterAnotherCode}
                  rename={rename} deleteChat={deleteChat} signOut={props.signOut}/>
        <div className="changeChat">
          <ChatSelect otherUsers={otherUsers} otherUser={otherUser} onSelect={onSelect}/>
        </div>
      </div>
      <div className="body">
        {props.messages
          .filter(m =>
            MessageUtils.extractOtherUser(props.currentUser.uid, [m]) === otherUser)
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
        <form onSubmit={onSubmit}>
          <input onChange={e => setField(e.target.value)}
                 placeholder="Type here"
                 value={field}
                 required
                 ref={inputField}/>
        </form>
      </div>
    </div>
  );
};
