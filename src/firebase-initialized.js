
import Firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/messaging';

Firebase.initializeApp({
  apiKey: "AIzaSyBdeMCMOfFkz92Rzb2InwOZkk3W3e3RBfw",
  authDomain: "dolar-vivo.firebaseapp.com",
  databaseURL: "https://dolar-vivo.firebaseio.com",
  projectId: "dolar-vivo",
  storageBucket: "dolar-vivo.appspot.com",
  messagingSenderId: "22418687401",
  appId: "1:22418687401:web:ee69887a48f4186a0730b8",
  measurementId: "G-HN229N9NMK"
});

export default Firebase;