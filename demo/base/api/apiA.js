
;(function(sr, undefined) {

    "use strict";

    sr.app.registerApi("ApiA", function() {

        function a() {
            console.log("a");
        }

        return {
            A: a
        }
    });

})(sr);