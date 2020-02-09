import React, {useEffect, useRef} from 'react';
import ReactDOM from "react-dom";
import './Overlay.css';

export default function Overlay(props) {

  /** @type {{current: HTMLDivElement}} */ const elem = useRef(null);

  useEffect(() => {
    const currElem = elem.current;
    if (!currElem) return;
    requestAnimationFrame(() => currElem.classList.add('blur'))
  }, []);

  return ReactDOM.createPortal(
    <div id="overlay" ref={elem}>{props.children}</div>,
    document.getElementById('appendToBodyContainer'));
};
