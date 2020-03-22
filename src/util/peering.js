import DataStore from "./dataStore";
import Peer from "simple-peer";
import Auth from './auth';

let videoCallRequestSent = false;
let callerPeer;

// todo maybe that should be listened to from the service worker
//  using firebase cloud messaging

// todo show modal that you're being called

const api = {};

api.listenToCallRequests = (onStreamCb, onCallCb) => {
  return DataStore.onVideoCallRequest(async ({req, doc}) => {
    const stream = await onCallCb(req.from);
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


api.requestCall = (callee, stream) => new Promise((resolve, _) => {
  // todo call timeout and rejection handling
  callerPeer = new Peer({initiator: true, stream});
  callerPeer.on('signal', async data => {
    if (videoCallRequestSent) return;
    videoCallRequestSent = true;
    (await DataStore.sendVideoCallRequest({
      from: (await Auth.current()).uid,
      to: callee,
      signalingFrom: JSON.stringify(data)
    })).onSnapshot(snapshot => {
      const snapshotData = snapshot.data();
      if (snapshotData && snapshotData.signalingTo) {
        callerPeer.signal(JSON.parse(snapshotData.signalingTo));
        callerPeer.on('stream', stream => {
          resolve(stream);
          snapshot.ref.delete();
        });
      }
    });
  });

});
api.supported = Peer.WEBRTC_SUPPORT;

export default api;
