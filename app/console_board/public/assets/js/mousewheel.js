var $body;
var $sections;
var $sectionNav;
var sectionInt = 800;
var sections = [];
var inBottom = false;
var isMoving = false;

/**
 * 初始化 jquery 缓存
 */
var initJqueryDOM = function () {
    $body = $('body');
    $sections = $('.section');
    $sectionNav = $('.section-nav');
};

/**
 * 初始化元素样式
 */
var initEleStyle = function () {
    $body.css({
        'overflow-y': 'hidden',
        'position': 'relative'
    });
    $sectionNav.css({
        'margin-top': -($sectionNav.height() / 2)
    });
};

/**
 * 初始化默认位置
 */
var initDefaultPosition = function () {
    setTimeout(function () {
        $(document).scrollTop(0);
    }, 500);
};

/**
 * 初始化滚动区间
 */
var initSections = function () {
    $sections.each(function (i) {
        sections.push({
            index: i,
            top: this.offsetTop,
            bottom: this.offsetTop + sectionInt
        });
    });
};

/**
 * 初始化地图
 */
var initMap = function () {
    var map = echarts.init(document.getElementById('map'));
    var option = {
        tooltip : {
            trigger: 'item',
            formatter: '共生成 {c} 份'
        },
        dataRange: {
            show:false,
            x: 'right',
            y: 'bottom',
            splitList: [                
                { start: 1000000, color: '#0277BD' },
                { start: 150000, end: 1000000, color: '#0288d1' },
                { start: 10000, end: 150000, color: '#03a9f4' },
                { start: 1000, end: 10000, color: '#4fc3f7'},
                { start: 100, end: 1000, color: '#8ed9fa'},
                { start: 0, end: 100, color:'#b3e5fc'}
            ]
        },

        toolbox: {
            show: true
        },
        series : [
            {
                name: '提分策',
                type: 'map',
                mapType: 'china',
                roam: false,
                itemStyle: {
                    normal: {
                        label: {
                            show: true,
                            textStyle: {
                                color: "#D87A80"
                            }
                        }
                    },
                    emphasis:
                     {
                         areaStyle: {
                             color: '#0ac762'
                         },
                         label:
                         {
                             show: true,
                             color: 'red',
                             textStyle: {
                                 color: "#fff"
                             }
                         }
                     }
                },
                data:[
                    {name: '北京',value: 9885},
                    {name: '天津',value: 0},
                    {name: '上海',value: 3617},
                    {name: '重庆',value: 540},
                    {name: '河北',value: 16480},
                    {name: '河南',value: 13515},
                    {name: '云南',value: 0},
                    {name: '辽宁',value: 0},
                    {name: '黑龙江',value: 0},
                    {name: '湖南',value: 1096425},
                    {name: '安徽',value: 110},
                    {name: '山东',value: 1900},
                    {name: '新疆',value: 3300},
                    {name: '江苏',value: 37700},
                    {name: '浙江',value: 51490},
                    { name: '江西', value: 1540812, selected: true },
                    {name: '湖北',value: 1227150},
                    {name: '广西',value: 0},
                    {name: '甘肃',value: 0},
                    {name: '山西',value: 19125},
                    {name: '内蒙古',value: 0},
                    {name: '陕西',value: 0},
                    {name: '吉林',value: 0},
                    {name: '福建',value: 2265},
                    {name: '贵州',value: 0},
                    {name: '广东',value: 200690},
                    {name: '青海',value: 0},
                    {name: '西藏',value: 0},
                    {name: '四川',value: 0},
                    {name: '宁夏',value: 0},
                    {name: '海南',value: 0},
                    {name: '台湾',value: 0},
                    {name: '香港',value: 0},
                    {name: '澳门',value: 0}
                ]
            }
        ]
    };

    map.setOption(option);
};

/**
 * 渲染滚动区间导航
 * @param visibility 可见性
 * @param index 当前激活项索引
 */
var renderSectionNav = function (visibility, index) {
    $sectionNav.css({
        'visibility': visibility
    });
    $sectionNav.find('li').removeClass('active');
    index !== undefined && $sectionNav.find('li').eq(index).addClass('active');
};

/**
 * 激活滚动区间动画
 * @param index
 */
var activeSection = function (index) {
    $sections.removeClass('active');
    index !== -1 && $sections.eq(index).addClass('active');
};

/**
 * 处理向上滚动
 * @param viewPortTop 当前视图顶部到文档顶部距离
 */
var handleWheelUp = function(viewPortTop) {
    var overflow = 0;

    if (isMoving) return;

    $.each(sections, function () {
        var that = this;

        if (that.bottom - viewPortTop === 0) {
            isMoving = true;

            $('html,body').stop().animate({
                "scrollTop": that.top
            }, {
                easing: 'easein',
                duration: 500,
                complete: function () {
                    isMoving = false;
                    renderSectionNav('visible', that.index);
                    activeSection(that.index);
                }
            });

            return false;
        } else if (viewPortTop > sections[$sections.length - 1].top && inBottom) {
            isMoving = true;

            $('html,body').stop().animate({
                "scrollTop": sections[$sections.length - 1].top
            }, {
                easing: 'easein',
                duration: 500,
                complete: function () {
                    isMoving = false;
                    renderSectionNav('visible', $sections.length - 1);
                    activeSection($sections.length - 1);
                }
            });

            return false;
        } else if (this.top - viewPortTop === 0 || viewPortTop === 0) {
            isMoving = true;

            $('html,body').stop().animate({
                "scrollTop": 0
            }, {
                easing: 'easein',
                duration: 500,
                complete: function () {
                    isMoving = false;
                    renderSectionNav('hidden');
                    activeSection(-1);
                }
            });

            return false;
        } else {
            overflow++;
        }
    });

    if (overflow === $sections.length && inBottom) {
        isMoving = true;

        $('html,body').stop().animate({
            "scrollTop": sections[$sections.length - 1].top
        }, {
            easing: 'easein',
            duration: 500,
            complete: function () {
                inBottom = false;
                isMoving = false;
                renderSectionNav('visible', $sections.length - 1);
                activeSection($sections.length - 1);
            }
        });
    } else if (overflow === $sections.length && !inBottom) {
        isMoving = true;

        $('html,body').stop().animate({
            "scrollTop": 0
        }, {
            easing: 'easein',
            duration: 500,
            complete: function () {
                inBottom = false;
                isMoving = false;
                renderSectionNav('hidden');
                activeSection(-1);
            }
        });
    }
};

/**
 * 处理向下滚动
 * @param viewPortTop 当前视图顶部到文档顶部距离
 */
var handleWheelDown = function (viewPortTop) {
    var overflow = 0;

    if (isMoving) return;

    $.each(sections, function () {
        var that = this;

        if (this.top - viewPortTop > 0) {
            isMoving = true;

            $('html,body').stop().animate({
                "scrollTop": that.top
            }, {
                easing: 'easein',
                duration: 500,
                complete: function () {
                    isMoving = false;
                    renderSectionNav('visible', that.index);
                    activeSection(that.index);
                }
            });

            return false;
        } else {
            overflow++;
        }
    });

    if (overflow === $sections.length) {
        isMoving = true;

        $('html,body').stop().animate({
            "scrollTop": $(document).height() - $(window).height()
        }, {
            easing: 'easein',
            duration: 500,
            complete: function () {
                inBottom = true;
                isMoving = false;
                renderSectionNav('visible', $sections.length - 1);
                activeSection($sections.length - 1);
            }
        });
    }
};

/**
 * 处理鼠标滚轮滚动
 * @param event
 * @param delta
 */
var handleMouseWheel = function (event, delta) {
    var viewPortTop = $(window).scrollTop();

    delta > 0 && handleWheelUp(viewPortTop);
    delta < 0 && handleWheelDown(viewPortTop);

    event.preventDefault();
};

/**
 * 处理导航栏点击
 * @param  {[type]} currentLevel [当前点击位置等级]
 * @return {[type]}              [description]
 */
var handleSelectionClick = function(currentLevel) {
    var active_buttom = $('.section-nav .active');

    var level = active_buttom.attr('data-level');

    if (currentLevel > level) {
        switch (currentLevel) {
            case "2":
                handleWheelDown(610);
                break;
            case "3":
                handleWheelDown(1410);
                break;
            case "4":
                handleWheelDown(2210);
                break;
        }
    } else if (currentLevel < level) {
        switch (currentLevel) {
            case "1":
                handleWheelUp(1410);
                break;
            case "2":
                handleWheelUp(2210);
                break;
            case "3":
                handleWheelUp(3010);
                break;
        }
    }
}

/**
 * 绑定导航按钮事件
 * @return {[type]} [description]
 */
var initSectionClick = function () {
    $('.page_nav').on('click', function(e){
        handleSelectionClick($(this).attr('data-level'))
    });
}

var changeModel = function() {
    if (innerHeight >= 650) {
        _up650Model();
    } else {
        _650Model();
    }
}

var _up650Model = function() {
    // 还原title高度
    $('.section .title').removeClass('min_model');

    // 还原第一屏高度
    $('.section-01-map').removeClass('min_model');

    // 还原第二页内容高度
    $('.section_part2').removeClass('min_model');
    $('.section_part2_text').removeClass('min_model');

    // 还原第三页内容高度
    $('.section-03-content').removeClass('min_model');

    // 还原第三页内容
    $('.model_change').show();

    // 更改第四页内容高度
    $('.section_part4').removeClass('min_model');
    $('.section_part4_text').removeClass('min_model');
}

var _650Model = function() {
    // 更改title高度
    $('.section .title').addClass('min_model');

    // 更改第一屏高度
    $('.section-01-map').addClass('min_model');

    // 更改第二页内容高度
    $('.section_part2').addClass('min_model');
    $('.section_part2_text').addClass('min_model');

    // 更改第三页内容高度
    $('.section-03-content').addClass('min_model');

    // 隐藏第三页内容
    $('.model_change').hide();

    // 更改第四页内容高度
    $('.section_part4').addClass('min_model');
    $('.section_part4_text').addClass('min_model');
}

$(function () {
    initDefaultPosition();
    initJqueryDOM();
    initEleStyle();
    initSections();
    initMap();
    $(document).mousewheel(handleMouseWheel);
    initSectionClick();
    $(window).resize(changeModel);
    $(window).load(changeModel);
});