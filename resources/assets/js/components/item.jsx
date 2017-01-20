import React, {Component} from 'react';
import {render} from 'react-dom';
import {Chart} from 'react-google-charts';
import {Link} from 'react-router';

import helpers from '../utils/helpers.js';
import priceHelpers from '../utils/priceData';
/**
 * Returns a stat value based on a key
 * @param stats stats object
 * @param code key
 * @returns {*} value corresponding to key
 */
function getStat(stats, code) {
    var filtered = stats.filter(
        function (stat) {
            return stat.Code == code;
        }
    );
    if (filtered.length)
        return filtered[0].Value;
    else
        return "";
}

/**
 * Generates a string label for a specific stat with "+" sign if indicated.
 * @param label Label without ":"
 * @param stat Stat value
 * @param sign add "+" sign
 * @returns {string}
 */
function withLabel(label, stat, sign = false) {
    if (sign && String(stat).charAt(0) != "-")
        stat = "+" + stat + " ";
    else
        return (["+ ", ""].indexOf(stat) == -1 ? label + ": " + stat : "");
}

/**
 * onverts effect object to elements
 * @param effect
 * @returns {*}
 */
function createEffect(effect) {
    if (effect.name)
        return <span>Effect: <a href={effect.uri}>{effect.name}</a> {effect.restrict}</span>;
    else
        return null;
}

class RawAuctions extends Component {
    render() {
        return (
            <h2>Put raw auctions here and highlight the one in question if specified</h2>
        )
    };
}

class ItemGraph extends Component {

    componentWillMount() {
        var index = 0;
        var chartData = [];
        var stdDev = 0;
        var mean = 0;
        var min = 0;
        var max = 0;

        var prices = [];
        var prec = 10;
        var now = new Date();
        // standard deviation
        var createPrices = function () {
            return new Promise(function (resolve, reject) {
                if (this.props.auctions.length > 0) {
                    this.props.auctions.forEach(function (auc) {
                        var priceDate = new Date(auc.Updated_at);
                        // only include auctions in last 30 days
                        // if (Math.ceil((now - priceDate) * 1000 * 60 * 60 * 24) < 30)
                        prices.push(auc.Price);
                    });
                }
                if (prices.length > 0)
                    resolve(prices);
                else
                    reject("No prices");
            }.bind(this));
        }.bind(this);

        var generateStats = function (prices) {
            return new Promise(function (resolve, reject) {
                stdDev = priceHelpers.getStandardDeviation(prices, prec);
                mean = Math.floor(priceHelpers.arrayMean(prices));
                // var pricesFiltered = prices.filter(function (price) {
                //     // TODO remove outliers from calculation of mean using a filter function on the array
                //
                // });
                min = mean - 2 * stdDev;
                max = mean + 2 * stdDev;
                console.log("std: " + stdDev);
                console.log("min: " + min);
                console.log("mean: " + mean);
                if (stdDev && mean && min && max)
                    resolve({
                        stdDev: stdDev,
                        mean: mean,
                        min: min,
                        max: max
                    });
                else
                    reject("Invalid stats");
            }.bind(this));
        }.bind(this);

        var normalize = function (stats) {
            return new Promise(function (resolve, reject) {
                // normalize price range
                for (var i = stats.min; i < stats.max; i += 1) {
                    chartData[index] = new Array(4);
                    chartData[index][0] = i;
                    chartData[index][1] = priceHelpers.NormalDensityZx(i, stats.mean, stats.stdDev);
                    chartData[index][2] = null;
                    chartData[index][3] = null;
                    index++;
                }
                // TODO 2nd param
                chartData[index] = [stats.mean, null, 0, null];
                chartData[index + 1] = [stats.mean, null, 0.0004, "Average: " + stats.mean.toString()];
                if (chartData.length > 0)
                    resolve(chartData)
                else
                    reject("invalid chartData");
            }.bind(this));
        }.bind(this);

        var writeState = function (chartData) {
            return new Promise(function (resolve, reject) {
                this.setState({
                    options: {
                        title: 'Price Distribution',
                        hAxis: {minorGridlines: {count: 6}},
                        legend: 'none'
                    },
                    rows: chartData,
                    columns: [
                        {
                            type: "number",
                            label: "x-value"
                        },
                        {
                            type: "number",
                            label: "y-value"
                        },
                        {
                            type: "number",
                            label: "annotation-y"
                        },
                        {
                            type: "string",
                            role: "annotation"
                        }
                    ],
                    annotations: {
                        style: "line"
                    }
                });
            }.bind(this));
        }.bind(this);

        createPrices().catch(function (err) {
            console.log("price error: " + err);
        })
            .then(generateStats).catch(function (err) {
            console.log("stats error: " + err);
        })
            .then(normalize).catch(function (err) {
            console.log("normalize error: " + err);
        })
            .then(writeState).catch(function (err) {
            console.log("state write error: " + err);
        });
    }

    render() {
        if (this.props.auctions)
            return (
                <Chart
                    chartType="AreaChart"
                    data={this.state.data}
                    options={this.state.options}
                    rows={this.state.rows}
                    columns={this.state.columns}
                    graph_id="AreaChart"
                    width="100%"
                    height="400px"
                    legend_toggle
                />
            );
        else
            return (<div></div>);
    }
}

/**
 * Item information box.
 */
class ItemInfo extends Component {

    render() {
        // parse info
        var item = this.props.item;
        var affinities = item.Affinities ? item.Affinities.join(" ") : "";
        var slots = item.Slots ? item.Slots.join("") : "";
        var skill = getStat(item.Statistics, "skill");
        var delay = getStat(item.Statistics, "atk delay");
        var dmg = getStat(item.Statistics, "dmg");
        var stats = {
            str: getStat(item.Statistics, "str"),
            sta: getStat(item.Statistics, "sta"),
            dex: getStat(item.Statistics, "dex"),
            cha: getStat(item.Statistics, "cha"),
            agi: getStat(item.Statistics, "agi"),
            wis: getStat(item.Statistics, "wis"),
            int: getStat(item.Statistics, "int"),
            hp: getStat(item.Statistics, "hp"),
            mana: getStat(item.Statistics, "mana"),
        };
        var saves = {
            mr: getStat(item.Statistics, "sv magic"),
            fr: getStat(item.Statistics, "sv fire"),
            cr: getStat(item.Statistics, "sv cold"),
            pr: getStat(item.Statistics, "sv poison"),
            dr: getStat(item.Statistics, "sv disease"),
        };
        var effect = {
            uri: item.Effect.URI ? item.Effect.URI : "",
            name: item.Effect.Name ? item.Effect.Name : "",
            restrict: item.Effect.Restriction ? item.Effect.Restriction : "",
        };
        var weight = getStat(item.Statistics, "wt");
        var size = getStat(item.Statistics, "size");
        var classes = item.Classes ? item.Classes.join(" ") : "";
        var races = item.Races ? item.Races.join(" ") : "";

        // create lines
        var lines = {
            affinity: affinities,
            slot: withLabel("Slot", slots),
            skill: withLabel("Skill", skill) + " " + withLabel("Atk Delay", delay),
            dmg: withLabel("DMG", dmg),
            stats: withLabel("STR", stats.str, 1) + withLabel("STA", stats.sta, 1) + withLabel("DEX", stats.dex, 1) + withLabel("CHA", stats.cha, 1) + withLabel("AGI", stats.agi, 1) + withLabel("WIS", stats.wis, 1) + withLabel("INT", stats.int, 1) + withLabel("HP", stats.hp, 1) + withLabel("MANA", stats.mana, 1),
            saves: withLabel("SV MAGIC", saves.mr, 1) + withLabel("SV FIRE", saves.fr, 1) + withLabel("SV COLD", saves.cr, 1) + withLabel("SV POISON", saves.pr, 1) + withLabel("SV DISEASE", saves.dr, 1),
            effect: createEffect(effect),
            metrics: withLabel("WT", weight) + " " + withLabel("Size", size),
            classes: withLabel("Class", classes),
            races: withLabel("Race", races)
        };

        return (
            <div>
                <div className="itemtopbg">
                    <div className="itemtitle">{this.props.item.Name}</div>
                </div>
                <div className="itembg">
                    <div className="itemdata">
                        <div className="itemicon">
                            <div className="floatright"><img alt={this.props.item.Image.replace("/images/", "")}
                                                             src={"https://wiki.project1999.com/" + this.props.item.Image}
                                                             width="40" height="40"/></div>
                        </div>
                        <p>
                            {lines.affinity ? <span>{lines.affinity} <br /></span> : ""}
                            {lines.slot ? <span>{lines.slot} <br /></span> : ""}
                            {lines.skill != " " ? <span>{lines.skill} <br /></span> : ""}
                            {lines.dmg ? <span>{lines.dmg} <br /></span> : ""}
                            {lines.stats ? <span>{lines.stats} <br /></span> : ""}
                            {lines.saves ? <span>{lines.saves} <br /></span> : ""}
                            {lines.effect ? <span>{lines.effect} <br /></span> : ""}
                            {lines.metrics ? <span>{lines.metrics} <br /></span> : ""}
                            {lines.classes ? <span>{lines.classes} <br /></span> : ""}
                            {lines.races ? <span>{lines.races} <br /></span> : ""}
                        </p>
                    </div>
                </div>
                <div className="itembotbg"></div>
            </div>
        );
    }
}

/**
 * Auction data information
 */
class PriceInfo extends Component {
    render() {
        var now = new Date();
        return (
            <div className="row">
                <h3>Auction History</h3>
                <table id="price-info" className="table table-striped">
                    <tbody>
                    <tr>
                        <th>Player</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Time</th>
                    </tr>
                    {this.props.auctions.reverse().map(function (auction) {
                        // format date
                        var d = new Date(auction.Updated_at);
                        if (Math.ceil(((now - d) / 1000) / 60) < 59)
                            d = helpers.timesince(d) + " ago";
                        else
                            d = d.toString();

                        return <tr key={auction.Created_at}>
                            <td>{auction.Seller}</td>
                            <td>{auction.Price}</td>
                            <td>{auction.Quantity}</td>
                            <td><Link
                                to={"/item/" + encodeURI(auction.Item) + "/auctions"}>{d}</Link>
                            </td>
                        </tr>
                    })}
                    </tbody>
                </table>
            </div>
        )
    }
}

/**
 * Item statistics that appear below item box
 */
class ItemAuctionStats extends Component {
    render() {
        // no auctions
        if (!this.props.auctions)
            return (<div>
                <h2 id="page-title" className="page-header">
                    No auctions found
                </h2>
            </div>);

        // render raw auctions
        else if (this.props.raw) {
            return (
                <div className="row">
                    <RawAuctions rawAuctions={this.props.rawAuctionId} item={this.props.item}/>
                </div>
            );
        } else
        // render price history and graph
            return (
                <div className="row">
                    <div className="col-md-5">
                        <PriceInfo auctions={this.props.auctions} item={this.props.item}/>
                    </div>
                    <div className="col-md-7">
                        <ItemGraph auctions={this.props.auctions} item={this.props.item}/>
                    </div>
                </div>
            )
    }
}

/**
 * Item page including item box and auction data info for the item
 */
class Item extends Component {

    constructor(props) {
        super(props);
        this.state = {
            item: [],
            auctions: [],
            raw: false
        };
    }

    componentWillMount() {
        // get state here from API with this.props.params
        helpers.ajax({
            url: "http://52.205.204.206:8085/items/" + this.props.params.item,
            contentType: "application/json",
            cache: false,
            type: "GET",
        }).then(function (payload) {
            this.setState({item: payload.data});
        }.bind(this), function (err) {
            console.log("error: " + err);
        });

        // TODO paginate
        helpers.ajax({
            url: "http://52.205.204.206:8085/items/auctions/" + this.props.params.item,
            contentType: "application/json",
            cache: false,
            type: "GET",
        }).then(function (payload) {
            this.setState({auctions: payload.data.Auctions});
        }.bind(this), function (err) {
            console.log("error: " + err);
        });
    }

    render() {
        if (this.state.item.length == 0)
            return (<div>
                <h1 id="page-title" className="page-header">
                    Item not found
                </h1>
            </div>);
        else
            return (
                <div>
                    <div className="row">
                        <h1 id="page-title" className="page-header">
                            {this.state.item.Name}
                        </h1>
                        <ItemInfo item={this.state.item}/>
                    </div>
                    <ItemAuctionStats raw={this.props.params.auctions} auctions={this.state.auctions}
                                      item={this.state.item}/>
                </div>
            );
    }
}

export default Item
