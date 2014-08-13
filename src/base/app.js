/**
 * app前端处理框架
 */
;(function(lib, sr, undefined) {

    "use strict";

    /**
     * @namespace sr.app
     * @desc sr app模块结构
     */
    sr.app = (function() {

        var app = null;

        /**
         * @private
         * @method sr.app.registerModule
         * @param id
         * @param func
         * @param immediate
         */
        function registerModule(id, func, immediate) {
            initialize(undefined).registerModule(id, func, immediate);
        }

        /**
         * @private
         * @method sr.app.addConfig
         * @param id
         * @param obj
         */
        function addConfig(id, obj) {
            initialize(undefined).addConfig(id, obj);
        }

        /**
         * @private
         * @method sr.app.registerApi
         * @param id
         * @param obj
         */
        function registerApi(id, obj){
            initialize(undefined).registerApi(id, obj);
        }

        /**
         * @private
         * @method initialize
         * @param options
         */
        function initialize(options) {
            return !app ? (app = new sr.App(options), app) : (!!options ? (console.warn("The app has already exist! Failure to set up the config"), app) : app);
        }

        return {
            /**
             * @public
             * @method sr.app.registerModule
             * @param id
             * @param func
             * @param immediate
             * @desc 注册一个模块
             */
            registerModule: registerModule,

            /**
             * @public
             * @method sr.app.addConfig
             * @param id
             * @param obj
             */
            addConfig: addConfig,

            /**
             * @public
             * @method sr.app.registerApi
             * @param id
             * @param obj
             */
            registerApi: registerApi,

            /**
             * @public
             * @method sr.app.initialize
             * @param options
             * @desc 初始化app对象 如果不被调用则按照默认属性初始化
             * @returns {sr.App|app}
             */
            initialize: initialize
        };
    })();

    sr.App = sr.define({

        /**
         * @private
         * @property mCreator
         * @desc 生成器
         */
        mCreator: null,

        /**
         * @private
         * @property events
         * @type {sr.Events}
         */
        events: null,

        /**
         * @private
         * @property eventCaches
         * @desc 事件缓存 主要防止 一些模块未就位时的事件分发
         * @type {Array}
         */
        eventCaches: null,

        /**
         * @private
         * @property isLoad
         * @type {Boolean}
         */
        isLoad: false,

        /**
         * @private
         * @property cacheEventDispatch
         * @desc 事件缓冲器
         */
        cacheEventDispatch: null,

        /**
         * @private
         * @property configs
         * @desc 配置项
         */
        configs: null,

        /**
         * @private
         * @constructor
         */
        initialize: function(options) {
            this.mCreator = {};
            this.eventCaches = [];
            this.configs = {};
            this.cacheEventDispatch = {};
            //监听window事件 启动模块
            lib(document).ready(sr.util.bind(this.onWindowLoad, this));
            lib(window).unload(sr.util.bind(this.onWindowUnload, this));
            this.events = new sr.Events(this);
        },

        /**
         * @public
         * @method sr.App.registerMember
         * @param type {String} 注册的种类 可选模块或者api
         * @param id {String} 注册的id
         * @param creator {Object | Function} 构造器
         */
        registerMember: function(type, id, creator) {
            this.mCreator[type] = this.mCreator[type] || {};
            return this.mCreator[type][id] = {
                creator: creator,
                instance: null
            };
        },

        /**
         * @public
         * @method sr.App.startMember
         * @param type {String}
         * @param id {String}
         */
        startMember: function(type, id) {
            var creator = this.mCreator[type][id];
            if(!creator || creator.instance)   return;
            creator.instance = creator.creator(this, this.getConfig(id));
            creator.instance.init && creator.instance.init();
        },

        /**
         * @public
         * @method sr.App.registerModule
         * @param id {String}
         * @param m {Object | sr.Module}
         * @param immediate {Boolean}
         */
        registerModule: function(id, m, immediate) {
            this.registerMember("module", id, m);
            return (this.isLoad || !!immediate) ? (this.startModule(id), true) : false;
        },

        /**
         * @public
         * @method sr.App.registerApi
         * @param id
         * @param m
         */
        registerApi: function(id, m) {
            this.registerMember("api", id, m);
            this.startApi(id);
        },

        /**
         * @private
         * @method startModule
         * @param id {String}
         */
        startModule: function(id) {
            this.startMember("module", id);
        },

        /**
         * @private
         * @method sr.App.startApi
         * @param id
         */
        startApi: function(id) {
            this.startMember("api", id);
        },

        /**
         * @private
         * @method getApi
         * @param id
         */
        getApi: function(id) {
            return this.mCreator["api"][id].instance;
        },

        /**
         * @private
         * @method stopModule
         * @param id {String}
         */
        stopModule: function(id) {
            var moduleItem = this.mCreator["module"][id];
            if(!moduleItem.instance)   return;
            if (moduleItem.instance.destroy) {
                moduleItem.instance.destroy();
            }
            moduleItem.instance = null;
        },

        /**
         * @private
         * @method sr.App.getModule
         * @param id {String}
         */
        getModule: function(id) {
            return this.mCreator["module"][id].instance;
        },

        /**
         * @public
         * @method sr.App.on
         * @param type {String} 事件名
         * @param func {Function} 回调
         */
        on: function(type, func) {
            this.events.on(type, func);
        },

        /**
         * @public
         * @method sr.App.un
         * @param type {String} 事件名
         * @param func {Function} 回调
         */
        un: function(type, func) {
            this.events.un(type, func);
        },

        /**
         * @public
         * @method sr.App.notify
         * @desc 触发某自定义事件
         * @param type {String}
         * @param evt {Object}
         */
        notify: function(type, evt) {
            if(!this.isLoad) {
                this.eventCaches.push([type, evt]);
                return;
            }
            this.events.triggerEvent(type, evt);
            for(var k in this.cacheEventDispatch) {
                if(k.indexOf(type) != -1) {
                    this.triggerEventDispatch(k, type, evt);
                    break;
                }
            }
        },

        /**
         * @private
         * @method sr.App.triggerEventDispatch
         * @desc 通知缓冲器 活来了
         * @param id 缓冲器的key
         * @param type 完成的工作type
         * @param evt 完成的工作带来的变量
         */
        triggerEventDispatch: function(id, type, evt) {
            var dispatch = this.cacheEventDispatch[id];
            if(!dispatch && dispatch.hitFlag == dispatch.hits  || dispatch["cacheData"][type])  return;
            dispatch["cacheData"][type] = evt;
            if(++dispatch.hitFlag == dispatch.hits) {
                dispatch.func.apply(this, [dispatch.cacheData]);
                dispatch = null;
                delete this.cacheEventDispatch[id];
            }
        },

        /**
         * @public
         * @method sr.App.addConfig
         * @param id
         * @param config
         */
        addConfig: function(id, config){
            config = config || {};
            var c, p;
            if(id) {
                c = this.configs[id] = this.configs[id] || {};
                for(p in config) {
                    c[p] = config[p];
                }
            } else {
                for(p in config) {
                    this.configs[p] = config[p];
                }
            }
        },

        /**
         * @private
         * @method sr.App.getConfig
         * @param id
         */
        getConfig: function(id) {
            return this.configs[id] || {};
        },

        /**
         * @public
         * @method sr.App.invokeEventDispatch
         * @desc 启用一个事件缓冲器 用来处理多次事件完成才做某事情的需求
         */
        invokeEventDispatch: function(events, func) {
            var dispatch = this.cacheEventDispatch[events],
                len = String(events).split(",").length;
            if(dispatch && dispatch.hitFlag == len) {
                throw new Error("this kind of EventDispatch has already invoked!");
                return;
            }
            this.cacheEventDispatch[events] = this.cacheEventDispatch[events] || {
                hits: len,
                hitFlag: 0,
                cacheData: {},
                func: func
            };
        },

        /**
         * @private
         * @method onWindowLoad
         * @desc 监听onload事件
         */
        onWindowLoad: function() {
            var that = this;
            lib.each(this.mCreator["module"], function(item, k) {
                that.startModule(item);
            });
            this.isLoad = true;
            if(this.eventCaches) {
                var item;
                while(item = this.eventCaches.shift()) {
                    this.notify(item[0], item[1]);
                }
            }
            this.notify("Global-SRApp-ModuleCompleted", {});
        },

        /**
         * @private
         * @method onWindowUnload
         * @desc 监听页面的unload事件 针对低版本浏览器 主要做一些内存回收工作 至于高级浏览器 好吧 你可以认为我在自欺欺人
         */
        onWindowUnload: function() {
            var that = this;
            lib.each(this.mCreator["module"], function(item, k) {
                that.stopModule(item);
            });
        },

        CLASS_NAME: "SacredRelic.App"
    });

})($, sr);