import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useRef} from 'react';
import './ContentEditable.css';

function ContentEditable(props, ref) {

  /** @type {{current: HTMLDivElement}} */ const elem = useRef(null);

  useImperativeHandle(ref, () => elem.current);

  const isMobileJustDevice = useRef(null);

  const initialElemHeight = useRef(null);

  const {onChange: propsOnChange} = props;
  const {files: propsFiles} = props;

  const onInput = useCallback(() => {
    elem.current.value = Array.from(elem.current.childNodes)
      .map(n => {
        if (n.nodeType === Node.TEXT_NODE) {
          return n.textContent;
        } else if (n.tagName === 'BR') {
          return '\n';
        } else if (n.tagName === 'IMG') {
          return propsFiles.find(f => f[0] === n.dataset['file']);
        } else {
          return null;
        }
      })
      .filter(n => n != null)
      .reduce((acc, curr) => {
        if (!acc.length) {
          acc.push(curr);
          return acc;
        }

        if (typeof acc[acc.length - 1] === 'string'
          && typeof curr === 'string') {
          acc[acc.length - 1] = acc[acc.length - 1] + curr;
        } else {
          acc.push(curr);
        }

        return acc;
      }, []);

    propsOnChange(elem.current.value);
  }, [propsOnChange, propsFiles]);


  useEffect(() => {
    (async () => isMobileJustDevice.current = await window.isMobileJustDevice)();
  }, []);

  useEffect(() => {
    if (elem.current && props.value !== elem.current.value) {
      if (props.value[0]) {
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
    if (!('ResizeObserver' in window)) return;
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

    if (!props.files.length) {
      elemRef.querySelectorAll('img').forEach(img => img.remove());
      return;
    }

    let count = 0;
    props.files.forEach(file => {
      const fileReader = new FileReader();
      fileReader.onload = e => {
        elemRef.classList.remove('placeholder');
        if (elemRef.textContent === props.placeholder) {
          elemRef.textContent = '';
        }
        const imgEl = document.createElement('img');
        imgEl.src = e.target.result;
        imgEl.dataset['file'] = file[0];
        elemRef.appendChild(imgEl);
        count++;
        props.files.length === count && onInput();
      };
      fileReader.readAsDataURL(file[1]);
    });
  }, [props.placeholder, props.files, onInput]);

  const onKeydown = e => {
    if (e.key === 'Enter' && (isMobileJustDevice.current)) {
      document.execCommand('insertHTML', false, '<br><br>');
      e.preventDefault();
      return false;
    } else if (e.key === 'Enter' && !e.shiftKey && !(isMobileJustDevice.current)) {
      e.preventDefault();
      e.target.closest('form').dispatchEvent(new Event('submit'));
    }
  };

  const onPaste = e => {
    e.preventDefault();
    const data = e.clipboardData.getData('text/plain')
      .replace(/\n/g, '<br/>')
      .replace(/ /g, '&nbsp;');
    document.execCommand(
      "insertHTML", false, data);
  };

  const onFocus = e => {
    if (!elem.current) return;
    if (e.target.value || props.files.length) return;
    elem.current.classList.remove('placeholder');
    e.target.textContent = '';
  };

  const onBlur = e => {
    if (!elem.current) return;
    if (e.target.value || props.files.length) return;
    elem.current.classList.add('placeholder');
    e.target.textContent = props.placeholder;
  };

  return <div contentEditable tabIndex="0" ref={elem}
              onFocus={onFocus} onBlur={onBlur} onInput={onInput}
              onKeyDown={onKeydown} onPaste={onPaste}/>;
}

export default forwardRef(ContentEditable);