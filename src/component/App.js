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

export default function App() {

  const [currentUser, setCurrentUser] = useState(null);
  const [enterAnotherCode, setEnterAnotherCode] = useState(window.location.pathname === '/enter-code');
  const [shareYourCode, setShareYourCode] = useState(window.location.pathname === '/share-code');
  const [messages, setMessages] = useState([]);
  const [initMessages, setInitMessages] = useState(false);
  const [loading, setLoading] = useState(true);
  const [names, setNames] = useState(null);

  useEffect(() => {
    Auth
      .current()
      .then(currentUser => {
        if (!currentUser) {
          setLoading(false);
          return;
        }
        webNotifications.requestPermission();
        setTimeout(() => setLoading(false), 300);
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
        setLoading(false);

        return [...accumulation];
      });
    });

    return async () => {
      (await onMessageSubscription)();
    };
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
    setLoading(true);
    webNotifications.requestPermission();
  };

  const goToEnterAnotherCode = () => {
    setShareYourCode(false);
    setEnterAnotherCode(true);
  };

  const goToShareYourCode = () => {
    setShareYourCode(true);
    setEnterAnotherCode(false);
  };

  if (loading) {
    return <div className="translucent translucent-center"><p>On my way...</p></div>;
  } else if (!currentUser) {
    return <SignIn signedIn={signIn}/>;
  } else if (enterAnotherCode) {
    return <EnterAnotherCode currentUser={currentUser}/>;
  } else if (shareYourCode) {
    return <ShareYourCode currentUser={currentUser}/>;
  } else if (messages && messages.length) {
    return <Chat messages={messages}
                 currentUser={currentUser}
                 signOut={signOut}
                 names={names}
                 goToEnterAnotherCode={goToEnterAnotherCode}
                 goToShareYourCode={goToShareYourCode}
                 initMessages={initMessages}/>
  } else {
    return <Start
      enterAnotherCode={goToEnterAnotherCode}
      shareYourCode={goToShareYourCode}/>;
  }
}
