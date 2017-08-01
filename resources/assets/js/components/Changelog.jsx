import React, {Component} from 'react';
import {render} from 'react-dom';

const Changelog = () =>
    <div>
        <h1 className="page-header">
            Changelog
        </h1>
        <div id="content-wrapper" className="well well-sm well-hover col-xs-12 col-sm-12 col-md-12">
                <h4>August 1, 2017</h4>
               <ul>
                   <li>
                       Fixed issue with "Item Not Found" appearing while item was being fetched.
                   </li>
                   <li>
                       Fixed issue with "No Results" appearing while search results were being fetched.
                   </li>
                   <li>
                       Added changelog
                   </li>
               </ul>

        </div>
    </div>;

export default Changelog
