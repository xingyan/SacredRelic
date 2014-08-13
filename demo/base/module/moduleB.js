/**
 * User: xingyan
 * Date: 6/24/14
 * Time: 8:46 PM
 */
sr.app.registerModule("moduleB", function(app, config) {

    function init() {
        app.invokeEventDispatch("moduleA-notify,moduleB-notify", function(opt) {
            console.log(opt);
        });
        app.on("moduleA-notify", function() {
        //    console.log(arguments);
        });
        window.setTimeout(function() {
            app.notify("moduleB-notify", {a: 3, b: 2});
            window.setTimeout(function() {
                app.notify("moduleB-notify", {a: 3, b: 2});
                app.notify("moduleA-notify", {a: 1, b: 2});
            }, 1000);
        }, 2000);

    }

    return {
        init: init
    }

});
