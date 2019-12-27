import React from 'react';

export default class ShareYourCode extends React.Component {

  render() {
    return (<>
      {this.props.currentUser.uid}
      {/* todo generate QR code */}
    </>);
  }
}