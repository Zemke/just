import React from "react";

export default function Share() {

  return (
    <div className="share">
      <button>&#43;</button>
      <input type="file" accept="image/x-png,image/jpeg,image/gif" className="share" />
    </div>
  )
}