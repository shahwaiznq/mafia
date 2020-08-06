import React, { Component } from 'react';
import firebase from 'firebase';
import {db} from './components/firebase/firebase';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import Home from './components/Home';
import Room from './components/Room'
require('firebase/database');

class App extends Component {

  constructor() {
    super();

  }


  componentDidMount() {

  }

  render() {
    return (
      <Router>
        <Switch>
          <Route component={Home} exact path='/' />
          <Route component={Room} path='/:name' database={db} />
        </Switch>
      </Router>
    )
  }
}

export default App;