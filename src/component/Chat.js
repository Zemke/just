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
import Peering from '../util/peering';
import VideoChat from "./VideoChat";
import toName from '../util/toName';
import Overlay from "./Overlay";
import getUserMedia from "../util/getUserMedia";

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
    return MessageUtils.extractOtherUser(
      props.currentUser.uid, props.messages.sort((c1, c2) => c2.when - c1.when));
  });
  const [otherUsers, setOtherUsers] = useState([]);
  const [lastOwnMessage, setLastOwnMessage] = useState(null);
  const [messageGaps, setMessageGaps] = useState(null);
  const [imagePlaceholders, setImagePlaceholders] = useState([]);
  const [videoChat, setVideoChat] = useState(null);
  const [ownStream, setOwnStream] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [scrolledDown, setScrolledDown] = useState(false);
  const [hasScrollbar, setHasScrollbar] = useState(false);

  const {messages: propsMessages} = props;

  const arbitraryTolerance = 100;
  const maxScrollTop = chatEl => chatEl.clientHeight - chatEl.offsetHeight;
  const calcScrolledDown = useCallback(() => {
    return chatEl.current.scrollTop >= maxScrollTop(chatEl.current) - arbitraryTolerance
  }, []);
  const forceScrollToBottom = useCallback((currChatEl, forceSmooth = false) => {
    if (forceSmooth) currChatEl.classList.add('scrollSmooth');
    currChatEl.scrollTo(0, maxScrollTop(currChatEl));
    setInitMessages(true);
    setTimeout(() => currChatEl.classList.add('scrollSmooth'), 300);
  }, []);
  const scrollToBottom = useCallback(() => {
    setHasScrollbar(chatEl.current.scrollHeight > chatEl.current.clientHeight);
    setTimeout(() => calcScrolledDown() && forceScrollToBottom(chatEl.current));
  }, [forceScrollToBottom, calcScrolledDown]);

  useEffect(() => {
    const currChatEl = chatEl.current;
    if (!currChatEl) return;
    const scrollListener = () => setScrolledDown(calcScrolledDown());
    currChatEl.addEventListener('scroll', scrollListener);
    return () => currChatEl.removeEventListener('scroll', scrollListener);
  });

  useEffect(() => {
    if (!Peering.supported || !props.currentUser || incomingCall) return;
    let listenToCallRequestsSubscription;
    (async () => {
      listenToCallRequestsSubscription = Peering.listenToCallRequests(
        stream => setVideoChat(stream),
        async (from, onOtherUserHangUp, hangUpCb) =>
          new Promise((resolve, _) => {
            onOtherUserHangUp.then(() => {
              resolve(null);
              setIncomingCall(null);
            });
            setIncomingCall({
              name: toName(from, DataStore.getCachedNames()),
              answer: async stream => {
                resolve(stream);
                stream && stream.then(stream => setOwnStream(() => ({stream, hangUpCb})));
              }
            });
          }));
    })();
    return async () => listenToCallRequestsSubscription && (await listenToCallRequestsSubscription)();
  }, [props.currentUser, incomingCall]);

  useEffect(() => {
    props.initMessages && !initMessages && setTimeout(() => forceScrollToBottom(chatEl.current))
  }, [forceScrollToBottom, props.initMessages, initMessages, props.messages, otherUser]);

  useEffect(() => {
    const resizeListener = () => scrollToBottom();
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
        (document.hidden || data.fromUid !== otherUser)
          && webNotifications.notify(data.fromName, data.body, {fromUserUid: data.fromUid}));
    }), [otherUser, props.currentUser]);

  useEffect(() => {
    window.history.pushState({}, "", '/' + otherUser);
  }, [otherUser]);

  const deleteChat = async () => {
    alert("The chat with that user is being deleted in the background. " +
      "It might take some time and the chat will just vanish once the deed is done.");
    await DataStore.deleteChatWithUser(otherUser);
  };

  const onSelect = otherUser => {
    setOtherUser(otherUser);
    scrollToBottom();
  };

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
      {incomingCall && (
        <Overlay>
          <div className="translucent translucent-center text-center">
            Incoming call from<br/>
            <span className="text-large">{incomingCall.name}</span><br/>
            <div className="margin-top">
                <span className="blink" role="img" aria-label="calling">
                  📞
                </span>
            </div>
            <div className="margin-top">
              <div>
                <button className="form-control"
                        onClick={() => incomingCall.answer(getUserMedia())}>
                  Answer
                </button>
              </div>
              <div>
                <button className="form-control" onClick={() => incomingCall.answer(null)}>
                  Hang up
                </button>
              </div>
            </div>
          </div>
        </Overlay>
      )}
      {videoChat && (
        <VideoChat otherUser={otherUser}
                   stream={videoChat}
                   ownStream={ownStream}
                   onClose={() => setVideoChat(null)}/>
      )}
      <div className="head">
        <ChatMenu goToShareYourCode={() => props.goToShareYourCode(otherUser)}
                  goToEnterAnotherCode={() => props.goToEnterAnotherCode(otherUser)}
                  otherUser={otherUser} deleteChat={deleteChat} signOut={props.signOut}/>
        <div className="changeChat">
          <ChatSelect otherUsers={otherUsers}
                      otherUser={otherUser}
                      onSelect={onSelect}
                      currentUser={props.currentUser}/>
        </div>
      </div>
      <div className="body" ref={chatBodyEl}>
        {lastOwnMessage && messageGaps && (
          messagesToRender()
            .filter(m => MessageUtils.extractOtherUser(props.currentUser.uid, [m]) === otherUser)
            .map(message => (<Message key={message.id || message.image}
                                      messageGap={messageGaps[message.id]}
                                      lastOwnMessage={lastOwnMessage.id === message.id}
                                      {...{message, otherUser}} />))
        )}
        {(!scrolledDown && hasScrollbar) && (
          <button onClick={() => forceScrollToBottom(chatEl.current, true)}
                  className="scrollDown">
            &#8595;
          </button>
        )}
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
