import React, {Fragment, useEffect, useRef, useState} from 'react';
import './Chat.css';
import DataStore from '../util/dataStore';
import ChatMenu from "./ChatMenu";
import ChatSelect from "./ChatSelect";
import MessageUtils from '../util/messageUtils';
import toName from '../util/toName.js';
import Linkify from 'react-linkify';

export default function Chat(props) {

  const chatEl = useRef(null);
  const inputField = useRef(null);
  const [initMessages, setInitMessages] = useState(false);
  const [field, setField] = useState('');
  const [otherUser, setOtherUser] = useState(() => {
    const otherUserFromPathname = window.location.pathname.substr(1);
    if (!!otherUserFromPathname) {
      const otherUserFromPathnameExists = props.messages.find(
        m => m.from === otherUserFromPathname || m.to === otherUserFromPathname);
      if (otherUserFromPathnameExists) return otherUserFromPathname;
    }
    return MessageUtils.extractOtherUser(
      props.currentUser.uid, props.messages.sort((c1, c2) => c1 - c2));
  });
  const [otherUsers, setOtherUsers] = useState([]);
  const [lastOwnMessage, setLastOwnMessage] = useState(null);

  const arbitraryTolerance = 150;

  useEffect(() => {
    if (!chatEl.current) return;
    const maxScrollTop = chatEl.current.scrollHeight - chatEl.current.offsetHeight;
    if (chatEl.current.scrollTop >= maxScrollTop - arbitraryTolerance
      || (props.initMessages && !initMessages)) {
      chatEl.current.scrollTo(0, maxScrollTop);
      setInitMessages(true);
    }
  }, [props.initMessages, initMessages, props.messages, otherUser]);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const onNotificationClickListener = e => {
      if (!('newMessage' in e.data)) return;
      setOtherUser(e.data.newMessage);

    };

    navigator.serviceWorker.addEventListener('message', onNotificationClickListener);

    return () => {
      navigator.serviceWorker.removeEventListener('message', onNotificationClickListener)
    }
  }, []);

  useEffect(() => {
    const documentKeydownHandler = e => {
      if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return;
      return inputField.current.focus();
    };
    document.addEventListener('keydown', documentKeydownHandler);
    return () => document.removeEventListener('keydown', documentKeydownHandler);
  });

  useEffect(() => {
    window.history.pushState({}, "", '/' + otherUser);
  }, [otherUser]);

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
      alert(`Sending message “${payload.message}” to ${toName(otherUser, props.names)} failed.\n\n${e}`);
    }
  };

  const rename = async newName =>
    await DataStore.putNames({...props.names, [otherUser]: newName});

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

  useEffect(() => {
    const ownMessages = props.messages
      .filter(m => m.from === props.currentUser.uid && m.to === otherUser)
      .sort((c1, c2) => c1.when - c2.when);

    setLastOwnMessage(
      ownMessages.length === 0
        ? setLastOwnMessage(null)
        : ownMessages[ownMessages.length - 1]);
  }, [props.messages, otherUser, lastOwnMessage, props.currentUser]);

  return (
    <div className="chat" ref={chatEl}>
      <div className="head">
        <ChatMenu goToShareYourCode={props.goToShareYourCode}
                  goToEnterAnotherCode={props.goToEnterAnotherCode}
                  rename={rename} deleteChat={deleteChat} signOut={props.signOut}/>
        <div className="changeChat">
          <ChatSelect otherUsers={otherUsers}
                      otherUser={otherUser}
                      names={props.names}
                      onSelect={onSelect}/>
        </div>
      </div>
      <div className="body">
        {props.messages
          .filter(m =>
            MessageUtils.extractOtherUser(props.currentUser.uid, [m]) === otherUser)
          .sort((c1, c2) => c1.when - c2.when)
          .map(message => (
            <Fragment key={message.id}>
              <div className="message-wrapper">
                <div className={"message " + (otherUser === message.from ? "from" : "to")}>
                  <div className="overlay"/>
                  <p><Linkify>{message.body}</Linkify></p>
                </div>
              </div>
              {(lastOwnMessage != null && lastOwnMessage.id === message.id) && (
                <div className="status">
                  {message.when == null
                    ? 'Sending'
                    : (message.delivered ? 'Delivered' : 'Sent')}
                </div>
              )}
            </Fragment>)
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