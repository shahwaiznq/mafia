import firebase from 'firebase'

const config = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: "mafia-online-1efaf.firebaseapp.com",
    databaseURL: "https://mafia-online-1efaf.firebaseio.com",
    projectId: "mafia-online-1efaf",
    storageBucket: "mafia-online-1efaf.appspot.com",
    messagingSenderId: "1074519363365",
    appId: "1:1074519363365:web:04b3012bb6e7c936e0d4cc",
    measurementId: "G-RCVZ728V2M"
};

export const fire = firebase.initializeApp(config)
export const db = fire.database();