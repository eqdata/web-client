require('./bootstrap');
require('./utils/search');
require('./utils/helpers');

import React, {Component} from 'react';
import {render} from 'react-dom';
// Import routing components
import {Router, Route, browserHistory} from 'react-router';

// Import custom components
import AuctionFeed from './components/AuctionFeed.jsx'
import SearchResults from './components/SearchResults.jsx'
import Item from './components/Item.jsx'
import NotFound from './components/NotFound.jsx'

if (document.getElementById('content-container')) {
    render(
        <Router history={browserHistory}>
            <Route path="/feed" component={AuctionFeed}/>
            <Route path="/search/:terms" component={SearchResults}/>
            <Route path="/item/:item(/:auctions)(/:id)" component={Item}/>

            <Route path="*" component={NotFound}/>
        </Router>,
        document.getElementById('content-container')
    );
}