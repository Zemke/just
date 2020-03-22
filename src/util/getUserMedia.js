export default async () =>
  navigator.mediaDevices.getUserMedia({video: true, audio: true});
