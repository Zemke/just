import DataStore from "./dataStore";
import Peer from "simple-peer";
import Auth from './auth';

let videoCallRequestSent = false;
let callerPeer;

// todo maybe that should be listened to from the service worker
//  using firebase cloud messaging

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
    doc.ref.onSnapshot(snapshot => !snapshot.exists && otherUserHungUpResolver());
    const stream = await onCallCb(req.from, hungUpPromise);
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
  });
};


api.requestCall = (callee, stream) => new Promise((resolve, reject) => {
  callerPeer = new Peer({initiator: true, stream});
  callerPeer.on('signal', async data => {
    if (videoCallRequestSent) return;
    videoCallRequestSent = true;
    (await DataStore.sendVideoCallRequest({
      from: (await Auth.current()).uid,
      to: callee,
      signalingFrom: JSON.stringify(data)
    })).onSnapshot(snapshot => {
      const callTimeout = setTimeout(() => {
        snapshot.ref.delete();
        callerPeer.destroy();
        reject('timeout');
      }, 8000);
      const snapshotData = snapshot.data();
      if (snapshotData && snapshotData.signalingTo) {
        callerPeer.signal(JSON.parse(snapshotData.signalingTo));
        callerPeer.on('stream', stream => {
          snapshot.ref.delete();
          clearTimeout(callTimeout);
          resolve(stream);
        });
      } else if (snapshotData && snapshotData.accept === false) {
        clearTimeout(callTimeout);
        snapshot.ref.delete();
        callerPeer.destroy();
        reject('rejected');
      }
    });
  });

});
api.supported = Peer.WEBRTC_SUPPORT;

export default api;
