import React, {useCallback, useEffect, useRef, useState} from 'react';
import './Chat.css';
import DataStore from '../util/dataStore';
import ChatMenu from "./ChatMenu";
import ChatSelect from "./ChatSelect";
import MessageUtils from '../util/messageUtils';
import messaging from "../util/messaging";
import webNotifications from "../util/webNotification";
import Foot from "./Foot";
import Storage from '../util/storage.js';
import Message from "./Message";

export default function Chat(props) {

  /** @type {{current: HTMLDivElement}} */ const chatEl = useRef(null);
  /** @type {{current: HTMLDivElement}} */ const chatBodyEl = useRef(null);

  const [initMessages, setInitMessages] = useState(false);
  const [otherUser, setOtherUser] = useState(() => {
    const otherUserFromPathname = window.location.pathname.substr(1);
    if (!!otherUserFromPathname) {
      const otherUserFromPathnameExists = props.messages.find(
        m => m.from === otherUserFromPathname || m.to === otherUserFromPathname);
      if (otherUserFromPathnameExists) return otherUserFromPathname;
    }
    return MessageUtils.extractOtherUser(props.currentUser.uid, props.messages);
  });
  const [otherUsers, setOtherUsers] = useState([]);
  const [lastOwnMessage, setLastOwnMessage] = useState(null);
  const [messageGaps, setMessageGaps] = useState({});
  const [imagePlaceholders, setImagePlaceholders] = useState([]);

  const {messages: propsMessages} = props;

  const arbitraryTolerance = 150;
  const maxScrollTop = chatEl => chatEl.scrollHeight - chatEl.offsetHeight;
  const scrollToBottom = useCallback(() => {
    const currChatEl = chatEl.current;
    if (!currChatEl) return;
    currChatEl.scrollTo(0, maxScrollTop(currChatEl));
    setInitMessages(true);
    setTimeout(() => {
      currChatEl.scrollTo(0, maxScrollTop(currChatEl));
      currChatEl.classList.add('scrollSmooth');
    }, 300);
  }, []);

  useEffect(() => {
    const currChatEl = chatEl.current;
    if (!currChatEl) return;
    if (currChatEl.scrollTop >= maxScrollTop(currChatEl) - arbitraryTolerance
          || (props.initMessages && !initMessages)) {
      scrollToBottom();
    }
  }, [scrollToBottom, props.initMessages, initMessages, props.messages, otherUser]);

  useEffect(() => {
    const resizeListener = () => {
      const currChatEl = chatEl.current;
      if (!currChatEl) return;
      if (currChatEl.scrollTop >= maxScrollTop(currChatEl) - arbitraryTolerance) {
        currChatEl.classList.remove('scrollSmooth');
        scrollToBottom();
      }
    };
    window.addEventListener('resize', resizeListener);
    return () => window.removeEventListener('resize', resizeListener);
  }, [scrollToBottom]);

  useEffect(() => {
    const messageWithGap = props.messages.reduce((acc, curr, idx, arr) => {
      if (idx === 0) {
        acc[curr.id] = new Date(curr.when).toLocaleString();
      } else if (curr.when - arr[idx - 1].when >= 5000 * 60) {
        acc[curr.id] = new Date(curr.when).toLocaleString();
      }
      return acc;
    }, {});
    setMessageGaps(messageWithGap);
  }, [props.messages]);

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

  useEffect(() =>
    props.currentUser && messaging(api => {
      api.getToken(DataStore.saveToken);
      api.onTokenRefresh(DataStore.saveToken);
      api.onMessage(({data}) =>
        (!document.hasFocus() || data.fromUid !== otherUser) && webNotifications.notify(
        data.fromName, data.body, {fromUserUid: data.fromUid}));
    }), [otherUser, props.currentUser]);

  useEffect(() => {
    window.history.pushState({}, "", '/' + otherUser);
  }, [otherUser]);

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
      .filter(m => m.from === props.currentUser.uid && m.to === otherUser);

    setLastOwnMessage(
      ownMessages.length === 0
        ? setLastOwnMessage(null)
        : ownMessages[ownMessages.length - 1]);
  }, [props.messages, otherUser, lastOwnMessage, props.currentUser]);

  useEffect(() =>
      setImagePlaceholders(curr => {
        return !curr.length ? curr : [...curr
          .filter(iP => propsMessages
            .map(m => m.image)
            .filter(Boolean)
            .indexOf(iP.image) === -1)];
      }),
    [propsMessages]);

  const onUploads = uploads => {
    setImagePlaceholders(curr => [
      ...curr,
      ...uploads.map(u => ({
        from: props.currentUser.uid,
        to: u.otherUser,
        body: null,
        when: u.when,
        image: Storage.PREFIX + u.file[0],
        placeholder: u.file[1]
      }))
    ]);
  };

  const messagesToRender = () =>
    (imagePlaceholders.length
      ? props.messages
        .concat(imagePlaceholders)
        .sort((c1, c2) => c1.when - c2.when)
      : props.messages);

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
      <div className="body" ref={chatBodyEl}>
        {messagesToRender()
          .filter(m => MessageUtils.extractOtherUser(props.currentUser.uid, [m]) === otherUser)
          .map(message => (<Message key={message.id || message.image}
                                    {...{message, otherUser, lastOwnMessage, messageGaps}} />))}
      </div>
      <div className="foot">
        <Foot chatBodyEl={chatBodyEl}
              chatEl={chatEl}
              scrollToBottom={scrollToBottom}
              otherUser={otherUser}
              currentUser={props.currentUser}
              uploads={onUploads}/>
      </div>
    </div>
  );
};
