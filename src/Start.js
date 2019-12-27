import React from 'react';

export default class StartComponent extends React.Component {

  render() {
    return (<>
      <h1>Just</h1>

      The messenger to message people.

      <button onClick={this.props.shareYourCode}>
        Share your code
      </button>

      <button onClick={this.props.enterAnotherCode}>
        Enter another code
      </button>
    </>);
  }
}