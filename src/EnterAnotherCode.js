import React, {useState} from 'react';
import DataStore from './dataStore';

export default function EnterAnotherCode(props) {

  const [anotherCode, setAnotherCode] = useState('');
  const [firstMessage, setFirstMessage] = useState('');

  const onSubmit = async e => {
    e.preventDefault();
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
        <input value={anotherCode}
               className="form-control text-center"
               placeholder="The other person’s code"
               onChange={e => setAnotherCode(e.target.value)}/>
        <input value={firstMessage}
               className="form-control text-center"
               placeholder="Your first message"
               onChange={e => setFirstMessage(e.target.value)}/>
        <button type="submit" className="form-control">
          Submit
        </button>
      </form>
    </div>
  );
}
