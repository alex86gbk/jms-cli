//----------------------------------------------------
//作者:卞凯
//功能描述：教培阅卷系统-编辑试卷（自动划题）
//使用模块：试卷中心|教培阅卷系统|编辑试卷
//创建时间: 2017/09/04
//------------------修改记录-------------------
//修改人      修改日期        修改目的
//----------------------------------------------------
(function($) {

    var jQueryDOM;
    var seId;
    var seIdAttr;
    var seIdReg = /\?seId=[\s\S]*/g;
    var paperEdit;

    /**
     * 初始化jQueryDOM
     */
    function initJqueryDOM() {
        jQueryDOM = {
            $linkNextStep: $('#step_next'),
            $blockJuanZiView: $('#blocked_out_juanZi'),
            $recover: $('#recover'),
            $paperZonedInfo: $('#paper_zoned_info'),
            $loadingPaperZonedInfo: $('#loading_paper_zoned_info'),
            $loadingPaperData: $('#loading_paper_data'),
            $tipsPaperZonedInfo: $('#tips_paper_zoned_info'),
            $paperZonedView: $('<div class="paper-zoned"></div>')
        };
    }

    /**
     * 初始化试卷元素属性
     */
    function initPaperElementsAttr() {
        var nextStep = jQueryDOM.$linkNextStep.attr('href');
        var juanZiView = jQueryDOM.$blockJuanZiView.attr('href');

        try {
            seIdAttr = location.search.toString().match(seIdReg)[0];
            seId = seIdAttr.replace('?seId=', '');
        } catch (err) {
            alert('请检查seId');
            return false;
        }

        jQueryDOM.$linkNextStep.attr('href', nextStep + seIdAttr);
        jQueryDOM.$blockJuanZiView.attr('href', juanZiView + seIdAttr);
    }

    /**
     * 初始化试卷编辑
     */
    function initPaperEditor() {
        paperEdit = new OrganizationHandReadingPaper(seId, $('#paper_list'));
        paperEdit.init({Dialog: dialog}, {
            onCallback: saveZoned,
            onCancel: cancelSelection
        });
    }

    /**
     * 新增划题
     * @param event
     */
    function addZone(event) {
        var oSelection = window.getSelection();
        var oRange;

        // 屏蔽非法选取
        try {
            oRange = oSelection.getRangeAt(0);
        } catch (err) {
            return;
        }

        // 屏蔽右键
        if (event.button === 2) return;

        isValidZoned(oRange, oSelection) && setTimeout(function () {
            paperEdit.add({
                oRange: oRange
            });
        }, 10);
    }

    /**
     * 打开警告模态框
     * @param event 点击事件
     */
    function openWarnDialog (event) {
        var message = '<div class="message">'+
            '    <i class="icon_pop icon_pop_big_prompt">&nbsp;</i>'+
            '    <span class="prompt_text">重新自动划题后，会丢失手动划题生成的题号信息，是否继续？</span>'+
            '</div>';

        if ($(this).hasClass('disabled')) return;

        $.modal.close();

        dialog.show({
            title: '提示',
            dialogClass: 'pop_info',
            content: message,
            footerBtn: '<a class="btns btn_blue simplemodal-close" href="javascript:void(0);">确定</a>' +
            '<a class="btns btn_gray simplemodal-close" href="javascript:void(0);">取消</a>',
            onShow: initRecoverPaperZonedInfo,
            onClose: resetRecoverPaperZonedInfo
        });

        event.preventDefault();
    }

    /**
     * 打开等待模态框
     */
    function openWaitDialog() {
        var message = '<div class="message text-center">'+
            '    <img src="/Content/images/imgs/gif/icon_loading.gif"/>'+
            '    <div class="f_tac f_mt20">自动划题中，请稍后......</div>'+
            '</div>';

        $.modal.close();

        dialog.show({
            title: '提示',
            dialogClass: 'pop_info',
            content: message,
            footerBtn: ''
        });
    }

    /**
     * 重新自动划题（重新自动划题后，会丢失手动划题生成的题号信息）
     */
    function initRecoverPaperZonedInfo() {
        $('.btns.btn_blue.simplemodal-close').bind('click', function () {
            jQueryDOM.$recover.addClass('disabled');
            openWaitDialog();
            requestRecoverPaperZonedInfo();
        });
    }

    /**
     * 重置强制自动划题（取消业务绑定）
     */
    function resetRecoverPaperZonedInfo() {
        $.modal.close();
        $('.btns.btn_blue.simplemodal-close').unbind('click');
    }

    /**
     * 保存划题信息
     * @param {Object} data 题目数据
     * @param {Object} para 传递参数
     */
    function saveZoned(data, para) {
        var zonedData = data;
        var filterReg = /<span class="index-number">[\s\S]*?<\/span>/ig;
        var HTML;

        HTML = createSelectNode(para.oRange, data);
        zonedData.nodeHTML = HTML.nodeHTML.replace(filterReg, '');
        zonedData.paperHTML = HTML.paperHTML.replace(filterReg, '');
        requestAddQuestionZoned(zonedData, paperEdit.render);
    }

    /**
     * 请求恢复试卷划题信息
     */
    function requestRecoverPaperZonedInfo() {
        var para = {
            SeId: seId,
            IsAutoZonedQuestion: true
        };

        $.ajax({
            url: '/TiFenCeMarking/AutoZonedQuestion',
            type: 'post',
            data: {
                para: JSON.stringify(para)
            },
            success: function () {
                location.reload();
            }
        });
    }

    /**
     * 请求试卷划题信息
     */
    function requestPaperZonedInfo() {
        var para = {
            SeId: seId,
            IsAutoZonedQuestion: false
        };

        $.ajax({
            url: '/TiFenCeMarking/AutoZonedQuestion',
            type: 'post',
            data: {
                para: JSON.stringify(para)
            },
            success: function (res) {
                if (res.ReturnEntity.ZonedStatus === 3) {
                    setTimeout(requestPaperZonedInfo, 1000);
                } else if (res.ReturnEntity.ZonedStatus === 1) {
                    renderPaperInfo(res.ReturnEntity.QuestionHtml);
                    jQueryDOM.$loadingPaperZonedInfo.addClass('hidden');
                    jQueryDOM.$tipsPaperZonedInfo.addClass('hidden');
                    jQueryDOM.$recover.removeClass('disabled');
                } else {
                    jQueryDOM.$loadingPaperZonedInfo.addClass('hidden');
                    jQueryDOM.$tipsPaperZonedInfo.removeClass('hidden');
                    jQueryDOM.$recover.removeClass('disabled');
                }
            }
        });
    }

    /**
     * 请求添加划题信息
     * @param {Object} data 题目数据
     * @param {Function} callback 回调函数
     */
    function requestAddQuestionZoned(data, callback) {
        var para;
        /**
         * 本地数据结构转服务端接口结构
         * @param {Object} localData 本地数据
         * @return {Object}
         */
        var localToServer = function(localData) {
            /** 本地类型转服务端类型-题目类型 **/
            var typeMap = {
                'danxuan': '2',
                'duoxuan': '3',
                'panduan': '5',
                'tiankong': '4',
                'zhuguan': '6',
                'yuwenzuowen': '7',
                'yingyuzuowen': '8'
            };

            return {
                QuestionTypeId: typeMap[localData.type],
                OptionCount: localData.choose,
                StartQuestionNo: localData.section_start,
                EndQuestionNo: localData.section_end,
                ChooseQuestion: localData.isChoose,
                QuestionScore: localData.score,
                QuestionOperationTypeId: localData.state,
                SingleQuestionHtml: localData.nodeHTML,
                AllQuestionHtml: localData.paperHTML
            };
        };

        para = localToServer(data);
        para.SeId = seId;

        $.ajax({
            url: '/TiFenCeMarking/AddQuestionByZoned',
            type: 'post',
            data: {
                para: JSON.stringify(para)
            },
            success: function (res) {
                if (res.ResultTypeId === 1) {
                    callback(res);
                } else {
                    alert('保存划题信息失败');
                }
            }
        });
    }

    /**
     * 请求删除划题信息
     * @param {Object} data 删除数据
     * @param {Function} callback 回调函数
     */
    function requestDeleteQuestionZoned(data, callback) {
        var para;
        var startIndex;
        var endIndex;
        var filterReg = /<span class="index-number">[\s\S]*?<\/span>/ig;

        if (data.questionIndex.indexOf('~') > -1) {
            startIndex = data.questionIndex.split('~')[0];
            endIndex = data.questionIndex.split('~')[1];
        } else {
            startIndex = endIndex = data.questionIndex;
        }

        para = {
            SeId: seId,
            StartQuestionNo: startIndex,
            EndQuestionNo: endIndex,
            AllQuestionHtml: data.paperHTML.replace(filterReg, '')
        };

        $.ajax({
            url: '/TiFenCeMarking/DeleteQuestionByZoned',
            type: 'post',
            data: {
                para: JSON.stringify(para)
            },
            success: function (res) {
                if (res.ResultTypeId === 1) {
                    callback(res);
                } else {
                    alert('删除划题信息失败');
                }
            }
        });
    }

    /**
     * 渲染试卷详细
     * @param {String} paperZonedInfo 题目HTML
     */
    function renderPaperInfo(paperZonedInfo) {
        initPaperEditor();
        jQueryDOM.$paperZonedView.html(paperZonedInfo);
        jQueryDOM.$paperZonedInfo.append(jQueryDOM.$paperZonedView);
        renderQuestionIndexNumber();
    }

    /**
     * 渲染题号
     */
    function renderQuestionIndexNumber() {
        var $question = $('.zoned-selected');

        $question.each(function () {
            var $indexNumber = $('<span class="index-number">' + $(this).attr('data-questionindex') + '</span>');
            if (!$(this).find('.index-number').length) {
                $(this).append($indexNumber);
            }
        });
    }

    /**
     * 判断是否包含节点
     * @param oSelection Selection 对象
     * @return {Boolean}
     */
    function isContainsNode(oSelection) {
        var node = document.getElementsByClassName('zoned-selected');
        var contain = false;

        for (var i = 0;i<node.length;i++){
            try {
                if(oSelection.containsNode(node[i], true)){
                    contain = true;
                }
            }
            catch (err) {
                if(oSelection.anchorNode.compareDocumentPosition(node[i]) !== oSelection.focusNode.compareDocumentPosition(node[i])
                    || oSelection.anchorNode.compareDocumentPosition(node[i]) + oSelection.focusNode.compareDocumentPosition(node[i]) === 20)
                {
                    contain = true;
                }
            }
        }

        return contain;
    }

    /**
     * 判断是否是有效选取
     * @param {Range} oRange 对象
     * @param {Selection} oSelection 对象
     * @return {Number}
     */
    function isValidZoned(oRange, oSelection) {
        var select = oRange.startContainer;
        var start = oRange.startOffset;
        var isNode = isContainsNode(oSelection);
        var content;

        // 屏蔽已选节点
        if (isNode) {
            // 屏蔽非法节点
            try {
                oSelection.removeAllRanges();
            } catch (err) {
                window.getSelection().removeAllRanges();
            }
            return 0;
        }

        // 屏蔽单击
        if (oRange.collapsed) {
            return 0;
        }

        try {
            oRange.setStart(select, start);
        } catch (err) {
            return 0;
        }

        content = oRange.cloneContents();

        if (!$.trim(content.textContent).length) {
            if (content.childNodes[0] && content.childNodes[0].nodeName === 'IMG') {
                return 3;
            }
            return 0;
        } else {
            return content.textContent.length;
        }
    }

    /**
     * 插入选中节点
     * @param {Range} oRange 对象
     * @param {Object} data 节点数据
     * @return {Object|Boolean} 新增节点后的题目HTML信息
     */
    function createSelectNode(oRange, data) {
        var oSpan = document.createElement("div");
        var select = oRange.startContainer;
        var start = oRange.startOffset;
        var questionIndex;
        var content;

        try {
            oRange.setStart(select, start);
        } catch (err) {
            return false;
        }

        // 移动选取内容到文档片段
        content = oRange.extractContents();
        // 拼接题目索引
        if (data.section_start === data.section_end) {
            questionIndex = data.section_start;
        } else {
            questionIndex = data.section_start + '~' + data.section_end;
        }

        oSpan.className = 'zoned-selected';
        oSpan.setAttribute('data-questionindex', questionIndex);
        oSpan.appendChild(content);

        oRange.deleteContents();
        oRange.insertNode(oSpan);

        renderQuestionIndexNumber();

        return {
            nodeHTML: oSpan.outerHTML,
            paperHTML: jQueryDOM.$paperZonedInfo.find('.paper-zoned').html()
        };
    }
    /**
     * 删除划题
     */
    function removeZoned() {
        var html;
        var $selected = $(this).closest('.zoned-selected');
        var questionIndex = $selected.attr('data-questionindex');

        $(this).remove();
        html = $selected.html();
        $selected.replaceWith(html);
        requestDeleteQuestionZoned({
            questionIndex: questionIndex,
            paperHTML: jQueryDOM.$paperZonedInfo.find('.paper-zoned').html()
        }, paperEdit.render);
    }

    /**
     * 取消选中
     */
    function cancelSelection() {
        window.getSelection().removeAllRanges();
    }

    /**
     * 插入删除按钮
     */
    function appendRemoveZonedBtn() {
        var $remove = $('<span class="zoned-remove"></span>');

        $(this).append($remove);
    }

    /**
     * 移除删除按钮
     */
    function removeRemoveZonedBtn() {
        $(this).find('.zoned-remove').remove();
    }

    /**
     * 绑定事件
     */
    function attachEvent() {
        // 点击重新自动划题
        jQueryDOM.$recover.click(openWarnDialog);
        // 新增划题
        jQueryDOM.$paperZonedInfo.mouseup(addZone);
        // 删除划题
        jQueryDOM.$paperZonedInfo.on('click', '.zoned-remove', removeZoned);
        // 删除题目交互
        jQueryDOM.$paperZonedInfo.on('mouseenter', '.zoned-selected', appendRemoveZonedBtn);
        jQueryDOM.$paperZonedInfo.on('mouseleave', '.zoned-selected', removeRemoveZonedBtn);
    }

    // 注册 document ready
    $(function() {
        initJqueryDOM();
        initPaperElementsAttr();
        requestPaperZonedInfo();
        attachEvent();
    });
})(jQuery);