$(function (){
        $('.download-app-fixed').click(function (){
            $('#app-download-iframe').attr('src',"oauth2redirect://news.bad.app");
            setTimeout(function() {
                window.location = "/app/download";
            }, 500);
        })
        var tids = []
            $('.link').each(function(idx, ele) {
                tids.push($(ele).data('tid'))
                $(ele).find('.click-count').text('--')
            })

            if(tids.length <=0){
                return;
            }
            $.ajax({
                'url': '/ajax/clickCount',
                'method': 'GET',
                'data': {
                    tids: tids.join(',')
                }
            }).done(function(data) {
                $.each(data, function(tid, clicks) {
                    $(".link[data-tid='"+ tid +"']").find('.click-count').text(clicks)
                })
            })
            $('#agree-over18').click(function(){
                document.cookie = "agree=true; expires=Fri, 31 Dec 9999 23:59:59 GMT;path=/"; 
                $('#disclaimer-background').hide()
            })
            $('#disagree-under18').click(function (){
                location.href="https://google.com"
            })

    })
    function publish() {
        var w = window.screen.width;
        showDialog('showDialog_submit', 'ajax', '����', {url: '/ajax/submit_text'}, w * 0.9);
    }

    //var mv = {id:10267,name:"���ظ�",img:"https://tu.tianzuida.com/pic/upload/vod/2019-11-16/201911161573881512.jpg",tip:"��xx��"};
    function putMvHistory(id, name, img, tip) {
        var mv = {id: id, name: name, img: img, tip: tip};
        if (window.localStorage) {
            var historyMv = localStorage.getItem("lvv2_historyMv");//ȡ��students����
            if (historyMv != null && is_json(historyMv)) {
                historyMv = JSON.parse(historyMv);//json�ַ���ת����
                historyMv.forEach((v, i) => {
                    if (v != null && v.id == mv.id || i > 48) {//ֻ��50��
                        historyMv.splice(i, 1);
                    }
                });
                historyMv.unshift(mv);
            } else {
                historyMv = [];
                historyMv.unshift(mv);
            }
            localStorage.setItem("lvv2_historyMv", JSON.stringify(historyMv));//��localStorage����ת���õĵ��ַ���
        }
    }
    $('video').bind('play', function(e) {
        var video = $('video');
        for (var i = 0; i < video.length; i++) {
            if (video[i] != e.target) {
                video[i].pause();
            }
        }
    });
    $( document ).ready(function() {
        Array.from(document.querySelectorAll('.my-videos')).map((p) => {
            const source = p.dataset.source
            if(!source){
                return;
            }
            const player = new Plyr(p, {
                iconUrl: "/plyr.io/plyr.svg",
                controls:[
                    'play-large', 'play', 'progress', 'current-time', 'mute', 'pip', 'airplay', 'fullscreen'
                ],
                fullscreen: {
                    iosNative: true
                }
            });
            player.on('play',(event) => {
                $(event.target).parents('.coverimg').find('.ct-time').hide()
            });
            if (p.dataset.type == "mp4" || !Hls.isSupported()) {
                p.src = source;
            } else {
                let hlsLoaded = false
                player.on('play', (event) => {
                    if(hlsLoaded){
                        return
                    }
                    hlsLoaded = true
                    const hls = new Hls();
                    hls.loadSource(source);
                    hls.attachMedia(p);
                })
            }

            player.on('error', event => {
                const plyr = event.detail.plyr;
    // original video is not documented in typescript
                // It's a reference to the <video> element which Plyr will override
                // A Plyr error won't happen in that element
                // const originalVideo = (plyr.elements as any).original;
                const container = plyr.elements.container;
                const plyrVideoEl = container && container.getElementsByTagName('video')[0];
                const error = plyrVideoEl?.error
                if(error?.code ==4){
                    img_error_report(plyrVideoEl,'video')
                }
            })
        })
    });

    function getMvHistory() {
        if (window.localStorage) {
            $('.stui-vodlist').html('');
            var historyMv = localStorage.getItem("lvv2_historyMv");//ȡ��students����
            if (historyMv != null && is_json(historyMv)) {
                historyMv = JSON.parse(historyMv);//json�ַ���ת����
                itemstr = '';
                Array.isArray(historyMv) && historyMv.forEach((v, i) => {

                    itemstr += '<li class="col-md-4 col-sm-4 col-xs-3 ">' +
                        '<div class="stui-vodlist__box">' +
                        '<a class="stui-vodlist__thumb lazyload" href="/mv/play/id-' + v.id + '" title="' + v.name + '" data-original="' + v.img + '"style="display: block; background-image: url(' + v.img + ');">' +
                        '<span class="play hidden-xs"></span> <span class="pic-text text-right">' + v.tip + '</span>' +
                        '</a>' +
                        '<div class="stui-vodlist__detail">' +
                        '<h4 class="title text-overflow">' +
                        '<a href="/mv/play/id-' + v.id + '" title="' + v.name + '">' + v.name + '</a></h4></div></div></li>';
                });

                $('.stui-vodlist').html(itemstr);
            }
        }
    }

    function img_error_report(obj, type) {
        var src = obj.src
        if (type == 'video')
            obj.poster = "https://img.lvv2.com/images/img/novideo.jpg";
        else
            obj.src = "https://img.lvv2.com/images/img/noimg.jpg";

        let tid = obj.id || obj.dataset.id;
        $.get(src).fail(function(event) {
                $.ajax({
                    type: 'POST'
                    , url: '/ajax/imgErrReport'
                    , data: {
                        tid: tid
                        , status:event.status 
                    }
                    , success: function(U) {
                        console.log(U);
                    }
                });
            })

    }