/**
 *
 */
;(function(lib, sr, undefined) {

    "use strict";

    lib.sr.define("test", {

        initialize: function() {
            SacredRelic.Widget.prototype.initialize.apply(this, arguments);
            return this;
        },

        CLASS_NAME: "SacredRelic.Test"
    });

})($, sr);