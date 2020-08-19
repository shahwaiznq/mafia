import React, { Component } from 'react';
import { db } from './firebase/firebase';
import _ from 'lodash';

export class Game extends Component {

    constructor(props) {
        super(props);

        this.state = {
            index: null,
            host: false,
            mafiaNum: 0,
            copchecked: '',
            winner: ''
        }

        this.indexFinder = this.indexFinder.bind(this);
        this.numOfMafiaLeft = this.numOfMafiaLeft.bind(this);
        this.numOfCivLeft = this.numOfCivLeft.bind(this);
        this.hostStartGame = this.hostStartGame.bind(this);
        this.gameSetUp = this.gameSetUp.bind(this);
        this.hostSetUp = this.hostSetUp.bind(this);
        this.handleMafiaNum = this.handleMafiaNum.bind(this);
        this.viewController = this.viewController.bind(this);
        this.copView = this.copView.bind(this);
        this.checkView = this.checkView.bind(this);
        this.healerView = this.healerView.bind(this);
        this.mafiaView = this.mafiaView.bind(this);
        this.civView = this.civView.bind(this);
        this.spectatorView = this.spectatorView.bind(this);
        this.endView = this.endView.bind(this);
        this.mafiaVote = this.mafiaVote.bind(this);
        this.healerVote = this.healerVote.bind(this);
        this.lynchVote = this.lynchVote.bind(this);
        this.wipeActions = this.wipeActions.bind(this);
        this.restart = this.restart.bind(this);
        this.deleteRoom = this.deleteRoom.bind(this);
    }

 //   ___       ________  ________  ___  ________     
 //   |\  \     |\   __  \|\   ____\|\  \|\   ____\    
 //   \ \  \    \ \  \|\  \ \  \___|\ \  \ \  \___|    
 //    \ \  \    \ \  \\\  \ \  \  __\ \  \ \  \       
 //     \ \  \____\ \  \\\  \ \  \|\  \ \  \ \  \____  
 //      \ \_______\ \_______\ \_______\ \__\ \_______\
 //       \|_______|\|_______|\|_______|\|__|\|_______|
                                                     
                                                    

    componentDidMount() {
        if (this.props.room.host === this.props.name) {
            this.setState({ host: true });
        }
        let playerIndex = _.findIndex(this.props.players, (player) => {
            return player.name === this.props.name;
        })
        this.setState({index: playerIndex});
    }

    componentDidUpdate() {
        if (
            _.every(this.props.players, player => {
                return player.done === true;
            }) && this.state.host
        ) {
            let deadIndex;
            // NIGHT LOGIC /////////////////////////////////////////////////////
            if (this.props.room.time === 'night') {
                let max = _.maxBy(this.props.players, player => { return player.mafiaVotes }).mafiaVotes;
                let attackIndex = _.findIndex(this.props.players, player => {
                    return player.mafiaVotes === max;
                });
                if (this.props.room.healed === this.props.players[attackIndex].name) {
                    db.ref('/rooms/'+this.props.address).child('message').set('The doctor made it to the victim in time to save him!');
                } else {
                    db.ref('/rooms/'+this.props.address+'/players').child(attackIndex).child('alive').set(false);
                    deadIndex = attackIndex;
                    db.ref('/rooms/'+this.props.address).child('message').set(`${this.props.players[attackIndex].name} was killed by the Mafia`);
                }
                db.ref('/rooms/'+this.props.address).child('time').set('day');

                // DAY LOGIC ///////////////////////////////////////////////////
            } else if (this.props.room.time === 'day') {
                let max = _.maxBy(this.props.players, player => { return player.votes }).votes;
                let lynchIndex = _.findIndex(this.props.players, player => {
                    return player.votes === max;
                }); 
                db.ref('/rooms/'+this.props.address+'/players').child(lynchIndex).child('alive').set(false);
                deadIndex = lynchIndex;
                db.ref('/rooms/'+this.props.address).child('message').set(`${this.props.players[lynchIndex].name} was lynched by the community`);
                db.ref('/rooms/'+this.props.address).child('time').set('night');
            }
            this.wipeActions(deadIndex);
            if (this.numOfMafiaLeft() >= this.numOfCivLeft() ) {
                db.ref('/rooms/'+this.state.address).child('gameover').set(true);
                this.setState({winner: 'Mafia'});
            }
            if (this.numOfMafiaLeft() === 0 ) {
                db.ref('/rooms/'+this.state.address).child('gameover').set(true);
                this.setState({winner: 'Civilians'});
            }
        }
        if (
            _.every(this.props.players, player => {
                return player.done === true;
            }) && this.props.players[this.state.index].role === 'cop' ) {
                this.setState({copchecked: ''});
            }
    }

    indexFinder = (name) => {
        let index = _.findIndex(this.props.players, player => {
            return player.name === name;
        }); 
        return index;
    }

    numOfMafiaLeft = () => {
        let mafia = _.filter(this.props.players, (player) => {
            return player.role === 'mafia'
        });
        return mafia.length;
    }

    numOfCivLeft = () => {
        let civ = _.filter(this.props.players, (player) => {
            return player.role !== 'mafia'
        });
        return civ.length;
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

    handleMafiaNum = (event) => {
        this.setState({mafiaNum: event.target.value});
    }



//   ________  ________ _________  ___  ________  ________   ________      
//   |\   __  \|\   ____\\___   ___\\  \|\   __  \|\   ___  \|\   ____\     
//   \ \  \|\  \ \  \___\|___ \  \_\ \  \ \  \|\  \ \  \\ \  \ \  \___|_    
//    \ \   __  \ \  \       \ \  \ \ \  \ \  \\\  \ \  \\ \  \ \_____  \   
//     \ \  \ \  \ \  \____   \ \  \ \ \  \ \  \\\  \ \  \\ \  \|____|\  \  
//      \ \__\ \__\ \_______\  \ \__\ \ \__\ \_______\ \__\\ \__\____\_\  \ 
//       \|__|\|__|\|_______|   \|__|  \|__|\|_______|\|__| \|__|\_________\
//                                                              \|_________|
                                                                            
    investigate = (name) => {
        this.setState({ copchecked: name });
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

    healerVote = (name) => {
        db.ref('/rooms/'+this.props.address).child('healed').set(name);
    }

    lynchVote = (name) => {
        let voteIndexNew = _.findIndex(this.props.players, (player) => {
            return player.name === name;
        });
        let voteIndexOld = _.findIndex(this.props.players, (player) => {
            return player.name === this.props.players[this.state.index].votingFor;
        });
        // Removing old vote
        if (this.props.players[this.state.index].votingFor) {
            db.ref('/rooms/'+this.props.address+'/players').child(voteIndexOld).child('votes').set(this.props.players[voteIndexOld].votes-1);
        }
        // Adding new vote
        db.ref('/rooms/'+this.props.address+'/players').child(this.state.index).child('votingFor').set(name);
        db.ref('/rooms/'+this.props.address+'/players').child(voteIndexNew).child('votes').set(this.props.players[voteIndexNew].votes+1);
    }

    imReady = () => {
        db.ref('/rooms/'+this.props.address+'/players').child(this.state.index).child('done').set(true);
    }

    restart = () => {
        for (let pIndex = 0; pIndex < this.props.players.length; pIndex++) {
            db.ref('/rooms/'+this.props.address+'/players').child(pIndex).child('alive').set(true); 
        }
        if (this.state.host) {
            this.hostStartGame();
        }
    }

    deleteRoom = () => {

    }

    wipeActions = (deadIndex) =>  {

        db.ref('/rooms/'+this.props.address).child('healed').set('');
        for (let i = 0; i < this.props.players.length; i++) {
            db.ref('/rooms/'+this.props.address+'/players').child(i).child('votes').set(0);
            db.ref('/rooms/'+this.props.address+'/players').child(i).child('mafiaVotes').set(0);
            db.ref('/rooms/'+this.props.address+'/players').child(i).child('votingFor').set('');
            db.ref('/rooms/'+this.props.address+'/players').child(i).child('mafVotingFor').set('');
            if (i === deadIndex){
                db.ref('/rooms/'+this.props.address+'/players').child(i).child('done').set(true);
            } else if (this.props.players[i].alive ) {
                db.ref('/rooms/'+this.props.address+'/players').child(i).child('done').set(false); 
            }
        }
    }

    render() {
        return (
            <div>

                {this.gameSetUp()}
                
                <h1>{this.props.room.message}</h1>

                {this.state.copchecked ? this.checkView() : this.viewController()}

            </div>
        )
    }


//    ___      ___ ___  _______   ___       __   ________      
//    |\  \    /  /|\  \|\  ___ \ |\  \     |\  \|\   ____\     
//    \ \  \  /  / | \  \ \   __/|\ \  \    \ \  \ \  \___|_    
//     \ \  \/  / / \ \  \ \  \_|/_\ \  \  __\ \  \ \_____  \   
//      \ \    / /   \ \  \ \  \_|\ \ \  \|\__\_\  \|____|\  \  
//       \ \__/ /     \ \__\ \_______\ \____________\____\_\  \ 
//        \|__|/       \|__|\|_______|\|____________|\_________\
//                                                  \|_________|

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

        } else {

        }

    }

    gameSetUp = () => {
        if (this.props.room.started === false) {
            return (
                <div className="setupgame">
                    <ul>
                        Player List:
                        {this.props.players.map(player => {
                            return (
                                <li key={player.name}> {player.name} </li>
                            )
                        })}
                    </ul>
                    {this.hostSetUp()}
                </div>
            )
        }
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

    mafiaView = () => {
        return (
            <div>
                <div>
                    <h1>You are in the Mafia!</h1>
                </div>
                <div className="playingfield">
                    {
                        this.props.players.map(player => {
                            return(
                                <div onClick={() => this.mafiaVote(player.name)} key={player.name}>
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
                <div>
                    <h1>You are the Healer!</h1>
                </div>
                <div className="playingfield">
                    {
                        this.props.players.map(player => {
                            return(
                                <div onClick={() => this.healerVote(player.name)} key={player.name}>
                                    <h3>{ player.name }</h3>
                                    <p>{ player.alive ? 'Alive' : 'Dead' }</p>
                                    { player.role == 'healer' ? <><p>Healer</p> <p>Voting for: {this.props.room.healed}</p> <p>{player.done ? 'Locked in' : 'Deciding'}</p></> : '' }
                                </div>
                            )
                        })
                    }
                </div>
                <button onClick={this.imReady}> Ready! </button>
            </div>
        )
    }

    copView = () => {
        return (
            <div>
                <div>
                    <h1>You are the Police Officer!</h1>
                    <h3>Click a player to investigate them:</h3>
                </div>
                <div className="playingfield">
                    {
                        this.props.players.map(player => {
                            return(
                                <div onClick={() => this.investigate(player.name)} key={player.name}>
                                    <h3>{ player.name }</h3>
                                    <p>{ player.alive ? 'Alive' : 'Dead' }</p>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        )
    }

    checkView = () => {
        return (
            <div className="checkview">
                <h2>You investigated {this.state.copchecked}</h2>
                <h1>They ARE {
                    this.props.players[this.indexFinder(this.state.copchecked)].role === 'mafia' ? '' : 'NOT'
                } Mafia</h1>
                <button onClick={this.imReady}> Ready! </button>
            </div>
        )
    }

    civView = () => {
        return (
            <div>
                <div>
                    <h1>You are a {this.props.players[this.state.index].role}!</h1>
                </div>
                <div className="playingfield">
                    {
                        this.props.players.map(player => {
                            return(
                                <div onClick={() => this.lynchVote(player.name)} key={player.name}>
                                    <h3>{ player.name }</h3>
                                    <p>{ player.alive ? 'Alive' : 'Dead' }</p>
                                    { this.props.room.time === 'day' && player.alive ?
                                    <>
                                    <p>Voting for: {player.votingFor}</p>
                                    <p>{player.done ? 'Locked in' : 'Deciding'}</p>
                                    <p>Lynch votes: {player.votes} </p>
                                    </> : ''
                                    }
                                </div>
                            )
                        })
                    }
                </div>
                <button onClick={this.imReady}> Ready! </button>
            </div>
        )
    }

    spectatorView = () => {
        return (
            <div>

            </div>
        )
    }


    endView = () => {
        return (
            <div>
                <div>
                    <h1>GAME OVER</h1>
                    <h2>{this.state.winner} Win!</h2>
                </div>
                <div className="playingfield">
                    {
                        this.props.players.map(player => {
                            return(
                                <div key={player.name}>
                                    <h3>{ player.name }</h3>
                                    <p>{ player.alive ? 'Alive' : 'Dead' }</p>
                                    <p>{ player.role }</p>
                                </div>
                            )
                        })
                    }
                </div>
                <button onClick={this.restart}> Restart </button>
            </div>
        )
    }

}





export default Game
