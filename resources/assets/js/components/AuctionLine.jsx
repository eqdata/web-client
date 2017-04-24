import React, {Component} from 'react';
import {Link} from 'react-router';
import TooltipLink from './TooltipLink';
import helpers from '../utils/helpers.js';

class AuctionLine extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            render: false
        }
    }
    componentWillMount() {
        setTimeout(function() {
            console.log("Rendering now!")
            this.setState({ render: true })
        }.bind(this), this.props.delay || 0)
    }
    shouldComponentUpdate(nextProps, nextState) {
        if(nextState.render || this.state.render) {
            console.log(nextProps.message.line !== this.props.message.line)
            return true
        }
        return false
    }
    injectLinks(o) {
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
                    elems.push(<span key={part+":"+i}>{helpers.entityDecode(part) + " "}</span>)
                }
            }
        })

        return elems
    }
    render() {
        if(!this.state.render) return null;

        if(this.props.shouldScrollOnRender) {
            setTimeout(function() {
                var objDiv = document.getElementById("auction-box");
                objDiv.scrollTop = objDiv.scrollHeight;
            }, 100)
        }

        return <div className="auction-message"><span>{ this.injectLinks(this.props.message) }</span></div>
    }
}

module.exports = AuctionLine