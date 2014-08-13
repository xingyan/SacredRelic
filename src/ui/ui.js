/**
 * @file
 * @version 0.1
 */
(function(lib, sr, undefined) {

    "use strict";

    /**
     * 基类
     */
    SacredRelic.Widget = sr.define({

        /**
         * Property: container
         * {DOMElement}
         */
        container: null,

        /**
         * Property: el
         * {DOMElement}
         */
        el: null,

        /**
         * Property: options
         * {Object}
         */
        options: null,

        /**
         * Property: id
         * {String}
         */
        id: null,

        /**
         * @property
         */
        event: null,

        /**
         * constructor
         * Parameters:
         * el   -   {DOMElement | String}
         * options  -   {Object}
         */
        initialize: function(container, options) {
            this.container = $(container);
            this.addOptions(options);
            this.event = new sr.Events(this);
            this.id = this.id || sr.util.createUniqueID(this.CLASS_NAME + "_");
            this.el = $("<div></div>").attr("id", this.id);
            this.render();
            return this;
        },

        /**
         * Method: on
         */
        on: function(ev, callback) {
            this.event.on(ev, callback, this);
            return this;
        },

        /**
         * Method: off
         */
        un: function(ev, callback) {
            this.event.un(ev, callback, this);
            return this;
        },


        /**
         * Method: trigger
         */
        trigger: function(ev, data) {
            this.event.triggerEvent(ev, data);
            return this;
        },

        /**
         * Method: render
         */
        render: function() {
            var len = arguments.length;
            if(len == 0) {
                this.container = this.container || $(document.body);
            } else {
                this.container = $(arguments[0]);
            }
            this.container.append(this.el);
        },

        /**
         * Method: root
         */
        root: function(el) {
            return this.el = el || this.el;
        },

        /**
         * @public
         * @method sr.Widget.show
         */
        show: function() {
            this.el.show();
        },

        /**
         * @public
         * @method sr.Widget.hide
         */
        hide: function() {
            this.el.hide();
        },

        /**
         * @public
         * @method sr.Widget.toggle
         */
        toggle: function() {
            this.el.toggle();
        },

        /**
         * Private Method: addOptions
         * 深度绑定
         * Parameters:
         * newOptions  -   {Object}
         */
        addOptions: function(newOptions) {
            if (this.options == null) {
                this.options = {};
            }
            $.extend(this.options, newOptions);
            $.extend(this, newOptions);
        },

        CLASS_NAME: "SacredRelic.Widget"
    });

    lib.sr = lib.sr || {

        /**
         * Method: define
         * 类定义
         */
        define: function() {
            var ars = Array.prototype.slice.call(arguments).slice(0, 2),
                len = ars.length;
            if(len < 2) throw new Error("Illegal arguments!");
            var N = ars[0],
                P = ars[1];
            var C = sr.define(SacredRelic.Widget, P);
            lib.fn[N] = function(opts) {
                return this.each(function() {
                    var widget = $.data(this, "SacredRelic_ui_" + N);
                    if(!widget) {
                        widget = new C($(this), opts);
                        $.data(this, "SacredRelic_ui_" + N, widget);
                    }
                });
            }
        }
    };
})($, sr);
