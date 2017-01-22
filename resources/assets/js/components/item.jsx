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
    if (!stats)
        return "";
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
    if (!stat)
        return "";
    if (sign && String(stat).charAt(0) != "-")
        stat = "+" + stat + " ";
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
    maxY = 0;

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
                        if (auc.Price > 0 && Math.ceil((now - priceDate) / 1000 / 60 / 60 / 24) < 30)
                            prices.push(auc.Price);
                    });

                }
                if (prices.length > 0) {
                    resolve(prices);
                } else {
                    reject("No prices");
                }
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
                if (stdDev == 0)
                    stdDev = mean / 4;
                min = mean - 3 * stdDev;
                max = mean + 3 * stdDev;
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
                for (var i = stats.min; i < stats.max; i += Math.floor(stdDev / 50)) {
                    chartData[index] = new Array(6);
                    chartData[index][0] = i;
                    chartData[index][1] = priceHelpers.NormalDensityZx(i, stats.mean, stats.stdDev);
                    chartData[index][2] = null;
                    chartData[index][3] = null;
                    chartData[index][4] = null;
                    chartData[index][5] = null;
                    if (chartData[index][1] > this.maxY)
                        this.maxY = chartData[index][1];
                    index++;
                }
                chartData[index] = [stats.mean, null, 0, null, null, null];
                chartData[index + 1] = [stats.mean, null, this.maxY, "Average (30 days): " + stats.mean.toLocaleString().toString() + "pp", null, null];

                if (chartData.length > 0)
                    resolve(chartData);
                else
                    reject("invalid chartData");
            }.bind(this));
        }.bind(this);

        createPrices().catch(function (err) {
            console.log("price error: " + err);
        }.bind(this))
            .then(generateStats).catch(function (err) {
            console.log("stats error: " + err);
        }.bind(this))
            .then(normalize).catch(function (err) {
            console.log("normalize error: " + err);
        }.bind(this))
            .then(function () {
                this.props.setGraphData({
                    options: {
                        title: 'Price Distribution',
                        hAxis: {
                            minorGridlines: {count: 6},
                            title: "Price (pp)"
                        },
                        vAxis: {
                            textPosition: 'none',
                        },
                        legend: 'none',
                        colors: [
                            '#3366CC', 'B82E2E', 'green'
                        ],
                        chartArea: {'width': '100%', 'height': '80%'}
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
                            label: "average-y"
                        },
                        {
                            type: "string",
                            role: "annotation"
                        },
                        {
                            type: "number",
                            label: "cost-y"
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
    }

    render() {
        console.log("RENDERING GRAPH INFO");
        console.log(this.props);
        // TODO Velium%20Crystal%20Staff is broken. Try commenting out each "then" to pinpoint the issue
        if (this.props.auctions && Array.isArray(this.props.graphData.rows) && this.props.graphData.rows.length > 0) {
            var priceY = this.maxY;
            this.props.graphData.rows = this.props.graphData.rows.filter(function (row) {
                return row[5] == null;
            });
            if (this.props.price != 0) {
                // calculate closest y point
                this.props.graphData.rows.some(function (row) {
                    if (row[0] >= this.props.price) {
                        priceY = row[1];
                        return true;
                    }
                }.bind(this));
                this.props.graphData.rows.push([this.props.price, null, null, null, 0, " "]);
                this.props.graphData.rows.push([this.props.price, null, null, null, priceY, this.props.price.toLocaleString().toString() + "pp"]);
            }
            return (
                <Chart
                    chartType="AreaChart"
                    data={this.props.graphData.data}
                    options={this.props.graphData.options}
                    rows={this.props.graphData.rows}
                    columns={this.props.graphData.columns}
                    graph_id="AreaChart"
                    width="100%"
                    height="400px"
                    legend_toggle
                />
            );
        } else {
            return (<div>Invalid pricing data</div>);
        }
    }
}

class AuctionStats extends Component {

    render() {
        var d = "never";
        var seller = "n/a";
        var price = "n/a";
        var average = {
            week: "n/a",
            month: "n/a",
            all: "n/a"
        };

        if (Array.isArray(this.props.auctions) && this.props.auctions.length != 0) {
            console.log(this.props.auctions);
            seller = this.props.auctions[0].Seller;
            price = this.props.auctions[0].Price.toLocaleString() + "pp";
            d = (helpers.prettyDate(new Date(this.props.auctions[0].Updated_at)));
            average.week = priceHelpers.timeMean(this.props.auctions, "week").toLocaleString() + "pp";
            average.month = priceHelpers.timeMean(this.props.auctions, "month").toLocaleString() + "pp";
            average.all = priceHelpers.timeMean(this.props.auctions, "all").toLocaleString() + "pp";
        }
        return (
            <div className="well search">
                <h4>Auction Statistics</h4>
                <p>
                    Last Seen: <span className="textright">{d}</span><br/>
                    Last Seller: <span className="textright">{seller}</span><br />
                    Last Price: <span className="textright">{price}</span><br />
                    Average (week): <span className="textright">{average.week}</span><br />
                    Average (month): <span className="textright">{average.month}</span><br />
                    Average (all time): <span className="textright">{average.all}</span><br />
                </p>
            </div>
        );
    }
}

/**
 * Item information.
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
        var ac = getStat(item.Statistics, "ac");
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
            ac: withLabel("AC", ac),
            dmg: withLabel("DMG", dmg),
            stats: withLabel("STR", stats.str, 1) + withLabel("STA", stats.sta, 1) + withLabel("DEX", stats.dex, 1) + withLabel("CHA", stats.cha, 1) + withLabel("AGI", stats.agi, 1) + withLabel("WIS", stats.wis, 1) + withLabel("INT", stats.int, 1) + withLabel("HP", stats.hp, 1) + withLabel("MANA", stats.mana, 1),
            saves: withLabel("SV MAGIC", saves.mr, 1) + withLabel("SV FIRE", saves.fr, 1) + withLabel("SV COLD", saves.cr, 1) + withLabel("SV POISON", saves.pr, 1) + withLabel("SV DISEASE", saves.dr, 1),
            effect: createEffect(effect),
            metrics: withLabel("WT", weight) + " " + withLabel("Size", size),
            classes: withLabel("Class", classes),
            races: withLabel("Race", races)
        };

        return (

            <div className="item-info">
                <div className="item-top-bg">
                    <div
                        className="item-title">{decodeURIComponent(this.props.item.Name).replace(/_/g, " ")}</div>
                </div>
                <div className="item-bg">
                    <div className="item-data">
                        <div className="item-icon">
                            <div className="floatright"><img alt={this.props.item.Image.replace("/images/", "")}
                                                             src={"https://wiki.project1999.com/" + this.props.item.Image}
                                                             width="40" height="40"/></div>
                        </div>
                        <p>
                            {lines.affinity ? <span>{lines.affinity} <br /></span> : ""}
                            {lines.slot ? <span>{lines.slot} <br /></span> : ""}
                            {lines.ac ? <span>{lines.ac} <br /></span> : ""}
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
                <div className="item-bot-bg"></div>
            </div>
        );
    }
}

/**
 * Auction data information
 */
class AuctionHistory extends Component {

    handleMouseEnter(p) {
        this.props.graphFunc(p);
        console.log("Need to plot " + p);
    }

    handleMouseLeave() {
        this.props.graphFunc(0);
        console.log("Remove plot");
    }

    render() {
        return (
            <div>
                <h3>Auction History</h3>
                <table id="price-info" className="table table-striped table-hover search">
                    <tbody>
                    <tr>
                        <th>Player</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Time</th>
                    </tr>
                    {this.props.auctions.map(function (auction) {
                        // format date
                        var d = helpers.prettyDate(new Date(auction.Updated_at));

                        return <tr key={auction.Created_at} onMouseLeave={this.handleMouseLeave.bind(this)}
                                   onMouseEnter={this.handleMouseEnter.bind(this, auction.Price)}>
                            <td>{auction.Seller}</td>
                            <td>{auction.Price.toLocaleString()}pp</td>
                            <td>{auction.Quantity}</td>
                            <td><Link
                                to={"/item/" + encodeURI(auction.Item) + "/auctions"}>{d}</Link>
                            </td>
                        </tr>
                    }.bind(this))}
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
    constructor(props) {
        super(props);
        this.state = {
            hoverPrice: 0
        }
    };

    plotHoverPrice(newPrice) {
        this.setState({
            hoverPrice: newPrice
        });
    };

    render() {
        // no auctions
        if (this.props.auctions.length == 0) {
            // console.log("NO AUCTIONS FOUND");
            return (<div>
                <h2 id="page-title" className="page-header">
                    No auctions found
                </h2>
            </div>);
        }
        // render raw auctions
        else if (typeof this.props.raw !== "undefined") {
            // console.log("RENDERING RAW AUCTIONS");
            return (
                <div className="row">
                    <RawAuctions rawAuctions={this.props.rawAuctionId} item={this.props.item}/>
                </div>
            );
        } else {
            // render price history and graph
            // console.log("RENDERING PRICE HISTORY");
            return (
                <div className="row">
                    <div className="col-md-7">
                        <AuctionHistory auctions={this.props.auctions} item={this.props.item}
                                        graphFunc={this.plotHoverPrice.bind(this)}/>
                    </div>
                    <div className="col-md-5">
                        <ItemGraph graphData={this.props.graphData} setGraphData={this.props.setGraphData}
                                   auctions={this.props.auctions} item={this.props.item} price={this.state.hoverPrice}/>
                    </div>
                </div>
            )
        }
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
            raw: false,
            graphData: {},
            average: 0
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
        // ?skip=0&take=10&ascending=1
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

    setGraphData(graphState) {
        this.setState({graphData: graphState})
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
                            {decodeURIComponent(this.state.item.Name).replace(/_/g, " ")}
                        </h1>
                        <div>
                            <div className="col-md-7">
                                <ItemInfo item={this.state.item}/>
                            </div>
                            <div className="col-md-5">
                                <AuctionStats auctions={this.state.auctions}/>
                            </div>
                        </div>
                    </div>
                    <ItemAuctionStats raw={this.props.params.auctions} auctions={this.state.auctions}
                                      graphData={this.state.graphData}
                                      item={this.state.item} setGraphData={this.setGraphData.bind(this)}/>
                </div>
            );
    }
}

export default Item
