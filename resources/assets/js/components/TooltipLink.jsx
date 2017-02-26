import React, {Component} from 'react';
import {render} from 'react-dom';
import ReactDOM from 'react-dom';
import Toptip from '../utils/Toptip'
import Helpers from '../utils/helpers'
import ItemInfoBox from './ItemInfoBox';
import PriceHelpers from '../utils/priceData';
import {Link} from 'react-router';

class TooltipLink extends Component {
    constructor(props) {
        super(props);
        this.toptip = this.props.toptip || new Toptip();
        this.state = {
            item: [],
            auctions: []
        };
    }

    setTooltipContent() {
        var aucStats = {
            week: "n/a",
            month: "n/a",
            allTime: "n/a"
        };

        var toptip = document.getElementById("toptip");
        var placeholder = {
            Name: this.props.name,
            AveragePrice: 0,
            Image: null,
            Statistics: [],
            Effect: { URI: "", Name: "", Restriction: "" },
            Affinities: [],
            Races: [],
            Classes: [],
            Slots: [],
            Loading: true
        }
        ReactDOM.render(<ItemInfoBox item={placeholder} />, toptip);

        Helpers.ajax({
            url: "http://52.205.204.206:8085/items/" + this.props.name.trim(),
            contentType: "application/json",
            cache: false,
            type: "GET",
        }).then(function (payload) {
            this.setState({item: payload.data});
            Helpers.ajax({
                url: "http://52.205.204.206:8085/items/auctions/" + this.props.name.trim() + "?server=" + (this.props.server || "blue"),
                contentType: "application/json",
                cache: false,
                type: "GET",
            }).then(function (payload) {
                this.setState({auctions: payload.data.Auctions});//this.sanitizeAuctions(payload.data.Auctions)});
                if (this.state.auctions) {
                    aucStats.week = PriceHelpers.timeMean(this.state.auctions, "week").toLocaleString() + "pp";
                    aucStats.month = PriceHelpers.timeMean(this.state.auctions, "month").toLocaleString() + "pp";
                    aucStats.allTime = PriceHelpers.timeMean(this.state.auctions, "all").toLocaleString() + "pp";
                }

                var toptip = document.getElementById("toptip");
                ReactDOM.render(<ItemInfoBox item={this.state.item} aucStats={aucStats}/>, toptip);
            }.bind(this));
        }.bind(this));

    }

    showTooltip() {
        this.toptip.showTooltip();
    }

    hideTooltip() {
        this.toptip.hideTooltip();
        // don't carry data over
        this.setState({
            item: [],
            auctions: []
        })
    }

    render() {

        return (
            <Link to={"/item/" + this.props.name.trim() }
                  onMouseEnter={this.setTooltipContent.bind(this)}
                  onMouseOver={this.showTooltip.bind(this)}
                  onMouseLeave={this.hideTooltip.bind(this)}
                  onMouseUp={this.hideTooltip.bind(this)}>
                { this.props.name }
            </Link>
        )
    }
}

// var element = document.getElementsByClassName('pgg-trigger-tooltip');
// if (element.length > 0) {
//     for (var i = 0; i < element.length; i++) {
//         ReactDOM.render(<TooltipLink reference={element[i].dataset.ref}/>, element[i]);
//     }
// }

export default TooltipLink