import React, { Component } from 'react';
import { render } from 'react-dom';

class SearchResutls extends Component {
    render(){
        return (<h1>Search Results Go Here ({this.props.params.terms})</h1>);
    }
}

export default SearchResutls
