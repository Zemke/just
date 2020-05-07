import DataStore from "./dataStore";
import Peer from "simple-peer";
import Auth from './auth';

let videoCallRequestSent = false;

const api = {};

api.listenToCallRequests = (onStreamCb, onCallCb) => {
  return DataStore.onVideoCallRequest(async ({req, doc}) => {
    let otherUserHungUpResolver;
    let otherUserHungUp = false;
    const hungUpPromise = new Promise((resolve, _) => {
      otherUserHungUpResolver = () => {
        resolve();
        otherUserHungUp = true;
      }
    });
    doc.ref.onSnapshot(snapshot =>
      !snapshot.exists && otherUserHungUpResolver());
    const stream = await onCallCb(req.from, hungUpPromise, () => calleePeer.destroy());
    if (otherUserHungUp) return;
    if (!stream) {
      doc.ref.update({accept: false});
      return;
    }
    const calleePeer = new Peer({stream});
    calleePeer.signal(JSON.parse(req.signalingFrom));
    calleePeer.on(
      'signal',
      data => doc.ref.update({accept: true, signalingTo: JSON.stringify(data)}));
    calleePeer.on('stream', onStreamCb);
    calleePeer.on('error', console.error);
    calleePeer.on(
      'close',
      () => {
        stream && stream.getTracks().forEach(t => t.stop());
        doc.ref.delete();
      });
  });
};


api.requestCall = (callee, stream, onClose) => new Promise((resolve, reject) => {
  let callTimeout;
  const callerPeer = new Peer({initiator: true, stream});
  callerPeer.on('signal', async data => {
    if (videoCallRequestSent) return;
    videoCallRequestSent = true;
    (await DataStore.sendVideoCallRequest({
      from: (await Auth.current()).uid,
      to: callee,
      signalingFrom: JSON.stringify(data)
    })).onSnapshot(snapshot => {
      if (!snapshot.exists) callerPeer.destroy();
      if (!callTimeout) {
        callTimeout = setTimeout(() => {
          callerPeer.destroy();
          reject('timeout');
        }, 8000);
      }
      const snapshotData = snapshot.data();
      if (snapshotData && snapshotData.signalingTo) {
        callerPeer.signal(JSON.parse(snapshotData.signalingTo));
        callerPeer.on('stream', stream => {
          clearTimeout(callTimeout);
          resolve({stream, hangUpCb: () => callerPeer.destroy()});
        });
      } else if (snapshotData && snapshotData.accept === false) {
        clearTimeout(callTimeout);
        callerPeer.destroy();
        reject('rejected');
      }
      callerPeer.on(
        'close',
        () => {
          stream && stream.getTracks().forEach(t => t.stop());
          snapshot.ref.delete();
          videoCallRequestSent = false;
          onClose();
        });
    });
    callerPeer.on('error', console.error);
  });
});

api.supported = Peer.WEBRTC_SUPPORT;

export default api;
