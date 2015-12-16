(function (app) {
  "use strict";

  app.templates = {
    group: '' +
      '<div class="count" data-count="<%= app.utils.formatNumber(count) %>">' +
        '<span title="<%= count %>"><%= app.utils.formatNumber(count) %></span>' +
      '</div>' +
      '<div style="position: relative;z-index:10;">' +
      '<div class="details">' +
        '<h3><a href="<%= permalink %>"><%= title %></a></h3>' +
        '<p class="message">' +
          '<%= message %>' +
        '</p>' +
        '<div class="meta">' +
          '<% $.each(annotations, function(_, tag) { %>' +
            '<span class="tag annotation" data-tag="<%= tag.label %>" data-count="<%= app.utils.formatNumber(tag.count) %>">' +
              '<i><%= tag.label %></i>' +
              '<span title="<%= count %>"><%= app.utils.formatNumber(tag.count) %></span>' +
            '</span>' +
          '<% }) %>' +
          '<span class="last-seen pretty-date"></span>' +
          '<% if (timeSpent) { %>' +
            '<span class="tag time-spent"><%= Math.round(timeSpent) %>ms</span>' +
          '<% } %>' +
          /*'<span class="tag tag-project">' +
            '<a href="<%= projectUrl %>"><%= project.name %></a>' +
          '</span>' +
          '<span class="tag tag-logger">' +
            '<a href="<%= loggerUrl %>"><%= logger %></a>' +
          '</span>' +*/
          '<% if (owner) { %>' +
            '<span class="tag tag-owner label label-info">' +
              '<a href="<%= ownerLink %>"><%= owner %></a>' +
            '</span>' +
          '<% } %>' +
          '<% _.each(tags, function(tag){ %> ' +
            '<span class="tag"><%= tag %></span>' +
          '<% }) %>' +
        '</div>' +
        '<span class="sparkline"></span>' +
        '<ul class="actions">' +
          '<% if (canResolve) { %>' +
            '<li>' +
              '<a href="#" data-action="resolve">' +
                '<i aria-hidden="true" class="icon-checkmark"></i>' +
              '</a>' +
            '</li>' +
            '<li>' +
              '<a href="#" data-action="bookmark" class="bookmark" title="Bookmark">' +
                '<i aria-hidden="true" class="icon-star"></i>' +
              '</a>' +
            '</li>' +
          '<% } %>' +
        '</ul>' +
      '</div>' +
      '</div>' +
      '<div class="bg-graph">' +
        '<canvas class="js-bg-graph line" data-api-url="#" width="700" height="70"></canvas>' +
      '</div>',
    pagination: '' +
      '<% if (previous_page || next_page) { %>' +
      '<div class="btn-toolbar">' +
        '<div class="btn-group pull-right">' +
          '<% if (previous_page) { %>' +
            '<a class="btn prev" href="#<%= viewId %>" data-toggle="ajtab" data-uri="<%=base_url %>?<%= pageless_query_string %>&amp;p=<%= previous_page %>"><span>Previous</span></a>' +
          '<% } else { %>' +
            '<a class="btn prev disabled"><span>Previous</span></a>' +
          '<% } %>' +
          '<% if (next_page) { %>' +
            '<a class="btn next" href="#<%= viewId %>" data-toggle="ajtab" data-uri="<%= base_url %>?<%= pageless_query_string %>&amp;p=<%= next_page %>"><span>Next</span></a>' +
          '<% } else { %>' +
            '<a class="btn next disabled"><span>Next</span></a>' +
          '<% } %>' +
        '</div>' +
      '</div>' +
      '<% } %>',
    alert_message: '' +
      '<div class="alert alert-dismissable fade in alert-<%= type %>">' +
        '<a class="close" data-dismiss="alert" href="#">&times;</a>' +
        '<p>' +
          '<strong><%= type_display %></strong>' +
          '<%= message %>' +
        '</p>' +
      '</div>',
    modal_template: '' +
      '<div class="modal" data-backdrop="<%= modal_backdrop %>">' +
        '<div class="modal-dialog">' +
          '<div class="modal-content">' +
            '<div class="modal-header">' +
              '<a class="close" data-dismiss="modal">&times;</a>' +
              '<h3 class="modal-title"><%= title %></h3>' +
            '</div>' +
            '<div class="modal-body">' +
              '<%= body %>' +
            '</div>' +
            '<div class="modal-footer">' +
              '<a href="#" class="btn btn-primary"><%= confirm %></a>' +
              '<a href="#" class="btn btn-default cancel" data-dismiss="modal"><%= cancel %></a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>',
    spinner_modal: '' +
      '<div class="modal loading">' +
        '<div class="modal-dialog">' +
          '<div class="modal-content">' +
            '<div class="modal-body">' +
              '<p><%= text %>&hellip;</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>',
    time_line: '' +
      '<div class="reports-selectyear text-center">' +
        '<div class="dropdown dropdown-menu-toggle">' +
          '<a class="dropdown-toggle" data-toggle="dropdown">' +
            '<span id="curYear">2015</span><b class="caret"></b>' +
          '</a>' +
          '<ul class="dropdown-menu border-dropdown">' +
            '<li><a>2013</a></li>' +
            '<li><a>2014</a></li>' +
            '<li><a>2015</a></li>' +
          '</ul>' +
        '</div>' +
      '</div>' +
      '<div class="js_reportleft_scroll scrollwrapper" marginbottom="24" id="timeline">' +
        '<div class="reports-timetree"></div>' +
      '</div>' +
      '<div id="month" class="hide">' +
        '<div class="timetree-month">' +
          '<div class="timetree-head month">' +
            '<span class="j_timetree_spread time-text"><strong>1</strong>月</span>' +
            '<span class="j_timetree_spread"><em class="time-circle"></em></span>' +
          '</div>' +
          '<ul class="timetree-weeklist"></ul>' +
        '</div>' +
      '</div>' +
      '<div id="week" class="hide">' +
        '<li class="j_week">' +
          '<a class="router" href="">第<span></span>周<em class="arrow-s"></em><em class="arrow-b"></em></a>' +
          '<em class="time-circle"></em>' +
        '</li>' +
      '</div>' +
      '<div id="season" class="hide">' +
        '<div class="timetree-head season">' +
          '<span class="time-text"></span>' +
          '<em class="time-circle"></em>' +
        '</div>' +
      '</div>' +
      '<div id="halfyear" class="hide">' +
        '<div class="timetree-head halfyear">' +
          '<span class="time-text">年中</span>' +
          '<em class="time-circle"></em>' +
        '</div>' +
      '</div>' +
      '<div id="endyear" class="hide">' +
        '<div class="timetree-head endyear">' +
          '<span class="time-text"></span>' +
          '<em class="time-circle"></em>' +
        '</div>' +
      '</div>',
    workreport_reportcontent: '' +
      '<div class="reports-head">' +
        '<span class="reports-caption" id="title"> </span>' +
        '<span id="weekDay" class="ml-5"></span>' +
        '<span id="createTime" class="time"></span>' +
        '<span>' +
          '<a title="打印" id="wr-print" data-toggle="tooltip" data-placement="top" class="mh-5 fs-14 hide">' +
            '<i class="icon-print"></i>' +
          '</a>' +
        '</span>' +
        '<span>' +
          '<a title="导出" data-toggle="tooltip" data-placement="top" id="wr-export" class="fs-14 hide">' +
            '<i class="icon-file-word"></i>' +
          '</a>' +
        '</span>' +

        '<div class="btn-group pull-right hide" id="switch">' +
          '<a class="btn router " id="prev"></a>' +
          '<a class="btn router" id="current"></a>' +
          '<a class="btn router" id="next"></a>' +
        '</div>' +
      '</div>' +
      '<div id="workreportcontent" class="scrollwrapper" marginbottom="20">' +
        '<div class="loading_large hide"></div>' +
        '<div>' +
          '<div class="reports-body">' +
            '<div class="reports-input">' +
              '<div class="reports-input-tit">' +
                '<i class="graph graph-task"></i>' +
                '<span id="contentTitle">完成工作</span>' +
                '<span class="pull-right">' +
                  '<a class="entitybox-toggle"  data-module="weeklyblog" id="weeklyblog">' +
                    '<strong id="dayReport"></strong>' +
                  '</a>' +
                '</span>' +
              '</div>' +
              '<textarea class="form-control" placeholder="此处填写工作成效..." id="effect-content"></textarea>' +
            '</div>' +
            '<div class="reports-input">' +
              '<div class="reports-input-tit">' +
                '<i class="graph graph-idea"></i>总结心得' +
              '</div>' +
              '<textarea class="form-control" placeholder="此处填写总结心得..." id="experience-summary"></textarea>' +
            '</div>' +
            '<div class="reports-input">' +
              '<div class="reports-input-tit">' +
                '<i class="graph graph-plan"></i>' +
                '<span id="planTitle">下周计划</span>' +
              '</div>' +
              '<textarea class="form-control" placeholder="此处填写工作计划..." id="work-plan"></textarea>' +
            '</div>' +
            '<div class="report-moreinfo mt-20">' +
              '<div class="detail-block entity-info nomg">' +
                '<div id="report-share" class="control-group hide" icon="#i-share"></div>' +
                '<div id="report-attachment" class="control-group"></div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div id="extend-panel"></div>' +
          '<div id="blog-panel" class="reports-input hide">' +
            '<h5>本周工作日报</h5>' +
            '<div id="week-blog"></div>' +
          '</div>' +
        '</div>' +
      '</div>',
    component_attachment: '' +
      '<div class="control-label">' +
        '<i class="graph graph-16-attach"></i>附　　件:' +
      '</div>' +
      '<div class="controls">' +
        '<div id="upload-wrap" class="upload-widget-wrap upload-btn-wrap acl-hide">' +
          '<a id="pickFiles" class="btn btn-xs btn-info">' +
            '<i class="icon-upload-alt"></i> 上传附件' +
          '</a>' +
          '<span class="upload-tip">点击左侧上传按钮选择文件或将文件拖拽到此</span>' +
        '</div>' +
        '<div class="entity-container" data-url="/base/upload/{id}.json"></div>' +
      '</div>',
    share_simpleshare: '' +
      '<% if(panel=="participants"){%>' +
        '<div id="participants-component">' +
          '<div class="control-label">' +
            '<i class="graph graph-16-mans"></i>参与人员:' +
          '</div>' +
          '<div class="controls">' +
            '<div id="participants" class="entity-container" data-url="/share/{id}.json"></div>' +
            '<span class="typeahead-wrapper hide">' +
              '<input type="text" id="typeahead-participants" class="control-input typeahead search" data-entity="employee" data-multi="true" placeholder="输入姓名"/>' +
              '<a class="btn typeahead-search"><i class="icon-search"></i></a>' +
            '</span>' +
            '<span id="editParticipant" class="control-btn entity-item-add acl-hide j_add_participants" title="添加参与人，可添加多个">' +
              '<i title="添加" data-placement="top" data-toggle="tooltip" class="icon-plus-thin"></i>' +
            '</span>' +
          '</div>' +
        '</div>' +
      '<%}%>' +
      '<% if(panel=="share"){%>' +
        '<div id="share-component">' +
          '<div class="control-label"><i class="graph graph-16-share"></i>共　　享:</div>' +
          '<div class="controls">' +
          '<div class="entity-simpleshare">' +
            '<div id="shareentrys" class="entity-container" data-url="/share/{id}.json"></div>' +
            '<div class="typeahead-wrapper hide">' +
              '<select id="share-select" class="form-control control-input hide">' +
                '<option value="user">指定用户</option>' +
                '<option value="department">部门内共享</option>' +
                '<option value="secLevel">所有人</option>' +
              '</select>' +
              '<div class="sharetype-dept hide">' +
                '<input type="text" class="control-input typeahead search" data-entity="department" placeholder="输入部门">' +
                '<a class="btn typeahead-search"><i class="icon-search"></i></a>' +
              '</div>' +
              '<div class="sharetype-user">' +
                '<input type="text" class="control-input typeahead search" data-entity="employee" data-multi="true" placeholder="输入姓名">' +
                '<a class="btn typeahead-search"><i class="icon-search"></i></a>' +
              '</div>' +
            '</div>' +
            '<span id="editShare" class="control-btn entity-item-add j_add_shareentrys">' +
              '<i title="添加" data-placement="top" data-toggle="tooltip" class="icon-plus-thin"></i>' +
            '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<%}%>'
  };
}(app));
