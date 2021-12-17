import firebase from 'firebase/app';
import 'firebase/firestore';

export const db = firebase.initializeApp({
  apiKey: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  authDomain: 'xxxxxxxxxxx.firebaseapp.com',
  databaseURL: 'https://xxxxxxxxxxx.firebaseio.com',
  projectId: 'xxxxxxxxxxx',
  storageBucket: 'xxxxxxxxxxx.appspot.com',
  messagingSenderId: 'xxxxxxxxxxxx',
  appId: 'x:xxxxxxxxxxx:web:xxxxxxxxxxxxxxxxxxxxxx',

}).firestore();
