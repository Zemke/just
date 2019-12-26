import React from 'react';
import './App.css';
import uuid from "./uuid";
import DataStore from "./dataStore";

export default class AppComponent extends React.Component {

  state = {uuid: uuid(), anotherPersonsCode: '', nameOfChat: ''};

  onAnotherPersonsCode = e => {
    e.preventDefault();
    const payload = {
      code: this.state.anotherPersonsCode,
      name: this.state.nameOfChat
    };
    DataStore.addChat(payload);
    this.props.goToChat(payload.name);
    // todo validate chat has name
  };

  render() {
    return (
      <>
        <p>
          To chat with somebody you either need to get
          that person’s code or share yours.
        </p>

        <h2>Who do you want to chat with?</h2>
        <form onSubmit={e => this.onAnotherPersonsCode(e)}>

          <input
            placeholder="Name"
            onChange={e => this.setState({nameOfChat: e.target.value})}
            value={this.state.nameOfChat}/>
        </form>
        <p>That’s just so you can identify the chat.</p>

        {this.state.uuid}

        <h2>Your code</h2>
        <p>{this.state.uuid}</p>

        {/* todo generate QR of uuid */}
        {/* todo share and copy button */}

        <h2>Another person’s code</h2>
        <form onSubmit={e => this.onAnotherPersonsCode(e)}>
          <input
            onChange={e => this.setState({anotherPersonsCode: e.target.value})}
            value={this.state.anotherPersonsCode}
            placeholder="Your comrade’s code"/>
          <button type="submit" value="Okay"/>
        </form>

        {/* todo Scan QR with camera */}
      </>
    );
  }
}
