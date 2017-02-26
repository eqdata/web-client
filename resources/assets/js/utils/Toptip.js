var Toptip = function() {
    this.active = false;
    this.tooltip = document.createElement("div");
    this.tooltip.setAttribute("id", "toptip");

    var existingNode = document.querySelector('#toptip');
    if(!existingNode) {
        document.body.appendChild(this.tooltip);
    } else {
        this.tooltip = existingNode;
    }

    /**
     * Show the tooltip, add mousemove listener
     */
    this.showTooltip = function() {
        this.tooltip.style.display = "block";
        document.addEventListener("mousemove", this.updatePosition.bind(this));
    };

    /**
     * Hide the tooltip, remove mousemove listener
     */
    this.hideTooltip = function() {
        this.tooltip.style.display = "none";
        document.removeEventListener("mousemove", this.updatePosition);
    };

    /**
     * Update the tooltip position
     * @param event
     */
    this.updatePosition = function(event) {
        var coords = this.checkBounds(event);
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        this.tooltip.style.left = coords.x + "px";
        this.tooltip.style.top = coords.y + scrollTop + "px";
    };

    /**
     * Checks the current bounds of the tooltip and returns the
     * new left/right to keep the tip within bounds
     * @param event : Event set by caller
     * @return Object : coords array contains new x and y position for the tooltip
     */
    this.checkBounds = function(event) {
        var tooltipRect = this.tooltip.getBoundingClientRect();
        var bodyRect    = { width: window.innerWidth, height: window.innerHeight };

        var offsetTop  = event.clientY;
        var offsetLeft = event.clientX;
        var padding    = { top : 10, left : 10, bottom: 10, right: 30 };

        // Top boundary
        if((offsetTop + tooltipRect.height) > bodyRect.height) {
            offsetTop = (bodyRect.height - tooltipRect.height) - padding.bottom;
        }
        // Right boundary
        if((offsetLeft + tooltipRect.width) > bodyRect.width) {
            offsetLeft = (bodyRect.width - tooltipRect.width) - padding.right;
        }

        return { x : offsetLeft, y : offsetTop };
    };

    /**
     * Set content of the tooltip
     * @param content
     */
    this.setContent = function(content) {
        // Delete any existing content
        while (this.tooltip.firstChild) {
            this.tooltip.removeChild(this.tooltip.firstChild);
        }
        // Append new content
        this.tooltip.appendChild(content);
    };
};

module.exports = Toptip;