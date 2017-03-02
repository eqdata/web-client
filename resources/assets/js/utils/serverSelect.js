import {Router, Route, browserHistory} from 'react-router';

module.exports = {
    setLabel: function () {
        document.getElementById("server-name").innerHTML = (this.getServer() == "blue" ? "Red" : "Blue");
    },
    setToggleListener: function () {
        document.getElementById("server-toggle").onclick = function () {
            // var currentServer = helpers.titleCase(helpers.getServer());
            this.toggleServer();
            location.reload(); // requires full page reload from server
            // document.getElementById("server-name").innerHTML = helpers.titleCase(currentServer);
            // browserHistory.push(location); // doesn't rerender anything since state didn't change
        }.bind(this);
    },
    getServer: function () {
        return localStorage.getItem('server') || "blue";
    },
    toggleServer: function () {
        var newServer = this.getServer() == "blue" ? "red" : "blue";
        localStorage.setItem('server', newServer);
        return newServer;
    }
};