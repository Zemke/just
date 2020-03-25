import React, {useEffect, useRef, useState} from "react";
import Dropdown from "./Dropdown";
import randomString from "../util/randomString";
import 'image-capture';
import Camera from "./Camera";
import Giphy from '../util/giphy';
import './Share.css';
import Peering from '../util/peering';

export default function Share(props) {

  const [dropdownTrigger, setDropdownTrigger] = useState(null);
  const [giphyTrigger, setGiphyTrigger] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [giphys, setGyphies] = useState(null);
  const [giphyTerm, setGiphyTerm] = useState('');

  /** @type {{current: HTMLInputElement}} */ const uploadButton = useRef(null);
  /** @type {{current: HTMLDivElement}} */ const dropdownRef = useRef(null);
  /** @type {{current: HTMLDivElement}} */ const giphyRef = useRef(null);
  /** @type {{current: HTMLInputElement}} */ const giphyTermInputEl = useRef(null);
  /** @type {{current: number}} */ const giphyTermDebouncer = useRef(null);

  const imageGallery = () =>
    uploadButton.current.click();

  const giphy = async () => {
    setGiphyTerm('');
    if (giphyTermInputEl.current) giphyTermInputEl.current.focus();
    setGyphies((await Giphy.getTrending()).data
      .map(d => ({
        url: d.images.fixed_height_small.url,
        title: d.title,
        id: d.id,
      })));
  };

  useEffect(() => {
    const currGiphyTermInputEl = giphyTermInputEl.current;
    if (!currGiphyTermInputEl) return;
    const keyDownListener = e => e.stopPropagation();
    currGiphyTermInputEl.addEventListener('keydown', keyDownListener, false);
    return () => currGiphyTermInputEl.removeEventListener('keydown', keyDownListener, false);
  }, []);

  useEffect(() => {
    if (!giphyTerm) return;
    clearTimeout(giphyTermDebouncer.current);
    giphyTermDebouncer.current = null;
    giphyTermDebouncer.current = setTimeout(async () => {
      const data = (await Giphy.search(giphyTerm)).data;
      setGyphies(data.map(d => ({
        url: d.images.fixed_height_small.url,
        title: d.title,
        id: d.id,
      })));
    }, 400);
  }, [giphyTerm]);

  const onUploadChange = () => {
    if (!uploadButton.current.files.length) return;
    props.onFiles(
      Array
        .from(uploadButton.current.files)
        .map(f => [randomString(), f]));
    uploadButton.current.value = '';
  };

  const onSnap = file => {
    setCameraActive(false);
    props.onFiles([file]);
  };

  useEffect(() => {
    const marginBottom = props.inputFieldHeight + 'px';

    const currDropdownRef = dropdownRef.current;
    if (currDropdownRef) currDropdownRef.style.marginBottom = marginBottom;

    const currGiphyRef = giphyRef.current;
    if (currGiphyRef) currGiphyRef.style.marginBottom = marginBottom;
  }, [props.inputFieldHeight]);

  const onGiphyDropdownToggle = () =>
    setGiphyTerm('');

  return (
    <>
      {cameraActive && <Camera onSnap={onSnap} onClose={() => setCameraActive(false)}/>}
      <div className="share">
        <button ref={ref => setDropdownTrigger(ref)} type="button">&#43;</button>
        <input type="file"
               accept="image/*"
               multiple
               ref={uploadButton}
               onChange={onUploadChange}/>
      </div>
      <Dropdown ref={giphyRef}
                dropdownTrigger={giphyTrigger}
                onToggle={onGiphyDropdownToggle}
                className="attachBottomLeft">
        <div className="giphy">
          <input
            placeholder="Search GIFs…"
            className="form-control giphy-term"
            onChange={e => setGiphyTerm(e.target.value)}
            value={giphyTerm}
            ref={giphyTermInputEl}/>
          <div className="giphy-suggestions">
            {giphys ? (
              giphys.map(d =>
                <input key={d.id} type="image" src={d.url} alt={d.title}
                       onClick={() => props.onGiphyClick(d.id)}/>)
            ) : "Loading…"}
            {giphys && giphys.length === 0 && <p>Nothing found.</p>}
          </div>
        </div>
      </Dropdown>
      <Dropdown ref={dropdownRef}
                dropdownTrigger={dropdownTrigger}
                className="attachBottomLeft text-left">
        <ul>
          <li onClick={imageGallery}>
            <span className="icon" role="img" aria-label="Gallery">🌉</span>
            Gallery
          </li>
          <li onClick={() => setCameraActive(true)}>
            <span className="icon" role="img" aria-label="Camera">📷</span>
            Camera
          </li>
          {Peering.supported && (
            <li onClick={props.onVideoCall}>
              <span className="icon" role="img" aria-label="Video">🎥</span>
              Video Call
            </li>
          )}
          <li onClick={giphy} ref={ref => setGiphyTrigger(ref)}>
            <span className="icon" role="img" aria-label="GIF">🤡</span>
            GIF
          </li>
        </ul>
      </Dropdown>
    </>
  )
}
