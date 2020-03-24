import DataStore from "./dataStore";
import Peer from "simple-peer";
import Auth from './auth';

let videoCallRequestSent = false;

// todo maybe that should be listened to from the service worker
//  using firebase cloud messaging

const api = {};

api.listenToCallRequests = (onStreamCb, onCallCb) => {
  return DataStore.onVideoCallRequest(async ({req, doc}) => {
    let otherUserHungUpResolver;
    let otherUserHungUp = false;
    let signaled = false;
    const hungUpPromise = new Promise((resolve, _) => {
      otherUserHungUpResolver = () => {
        resolve();
        otherUserHungUp = true;
      }
    });
    doc.ref.onSnapshot(snapshot =>
      !snapshot.exists && !signaled && otherUserHungUpResolver());
    const stream = await onCallCb(req.from, hungUpPromise, () => calleePeer.destroy());
    if (otherUserHungUp) return;
    if (!stream) {
      doc.ref.update({accept: false});
      return;
    }
    signaled = true;
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
        doc.ref.delete(); // todo maybe it's enough to let the caller do this
      });
  });
};


api.requestCall = (callee, stream) => new Promise((resolve, reject) => {
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
        });
    });
    callerPeer.on('error', console.error);
  });
  // todo make sure deleted is called when something goes wrong
  //  maybe in callerPeer.on('error')
});
api.supported = Peer.WEBRTC_SUPPORT;

export default api;
