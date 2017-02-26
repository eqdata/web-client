import React, {Component} from 'react';
import ReactDOM, {render} from 'react-dom';
import client from 'socket.io-client';
import {Link} from 'react-router';
import TooltipLink from './TooltipLink';
import Helpers from '../utils/helpers'

class AuctionLine extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.message.line !== this.props.message.line
    }
    injectLinks(o) {
        //return <span>{o.line}</span>

        var elems = []
        var itemMap = []

        // Build up a map of the correct items
        o.items.forEach(function(item, i) {
            let indexOfItemInLine = o.line.toLowerCase().indexOf(item.name.toLowerCase())
            if(indexOfItemInLine === -1) {
                item.name = item.name.toLowerCase()
                    .replace("spell: ", "")
                    .replace("rune of the ", "")
                    .replace("words of the ", "")
                    .replace("words of ", "")
                    .replace("rune of ", "")
                indexOfItemInLine = o.line.toLowerCase().indexOf(item.name.toLowerCase())
            }

            if(indexOfItemInLine > -1) {
                itemMap.push(item.name)
            }
        })

        var parts = o.line.split(" ")
        var found = false
        var itemString = ""
        var ignoredIndexes = []

        parts.forEach(function(part, i) {
            if(part !== " " && ignoredIndexes.indexOf(i) === -1) {
                itemMap.some(function(match, j) {
                    if(match.trim().indexOf(part.trim()) > -1) {
                        itemString = match
                        itemMap.splice(j, 1)
                        found = true

                        // Remove remaining elements from our parts array
                        match.trim().split(" ").forEach(function(p, idx) {
                            ignoredIndexes.push((i + idx))
                        })
                    } else {
                        found = false
                        itemString = ""
                    }
                    return found
                })

                if(itemString !== "" && found) {
                    found = false
                    elems.push(<TooltipLink key={itemString+":"+i} name={itemString.trim() + " "}/>)
                } else {
                    elems.push(<span key={part+":"+i}>{part + " "}</span>)
                }
            }
        })

        return elems
    }
    render() {
        return <div className="auction-message"><p>{ this.injectLinks(this.props.message) }</p></div>
    }
}

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
                        {
                            this.state.connected ?
                            <div className="auction-connected">You have entered East Commonlands.</div> : <div></div>
                        }

                        {
                            this.state.messages.map(function(msg, idx) {
                                return <AuctionLine message={msg} key={"message"+idx} />
                            })
                        }

                    </div>
                </div>
            </div>
        );
    }
}



export default AuctionFeed
