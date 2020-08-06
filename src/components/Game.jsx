import React, { Component } from 'react';
import { db } from './firebase/firebase';
import _ from 'lodash';

export class Game extends Component {

    constructor(props) {
        super(props);

        this.state = {
            index: null,
            host: false,
            mafiaNum: 0
        }

        this.hostStartGame = this.hostStartGame.bind(this);
        this.hostSetUp = this.hostSetUp.bind(this);
        this.handleMafiaNum = this.handleMafiaNum.bind(this);
        this.viewController = this.viewController.bind(this);
        this.copView = this.copView.bind(this);
        this.healerView = this.healerView.bind(this);
        this.mafiaView = this.mafiaView.bind(this);
        this.civView = this.civView.bind(this);
        this.spectatorView = this.spectatorView.bind(this);
        this.mafiaVote = this.mafiaVote.bind(this);
    }

    componentDidMount() {
        if (this.props.room.host === this.props.name) {
            this.setState({ host: true });
        }
        let playerIndex = _.findIndex(this.props.players, (player) => {
            return player.name === this.props.name;
        })
        this.setState({index: playerIndex});
    }

    hostStartGame = () => {
        
        // ROLE ASSIGNING /////////////////////////////////////////////
        let playersNum = this.props.players.length;
        let roles = [];
        let playersCopy = this.props.players;
        for (let i = 0; i < this.state.mafiaNum; i++) {
            roles.push('mafia');
        }
        roles.push('cop');
        roles.push('healer');
        for (let i = roles.length; i < playersNum; i++) {
            roles.push('civilian');
        }
        let shuffled = _.shuffle(roles);

        for (let i = 0; i < shuffled.length; i++) {
            playersCopy[i].role = shuffled[i];
        }
        this.props.updatePlayers(playersCopy);
        //////////////////////////////////////////////////////////////
        db.ref('/rooms/'+this.props.address).child('time').set('night');
        db.ref('/rooms/'+this.props.address).child('started').set(true);

    }

    hostSetUp = () => {
        if (this.props.room.started === false) {
            if (this.state.host) {
                return (
                    <>
                        Number of Mafia: <input type="number" id="mafia-num" onChange={this.handleMafiaNum}/>
                        <input type="button" onClick={this.hostStartGame} value="Start Game" />
                    </>
                )
            } else {
                return "Waiting for Host to start game...";
            }
        }
    }

    handleMafiaNum = (event) => {
        this.setState({mafiaNum: event.target.value});
    }

    mafiaVote = (name) => {
        let voteIndexNew = _.findIndex(this.props.players, (player) => {
            return player.name === name;
        });
        let voteIndexOld = _.findIndex(this.props.players, (player) => {
            return player.name === this.props.players[this.state.index].mafVotingFor;
        });
        // Removing old vote
        if (this.props.players[this.state.index].mafVotingFor) {
            db.ref('/rooms/'+this.props.address+'/players').child(voteIndexOld).child('mafiaVotes').set(this.props.players[voteIndexOld].mafiaVotes-1);
        }
        // Adding new vote
        db.ref('/rooms/'+this.props.address+'/players').child(this.state.index).child('mafVotingFor').set(name);
        db.ref('/rooms/'+this.props.address+'/players').child(voteIndexNew).child('mafiaVotes').set(this.props.players[voteIndexNew].mafiaVotes+1);
    }

    imReady = () => {
        db.ref('/rooms/'+this.props.address+'/players').child(this.state.index).child('done').set(true);
    }

    render() {
        return (
            <div>
                <ul>
                    Player List:
                    {this.props.players.map(player => {
                        return (
                            <li key={player.name}> {player.name} </li>
                        )
                    })}
                </ul>


                {this.viewController()}

                {this.hostSetUp()}
            </div>
        )
    }

// VIEWS //////////////////////////////////////////////////////// 

    viewController = () => {
        if (this.props.room.started === true) {

            let thisPlayer = this.props.players[this.state.index];

            if (thisPlayer.alive) {
                if (this.props.room.time === 'night') {
                    if (thisPlayer.role === 'cop') {
                        return this.copView();
                    } else if (thisPlayer.role === 'healer') {
                        return this.healerView();
                    } else if (thisPlayer.role === 'mafia') {
                        return this.mafiaView();
                    } else {
                        return this.civView();
                    }
                } else {
                    return this.civView();
                }
            } else {
                return this.spectatorView();
            }

        }

    }

    mafiaView = () => {
        return (
            <div>
                <div>
                    You Are the Mafia
                </div>
                <div className="playingfield">
                    {
                        this.props.players.map(player => {
                            return(
                                <div onClick={() => this.mafiaVote(player.name)} name={player.name}>
                                    <h3>{ player.name }</h3>
                                    <p>{ player.alive ? 'Alive' : 'Dead' }</p>
                                    { player.role == 'mafia' ? <><p>Mafia</p> <p>Voting for: {player.mafVotingFor}</p> <p>{player.done ? 'Locked in' : 'Deciding'}</p></> : '' }
                                    { player.role !== 'mafia' ? <p>Kill votes: {player.mafiaVotes} </p> : '' }
                                </div>
                            )
                        })
                    }
                </div>
                <button onClick={this.imReady}> Ready! </button>
            </div>
        )
    }

    healerView = () => {
        return (
            <div>

            </div>
        )
    }

    copView = () => {
        return (
            <div>

            </div>
        )
    }

    civView = () => {
        return (
            <div>

            </div>
        )
    }

    spectatorView = () => {
        return (
            <div>

            </div>
        )
    }


}





export default Game
