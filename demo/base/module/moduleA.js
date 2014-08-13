/**
 * User: xingyan
 * Date: 6/24/14
 * Time: 8:46 PM
 */
sr.app.registerModule("moduleA", function(app, config) {

    function init() {
        app.notify("moduleA-notify", config);
    }

    return {
        init: init
    }

});