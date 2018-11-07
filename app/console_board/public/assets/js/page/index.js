const urlHelper = new UrlHelper(location);

(function () {
  "use strict";
  /*------------------------------- VARIABLES ----------------------------------*/
  let configMap = {};
  let stateMap = {
    loading: null,
  };
  let domMap = {};
  let sidebarItems = [];
  /*************** dom method *******************/
  let setDomMap, renderDOM, renderDashBoard;
  /*************** event method *******************/
  let attachEvent, onChangeProject, onClickSidebar, onScrollEffectSidebar, onClickSaveSetting
    , onClickStartServer, onClickStopServer;
  /*************** public method *******************/
  let init, getSidebarItem, activeSidebarItem, initAceEditor, saveSetting, startServer, stopServer
    , checkServerStatus;
  /*------------------------------- END VARIABLES ----------------------------------*/

  /*------------------------------- DOM ----------------------------------*/
  /**
   * 缓存DOM集合
   */
  setDomMap = function () {
    domMap = {
      $body: $('body'),
      $navBar: $('#navBar'),
      $sidebar: $('#sidebar'),
      $saveSetting: $('#save_setting'),
      $projectDashboard: $('#project_dashboard').next(),
    };
  };

  /**
   * 渲染DOM数据
   * @param {Object} data
   */
  renderDOM = function (data) {

  };

  /**
   * 渲染仪表盘
   * @param {String} server
   * @param {Object} serverStatus
   */
  renderDashBoard = function (server, serverStatus) {
    if (server === 'dev-server') {
      if (serverStatus.devServer === 0 || serverStatus.devServer) {
        if (serverStatus.devServer !== 0) {
          domMap.$projectDashboard.find('.list-group-item').eq(0).html(
            '<span>前端服务状态</span>'+
            '<button type="button" data-type="dev-server" disabled="" class="btn btn-success btn-xs">开启</button>'+
            '<button type="button" data-type="dev-server" class="btn btn-danger btn-xs">停止</button>'+
            '<span class="badge list-group-item-success">运行中</span>'
          );
        } else {
          domMap.$projectDashboard.find('.list-group-item').eq(0).html(
            '<span>前端服务状态</span>'+
            '<button type="button" data-type="dev-server" class="btn btn-success btn-xs" data-loading-text="开启中...">开启</button>'+
            '<button type="button" data-type="dev-server" disabled="" class="btn btn-danger btn-xs">停止</button>'+
            '<span class="badge list-group-item-danger">未开启</span>'
          );
        }
      }
    }
    if (server === 'mock-server') {
      if (serverStatus.mockServer === 0 || serverStatus.devServer) {
        if (serverStatus.mockServer !== 0) {
          domMap.$projectDashboard.find('.list-group-item').eq(1).html(
            '<span>Mock 数据服务状态</span>'+
            '<button type="button" data-type="mock-server" disabled="" class="btn btn-success btn-xs">开启</button>'+
            '<button type="button" data-type="mock-server" class="btn btn-danger btn-xs">停止</button>'+
            '<span class="badge list-group-item-success">运行中</span>'
          );
        } else {
          domMap.$projectDashboard.find('.list-group-item').eq(1).html(
            '<span>Mock 数据服务状态</span>'+
            '<button type="button" data-type="mock-server" class="btn btn-success btn-xs" data-loading-text="开启中...">开启</button>'+
            '<button type="button" data-type="mock-server" disabled="" class="btn btn-danger btn-xs">停止</button>'+
            '<span class="badge list-group-item-danger">未开启</span>'
          );
        }
      }
    }
  };
  /*------------------------------- END DOM ----------------------------------*/

  /*------------------------------- EVENT ----------------------------------*/
  /**
   * 初始化所有事件绑定
   */
  attachEvent = function () {
    domMap.$navBar.on('change', 'select', onChangeProject);
    domMap.$sidebar.on('click', '.nav-sidebar > li', onClickSidebar);
    domMap.$saveSetting.on('click', onClickSaveSetting);
    domMap.$projectDashboard.on('click', '.list-group-item > .btn-success', onClickStartServer);
    domMap.$projectDashboard.on('click', '.list-group-item > .btn-danger', onClickStopServer);
    $(window).scroll(onScrollEffectSidebar);
  };

  /**
   * 切换项目
   */
  onChangeProject = function () {
    urlHelper.jump({
      path: '/console_board',
      search: urlHelper.setSearchParam({
        project: this.value
      })
    });
  };

  /**
   * 点击侧边导航
   */
  onClickSidebar = function () {
    const $that = $(this);

    $that.siblings().removeClass('active');
    $that.addClass('active');
  };

  /**
   * 点击保存设置
   */
  onClickSaveSetting = function (event) {
    const setting = {
      devServerPort: $('#dev_server_port').val(),
      mockServerPort: $('#mock_server_port').val(),
      proxyPath: $('#proxy_path').val(),
      mockYAPI: $('#mock_YAPI').val(),
      publicPath: $('#public_path').val(),
    };

    saveSetting(setting);
    event.preventDefault();
  };

  /**
   * 点击开启服务
   */
  onClickStartServer = function () {
    const server = $(this).attr('data-type');

    $(this).button('loading');
    startServer(server);
  };

  /**
   * 点击停止服务
   */
  onClickStopServer = function () {
    const server = $(this).attr('data-type');

    stopServer(server);
  };

  /**
   * 滚动条位置对应侧边导航
   */
  onScrollEffectSidebar = function () {
    let winPosTop = $(this).scrollTop();
    let winHeight = $(this).height();
    let bodyHeight = $('body').height();
    let edge = bodyHeight - winHeight - winPosTop;
    const bottomElementHeight = $('#' + sidebarItems[sidebarItems.length - 1]).next().height();

    $.each(sidebarItems, function () {
      const $this = $('#' + this);

      if (winPosTop > $this.offset().top && winPosTop < $this.next().offset().top) {
        activeSidebarItem(this);
      }
    });

    if (edge > bottomElementHeight && edge < bottomElementHeight + 80) {
      activeSidebarItem(sidebarItems[sidebarItems.length - 2]);
    }
    else if (edge < bottomElementHeight) {
      activeSidebarItem(sidebarItems[sidebarItems.length - 1]);
    }
  };
  /*------------------------------- END EVENT ----------------------------------*/

  /*------------------------------- PUBLIC ----------------------------------*/
  /**
   * init
   * 业务初始化方法
   */
  init = function() {
    $(function () {
      setDomMap();
      attachEvent();
      getSidebarItem();
      initAceEditor();
    });
  };

  /**
   * 获取侧边栏项目
   */
  getSidebarItem = function() {
    domMap.$sidebar.find('ul > li > a').each(function () {
      if (this.href.indexOf('#') > -1) {
        sidebarItems.push(this.href.split('#')[1]);
      } else {
        sidebarItems.push(this.href);
      }
    });
  };

  /**
   * 激活侧边栏项目
   */
  activeSidebarItem = function (name) {
    domMap.$sidebar.find('ul > li').each(function () {
      let href = $(this).find('a').attr('href');

      if (href.indexOf('#') > -1) {
        if (href.split('#')[1] === name) {
          $(this).siblings().removeClass('active');
          $(this).addClass('active');
        }
      } else {
        if (href === name) {
          $(this).siblings().removeClass('active');
          $(this).addClass('active');
        }
      }
    });
  };

  /**
   * 初始化 Ace 编辑器
   */
  initAceEditor = function () {
    let $mock = $('.mock');

    ace.require("ace/ext/language_tools");
    $mock.each(function () {
      const editor = ace.edit(this);
      let value = editor.session.getValue();

      editor.setOption("wrap", "free");
      editor.setTheme("ace/theme/eclipse");
      editor.getSession().setMode("ace/mode/json");
      editor.session.setValue(JSON.stringify(JSON.parse(value), null, 4));
    });
  };

  /**
   * 保存设置
   */
  saveSetting = function (setting) {
    $.ajax({
      url: '/console_board/setSetting',
      type: 'post',
      data: {
        setting: JSON.stringify(setting)
      },
      dataType: 'json',
      success: function (data) {
        if (data.message === 'ok') {

        } else {
          layer.msg('保存失败', {icon: 5});
        }
      }
    });
  };

  /**
   * 开启服务
   * @param {String} server
   */
  startServer = function (server) {
    $.ajax({
      url: '/console_board/startServer',
      type: 'post',
      data: {
        server: server
      },
      dataType: 'json',
      success: function (data) {
        if (data.message === 'ok') {
          checkServerStatus(server, {
            onComplete: function (data) {
              renderDashBoard(server, data);
            }
          });
        } else {
          layer.msg('启动失败', {icon: 5});
        }
      }
    });
  };

  /**
   * 停止服务
   * @param {String} server
   */
  stopServer = function (server) {
    $.ajax({
      url: '/console_board/stopServer',
      type: 'post',
      data: {
        server: server
      },
      dataType: 'json',
      success: function (data) {
        let serverStatus = {};

        serverStatus[server.replace('-server', '') + 'Server'] = 0;

        if (data.message === 'ok') {
          renderDashBoard(server, serverStatus);
        } else {
          layer.msg('停止失败', {icon: 5});
        }
      },
    });
  };

  /**
   * 检查服务状态
   */
  checkServerStatus = function (server, options) {
    let loading = false;

    setTimeout(function () {
      loading = true;
      $.ajax({
        url: '/console_board/getServerStatus',
        type: 'post',
        dataType: 'json',
        success: function (data) {
          loading = false;
          if (data[server.replace('-server', '') + 'Server'] === 0) {
            if (loading) {
              return false;
            }
            checkServerStatus(server, options);
          } else {
            options.onComplete && options.onComplete(data);
          }
        },
        complete: function () {
          loading = false;
        }
      });
    }, 500);
  };
  /*------------------------------- END PUBLIC ----------------------------------*/

  init();
})();
