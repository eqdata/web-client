import React, {Component} from 'react';
import {render} from 'react-dom';

import helpers from '../helpers.js';

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
    return null;
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
        if (!this.props.auctions)
            return (<div>
                <h2 id="page-title" className="page-header">
                    No auctions not found
                </h2>
            </div>);

        return (
            <div className="row">
                <h3>Auction History</h3>
                <table id="price-info" className="table table-striped">
                    <tbody>
                    <tr>
                        <th>Seller</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Date</th>
                    </tr>
                    {this.props.auctions.map(function (auction) {
                        return <tr key={auction.Seller}>
                            <td>{auction.Seller}</td>
                            <td>{auction.Price}</td>
                            <td>{auction.Quantity}</td>
                            <td>{auction.Created_at}</td>
                        </tr>
                    })}
                    </tbody>
                </table>
            </div>
        )
    }
}

/**
 * Item page including item box and auction data info for the item
 */
class Item extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            item: [],
            auctions: []
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
        return (
            <div>
                <h1 id="page-title" className="page-header">
                    {this.state.item.Name}
                </h1>
                <ItemInfo item={this.state.item}/>
                <PriceInfo auctions={this.state.auctions}/>
            </div>
        );
    }
}

export default Item
