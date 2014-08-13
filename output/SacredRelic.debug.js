/**
 * @file
 * @version 1.0
 */
;(function(window, undefined) {

    "use strict";

    /**
     * 命名空间前缀
     * @namespace sr
     * @desc 命名空间说明
     * @type {object}
     */
    var sr = {version: "1.1"};

    /**
     * @method sr.define
     * @desc 类生成.将返回一个形如——
     * function C() {
     *      this.initialize()
     * };
     * C.prototype = { constructor: C, ... }的对象
     * 支持两个参数，第一个为父类（可不存在），第二个为生成类的各属性方法对象 由于每个类的生成都基于子类对父类对象的深度拷贝，因此，
     * 为避免子类属性更改对父类造成的不可控影响，除Number|String|Boolean 外的对象 初始化都建议放在构造函数当中去做 初始化值建议
     * 为null
     * @example
     * var newClass = sr.define({
     *     width: 64,
     *     length: "12px",
     *     property: null,
     *     initialize: function() {
     *         this.property = Object.create({});
     *     }
     * });
     * @return {Function}
     */
    sr.define = function() {
        var len = arguments.length,
            s = arguments[0],
            i = arguments[len - 1];

        var nc = typeof i.initialize == "function" ? i.initialize :
            function() {
                s.apply(this, arguments);
            };
        if(len > 1) {
            var newArgs = [nc, s].concat(Array.prototype.slice.call(arguments).slice(1, len - 1), i);
            sr.inherit.apply(null, newArgs);
        } else {
            nc.prototype = i;
            nc.prototype.constructor = nc;
        }
        return nc;
    };

    /**
     * @method sr.inherit
     * @desc 继承
     * @param child {Function} 子类
     * @param father {Function} 父类
     */
    sr.inherit = function(child, father) {
        var f = function() {},
            cp,
            fp = father.prototype;
        f.prototype = fp;
        cp = child.prototype = new f;
        cp.constructor = child;
        var i, l, k;
        for(i = 2, l = arguments.length; i < l; i++) {
            k = arguments[i];
            if(typeof k === "function") {
                k = k.prototype;
            }
            sr.extend(child.prototype, k);
        }
    };

    /**
     * @method sr.extend
     * @desc 将一个对象的属性复制给另一个对象
     * @param destination {object}
     * @param source {object}
     * @return destination {object} 复制后的对象
     */
    sr.extend = function(destination, source) {
        destination = destination || {};
        if(source) {
            for(var property in source) {
                var value = source[property];
                if(value !== undefined) {
                    destination[property] = value;
                }
            }
            var sourceIsEvt = typeof window.Event == "function"
                && source instanceof window.Event;

            if (!sourceIsEvt && source.hasOwnProperty && source.hasOwnProperty("toString")) {
                destination.toString = source.toString;
            }
        }
        return destination;
    };

    window.SacredRelic = window.sr = sr;

})(window);/**
 * jquery里没看到的工具函数
 */
;(function(sr, undefined) {

    "use strict";

    /**
     * @desc 初始化
     */
    var util = {};

    /**
     * @property sr.util.lastSeqId
     * @type {String}
     */
    util.lastSeqId = 0;

    /**
     * @method sr.util.createUniqueID
     * @param prefix {String} 前缀
     * @return {String} 全局唯一的一个字符串
     */
    util.createUniqueID = function(prefix) {
        prefix = (prefix === null || prefix === undefined) ? "SacredRelic" : prefix.replace(/\./g, "_");
        sr.util.lastSeqId++;
        return prefix + sr.util.lastSeqId;
    };

    /**
     * @method sr.util.bind
     * @desc 换作用域
     * @param func {Function}
     * @param object {Object}
     */
    util.bind = function(func, object) {
        // create a reference to all arguments past the second one
        var args = Array.prototype.slice.apply(arguments, [2]);
        return function() {
            // Push on any additional arguments from the actual function call.
            // These will come after those sent to the bind call.
            var newArgs = args.concat(
                Array.prototype.slice.apply(arguments, [0])
            );
            return func.apply(object, newArgs);
        };
    };

    /**
     * @method sr.util.bindAsEventListener
     * @param func {Function} 作为事件监听的函数
     * @param object {Object} 作用域
     */
    util.bindAsEventListener = function(func, object) {
        return function(event) {
            return func.call(object, event || window.event);
        };
    };

    /**
     * @method sr.util.requestAnimation
     * @desc 比较好用的定时器
     */
    util.requestAnimation = (function() {
        var request = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback, element) {
                window.setTimeout(callback, 16);
            };
        return function(callback, element) {
            request.apply(window, [callback, element]);
        };
    })();

    /**
     * @method octopus.util.decodeHtml
     * @desc 对字符串中的html进行编码
     * @param str {String}
     */
    util.htmlDecodeDict = {"quot": '"', "lt": "<", "gt": ">", "amp": "&", "#39": "'"};
    util.decodeHtml = function(str) {
        return String(str).replace(/&(quot|lt|gt|amp|#39);/ig, function(all, key) {
            return util.htmlDecodeDict[key];
        }).replace(/&#u([a-f\d]{4});/ig, function(all, hex) {
                return String.fromCharCode(parseInt("0x" + hex));
            }).replace(/&#(\d+);/ig, function(all, number) {
                return String.fromCharCode(+number);
            });
    };

    /**
     * @method octopus.util.encodeHtml
     * @desc 对字符串中的特殊字符进行html编码
     * @param str {String}
     */
    util.encodeHtml = function(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    };

    /**
     * @method octopus.util.isNode
     * @desc 判断对象是否是节点
     * @param o {Object}
     * @return {Boolean}
     */
    util.isNode = function(o) {
        return !!(o && o.nodeType === 1);
    };

    /**
     * @method octopus.util.isObject
     * @desc 判断对象是否是对象
     * @return {Boolean}
     */
    util.isObject = function (source) {
        return 'function' == typeof source || !!(source && 'object' == typeof source);
    };

    /**
     * @method octopus.util.isString
     * @desc 判断对象是否是字符串
     * @return {Boolean}
     */
    util.isString = function (source) {
        return '[object String]' == Object.prototype.toString.call(source);
    };

    /**
     * @method octopus.util.isArray
     * @desc 判断对象是否是数组
     * @return {Boolean}
     */
    util.isArray = function(source) {
        return ('[object Array]' == Object.prototype.toString.call(source));
    };

    /**
     * @method octopus.util.isNumeric
     * @desc 判断对象是否是数字
     * @returns {Boolean}
     */
    util.isNumeric = function(obj) {
        return !isNaN(parseFloat(obj)) && isFinite(obj);
    };

    /**
     * @namespace sr.util
     * @desc 工具集合
     * @type {object}
     */
    sr.util = util;

})(sr);/**
 *  自定义事件
 */
;(function(sr, undefined) {

    "use strict";

    /**
     * @class sr.Events
     * @desc 自定义事件类
     * @param object {Object} 观察订阅事件的对象 必需
     * @param options {Object}
     */
    sr.Events = sr.define({

        /**
         * @private
         * @property listeners
         * @type {object}
         * @desc 事件监听的hash表
         */
        listeners: null,

        /**
         * @private
         * @property obj
         * @type {object}
         * @desc 事件对象所属的主体
         */
        obj: null,

        /**
         * @private
         * @property eventHandler
         * @desc 绑定在节点上的触发函数
         * @type {Function}
         */
        eventHandler: null,

        /**
         * @private
         * @constructos: sr.Events.initialize
         * @param obj {Object} 观察订阅事件的对象 必需
         * @param options {Object}
         */
        initialize: function(obj, options) {
            sr.extend(this, options);
            this.obj = obj;
            this.listeners = {};
        },

        /**
         * @method sr.Events.destroy
         * @public
         * @desc 创建的事件对象自我解脱
         */
        destroy: function() {
            this.listeners = null;
            this.obj = null;
            this.eventHandler = null;
        },

        /**
         * @method sr.Events.on
         * @public
         * @desc 添加自定义事件监听
         * @param type {String} 事件类型
         * @param func {Function} 回调
         * @param obj {Object} 事件绑定的对象 默认为this.object
         */
        on: function(type, func, obj) {
            if (func != null) {
                if (obj == null || obj == undefined)  {
                    obj = this.obj;
                }
                var listeners = this.listeners[type];
                if (!listeners) {
                    listeners = [];
                    this.listeners[type] = listeners;
                }
                var listener = {obj: obj, func: func};
                listeners.push(listener);
            }
        },

        /**
         * @method sr.Events.un
         * @public
         * @desc 取消自定义事件的监听
         * @param type {String} 事件类型
         * @param func {Function} 触发回调
         * @param obj {Object} 默认自身
         */
        un: function(type, func, obj) {
            if (obj == null)  {
                obj = this.obj;
            }
            var listeners = this.listeners[type];
            if (listeners != null) {
                for (var i=0, len=listeners.length; i<len; i++) {
                    if (listeners[i].obj == obj && listeners[i].func == func) {
                        listeners.splice(i, 1);
                        break;
                    }
                }
            }
        },

        /**
         * @method sr.Events.triggerEvent
         * @desc 触发事件
         * @param type {String} 触发事件类型
         * @param evt {event}
         */
        triggerEvent: function(type, evt) {
            var listeners = this.listeners[type];
            if(!listeners || listeners.length == 0) return undefined;
            if (evt == null) {
                evt = {};
            }
            evt.obj = this.obj;
            if(!evt.type) {
                evt.type = type;
            }
            //clone一份
            listeners = listeners.slice();
            var continueChain,
                i = 0,
                len = listeners.length;
            for (; i < len; i++) {
                var callback = listeners[i];
                // bind the context to callback.obj
                continueChain = callback.func.apply(callback.obj, [evt]);
                if (continueChain === false) {
                    // 如果返回值为false表示回调到此为止
                    break;
                }
            }
            return continueChain;
        },

        /**
         * @method sr.Events.remove
         * @public
         * @desc 直接把指定事件类型的监听回调置空
         * @param type {String}
         */
        remove: function(type) {
            if (this.listeners[type] != null) {
                this.listeners[type] = [];
            }
        },

        /**
         * @method sr.Events.register
         * @desc 批量增加事件
         * @param evs {Object}
         */
        register: function(evs) {
            for(var type in evs) {
                if(type != "scope" && evs.hasOwnProperty(type)) {
                    this.on(type, evs[type], evs.scope);
                }
            }
        },

        /**
         * @method sr.Events.unregister
         * @desc 批量去除事件
         * @param evs {Object}
         */
        unregister: function(evs) {
            for(var type in evs) {
                if(type != "scope" && evs.hasOwnProperty(type)) {
                    this.un(type, evs[type], evs.scope);
                }
            }
        },

        CLASS_NAME: "SacredRelic.Events"
    });

})(sr);/**
 * @file
 * webapp通用组件基础库文件
 * 模板引擎部分
 * @require lib/class.js
 * @require lib/util.js
 * @author oupeng-fe
 * @version 1.1
 */
;(function(sr, undefined) {

    "use strict";

    /**
     * @namespace sr.template
     */
    sr.template = sr.template || {};

    sr.extend(sr.template, {

        /**
         * @private
         * @property caches
         * @type {Object}
         */
        caches: {},

        /**
         * @private
         * @method templateText
         * @param element
         */
        templateText: function(element) {
            if(!sr.util.isNode(element)) return "";
            if(/^(input|textarea)$/i.test(element.tagName)) return element.value;
            return sr.util.decodeHtml(element.innerHTML);
        },

        /**
         * @private
         * @method register
         * @param id {String}
         * @param target {DOMElement}
         */
        register: function(id, target) {
            if(!id) return;
            if(this.caches[id]) {
                return this.caches[id];
            }
            if (!sr.util.isString(target)) {
                if (typeof target == "undefined") {
                    target = document.getElementById(id);
                }
                target = this.templateText(target);
            }
            return this.caches[id] = this.parse(target);
        },

        /**
         * @private
         * @method parse
         * @param template {String}
         */
        parse: function(template) {
            var body = [];
            body.push("with(this){");
            body.push(template
                .replace(/[\r\n]+/g, "\n") // 去掉多余的换行，并且去掉IE中困扰人的\r
                .replace(/^\n+|\s+$/mg, "") // 去掉空行，首部空行，尾部空白
                .replace(/((^\s*[<>!#^&\u0000-\u0008\u007F-\uffff].*$|^.*[<>]\s*$|^(?!\s*(else|do|try|finally)\s*$)[^'":;,\[\]{}()\n\/]+$|^(\s*(([\w-]+\s*=\s*"[^"]*")|([\w-]+\s*=\s*'[^']*')))+\s*$|^\s*([.#][\w-.]+(:\w+)?(\s*|,))*(?!(else|do|while|try|return)\b)[.#]?[\w-.*]+(:\w+)?\s*\{.*$)\s?)+/mg, function(expression) { // 输出原文
                    expression = ['"', expression
                        .replace(/&none;/g, "") // 空字符
                        .replace(/["'\\]/g, "\\$&") // 处理转义符
                        .replace(/\n/g, "\\n") // 处理回车转义符
                        .replace(/(!?#)\{(.*?)\}/g, function (all, flag, template) { // 变量替换
                            template = template.replace(/\\n/g, "\n").replace(/\\([\\'"])/g, "$1"); // 还原转义
                            var identifier = /^[a-z$][\w+$]+$/i.test(template) &&
                                !(/^(true|false|NaN|null|this)$/.test(template)); // 单纯变量，加一个未定义保护
                            return ['",',
                                identifier ? ['typeof ', template, '=="undefined"?"":'].join("") : "",
                                (flag == "#" ? '_encode_' : ""),
                                '(', template, '),"'].join("");
                        }), '"'].join("").replace(/^"",|,""$/g, "");
                    if (expression)
                        return ['_output_.push(', expression, ');'].join("");
                    else return "";
                }));
            body.push("}");
            var result = new Function("_output_", "_encode_", "helper", body.join(""));
            return result;
        },

        /**
         * @public
         * @method octopus.template.format
         */
        format: function(id, data, helper) {
            if (!id) return "";
            var reader, element;
            if (sr.util.isNode(id)) { // 如果是Dom对象
                element = id;
                id = element.getAttribute("id");
            }
            helper = helper || this;
            reader = this.caches[id];
            if(!reader) {
                if(!/[^\w-]/.test(id)) {
                    if(!element) {
                        element = document.getElementById(id);
                    }
                    reader = this.register(id, element);
                } else {
                    reader = this.parse(id);
                }
            }
            var output = [];
            reader.call(data || "", output, sr.util.encodeHtml, helper);
            return output.join("");
        }
    });
})(sr);/**
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

})($, sr);/**
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
