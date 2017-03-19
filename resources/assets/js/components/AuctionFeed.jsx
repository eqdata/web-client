import React, {Component} from 'react';
import ReactDOM, {render} from 'react-dom';
import client from 'socket.io-client';
import {Link} from 'react-router';
import AuctionLine from './AuctionLine';
import serverSelect from "../utils/serverSelect";
import helpers from '../utils/helpers.js';

class AuctionFeed extends React.Component {
    switched = false;
    shouldScroll = true;
    disconnected = false;
    _isMounted = false;


    constructor(props) {
        super(props);
        this.state = {
            messages: [],
            connected: false,
        };
    }

    socketConnect() {
        this.socket = client.connect('http://52.205.204.206:3000');

        this.socket.on('request-server', function () {
            this.socket.emit('server-type', serverSelect.getServer())
        }.bind(this));

        this.socket.on('join', function (data) {
            this.setState({
                messages: data.auctions.PreviousAuctions,
                connected: true,
                switched: false,
            });
        }.bind(this));

        this.socket.on('auctions-updated', function (data) {
            this.setState({
                connected: this.state.connected,
                messages: this.state.messages.concat(data)
            });
        }.bind(this));

        this.socket.on('disconnect', function () {
            setTimeout(function () {
                if(!this.disconnected) {
                    this.socket.connect()
                }
            }.bind(this), 2500)
        });
    }

    componentWillMount() {
        this.socketConnect();
    }

    componentWillUnmount() {
        this._isMounted = false
        console.log("disconnected socket")
        this.disconnected = true
        this.socket.disconnect();
    }

    componentDidMount(){
        // fade in
        this._isMounted = true
        var elem = ReactDOM.findDOMNode(this)
        elem.style.opacity = 0;
        window.requestAnimationFrame(function() {
            elem.style.transition = "opacity 550ms";
            elem.style.opacity = 1;
        });
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(!this._isMounted) return false

        if(nextProps !== this.props) return true
        if(nextState !== this.state) return true
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
        this.updateScrollHeight()
    }

    updateScrollHeight() {
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
                    Live Auction Feed &nbsp;
                    <small id="page-title">{helpers.titleCase(serverSelect.getServer())} Server </small>
                </h1>

                <div className="auction-container" id="auction-container">
                    <div className="auction-buttons">
                        {/*<button onClick={this.switchServer.bind(this)}*/}
                                {/*className={"btn btn-xs " + (this.state.gameServer == "Blue" ? "btn-danger" : "btn-primary")}>*/}
                            {/*Switch*/}
                            {/*to {this.state.gameServer == "Blue" ? "Red" : "Blue"} Server*/}
                        {/*</button>*/}
                        &nbsp;
                        <button className="btn btn-xs"><span id="fullscreen-icon" onMouseUp={this.fullscreenToggle}
                                                             className="glyphicon glyphicon-fullscreen"/></button>
                    </div>
                    <div className="auction-box" id="auction-box">

                        <div className="auction-loading">LOADING, PLEASE WAIT...</div>
                        {
                            this.state.connected ?
                            <div className="auction-connected">You have entered East Commonlands.</div> : <div></div>
                        }

                        {
                            this.state.messages.map(function(msg, idx) {
                                return <AuctionLine shouldScrollOnRender={this.shouldScroll} delay={idx*10} message={msg} key={"message"+idx} />
                            }.bind(this))
                        }

                    </div>
                </div>
            </div>
        );
    }
}



export default AuctionFeed
