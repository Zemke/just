import React, {useEffect, useState} from 'react';
import './App.css';
import DataStore from "../util/dataStore";
import SignIn from "./SignIn";
import Auth from "../util/auth";
import EnterAnotherCode from "./EnterAnotherCode";
import ShareYourCode from "./ShareYourCode";
import Start from './Start';
import Chat from "./Chat";
import MessageUtils from "../util/messageUtils";
import webNotifications from '../util/webNotification';
import Peering from "../util/peering";
import toName from "../util/toName";

export default function App() {

  const [currentUser, setCurrentUser] = useState(() => DataStore.getRememberedUser());
  const [enterAnotherCode, setEnterAnotherCode] = useState(window.location.pathname === '/enter-code');
  const [shareYourCode, setShareYourCode] = useState(window.location.pathname === '/share-code');
  const [messages, setMessages] = useState([]);
  const [initMessages, setInitMessages] = useState(false);
  const [names, setNames] = useState(null);
  const [otherUser, setOtherUser] = useState(null);

  useEffect(() => {
    Auth
      .current()
      .then(currentUser => {
        if (!currentUser) {
          DataStore.alienateRememberedUser();
          return;
        }
        webNotifications.requestPermission();
        DataStore.rememberUser(currentUser);
        setCurrentUser(currentUser);
      });
  }, []);

  useEffect(() => {
    window.onpopstate = () => {
      setEnterAnotherCode(window.location.pathname === '/enter-code');
      setShareYourCode(window.location.pathname === '/share-code');
    };

    return () => {
      window.onpopstate = () => undefined;
    };
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const onMessageListener = e => {
      if (!('onMessage' in e.data)) return;
      console.log('here', messages[0], e.data.onMessage);

      setMessages(curr =>
        curr.find(m => m.id === e.data.onMessage.id)
          ? curr
          : [...curr, e.date.onMessage]);
    };
    navigator.serviceWorker.addEventListener('message', onMessageListener);
    return () =>
      navigator.serviceWorker.removeEventListener('message', onMessageListener);
  }, []);

  useEffect(() => {
    if (enterAnotherCode) {
      window.history.pushState({}, "", '/enter-code' + window.location.search);
    } else if (shareYourCode) {
      window.history.pushState({}, "", '/share-code' + window.location.search);
    }
  }, [enterAnotherCode, shareYourCode]);

  useEffect(() => {
    if (!currentUser) return;

    const onMessageSubscription = DataStore.onMessage(messages => {
      setMessages(curr => {
        const accumulation = messages.reduce((acc, {message, doc, type}) => {
          if (type === 'added') {
            message._hasPendingWrites = doc.metadata.hasPendingWrites;
            if (message.to === currentUser.uid && !message.delivered) {
              DataStore.setDelivered(doc.ref);
            }
            const existsAtIdx = acc.findIndex(m => m.id === doc.id);
            existsAtIdx === -1
              ? acc.push(message)
              : (acc[existsAtIdx] = message);
          } else if (type === 'removed') {
            acc = acc.filter(m => m.id !== doc.id);
          } else if (type === 'modified') {
            acc = acc.map(m => m.id === doc.id ? message : m);
          }
          return acc;
        }, curr).sort((c1, c2) => c1.when - c2.when);

        setInitMessages(true);

        return [...accumulation];
      });
    });

    return async () => {
      (await onMessageSubscription)();
    };
  }, [currentUser]);

  useEffect(() => {
    if (!Peering.supported || !currentUser || !names || !Object.keys(names).length) return;
    const listenToCallRequestsSubscription =
      Peering.listenToCallRequests(
        data => console.log(data.toString()),
        from => window.confirm(`${toName(from, names)} is calling, answer?`));
    return async () => (await listenToCallRequestsSubscription)();
  }, [currentUser, names]);

  useEffect(() => {
    if (!currentUser) return;
    const onNamesSubscription = DataStore.onNames(
      doc => setNames(() => doc.data()));
    return async () => {
      (await onNamesSubscription)();
    };
  }, [currentUser]);

  useEffect(() => {
    if (!initMessages) return;
    if (!shareYourCode && !enterAnotherCode) return;

    const newestMessage = MessageUtils.getNewestMessage(messages);
    if (!newestMessage) return;

    const conversation = messages
      .filter(MessageUtils.containsExactlyUsers(newestMessage.users));

    if (conversation.length === 1) {
      setEnterAnotherCode(false);
      setShareYourCode(false);
    }
  }, [enterAnotherCode, shareYourCode, messages, initMessages]);

  const signOut = () => {
    setCurrentUser(null);
    setMessages([]);
  };

  const signIn = currentUser => {
    setCurrentUser(currentUser);
    webNotifications.requestPermission();
  };

  const goToEnterAnotherCode = otherUser => {
    setOtherUser(otherUser);
    setShareYourCode(false);
    setEnterAnotherCode(true);
  };

  const goToShareYourCode = otherUser => {
    setOtherUser(otherUser);
    setShareYourCode(true);
    setEnterAnotherCode(false);
  };

  const close = () => {
    window.history.replaceState({}, "", '/' + otherUser);
    setShareYourCode(false);
    setEnterAnotherCode(false);
  };

  if (!currentUser) {
    return <SignIn signedIn={signIn}/>;
  } else if (enterAnotherCode) {
    return <EnterAnotherCode currentUser={currentUser} close={close}/>;
  } else if (shareYourCode) {
    return <ShareYourCode currentUser={currentUser} close={close}/>;
  } else {
    if (messages && messages.length) {
      return <Chat messages={messages}
                   currentUser={currentUser}
                   signOut={signOut}
                   names={names}
                   goToEnterAnotherCode={goToEnterAnotherCode}
                   goToShareYourCode={goToShareYourCode}
                   initMessages={initMessages}/>;
    } else if (initMessages) {
      return <Start
        enterAnotherCode={goToEnterAnotherCode}
        shareYourCode={goToShareYourCode}/>;
    } else {
      return <div className="translucent translucent-center"><p>On my way...</p></div>;
    }
  }
}
