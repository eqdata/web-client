require('./bootstrap');

import React, { Component } from 'react';
import { render } from 'react-dom';
// Import routing components
import {Router, Route, browserHistory} from 'react-router';

// Import custom components
import AuctionFeed from './components/auctionFeed.jsx'
import SearchResults from './components/searchResults.jsx'

render(
    <Router history={browserHistory}>
        <Route path="/feed" component={AuctionFeed}/>
        <Route path="/search/:terms" component={SearchResults}/>
    </Router>,
    document.getElementById('content-container')
);
