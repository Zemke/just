import React, {useEffect, useState} from 'react';
import './App.css';
import SignIn from "./SignIn";
import DataStore from "./dataStore";
import Auth from "./auth";
import EnterAnotherCode from "./EnterAnotherCode";
import ShareYourCode from "./ShareYourCode";
import Start from './Start';
import Chat from "./Chat";
import MessageUtils from "./messageUtils";
import webNotifications from './webNotification';

export default function App() {

  const [currentUser, setCurrentUser] = useState(null);
  const [enterAnotherCode, setEnterAnotherCode] = useState(window.location.pathname === '/enter-code');
  const [shareYourCode, setShareYourCode] = useState(window.location.pathname === '/share-code');
  const [messages, setMessages] = useState([]);
  const [initMessages, setInitMessages] = useState(false);
  const [loading, setLoading] = useState(true);

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
    } else {
      window.history.pushState({}, "", '/' + window.location.search);
    }
  }, [enterAnotherCode, shareYourCode]);

  useEffect(() => {
    if (!currentUser) return;

    const subscription = DataStore.onMessage(messages => {
      messages.forEach(({message, doc, type}) => {
        if (type === 'added') {
          if (message.to === currentUser.uid && !message.delivered) {
            DataStore.setDelivered(doc.ref);
            webNotifications.notify(message.from, {body: message.body});
          }
          setMessages(curr => [...curr, message]);
        } else if (type === 'removed') {
          setMessages(curr => [...curr.filter(m => m.id !== doc.id)]);
        } else if (type === 'modified') {
          setMessages(curr => [...curr.map(m => {
            if (m.id !== message.id) return m;
            return message;
          })]);
        }
      });

      setInitMessages(true);
      setLoading(false);
    });
    return async () => {
      (await subscription)();
    };
  }, [currentUser]);

  useEffect(() => {
    if (!shareYourCode && !enterAnotherCode) return;

    const newestMessage = MessageUtils.getNewestMessage(messages);
    if (!newestMessage) return;

    const conversation = messages
      .filter(MessageUtils.containsExactlyUsers(newestMessage.users));

    if (conversation.length === 1) {
      setEnterAnotherCode(false);
      setShareYourCode(false);
    }
  }, [enterAnotherCode, shareYourCode, messages]);

  const signOut = () => {
    setCurrentUser(null);
    setMessages([]);
  };

  const signIn = currentUser => {
    setCurrentUser(currentUser);
    setLoading(true);
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
                 goToEnterAnotherCode={goToEnterAnotherCode}
                 goToShareYourCode={goToShareYourCode}
                 initMessages={initMessages}/>
  } else {
    return <Start
      enterAnotherCode={goToEnterAnotherCode}
      shareYourCode={goToShareYourCode}/>;
  }
}
