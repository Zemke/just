import "firebase/storage";
import firebase from './firebase';
import Auth from './auth';

const api = {};

api.PREFIX = `images/`;

api.upload = async (file, name, to, when) =>
  firebase
    .storage()
    .ref()
    .child(`${api.PREFIX}${name}`)
    .put(file, {
      cacheControl: 'public, max-age=31536000',
      customMetadata: {
        from: (await Auth.current()).uid,
        when: when.toString(),
        to
      }
    });

api.download = async image => {
  const cache = await caches.open('just-storage-image');
  const fromCache = await cache.match(image);

  if (fromCache) {
    const object = await fromCache.blob();
    return URL.createObjectURL(object);
  } else {
    const downloadUrl = await firebase
      .storage()
      .ref(image)
      .getDownloadURL();
    const fromNetwork = await fetch(downloadUrl);
    await cache.put(image, fromNetwork.clone());
    const blob = await fromNetwork.blob();
    return URL.createObjectURL(blob);
  }
};

export default api;
