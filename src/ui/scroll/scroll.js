/**
 * 模拟滚动条组件
 */
;(function(lib, sr) {

    "use strict";

    lib.sr.define("scrollBar", {

        /**
         * @property wheelSpeed
         * @type {Number}
         * @desc 滚动条滚动频率
         */
        wheelSpeed: 50,

        /**
         * @property overflow
         * @type {Boolean}
         * @desc 当前是否显示了滚动条
         */
        overflow: false,

        /**
         * @property scrollBox
         * @type {DOMElement}
         * @desc 滚动条的容器
         */
        scrollBox: null,

        /**
         * @property hasArrow
         * @type {Boolean}
         * @desc 是否生成滚动条的上下箭头
         */
        hasArrow: true,

        /**
         * @property upArrow
         * @type {DOMElement}
         * @desc 👆按钮
         */
        upArrow: null,

        /**
         * @property downArrow
         * @type {DOMElement}
         * @desc 👇按钮
         */
        downArrow: null,

        /**
         * @property track
         * @type {DOMElement}
         * @desc 滑轨
         */
        track: null,

        /**
         * @property trackBox
         * @type {DOMElement}
         * @desc 滑块
         */
        trackBox: null,

        /**
         * @property trackOnDrag
         * @type {Boolean}
         * @desc 滑块被拖拽标志位
         */
        trackOnDrag: false,

        /**
         * @property dragMerge
         * @type {Number}
         * @desc 中间变量存一下滑块移动的值
         */
        dragMerge: 0,

        /**
         * @property dragMergeY
         * @type {Number}
         * @desc 又一个中间变量 是不是很神奇
         */
        dragMergeY: 0,

        /**
         * @property trackHeight
         * @type {Number}
         * @desc 中间变量 用于拖拽
         */
        trackHeight: 0,

        /**
         * @property blockHeight
         * @type {Number}
         */
        blockHeight: 0,

        /**
         * @property ie
         * @desc 判断浏览器是否是ie
         */
        ie: false,

        /**
         * @property onChangeTimer
         * @desc 监听内容区域发生变化的定时器
         */
        onChangeTimer: 0,

        /**
         * @property lastHeight
         * @desc 上一次保存的渲染区域的高度
         */
        lastHeight: 0,

        /**
         * @constructor
         */
        initialize: function(container, options) {
            this.addOptions(options);
            this.ie = /msie/i.test(navigator.userAgent);
            this.container = lib(container);
            this.event = new sr.Events(this);
            this.el = lib(this.el);
            this.el.css("overflow", "hidden");
            this.buildEl();
            this.addEvent();
            return this;
        },

        /**
         * @private
         * @method addEvent
         * @desc 增加事件监听
         */
        addEvent: function() {
            if(this.hasArrow) {
                //上下箭头按钮监听
                this.addArrowEvent();
            }
            //滑块拖拽监听
            this.trackBox.on("mouseover mouseout mousedown mouseup", sr.util.bind(this.dispatchTrackEvent, this));
            lib(document).on("mousedown", sr.util.bind(this.downFunc, this));
            lib(document).on("mousemove", sr.util.bind(this.moveFunc, this));
            lib(document).on("mouseup", sr.util.bind(this.upFunc, this));
            //滑轨点击监听
            this.track.on("mousedown", sr.util.bind(this.onClickTrack, this));
            //鼠标滚轮事件监听
            this.el.on("mousewheel DOMMouseScroll", sr.util.bind(this.onWheel, this));
            this.scrollBox.on("mousewheel DOMMouseScroll", sr.util.bind(this.onWheel, this));
            //监听内容区域发生的变化
            this.onChangeTimer = window.setInterval(sr.util.bind(this.onTimer, this), 32);
        },

        /**
         * @private
         * @method onTimer
         * @desc 监听正文区域发生变化的定时器
         */
        onTimer: function() {
            var h = this.el[0].scrollHeight;
            if(this.lastHeight == h)    return;
            this.lastHeight = h;
            if(this.trackOnDrag) {
                this.blockHeight = this.trackBox[0].clientHeight;
            }
            this.checkShow("listen");
        },

        /**
         * @private
         * @desc 监听滚动条鼠标滚轮事件
         * @method onWheel
         * @param e {JQuery Event}
         */
        onWheel: function(e) {
            if(!this.overflow)  return;
            var evt = e.originalEvent || window.event;
            evt.stopPropagation && (evt.preventDefault(), evt.stopPropagation()) || (evt.cancelBubble = true, evt.returnValue = false);
            var scroll = (evt.wheelDelta/120 * -1 || evt.detail / 3) * this.wheelSpeed;
            this.el[0].scrollTop += scroll;
            this.checkTrackBlock();
        },

        /**
         * @private
         * @method onClickTrack
         * @param e {Jquery Event}
         * @desc 滑槽被点击
         */
        onClickTrack: function(e) {
            var el = e.target || e.srcElement,
                needReturn = this.ie ? e.button != 1 : e.button != 0;
            if(needReturn || (el.parentNode == this.trackBox[0] || el == this.trackBox[0])) return;
            var tbPos = this.getPosition(this.trackBox[0]).top,
                tPos = this.getPosition(this.track[0]).top,
                trackPoint = e.clientY - tPos,
                blockPoint = tbPos - tPos,
                blockHeight = this.trackBox[0].clientHeight,
                rt,
                st;
            if(trackPoint < blockPoint){
                rt = trackPoint + 'px';
                st = parseInt(trackPoint / this.track[0].clientHeight * this.el[0].scrollHeight);
            }else if(trackPoint > blockHeight + blockPoint){
                rt = trackPoint - blockHeight + 'px';
                st = parseInt((trackPoint - blockHeight) / this.track[0].clientHeight * this.el[0].scrollHeight);
            }
            this.trackBox[0].style.top = rt;
            this.el[0].scrollTop = st;
        },

        /**
         * @private
         * @method downFunc
         * @param e {JQuery Event}
         * @desc 处理滑块拖拽事件
         */
        downFunc: function(e) {
            var el = e.target || e.srcElement,
                needReturn = this.ie ? e.button != 1 : e.button != 0;
            if(needReturn || (el.parentNode != this.trackBox[0] && el != this.trackBox[0])) return;
            if(this.ie && this.trackBox[0].setCapture) {
                this.trackBox[0].setCapture();
            } else {
                e.preventDefault();
            }
            var tbPos = this.getPosition(this.trackBox[0]),
                tPos = this.getPosition(this.track[0]);
            this.dragMerge = tPos.top;
            this.dragMergeY = e.clientY - tbPos.top;
            this.trackHeight = this.track[0].clientHeight;
            this.blockHeight = this.trackBox[0].clientHeight;
            this.trackOnDrag = true;
        },

        /**
         * @private
         * @method moveFunc
         * @desc 处理滑块拖拽事件
         * @param e {JQuery Event}
         */
        moveFunc: function(e) {
            if(!this.trackOnDrag)   return;
            var t = e.clientY - this.dragMerge - this.dragMergeY,
                s = 0,
                eScroll = this.el[0].scrollHeight;
            if(t < 0) {
                t = 0;
            } else if(t > this.trackHeight - this.blockHeight) {
                t = this.trackHeight - this.blockHeight;
                s = eScroll - this.container[0].clientHeight;
            } else {
                s = parseInt(t / this.trackHeight * eScroll);
            }
            this.trackBox[0].style.top = t + "px";
            this.el[0].scrollTop = s;
        },

        /**
         * @private
         * @method upFunc
         * @desc 处理滑块拖拽事件
         * @param e {Jquery Event}
         */
        upFunc: function(e) {
            if(!this.trackOnDrag)   return;
            if(this.ie && this.trackBox[0].releaseCapture) {
                this.trackBox[0].releaseCapture();
            }
            this.trackOnDrag = false;
            this.trackBox[0].className = "scaredrelic-scrollbox-trackmouseup";
        },

        /**
         * @private
         * @method dispatchTrackEvent
         * @desc 负责分发滑块上的各种事件
         */
        dispatchTrackEvent: function(e) {
            var type = e.type,
                button = e.button || 0,
                className = "",
                w = e.which || 1;
            switch(type) {
                case "mouseout":
                    className = "scaredrelic-scrollbox-trackblock";
                    break;
                case "mouseover":
                case "mouseup":
                case "mousedown":
                    className = "scaredrelic-scrollbox-track" + type;
                    break;
                default:
                    break;
            }
            if((button != 0 && w != 1) || className == "") return;
            if(!this.trackOnDrag) {
                this.trackBox[0].className = className;
            }
        },

        /**
         * @private
         * @method addArrowEvent
         * @desc 增加上下滚动条按钮事件
         */
        addArrowEvent: function() {
            this.upArrow.on("mouseover mouseout mousedown", sr.util.bind(this.dispatchArrowEvent, this));
        },

        /**
         * @private
         * @method dispatchArrowEvent
         * @desc 用来处理各种具体事件滚动按钮
         */
        dispatchArrowEvent: function(e) {
            var type = e.type;
            switch(type) {
                case "mouseout":
                    this.arrowButtonOnMouseOut(e);
                    break;
                case "mouseover":
                    this.arrowButtonOnMouseOver(e);
                    break;
                case "mousedown":
                    this.arrowButtonOnMouseDown(e);
                    break;
                default:
                    break;
            }
        },

        /**
         * @private
         * @method arrowButtonOnMouseOut
         * @param e {Jquery.Event}
         * @desc 滚动条箭头按钮鼠标划出
         */
        arrowButtonOnMouseOut: function(e) {
            //TODO

        },

        /**
         * @private
         * @method arrowButtonOnMouseOver
         * @param e {Jquery.Event}
         * @desc 滚动条箭头按钮鼠标划入
         */
        arrowButtonOnMouseOver: function(e) {
            //TODO

        },

        /**
         * @private
         * @method arrowButtonOnMouseDown
         * @param e {Jquery.Event}
         * @desc 滚动条箭头被点击
         */
        arrowButtonOnMouseDown: function(e) {
            //TODO

        },


        /**
         * @private
         * @method buildEl
         * @desc 初始化各类节点
         */
        buildEl: function() {
            this.scrollBox = lib("<div class='sacredrelic-scrollbox-box'></div>");
            if(this.hasArrow) {
                this.upArrow = lib("<div class='scaredrelic-scrollbox-uparrow'></div>");
                this.downArrow = lib("<div class='scaredrelic-scrollbox-downarrow'></div>");
                this.scrollBox.append(this.upArrow);
            }
            this.track = lib("<div class='scaredrelic-scrollbox-track'>");
            this.trackBox = lib("<div class='scaredrelic-scrollbox-trackblock'><div class='scaredrelic-scrollbox-trackblocktop'></div><div class='scaredrelic-scrollbox-trackblockbody'></div><div class='scaredrelic-scrollbox-trackblockbottom'></div></div>");
            this.track.append(this.trackBox);
            this.scrollBox.append(this.track);
            if(!!this.downArrow) {
                this.scrollBox.append(this.downArrow);
            }
            this.container.append(this.scrollBox);
        },

        /**
         * @method checkShow
         * @desc 判断是否显示出来
         */
        checkShow: function(opt) {
            var //👆按钮的高度
                uAHeight = this.hasArrow ? this.upArrow[0].clientHeight : 0,
                //👇按钮的高度
                dAHeight = this.hasArrow ? this.downArrow[0].clientHeight : 0,
                //container的高度
                cCHeight = this.container[0].clientHeight,
                //container的宽度
                cCWidth = this.container[0].clientWidth,
                //内容区域的scroll高度
                eSHeight = this.el[0].scrollHeight,
                //内容区域的scrollTop
                eSTop = this.el[0].scrollTop,
                //待设置的节点宽高
                eWidth = cCWidth,
                eHeight = cCHeight;
            if(cCHeight < eSHeight) {
                this.overflow = true;
                this.scrollBox.css({
                    "display": "",
                    "height": cCHeight + "px"
                });
                this.track.css("height", cCHeight - uAHeight - dAHeight + "px");
                if(cCHeight + eSTop > eSHeight) {
                    this.el[0].scrollTop = eSHeight - cCHeight;
                }
                eWidth = cCWidth - this.scrollBox[0].clientWidth;
                eHeight = cCHeight;
                this.checkTrackBlock({
                    cH: cCHeight,
                    rS: eSHeight,
                    sT: eSTop
                });
            } else {
                this.overflow = false;
                this.scrollBox.hide();
                this.el[0].scrollTop = 0;
            }
            this.el.css({
                "width": eWidth + "px",
                "height": eHeight + "px"
            });

        },

        /**
         * @method checkTrackBlock
         * @desc 调整滑块的位置
         * @param opts {Object} 传入帮助定位的参数
         */
        checkTrackBlock: function(opts) {
            opts = opts || {};
            var cH = opts.cH || this.container[0].clientHeight,
                rS = opts.rS || this.el[0].scrollHeight,
                sT = opts.sT || this.el[0].scrollTop,
                tH = this.track[0].clientHeight;
            var curH = (tH * cH / rS) >> 0,
                bHeight = curH < 6 ? 6 : curH;
            this.trackBox.css("height", bHeight + "px");
            this.trackBox.find("div")[1].style.height = bHeight - 4 + "px";
            var t = (tH * sT / rS) >> 0;
            this.trackBox.css("top", t + "px");
        },

        /**
         * @method getPosition
         * @desc 获取对象绝对位置
         * @param {Object} el
         */
        getPosition: function(el){
            var ua = navigator.userAgent.toLowerCase();
            var parent = null;
            var pos = [];
            var box;
            if (el.getBoundingClientRect){ //ie
                box = el.getBoundingClientRect();
                var scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
                var scrollLeft = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
                return {
                    left: box.left + scrollLeft,
                    top: box.top + scrollTop
                };
            }else if (document.getBoxObjectFor){ // gecko
                box = document.getBoxObjectFor(el);
                var borderLeft = (el.style.borderLeftWidth) ? parseInt(el.style.borderLeftWidth) : 0;
                var borderTop = (el.style.borderTopWidth) ? parseInt(el.style.borderTopWidth) : 0;
                pos = [box.x - borderLeft, box.y - borderTop];
            }else{ // safari & opera
                pos = [el.offsetLeft, el.offsetTop];
                parent = el.offsetParent;
                if (parent != el) {
                    while (parent) {
                        pos[0] += parent.offsetLeft;
                        pos[1] += parent.offsetTop;
                        parent = parent.offsetParent;
                    }
                }
                if (/opera/.test(ua) || (/safari/.test(ua) && el.style.position == 'absolute')) {
                    pos[0] -= document.body.offsetLeft;
                    pos[1] -= document.body.offsetTop;
                }
            }
            el.parentNode ? parent = el.parentNode : parent = null;
            while (parent && parent.tagName.toUpperCase() != 'BODY' && parent.tagName.toUpperCase() != 'HTML') { // account for any scrolled ancestors
                pos[0] -= parent.scrollLeft;
                pos[1] -= parent.scrollTop;
                parent.parentNode ? parent = parent.parentNode : parent = null;
            }
            return {
                left: pos[0],
                top: pos[1]
            }
        },

        /**
         * @public
         * @method sr.ScrollBar.resize
         * @desc 当容器宽高改变时主动调用的API
         */
        resize: function() {
            this.checkShow();
            this.el.css("height", this.container[0].clientHeight + "px");
        },

        /**
         * @public
         * @method sr.ScrollBar.scrollTo
         * @desc 设置滚动条到一个位置
         * @param v {Number}
         */
        scrollTo: function(v) {
            this.el[0].scrollTop = v;
            this.checkTrackBlock();
        },

        /**
         * @public
         * @method sr.ScrollBar.scrollToTop
         * @desc 滚动到顶部
         */
        scrollToTop: function() {
            this.scrollTo(0);
        },

        /**
         * @public
         * @method sr.ScrollBar.scrollToBottom
         * @desc 滚动到顶部
         */
        scrollToBottom: function() {
            this.scrollTo(this.el[0].scrollHeight - this.container[0].clientHeight)
        },

        /**
         * @public
         * @method sr.ScrollBar.dispose
         * @desc 销毁
         */
        dispose: function() {
            window.clearInterval(this.onChangeTimer);
            if(this.overflow) {
                this.el.css("width", this.container[0].clientWidth + "px");
            }
            lib(document).off("mousedown", sr.util.bind(this.downFunc, this));
            lib(document).off("mousemove", sr.util.bind(this.moveFunc, this));
            lib(document).off("mouseup", sr.util.bind(this.upFunc, this));
            this.el.off("mousewheel DOMMouseScroll", sr.util.bind(this.onWheel, this));
            this.scrollBox.off("mousewheel DOMMouseScroll", sr.util.bind(this.onWheel, this));
            this.scrollBox.remove();
            for(var item in this){
                this[item] = null;
            }
        },

        CLASS_NAME: "SacredRelic.ScrollBar"
    });

})($, sr);