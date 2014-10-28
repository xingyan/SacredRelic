/**
 * @file 苹果老虎机demo代码
 */
;(function(lib, sr, undefined) {

    "use strict";

    var data = [
        {
            "appid": "",
            "cate": "1",
            "createtime": "2014-09-17 18:04:46",
            "detail": "未中奖详情",
            "domain": "",
            "gkey": "",
            "id": "109",
            "imgturn": "http://p5.yx-s.com/d/inn/72012f7c/gifts/gift_1.jpg",
            "intro": "谢谢参与！",
            "level": "0",
            "name": "谢谢参与",
            "number": "0",
            "price": "0",
            "probability": "500",
            "remark": "未中奖备注",
            "roomid": "5",
            "sendoutcnt": "51",
            "sort": "1",
            "status": "1",
            "total": "-1",
            "updatetime": "2014-09-22 17:46:11",
            "ver": "8",
            "weight": "2"
        },
        {
            "appid": "",
            "cate": "9",
            "createtime": "2014-09-19 16:26:47",
            "detail": "",
            "domain": "",
            "gkey": "",
            "id": "114",
            "imgturn": "http://p5.yx-s.com/d/inn/72012f7c/gifts/gift_2.jpg",
            "intro": "论坛游乐豆150个",
            "level": "0",
            "name": "游乐豆150个",
            "number": "0",
            "price": "0",
            "probability": "0",
            "remark": "",
            "roomid": "5",
            "sendoutcnt": "0",
            "sort": "2",
            "status": "1",
            "total": "0",
            "updatetime": "2014-09-22 14:22:53",
            "ver": "3",
            "weight": "1"
        },
        {
            appid: "",
            cate: "3",
            createtime: "2014-09-19 16:27:28",
            detail: "",
            domain: "",
            gkey: "",
            id: "115",
            imgturn: "http://p7.yx-s.com/d/inn/72012f7c/gifts/gift_3.jpg",
            intro: "奇天灵猫玩偶",
            level: "0",
            name: "奇天灵猫玩偶",
            number: "0",
            price: "0",
            probability: "3",
            remark: "",
            roomid: "5",
            sendoutcnt: "1",
            sort: "3",
            status: "1",
            total: "3",
            updatetime: "2014-09-22 17:49:06",
            ver: "5",
            weight: "2"
        },
        {
            appid: "",
            cate: "3",
            createtime: "2014-09-19 16:28:11",
            detail: "",
            domain: "",
            gkey: "",
            id: "116",
            imgturn: "http://p8.yx-s.com/d/inn/72012f7c/gifts/gift_4.jpg",
            intro: "游戏平台精美贴纸",
            level: "0",
            name: "游戏平台精美贴纸",
            number: "0",
            price: "0",
            probability: "30",
            remark: "",
            roomid: "5",
            sendoutcnt: "0",
            sort: "4",
            status: "1",
            total: "30",
            updatetime: "2014-09-22 17:49:13",
            ver: "4",
            weight: "2"
        },
        {
            appid: "",
            cate: "3",
            createtime: "2014-09-19 16:29:01",
            detail: "",
            domain: "",
            gkey: "",
            id: "117",
            imgturn: "http://p6.yx-s.com/d/inn/72012f7c/gifts/gift_5.jpg",
            intro: "移动100元充值卡",
            level: "0",
            name: "移动100元充值卡",
            number: "0",
            price: "0",
            probability: "0",
            remark: "",
            roomid: "5",
            sendoutcnt: "0",
            sort: "5",
            status: "1",
            total: "-1",
            updatetime: "2014-09-22 17:49:21",
            ver: "3",
            weight: "2"
        },
        {
            appid: "",
            cate: "2",
            createtime: "2014-09-19 16:30:10",
            detail: "",
            domain: "http://qtol.youxi.com/list/zone.html",
            gkey: "",
            id: "118",
            imgturn: "http://p5.yx-s.com/d/inn/72012f7c/gifts/gift_7.jpg",
            intro: "降魔礼包: 普通强化石*5 轮回丹*2 1.5倍经验丹*1",
            level: "0",
            name: "降魔礼包（价值15RMB）",
            number: "0",
            price: "0",
            probability: "1000",
            remark: "",
            roomid: "5",
            sendoutcnt: "8",
            sort: "6",
            status: "1",
            total: "9001",
            updatetime: "2014-09-22 19:35:57",
            ver: "10",
            weight: "2"
        },
        {
            appid: "",
            cate: "2",
            createtime: "2014-09-19 16:32:14",
            detail: "",
            domain: "http://qtol.youxi.com/list/zone.html",
            gkey: "",
            id: "120",
            imgturn: "http://p5.yx-s.com/d/inn/72012f7c/gifts/gift_10.jpg",
            intro: "修罗礼包: 普通强化石*5 轮回丹*4 千年人参*1 醉八仙*1 1.5倍经验丹*1",
            level: "0",
            name: "修罗礼包（价值30RMB）",
            number: "0",
            price: "0",
            probability: "1000",
            remark: "",
            roomid: "5",
            sendoutcnt: "10",
            sort: "8",
            status: "1",
            total: "9000",
            updatetime: "2014-09-22 19:36:05",
            ver: "8",
            weight: "2"
        },
        {
            appid: "",
            cate: "3",
            createtime: "2014-09-19 16:32:44",
            detail: "",
            domain: "",
            gkey: "",
            id: "121",
            imgturn: "http://p5.yx-s.com/d/inn/72012f7c/gifts/gift_16.jpg",
            intro: "Apple iPad mini",
            level: "0",
            name: "iPadmini平板",
            number: "0",
            price: "0",
            probability: "0",
            remark: "",
            roomid: "5",
            sendoutcnt: "0",
            sort: "9",
            status: "1",
            total: "0",
            updatetime: "2014-09-23 14:29:34",
            ver: "9",
            weight: "1"
        }
    ];
    var blockW = 77,
        blockH = 54;
    lib("#apple_slots_container").appleSlots({
        data: data,
        blockW: blockW,
        blockH: blockH
    });
    lib("#apple_slots_12container").appleSlots({
        data: data,
        blockW: blockW,
        blockH: blockH,
        appLen: 12
    });
    lib("#apple_slots_8container").appleSlots({
        data: data,
        blockW: blockW,
        blockH: blockH,
        appLen: 8
    });

    var appleSlots = lib("#apple_slots_container").data("SacredRelic_ui_appleSlots"),
        apple12Slots = lib("#apple_slots_12container").data("SacredRelic_ui_appleSlots"),
        apple8Slots = lib("#apple_slots_8container").data("SacredRelic_ui_appleSlots");
    appleSlots.on("SacredRelic-AppleSlots-BlockOnClick", onBlockClick);
    appleSlots.on("SacredRelic-AppleSlots-GetTheLottery", function(data) {
        onGetLottery("appleSlots", data);
    });
    apple8Slots.on("SacredRelic-AppleSlots-GetTheLottery", function(data) {
        onGetLottery("apple8Slots", data);
    });
    apple12Slots.on("SacredRelic-AppleSlots-GetTheLottery", function(data) {
        onGetLottery("apple12Slots", data);
    });

    function onGetLottery(name, data) {
        console.log(name + "中奖了");
        console.log("中的奖品是");
        console.log(data);
    }

    function onBlockClick(opt) {
        console.log(opt);
    }
    lib("button").click(function() {
        var id = lib(this).data("id");
        appleSlots.startGame({
            "id": id
        });
        apple12Slots.startGame({
            "id": id
        });
        apple8Slots.startGame({
            "id": id
        });
    });
})($, sr);