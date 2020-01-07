import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import './Dropdown.css';

export default function Dropdown(props) {

  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    if (!props.dropdownTrigger) return;

    const outsideClickListener = e =>
      props.dropdownTrigger === e.target
        ? setCollapsed(!collapsed)
        : setCollapsed(true);
    document.addEventListener("click", outsideClickListener);

    return () => document.removeEventListener("click", outsideClickListener);
  });

  return ReactDOM.createPortal(
    (
      <div className={'dropdown' + (collapsed ? ' collapsed' : '') + (props.className ? ' ' + props.className : '')}>
        {props.children}
      </div>
    ),
    document.getElementById('appendToBodyContainer'));
};
