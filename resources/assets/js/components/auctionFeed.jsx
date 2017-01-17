import React, {Component} from 'react';
import {render} from 'react-dom';

class AuctionFeed extends React.Component {
    constructor(props) {
        super(props);
        this.state = {messages: []};
    }

    componentDidMount() {
        // this is an "echo" websocket service for testing pusposes
        this.connection = new WebSocket('ws://echo.websocket.org');
        // listen to onmessage event
        this.connection.onmessage = evt => {
            // add the new message to state
            this.setState({
                messages: this.state.messages.concat([evt.data])
            })
        };

        // for testing: sending a message to the echo service every 2 seconds,
        // the service sends it right back
        setInterval(_ => {
            this.connection.send(Math.random())
        }, 2000)
    }

    render() {
        // var component1 = <Something />; // put this in the return
        return (
            <div>
                <h1 id="page-title" className="page-header">
                    Live Auction Feed
                </h1>
                <ul>{ this.state.messages.map((msg, idx) => <li key={'msg-' + idx }>{ msg }</li>)}</ul>

            </div>
        );
    }
}

export default AuctionFeed
