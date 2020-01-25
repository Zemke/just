import React, {Fragment, useCallback, useEffect, useRef, useState} from 'react';
import './Chat.css';
import DataStore from '../util/dataStore';
import ChatMenu from "./ChatMenu";
import ChatSelect from "./ChatSelect";
import MessageUtils from '../util/messageUtils';
import Linkify from 'react-linkify';
import messaging from "../util/messaging";
import webNotifications from "../util/webNotification";
import Foot from "./Foot";
import ImageMessage from "./ImageMessage";

export default function Chat(props) {

  const chatEl = useRef(null);
  const chatBodyEl = useRef(null);
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

  const arbitraryTolerance = 150;
  const maxScrollTop = chatEl => chatEl.scrollHeight - chatEl.offsetHeight;
  const scrollToBottom = useCallback(() => {
    chatEl.current.scrollTo(0, maxScrollTop(chatEl.current));
    setInitMessages(true);
    setTimeout(() => {
      chatEl.current.scrollTo(0, maxScrollTop(chatEl.current));
      chatEl.current.classList.add('scrollSmooth');
    }, 300);
  }, []);

  useEffect(() => {
    if (!chatEl.current) return;
    if (chatEl.current.scrollTop >= maxScrollTop(chatEl.current) - arbitraryTolerance
          || (props.initMessages && !initMessages)) {
      scrollToBottom();
    }
  }, [scrollToBottom, props.initMessages, initMessages, props.messages, otherUser]);

  useEffect(() => {
    const resizeListener = () => {
      if (chatEl.current.scrollTop >= maxScrollTop(chatEl.current) - arbitraryTolerance) {
        chatEl.current.classList.remove('scrollSmooth');
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

  const isOnlyEmoji = message =>
    !!message && !message
      .replace(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g, '')
      .replace(/[^\x00-\x7F]/g, "")
      .length;

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
        {props.messages
          .filter(m =>
            MessageUtils.extractOtherUser(props.currentUser.uid, [m]) === otherUser)
          .map(message => (
            <Fragment key={message.id}>
              {messageGaps[message.id] && (<div className="timestamp">{messageGaps[message.id]}</div>)}

              <div className="message-wrapper">
                <div className={"message " + (otherUser === message.from ? "from" : "to")}>
                  <div className="overlay"/>
                  {message.image
                    ? (<ImageMessage message={message}/>)
                    : (
                      <p className={isOnlyEmoji(message.body.trim()) ? 'onlyEmoji' : ''}>
                        <Linkify>
                          {message.body.split('\n')
                            .map((m, idx) => (<Fragment key={idx}>{m}<br/></Fragment>))}
                        </Linkify>
                      </p>
                    )}
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
        <Foot chatEl={chatEl}
              scrollToBottom={scrollToBottom}
              chatBodyEl={chatBodyEl}
              otherUser={otherUser}
              currentUser={props.currentUser}/>
      </div>
    </div>
  );
};
