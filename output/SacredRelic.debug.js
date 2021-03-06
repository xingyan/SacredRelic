/**
 * @file
 * @author xingyan.me@gmail.com
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
 * 动画部分
 * @require lib/class.js
 * @require lib/util.js
 * @require lib/event.js
 * @author oupeng-fe
 * @version 1.1
 */
;(function(lib, sr, undefined) {

    "use strict";

    /**
     * @class sr.Tween
     * @desc 动画类，可以通过改变属性、起始值、结束值等配置让指定节点完成动态过渡
     * 注意：由于情况过于复杂 凡是改变属性是transform属性或包含transform属性的动画 只能按照css3的形式进行 默认动画类型是ease-out
     * @param el {DOMElement} 指定完成动画的节点
     * @param pro {String | Array} 待改变的属性 可为多值
     * @param startv {String | Number | Array} 起始值 如为数组 必须与改变属性一一对应 否则会抛错
     * @param endv {String | Number | Array} 结束值 具体要求同起始值
     * @param duration {Number} 动化过渡的时间 单位为秒/s
     * @param func {Function} 动画结束的回调函数
     * @param options {Object} 其他配置项 可为空 默认为js动画 动画类型为"sr.easing."
     * @param options.ease {String | Object} 动画类 如果为字符串 则采用css3的transition动画 否则需要传入"sr.easing.XXX"的动画对象
     * @example
     * var newtween = new Tween(el, ["width", "webkitTransform"], [64, "translate3d(0, 0, 0)"],
     *  [128, "translate3d(30px, 0, 0)"], .4, function() {
     *     console.log(Animation finished!);
     * }, {
     *     ease: "ease-out" | sr.easing.linear.easeOut
     * });
     * @throw
     * @return {sr.Tween}
     */
    sr.Tween = sr.define({

        /**
         * @private
         * @property el
         * {DOMElement}
         */
        el: null,

        /**
         * @private
         * @property propertyName
         * {String}
         */
        propertyName: null,

        /**
         * @private
         * @property startValue
         * {String}
         */
        startValue: null,

        /**
         * @private
         * @property endValue
         * {String}
         */
        endValue: null,

        /**
         * @private
         * @property duration
         * {Number}
         */
        duration: null,

        /**
         * @private
         * @property func
         * {Function}
         */
        func: null,

        /**
         * @private
         * @property ease
         * {Object}
         */
        ease: null,

        /**
         * @private
         * @property needParams
         * {Array}
         */
        needParams: null,

        /**
         * @private
         * @property paramsDics
         * {Array}
         */
        paramsDics: null,

        /**
         * @private
         * @property requestAnimation
         * {Object}
         */
        requestAnimation: null,

        /**
         * @private
         * @property colorList
         * {Array}
         */
        colorList: null,

        /**
         * @private
         * @property stopRequest
         * {Boolean}
         */
        stopRequest: true,

        /**
         * @private
         * @property vector
         * {Object}
         */
        vector: null,

        /**
         * @private
         * @property prefix
         * {String}
         */
        prefix: null,

        /**
         * @private
         * @property eventPrefix
         * {String}
         */
        eventPrefix: null,

        /**
         * @private
         * @property isOffCss
         * {Boolean}
         */
        isOffCss: false,

        /**
         * @private
         * @property endEvent
         * {String}
         */
        endEvent: null,

        /**
         * @private
         * @property isTransform
         * @type {Boolean}
         */
        isTransform: false,

        /**
         * @private
         * @property eventTimer
         * @type {Number}
         */
        eventTimer: null,

        /**
         * @private
         * @property delay
         * @type {Number}
         */
        delay: null,

        /**
         * @private
         * @constructor sr.Tween
         */
        initialize: function(el, pro, startv, endv, duration, func, options) {
            if(!sr.util.isNode(el))    throw new Error("require a node!");
            sr.extend(this, options);
            this.el = el;
            this.propertyName = pro;
            this.startValue = startv;
            this.endValue = endv;
            this.duration = duration;
            this.func = func || function() {};
            this.needParams = [];
            this.colorList = [];
            this.paramsDics = ["width", "height", "left", "top", "right", "bottom", "padding",
                "padding-left", "padding-top", "padding-bottom", "padding-right", "margin",
                "margin-left", "margin-top", "margin-bottom", "margin-right", "font-size",
                "background-position", "line-height", "border-width", "border-left-width",
                "border-top-width", "border-right-width", "border-bottom-width"];
            var legality = this.check();
            this.ease = this.ease || (this.isTransform ? "ease-out" : sr.easing.linear.easeOut);
            this.delay = this.delay || 0;
            if(!legality) throw new Error("Illegal arguments!");
            if(sr.util.isObject(this.ease) && !this.isTransform) {
                this.requestAnimation = sr.util.requestAnimation;
                if(this.delay > 0) {
                    var that = this;
                    window.setTimeout(function() {
                        that.executeWithJs();
                    }, this.delay * 1000);
                } else {
                    this.executeWithJs();
                }
            } else {
                this.vector = {"" : "", Webkit: "webkit", Moz: "", O: "o", ms: "MS"};
                for(var k in this.vector) {
                    if (this.el.style[k + "TransitionProperty"] !== undefined) {
                        this.prefix = '-' + k.toLowerCase() + '-'
                        this.eventPrefix = this.vector[k]
                        break;
                    }
                }
                this.isOffCss = (this.eventPrefix == null && this.el.style.transitionProperty == undefined);
                this.endEvent = this.eventPrefix ? this.eventPrefix + "TransitionEnd" : "transitionEnd";
                this.executeWithCss();
            }

        },

        /**
         * @private
         * @method check
         * @desc 检查参数是否ok
         */
        check: function() {
            var queue = sr.util.isArray(this.propertyName) &&
                    sr.util.isArray(this.startValue) && sr.util.isArray(this.endValue),
                pass = false,
                _pass;
            if(!queue){
                this.propertyName = [this.propertyName];
                this.startValue = [this.startValue];
                this.endValue = [this.endValue];
            }
            var paramsMatch = (this.propertyName.length == this.startValue.length) &&
                (this.startValue.length == this.endValue.length);
            if(paramsMatch) {
                var unOk = false,
                    len = this.propertyName.length,
                    i = len;
                for(; i--; ) {
                    _pass = this.checkValue(this.propertyName[i], this.startValue[i], this.endValue[i]);
                    if(!_pass) {
                        unOk = true;
                    }
                    this.needParams[i] = this.paramsDics.indexOf(this.propertyName[i]) != -1;
                    var isColor = new RegExp("/color|background-color|border-color/i").test(this.propertyName[i]);
                    this.colorList[i] = {
                        isColor: isColor,
                        startValue: isColor ? this.getColor(this.startValue[i]) : null,
                        endValue: isColor ? this.getColor(this.endValue[i]) : null
                    };
                }
                pass = !unOk && !isNaN(this.duration);
            } else {
                pass = false;
            }
            return pass;
        },

        /**
         * @private
         * @method checkValue
         * @desc 验证值是否合法
         */
        checkValue: function(propertyName, startValue, endValue){
            var pass = false;
            if(/transform/i.test(propertyName) || /-webkit-/i.test(propertyName)) {
                this.isTransform = true;
                pass = !!startValue && sr.util.isString(startValue) && !!endValue && sr.util.isString(endValue)
            } else if(propertyName.indexOf('color') != -1) {
                var reg = /(^\s*)|(\s*$)/g;
                pass = !!startValue && startValue.replace(reg, '') != '' && !! endValue && endValue.replace(reg, '') != ''
            } else {
                pass = !isNaN(startValue) && !isNaN(endValue);
            }
            return pass;
        },

        /**
         * @private
         * @method getColor
         */
        getColor: function(str) {
            str = str.replace(/(^\s*)|(\s*$)/g, '');
            var rgbReg = /^\s*rgb\s*\(\s*\d{1,3}\s*\,\s*\d{1,3}\s*\,\s*\d{1,3}\s*\)\s*$/i;
            var sixRegA = /^\s*\#[a-zA-Z0-9]{3}\s*$/;
            var sixRegB = /^\s*\#[a-zA-Z0-9]{6}\s*$/;
            var arr = [];
            if(rgbReg.test(str)){ // 以RGB形式指定的颜色
                var nStr = str.split('(')[1].split(')')[0].split(',');
                for(var i = 0 ; i < nStr.length ; i ++){
                    arr.push(nStr[i] / 1);
                }
                return arr;
            }
            if(sixRegB.test(str)) { // 以16进制指定颜色 (6位)
                var m = str.replace('#', '').match(/(\w|\d){2}/g);

                for(var i = 0 ; i < m.length; i ++){
                    arr.push(Number('0x' + m[i]).toString(10) / 1);
                }
                return arr;
            }
            if(sixRegA.test(str)){ // 以16进制指定颜色(3位)
                var cArr = str.replace('#', '').split('');
                for(var i = 0 ; i < cArr.length ; i ++){
                    arr.push(Number('0x' + (cArr[i] + cArr[i])).toString(10) / 1);
                }
                return arr;
            }
            return null;
        },

        /**
         * @private
         * @method executeWithJs
         * 执行
         */
        executeWithJs: function() {
            this.stopRequest = false;
            var that = this,
                curTime = 0;
            var animate = function() {
                if(!that.el || that.stopRequest){
                    that.stop();
                    return;
                }
                that.getSetValue(curTime, false);
                if(curTime >= that.duration * 1000){
                    that.getSetValue(null, true);

                    that.func && that.func();
                    that.el = null;
                    return;
                }
                curTime += 16;
                that.requestAnimation(animate);
            }
            this.requestAnimation(animate, this.el);
        },

        /**
         * @private
         * @method executeWithCss
         */
        executeWithCss: function() {
            if(this.isOffCss) this.duration = 0;
            var proarr = this.propertyName,
                len = proarr.length,
                that = this,
                transitionArr = [],
                _prefix = this.prefix + "transition";
            this.el.style[_prefix] = "";
            lib.each(proarr, function(index, item) {
                that.el.style[item] = that.getValue(that.startValue[index], index);
                transitionArr.push(item + " " + that.duration + "s " + that.ease);
            });
            lib(this.el).bind(this.endEvent, sr.util.bindAsEventListener(this.onEndEventCompleted, this), false);
            window.setTimeout(function() {
                that.el.style[_prefix] = transitionArr.join(", ");
                var _this = that;
                window.setTimeout(function() {
                    var z = 0;
                    for(; z < len; z++) {
                        var curValue = _this.endValue[z];
                        _this.el.style[proarr[z]] = _this.getValue(curValue, z);
                    }
                    _this.clearEventTimer();
                    _this.eventTimer = setTimeout(sr.util.bind(_this.onFinish, _this), _this.duration * 1000);

                }, that.delay * 1000);
            }, 0);
        },

        /**
         * @private
         * @method clearEventTimer
         */
        clearEventTimer: function() {
            if(this.eventTimer) {
                window.clearTimeout(this.eventTimer);
                this.eventTimer = null;
            }
        },

        /**
         * @private
         * @method onFinish
         */
        onFinish: function() {
            if(this.el) {
                lib(this.el).unbind(this.endEvent);
                this.el.style[this.prefix + "transition"] = "";
            }
            this.func && this.func();
            this.destroy();
        },

        /**
         * @private
         * @method onEndEventCompleted
         */
        onEndEventCompleted: function(e) {
            if(e.target !== e.currentTarget)    return;
            this.clearEventTimer();
            this.onFinish();
        },

        /**
         * @method sr.Tween.stop
         * @desc 停掉动画 并解脱自我
         */
        stop: function() {
            if(this.endEvent == null) {
                this.stopRequest = true;
            } else {
                this.func && this.func();
                if(this.el) {
                    lib(this.el).unbind(this.endEvent);
                    this.el.style[this.prefix + "transition"] = "";
                }
            }
            this.destroy();
        },

        /**
         * @method sr.Tween.destroy
         * @desc 看名字就知道干嘛的
         */
        destroy: function() {
            this.el = null;
        },

        /**
         * @private
         * @method getSetValue
         * @desc 取出当前的属性值
         * Parameters:
         * curTime  -   {Number}
         * isEnd    -   {Boolean}
         */
        getSetValue: function(curTime, isEnd) {
            var valueInfo = [],
                i = 0,
                iLen = this.propertyName.length;
            for(; i < iLen; i++) {
                var curValue;
                if(this.colorList[i].isColor) {
                    var startRR = this.colorList[i].startValue[0],
                        startGG = this.colorList[i].startValue[1],
                        startBB = this.colorList[i].startValue[2],

                        endRR = this.colorList[i].endValue[0],
                        endGG = this.colorList[i].endValue[1],
                        endBB = this.colorList[i].endValue[2];

                    var rr, gg, bb;
                    if(isEnd) {
                        rr = endRR;
                        gg = endGG;
                        bb = endBB;
                    } else {
                        rr = Math.ceil(this.ease(curTime, startRR, endRR - startRR, this.duration * 1000));
                        gg = Math.ceil(this.ease(curTime, startGG, endGG - startGG, this.duration * 1000));
                        bb = Math.ceil(this.ease(curTime, startBB, endBB - startBB, this.duration * 1000));
                    }
                    curValue = 'rgb(' + rr + ', ' + gg + ', ' + bb + ')';
                } else {
                    if(isEnd) {
                        curValue = this.endValue[i];
                    } else {
                        curValue = this.ease(curTime, this.startValue[i], this.endValue[i] - this.startValue[i], this.duration * 1000);
                    }
                }
                valueInfo.push({
                    propertyName: this.propertyName[i],
                    curValue : curValue,
                    isColor: this.colorList[i].isColor
                });
            }
            this.setValue(valueInfo);

        },

        /**
         * @private
         * @method setValue
         * @desc 改变值
         */
        setValue: function(valueInfo) {
            var setInfo = {},
                needSet = false,
                i = 0,
                iLen = valueInfo.length;
            for(; i < iLen; i++) {
                var propertyName = valueInfo[i].propertyName,
                    curValue = valueInfo[i].curValue,
                    isColor = valueInfo[i].isColor;
                if(propertyName == 'scrollLeft' || propertyName == 'scrollTop') {
                    this.el[propertyName] = this.getValue(curValue, i);
                } else {
                    setInfo[propertyName] = isColor ? curValue : this.getValue(curValue, i);
                    needSet = true;
                }
            }

            if(needSet) {
                for(var key in setInfo) {
                    this.el.style[key] = setInfo[key];
                }
            }
        },

        /**
         * @private
         * @method getValue
         * @param value    -   {String}
         * @param order    -   {number}
         */
        getValue: function(value, order){
            return this.needParams[order] ? value + 'px' : value;
        },

        CLASS_NAME: "SacredRelic.Tween"
    });

    /**
     * @namespace sr.easing
     * @desc 动画方法 每个方法都包括 "easeIn" 渐快 "easeOut" 渐慢 "easeInOut" 纠结的三个值可选
     */
    sr.easing = sr.easing || {};

    /**
     * @name sr.easing.linear
     * @desc 线性动画
     */
    sr.easing.linear = {

        /**
         * @name sr.easing.linear.easeIn
         * @desc 线性渐快
         * Function: easeIn
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeIn: function(t, b, c, d) {
            return c*t/d + b;
        },

        /**
         * @name sr.easing.linear.easeOut
         * @desc 线性渐慢
         * Function: easeOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeOut: function(t, b, c, d) {
            return c*t/d + b;
        },

        /**
         * @name sr.easing.linear.easeInOut
         * @desc 线性纠结
         * Function: easeInOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeInOut: function(t, b, c, d) {
            return c*t/d + b;
        }
    };

    /**
     * @name sr.easing.expo
     * @desc 指数曲线的缓动
     *
     */
    sr.easing.expo = {

        /**
         * @property sr.easing.expo.easeIn
         * @desc 渐快
         * Function: easeIn
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeIn: function(t, b, c, d) {
            return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
        },

        /**
         * @property sr.easing.expo.easeOut
         * @desc 渐慢
         * Function: easeOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeOut: function(t, b, c, d) {
            return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
        },

        /**
         * @property sr.easing.expo.easeInOut
         * @desc 纠结
         * Function: easeInOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeInOut: function(t, b, c, d) {
            if (t==0) return b;
            if (t==d) return b+c;
            if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
            return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
        }
    };

    /**
     * @name sr.easing.quad
     * @desc 二次方的缓动
     */
    sr.easing.quad = {

        /**
         * @property sr.easing.quad.easeIn
         * @desc 渐快
         * Function: easeIn
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeIn: function(t, b, c, d) {
            return c*(t/=d)*t + b;
        },

        /**
         * @property sr.easing.quad.easeOut
         * @desc 渐慢
         * Function: easeOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeOut: function(t, b, c, d) {
            return -c *(t/=d)*(t-2) + b;
        },

        /**
         * @property sr.easing.quad.easeInOut
         * @desc 纠结
         * Function: easeInOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeInOut: function(t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t + b;
            return -c/2 * ((--t)*(t-2) - 1) + b;
        }
    };

    /**
     * @name sr.easing.back
     * @desc 在过渡范围外的一端或两端扩展动画一次，以产生从其范围外回拉的效果。
     * 通俗讲就是先向后 再向反方向
     */
    sr.easing.back = {

        /**
         * @property sr.easing.back.easeIn
         * @desc 渐快
         * Function: easeIn
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeIn: function(t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b
        },

        /**
         * @property sr.easing.back.easeOut
         * @desc 渐慢
         * Function: easeOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeOut: function(t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b
        },

        /**
         * @property sr.easing.back.easeInOut
         * @desc 纠结
         * Function: easeInOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeInOut: function(t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b
        }
    };

    /**
     * @name sr.easing.bounce
     * @desc 在过渡范围的一端或两端内添加弹跳效果。类似一个球落向地板又弹起后，几次逐渐减小的回弹运动
     */
    sr.easing.bounce = {

        /**
         * @property sr.easing.bounce.easeIn
         * @desc 渐快
         * Function: easeIn
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeIn: function(t, b, c, d) {
            return c - sr.easing.bounce.easeOut(d - t, 0, c, d) + b
        },

        /**
         * @property sr.easing.bounce.easeOut
         * @desc 渐慢
         * Function: easeOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeOut: function(t, b, c, d) {
            if ((t /= d) < (1 / 2.75)) {
                return c * (7.5625 * t * t) + b
            } else if (t < (2 / 2.75)) {
                return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b
            } else if (t < (2.5 / 2.75)) {
                return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b
            } else {
                return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b
            }
        },

        /**
         * @property sr.easing.bounce.easeInOut
         * @desc 纠结
         * Function: easeInOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeInOut: function(t, b, c, d) {
            if (t < d / 2) return sr.easing.bounce.easeIn(t * 2, 0, c, d) * .5 + b;
            else return sr.easing.bounce.easeOut(t * 2 - d, 0, c, d) * .5 + c * .5 + b
        }
    };

    /**
     * @name sr.easing.elastic
     * @desc 添加一端或两端超出过渡范围的弹性效果 其中的运动由按照指数方式衰减的正弦波来定义
     * 指数衰减的正弦曲线缓动
     */
    sr.easing.elastic = {

        /**
         * @property sr.easing.elastic.easeIn
         * @desc 渐快
         * Function: easeIn
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeIn: function(t, b, c, d, a, p) {
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (!a || a < Math.abs(c)) {
                a = c;
                var s = p / 4
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return - (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b
        },

        /**
         * @property sr.easing.elastic.easeOut
         * @desc 渐慢
         * Function: easeOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeOut: function(t, b, c, d, a, p) {
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (!a || a < Math.abs(c)) {
                a = c;
                var s = p / 4
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b)
        },

        /**
         * @property sr.easing.elastic.easeInOut
         * @desc 纠结
         * Function: easeInOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeInOut: function(t, b, c, d, a, p) {
            if (t == 0) return b;
            if ((t /= d / 2) == 2) return b + c;
            if (!p) p = d * (.3 * 1.5);
            if (!a || a < Math.abs(c)) {
                a = c;
                var s = p / 4
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            if (t < 1) return - .5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b
        }
    };

    /**
     * @name sr.easing.circ
     * @desc 圆形曲线的缓动
     */
    sr.easing.circ = {

        /**
         * @property sr.easing.circ.easeIn
         * @desc 渐快
         * Function: easeIn
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeIn: function(t, b, c, d) {
            return - c * (Math.sqrt(1 - (t /= d) * t) - 1) + b
        },

        /**
         * @property sr.easing.circ.easeOut
         * @desc 渐慢
         * Function: easeOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeOut: function(t, b, c, d) {
            return c * Math.sqrt(1 - (t = t / d - 1) * t) + b
        },

        /**
         * @property sr.easing.circ.easeInOut
         * @desc 纠结
         * Function: easeInOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeInOut: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return - c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
            return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b
        }
    };

    /**
     * @name sr.easing.sine
     * @desc 正弦曲线缓动
     */
    sr.easing.sine = {

        /**
         * @property sr.easing.sine.easeIn
         * @desc 渐快
         * Function: easeIn
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeIn: function(t, b, c, d) {
            return - c * Math.cos(t / d * (Math.PI / 2)) + c + b
        },

        /**
         * @property sr.easing.sine.easeOut
         * @desc 渐慢
         * Function: easeOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeOut: function(t, b, c, d) {
            return c * Math.sin(t / d * (Math.PI / 2)) + b
        },

        /**
         * @property sr.easing.sine.easeInOut
         * @desc 纠结
         * Function: easeInOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeInOut: function(t, b, c, d) {
            return - c / 2 * (Math.cos(Math.PI * t / d) - 1) + b
        }
    };

    /**
     * @name sr.easing.quint
     * @desc 五次方的缓动
     */
    sr.easing.quint = {

        /**
         * @property sr.easing.quint.easeIn
         * @desc 渐快
         * Function: easeIn
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeIn: function(t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b
        },

        /**
         * @property sr.easing.quint.easeOut
         * @desc 渐慢
         * Function: easeOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeOut: function(t, b, c, d) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b
        },

        /**
         * @property sr.easing.quint.easeInOut
         * @desc 纠结
         * Function: easeInOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeInOut: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t * t * t + 2) + b
        }
    };

    /**
     * @name sr.easing.quart
     * @desc 四次方的缓动
     */
    sr.easing.quart = {

        /**
         * @property sr.easing.quart.easeIn
         * @desc 渐快
         *
         * Function: easeIn
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeIn: function(t, b, c, d) {
            return c * (t /= d) * t * t * t + b
        },

        /**
         * @property sr.easing.quart.easeOut
         * @desc 渐慢
         * Function: easeOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeOut: function(t, b, c, d) {
            return - c * ((t = t / d - 1) * t * t * t - 1) + b
        },

        /**
         * @property sr.easing.quart.easeInOut
         * @desc 纠结
         * Function: easeInOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeInOut: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
            return - c / 2 * ((t -= 2) * t * t * t - 2) + b
        }
    };

    /**
     * @name sr.easing.cubic
     * @desc 三次方的缓动
     */
    sr.easing.cubic = {

        /**
         * @property sr.easing.cubic.easeIn
         * @desc 渐快
         * Function: easeIn
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeIn: function(t, b, c, d) {
            return c * (t /= d) * t * t + b
        },

        /**
         * @property sr.easing.cubic.easeOut
         * @desc 渐慢
         * Function: easeOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeOut: function(t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b
        },

        /**
         * @property sr.easing.cubic.easeInOut
         * @desc 纠结
         * Function: easeInOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeInOut: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t + 2) + b
        }
    };

})($, sr);
/**
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
