import React, {Component} from 'react';
import {render} from 'react-dom';
import {Link} from 'react-router';

import helpers from '../utils/helpers.js';

class ResultItem extends Component {

    constructor(props) {
        super(props);
        this.state = {
            itemInfo: [],
            aucInfo: "none"
        };
    }

    componentWillMount() {
        // get state here from API with this.props.params
        helpers.ajax({
            url: "http://52.205.204.206:8085/items/" + this.props.item,
            contentType: "application/json",
            cache: false,
            type: "GET",
        }).then(function (payload) {
            this.setState({itemInfo: payload.data});
        }.bind(this), function (err) {
            console.log("error: " + err);
        });

        helpers.ajax({
            url: "http://52.205.204.206:8085/items/auctions/" + this.props.item + "?take=1",
            contentType: "application/json",
            cache: false,
            type: "GET",
        }).then(function (payload) {
            this.setState({aucInfo: payload.data.Auctions});
        }.bind(this), function (err) {
            console.log("error: " + err);
        });
    }

    render() {
        var d = "never";
        if (this.state.aucInfo) {
            d = (helpers.timesince(new Date(this.state.aucInfo[0].Updated_at)) + " ago");
        }
        return (
            <div id="content-wrapper" className="well well-sm">
                <h4><Link to={"/item/" + encodeURI(this.props.item)}>{this.props.item}</Link></h4>
                <p>Average Price: {this.state.itemInfo.AveragePrice}<br />
                    Last Seen: {d}</p>
            </div>
        );
    }
}

class SearchResults extends Component {

    constructor(props) {
        super(props);
        this.state = {
            results: []
        };
    }

    componentWillMount() {
        // get state here from API with this.props.params
        helpers.ajax({
            url: "http://52.205.204.206:8085/items/search/" + this.props.params.terms,
            contentType: "application/json",
            cache: false,
            type: "GET",
        }).then(function (payload) {
            this.setState({results: payload.data});
        }.bind(this), function (err) {
            console.log("error: " + err);
        });
    }

    render() {
        var rows = [];
        if (this.state.results.Items)
            this.state.results.Items.forEach(function (result) {
                rows.push(<ResultItem key={result} item={result}/>)
            });
        else
            return (
                <div>
                    <a href="#" title="ajax:/tooltip/test">Some link</a>
                <h2>No items were found using the phrase "{this.props.params.terms}"</h2>
                    </div>
            );
        return (
            <div>
                <h1 id="page-title" className="page-header">
                    Search Results
                    <small id="query-string"> {this.props.params.terms}</small>
                </h1>
                {rows}
            </div>
        );
    }
}

export default SearchResults
