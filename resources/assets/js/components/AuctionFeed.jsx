import React, {Component} from 'react';
import ReactDOM, {render} from 'react-dom';
import client from 'socket.io-client';
import {Link} from 'react-router';
import TooltipLink from './TooltipLink';


class AuctionFeed extends React.Component {
    switched = false;
    shouldScroll = true;


    constructor(props) {
        super(props);
        this.state = {
            messages: [],
            connected: false,
            gameServer: "Blue",
        };
    }

    socketConnect() {
        this.socket = client.connect('http://52.205.204.206:3000');

        this.socket.on('request-server', function () {
            this.socket.emit('server-type', this.state.gameServer)
        }.bind(this));

        this.socket.on('join', function (data) {
            this.setState({
                messages: data.auctions.PreviousAuctions,
                connected: true,
                gameServer: this.state.gameServer,
                switched: false,
            });
        }.bind(this));

        this.socket.on('auctions-updated', function (data) {
            this.setState({
                connected: this.state.connected,
                gameServer: this.state.gameServer,
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

    componentDidMount(){
        // fade in
        var elem = ReactDOM.findDOMNode(this)
        elem.style.opacity = 0;
        window.requestAnimationFrame(function() {
            elem.style.transition = "opacity 550ms";
            elem.style.opacity = 1;
        });
    }


    componentWillUpdate() {
        if (this.switched) {
            this.socket.disconnect();
            this.switched = false;
            this.socketConnect();
        }

        // check if the auction window is already scrolled to the bottom
        var objDiv = document.getElementById("auction-box");
        this.shouldScroll = objDiv.scrollTop + objDiv.offsetHeight === objDiv.scrollHeight;
    }

    componentDidUpdate() {
        // keep feed growing upward if the window is scrolled down
        if (this.shouldScroll) {
            var objDiv = document.getElementById("auction-box");
            objDiv.scrollTop = objDiv.scrollHeight;
        }

    }

    switchServer() {
        this.switched = true;

        if (this.state.gameServer == "Red")
            this.setState({messages: [], connected: false, gameServer: "Blue"});
        else
            this.setState({messages: [], connected: false, gameServer: "Red"});
    }

    generateTestAuction() {
        this.setState({
            connected: this.state.connected,
            gameServer: this.state.gameServer,
            messages: this.state.messages.concat(this.convertLinks('Test auction: WTS <a href="/item/Crushed_Jaundice_Gem">Crushed Jaundice Gem</a> 50pp'))
                .concat(<span>here's a Router Link: <TooltipLink name="Crushed Jaundice Gem"/></span>)
        });
    }

    // TODO implement link converter
    convertLinks(message) {

        return message;
    }

    fullscreenToggle() {
        document.getElementById("auction-container").classList.toggle('fullscreen');
        document.getElementById("auction-box").classList.toggle('fullscreen');
        document.getElementById("fullscreen-icon").classList.toggle('glyphicon-unchecked');
        document.getElementById("fullscreen-icon").classList.toggle('glyphicon-fullscreen');
    }

    render() {
        return (
            <div>
                <h1 id="page-title" className="page-header">
                    Live Auction Feed - {this.state.gameServer} Server
                </h1>

                <button onClick={this.generateTestAuction.bind(this)}
                        className={"btn btn-xs btn-success"}>
                    GENERATE TEST DATA
                </button>

                <div className="auction-container" id="auction-container">
                    <div className="auction-buttons">
                        <button onClick={this.switchServer.bind(this)}
                                className={"btn btn-xs " + (this.state.gameServer == "Blue" ? "btn-danger" : "btn-primary")}>
                            Switch
                            to {this.state.gameServer == "Blue" ? "Red" : "Blue"} Server
                        </button>
                        &nbsp;
                        <button className="btn btn-xs"><span id="fullscreen-icon" onMouseUp={this.fullscreenToggle}
                                                             className="glyphicon glyphicon-fullscreen"/></button>
                    </div>
                    <div className="auction-box" id="auction-box">

                        <div className="auction-loading">LOADING, PLEASE WAIT...</div>

                        <div className="auction-message">This is a test auction. <TooltipLink
                            name="Crushed Jaundice Gem"/>
                            This page should only auto scroll when the user
                            has already scrolled to the bottom of the screen (or hasn't scrolled at all)
                        </div>

                        { this.state.connected ?
                            <div className="auction-connected">You have entered East Commonlands.</div> : <div></div>}
                        { this.state.messages.map((msg, idx) => <div key={'msg-' + idx }
                                                                     className="auction-message">{ msg }</div>)}

                    </div>
                </div>
            </div>
        );
    }
}

export default AuctionFeed
