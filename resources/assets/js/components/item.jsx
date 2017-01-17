import React, {Component} from 'react';
import {render} from 'react-dom';

class ItemInfo extends Component {
    render() {
        return (
            <div id="item-info">
                <h2>{this.props.item.Name}</h2>
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
            item: {
                "Name": "Fiery Avenger",
                "Image": "/images/Item_519.png",
                "AveragePrice": 0,
                "Statistics": [
                    {
                        "Code": "skill",
                        "Value": "2H SLASHING"
                    },
                    {
                        "Code": "atk delay",
                        "Value": 44
                    },
                    {
                        "Code": "dmg",
                        "Value": 33
                    },
                    {
                        "Code": "str",
                        "Value": 15
                    },
                    {
                        "Code": "cha",
                        "Value": 10
                    },
                    {
                        "Code": "wis",
                        "Value": 15
                    },
                    {
                        "Code": "hp",
                        "Value": 25
                    },
                    {
                        "Code": "mana",
                        "Value": 25
                    },
                    {
                        "Code": "sv fire",
                        "Value": 5
                    },
                    {
                        "Code": "sv disease",
                        "Value": 5
                    },
                    {
                        "Code": "sv cold",
                        "Value": 5
                    },
                    {
                        "Code": "sv magic",
                        "Value": 5
                    },
                    {
                        "Code": "sv poison",
                        "Value": 5
                    },
                    {
                        "Code": "wt",
                        "Value": 0.1
                    },
                    {
                        "Code": "size",
                        "Value": "LARGE"
                    }
                ],
                "Effect": {
                    "URI": "http://wiki.project1999.com/Flame_Shock",
                    "Name": "Flame Shock",
                    "Restriction": "(Combat, Casting Time: Instant) at Level 45"
                },
                "Affinities": [
                    "MAGIC ITEM",
                    "LORE ITEM",
                    "NO DROP"
                ],
                "Races": [
                    "ALL"
                ],
                "Classes": [
                    "PAL"
                ],
                "Slots": [
                    "PRIMARY"
                ]
            }
        };
    }

    componentDidMount() {
        // get state here from API with this.props.params
    }

    render() {
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
