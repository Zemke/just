export default process.env.NODE_ENV === 'production'
  ? ({
    apiKey: "AIzaSyCpeA-4i6sZalkiqjB3ks6u1__hO4E2o8U",
    authDomain: "just-pwa.firebaseapp.com",
    databaseURL: "https://just-pwa.firebaseio.com",
    projectId: "just-pwa",
    storageBucket: "just-pwa.appspot.com",
    messagingSenderId: "389806956797",
    appId: "1:389806956797:web:18d5c9ae865eda5b51de94",
    measurementId: "G-8FFPRPW39V"
  })
  : ({
    apiKey: "AIzaSyCpeA-4i6sZalkiqjB3ks6u1__hO4E2o8U",
    authDomain: "localhost:3000",
    databaseURL: "http://localhost:8080",
    projectId: "just-pwa",
    messagingSenderId: "389806956797",
    appId: "1:389806956797:web:18d5c9ae865eda5b51de94",
  });
