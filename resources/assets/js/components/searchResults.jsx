import React, {Component} from 'react';
import {render} from 'react-dom';

class ResultItem extends Component {
    render() {
        return (
            <div id="content-wrapper">
               <h2>{this.props.item.name}</h2>
            </div>
        );
    }
}

class SearchResults extends Component {

    constructor(props) {
        super(props);
        this.state = {
            results: [
                {name: 'hello'},
                {name: 'world'},
                {name: 'hi'}]
        };
    }

    render() {
        var rows = [];
        this.state.results.forEach((result) => {
            rows.push(<ResultItem key={result.name} item={result}/>)
        })
        return (
            <div>
                <h1 id="page-title" className="page-header">
                    Search Results
                    <small id="query-string"> {this.props.params.terms}</small>
                </h1>
                {rows}
            </div>
        );
    }
}

export default SearchResults
