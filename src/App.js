import React, {useEffect, useRef, useState} from 'react';
import './App.css';
import SignIn from "./SignIn";
import DataStore from "./dataStore";
import Auth from "./auth";
import EnterAnotherCode from "./EnterAnotherCode";
import ShareYourCode from "./ShareYourCode";
import Start from './Start';
import Chat from "./Chat";

export default function App() {

  const onMessageSubscription = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [enterAnotherCode, setEnterAnotherCode] = useState(window.location.pathname === '/enter-code');
  const [shareYourCode, setShareYourCode] = useState(window.location.pathname === '/share-code');
  const [messages, setMessages] = useState([]);
  const [initMessages, setInitMessages] = useState(false);
  const [loading, setLoading] = useState(true);

  const unsubscribe = async () => {
    onMessageSubscription.current && (await onMessageSubscription.current)();
    onMessageSubscription.current = null;
  };

  useEffect(() => {
    Auth
      .current()
      .then(currentUser => {
        if (!currentUser) {
          setLoading(false);
          return;
        }
        Notification.requestPermission();
        setTimeout(() => setLoading(false), 300);
        setCurrentUser(currentUser);
      });

    return unsubscribe;
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
    (async () => {
      if (!currentUser) return;
      await unsubscribe();
      onMessageSubscription.current = DataStore.onMessage(onMessage);
    })();
  }, [currentUser]);

  const signOut = async () => {
    setCurrentUser(null);
    setMessages([]);
    await unsubscribe();
  };

  const signIn = async currentUser => {
    setCurrentUser(currentUser);
    setLoading(true);
    await unsubscribe();
  };

  const onMessage = messages => {
    let messageBatch = [...messages];

    messages.forEach(({message, doc, type}) => {
      if (type === 'added') {
        if (message.to === currentUser.uid && !message.delivered) {
          DataStore.setDelivered(doc.ref);
          new Notification(message.from, {body: message.body});
        }
        messageBatch.push(message);
      } else if (type === 'removed') {
        messageBatch = messageBatch.filter(m => m.id === doc.id);
      } else if (type === 'modified') {
        messageBatch
          .map(m => {
            if (m.id !== message.id) return m;
            return message;
          });
      }
    });

    setMessages(messageBatch);
    setInitMessages(true);
    setLoading(false);
  };

  if (loading) {
    return <div className="translucent translucent-center"><p>On my way...</p></div>;
  }

  if (!currentUser) {
    return <SignIn signedIn={currentUser => signIn(currentUser)}/>;
  } else if (enterAnotherCode) {
    return <EnterAnotherCode currentUser={currentUser}/>;
  } else if (shareYourCode) {
    return <ShareYourCode currentUser={currentUser}/>;
  }

  if (messages && messages.length) {
    return <Chat messages={messages}
                 currentUser={currentUser}
                 signOut={signOut}
                 goToEnterAnotherCode={enterAnotherCode}
                 goToShareYourCode={shareYourCode}
                 initMessages={initMessages}/>
  }

  return <Start
    enterAnotherCode={() => {
      setShareYourCode(false);
      setEnterAnotherCode(true);
    }}
    shareYourCode={() => {
      setShareYourCode(true);
      setEnterAnotherCode(false);
    }}/>;
}
