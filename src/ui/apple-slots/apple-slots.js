/**
 * @file 苹果老虎机组件
 */
;(function(lib, sr, undefined) {

    "use strict";

    /**
     * @class SacredRelic.AppleSlots
     * @param container {DOMElement} 容器 即渲染此组件的节点
     * @param options {Object} 穿入的参数
     * @param options.data {Array} 奖品列表 必须传入的参数
     * @param options.appLen {Number} 奖品个数 只有三个值可选8、12、16
     * @param options.blockW {Number} 每个奖品选项块的宽度 默认是154
     * @param options.blockH {Number} 每个奖品选项块的高度 默认是109
     * @param options.blockM {Number} 每个奖品选项块之间的margin 默认是1
     * @param options.curPos {Number} 组件初始化时默认选中的位置 默认是0
     * @param options.loop {Number} 抽奖过程中转动的圈数 默认是3
     * @param options.lowSpeed {Number} 转动的比较慢的频率 默认为400
     * @param options.highSpeed {Number} 转动的比较快的频率 默认为50
     *
     * @Method
     * startGame 开始抽奖函数
     * @param options {Object} 传入的参数
     * @param options.id {Number} 中奖奖品的id 必须传入的参数
     * @param options.startIndex {Number} 抽奖转动开始的下标 默认与当前选中的block块的index相同
     *
     * disableWidget 禁用/启用组件
     * @param disable {Boolean} 为true时禁用组件 为false时启用组件
     *
     * @Event
     * "SacredRelic-AppleSlots-BlockOnClick" 任意的奖品区块被点击 返回被点击的奖品详情
     * "SacredRelic-AppleSlots-GetTheLottery" 抽奖结束 返回中奖奖品信息
     */
    lib.sr.define("appleSlots", {

        /**
         * @desc 由于苹果老虎机的特殊之处 他一定是某个固定个数
         * 目前只支持9、12、16个奖项的抽奖
         * len表示渲染的格子的总数
         * gapIndex表示不显示出来的格子的下标
         * sideLen表示这是几乘几的矩阵
         * dataIndex表示整个转盘下来每个位置的index 具体用9个奖品举例
         *      0 1 2
         *      7 * 3
         *      6 5 4
         * @property stickLenAr
         * @type {Array}
         */
        stickLenAr: {
            "8": {
                len: 9,
                gapIndex: [4],
                sideLen: 3,
                dataIndex: [0, 1, 2, 7, 3, 6, 5, 4]

            },
            "12": {
                len: 14,
                gapIndex: [5, 8],
                sideLen: 4,
                dataIndex: [0, 1, 2, 3, 11, 4, 10, 5, 9, 8, 7, 6]
            },
            "16": {
                len: 19,
                gapIndex: [6, 9, 12],
                sideLen: 5,
                dataIndex: [0, 1, 2, 3, 4, 15, 5, 14, 6, 13, 7, 12, 11, 10, 9, 8]
            }
        },

        /**
         * @desc 苹果机的奖项个数
         * @property appLen
         * @type {Number}
         */
        appLen: 16,

        /**
         * @desc 每一个选项块的宽度
         * @property blockW
         */
        blockW: 154,

        /**
         * @desc 每个选项块的高度
         * @property blockH
         */
        blockH: 109,

        /**
         * @desc 每个选项块的边界
         * @property blockM
         */
        blockM: 1,

        /**
         * @desc 当前组件的宽度
         * @property width
         * @type {Number}
         */
        width: 0,

        /**
         * @desc 当前组件的高度
         * @property height
         * @type {Number}
         */
        height: 0,

        /**
         * @desc 当前的位置
         * @property curPos
         * @type {Number}
         */
        curPos: 0,

        /**
         * @desc 奖品列表
         * @property data
         * @type {Object}
         */
        data: null,

        /**
         * @desc li的节点list
         * @property liList
         * @type {Array}
         */
        liList: null,

        /**
         * @desc 转动的timer
         * @property loopTimer
         * @type {Number}
         */
        loopTimer: null,

        /**
         * @desc 已经切换block的次数 每次重选都会更新为0
         */
        count: 0,

        /**
         * @desc 总共选的个数
         */
        totalCount: 0,

        /**
         * @desc 在切换中比较慢的block个数
         * @type {Number}
         */
        slowCount: 5,

        /**
         * @desc 抽奖切换旋转的圈数
         * @type {Number}
         */
        loop: 3,

        /**
         * @desc 当前组件的旋转切换是否可用
         * @property disable
         * @type {Boolean}
         */
        disable: false,

        /**
         * @desc 每个获奖id对应的index缓存
         * @property cacheList
         */
        cacheList: null,

        /**
         * @desc 当前选中的block的index
         * @type {Number}
         */
        curIndex: 0,

        /**
         * @desc 比较慢的旋转时间
         * @type {Number}
         */
        lowSpeed: 400,

        /**
         * @desc 比较快的旋转时间
         * @type {Number}
         */
        highSpeed: 50,

        /**
         * @constructor
         */
        initialize: function(container, options) {
            this.addOptions(options);
            var legal = this.checkIsLegal();
            if(!legal)  throw new Error("The number of list's length is illegal!");
            if(this.data == null || !this.data.length) throw new Error("The data is illegal!");
            this.container = lib(container);
            if(this.container.css("position") == "static") {
                this.container.css("position", "relative");
            }
            this.event = new sr.Events(this);
            this.liList = [];
            this.cacheList = {};
            var sideLen = this.stickLenAr[this.appLen].sideLen;
            this.width = (this.blockW + this.blockM) * sideLen;
            this.height = (this.blockH + this.blockM) * sideLen;
            var elInner = "<div class='scaredrelic-appleslots-cel' style='width:" +
                this.width + "px; height:" + this.height + "px; position: absolute; left: 0; top: 0'></div>";
            this.el = lib(elInner);
            this.buildEl();
            this.render();
        },

        /**
         * @desc 在创建节点的时候判断是否属于该特殊区块 即占位隐藏的区块
         * @param ars {Array} 特殊区块的下标数组
         * @param index {Number} 待判断的下标
         */
        checkIndex: function(ars, index) {
            var len = ars.length,
                i = len;
            for(; i--; ) {
                if(ars[i] == index) {
                    return true;
                }
            }
            return false;
        },

        /**
         * @desc 创建初始化节点
         * @method buildEl
         */
        buildEl: function() {
            var item = this.stickLenAr[this.appLen],
                len = item.len,
                index = item.gapIndex,
                sideLen = item.sideLen,
                dataIndex = item.dataIndex,
                ul = lib("<ul></ul>"),
                i = 0,
                j = 0,
                dataLen = this.data.length;
            for(; i < len; i++) {
                var li,
                    cssText = "float: left; ",
                    data;
                if(this.checkIndex(index, i)) {
                    cssText += "width: " + (sideLen - 2) * (this.blockW + this.blockM) + "px; height: " +
                        this.blockH + "px; margin: 0 0 " + this.blockM + "px 0; visibility: hidden;";
                    li = lib("<li style='" + cssText + "'></li>");
                    ul.append(li);
                    continue;
                } else {
                    if(dataLen <= j) {
                        data = this.data[(j % dataLen)];
                    } else {
                        data = this.data[j];
                    }
                    ul.append(this.buildBlock(data, dataIndex[j]));
                    j++;
                }
            }
            this.liList = this.liList.sort(function(pre, next) {
                return pre.data("index") - next.data("index");
            });
            this.el.append(ul);
        },

        /**
         * @desc 创建单个block
         * @param data {Object} block渲染用到的数据
         * @param subIndex {Number} 整个礼物的索引顺序
         */
        buildBlock: function(data, subIndex) {
            var curClass = "";
            if(subIndex == this.curPos) {
                curClass += "sacredrelic-appleslots-cur";
                this.curIndex = subIndex;
            }
            var cssText = "width: " + this.blockW + "px; height: " + this.blockH + "px; margin: 0 " + this.blockM +
                    "px " + this.blockM + "px 0; float: left;",
                li = lib("<li class='sacredrelic-appleslots-block " + curClass + "' style='" + cssText + "'></li>"),
                span = lib("<span class='sacredrelic-appleslots-blockmark'></span>"),
                img = lib("<img width='" + this.blockW + "px' height='" + this.blockH + "px' src='" + data.imgturn + "' />");
            li.data({
                "data": data,
                "index": subIndex
            });
            li.append(span);
            li.append(img);
            var that = this;
            li.click(function(e) {
                that.blockOnClick(e, this);
            });
            this.liList.push(li);
            return li;
        },

        /**
         * @desc 当前的区块被点击
         */
        blockOnClick: function(e, target) {
            this.trigger("SacredRelic-AppleSlots-BlockOnClick", lib(target).data("data"));
        },

        /**
         * @desc 检查传入参数是否合法
         * @method checkIsLegal
         */
        checkIsLegal: function() {
            for(var k in this.stickLenAr) {
                if(k == this.appLen) {
                    return true;
                }
            }
            return false;
        },

        /**
         * @desc 切换前后两个block的选中状态
         * @param index 切换选中的block的下标
         */
        setSelectBlock: function(index) {
            var len = this.liList.length;
            if(index > len - 1) {
                index = 0;
            }
            index = Math.max(Math.min(index, len - 1), 0);
            this.curIndex = index;
            this.el.find(".sacredrelic-appleslots-cur").removeClass("sacredrelic-appleslots-cur");
            this.liList[index].addClass("sacredrelic-appleslots-cur");
        },

        /**
         * @desc 停掉定时器
         */
        stopTimer: function() {
            if(this.loopTimer != null) {
                clearTimeout(this.loopTimer);
                this.loopTimer = null;
            }
        },

        /**
         * @desc 开始循环选择
         */
        startLoopSelectBlock: function(startIndex) {
            var speed;
            if(this.count == this.totalCount) {
                this.stopTimer();
                this.count = 0;
                this.disable = false;
                this.trigger("SacredRelic-AppleSlots-GetTheLottery", this.liList[this.curIndex].data("data"));
                return;
            }
            if((this.count < this.slowCount) || (this.count > this.totalCount - this.slowCount)) {
                speed = this.lowSpeed;
            } else {
                speed = this.highSpeed;
            }
            this.stopTimer();
            this.count++;
            this.setSelectBlock(startIndex + 1);
            var that = this;
            this.loopTimer = window.setTimeout(function() {
                that.startLoopSelectBlock(that.curIndex)
            }, speed)
        },

        /**
         * @desc 根据参数进行苹果机的抽奖行为
         * @param opts {Object} 抽奖时的参数
         */
        startGame: function(opts) {
            if(this.disable)    return;
            this.disable = true;
            var id = opts.id,
                startIndex = opts.startIndex || this.curIndex,
                endIndex = this.getIndexItemById(id),
                offset = (endIndex - startIndex >= 0) ? endIndex - startIndex : this.liList.length - (startIndex - endIndex);
            this.totalCount = offset + this.loop * this.appLen;
            this.startLoopSelectBlock(startIndex);
        },

        /**
         * @desc 启用/禁用组件
         * @param disable {Boolean}
         */
        disableWidget: function(disable) {
            this.disable = disable;
        },

        /**
         * @desc 根据id获取该奖品在列表里的下标
         * @method getIndexItemById
         * @param id
         */
        getIndexItemById: function(id) {
            if(this.cacheList[id])  return this.cacheList[id];
            var len = this.liList.length,
                i = 0,
                index = -1;
            for(; i < len; i++) {
                if(this.liList[i].data("data") && this.liList[i].data("data").id == id) {
                    index = this.liList[i].data("index") || 0;
                    this.cacheList[id] = index;
                    return index;
                }
            }
            return index;
        },

        CLASS_NAME: "SacredRelic.Widget.AppleSlots"
    });

})($, sr);
