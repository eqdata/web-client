import React, {Component} from 'react';
import {render} from 'react-dom';
import client from 'socket.io-client';
require("../utils/ajaxtooltip");

class AuctionFeed extends React.Component {
    constructor(props) {
        super(props);
        this.state = {messages: [], connected: false, gameServer: "Blue", switched: false};
    }

    socketConnect() {
        this.socket = client.connect('http://52.205.204.206:3000');

        this.socket.on('request-server', function () {
            this.socket.emit('server-type', this.state.gameServer)
        }.bind(this));

        this.socket.on('join', function (data) {
            this.setState({messages: data.auctions.PreviousAuctions, connected: true, gameServer: this.state.gameServer, switched: false});
        }.bind(this));

        this.socket.on('auctions-updated', function (data) {
            this.setState({
                messages: this.state.messages.concat(data)
            });
        }.bind(this));

        this.socket.on('disconnect', function () {
            setTimeout(function () {
                this.socket.connect()
            }, 2500)
        });
    }

    componentWillMount() {
        this.socketConnect();
    }


    componentWillUpdate() {
        if (this.state.switched) {
            this.socket.disconnect();
            this.socketConnect();
            this.setState({messages: this.state.messages, connected: this.state.connected, gameServer: this.state.gameServer, switched: false})
        }
    }

    componentDidUpdate() {
        // keep feed growing upward
        var objDiv = document.getElementById("auction-box");
        objDiv.scrollTop = objDiv.scrollHeight;
    }

    switchServer() {
        console.log("switching servers");
        if (this.state.gameServer == "Red")
            this.setState({messages: [], connected: false, gameServer: "Blue", switched: true});
        else
            this.setState({messages: [], connected: false, gameServer: "Red", switched: true});
    }

    render() {
        // var component1 = <Something />; // put this in the return
        return (
            <div>
                <h1 id="page-title" className="page-header">
                    Live Auction Feed
                </h1>
                <div className="text-center">
                    <button onClick={this.switchServer.bind(this)}
                        className={"btn btn-sm " + (this.state.gameServer == "Blue" ? "btn-danger" : "btn-primary")}>
                        Switch
                        to {this.state.gameServer == "Blue" ? "Red" : "Blue"} Server
                    </button>
                </div>
                <br />
                <div className="auction-box" id="auction-box">
                    <div className="auction-loading">LOADING, PLEASE WAIT...</div>
                    { this.state.connected ?
                        <div className="auction-connected">You have entered East Commonlands.</div> : <div></div>}
                    { this.state.messages.map((msg, idx) => <div key={'msg-' + idx }
                                                                 className="auction-message">{ msg }</div>)}

                </div>

            </div>
        );
    }
}

export default AuctionFeed
