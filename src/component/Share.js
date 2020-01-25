import React, {useState} from "react";
import Dropdown from "./Dropdown";

export default function Share() {

  const [dropdownTrigger, setDropdownTrigger] = useState(null);

  const takePhoto = () => {

  };

  const imageGallery = () => {

  };

  return (
    <>
      <div className="share">
        <button ref={ref => setDropdownTrigger(ref)}>&#43;</button>
        <input type="file" accept="image/x-png,image/jpeg,image/gif" className="share"/>
      </div>
      <Dropdown dropdownTrigger={dropdownTrigger} className="attachBottomLeft text-left">
        <ul>
          <li onClick={takePhoto}>
            📷 Take photo
          </li>
          <li onClick={imageGallery}>
            🌉 Image gallery
          </li>
        </ul>
      </Dropdown>
    </>
  )
}