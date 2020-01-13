import React, {useState} from 'react';
import DataStore from './dataStore';

export default function EnterAnotherCode(props) {

  const [anotherCode, setAnotherCode] = useState(
    new URLSearchParams(window.location.search).get("code") || '');
  const [firstMessage, setFirstMessage] = useState('');

  const onSubmit = async e => {
    e.preventDefault();

    if (anotherCode === props.currentUser.uid) {
      alert("This is your own code. Please, get a another person’s code.");
      return;
    }

    await DataStore.sendMessage({
      to: anotherCode,
      from: props.currentUser.uid,
      body: firstMessage,
    });
  };

  return (
    <div className="translucent translucent-center text-center">
      <h1>Just</h1>
      <p>
        Enter the code you have received here
        and introduce yourself in an initial message.
      </p>
      <form onSubmit={onSubmit}>
        <div className="flex">
          <input value={anotherCode}
                 className="form-control text-center"
                 placeholder="The other person’s code"
                 required
                 onChange={e => setAnotherCode(e.target.value)}/>
        </div>
        <div className="flex">
          <input value={firstMessage}
                 className="form-control text-center"
                 required
                 placeholder="Your first message"
                 onChange={e => setFirstMessage(e.target.value)}/>
        </div>
        <button type="submit" className="form-control">
          Submit
        </button>
      </form>
    </div>
  );
}
