function Music(element) {
    //初始化
    this.artist = "";//歌手
    this.lrcStr = "";//歌词
    this.picture = "./babymetal.jpg";//图片
    this.sid = "";//编号
    this.title = "歌名"; //歌名
    this.url = ""; //歌曲路径
    this.channel = "public_aaa_bbb";//获取歌曲的频道默认随机获取
    this.channelStr = "";  //歌曲频道字符串
    this.nowTime = 0; //歌曲播放时间
    this.endTime = 0; //歌曲总长时间
    this.nowTimeStr = "0:00" //歌曲播放时间字符串拼接
    this.endTimeStr = "0:00";//歌曲总长时间字符串拼接
    this.progress = 0;//进度条的宽度
    this.top = 0; //滚动的距离
    this.number = 3;//到多少行开始滚动
    this.index = 0;//显示歌词的索引
    this.clock = true;//锁定歌曲进度条
    this.height = 50;//音量高度（百分比）
    this.musicList = [];//歌曲列表
    this.musicindex = 0;//歌曲索引
    that = this;
    this.config = {
        $iconMusic: $(".icon-music"),
        $musicMain: $(".music-main"),
        $musicTtile: $(".music-body>h2"),
        $musicLyric: $(".music-lyric"),
        $iconBofang: $(".icon-bofang"),
        $iconPre: $(".icon-pre"),
        $iconNext: $(".icon-next"),
        $musicAudio: $("audio"),
        $musicChannel: $(".music-channel"),
        $cover: $(".cover"),
        $nowTime: $(".nowtime"),
        $endTime: $(".endtime"),
        $musicProgressInner: $(".music-progress-inner"),
        $musicProgressOut: $(".music-progress-out"),
        $iconYinLiang: $(".icon-yinliang"),
        $volumeProgressOut: $(".volume-progress-out"),
        $volumeProgressInner: $(".volume-progress-inner")
    }
    ;
    //元素绑定
    this.bindDom = function () {
        //绑定歌曲名
        this.config.$musicTtile.html(this.title);
        //绑定歌曲路径
        this.config.$musicAudio.attr("src", this.url)
        //绑定背景图片
        this.config.$cover.css({"background": "url(" + this.picture + ") 50%  no-repeat", "background-size": "cover"})
        //绑定歌词
        this.config.$musicLyric.html(this.lrcStr)
        //绑定歌曲结束时间
        this.config.$endTime.text(this.endTimeStr)
        //绑定音量
        this.config.$volumeProgressInner.height(this.height + "%")
    }

    //事件绑定
    this.bindEvent = function () {
        //绑定菜单切换事件
        this.config.$iconMusic.on("click", function () {
            if ($(this).hasClass("active")) {
                $(this).removeClass("active");
                that.config.$musicMain.removeClass("active");
            } else {
                $(this).addClass("active");
                that.config.$musicMain.addClass("active");
            }
        })

        //绑定静音事件
        this.config.$iconYinLiang.on("click", function () {
            if ($(this).hasClass("icon-yinliang")) {
                $(this).removeClass("icon-yinliang").addClass("icon-jingyin")
                that.config.$musicAudio[0].volume = 0;
                that.config.$volumeProgressInner.css("height", 0)
            } else {
                $(this).removeClass("icon-jingyin").addClass("icon-yinliang")
                that.config.$musicAudio[0].volume = 0.5;
                that.config.$volumeProgressInner.css("height", that.height + "%")
            }
        })
        //绑定音量调节事件
        this.config.$volumeProgressOut.on("click", function (e) {
            var e = e || window.event; //处理兼容性问题
            that.height = e.offsetY;
            if (that.height <= 0) {
                that.height = 0;
                that.config.$musicAudio[0].volume = 0;
                that.config.$iconYinLiang.removeClass("icon-yinliang").addClass("icon-jingyin")
                that.config.$volumeProgressInner.css("height", that.height + "%")
            } else if (that.height >= 100) {
                that.height = 100;
                that.config.$musicAudio[0].volume = 1;
                that.config.$volumeProgressInner.css("height", that.height + "%")
            }
            else {
                that.config.$iconYinLiang.removeClass("icon-jingyin").addClass("icon-yinliang")
                that.config.$volumeProgressInner.css("height", that.height + "%")
                that.config.$musicAudio[0].volume = that.height / 100;
            }

        })


        //绑定歌曲总时间
        this.config.$musicAudio.on("timeupdate", function () {
            //获取歌曲总长时间
            var endtime = 0,
                s = "";
            endtime = parseInt((that.config.$musicAudio[0]).duration);
            that.endTime = endtime;
            if (endtime % 60 < 10) {
                s = "0" + endtime % 60
            } else {
                s = endtime % 60
            }
            that.endTimeStr = parseInt(endtime / 60) + ":" + s;
            that.config.$endTime.text(that.endTimeStr);

            //获取歌曲当前长度
            that.nowTime = that.config.$musicAudio[0].currentTime;
            var nowtime = parseInt(that.nowTime),
                s = "";
            if (nowtime % 60 < 10) {
                s = "0" + nowtime % 60
            } else {
                s = nowtime % 60
            }
            that.nowTimeStr = parseInt(nowtime / 60) + ":" + s;
            that.config.$nowTime.text(that.nowTimeStr);
            //获取歌曲进度
            that.progress = nowtime / endtime * 100
            that.progress = that.progress.toFixed(2)
            that.config.$musicProgressInner.width(that.progress + "%")


        })
        //绑定歌词滚动事件
        this.config.$musicAudio.on("timeupdate", function () {
            for (var i = that.index; i < that.config.$musicLyric.find("li").length; i++) {
                if (that.nowTime >= that.config.$musicLyric.find("li").eq(i).data("lang")) {
                    that.config.$musicLyric.find("li").eq(i).siblings().removeClass("active")
                    that.config.$musicLyric.find("li").eq(i).addClass("active");

                    if (i > that.index) {
                        that.clock = true
                    }
                    if (i > that.number && that.clock == true) {
                        that.number++;
                        that.top += that.config.$musicLyric.find("li").eq(that.number - 1).height()
                        that.config.$musicLyric.find("ol").css("top", "-" + that.top + "px")
                    }
                }
            }
            if (that.config.$musicAudio[0].ended == true) {
                that.play();
            }
        })

        //绑定歌曲进度条跳转事件
        that.config.$musicProgressOut.on("click", function (e) {
            that.top = 0;
            var e = e || window.event; //处理兼容性问题
            var progressWidth = e.offsetX / 2;
            var minusHeight = 0;
            that.config.$musicProgressInner.width(progressWidth + "%");
            that.nowTime = that.endTime * progressWidth / 100;
            that.config.$musicAudio[0].currentTime = that.nowTime;
            that.number = 3
            for (var j = 0; j < that.number + 1; j++) {
                minusHeight += that.config.$musicLyric.find("li").eq(j).height();
            }
            for (var i = 0; i < that.config.$musicLyric.find("li").length; i++) {
                if (that.nowTime > that.config.$musicLyric.find("li").eq(i).data("lang")) {
                    that.index = i
                    that.top += that.config.$musicLyric.find("li").eq(i).height();
                }
            }

            that.top = that.top - minusHeight;
            that.number = that.index;
            that.config.$musicLyric.find("ol").css("top", "-" + that.top + "px")
            that.clock = false

        })


        //绑定下一首
        this.config.$iconNext.on("click", function () {
            that.next();
        })
        //绑定上一首
        this.config.$iconPre.on("click", function () {
            that.pre();
        })


        //绑定play事件
        this.config.$iconBofang.on("click", function () {
            if (that.config.$musicAudio[0].paused && that.config.$musicAudio.attr("src") == false) {
                that.play();
                if (that.config.$musicAudio[0].paused) {
                    that.config.$iconBofang.removeClass("icon-bofang").addClass("icon-zanting");
                    that.config.$iconMusic.addClass("rotateplay").removeClass("rotatepaused")
                }
            }
            else if (that.config.$musicAudio[0].paused) {
                that.config.$musicAudio[0].play();
                if (!that.config.$musicAudio[0].paused) {
                    that.config.$iconBofang.removeClass("icon-bofang").addClass("icon-zanting")
                    that.config.$iconMusic.addClass("rotateplay").removeClass("rotatepaused")
                }
            }
            else {
                that.pause();
                if (that.config.$musicAudio[0].paused) {
                    that.config.$iconBofang.removeClass("icon-zanting").addClass("icon-bofang")
                    that.config.$iconMusic.removeClass("rotateplay").addClass("rotatepaused")

                }
            }
        })
    }
    //获取歌曲
    this.getsong = function (channel) {
        $.get('http://api.jirengu.com/fm/getSong.php', {channel: channel})
            .done(function (song) {
                var song = $.parseJSON(song).song
                that.artist = song[0]["artist"];
                that.picture = song[0]["picture"];
                that.sid = song[0]["sid"];
                that.title = song[0]["title"];
                that.url = song[0]["url"];
                that.getlrc();
                that.musicindex = 0;
            });
    };
    //获取歌词
    this.getlrc = function () {
        $.post('http://api.jirengu.com/fm/getLyric.php', {sid: that.sid})
            .done(function (lyric) {
                var lyric = $.parseJSON(lyric).lyric;
                //处理歌词以行来分割成数组
                var alyric = lyric.split("\n"),
                    result = [];
                var reg = /\[\d{2}:\d{2}.\d{2}\]/g;
                //歌词重置
                that.lrcStr = "";
                //歌词滚动条件重置
                that.number = 3;
                this.musicindex = 0
                alyric.forEach(function (v, /*元素属性*/i, /*元素索引*/a/*数组本身*/) {
                    /*提取时间*/
                    var time = v.match(reg),
                    /*提取歌词*/
                        value = v.replace(reg, "");

                    if (time) {
                        time.forEach(function (v1, i1, a1) {
                            var t = v1.slice(1, -1).split(':');
                            result.push([parseInt(t[0], 10) * 60 + parseFloat(t[1]), value]);
                        })
                    }
                });
                result.sort(function (a, b) {
                    return a[0] - b[0];
                })
                that.lrcStr += "<ol>"
                result.forEach(function (v2, i2, a2) {
                    that.lrcStr += "<li data-lang='" + v2[0] + "'>" + v2[1] + "</li>"
                })
                that.lrcStr += "</ol>";
                //渲染页面
                that.bindDom();
                //歌曲播放
                that.config.$musicAudio[0].play();
                that.config.$iconBofang.removeClass("icon-bofang").addClass("icon-zanting");
                that.config.$iconMusic.addClass("rotateplay").removeClass("rotatepaused");
                var oMusic = {
                    picture: that.picture,
                    url: that.url,
                    lrcStr: that.lrcStr,
                    title: that.title
                }
                that.musicList.push(oMusic);
            });
    }
    //获取歌曲频道
    this.getchannel = function () {
        $.get('http://api.jirengu.com/fm/getChannels.php')
            .done(function (channelInfo) {
                var channelInfo = $.parseJSON(channelInfo).channels;
                for (var i = 0; i < channelInfo.length; i++) {
                    that.channelStr += "<li data-channel='" + channelInfo[i].channel_id + "'>" + channelInfo[i].name + "</li>"
                }
                that.config.$musicChannel.html(that.channelStr)
                //绑定歌曲频道事件
                $(".music-channel>li").on("click", function () {
                    that.channel = $(this).data("channel");
                    that.getsong(that.channel);
                })

            });
    }
    this.bindEvent();
    this.getchannel();
}

Music.prototype = {
    play: function () {
        this.getsong(that.channel)
    },
    pause: function () {
        that.config.$musicAudio[0].pause()
    },
    next: function () {
        this.getsong(that.channel)

    },
    pre: function () {
        if (that.musicindex == 0) {
            that.title = that.musicList[that.musicList.length - 2].title;
            that.url = that.musicList[that.musicList.length - 2].url;
            that.picture = that.musicList[that.musicList.length - 2].picture;
            that.lrcStr = that.musicList[that.musicList.length - 2].lrcStr;
        }
        else {
            var index = that.musicList.length - that.musicindex - 2;
            index < 0 ? index = 0 : index = index;
            that.title = that.musicList[index].title
            that.url = that.musicList[index].url
            that.picture = that.musicList[index].picture
            that.lrcStr = that.musicList[index].lrcStr;
        }
        that.musicindex++
        that.bindDom();
        that.config.$iconBofang.removeClass("icon-bofang").addClass("icon-zanting");
        that.config.$iconMusic.addClass("rotateplay").removeClass("rotatepaused")
        that.config.$musicAudio[0].play();
    }
}

var music = new Music();


