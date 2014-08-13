/**
 * 表情管理器组件
 */
;(function(lib, sr, undefined) {

    "use strict";

    lib.sr.define("faceBar", {

        /**
         * @private
         * @property data
         * @desc 生成表情控件的数据
         */
        data: null,

        /**
         * @private
         * @property faceCEl
         * @desc 管理表情tab的容器
         */
        faceCEl: null,

        /**
         * @private
         * @property faceWrapCEl
         */
        faceWrapCEl: null,

        /**
         * @private
         * @property tabCEl
         * @desc 表情管理区的容器
         */
        tabCEl: null,

        /**
         * @private
         * @property host
         * @desc 表情服务器地址
         */
        host: null,

        /**
         * @private
         * @property curTab
         */
        curTab: null,

        /**
         * @constructor
         */
        initialize: function(container, options) {
            this.addOptions(options);
            if(!this.data)  return;
            this.event = new sr.Events(this);
            this.container = lib(container);
            this.el = lib("<div class='scaredrelic-facebar-cel'></div>");
            this.buildEl();
            this.render();
            return this;
        },

        /**
         * @private
         * @method buildEl
         * @desc 初始化节点
         */
        buildEl: function() {
            var frameEl = lib("<iframe scrolling='no' frameborder='0' class='iframe'></iframe>"),
                fragment = lib(document.createDocumentFragment()),
                i = lib("<i class='i'>◆<i>◆</i></i>"),
                j = 0,
                cuClass = "";
            this.faceCEl = lib("<div class='scaredrelic-facebar-faceconn'></div>");
            this.tabCEl = lib("<ul class='scaredrelic-facebar-all clearfix'></ul>");
            this.faceWrapCEl = lib("<div class='scaredrelic-facebar-wrap'></div>");
            var cEl = lib("<div class='scaredrelic-facebar-content'></div>")
            this.faceWrapCEl.append(cEl);
            fragment.append(i);
            var data = this.data;
            for(var k in data) {
                if(++j == 1) {
                    cuClass = "cur";
                    fragment.append(this.faceWrapCEl);
                } else {
                    cuClass = "";
                }
                var item = data[k];
                var uEl =  this.buildFaceWrap(item.list, k, cuClass);
                if(cuClass == "cur") {
                    this.curTab = uEl;
                }
                cEl.append(uEl);
                var el = lib("<li class='" + cuClass + "' title='" + k +"'><img alt='" + k +
                    "' src=" + this.host + item.pic +
                    " width='24' height='24'></li>");
                el.data("ul-id", "face_list_" + k);
                var that = this;
                el.on("click", function() {
                    if(lib(this).hasClass("cur"))   return;
                    lib(".cur").removeClass("cur");
                    that.curTab.hide();
                    var id = lib(this).data("ul-id");
                    that.curTab = lib("." + id);
                    that.curTab.show();
                    lib(this).addClass("cur");
                });
                this.tabCEl.append(el);
            }
            fragment.append(this.tabCEl);
            this.faceCEl.append(fragment);
            this.el.append(this.faceCEl);
            this.el.append(frameEl);

        },

        /**
         * @private
         * @method render
         */
        render: function() {
            SacredRelic.Widget.prototype.render.apply(this, arguments);
            this.faceWrapCEl.scrollBar({
                el: this.faceWrapCEl.find(".scaredrelic-facebar-content")
            });
        },

        /**
         * @private
         * @method buildFaceWrap
         * @desc 建立每页
         * @param list {Array}
         * @param k {String} 此页的key
         * @param display {String} 是否显示
         */
        buildFaceWrap: function(list, k, display) {
            var display = display == "" ? "none" : "",
                uEl = lib("<ul class='face_list face_list_" + k + " clearfix' style='display:" +
                    display + ";'></ul>");
            var len = list.length,
                i = 0;
            for(; i < len; i++) {
                var lEl = lib("<li title='" + list[i].alt + "'><a href='javacscript:void()'><img src='" + this.host + "face/" + k + list[i].pic +
                    "' width='" + k + "' height='" + k + "' alt='" + list[i].alt + "'></a></li>");
                lEl.data("face-id", {
                    key: k,
                    alt: list[i].alt
                });
                var that = this;
                lEl.on("click", function() {
                    that.trigger("ScaredRelic-Facebar-FaceClick", lib(this).data("face-id"));
                });
                uEl.append(lEl);
            }
            return uEl;
        },

        "CLASS_NAME": "SacredRelic.faceBar"
    });

})($, sr);