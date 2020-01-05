import React from 'react';
import './Chat.css';
import DataStore from './dataStore';
import otherUser from "./otherUser";
import Auth from "./auth";
import ChatMenu from "./ChatMenu";

export default class AppComponent extends React.Component {

  state = {
    field: '',
    otherUser: otherUser(
      this.props.currentUser.uid,
      this.props.messages
        .sort((c1, c2) => c1 - c2))
  };

  onChange = async val => this.setState({field: val});

  onSubmit = async e => {
    e.preventDefault();
    const payload = {
      from: this.props.currentUser.uid,
      to: this.state.otherUser,
      body: this.state.field
    };
    await DataStore.sendMessage(payload);
    this.setState({field: ''});
  };

  deleteChat = async () => {
    if (!window.confirm("The chat will be irreversibly deleted. Are you sure?")) {
      return;
    }
    await DataStore.deleteChatWithUser(this.state.otherUser);
  };

  signOut = () =>
    Auth
      .signOut()
      .then(() => this.props.signOut());

  render() {
    const otherUsers = this.props.messages
      .reduce((acc, m) => {
        const otherUser1 = otherUser(this.props.currentUser.uid, [m]);
        if (otherUser1 === this.state.otherUser) return acc;
        if (acc.indexOf(otherUser1) === -1) acc.push(otherUser1);
        return acc;
      }, []);

    return (
      <div className="chat">
        <div className="head">
          <ChatMenu/>
          <div className="changeChat"> {/* todo chat names */}
            <select onChange={e => this.setState({otherUser: e.target.value})}>
              <option defaultValue value={this.state.otherUser}>
                {this.state.otherUser}
              </option>
              {otherUsers.map(oU => <option key={oU} value={oU}>{oU}</option>)}
            </select>
          </div>
          <div className="menu">
            <button onClick={this.signOut}>Sign out</button>
            <button onClick={this.deleteChat}>Delete</button>
            <button onClick={this.props.goToShareYourCode}>Share your code</button>
            <button onClick={this.props.goToEnterAnotherCode}>Enter another code</button>
          </div>
        </div>
        <div className="body">
          {this.props.messages
            .filter(m =>
              otherUser(this.props.currentUser.uid, [m]) === this.state.otherUser)
            .sort((c1, c2) => c1.when - c2.when)
            .map(message =>
              <div key={message.id} className="message-wrapper">
                <div className={"message " + (this.state.otherUser === message.from ? "from" : "to")}>
                  <div className="overlay"/>
                  <p>{message.body}</p>
                </div>
              </div>
            )}
        </div>
        <div className="foot">
          <form onSubmit={e => this.onSubmit(e)}>
            <input onChange={e => this.onChange(e.target.value)}
                   placeholder="Type here"
                   value={this.state.field}/>
          </form>
        </div>
      </div>
    );
  }
}
