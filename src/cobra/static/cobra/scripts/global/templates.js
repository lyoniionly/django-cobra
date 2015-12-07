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
      '</div>'
  };
}(app));
