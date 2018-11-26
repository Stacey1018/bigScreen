var Plugins;

(function (Plugins) {
    var common = /** @class */ (function () {
        function common() {
        }
        //全屏
        common.launchIntoFullscreen = function (element) {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            }
            else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            }
            else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            }
            else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        };
        //退出全屏
        common.exitFullscreen = function (element) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }
            else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
            else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        };
        //判断是否全屏
        common.checkFull = function () {
            var isFull = document.fullscreenEnabled || window.fullScreen || document.webkitIsFullScreen || document.msFullscreenEnabled;
            //to fix : false || undefined == undefined
            if (isFull === undefined)
                isFull = false;
            return isFull;
        };
        /**
         * ajax请求
         * @param options 参数{}
         */
        common.doAjax = function (options) {
            var parms = {
                url: "",
                data: "",
                okCallback: function (msg) { },
                errCallback: function (XMLHttpRequest, textStatus) { },
                completeCallback: function (XMLHttpRequest, textStatus) { },
                type: "post",
                dataType: "json",
                contentType: "application/x-www-form-urlencoded"
            };
            $.extend(parms, options);
            $.ajax({
                url: parms.url,
                type: parms.type,
                data: parms.data,
                contentType: parms.contentType,
                dataType: parms.dataType,
                success: function (msg) {
                    parms.okCallback(msg);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    parms.errCallback(XMLHttpRequest, textStatus);
                },
                complete: function (XMLHttpRequest, textStatus) {
                    parms.completeCallback(XMLHttpRequest, textStatus);
                }
            });
        };
        return common;
    }());
    Plugins.common = common;
})(Plugins || (Plugins = {}));
var Plugins;
(function (Plugins) {
    var Container = /** @class */ (function () {
        function Container() {
            //大的dom 元素
            this.element = null;
            //视频元素对象 {下标:视频}
            this.videos = {};
            //销毁的video
            this.beforeVideos = {};
            //当前点击的视频
            this.currVideo = null;
            //交换位置（上一个）
            this.down = null;
            //交换位置（下一个）
            this.up = null;
            //webRTC
            this.webRTCCommon = null;
            this.pageId = "";
            this.webRTCCommon = new Plugins.webRTC();
        }
        Container.getInstance = function () {
            return new Container();
        };
        /**
         * 设置布局
         * @param num
         */
        Container.prototype.setLayout = function (num, callBack) {
            if (callBack === void 0) { callBack = null; }
            var cameraIndex = num;
            for (var index = 0; index < num; index++) {
                if (!this.videos[index]) {
                    var model = new Plugins.videoModel();
                    model.index = index;
                    this.videos[index] = model;
                    this.createDiv(index, num, cameraIndex, callBack);
                    //显示原来的视频
                    if (this.beforeVideos[index] && this.beforeVideos[index].url) {
                        this.playVideo(this.beforeVideos[index]);
                    }
                }
            }
            //清除多余的布局
            for (var key in this.videos) {
                if ((parseInt(key) + 1) > num) {
                    this.beforeVideos[key] = this.videos[key];
                    this.videoDestroy(parseInt(key));
                    var playDiv = this.element.find("div[data-index='" + key + "']");
                    playDiv.remove();
                    delete this.videos[key];
                }
            }
        };
        /**
         * 播放视频
         * @param model
         */
        Container.prototype.playVideo = function (model) {
            var _this = this;
            //找到要播放的div
            var playDiv = this.element.find("div[data-index='" + model.index + "']");
            if (!playDiv)
                return;
            //清空以前的元素
            var player = null;
            //销毁之前的
            if (this.videos[model.index].type != 2 && this.videos[model.index].element) //rtmp 
                this.videos[model.index].element.dispose();
            if (this.videos[model.index].type == 2 && this.videos[model.index].element) { //webRTC
                var rtc_1 = this.videos[model.index];
                //stop webRTC
                this.webRTCCommon.stop(rtc_1.id, rtc_1.webRtcPeer, rtc_1.ws, function () {
                    rtc_1.element.dispose();
                });
            }
            //mp4
            if (model.type == Plugins.cameraTypeEnum.mp4) {
                var videoDivStr = "<video style='width:100%;height:100%' id=\"videojs-player-" + model.index + "_" + this.pageId + "\" class=\"video-js vjs-default-skin\">\n "
                    + "<source src=\"" + model.url + "\" type='video/webm'></video>   "
                    + "<div class='video-shade'></div> ";
                videoDivStr += "</div> ";
                var videoDiv = $(videoDivStr);
                playDiv.html(videoDiv);
                player = videojs('videojs-player-' + model.index + "_" + this.pageId, {
                    poster: "",
                    controls: true,
                    techOrder: ['html5']
                }, function () {
                    if (model.isAutoPlay) {
                        _this.videoReady(player, model);
                    }
                });
            }
            //RTMP FLV
            if (model.type == Plugins.cameraTypeEnum.flash) {
                var videoDivStr = "<video style='width:100%;height:100%' id=\"videojs-player-" + model.index + "_" + this.pageId + "\" class=\"video-js vjs-default-skin\" controls='false'>\n "
                    + "<source src=\"" + model.url + "\" type='rtmp/flv'></video>   "
                    + "<div class='video-shade'></div> ";
                videoDivStr += "</div> ";
                var videoDiv = $(videoDivStr);
                playDiv.html(videoDiv);
                player = videojs('videojs-player-' + model.index + "_" + this.pageId, {
                    poster: "",
                    controls: false
                }, function () {
                    if (model.isAutoPlay) {
                        _this.videoReady(player, model);
                    }
                });
            }
            //webRTC
            if (model.type == Plugins.cameraTypeEnum.webRTC) {
                var videoDivStr = "<video style='width:100%;height:100%' id=\"videojs-player-" + model.index + "_" + this.pageId + "\" class=\"video-js vjs-default-skin\">\n  "
                    + "<div class='video-shade'></div> ";
                videoDivStr += "</div> ";
                var videoDiv = $(videoDivStr);
                playDiv.html(videoDiv);
                var webRtc_1 = this.videos[model.index];
                this.webRTCCommon.viewer(document.getElementById("videojs-player-" + model.index + "_" + this.pageId), model.id, model.url, function (webRtcPeer, ws) {
                    webRtc_1.webRtcPeer = webRtcPeer;
                    webRtc_1.ws = ws;
                    webRtc_1.id = model.id;
                    ws.onmessage = function (message) {
                        var parsedMessage = JSON.parse(message.data);
                        _this.webRTCCommon.onmessage(parsedMessage, webRtc_1.webRtcPeer);
                    };
                });
                player = videojs('videojs-player-' + model.index + "_" + this.pageId, {
                    poster: "",
                    controls: false
                }, function () {
                    if (model.isAutoPlay) {
                        _this.videoReady(player, model);
                    }
                });
                this.videos[model.index] = webRtc_1;
            }
            var videoModel = this.videos[model.index];
            videoModel.element = player;
            videoModel.type = model.type;
            videoModel.title = model.title;
            videoModel.cameraId = model.cameraId;
            videoModel.protocol = model.protocol;
            videoModel.ptzType = model.ptzType;
            videoModel.url = model.url;
            videoModel.isAutoPlay = model.isAutoPlay;
            videoModel.deviceId = model.deviceId;
            videoModel.pipeId = model.pipeId;
            videoModel.IPAddress = model.IPAddress;
            videoModel.port = model.port;
            videoModel.password = model.password;
            videoModel.account = model.account;
            videoModel.isMain = model.isMain;
            videoModel.data = model.data;
            videoModel.channelNum = model.channelNum;
            videoModel.channelPath = model.channelPath;
            videoModel.isPlay = false;
            if (model.clickCallBack) {
                videoModel.clickCallBack = model.clickCallBack;
            }
            if (model.cutImgCallBack) {
                videoModel.cutImgCallBack = model.cutImgCallBack;
            }
            if (model.videoCallBack) {
                videoModel.videoCallBack = model.videoCallBack;
            }
            if (model.closeCallBack) {
                videoModel.closeCallBack = model.closeCallBack;
            }
            if (model.lockCallBack) {
                videoModel.lockCallBack = model.lockCallBack;
            }
            if (model.subcodeCallBack) {
                videoModel.subcodeCallBack = model.subcodeCallBack;
            }
            if (model.playVideoCallBack) {
                videoModel.playVideoCallBack = model.playVideoCallBack;
            }
            //录像
            $('#video-' + model.index + "_" + this.pageId).click(function (d) {
                if (_this.videos[model.index]) {
                    videoModel.videoCallBack(_this.videos[model.index], event);
                }
                else {
                    videoModel.videoCallBack(videoModel, event);
                }
            });
            //截图
            $('#cutImg-' + model.index + "_" + this.pageId).click(function (d) {
                videoModel.cutImgCallBack(model, event);
            });
            //关闭视频
            $('#close-' + model.index + "_" + this.pageId).click(function (d) {
                videoModel.closeCallBack(model.index, event);
            });
            //锁定
            $('#lock-' + model.index + "_" + this.pageId).click(function (d) {
                videoModel.lockCallBack(model, event);
            });
            //切换字码流
            $('#subcode-' + model.index + "_" + this.pageId).click(function (d) {
                videoModel.subcodeCallBack(_this.videos[model.index], event, function (isMain) {
                    if (isMain) {
                        $('#subcode-' + model.index + "_" + _this.pageId).html("子码流");
                        $('#subcode-' + model.index + "_" + _this.pageId).attr("title", "点击切换子码流");
                    }
                    else {
                        $('#subcode-' + model.index + "_" + _this.pageId).html("主码流");
                        $('#subcode-' + model.index + "_" + _this.pageId).attr("title", "点击切换主码流");
                    }
                    _this.videos[model.index].isMain = isMain;
                });
            });
            //全屏
            $("#fullScreen-" + model.index + "_" + this.pageId).click(function (d) {
                $("#fullScreen-" + model.index + "_" + _this.pageId).parent("div").dblclick();
            });
            if (videoModel.title) {
                videoModel.element.setTitle(videoModel.title);
            }
            this.videos[model.index] = videoModel;
        };
        /**
         * 获取当前选中的视频
         */
        Container.prototype.getCurrVideo = function () {
            if (this.videos[this.currVideo.index] === undefined) {
                this.setCurrVideo(0);
            }
            return this.currVideo;
        };
        Container.prototype.stopVideo = function (video) {
            video.element.dispose();
        };
        /**
         * 设置选中
         * @param index
         */
        Container.prototype.setCurrVideo = function (index) {
            if (this.videos[index]) {
                this.currVideo = this.videos[index];
                this.element.find("div[data-index='" + index + "']").click();
            }
        };
        /**
         * 创建div
         * @param index 当前第几块屏
         * @param layout 布局的类型
         */
        Container.prototype.createDiv = function (index, layout, cameraIndex, callBack) {
            var _this = this;
            if (callBack === void 0) { callBack = function (CallBacktype, item) { }; }
            var div = $("<div \n            class='camera'\n            data-index='" + index + "'\n            id='camra" + index + "_" + this.pageId + "'\n            >\n            </div>");
            //添加事件
            div.click(function () {
                _this.currVideo = _this.videos[index];
                for (var key in _this.videos) {
                    var item = _this.videos[key];
                    if (item.index == _this.currVideo.index) {
                        _this.element.find("div[data-index='" + key + "']").addClass('selectedCamera');
                        if (callBack) {
                            callBack("click", item);
                            if (_this.videos[index]) {
                                _this.videos[index].clickCallBack(_this.videos[index]);
                            }
                        }
                    }
                    else {
                        _this.element.find("div[data-index='" + key + "']").removeClass('selectedCamera');
                    }
                }
            });
            div.mousedown(function () {
                var e = event || window.event;
                e.preventDefault();
                if (_this.videos[1] == undefined)
                    return;
                _this.down = _this.videos[index];
                if (callBack)
                    callBack("mousedown", _this.videos[index]);
            });
            div.mouseup(function () {
                var e = event || window.event;
                e.preventDefault();
                if (_this.videos[1] == undefined)
                    return;
                _this.up = _this.videos[index];
                if (callBack)
                    callBack("mouseup", _this.videos[index]);
                _this.exchange();
            });
            div.dblclick(function () {
                _this.currVideo = _this.videos[index];
                var id = "camra" + _this.currVideo.index + "_" + _this.pageId;
                //全屏
                var full = document.getElementById(id);
                if ($(_this).attr("state") == "close") {
                    $(_this).attr("state", "full");
                    Plugins.common.launchIntoFullscreen(full);
                    $("#" + id).css({
                        "width": "100%",
                        "height": "100%",
                        "top": "0",
                        "bottom": "0",
                        "right": "0",
                        "left": "0"
                    });
                }
                else {
                    //取消全屏
                    $(_this).attr("state", "close");
                    Plugins.common.exitFullscreen(full);
                    window.onresize = function () {
                        if (!Plugins.common.checkFull()) {
                            document.getElementById(id).removeAttribute('style');
                        }
                    };
                    document.getElementById(id).removeAttribute('style');
                }
            });
            this.element.append(div);
        };
        /**
         * 视频播放拖拽
         */
        Container.prototype.exchange = function () {
            if (this.down != null && this.down != this.up) {
                //交换video标签
                if (this.up != null) {
                    // 交换容器  
                    this.setCurrVideo(this.up.index);
                    var playDownContract = {};
                    var playUpContract = {};
                    // 若接收元素有数据，则需要销毁，然后互换位置 
                    if (this.up.cameraId != '') {
                        playDownContract = {
                            title: this.videos[this.up.index].title,
                            cameraId: this.videos[this.up.index].cameraId,
                            deviceId: this.videos[this.up.index].deviceId,
                            pipeId: this.videos[this.up.index].pipeId,
                            index: this.down.index,
                            type: this.videos[this.up.index].type,
                            ptzType: this.videos[this.up.index].ptzType,
                            protocol: this.videos[this.up.index].protocol,
                            url: this.videos[this.up.index].url,
                            IPAddress: this.videos[this.up.index].IPAddress,
                            port: this.videos[this.up.index].port,
                            password: this.videos[this.up.index].password,
                            account: this.videos[this.up.index].account,
                            videoCallBack: this.videos[this.up.index].videoCallBack,
                            closeCallBack: this.videos[this.up.index].closeCallBack,
                            cutImgCallBack: this.videos[this.up.index].cutImgCallBack,
                            isAutoPlay: true
                        };
                        this.videoDestroy(this.up.index);
                    }
                    if (this.down.cameraId != '') {
                        playUpContract = {
                            title: this.videos[this.down.index].title,
                            cameraId: this.videos[this.down.index].cameraId,
                            deviceId: this.videos[this.down.index].deviceId,
                            pipeId: this.videos[this.down.index].pipeId,
                            index: this.up.index,
                            type: this.videos[this.down.index].type,
                            ptzType: this.videos[this.down.index].ptzType,
                            protocol: this.videos[this.down.index].protocol,
                            url: this.videos[this.down.index].url,
                            IPAddress: this.videos[this.down.index].IPAddress,
                            port: this.videos[this.down.index].port,
                            password: this.videos[this.down.index].password,
                            account: this.videos[this.down.index].account,
                            videoCallBack: this.videos[this.down.index].videoCallBack,
                            closeCallBack: this.videos[this.down.index].closeCallBack,
                            cutImgCallBack: this.videos[this.down.index].cutImgCallBack,
                            isAutoPlay: true
                        };
                        //销毁
                        this.videoDestroy(this.down.index);
                    }
                    if (playDownContract.hasOwnProperty('title')) {
                        this.playVideo(playDownContract);
                    }
                    if (playUpContract.hasOwnProperty('title')) {
                        this.playVideo(playUpContract);
                    }
                    $("#camra" + this.up.index).click();
                }
            }
        };
        Container.prototype.videoReady = function (obj, model) {
            obj.play();
            this.videos[model.index].isPlay = true;
            if (model.playVideoCallBack) {
                model.playVideoCallBack(model);
            }
        };
        /**
        * 销毁video
        * @param index
        */
        Container.prototype.videoDestroy = function (index) {
            var currVideo = this.videos[index];
            if (!currVideo.isPlay)
                return;
            if (currVideo) {
                $("#videojs-player-" + index + "_" + this.pageId).parent().empty();
                if (currVideo.element) {
                    currVideo.element.dispose();
                }
                delete this.videos[index];
                var model = new Plugins.videoModel();
                model.index = index;
                this.videos[index] = model;
            }
        };
        return Container;
    }());
    Plugins.Container = Container;
})(Plugins || (Plugins = {}));
var Plugins;
(function (Plugins) {
    /**
     * 布局数据
     */
    var layoutEnum;
    (function (layoutEnum) {
        layoutEnum[layoutEnum["layout_1"] = 1] = "layout_1";
        layoutEnum[layoutEnum["layout_4"] = 4] = "layout_4";
        layoutEnum[layoutEnum["layout_6"] = 6] = "layout_6";
        layoutEnum[layoutEnum["layout_9"] = 9] = "layout_9";
    })(layoutEnum = Plugins.layoutEnum || (Plugins.layoutEnum = {}));
    /**
     * 云台控制枚举
     */
    var PTZEnum;
    (function (PTZEnum) {
        PTZEnum[PTZEnum["left"] = 1] = "left";
        PTZEnum[PTZEnum["right"] = 2] = "right";
        PTZEnum[PTZEnum["up"] = 3] = "up";
        PTZEnum[PTZEnum["down"] = 4] = "down";
        PTZEnum[PTZEnum["ZOOMwide"] = 5] = "ZOOMwide";
        PTZEnum[PTZEnum["ZOOMtele"] = 6] = "ZOOMtele";
        PTZEnum[PTZEnum["IRISclose"] = 7] = "IRISclose";
        PTZEnum[PTZEnum["IRISopen"] = 8] = "IRISopen";
        PTZEnum[PTZEnum["FOCUSnear"] = 9] = "FOCUSnear";
        PTZEnum[PTZEnum["FOCUSfar"] = 10] = "FOCUSfar";
        PTZEnum[PTZEnum["leftUp"] = 11] = "leftUp";
        PTZEnum[PTZEnum["leftDown"] = 12] = "leftDown";
        PTZEnum[PTZEnum["rightUp"] = 13] = "rightUp";
        PTZEnum[PTZEnum["rightDown"] = 14] = "rightDown";
        PTZEnum[PTZEnum["relation"] = 15] = "relation";
    })(PTZEnum = Plugins.PTZEnum || (Plugins.PTZEnum = {}));
    //相机类型
    // rtmp、rtsp、pvg类型相机在调用流媒体服务获取相机流时，需要传url
    // gb28181 国标相机需要传deviceid，其它的deviceid为相机id
    var cameraType;
    (function (cameraType) {
        cameraType["rtmp"] = "rtmp";
        cameraType["rtsp"] = "rtsp";
        cameraType["haikang"] = "haikang";
        cameraType["dahua"] = "dahua";
        cameraType["onvif"] = "onvif";
        cameraType["gb28181"] = "gb28181";
        cameraType["pvg"] = "pvg";
    })(cameraType = Plugins.cameraType || (Plugins.cameraType = {}));
    /**
     * 相机类型
     * 1:flash(rtmp) 2:webRTC 3:mp4
     */
    var cameraTypeEnum;
    (function (cameraTypeEnum) {
        cameraTypeEnum[cameraTypeEnum["flash"] = 1] = "flash";
        cameraTypeEnum[cameraTypeEnum["webRTC"] = 2] = "webRTC";
        cameraTypeEnum[cameraTypeEnum["mp4"] = 3] = "mp4";
    })(cameraTypeEnum = Plugins.cameraTypeEnum || (Plugins.cameraTypeEnum = {}));
    /**
     * 播放器布局model
     */
    var videoModel = /** @class */ (function () {
        function videoModel(parmIsReady) {
            if (parmIsReady === void 0) { parmIsReady = false; }
            this.cameraId = '';
            this.pipeId = ''; //管道id
            this.deviceId = ''; //设备id
            this.channelPath = '';
            this.channelNum = '';
            this.videoCallBack = function (camera) { console.log('videoCallBack'); };
            this.cutImgCallBack = function (camera) { console.log('cutImgCallBack'); };
            this.closeCallBack = function (camera) { console.log('closeCallBack'); };
            this.lockCallBack = function (camera) { console.log('lockCallBack'); };
            this.subcodeCallBack = function (camera) { console.log('subcodeCallBack'); };
            this.clickCallBack = function (camera) { console.log('subcodeCallBack'); };
            this.playVideoCallBack = function (camera) { console.log('playVideoCallBack'); };
            //是否开始录制
            this.isRecordVideo = false;
            //是否是主码流
            this.isMain = true;
            this.isReady = parmIsReady;
        }
        return videoModel;
    }());
    Plugins.videoModel = videoModel;
})(Plugins || (Plugins = {}));
var Plugins;
(function (Plugins) {
    var Camera = /** @class */ (function () {
        function Camera() {
            //播放器节点
            this.defaultOption = {};
            this.videojsPlugin = new videojsPlugin();
            this.cameraUtilities = null;
            this.container = Plugins.Container.getInstance();
            registerPlugin = videojs.registerPlugin || videojs.plugin;
            //添加标题 Plugin
            registerPlugin('setTitle', this.videojsPlugin.setTitle);
        }
        /**
         * 初始化插件
         */
        Camera.prototype.init = function (element, pageId, swfPath) {
            if (pageId === void 0) { pageId = ""; }
            if (swfPath === void 0) { swfPath = "/src/assets/video-js.swf"; }
            videojs.options.flash.swf = swfPath;
            this.container.element = element;
            this.container.pageId = pageId;
        };
        /**
         * 销毁video
         * @param index
         */
        Camera.prototype.videoDestroy = function (index) {
            this.container.videoDestroy(index);
        };
        /**
         * 设置布局
         * @param num
         */
        Camera.prototype.setLayout = function (num, callBack) {
            if (callBack === void 0) { callBack = null; }
            this.container.setLayout(num, callBack);
        };
        /**
         * 获取当前选中的视频
         */
        Camera.prototype.getCurrVideo = function () {
            return this.container.getCurrVideo();
        };
        /**
         * 设置选中
         * @param index
         */
        Camera.prototype.setCurrVideo = function (index) {
            return this.container.setCurrVideo(index);
        };
        /**
         * 播放视频
         * @param model
         */
        Camera.prototype.playVideo = function (model) {
            this.container.playVideo(model);
        };
        /**
        * 关闭视频
        * @param video
        */
        Camera.prototype.stopVideo = function (video) {
            this.container.playVideo(video);
        };
        /**
         * 检查ele是否正确
         */
        Camera.prototype.checkEle = function () {
            if (!$(this.container.element)) {
                alert("初始化失败dom元素不存在");
                return;
            }
            //判断高度宽度
            if (!$(this.container.element).css("width") || !$(this.container.element).css("height")) {
                alert("dom元素宽度or高度不能为空");
                return;
            }
        };
        /**
         * video插件回调方法
         * @param options
         */
        Camera.prototype.camera = function (options) {
            var mergeOption = videojs.mergeOptions(this.defaultOption, options);
        };
        return Camera;
    }());
    Plugins.Camera = Camera;
    //video plugin
    var videojsPlugin = /** @class */ (function () {
        function videojsPlugin() {
        }
        videojsPlugin.prototype.setTitle = function (title) {
            this.el().querySelector(".video-js");
        };
        return videojsPlugin;
    }());
})(Plugins || (Plugins = {}));
var Plugins;
(function (Plugins) {
    var webRTC = /** @class */ (function () {
        function webRTC() {
            this.id = "";
        }
        /**
         *
         * @param video dom
         */
        webRTC.prototype.viewer = function (video, playerId, url, callBack) {
            var _this = this;
            this.initWs(url, function (ws) {
                _this.id = playerId;
                var options = {
                    remoteVideo: video,
                    onicecandidate: function (candidate) {
                        _this.onIceCandidate(candidate, ws);
                    }
                };
                var webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, function (error) {
                    if (error)
                        return;
                    webRtcPeer.generateOffer(function (error, offerSdp) {
                        _this.onOfferViewer(error, offerSdp, ws);
                    });
                    callBack(webRtcPeer, ws);
                });
            });
        };
        /**
         *
         * @param candidate
         */
        webRTC.prototype.onIceCandidate = function (candidate, ws) {
            var message = {
                id: 'onIceCandidate',
                candidate: candidate
            };
            this.sendMessage(ws, message);
        };
        /**
         * 停止
         * @param playerId
         * @param webRtcPeer
         * @param callBack
         */
        webRTC.prototype.stop = function (playerId, webRtcPeer, ws, callBack) {
            var message = {
                id: playerId
            };
            this.sendMessage(ws, message);
            if (webRtcPeer) {
                webRtcPeer.dispose();
                if (callBack)
                    callBack();
            }
        };
        /**
         * 注册订阅者
         * @param error
         * @param offerSdp
         */
        webRTC.prototype.onOfferViewer = function (error, offerSdp, ws) {
            if (error)
                return;
            var message = {
                id: this.id,
                sdpOffer: offerSdp
            };
            this.sendMessage(ws, message);
        };
        webRTC.prototype.viewerResponse = function (message, webRtcPeer) {
            if (message.response != 'accepted') {
                var errorMsg = message.message ? message.message : 'Unknow error';
                console.warn('Call not accepted for the following reason: ' + errorMsg);
            }
            else {
                webRtcPeer.processAnswer(message.sdpAnswer);
            }
        };
        webRTC.prototype.sendMessage = function (ws, message) {
            var jsonMessage = JSON.stringify(message);
            ws.send(jsonMessage);
        };
        /**
         * 初始化ws
         * @param wsUrl
         * @param callBack
         */
        webRTC.prototype.initWs = function (wsUrl, callBack) {
            var ws = null;
            if (ws == null) {
                ws = new WebSocket(wsUrl);
                ws.onopen = function (event) {
                    //ws链接成功
                    if (callBack)
                        callBack(ws);
                };
            }
        };
        webRTC.prototype.onmessage = function (parsedMessage, webRtcPeer) {
            switch (parsedMessage.id) {
                case 'viewerResponse':
                    this.viewerResponse(parsedMessage, webRtcPeer);
                    break;
                case 'stopCommunication':
                    //dispose();
                    break;
                case 'iceCandidate':
                    webRtcPeer.addIceCandidate(parsedMessage.candidate);
                    break;
                default:
                    console.error('Unrecognized message', parsedMessage);
            }
        };
        return webRTC;
    }());
    Plugins.webRTC = webRTC;
})(Plugins || (Plugins = {}));
