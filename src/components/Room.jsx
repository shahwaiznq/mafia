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

    constructor(props) {
        super(props);
        this.state = {
            address: '',
            live: undefined,
            rooms: {},
            name: '',
            sendToGame: false
        }

        this.roomCreator = this.roomCreator.bind(this);
        this.roomJoiner = this.roomJoiner.bind(this);

    }

    handleSubmit = (event) => {
        event.preventDefault();
        this.setState({sendToGame: true});
    }

    handleChange = (event) => {
        this.setState({name: event.target.value});
    }

    roomCreator = () => {
        return(
            <div>
                <h1>Create Room</h1>
            </div>
        )
    }

    roomJoiner = () => {
        return(
            <div>
                <h1>Join Room</h1>
                <form onSubmit={this.handleSubmit}>
                    <label>
                        Player Name: <input type="text" name="name" value={this.state.name} onChange={this.handleChange} />
                    </label>
                    <input type="submit" value="Submit"/>
                </form>
            </div>
        )
    }

    componentDidMount() {

        this.setState({address: this.props.match.params.name });

        db.ref('/rooms').on("value", function(snapshot) {
            this.setState({rooms: snapshot.val() });
            if(this.state.rooms[this.state.address]){
                this.setState({live: true});
            } else {
                this.setState({live: false});
            }
        }.bind(this));

    }

    render() {
        return (

            <div>
                <h1>Game Room</h1>
                <h2>Room name: {this.state.address}</h2>
                {this.state.live ? this.roomJoiner() : this.roomCreator() }
            </div>
        )
    }
}

export default Room
