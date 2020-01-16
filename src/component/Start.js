import React from 'react';

export default function Start(props) {

  return (
    <div className="translucent translucent-center text-center">
      <h1>Just</h1>

      <p>To message somebody you need to either enter their code or share your code.</p>
      <p>Be careful who you share your code with. Anybody who has it can message you.</p>

      <div className="margin-top">
        <button onClick={props.shareYourCode} className="form-control">
          Share your code
        </button>
        <button onClick={props.enterAnotherCode} className="form-control">
          Enter another code
        </button>
      </div>
    </div>
  );
}