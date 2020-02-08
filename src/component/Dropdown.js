import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import './Dropdown.css';

function Dropdown(props, ref) {

  const elem = useRef(null);
  const [collapsed, setCollapsed] = useState(true);

  useImperativeHandle(ref, () => elem.current);

  useEffect(() => {
    if (!props.dropdownTrigger) return;

    const outsideClickListener = e =>
      props.dropdownTrigger === e.target
        ? setCollapsed(curr => !curr)
        : setCollapsed(true);
    document.addEventListener("click", outsideClickListener);

    return () => document.removeEventListener("click", outsideClickListener);
  }, [props.dropdownTrigger]);

  return ReactDOM.createPortal(
    (
      <div ref={elem}
           className={'dropdown' + (collapsed ? ' collapsed' : '') + (props.className ? ' ' + props.className : '')}>
        {props.children}
      </div>
    ),
    document.getElementById('appendToBodyContainer'));
};

export default forwardRef(Dropdown);