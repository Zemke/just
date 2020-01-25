import React, {useRef, useState} from "react";
import Dropdown from "./Dropdown";

export default function Share(props) {

  const [dropdownTrigger, setDropdownTrigger] = useState(null);
  /** @type {{current: HTMLInputElement}} */ const uploadButton = useRef(null);

  const takePhoto = () => {
    alert('todo');
  };

  const imageGallery = () =>
    uploadButton.current.click();

  const onUploadChange = () => {
    if (!uploadButton.current.files.length) return;
    props.onFiles(uploadButton.current.files);
  };

  return (
    <>
      <div className="share">
        <button ref={ref => setDropdownTrigger(ref)}>&#43;</button>
        <input type="file"
               accept="image/x-png,image/jpeg,image/gif"
               multiple
               ref={uploadButton}
               onChange={onUploadChange}/>
      </div>
      <Dropdown dropdownTrigger={dropdownTrigger} className="attachBottomLeft text-left">
        <ul>
          <li onClick={imageGallery}>
            <span className="icon">🌉</span> Gallery
          </li>
          <li onClick={takePhoto}>
            <span className="icon">📷</span> Camera
          </li>
        </ul>
      </Dropdown>
    </>
  )
}