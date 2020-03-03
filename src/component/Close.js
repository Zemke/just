import React from 'react';
import "./Close.css";

export default function Close({close}) {
  return (<button onClick={close} className="close"/>);
};
