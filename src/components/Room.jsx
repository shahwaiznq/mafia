import React, { Component } from 'react'
import {db} from './firebase/firebase';
import Game from './Game'
require('firebase/database');

export class Room extends Component {

    constructor(props) {
        super(props);
        this.state = {
            address: '',
            live: undefined,
            rooms: {},
            name: '',
            sendToGame: false,
            roomRef: db.ref('/rooms')
        }

        this.roomCreator = this.roomCreator.bind(this);
        this.roomJoiner = this.roomJoiner.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.loader = this.loader.bind(this);
        this.createRoom = this.createRoom.bind(this);

    }

    handleSubmit = (event) => {
        event.preventDefault();
        this.setState({sendToGame: true});
    }

    handleChange = (event) => {
        this.setState({name: event.target.value});
    }

    createRoom = (event) => {
        event.preventDefault();
        this.state.roomRef.child(this.state.address).set({ address: this.state.address});
        this.setState({sendToGame: true});
    }

    roomCreator = () => {
        return(
            <div>
                <h1>Create Room</h1>
                <form onSubmit={this.handleSubmit}>
                    <label>
                        Player Name: <input type="text" name="name" value={this.state.name} onChange={this.handleChange} />
                    </label>
                    <input type="submit" value="Submit"/>
                </form>
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

    loader = () =>  {
        if (this.state.sendToGame) {
            return <Game address={this.state.address} name={this.state.name} />;
        } else if (this.state.live) {
            return this.roomJoiner();
        } else {
            return this.roomCreator();
        }
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
                { this.loader() }
            </div>
        )
    }
}

export default Room
