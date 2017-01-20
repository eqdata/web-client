import React, {Component} from 'react';
import {render} from 'react-dom';
import client from 'socket.io-client';
require("../utils/ajaxtooltip");

class AuctionFeed extends React.Component {
    constructor(props) {
        super(props);
        this.state = {messages: [], connected: false};
    }

    componentDidMount() {
        var socket = client.connect('http://52.205.204.206:3000');
        socket.on('join', function() {
            this.setState({connected: true});
            console.log("Connected");
        }.bind(this));


        socket.on('server:event', function(data){
            this.setState({
                messages: this.state.messages.concat(data)
            });
        })
    }

    componentDidUpdate(){
        // keep feed growing upward
        var objDiv = document.getElementById("auction-box");
        objDiv.scrollTop = objDiv.scrollHeight;
        console.log(this.state);
    }

    render() {
        // var component1 = <Something />; // put this in the return
        return (
            <div>
                <h1 id="page-title" className="page-header">
                    Live Auction Feed
                </h1>
                <div className="auction-box" id="auction-box">
                    <div className="auction-loading">LOADING, PLEASE WAIT</div>
                    { this.state.connected ? <div className="auction-connected">You have entered East Commonlands.</div>: <div></div>}
                    { this.state.messages.map((msg, idx) => <div key={'msg-' + idx } className="auction-message">{ msg }</div>)}

                </div>

            </div>
        );
    }
}

export default AuctionFeed
