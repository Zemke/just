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
    <form onSubmit={onSubmit}>
      <input value={anotherCode}
             placeholder="The other person’s code"
             onChange={e => setAnotherCode(e.target.value)}/>
      <input value={firstMessage}
             placeholder="Your first message"
             onChange={e => setFirstMessage(e.target.value)}/>
      <button type="submit">Submit</button>
    </form>
  );
}
