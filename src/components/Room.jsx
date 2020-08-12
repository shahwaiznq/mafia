import React, { Component } from 'react'
import {db} from './firebase/firebase';
import Game from './Game'
import _ from 'lodash'
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
            players: []
        }

        this.roomCreator = this.roomCreator.bind(this);
        this.roomJoiner = this.roomJoiner.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleJoin = this.handleJoin.bind(this);
        this.loader = this.loader.bind(this);
        this.createRoom = this.createRoom.bind(this);
        this.playerCreator = this.playerCreator.bind(this);
        this.updatePlayers = this.updatePlayers.bind(this);



    }

    handleJoin = (event) => {
        event.preventDefault();
        if (_.findIndex(this.state.players, player => player.name === this.state.name) < 0) {
            this.state.players.push(this.playerCreator(this.state.name));
            db.ref('/rooms/'+this.state.address+'/players').set(this.state.players);
        }
        this.setState({sendToGame: true});
    }

    handleChange = (event) => {
        this.setState({name: event.target.value});
    }

    updatePlayers = (playersArray) => {
        this.setState({players: playersArray});
        db.ref('/rooms/'+this.state.address+'/players').set(this.state.players);
    }

    createRoom = (event) => {
        event.preventDefault();
        db.ref('/rooms').child(this.state.address).set({ address: '/'+this.state.address});
        this.state.players.push(this.playerCreator(this.state.name));
        db.ref('/rooms/'+this.state.address+'/players').set(this.state.players);
        db.ref('/rooms/'+this.state.address).child('host').set(this.state.name);
        db.ref('/rooms/'+this.state.address).child('started').set(false);
        db.ref('/rooms/'+this.state.address).child('time').set('none');
        db.ref('/rooms/'+this.state.address).child('healed').set('');
        db.ref('/rooms/'+this.state.address).child('message').set('');
        db.ref('/rooms/'+this.state.address).child('gameover').set(false);


        this.setState({sendToGame: true});
    }

    roomCreator = () => {
        return(
            <div>
                <h1>Create Room</h1>
                <form onSubmit={this.createRoom}>
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
                <form onSubmit={this.handleJoin}>
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
            return <Game address={this.state.address} name={this.state.name} players={this.state.players} room={this.state.rooms[this.state.address]} updatePlayers={this.updatePlayers} />;
        } else if (this.state.live) {

            return this.roomJoiner();
        } else {
            return this.roomCreator();
        }
    }

    playerCreator = (playerName) => {
        return {
            name: playerName,
            role: 'tbc',
            alive: true,
            votes: 0,
            mafiaVotes: 0,
            votingFor: '',
            mafVotingFor: '',
            done: false
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

            if (this.state.live) {
                db.ref('rooms/'+this.state.address+'/players').on('value', snapshot => {
                    this.setState({players: snapshot.val()});
                });
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
