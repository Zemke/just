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

  const close = () =>
    props.onClose && props.onClose();

  useEffect(() => {
    const currElem = elem.current;
    if (!currElem) return;
    const keyDownListener = e => {
      e.preventDefault();
      e.key === 'Escape' && close();
    };
    document.addEventListener('keydown', keyDownListener);
    return () => document.removeEventListener('keydown', keyDownListener)
  }, [props]);

  useEffect(() => {
    const currElem = elem.current;
    if (!currElem) return;
    const touchMoveListener = e => {
      e.preventDefault();
      close();
    };
    document.addEventListener('touchmove', touchMoveListener);
    return () => document.removeEventListener('touchmove', touchMoveListener)
  }, [props]);

  useEffect(() => {
    if (!props.onClose) return;
    const outsideClickListener =
      e => e.target.id === 'overlay' && close();
    document
      .getElementById('overlay')
      .addEventListener('click', outsideClickListener);
    return () => document
      .getElementById('overlay')
      .removeEventListener('click', outsideClickListener)
  });

  useEffect(() => {
    elem.current && elem.current.focus();
  }, []);

  return ReactDOM.createPortal(
    <div id="overlay" ref={elem}>{props.children}</div>,
    document.getElementById('appendToBodyContainer'));
};
