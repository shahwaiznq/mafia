import React, { Component } from 'react'

export class Room extends Component {

    constructor() {
        super();
        this.state = {

        }
    }

    render() {
        return (
            <div>
                <h1>Game Room</h1>
                <h2>Room name: {this.props? this.props.match.params.name : ''}</h2>
            </div>
        )
    }
}

export default Room
