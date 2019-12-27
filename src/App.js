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
    messages: []
  };

  enterAnotherCode = () =>
    this.setState({enterAnotherCode: true, shareYourCode: false});

  shareYourCode = () =>
    this.setState({shareYourCode: true, enterAnotherCode: false});

  onMessage = (message, doc, type) => {
    if (type === 'added') {
      if (message.to === this.state.currentUser.uid && !message.delivered) {
        DataStore.setDelivered(doc.ref);
        new Notification(message.from, {body: message.body});
      }
      this.setState(state => ({messages: [...state.messages, message]}));
    } else if (type === 'removed') {
      this.setState({
        messages: this.state.messages
          .filter(m => m.id === doc.id)
      });
    } else if (type === 'modified') {
      this.setState({
        messages: this.state.messages
          .map(m => {
            if (m.id !== message.id) return m;
            return message;
          })
      });
    }
  };

  render() {
    if (!this.state.currentUser) {
      return <SignIn/>
    } else if (this.state.enterAnotherCode) {
      return <EnterAnotherCode currentUser={this.state.currentUser}/>
    } else if (this.state.shareYourCode) {
      return <ShareYourCode currentUser={this.state.currentUser}/>
    }

    if (this.state.messages && this.state.messages.length) {
      return <Chat messages={this.state.messages}
                   currentUser={this.state.currentUser}
                   goToEnterAnotherCode={this.enterAnotherCode}
                   goToShareYourCode={this.shareYourCode}/>
    }

    return <Start
      enterAnotherCode={this.enterAnotherCode}
      shareYourCode={this.shareYourCode}/>;
  }

  componentDidMount() {
    Auth
      .current()
      .then(currentUser => {
        if (!currentUser) return;
        Notification.requestPermission();
        this.setState(
          {currentUser},
          () => DataStore.onMessage(this.onMessage));
      });
  }
}
