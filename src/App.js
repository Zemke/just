import React from 'react';
import './App.css';
import Create from "./Create";
import Chat from "./Chat";
import DataStore from "./dataStore";

export default class AppComponent extends React.Component {

  state = {chat: null};

  goToChat = chat => this.setState({chat});

  render() {
    if (this.state.chat != null) {
      return <Chat chat={this.state.chat}/>;
    }

    return <Create goToChat={id => this.goToChat(id)}/>;
  }

  componentDidMount() {
    if (this.state.chat != null) return;
    const allChats = DataStore.getChats();
    if (allChats != null && allChats.length) {
      this.setState({chats: allChats[0]});
    }
  }
}
