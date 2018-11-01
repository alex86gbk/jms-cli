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
  let setDomMap, renderDOM;
  /*************** event method *******************/
  let attachEvent, onChangeProject, onClickSidebar, onScrollEffectSidebar;
  /*************** public method *******************/
  let init, getSidebarItem, activeSidebarItem, initAceEditor;
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
    };
  };

  /**
   * 渲染DOM数据
   * @param {Object} data
   */
  renderDOM = function (data) {

  };
  /*------------------------------- END DOM ----------------------------------*/

  /*------------------------------- EVENT ----------------------------------*/
  /**
   * 初始化所有事件绑定
   */
  attachEvent = function () {
    domMap.$navBar.on('change', 'select', onChangeProject);
    domMap.$sidebar.on('click', '.nav-sidebar > li', onClickSidebar);
    $(window).scroll(onScrollEffectSidebar);
  };

  /**
   * 切换项目
   */
  onChangeProject = function () {
    urlHelper.jump({
      path: '/console_board/index',
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
  /*------------------------------- END PUBLIC ----------------------------------*/

  init();
})();
