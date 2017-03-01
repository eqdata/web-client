import helpers from './helpers.js';
import {Router, Route, browserHistory} from 'react-router';

window.onload = function() {
    document.getElementById("server-name").innerHTML = (helpers.getServer() == "blue" ? "Red" : "Blue");
};
document.getElementById("server-toggle").onclick = function(){
    var currentServer = helpers.titleCase(helpers.getServer());
    helpers.toggleServer();
    // location.reload(); // requires full page reload from server
    document.getElementById("server-name").innerHTML = helpers.titleCase(currentServer);
    // browserHistory.push(location); // doesn't rerender anything since state didn't change
};