import helpers from './helpers.js';

module.exports = {
    setLabel: function () {
        document.getElementById("server-name").innerHTML = (helpers.getServer() == "blue" ? "Red" : "Blue");
    },
    setToggleListener: function () {
        document.getElementById("server-toggle").onclick = function () {
            var currentServer = helpers.titleCase(helpers.getServer());
            helpers.toggleServer();
            // location.reload(); // requires full page reload from server
            document.getElementById("server-name").innerHTML = helpers.titleCase(currentServer);
            // browserHistory.push(location); // doesn't rerender anything since state didn't change
        };
    }
};