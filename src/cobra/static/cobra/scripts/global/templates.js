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
    'selector.employee': '' +
      '<div id="selector-employee" class="modal hide fade selector-employee j_chat_filterSlip_js" role="dialog" aria-labelledby="modalLabel-employee" aria-hidden="true">' +
        '<div class="modal-dialog">' +
          '<div class="modal-content">' +
            '<div class="modal-header">' +
              '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>' +
              '<h5 id="modalLabel-employee" class="modal-title">人员选择</h5>' +
            '</div>' +
            '<div id="userSelector-multi" class="modal-body hide">' +
              '<div class="user-wrapper">' +
                '<div class="selected-container clearfix">' +
                  '<div class="mb-10 fs-14">已选择：</div>' +
                  '<div class="j_selectedUsersScr" auto-scroll="yes">' +
                    '<div class="selected-users">' +
                      '<div id="addUserToGroup" class="add-group-user">' +
                        '<a id="addUserToGroupButton" class="btn btn-sm hide" title="将已选择的用户加入到新的群组">创建新的群组</a>' +
                        '<input id="add-group-input-text" type="text" class="form-control"/>' +
                        '<a id="addConfirmButton" class="btn btn-sm ml-3 hide">确定</a>' +
                        '<a id="addCancelButton" class="btn btn-sm ml-3 hide">取消</a>' +
                      '</div>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
                '<div class="user-container"></div>' +
              '</div>' +
              '<div class="user-selector-body clearfix">' +
                '<div id="all-org-users" class="user-selector-body-l pull-left"></div>' +
                '<div id="all-group-users" class="user-selector-body-r"></div>' +
              '</div>' +
            '</div>' +
            '<div class="modal-footer">' +
              '<span class="selector-btns">' +
                '<a class="btn btn-middle btn-success hide j_user_ok">确定</a>' +
                '<a class="btn btn-middle j_user_cancel">取消</a>' +
              '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>',
    'selector.department': '' +
      '<div id="selector-department" class="modal fade selector-department" role="dialog" aria-labelledby="modalLabel-department" aria-hidden="true">' +
        '<div class="modal-dialog">' +
          '<div class="modal-content">' +
            '<div class="modal-header">' +
              '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>' +
              '<h5 id="modalLabel-department" class="modal-title">部门选择</h5>' +
            '</div>' +
            '<div id="selector-org-tree" class="org-tree scrollwrapper modal-body"></div>' +
          '</div>' +
        '</div>' +
      '</div>',
    'selector.group': '' +
      '<div id="selector-group" class="modal fade selector-group" role="dialog" aria-labelledby="modalLabel-group" aria-hidden="true">' +
        '<div class="modal-dialog">' +
          '<div class="modal-content">' +
            '<div class="modal-header">' +
              '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>' +
              '<h5 id="modalLabel-group" class="modal-title">群组选择</h5>' +
            '</div>' +
            '<div id="selector-group-div" class="scrollwrapper modal-body">' +
              '<div height="332" style="height: 332px;">' +
                '<ul class="e-list active selector-group-ui">' +
                  '<li id="group-div-clone" class="result-li hide groupclick">' +
                    '<span class="sn-link">1</span>' +
                    '<div class="title">' +
                      '<div class="text j_entity_name ellipsis" title="13123">13123</div>' +
                    '</div>' +
                    '<div class="right"><span class="date"></span><span class="user"></span></div>' +
                  '</li>' +
                '</ul>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>',
    'selector.relevance': '' +
      '<div id="selector-relevance" class="modal hide fade selector-relevance" tabindex="-1" role="dialog" aria-hidden="true">' +
        '<div class="modal-dialog">' +
          '<div class="modal-content">' +
            '<div class="modal-header">' +
              '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>' +
              '<h5 class="modal-title">关联选择</h5>' +
            '</div>' +
            '<div id="relevanceSelector-multi" class="modal-body">' +
              '<div>' +
                '<span class="selector-btns">' +
                  '<a class="btn btn-sm btn-success relevance-ok">确定</a>' +
                  '<a class="btn btn-sm relevance-cancel">取消</a>' +
                '</span>' +
                '<input type="text" class="form-control suggestion" name="suggestion" data-entity="relevance" placeholder="Search"/>' +
                '<span class="prompt hide">(按下enter键进行全文检索)</span>' +
                '<a class="btn btn-sm relevance-search">搜索</a>' +
              '</div>' +
              '<div class="selected-container clearfix hide">' +
                '<span class="selected-label">已选择：</span>' +
                '<div class="j_selected-relevances controls selected-relevances"></div>' +
              '</div>' +
              '<div id="search-result" class="scrollwrapper search-result">' +
                '<ul class="e-list active"></ul>' +
              '</div>' +
              '<div class="pagination-centered">' +
                '<ul class="pagination">' +
                  '<li class="page-first page-buttons"><a title="第一页"><i class="icon-step-backward"></i></a></li>' +
                  '<li class="page-pre disabled page-buttons"><a title="上一页"><i class=" icon-chevron-left"></i></a></li>' +
                  '<li class="active"><a></a></li>' +
                  '<li class="page-next disabled page-buttons"><a title="下一页"><i class=" icon-chevron-right"></i></a></li>' +
                  '<li class="page-last page-buttons"><a title="最后页"><i class="icon-step-forward"></i></a></li>' +
                '</ul>' +
              '</div>' +
            '</div>' +
            '<div class="hide">' +
              '<li id="result-li-clone" class="result-li">' +
                '<span class="sn"></span>' +
                '<span class="checkbox"><i class="icon-checkbox-unchecked"></i></span>' +
                '<div class="title">' +
                  '<div class="text j_entity_name ellipsis"></div>' +
                '</div>' +
                '<div class="right">' +
                  '<span class="date"></span>' +
                  '<span class="user"></span>' +
                '</div>' +
              '</li>' +
              '<span id="selected-relevance-clone" class="entity-item">' +
                '<a class="j_name selected-relevance ellipsis"></a>' +
              '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>',
    'selector.formLabel': '' +
      '<div id="selector-formLabel" class="modal fade selector-label" role="dialog" aria-labelledby="modalLabel-label" aria-hidden="true">' +
        '<div class="modal-dialog">' +
          '<div class="modal-content">' +
            '<div class="modal-header">' +
              '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>' +
              '<h5 id="modalLabel-label" class="modal-title">类别选择</h5></div>' +
            '<div id="selector-label-tree" class="org-tree scrollwrapper modal-body"></div>' +
          '</div>' +
        '</div>' +
      '</div>',
    'selector.tag': '' +
      '<div id="selector-tag" class="modal hide fade selector-tag" tabindex="-1" role="dialog" aria-hidden="true">' +
        '<div class="modal-dialog">' +
          '<div class="modal-content">' +
            '<div class="modal-header">' +
              '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>' +
              '<h5 class="modal-title">选择标签</h5>' +
            '</div>' +
            '<div id="tagSelector-multi" class="modal-body">' +
              '<div>' +
                '<span class="selector-btns fr">' +
                  '<a class="btn btn-sm btn-success tag-ok">确定</a>' +
                  '<a class="btn btn-sm tag-cancel">取消</a>' +
                '</span>' +
                '<input type="text" class="form-control suggestion" name="suggestion" data-entity="tag" placeholder="Search"/>' +
                '<span class="prompt hide">(按下enter键进行全文检索)</span>' +
                '<a class="btn btn-sm j_tagSearch">搜索</a>' +
              '</div>' +
              '<div class="relevance-tag-con">' +
                '<div id="tag-selector-list" class="filter-group tag-div"></div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<span class="j_tag_selector filter-item hide" id="tsClone">' +
        '<a data-entity="" title="" class="tag-click"></a>' +
      '</span>' +
      '<span class="entity-item" id="tagItemClone">' +
        '<a class="router" title="点击进入标签的相关事项" href="/tag/common/4271137929157199923" data-value="4271137929157199923"></a>' +
      '</span>',
    'org.page': '' +
      '<div class="module-view" id="org_container">' +
        '<aside class="aside">' +
          '<div class="aside-content scrollwrapper">' +
            '<ul class="aside-nav">' +
              '<li>' +
                '<ul class="sub-nav nav nav-links">' +
                  '<li class="router j_user" href="/organization"><a class="link-item">团队结构</a></li>' +
                  '<li class="router j_invitation" href="/organization/<%=userId%>/invitation"><a class="link-item">邀请列表</a></li>' +
                '</ul>' +
              '</li>' +
            '</ul>' +
          '</div>' +
        '</aside>' +
        '<div class="main j_main">' +
          '<div class="main-hd hide">' +
            '<a class="btn btn-sm btn-success minw-80 fr invite-toggle">邀请同事</a>' +
            '<div class="title"><i class="graph graph-remind"></i>团队人员</div>' +
          '</div>' +
          '<div id="org-main-bd" class="main-bd">' +
            '<div class="main-content">' +
              '<div class="org-view-wrapper table-tray">' +
                '<div class="org-left-col tray-cell j_depa"></div>' +
                '<div class="org-right-col tray-cell j_user"></div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div id="invite-main-bd" class="main-bd"></div>' +
        '</div>' +
      '</div>',
    'org.departmenttree': '' +
      '<div class="org-left-header">' +
        '<span class="tab">' +
          '<ul class="nav nav-tabs">' +
            '<li class="active"><a id="organization-users">团队</a></li>' +
            '<li><a id="group-users">群组</a></li>' +
          '</ul>' +
        '</span>' +
      '</div>' +
      '<a id="show-first-group" class="hide router"></a>' +
      '<div id="org-tree" class="org-tree scrollwrapper" marginbottom="20">' +
        '<div id="org-tree-list">' +
          '<div id="list-loading" class="loading_small">' +
            '<span>正在加载数据，请稍后...</span>' +
          '</div>' +
        '</div>' +
        '<div id="org-group-list" class="hide">' +
          '<div id="add-dept-group">' +
            '<div class="dept-grouplist-add text-center">添加群组</div>' +
          '</div>' +
          '<div id="group-message" class="dept-grouplist"></div>' +
        '</div>' +
      '</div>',
    'org.department': '' +
      '<div class="dept-hd">编辑部门</div>' +
      '<div id="department-info" class="form-horizontal scrollwrapper entity-info entity-info-w2 department-info hide">' +
        '<div class="control-group">' +
          '<label class="control-label">部门名称：</label>' +
          '<div class="controls">' +
            '<input type="hidden" id="department-id" name="department.id" value=""/>' +
            '<input type="text" class="form-control" id="department-name" name="department.name" placeholder="部门名称"/>' +
          '</div>' +
        '</div>' +
        '<div class="control-group">' +
          '<label class="control-label">部门编码：</label>' +
          '<div class="controls">' +
            '<input type="text" class="form-control w-80" id="department-code" name="department.code" placeholder="部门编码"/>' +
          '</div>' +
        '</div>' +
        '<div class="control-group">' +
          '<label class="control-label">显示顺序：</label>' +
          '<div class="controls">' +
            '<input type="text" class="form-control w-80" id="department-disporder" name="department.disporder" placeholder="显示顺序"/>' +
          '</div>' +
        '</div>' +
        '<div class="control-group mark" id="department-root">' +
          '<label class="control-label">上级部门：</label>' +
          '<div class="controls">' +
            '<input type="hidden" id="department-parent" name="department.parent.id"/>' +
            '<div class="entity-container" id="departmentSelector"><a data-value=""></a></div>' +
            '<span class="typeahead-wrapper hide">' +
              '<input id="typeahead-department" type="text" class="control-input form-control typeahead search" data-entity="department" placeholder="输入部门"/>' +
              '<a class="btn typeahead-search"><i class="fa fa-search"></i></a>' +
            '</span>' +
            '<span class="control-btn actions" title="修改部门"><a class=""><i class="fa fa-pencil"></i></a></span>' +
          '</div>' +
        '</div>' +
        '<div class="control-group hide">' +
          '<label class="control-label">部门经理：</label>' +
          '<div class="controls">' +
            '<div class="entity-container"></div>' +
            '<span class="typeahead-wrapper hide">' +
              '<input type="text" class="control-input typeahead search" data-entity="employee" placeholder="输入姓名"/>' +
              '<a class="btn typeahead-search"><i class="fa fa-search"></i></a>' +
            '</span>' +
            '<span class="control-btn btn btn-sm" title="修改部门经理">' +
              '<a class="fa fa-pencil"></a>' +
            '</span>' +
          '</div>' +
        '</div>' +
        '<div class="control-group ">' +
          '<label class="control-label">备 注：</label>' +
          '<div class="controls">' +
            '<textarea class="form-control" id="department-description" name="department.description" rows="4"></textarea>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div id="department-info-read" class="form-horizontal entity-info department-info hide">' +
        '<div id="department-name-div" class="control-group">' +
          '<label class="control-label">部门名称：</label>' +
          '<div class="controls"><span></span></div>' +
        '</div>' +
        '<div id="department-code-div" class="control-group">' +
          '<label class="control-label">部门编码：</label>' +
          '<div class="controls"><span></span></div>' +
        '</div>' +
        '<div id="department-disporder-div" class="control-group">' +
          '<label class="control-label">显示顺序：</label>' +
          '<div class="controls"><span></span></div>' +
        '</div>' +
        '<div id="department-parent-div" class="control-group">' +
          '<label class="control-label">上级部门：</label>' +
          '<div class="controls"><span></span></div>' +
        '</div>' +
        '<div id="department-description-div" class="control-group ">' +
          '<label class="control-label">备 注：</label>' +
          '<div class="controls"><span></span></div>' +
        '</div>' +
      '</div>',
    'org.user': '' +
      '<div class="user-sort-view j-user-list">' +
        '<div class="user-sortbar">' +
          '<span id="group-user-checkall" class="hide">' +
            '<input id="checkAll" class="user-id" type="checkbox">' +
          '</span>' +
          '<span class="title">成员列表</span>' +
          '<span class="users-list-pinyin">' +
            '<a class="highlight" id="ALL">全部</a>' +
            '<a id="degit">#</a><a id="A">A</a><a id="B">B</a><a id="C">C</a><a id="D">D</a><a id="E">E</a><a id="F">F</a><a id="G">G</a>' +
            '<a id="H">H</a><a id="I">I</a><a id="J">J</a><a id="K">K</a><a id="L">L</a><a id="M">M</a><a id="N">N</a>' +
            '<a id="O">O</a><a id="P">P</a><a id="Q">Q</a><a id="R">R</a><a id="S">S</a><a id="T">T</a>' +
            '<a id="U">U</a><a id="V">V</a><a id="W">W</a><a id="X">X</a><a id="Y">Y</a><a id="Z">Z</a>' +
          '</span>' +
          /*'<label class="checkbox users-list-checkbox">' +
            '<input type="checkbox" id="chk2" title="含离职人员">' +
            '<i>含离职<span>人员</span></i>' +
          '</label>' +*/
        '</div>' +
        '<div id="user-container" class="users-container">' +
          '<div id="employee-container">' +
            '<ul class="employee-list users-list list-unstyled">' +
              '<li class="list-tit clearfix">' +
                '<div class="col-4 item username">姓名</div>' +
                '<div class="col-4 item call">联系方式</div>' +
                '<div class="col-4 item dept">部门</div>' +
              '</li>' +
              '<div class="j_userlistScr scrollwrapper" marginbottom="20">' +
                '<div id="userlistCon">' +
                  '<div id="list-loading" class="loading_small">' +
                    '<span>正在加载数据，请稍后...</span>' +
                  '</div>' +
                  '<div class="center-more hide">加载更多...</div>' +
                '</div>' +
              '</div>' +
            '</ul>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div id="usersListClone" class="hide">' +
        '<li id="groupUserClone" class="clearfix">' +
          '<div class="col-4 item username ellipsis">' +
            '<a><input type="checkbox" name="userids" class="user-id hide"/></a>' +
            '<a class="avatar usercard-toggle" userId>' +
              '<img alt="avatar" title="查看卡片信息" src="/static/images/avatar.png">' +
            '</a>' +
            '<a class="name j_entityslider-toggle" userid="" data-id="" data-module="profile" title="查看他的资料"></a>' +
          '</div>' +
          '<div class="col-4 item call ellipsis"></div>' +
          '<div class="col-4 item dept ellipsis"></div>' +
          '<span class="follow-btns">' +
            '<span class="approved hide" title="已关注，点击取消关注">' +
              '<i class="icon-ok"></i> 已关注 |<a class="btn-unfollow-cancle"> 取消</a>' +
            '</span>' +
            '<span class="unapproved hide" title="已发送关注申请">已申请关注</span>' +
            '<span class="none btn-follow-add hide" title="点击添加关注">' +
              '<i class="icon-plus"></i> 添加关注' +
            '</span>' +
          '</span>' +
        '</li>' +
        '<div class="user-invitation-tip">' +
          '<p>' +
            'TA没有收到邀请邮件？' +
            '<a class="user-invitation-resend">重新发送</a>' +
          '</p>' +
          '<p>或者将下面的邀请地址直接发给TA:</p>' +
          '<a id="user-invitation-link"></a>' +
        '</div>' +
      '</div>',
    'suggestion.employee': '' +
      '<%if(id=="new"){%>' +
        '<p class="employee invite invite-toggle quick-invite-toggle" title="邀请<%=username%>加入cobra">' +
          '<i class="fa fa-plus"></i> 邀请' +
          '<span><%=username%></span>' +
        '</p>' +
      '<%}else{%>' +
        '<p class="employee">' +
          '<img class="avatar" src="">' +
          '<span><%=username%></span>' +
        '</p>' +
      '<%}%>',
    'suggestion.invite': '' +
      '<a class="invite-toggle decoration-none" type="modal">' +
        '<p class="employee invite" title="邀请同事加入cobra"><i class="fa fa-plus"></i> 邀请同事</p>' +
      '</a>',
    'suggestion.department': '<p class="department"><span><%=name%></span></p>',
    'suggestion.group': '<p class="group"><span><%=name%></span></p>',
    'suggestion.tag': '' +
      '<%if(id=="new"){%>' +
        '<p class="tag"><i class="icon-plus"></i>新建标签：<%=name%></p>' +
      '<%}else{%>' +
        '<p class="tag"><%=name%></p>' +
      '<%}%>',
    'suggestion.mainline': '' +
      '<%if(id=="new"){%>' +
        '<p class="mainline"><i class="icon-plus"></i> 添加项目：<%=name%></p>' +
      '<%}else{%>' +
        '<p class="mainline" title="<%=name%>"><%=name%></p>' +
      '<%}%>',
    'suggestion.relevance': '' +
      '<%if(id=="all"){%>' +
        '<p class="relevance"><i class="icon-fulltext-plus"></i><span>查询全部</span></p>' +
      '<%}else{%>' +
        '<p class="relevance" title="[<%=creator.username%>]创建于[<%=createTime%>]：<%=name%>"><i class="icon-<%=module%>"></i> <span><%=name%></span></p>' +
      '<%}%>',
    'suggestion.property': '' +
      '<%if(id=="new"){%>' +
        '<p class="tag"><i class="icon-plus"></i>新建属性：<%=name%></p>' +
      '<%}else{%>' +
        '<p class="tag"><%=name%></p>' +
      '<%}%>',
    'suggestion.category': '' +
      '<%if(id=="new"){%>' +
        '<p class="category employee"><i class="icon-plus"></i>新建：<%=name%></p>' +
      '<%}else{%>' +
        '<p class="category employee"><%=name%></p>' +
      '<%}%>',
    "suggestion.formLabel": '<p class="formlabel"><span><%=name%></span></p>',
    'component.timeline': '' +
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
    'workreport.workreportpage': '' +
      '<aside class="aside m-b-20">' +
        '<ul class="aside-nav">' +
          '<li>' +
            '<ul class="sub-nav nav nav-links">' +
              '<li class="j_mine"><a class="link-item router" href="/workreport">我的报告</a></li>' +
              '<li class="j_share "><a class="link-item router" href="/workreport/share">共享我的</a></li>' +
              '<li class="j_replay "><a class="link-item router" href="/workreport/replay">回复我的<span class="fr j_replayCount"></span></a></li>' +
              '<li class="j_comment "><a class="link-item router" href="/workreport/comment">评论我的<span class="fr j_commentCount"></span></a></li>' +
              '<li class="j_unread "><a class="link-item router" href="/workreport/unread">未读报告<span class="fr j_unreadCount"></span></a></li>' +
              '<li class="j_statistics"><a class="link-item router" href="/workreport/statistics">报告统计</a></li>' +
            '</ul>' +
          '</li>' +
        '</ul>' +
      '</aside>' +
      '<div class="main-reports">' +
        '<div class="reports-panel" id="yearPanel">' +
          '<% if(flag) { %>' +
            '<div class="reports-left">' +
              '<div class="js_reportsnav_scroll scrollwrapper" marginbottom="20">' +
                '<ul class="reports-someoneNav">' +
                  '<li class="no-result hide">没有数据</li>' +
                '</ul>' +
                '<div class="j_more feedback-more common-more hide">下一页<i class="icon-angle-down"></i></div>' +
              '</div>' +
            '</div>' +
            '<div class="reports-right reports-right-full reports-someone" id="reports-right"></div>' +
          '<% }else{ %>' +
            '<div class="row">' +
              '<div class="col-sm-3">' +
                '<div id="reports-left" class="reports-left" ></div>' +
              '</div>' +
              '<div class="col-sm-8">' +
                '<div id="reports-right" class="reports-right" ></div>' +
              '</div>' +
              '<div class="col-sm-1">' +
                '<div id="member-layer" class="member-layer text-center">dddd</div>' +
              '</div>' +
            '</div>' +
          '<% } %>' +
        '</div>' +
      '</div>' +
      '<% if(flag){ %>' +
        '<div id="reportClone" class="hide">' +
          '<li class="clearfix active ">' +
            '<div class="pull-left avatar"><img src="/static/images/avatar.png"></div>' +
            '<div class="someoneNav-right">' +
              '<h4><a class="ellipsis router j_reportTitle" href="#"></a></h4>' +
              '<p><span class="author"></span><span class="time"></span></p>' +
              '<span class="someoneNav-right-arrow">' +
                '<i class="icon-angle-right"></i>' +
              '</span>' +
            '</div>' +
          '</li>' +
        '</div>' +
        '<div id="reportContentClone" class="hide">' +
          '<div class="reports-head">' +
            '<span class="reports-caption" id="reportTitle"></span>' +
            '<span class="pull-right time" id="createTime"></span>' +
          '</div>' +
          '<div class="reports-body">' +
            '<div class="report-result">' +
              '<h4><i class="graph graph-task"></i>完成工作</h4>' +
              '<div class="report-result-content" id="normal"></div>' +
              '<h4><i class="graph graph-idea"></i>工作总结</h4>' +
              '<div class="report-result-content" id="summary"></div>' +
              '<h4><i class="graph graph-plan"></i><span id="planTitle">下周工作</span></h4>' +
              '<div class="report-result-content" id="plan"></div>' +
            '</div>' +
          '</div>' +
          '<div id="extend-panel"></div>' +
        '</div>' +
      '<% } %>',
    'workreport.reportcontent': '' +
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
          '<a class="btn btn-default router " id="prev"></a>' +
          '<a class="btn btn-default router" id="current"></a>' +
          '<a class="btn btn-default router" id="next"></a>' +
        '</div>' +
      '</div>' +
      '<div id="workreportcontent" class="scrollwrapper" marginbottom="20">' +
        '<div class="loading_large hide"></div>' +
        '<div>' +
          '<div class="reports-body">' +
            '<div class="reports-input">' +
              '<div class="reports-input-tit">' +
                '<i class="fa fa-check-square-o fa-fw"></i>' +
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
                '<i class="fa fa-heart fa-fw"></i>总结心得' +
              '</div>' +
              '<textarea class="form-control" placeholder="此处填写总结心得..." id="experience-summary"></textarea>' +
            '</div>' +
            '<div class="reports-input">' +
              '<div class="reports-input-tit">' +
                '<i class="fa fa-calendar-o fa-fw"></i>' +
                '<span id="planTitle">下周计划</span>' +
              '</div>' +
              '<textarea class="form-control" placeholder="此处填写工作计划..." id="work-plan"></textarea>' +
            '</div>' +
            '<div class="report-moreinfo m-t-20">' +
              '<div class="detail-block entity-info no-margin">' +
                '<div id="report-share" class="control-group clearfix hide" icon="#i-share"></div>' +
                '<div id="report-attachment" class="control-group clearfix"></div>' +
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
    'workreport.readonlyreportcontent': '' +
      '<div class="reports-head">' +
        '<span class="reports-caption" id="title"> </span>' +
        '<span id="weekDay" class="ml-5"></span>' +
        '<span>' +
          '<a title="打印" data-toggle="tooltip" data-placement="top" id="wr-print" class="mh-5 fs-14 hide">' +
            '<i class="icon-print"></i>' +
          '</a>' +
        '</span>' +
        '<span>' +
          '<a title="导出" data-toggle="tooltip" data-placement="top" id="wr-export" class="fs-14 hide">' +
            '<i class="icon-file-word"></i>' +
          '</a>' +
        '</span>' +
        '<div class="btn-group pull-right hide" id="switch">' +
          '<a class="btn btn-default" class="router " id="prev"></a>' +
          '<a class="btn btn-default" class="router" id="current"></a>' +
          '<a class="btn btn-default" class="router" id="next"></a>' +
        '</div>' +
      '</div>' +
      '<div id="workreportcontent" class="scrollwrapper" marginbottom="50">' +
        '<div class="loading_large ps-a hide"></div>' +
        '<div>' +
          '<div class="reports-body">' +
            '<div class="report-result mb-20">' +
              '<span class="pull-right">' +
                '<a class="entitybox-toggle" data-module="weeklyblog" id="weeklyblog">' +
                  '<strong id="dayReport"></strong>' +
                '</a>' +
              '</span>' +
              '<h4>' +
                '<i class="graph graph-task"></i><span id="contentTitle">完成工作</span>' +
              '</h4>' +
              '<div class="report-result-content" id="effect-content">尚未填写</div>' +
              '<h4><i class="graph graph-idea"></i>总结心得</h4>' +
              '<div class="report-result-content" id="experience-summary">尚未填写</div>' +
              '<h4><i class="graph graph-plan"></i><span id="planTitle">下周工作</span></h4>' +
              '<div class="report-result-content" id="work-plan">尚未填写</div>' +
            '</div>' +
            '<div class="entity-info no-margin">' +
              '<div id="report-attachment" class="control-group" style="border:1px solid #d5d5d5; border-radius:3px"></div>' +
            '</div>' +
          '</div>' +
          '<div id="extend-panel"></div>' +
          '<div id="blog-panel" class="blog-print-content hide"><h5>本周工作日报</h5>' +
            '<div id="week-blog"></div>' +
          '</div>' +
        '</div>' +
      '</div>',
    'component.userslider': '' +
      '<div class="member-head text-center" id="listTitle"></div>' +
      '<div class="member-layer-search">' +
        '<input type="text" placeholder="搜索成员" class="form-control" id="membersearch-keywords"/>' +
      '</div>' +
      '<div id="memebers-wrapper" class="scrollwrapper" marginbottom="60">' +
        '<ul id="members" class="member-list"></ul>' +
      '</div>' +
      '<div id="userClone" class="hide">' +
        '<li class="j_user">' +
          '<p class="avatar">' +
            '<a class="router" href="" user-id="" user-name="" id="avatar">' +
              '<img class="avatar" src="">' +
            '</a>' +
          '</p>' +
          '<p class="name">' +
            '<a class="router" href="" user-id="" user-name="" id="name"></a>' +
          '</p>' +
          '<span class="j_expend"></span>' +
        '</li>' +
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
    'component.typeahead': '' +
      '<div id="typeahead-div" class="tt-suggestion border-dropdown">' +
        '<div class="loading_small">正在加载数据 ... </div><div id="searchList"></div>' +
      '</div>',
    'share.simpleshare': '' +
      '<% if(panel=="participants"){%>' +
        '<div id="participants-component">' +
          '<div class="control-label">' +
            '<i class="graph graph-16-mans"></i>参与人员:' +
          '</div>' +
          '<div class="controls">' +
            '<div id="participants" class="entity-container" data-url="/share/{id}.json"></div>' +
            '<span class="typeahead-wrapper hide">' +
              '<input type="text" id="typeahead-participants" class="control-input typeahead search" data-entity="employee" data-multi="true" placeholder="输入姓名"/>' +
              '<a class="btn typeahead-search"><i class="fa fa-search"></i></a>' +
            '</span>' +
            '<span id="editParticipant" class="control-btn entity-item-add acl-hide j_add_participants" title="添加参与人，可添加多个">' +
              '<i title="添加" data-placement="top" data-toggle="tooltip" class="fa fa-plus"></i>' +
            '</span>' +
          '</div>' +
        '</div>' +
      '<%}%>' +
      '<% if(panel=="share"){%>' +
        '<div id="share-component">' +
          '<div class="control-label"><i class="graph fa fa-share-alt"></i>共　　享:</div>' +
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
                '<a class="btn typeahead-search"><i class="fa fa-search"></i></a>' +
              '</div>' +
              '<div class="sharetype-user">' +
                '<input type="text" class="control-input typeahead search" data-entity="employee" data-multi="true" placeholder="输入姓名">' +
                '<a class="btn typeahead-search"><i class="fa fa-search"></i></a>' +
              '</div>' +
            '</div>' +
            '<span id="editShare" class="control-btn entity-item-add j_add_shareentrys">' +
              '<i title="添加" data-placement="top" data-toggle="tooltip" class="fa fa-plus"></i>' +
            '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<%}%>',
    'share.shareall': '' +
      '<% if(panel=="participants"){ %>' +
        '<div id="participants-component">' +
          '<div class="control-label"><i class="graph graph-16-mans"></i>参与人员:</div>' +
          '<div class="controls">' +
            '<div id="participants" class="entity-container" data-url="/share/{id}.json"></div>' +
            '<span class="typeahead-wrapper hide">' +
              '<input type="text" id="typeahead-participants" class="control-input typeahead search" data-entity="employee" data-multi="true" placeholder="输入姓名"/>' +
              '<a class="btn typeahead-search"><i class="fa fa-search"></i></a>' +
            '</span>' +
            '<span id="editParticipant" class="control-btn entity-item-add acl-hide j_add_participants" title="添加参与人，可添加多个">' +
              '<i title="添加" data-placement="top" data-toggle="tooltip" class="fa fa-plus"></i>' +
            '</span>' +
          '</div>' +
        '</div>' +
      '<%}%>' +
      '<% if(panel=="share"){ %>' +
        '<div id="share-component">' +
          '<div class="control-label"><i class="graph fa fa-share-alt"></i>共　　享:</div>' +
          '<div class="controls">' +
            '<div class="entity-simpleshare">' +
              '<div id="shareentrys" class="entity-container" data-url="/share/{id}.json"></div>' +
              '<div class="typeahead-wrapper hide">' +
                '<select id="share-select" class="form-control">' +
                  '<option value="user">用户</option>' +
                  '<option value="department">部门</option>' +
                  '<option value="group">群组</option>' +
                  '<option value="all">所有人</option>' +
                '</select>' +
                '<div class="sharetype-group hide">' +
                  '<input type="text" class="control-input typeahead search" data-entity="group" placeholder="输入群组">' +
                  '<a class="btn typeahead-search"><i class="fa fa-search"></i></a>' +
                '</div>' +
                '<div class="sharetype-dept hide">' +
                  '<input type="text" class="control-input typeahead search" data-entity="department" placeholder="输入部门">' +
                  '<a class="btn typeahead-search"><i class="fa fa-search"></i></a>' +
                '</div>' +
                '<div class="sharetype-user">' +
                  '<input type="text" class="control-input typeahead search" data-entity="employee" data-multi="true" placeholder="输入姓名">' +
                  '<a class="btn typeahead-search"><i class="fa fa-search"></i></a>' +
                '</div>' +
              '</div>' +
              '<span id="editShare" class="control-btn entity-item-add j_add_shareentrys">' +
                '<i title="添加" data-placement="top" data-toggle="tooltip" class="fa fa-plus"></i>' +
              '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '<%}%>'

  };
}(app));
