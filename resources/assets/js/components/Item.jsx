import React, {Component} from 'react';
import ReactDOM, {render} from 'react-dom';
import {Chart} from 'react-google-charts';
import {Link} from 'react-router';
import ItemInfoBox from './ItemInfoBox';

import helpers from '../utils/helpers.js';
import priceHelpers from '../utils/priceData';
import serverSelect from "../utils/serverSelect";

/**
 * Raw auction text as recorded from /auc
 */
class RawAuctions extends Component {
    render() {
        return (
            <h2>TODO: Put raw auctions here and highlight the one in question if specified (need endpoint and rawAuc ID
                on auction)</h2>
        )
    };
}

/**
 * Price districution graph
 */
class ItemGraph extends Component {
    maxY = 0;
    mean = 0;

    componentWillMount() {
        var index = 0;
        var chartData = [];
        var stdDev = 0;
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
                        var priceDate = new Date(auc.Auctioned_At);
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
                this.mean = Math.floor(priceHelpers.arrayMean(prices));
                // var pricesFiltered = prices.filter(function (price) {
                //     // TODO remove outliers from calculation of mean using a filter function on the array
                //
                // });
                if (stdDev == 0)
                    stdDev = mean / 4;
                min = this.mean - 3 * stdDev;
                max = this.mean + 3 * stdDev;
                if (stdDev && this.mean && min && max)
                    resolve({
                        stdDev: stdDev,
                        mean: this.mean,
                        min: min,
                        max: max
                    });
                else
                    reject("Invalid stats");
            }.bind(this));
        }.bind(this);

        var normalize = function (stats) {
            return new Promise(function (resolve, reject) {
                var resolution = Math.ceil((stats.max - stats.min) / 100);
                // normalize price range
                for (var i = Math.floor(stats.min); i <= stats.max; i += resolution) {
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
                        chartArea: {'width': '100%', 'height': '70%', 'top': 0}
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
                this.props.graphData.rows.push([this.mean, null, null, null, priceY, " "]);
            }
            return (
                <div>
                    <h3>Price Distribution</h3>
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
                </div>
            );
        } else {
            return (<h3>Not enough data to graph</h3>);
        }
    }
}

/**
 * Text box with simple auction stats
 */
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
            seller = this.props.auctions[0].Seller;
            price = this.props.auctions[0].Price.toLocaleString() + "pp";
            d = (helpers.prettyDate(new Date(this.props.auctions[0].Auctioned_At)));
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
 * Auction history based on sellers
 */
class AuctionHistory extends Component {

    handleMouseEnter(p) {
        this.props.graphFunc(p);
    }

    handleMouseLeave() {
        this.props.graphFunc(0);
    }

    render() {
        var auction = null;
        var d = null;
        var rows = [<tr key="0">
            <th>Player</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Time</th>
        </tr>];
        for (var i = 1; i <= this.props.auctions.length; i++) {
            // format date
            auction = this.props.auctions[i - 1]; // reserve 0 for <tr>
            d = helpers.prettyDate(new Date(auction.Auctioned_At));

            // TODO add seller page
            rows.push(<tr key={i} onMouseLeave={this.handleMouseLeave.bind(this)}
                          onMouseEnter={this.handleMouseEnter.bind(this, auction.Price)}>
                <td><Link to={"/seller/SERVER/" + auction.Seller}>{auction.Seller}</Link></td>
                <td>{auction.Price.toLocaleString()}pp</td>
                <td>{auction.Quantity}</td>
                <td><Link
                    to={"/item/" + encodeURI(auction.Item) + "/auctions"}>{d}</Link>
                </td>
            </tr>);
        }

        return (
            <div>
                <h3>Auction History</h3>
                <table id="price-info" className="table table-striped table-hover">
                    <tbody>
                    {rows}
                    </tbody>
                </table>
            </div>
        )
    }
}

/**
 * Item statistics that appear below item box
 */
class HistoryGraphFrame extends Component {
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
        if (!this.props.auctions || this.props.auctions.length == 0) {
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

    componentDidMount() {
        // fade in
        var elem = ReactDOM.findDOMNode(this)
        elem.style.opacity = 0;
        window.requestAnimationFrame(function () {
            elem.style.transition = "opacity 550ms";
            elem.style.opacity = 1;
        });
    }

    /**
     * Remove auctions from the same seller within 24 hour periods
     * NOTE: assumes descending order by date. Only newest auctions are kept.
     * @param auctions
     */
    sanitizeAuctions(auctions) {
        var currentMonth = "";
        var currentDay = "";
        var currentYear = "";
        var date = null;
        var daysSellers = [];
        var sanitizedAuctions = [];
        auctions.forEach(function (auction) {
            date = new Date(auction.Auctioned_At);
            var duplicate = false;
            // if current day
            if (date.getDay() == currentDay && date.getYear() == currentYear && date.getMonth() == currentMonth) {
                // check if duplicate
                duplicate = daysSellers.some(function (seller) {
                    return seller.Seller == auction.Seller;
                });
                // if not, push it
                if (!duplicate) {
                    daysSellers.push(auction);
                }
            } else {
                // next day
                currentDay = date.getDay();
                currentMonth = date.getMonth();
                currentYear = date.getYear();
                sanitizedAuctions = sanitizedAuctions.concat(daysSellers);
                daysSellers[0] = auction;
            }
        });
        return sanitizedAuctions.concat(daysSellers);
    }


    componentWillMount() {
        // get state here from API with this.props.params
        helpers.ajax({
            url: "http://52.205.204.206:8085/items/" + this.props.params.item + "?server=" + serverSelect.getServer(),
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
            url: "http://52.205.204.206:8085/items/auctions/" + this.props.params.item + "?server=" + serverSelect.getServer(),
            contentType: "application/json",
            cache: false,
            type: "GET",
        }).then(function (payload) {
            this.setState({auctions: payload.data.Auctions});//this.sanitizeAuctions(payload.data.Auctions)});
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
                                <ItemInfoBox item={this.state.item}/>
                            </div>
                            <div className="hidden-lg hidden-md hidden-sm">&nbsp;</div>
                            <div className="col-md-5">
                                <AuctionStats auctions={this.state.auctions}/>
                            </div>
                        </div>
                    </div>
                    <HistoryGraphFrame raw={this.props.params.auctions} auctions={this.state.auctions}
                                       graphData={this.state.graphData}
                                       item={this.state.item} setGraphData={this.setGraphData.bind(this)}/>
                </div>
            );
    }
}

export default Item
