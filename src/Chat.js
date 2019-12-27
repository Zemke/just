import React from 'react';
import './App.css';
import DataStore from './dataStore';
import Auth from './auth';

export default class AppComponent extends React.Component {

  state = {field: '', messages: [], chats: []};

  onChange = async val => this.setState({field: val});

  onSubmit = async e => {
    e.preventDefault();
    const payload = {
      chat: this.props.chat.code,
      from: (await Auth.current()).uid,
      to: this.props.chat.name,
      body: this.state.field
    };
    await DataStore.sendMessage(payload);
    this.setState({field: ''});
  };

  deleteChat = async () => {
    if (!window.confirm("The chat will be irreversibly deleted. Are you sure?")) {
      return;
    }
    const currentUserUid = (await Auth.current()).uid;
    const otherUserUid = [this.state.messages[0].from, this.state.messages[0].to]
      .filter(userUid => userUid !== currentUserUid)[0];
    await DataStore.deleteChatWithUser(otherUserUid);
    // todo go to another chat or to start when there's no other chat
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <button onClick={this.deleteChat}>Delete</button>
          <button onClick={this.props.goToCreateChat}>Create</button>
          <select onChange={e => this.props.goToChat(JSON.parse(e.target.value))}>
            <option defaultValue>Select chat</option>
            {this.state.chats.map(chat =>
              <option key={chat.code}
                      value={JSON.stringify(chat)}>
                {chat.name}
              </option>
            )}
          </select>
          <h1>Just</h1>
          <form onSubmit={e => this.onSubmit(e)}>
            <input onChange={e => this.onChange(e.target.value)}
                   value={this.state.field}/>
          </form>

          {this.props.chat.code}

          <ul>
            {this.state.messages
              .sort((c1, c2) => c1 - c2)
              .filter(c => c.chat === this.props.chat.code)
              .map(message =>
                <li key={message.id}>
                  chat: {message.chat}<br/>
                  from: {message.from}<br/> {/*todo map sender and receiver*/}
                  to: {message.to}<br/>
                  body: {message.body}<br/>
                  when: {message.when}
                </li>
              )}
          </ul>
        </header>
      </div>
    );
  }

  componentDidMount() {
    DataStore.onMessage(message => {
      if (DataStore.getDelivereds().indexOf(message.id) === -1) {
        DataStore.addDelivered(message.id);
        new Notification(message.from, {body: message.body});
      }
      this.setState(state => ({messages: [...state.messages, message]}));
    });

    this.setState({chats: DataStore.getChats()});
  }
}
