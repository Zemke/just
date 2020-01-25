import React from "react";

export default function PictureUpload() {

  return (
    <div className="pictureUpload">
      <button>&#43;</button>
      <input type="file" accept="image/x-png,image/jpeg,image/gif" className="pictureUpload" />
    </div>
  )
}