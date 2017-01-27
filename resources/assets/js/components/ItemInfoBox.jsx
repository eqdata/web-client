import React, {Component} from 'react';
import {render} from 'react-dom';
import {Chart} from 'react-google-charts';
import {Link} from 'react-router';

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


/**
 * Item information.
 */
class ItemInfoBox extends Component {


    componentDidMount(){
        var elem = ReactDOM.findDOMNode(this)
        // Set the opacity of the element to 0
        elem.style.opacity = 0;
        window.requestAnimationFrame(function() {
            // Now set a transition on the opacity
            elem.style.transition = "opacity 550ms";
            // and set the opacity to 1
            elem.style.opacity = 1;
        });
    }
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
            races: withLabel("Race", races),
        };
        if (this.props.aucStats) {
            lines.aucStats =
                <span><br />Average (week): {this.props.aucStats.week}<br />
                    Average (month): {this.props.aucStats.month}<br />
                    Average (all time): {this.props.aucStats.allTime}</span>
        }

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
                        <div>
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
                            {lines.aucStats ? lines.aucStats : ""}
                        </div>
                    </div>
                </div>
                <div className="item-bot-bg"></div>
            </div>
        );
    }
}

export default ItemInfoBox
