export default async (constraints = {video: true, audio: true}) =>
  navigator.mediaDevices.getUserMedia(constraints);
