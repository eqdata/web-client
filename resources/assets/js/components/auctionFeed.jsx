import React, {Component} from 'react';
import {render} from 'react-dom';
import client from 'socket.io-client';
require("../utils/ajaxtooltip");

class AuctionFeed extends React.Component {
    constructor(props) {
        super(props);
        this.state = {messages: []};
    }

    componentDidMount() {
        var socket = client.connect('http://52.205.204.206:3000');

        socket.on('server:event', data => {
            this.setState({
                messages: this.state.messages.concat(data)
            });
        })
    }

    componentDidUpdate(){
        // keep feed growing upward
        var objDiv = document.getElementById("auction-box");
        objDiv.scrollTop = objDiv.scrollHeight;
    }

    render() {
        // var component1 = <Something />; // put this in the return
        return (
            <div>
                <h1 id="page-title" className="page-header">
                    Live Auction Feed
                </h1>
                <div className="auction-box" id="auction-box">
                    { this.state.messages.map((msg, idx) => <div key={'msg-' + idx } className="auction-message">{ msg }</div>)}

                </div>

            </div>
        );
    }
}

export default AuctionFeed
