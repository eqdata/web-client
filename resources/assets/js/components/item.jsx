import React, {Component} from 'react';
import {render} from 'react-dom';

import helpers from '../helpers.js';

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

function withLabel(label, stat, sign = false) {
    if (sign && String(stat).charAt(0) != "-")
        stat = "+" + stat + " ";
    return (["+ ", ""].indexOf(stat) == -1 ? label + ": " + stat : "");
}

function createEffect(effect) {
    return <span><a href={effect.uri}>{effect.name}</a> {effect.restrict}</span>;
}

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
                            {lines.skill ? <span>{lines.skill} <br /></span> : ""}
                            {lines.dmg ? <span>{lines.dmg} <br /></span> : ""}
                            {lines.stats ? <span>{lines.stats} <br /></span> : ""}
                            {lines.saves ? <span>{lines.saves} <br /></span> : ""}
                            {lines.effect ? <span>Effect: {lines.effect} <br /></span> : ""}
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

class PriceInfo extends Component {
    render() {
        return (
            <div id="price-info">
                <h2>{this.props.item.AveragePrice}</h2>
            </div>
        )
    }
}

class Item extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            item: [],
            test: "hey"
        };
        // this.state = {
        //     item: {
        //         "Name": "Fiery Avenger",
        //         "Image": "/images/Item_519.png",
        //         "AveragePrice": 0,
        //         "Statistics": [
        //             {
        //                 "Code": "skill",
        //                 "Value": "2H SLASHING"
        //             },
        //             {
        //                 "Code": "atk delay",
        //                 "Value": 44
        //             },
        //             {
        //                 "Code": "dmg",
        //                 "Value": 33
        //             },
        //             {
        //                 "Code": "str",
        //                 "Value": 15
        //             },
        //             {
        //                 "Code": "cha",
        //                 "Value": 10
        //             },
        //             {
        //                 "Code": "wis",
        //                 "Value": 15
        //             },
        //             {
        //                 "Code": "hp",
        //                 "Value": 25
        //             },
        //             {
        //                 "Code": "mana",
        //                 "Value": 25
        //             },
        //             {
        //                 "Code": "sv fire",
        //                 "Value": 5
        //             },
        //             {
        //                 "Code": "sv disease",
        //                 "Value": 5
        //             },
        //             {
        //                 "Code": "sv cold",
        //                 "Value": 5
        //             },
        //             {
        //                 "Code": "sv magic",
        //                 "Value": 5
        //             },
        //             {
        //                 "Code": "sv poison",
        //                 "Value": 5
        //             },
        //             {
        //                 "Code": "wt",
        //                 "Value": 0.1
        //             },
        //             {
        //                 "Code": "size",
        //                 "Value": "LARGE"
        //             }
        //         ],
        //         "Effect": {
        //             "URI": "http://wiki.project1999.com/Flame_Shock",
        //             "Name": "Flame Shock",
        //             "Restriction": "(Combat, Casting Time: Instant) at Level 45"
        //         },
        //         "Affinities": [
        //             "MAGIC ITEM",
        //             "LORE ITEM",
        //             "NO DROP"
        //         ],
        //         "Races": [
        //             "ALL"
        //         ],
        //         "Classes": [
        //             "PAL"
        //         ],
        //         "Slots": [
        //             "PRIMARY"
        //         ]
        //     }
        // };
    }

    componentDidMount() {
        // get state here from API with this.props.params
        helpers.ajax({
            url: "http://52.205.204.206:8085/items/" + this.props.params.item,
            contentType: "application/json",
            cache: false,
            type: "GET",
        }).then(function(data) {
            console.log("data: " + data);
            this.setState({item: data, test: "world"});
        }, function(err) {
            console.log("error: " + err);
        });
    }

    render() {
        console.log("render() item: " + this.state.item);
        console.log(this.state);
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
                <PriceInfo item={this.state.item}/>
            </div>
        );
    }

}

export default Item
