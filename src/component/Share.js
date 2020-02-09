import React, {useEffect, useRef, useState} from "react";
import Dropdown from "./Dropdown";
import randomString from "../util/randomString";
import 'image-capture';
import Camera from "./Camera";

export default function Share(props) {

  const [dropdownTrigger, setDropdownTrigger] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

  /** @type {{current: HTMLInputElement}} */ const uploadButton = useRef(null);
  /** @type {{current: HTMLDivElement}} */ const dropdownRef = useRef(null);

  const imageGallery = () =>
    uploadButton.current.click();

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
    const currDropdownRef = dropdownRef.current;
    if (!currDropdownRef) return;
    currDropdownRef.style.marginBottom = props.inputFieldHeight + 'px';
  }, [props.inputFieldHeight]);

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
        </ul>
      </Dropdown>
    </>
  )
}