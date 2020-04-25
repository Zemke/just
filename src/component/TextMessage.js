import React, {Fragment, useCallback, useEffect, useRef, useState} from "react";
import Linkify from "react-linkify"
import "./TextMessage.css";

const LinkifyWrapper = React.memo(props => {
  /** @type {{current: HTMLAnchorElement}} */ const elem = useRef(null);

  const emitEvent = detail =>
    elem.current
      .closest('[data-text-message]')
      .dispatchEvent(new CustomEvent('linkified', {detail}));

  const fetchPreview = useCallback(() => {
    if (new URL(props.href).pathname.match(/\.(jpe?g|png|gif|$)/)) {
      emitEvent({img: props.href, guteUrl: false});
    } else {
      fetch(`https://guteurls.de/api/?u=${props.href}&r=https://just.zemke.io/&e=florian@zemke.io&t=json`)
        .then(response => response.json())
        .then(json => emitEvent({...json, guteUrl: true}));
    }
  }, [props.href]);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  return <a ref={elem} {...props}/>
});

export default React.memo(({body}) => {

  const parentElem = useRef(null);

  const [previews, setPreviews] = useState([]);
  const [listening, setListening] = useState(false);

  const isOnlyEmoji = message =>
    !!message && !message
      .replace(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g, '')
      .replace(/[^\x00-\x7F]/g, "")
      .length;

  const processMessageForBlockCode = message => {
    return message
      .split('```')
      .map((curr, idx) => {
        return idx % 2 !== 1
          ? (<span key={idx}>{processMessageForInlineCode(curr)}</span>)
          : (<pre key={idx}>{curr}</pre>);
      });
  };

  const processMessageForInlineCode = message => {
    return message
      .split('`')
      .map((curr, idx) => {
        const lineFeedConverted = curr.split('\n')
          .map((m, idx, arr) => (
            <Fragment key={idx}>
              {m}{(idx + 1 !== arr.length) && <br/>}
            </Fragment>
          ));
        return idx % 2 !== 1
          ? (<span key={idx}>{lineFeedConverted}</span>)
          : (<code key={idx}>{curr}</code>);
      });
  };

  useEffect(() => {
    const linkifiedListener = ({detail}) => setPreviews(curr => [...curr, detail]);
    const currParentElem = parentElem.current;
    currParentElem.addEventListener('linkified', linkifiedListener);
    setListening(true);
    return () => currParentElem.removeEventListener('linkified', linkifiedListener)
  }, []);

  return (
    <>
      <div className={'textMessage' + (isOnlyEmoji(body.trim()) ? ' onlyEmoji' : '')}
           ref={parentElem} data-text-message>
        {listening && (
          <Linkify properties={{target: '_blank'}} component={LinkifyWrapper}>
            {processMessageForBlockCode(body)}
          </Linkify>
        )}
      </div>
      <div className="previews">
        {previews.map((preview, idx) => (
          <div key={idx}
               className={'preview' + (Object.keys(preview).length === 2 ? ' full' : '')}>
            <a href={preview.url} target="_blank">
              <h1>
                {preview.favicon && <img src={preview.favicon} alt="Favicon"/>}
                <span dangerouslySetInnerHTML={{__html: preview.title}}/>
              </h1>
              {preview.img && (
                <img src={preview.img}
                     className="previewImage"
                     alt="Preview image"/>
              )}
              <p dangerouslySetInnerHTML={{__html: preview.description}}/>
            </a>
          </div>
        ))}
        {!!previews.find(p => !!p.guteUrl) && (
          <div className="attribution preview">
            Powered by <a href="https://guteurls.de/">URL Preview Service</a>
          </div>
        )}
      </div>
    </>
  )
});

