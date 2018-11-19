const urlHelper = new UrlHelper(location);

(function () {
  "use strict";
  /*------------------------------- VARIABLES ----------------------------------*/
  let configMap = {
    JMSVersion: null,
    settableVersion: '0.2.0',
  };
  let stateMap = {
    loading: null,
    pageMapData: null,
    categoryData: null,
    serviceApiData: null,
    mockData: null,
    mockTitle: null,
  };
  let domMap = {};
  let sidebarItems = [], validateSettingForm;
  /*************** dom method *******************/
  let setDomMap, renderDOM, renderDashBoard;
  /*************** event method *******************/
  let attachEvent, onClickSidebar, onScrollEffectSidebar
    , onClickGetMock, onClickSaveSetting
    , onClickStartServer, onClickStopServer;
  /*************** public method *******************/
  let init, getSidebarItem, activeSidebarItem, getPageMap, getCategory
    , getServiceApi, getMock
    , initPageMapTable, initCategoryTable, initServiceApiTable
    , initMockLayerModal, initAceEditor, initValidate
    , saveSetting, startServer, stopServer, checkServerStatus;
  /*------------------------------- END VARIABLES ----------------------------------*/

  /*------------------------------- DOM ----------------------------------*/
  /**
   * 缓存DOM集合
   */
  setDomMap = function () {
    domMap = {
      $body: $('body'),
      $sidebar: $('#sidebar'),
      $projectServiceApi: $('#project_service_api'),
      $settingForm: $('#setting_form'),
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
    domMap.$sidebar.on('click', '.nav-sidebar > li', onClickSidebar);
    domMap.$projectServiceApi.on('click', 'button[data-type="get_mock"]', onClickGetMock);
    domMap.$settingForm.on('click', 'button[type="submit"]', onClickSaveSetting);
    domMap.$projectDashboard.on('click', '.list-group-item > .btn-success', onClickStartServer);
    domMap.$projectDashboard.on('click', '.list-group-item > .btn-danger', onClickStopServer);
    $(window).scroll(onScrollEffectSidebar);
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
   * 点击获取 mock 数据
   */
  onClickGetMock = function (event) {
    const value = event.target.value.split('=>');

    try {
      getMock(value[0], value[1]).then(initMockLayerModal).then(initAceEditor);
    } catch (err) {
      layer.msg(err.message, {icon: 5});
    }
  };

  /**
   * 点击保存设置
   */
  onClickSaveSetting = function (event) {
    if (!validateSettingForm.form()) {
      return false;
    }

    const setting = {
      devServerPort: $('#dev_server_port').val(),
      mockServerPort: $('#mock_server_port').val(),
      proxyPath: $('#proxy_path').val(),
      mockYAPI: $('#mock_YAPI').val(),
      publicPath: $('#public_path').val(),
    };
    const $btn = $(this).button('loading');

    saveSetting(setting, {
      onComplete: function () {
        $btn.button('reset');
      }
    });
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
      configMap.JMSVersion = $('#version').text();
      setDomMap();
      attachEvent();
      getSidebarItem();
      getPageMap().then(initPageMapTable);
      getCategory().then(initCategoryTable);
      getServiceApi().then(initServiceApiTable);
      initValidate();
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
   * 获取项目地图
   */
  getPageMap = function () {
    return $.ajax({
      url: '/console_board/getPageMap',
      type: 'post',
      data: {},
      dataType: 'json',
      success: function (data) {
        if (data.message === 'ok') {
          stateMap.pageMapData = data.data;
        } else {
          layer.msg('获取项目地图失败', {icon: 5});
        }
      }
    });
  };

  /**
   * 获取分类
   */
  getCategory = function () {
    return $.ajax({
      url: '/console_board/getCategory',
      type: 'post',
      data: {},
      dataType: 'json',
      success: function (data) {
        if (data.message === 'ok') {
          stateMap.categoryData = data.data;
        } else {
          layer.msg('获取分类失败', {icon: 5});
        }
      }
    });
  };

  /**
   * 获取接口
   */
  getServiceApi = function () {
    return $.ajax({
      url: '/console_board/getServiceApi',
      type: 'post',
      data: {},
      dataType: 'json',
      success: function (data) {
        if (data.message === 'ok') {
          stateMap.serviceApiData = data.data;
        } else {
          layer.msg('获取接口失败', {icon: 5});
        }
      }
    });
  };

  /**
   * 获取模拟数据
   */
  getMock = function (category, name) {
    return $.ajax({
      url: '/console_board/getMock',
      type: 'post',
      data: {
        category: category,
        name: name
      },
      dataType: 'json',
      success: function (data) {
        if (data.message === 'ok') {
          stateMap.mockData = data.data;
          stateMap.mockTitle = name;
        } else {
          layer.msg('获取 mock 数据失败', {icon: 5});
        }
      }
    });
  };

  /**
   * 初始化项目地图表格
   */
  initPageMapTable = function () {
    /**
     * 格式化参数字段
     * @param value
     */
    function formatParamsField(value) {
      let str = '<ol class="breadcrumb">';

      for (let i = 0; i < value.length; i++ ) {
        str += '<li class="active">' + value[i][0] + '</li>';
      }

      str += '</ol>';

      if (value.length) {
        return str;
      } else {
        return '';
      }
    }
    /**
     * 格式化链接字段
     * @param value
     * @param row
     */
    function formatLinkField(value, row) {
      let link;

      if (row.param.length) {
        let search = {};

        row.param.map(function (param) {
          search[param[0]] = param[1];
        });

        link = urlHelper.link({
          path: value,
          search: urlHelper.setSearchParam(search),
        });
      } else {
        link = value;
      }

      return `<a href="${link}" target="_blank">${link}</a>`;
    }

    $('#page_map_table').bootstrapTable({
      striped: true,
      pagination: true,
      pageSize: 10,
      pageNumber: 1,
      pageList: [10, 20, 50],
      sidePagination: 'client',
      search: true,
      searchTimeOut: 100,
      columns: [
        {field: 'title', title: '名称', align: 'left', valign: 'middle', sortable: 'true', width: '15%'},
        {field: 'filePath', title: '详细', align: 'left', valign: 'middle', sortable: 'true', width: '25%'},
        {field: 'param', title: '参数', align: 'left', valign: 'middle', sortable: 'true', width: '25%', formatter: formatParamsField},
        {field: 'link', title: '示例', align: 'left', valign: 'middle', sortable: 'true', width: '35%', formatter: formatLinkField},
      ],
      showColumns: true,
      data: stateMap.pageMapData,
    });
  };

  /**
   * 初始化项目分类表格
   */
  initCategoryTable = function () {
    let mockTitle;
    /**
     * 格式化接口字段
     * @param value
     */
    function formatItemField(value) {
      let str = '<ol class="breadcrumb">';

      for (let i = 0; i < value.length; i++ ) {
        str += '<li class="active">' + value[i] + '</li>';
      }

      str += '</ol>';

      return str;
    }

    if (configMap.JMSVersion >= configMap.settableVersion) {
      mockTitle = 'Mock 数据文件夹';
    } else {
      mockTitle = 'Mock 数据模块';
    }

    $('#category_table').bootstrapTable({
      striped: true,
      pagination: true,
      pageSize: 10,
      pageNumber: 1,
      pageList: [10, 20, 50],
      sidePagination: 'client',
      search: true,
      searchTimeOut: 100,
      columns: [
        {field: 'title', title: '名称', align: 'left', valign: 'middle', sortable: 'true', width: '15%'},
        {field: 'filePath', title: 'Service 模块', align: 'left', valign: 'middle', sortable: 'true', width: '25%'},
        {field: 'mockModule', title: mockTitle, align: 'left', valign: 'middle', sortable: 'true', width: '25%'},
        {field: 'item', title: '包含接口', align: 'left', valign: 'middle', sortable: 'true', width: '35%', formatter: formatItemField},
      ],
      showColumns: true,
      data: stateMap.categoryData,
    });
  };

  /**
   * 初始化接口表格
   */
  initServiceApiTable = function () {
    /**
     * 格式化 mock 字段
     * @param value
     */
    function formatMockField(value) {
      return '<button type="button" class="btn btn-link" data-type="get_mock" value="' + value + '">查看</button>';
    }

    $('#service_api_table').bootstrapTable({
      striped: true,
      pagination: true,
      pageSize: 10,
      pageNumber: 1,
      pageList: [10, 20, 50],
      sidePagination: 'client',
      search: true,
      searchTimeOut: 100,
      columns: [
        {field: 'name', title: '名称', align: 'left', valign: 'middle', sortable: 'true', width: 200},
        {field: 'url', title: '路径', align: 'left', valign: 'middle', sortable: 'true'},
        {field: 'method', title: '类型', align: 'left', valign: 'middle', sortable: 'true'},
        {field: 'description', title: '描述', align: 'left', valign: 'middle', sortable: 'true'},
        {field: 'category', title: '所属分类', align: 'left', valign: 'middle', sortable: 'true'},
        {field: 'mock', title: 'Mock 数据', align: 'center', valign: 'middle', sortable: 'true', formatter: formatMockField},
      ],
      showColumns: true,
      data: stateMap.serviceApiData,
    });

    return Promise.resolve();
  };

  /**
   * 初始化 layer 弹窗
   */
  initMockLayerModal = function () {
    let content = '<pre class="mock"><textarea>';
    content += stateMap.mockData;
    content += '</textarea></pre>';

    return new Promise(function (resolve) {
      layer.open({
        title: stateMap.mockTitle,
        content: content,
        area: '640px',
        scrollbar: false,
        btn: [],
        success: function(){
          resolve();
        }
      });
    })
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
      editor.session.setValue(JSON.stringify(new Function('return '+ value +';')(), null, 4));
    });
  };

  /**
   * 初始化表单验证
   */
  initValidate = function () {
    validateSettingForm = domMap.$settingForm.validate({
      rules: {
        dev_server_port: {
          required: true,
          digits: true,
          notEqualTo: "#mock_server_port",
          minlength: 4,
          maxlength: 5,
        },
        mock_server_port: {
          required: true,
          digits: true,
          notEqualTo: "#dev_server_port",
          minlength: 4,
          maxlength: 5,
        },
        proxy_path: {
          required: true,
          checkPath: true,
        },
        mock_YAPI: {
          checkURL: true,
        },
        public_path: {
          required: true,
          checkPath: true,
        },
      },
      messages: {
        dev_server_port: {
          required: "请输入用户名",
          notEqualTo: "前端端口不能 与 Mock 端口相同",
          minlength: "端口不能小于4位",
          maxlength: "端口不能大于5位",
        },
        mock_server_port: {
          required: "请输入密码",
          notEqualTo: "Mock 端口不能 与 前端端口相同",
          minlength: "端口不能小于4位",
          maxlength: "端口不能大于5位",
        },
        proxy_path: {
          required: "请输入反向代理路径",
          checkPath: "请输入有效的反向代理路径",
        },
        mock_YAPI: {
          checkURL: "请输入有效的 YAPI 地址",
        },
        public_path: {
          required: "请输入发布路径",
          checkPath: "请输入有效的发布路径",
        },
      }
    });

    $.validator.addMethod("checkURL", function (value, element, params) {
      let regURL = /[a-zA-z]+:\/\/[^\s]*/;
      return this.optional(element) || (regURL.test(value));
    }, "请输入有效的 URL！");

    $.validator.addMethod("checkPath", function (value, element, params) {
      let checkPath = /^\/$|^\/[a-zA-z]+[^\s]*$/;
      return this.optional(element) || (checkPath.test(value));
    }, "请输入有效的路径！");
  };

  /**
   * 保存设置
   */
  saveSetting = function (setting, options) {
    $.ajax({
      url: '/console_board/setSetting',
      type: 'post',
      data: {
        setting: JSON.stringify(setting)
      },
      dataType: 'json',
      success: function (data) {
        if (data.message === 'ok') {
          layer.msg('设置成功', {icon: 6});
        } else {
          layer.msg('保存失败', {icon: 5});
        }
      },
      complete: function () {
        options.onComplete && options.onComplete();
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
