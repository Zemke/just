import React from 'react';
import './ChatMenu.css';

export default class ChatMenu extends React.Component {

  render() {
    return (<>
      <div className="hamburger">
        <div className="dot1"/>
        <div className="dot2"/>
        <div className="dot3"/>
      </div>
    </>);
  }
};