import React from 'react';
import './App.css';
import SignIn from "./SignIn";
import DataStore from "./dataStore";
import Auth from "./auth";
import EnterAnotherCode from "./EnterAnotherCode";
import ShareYourCode from "./ShareYourCode";
import Start from './Start';
import Chat from "./Chat";

export default class AppComponent extends React.Component {

  state = {
    currentUser: null,
    enterAnotherCode: false,
    shareYourCode: false,
    messages: [],
    initMessages: false,
    loading: true,
  };

  enterAnotherCode = () =>
    this.setState({enterAnotherCode: true, shareYourCode: false});

  shareYourCode = () =>
    this.setState({shareYourCode: true, enterAnotherCode: false});

  onMessageSubscription = null;

  signOut = async () => {
    this.setState({currentUser: null, messages: []});
    this.onMessageSubscription && (await this.onMessageSubscription)();
  };

  signIn = async currentUser => {
    this.setState({currentUser, loading: true});
    this.onMessageSubscription && (await this.onMessageSubscription)();
    this.onMessageSubscription = DataStore.onMessage(this.onMessage);
  };

  onMessage = messages => {
    this.setState(state => {
      let messageBatch = [...state.messages];

      messages.forEach(({message, doc, type}) => {
        if (type === 'added') {
          if (message.to === this.state.currentUser.uid && !message.delivered) {
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

      return {messages: messageBatch, initMessages: true, loading: false};
    });
  };

  render() {
    if (this.state.loading) {
      return <div className="translucent translucent-center"><p>On my way...</p></div>;
    }

    if (!this.state.currentUser) {
      return <SignIn signedIn={currentUser => this.signIn(currentUser)}/>;
    } else if (this.state.enterAnotherCode) {
      return <EnterAnotherCode currentUser={this.state.currentUser}/>;
    } else if (this.state.shareYourCode) {
      return <ShareYourCode currentUser={this.state.currentUser}/>;
    }

    if (this.state.messages && this.state.messages.length) {
      return <Chat messages={this.state.messages}
                   currentUser={this.state.currentUser}
                   signOut={this.signOut}
                   goToEnterAnotherCode={this.enterAnotherCode}
                   goToShareYourCode={this.shareYourCode}
                   initMessages={this.state.initMessages}/>
    }

    return <Start
      enterAnotherCode={this.enterAnotherCode}
      shareYourCode={this.shareYourCode}/>;
  }

  componentDidMount() {
    Auth
      .current()
      .then(currentUser => {
        if (!currentUser) {
          this.setState({loading: false});
          return;
        }
        Notification.requestPermission();
        setTimeout(() => this.setState({loading: false}), 300);
        this.setState(
          {currentUser},
          () => this.onMessageSubscription = DataStore.onMessage(this.onMessage));
      });
  }

  async componentWillUnmount() {
    this.onMessageSubscription && (await this.onMessageSubscription)();
  }
}
