import React, {Component} from 'react';
import {render} from 'react-dom';
import client from 'socket.io-client';
import helpers from '../utils/helpers.js';
import priceHelpers from '../utils/priceData';
import {Link} from 'react-router';

class AuctionFeed extends React.Component {
    switched = false;
    loadingText = <span className="tooltip">loading</span>;
    shouldScroll = true;

    constructor(props) {
        super(props);
        this.state = {
            messages: [],
            connected: false,
            gameServer: "Blue",
            tooltip: this.loadingText
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
                tooltip: this.loadingText
            });
        }.bind(this));

        this.socket.on('auctions-updated', function (data) {
            this.setState({
                connected: this.state.connected,
                gameServer: this.state.gameServer,
                tooltip: this.state.tooltip,
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
            this.setState({messages: [], connected: false, gameServer: "Blue", tooltip: this.loadingText});
        else
            this.setState({messages: [], connected: false, gameServer: "Red", tooltip: this.loadingText});
    }

    generateTestAuction(){
        this.setState({
            connected: this.state.connected,
            gameServer: this.state.gameServer,
            tooltip: this.state.tooltip,
            messages: this.state.messages.concat(this.convertLinks('Test auction: WTS <a href="/item/Crushed_Jaundice_Gem">Crushed Jaundice Gem</a> 50pp'))
        });
    }

    // TODO implement link converter
    convertLinks(message){
        // for each link:
        // create <Link/> tag
        // add className="tooltips"
        // add onMouseEnter={this.setTooltip.bind(this, "URI-ENCODED NAME HERE")}
        // add onMouseLeave={this.resetTooltip.bind(this)}
        // include {this.state.tooltip} before </Link>
        return message;
    }

    fullscreenToggle() {
        document.getElementById("auction-box").classList.toggle('fullscreen');
        document.getElementById("fullscreen-icon").classList.toggle('glyphicon-unchecked');
        document.getElementById("fullscreen-icon").classList.toggle('glyphicon-fullscreen');
    }

    setTooltip(item) {
        helpers.ajax({
            url: "http://52.205.204.206:8085/items/auctions/" + item,
            contentType: "application/json",
            cache: false,
            type: "GET",
        }).then(function (payload) {
            var average = {
                week: "n/a",
                month: "n/a",
                all: "n/a"
            };
            if (payload.data.Auctions[0]) {
                average.week = priceHelpers.timeMean(payload.data.Auctions, "week").toLocaleString() + "pp";
                average.month = priceHelpers.timeMean(payload.data.Auctions, "month").toLocaleString() + "pp";
                average.all = priceHelpers.timeMean(payload.data.Auctions, "all").toLocaleString() + "pp";
            }
            this.setState({
                messages: this.state.messages,
                connected: this.state.connected,
                gameServer: this.state.gameServer,
                tooltip: <span className="tooltip">Average (week): {average.week}<br />
                    Average (month): {average.month}<br />
                    Average (all time): {average.all}</span>
            });
        }.bind(this), function (err) {
            console.log("error: " + err);
            this.setState({
                messages: this.state.messages,
                connected: this.state.connected,
                gameServer: this.state.gameServer,
                tooltip: <span className="tooltip">error</span>
            });
        });

    }

    resetTooltip() {
        this.setState({
            messages: this.state.messages,
            connected: this.state.connected,
            gameServer: this.state.gameServer,
            tooltip: this.loadingText
        });
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


                <div className="auction-box" id="auction-box">
                    <div className="auction-buttons-container">
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
                    </div>
                    <div className="auction-loading">LOADING, PLEASE WAIT...</div>

                    <div className="auction-message">This is a test auction. This page should only auto scroll when the user
                        has already scrolled to the bottom of the screen (or hasn't scrolled at all) <Link to="/test" className="tooltips"
                                                                                   onMouseEnter={this.setTooltip.bind(this, "crushed%20jaundice%20gem")}
                                                                                   onMouseLeave={this.resetTooltip.bind(this)}
                                                                                   >
                        test
                        {this.state.tooltip}
                    </Link> blah blah blah
                    </div>

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
