import DataStore from "./dataStore";
import Peer from "simple-peer";
import Auth from './auth';

let videoCallRequestSent = false;
let callerPeer;

// todo maybe that should be listened to from the service worker
//  using firebase cloud messaging

// todo show modal that you're being called

// todo this is unidirectional streaming/data transfer at the moment

const api = {};

api.listenToCallRequests = (stream, onStreamCb, onCallCb) => {
  return DataStore.onVideoCallRequest(({req, doc}) => {
    if (onCallCb && !onCallCb(req.from)) {
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


api.requestCall = (callee, stream) => {
  // todo calling timeout when no answer and
  //  transaction safe deletion of video request in firestore

  callerPeer = new Peer({initiator: true, stream});
  callerPeer.on('signal', async data => {
    if (!videoCallRequestSent) {
      videoCallRequestSent = true;
      (await DataStore.sendVideoCallRequest({
        from: (await Auth.current()).uid,
        to: callee,
        signalingFrom: JSON.stringify(data)
      })).onSnapshot(snapshot => {
        const snapshotData = snapshot.data();
        if (snapshotData && snapshotData.signalingTo) {
          callerPeer.signal(JSON.parse(snapshotData.signalingTo));
          setTimeout(() => {
            snapshot.ref.delete();
          }, 5000); // todo
        }
      });
    }
  });

  return new Promise((resolve, _) =>
    callerPeer.on('stream', resolve));
};

api.supported = Peer.WEBRTC_SUPPORT;

export default api;
