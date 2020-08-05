import React, { Component } from 'react'
import firebase from 'firebase';
import {db} from './firebase/firebase';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
require('firebase/database');

export class Room extends Component {

    constructor() {
        super();
        this.state = {
            address: '',
            live: undefined
        }

    }

    roomCreator = () => {

    }

    componentDidMount() {
        let rooms = {};
        this.setState({address: this.props.match.params.name });
        db.ref('rooms').on("value", function(snapshot) {
            console.log(snapshot.val());
        });
        console.log(rooms);
        if(rooms[this.state.address]){
            this.setState = true;
        }
    }

    render() {
        return (

            <div>
                <h1>Game Room</h1>
                <h2>Room name: {this.state.address}</h2>
                {}
            </div>
        )
    }
}

export default Room
