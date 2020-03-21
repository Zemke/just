import DataStore from "./dataStore";
import Peer from "simple-peer";
import Auth from './auth';

let peer;
let videoCallRequestSent = false;
let callerPeer;

// todo maybe that should be listened to from the service worker
//  using firebase cloud messaging

// todo show modal that you're being called

const api = {};

api.listenToCallRequests = (onMessageCb, onCallCb) => {
  return DataStore.onVideoCallRequest(({req, doc}) => {
    if (onCallCb && !onCallCb(req.from)) {
      doc.ref.update({accept: false});
      return;
    }
    const calleePeer = new Peer();
    calleePeer.signal(JSON.parse(req.signalingFrom));
    calleePeer.on(
      'signal',
      data => doc.ref.update({accept: true, signalingTo: JSON.stringify(data)}));
    calleePeer.on('data', onMessageCb);
  });
};


api.requestCall = callee => {
  // todo calling timeout when no answer and
  //  transaction safe deletion of video request in firestore

  callerPeer = new Peer({initiator: true});
  callerPeer.on('signal', async data => {
    if (!videoCallRequestSent) {
      console.log('videoCallRequestSent', videoCallRequestSent);
      videoCallRequestSent = true;
      (await DataStore.sendVideoCallRequest({
        from: (await Auth.current()).uid,
        to: callee,
        signalingFrom: JSON.stringify(data)
      })).onSnapshot(snapshot => {
        const snapshotData = snapshot.data();
        if (snapshotData && snapshotData.signalingTo) {
          console.log('signalingTo', snapshotData.signalingTo);
          callerPeer.signal(JSON.parse(snapshotData.signalingTo));
          // snapshot.ref.delete(); todo
        }
      });
    }
  });

  return new Promise((resolve, _) =>
    callerPeer.on('connect', () => {
      peer = callerPeer;
      resolve();
    }));
};

api.supported = Peer.WEBRTC_SUPPORT;

api.send = data => {
  if (!peer) throw new Error("There's no peer");
  peer.send(data);
};

export default api;
