import React, { Component } from 'react'
import firebase, { database } from 'firebase'
import config from './components/firebase/firebase'
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import Home from './components/Home';
import Room from './components/Room';

export const Database = React.createContext(
  firebase // default value
);

class App extends Component {

  constructor() {
    super();

  }


  componentDidMount() {
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }

    firebase.database().ref().on("value", function(snapshot) {
      console.log(snapshot.val());
    }, function (error) {
      console.log("Error: " + error.code);
    });

    const Database = React.createContext(firebase);
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route component={Home} exact path='/' />
          <Route component={Room} path='/:name' />
        </Switch>
      </Router>
    )
  }
}

export default App;