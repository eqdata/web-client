import React, {Component} from 'react';
import ReactDOM, {render} from 'react-dom';
import {Link} from 'react-router';

import helpers from '../utils/helpers.js';
import serverSelect from "../utils/serverSelect";

class ResultItem extends Component {

    constructor(props) {
        super(props);
        this.state = {
            itemInfo: [],
            aucInfo: "none"
        };
    }

    componentDidMount() {
        // fade in
        var elem = ReactDOM.findDOMNode(this)
        elem.style.opacity = 0;
        window.requestAnimationFrame(function () {
            elem.style.transition = "opacity 550ms";
            elem.style.opacity = 1;
        });
    }

    componentWillMount() {
        // get state here from API with this.props.params
        helpers.ajax({
            url: "http://52.205.204.206:8085/items/" + this.props.item + "?server=" + serverSelect.getServer(),
            contentType: "application/json",
            cache: false,
            type: "GET",
        }).then(function (payload) {
            this.setState({itemInfo: payload.data});
        }.bind(this), function (err) {
            console.log("error: " + err);
        });

        helpers.ajax({
            url: "http://52.205.204.206:8085/items/auctions/" + this.props.item + "?take=1" +
            "&server=" + serverSelect.getServer(),
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
        var seller = "n/a";
        var price = "";
        if (this.state.aucInfo != "none") {
            d = (helpers.prettyDate(new Date(this.state.aucInfo[0].Auctioned_At)));
            seller = this.state.aucInfo[0].Seller;
            price = "(" + this.state.aucInfo[0].Price.toLocaleString() + "pp)";
        }
        return (
            <Link to={"/item/" + encodeURI(this.props.item)}>
                <div id="content-wrapper" className="well well-sm well-hover col-xs-12 col-sm-12 col-md-12">
                    <div className="col-xs-10 col-sm-10 col-md-10 search">
                        <h4>{decodeURIComponent(this.props.item).replace(/_/g, " ")}</h4>
                        <div className="search-desc">
                            Most Recent Seller: {seller}<br />
                            Last Seen: {d} {price}</div>
                    </div>
                    <div className="search-img"><img src={"https://wiki.project1999.com/" + this.state.itemInfo.Image}
                                                     width="40" height="40"/></div>

                </div>
            </Link>
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
            url: "http://52.205.204.206:8085/items/search/" + this.props.params.terms +
            "?server=" + serverSelect.getServer(),
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
        else {
            rows.push(
                <h3>No results</h3>
            );
        }
        return (
            <div>
                <h1 id="query-string" className="page-header">
                    Search: {this.props.params.terms} &nbsp;
                    <span className={"server-"+serverSelect.getServer()} id="page-title">{helpers.titleCase(serverSelect.getServer())} Server</span>
                </h1>
                {rows}
            </div>
        );
    }
}

export default SearchResults
