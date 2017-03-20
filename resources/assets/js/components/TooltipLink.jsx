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
            item: null,
            auctions: [],
            downloadedInfo: false
        };
    }

    setTooltipContent() {
        var aucStats = {
            week: "n/a",
            month: "n/a",
            allTime: "n/a"
        };

        var toptip = document.getElementById("toptip");

        // TODO: this info could actually be processed on parent component so downloaded items are
        // stored in a map that we can pass down as props allowing each item to DL only once
        if(this.state.downloadedInfo && this.state.item !== null) {
            console.log("ITEM IS: ", this.state.item)
            ReactDOM.render(<ItemInfoBox item={this.state.item} aucStats={aucStats}/>, toptip);
        } else {
            // IMPLEMENT SOME SORT OF LOCAL CACHE LAYER FOR THE CURRENT SESSION
            // if(loadFromLocalStorage) {
            //
            // }

            if(this.state.item === null) {
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
            }

            Helpers.ajax({
                url: "http://52.205.204.206:8085/items/" + this.props.name.trim(),
                contentType: "application/json",
                cache: false,
                type: "GET",
            }).then(function (payload) {
                if(this.state.item === null) {
                    this.setState({item: payload.data});
                    console.log("Set item to: ", payload.data)
                }
                aucStats.week = Math.floor(this.state.item.PriceData.Weekly.Average).toLocaleString() + "pp";//PriceHelpers.timeMean(this.state.auctions, "week").toLocaleString() + "pp";
                aucStats.month = Math.floor(this.state.item.PriceData.Monthly.Average).toLocaleString() + "pp";//PriceHelpers.timeMean(this.state.auctions, "month").toLocaleString() + "pp";
                aucStats.allTime = Math.floor(this.state.item.PriceData.All.Average).toLocaleString() + "pp";//PriceHelpers.timeMean(this.state.auctions, "all").toLocaleString() + "pp";
                this.downloadedInfo = true;
                var toptip = document.getElementById("toptip");
                ReactDOM.render(<ItemInfoBox item={this.state.item} aucStats={aucStats}/>, toptip);

            }.bind(this));
        }
    }

    loadFromLocalStorage() {

    }

    showTooltip() {
        this.toptip.showTooltip();
    }

    hideTooltip() {
        this.toptip.hideTooltip();
        // don't carry data over
        // we want to carry data over so we dont redownload
        // this.setState({
        //     item: [],
        //     auctions: []
        // })
    }

    render() {

        return (
            <Link to={"/item/" + this.props.name.trim() }
                  onMouseEnter={this.setTooltipContent.bind(this)}
                  onMouseOver={this.showTooltip.bind(this)}
                  onMouseLeave={this.hideTooltip.bind(this)}
                  onMouseUp={this.hideTooltip.bind(this)}
                  target="_blank"
            >
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