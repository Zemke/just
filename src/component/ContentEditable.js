import React, {forwardRef, useEffect, useImperativeHandle, useRef} from 'react';
import './ContentEditable.css';

function ContentEditable(props, ref) {

  /** @type {{current: HTMLDivElement}} */ const elem = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => elem.current.focus()
  }));

  const initialElemHeight = useRef(null);

  useEffect(() => {
    if (!elem.current) return;
    const elemRef = elem.current;
    const enterKeyDownListener = e => {
      if (e.key !== 'Enter' || e.shiftKey) return;
      e.preventDefault();
      e.target.closest('form').dispatchEvent(new Event('submit'));
    };
    elemRef.addEventListener('keydown', enterKeyDownListener);
    return () => elemRef.removeEventListener('keydown', enterKeyDownListener);
  }, []);

  useEffect(() => {
    if (elem.current && props.value !== elem.current.value) {
      if (props.value) {
        elem.current.textContent = props.value;
        elem.current.value = props.value;
        elem.current.classList.remove('placeholder');
      } else {
        elem.current.value = '';
        if (document.activeElement !== elem.current) {
          elem.current.textContent = props.placeholder;
          elem.current.classList.add('placeholder');
        } else {
          elem.current.textContent = elem.current.value;
        }
      }
    }
  }, [props.value, props.placeholder]);

  useEffect(() => {
    if (!elem.current) return;
    const elemRef = elem.current;
    const inputListener = e => {
      e.target.value = Array.from(e.target.childNodes)
        .map(n => {
          if (n.nodeType === Node.TEXT_NODE) {
            return n.textContent;
          } else if (n.tagName === 'BR') {
            return '\n';
          } else {
            return null;
          }
        })
        .filter(n => n != null)
        .join('');
      props.onChange(e);
    };
    elemRef.addEventListener('input', inputListener);
    return () => elemRef.removeEventListener('input', inputListener);
  }, [props, props.onChange]);

  useEffect(() => {
    if (!elem.current) return;
    const elemRef = elem.current;
    const pasteListener = e => {
      e.preventDefault();
      const data = e.clipboardData.getData('text/plain')
        .replace(/\n/g, '<br/>')
        .replace(/ /g, '&nbsp;');
      document.execCommand(
        "insertHTML", false, data);
    };
    elemRef.addEventListener('paste', pasteListener, false);
    return () => elemRef.removeEventListener('paste', pasteListener, false);
  });

  useEffect(() => {
    if (!elem.current || !props.onResize) return;
    const resizeObserver = new ResizeObserver(entries => {
      if (!initialElemHeight.current) {
        initialElemHeight.current = entries[0].contentRect.height;
        return;
      }
      props.onResize(entries[0].contentRect.height - initialElemHeight.current);
    });
    resizeObserver.observe(elem.current);
    return () => resizeObserver.disconnect();
  }, [props, props.onResize]);

  useEffect(() => {
    if (!elem.current) return;
    const elemRef = elem.current;
    const focusListener = e => {
      if (e.target.value) return;
      elem.current.classList.remove('placeholder');
      e.target.textContent = '';
    };
    const blurListener = e => {
      if (e.target.value) return;
      elem.current.classList.add('placeholder');
      e.target.textContent = props.placeholder;
    };
    elemRef.addEventListener('focus', focusListener);
    elemRef.addEventListener('blur', blurListener);
    return () => {
      elemRef.removeEventListener('focus', focusListener);
      elemRef.removeEventListener('blur', blurListener);
    };
  }, [props.placeholder]);

  return <div contentEditable ref={elem}/>;
}

export default forwardRef(ContentEditable);