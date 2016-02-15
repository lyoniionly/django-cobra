(function (app) {
  "use strict";

  app.templates = {
    'base.department': '<span class="entity-item"><a data-value="<%=id%>"><%=name%></a></span>',
    'base.entitybox': '' +
      '<div id="entitybox" class="entitybox modal fade" tabindex="-1" role="dialog" aria-hidden="true">' +
        '<div class="modal-dialog">' +
          '<div class="modal-content j_modal-content">' +
            '<div class="modal-header hide"><a id="closebox" class="close" data-dismiss="modal" aria-hidden="true">×</a></div>' +
            '<div id="entitybox-container" class="modal-body"></div>' +
            '<div class="modal-footer"></div>' +
          '</div>' +
        '</div>' +
      '</div>',
    'base.custmenu': '' +
      '<div class="main-hd">' +
        '<div class="title"><i class="graph graph-settings"></i>菜单设置</div>' +
        '<div class="j_menuset_close ape-close fr hide"><a title="关闭" id="btn-close" class="j_btn_close close">&times;</a></div>' +
      '</div>' +
      '<div id="menuset-wrapper" class="module-set-view scrollwrapper">' +
        '<div class="p-20">' +
          '<div class="table-tray">' +
            '<div class="tray-cell">' +
              '<div class="module-set-list">' +
                '<div class="remindinfo m-b-10 hide">1、隐藏的菜单选项将在更多应用中展示，默认显示日报及报告<br>2、菜单显示的个数是根据您浏览器窗口的大小以及您设置展示的菜单共同决定的。</div>' +
                '<ul class=\'sortmenus j_sortmenus list-unstyled\'>' +
                  '<% for(var i=0,len=menus.length;i<len;i++) { if(menus[i].id == 0) continue;// 首页不显示出来 %>' +
                    '<li class=\'on_off cs-m\'>' +
                      '<span class=\'middle_helper\'></span>' +
                      '<span data-id=\'<%= menus[i].id %>\' class=\'menu_name\'><%=menus[i].menuName %></span>' +
                      '<input type="checkbox" <% if(menus[i].menuStatus === 1) { %> checked=\'checked\' <% } %>/>' +
                      '<span title=\'拖拉排序\' class=\'menu_move\'></span>' +
                    '</li>' +
                  '<% } %>' +
                '</ul>' +
                '<div class="reset-navsetting m-t-20">' +
                  '<a class="btn btn-sm btn-success" href="#">恢复默认设置</a>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div class="tray-cell j_moduleset_col view-side">' +
              '<div class="panel panel-alpha">' +
                '<div class="panel-heading">' +
                  '<div class="panel-title">小提示</div>' +
                '</div>' +
                '<div class="panel-body font-size-12">' +
                  '<p class="e-row">1、隐藏的菜单选项将在更多应用中展示，默认显示日报及报告<br>2、菜单显示的个数是根据您浏览器窗口的大小以及您设置展示的菜单共同决定的。</p>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>',
    'base.profile': '' +
      '<div class="main-hd">' +
        '<div class="title"><i class="graph graph-settings"></i>用户资料</div>' +
      '</div>' +
      '<div id="user-container" class="userinfo-view scrollwrapper">' +
        '<div class="p-20">' +
          '<div class="userinfo-container table-tray">' +
            '<div class="tray-cell userinfo-main">' +
              '<div id="user-info" class="card card-corner form-horizontal entity-info  hide">' +
                '<div class="control-group">' +
                  '<label class="control-label">姓 名：</label>' +
                  '<div class="controls">' +
                    '<input type="hidden" id="employee-id" name="employee.id"/>' +
                    '<input type="text" id="employee-username" class="textinput form-control" name="employee.username" v-maxlength="10"/>' +
                  '</div>' +
                '</div>' +
                '<div class="control-group">' +
                  '<label class="control-label">账号：</label>' +
                  '<div class="controls controls-textonly accounts_js">' +
                    '<span></span>' +
                    '<span class="ml-10"></span>' +
                  '</div>' +
                '</div>' +
                '<div class="control-group">' +
                  '<label class="control-label">邮箱：</label>' +
                  '<div class="controls">' +
                    '<span id="employee-email-span" class="hide controls-textspan"></span>' +
                    '<input type="text" id="employee-email" class="textinput form-control bluebox" name="employee.email" v-name="email"/>' +
                    '<a id="changeEmail" propertyName="bindingEmail" class="hide binding_js">[绑定]</a>' +
                    '<a class="hide remove_js binding_js" propertyName="removeEmail">[解绑]</a>' +
                    '<a id="employee-email-repeat" class="hide">团队已有人使用该邮箱！</a>' +
                    '<em class="emp-safe-msg hide c-danger">为了您的账号安全，请尽快绑定邮箱！</em>' +
                  '</div>' +
                '</div>' +
                '<div class="control-group">' +
                  '<label class="control-label">手 机：</label>' +
                  '<div class="controls">' +
                    '<span id="employee-mobile-span" class="hide controls-textspan"></span>' +
                    '<input type="text" id="employee-mobile" name="employee.mobile" class="form-control textinput" v-name="mobile"/>' +
                    '<a id="changeMobile" propertyName="bindingMobile" class="hide binding_js ml-10">[绑定]</a>' +
                    '<a class="hide remove_js binding_js" propertyName="removeMobile">[解绑]</a>' +
                    '<a id="employee-mobile-repeat" class="hide">团队已有人使用该手机！</a>' +
                    '<em class="emp-safe-msg hide c-danger">为了您的账号安全，请尽快绑定手机！</em>' +
                  '</div>' +
                '</div>' +
                '<div id="passwd-btn" class="control-group">' +
                  '<label class="control-label" for="inputPassword">密码：</label>' +
                  '<div class="controls">' +
                    '<a id="btn-changePwd" class="btn btn-sm btn-primary pwd-toggle hide" type="changePwd">' +
                      '<i class="icon-pencil"></i> 修改密码' +
                    '</a>' +
                    '<a id="btn-resetPwd" class="btn btn-sm btn-primary pwd-toggle hide" type="resetPwd">' +
                      '<i class="icon-pencil"></i> 重置密码' +
                    '</a>' +
                  '</div>' +
                '</div>' +
                '<div class="control-group">' +
                  '<label class="control-label">性 别：</label>' +
                  '<div class="controls ">' +
                    '<label class="radio-inline">' +
                      '<input type="radio" name="employee.sex" value="male"/>男' +
                    '</label>' +
                    '<label class="radio-inline">' +
                      '<input type="radio" name="employee.sex" value="female"/>女' +
                    '</label>' +
                  '</div>' +
                '</div>' +
                '<div class="control-group">' +
                  '<label class="control-label">电 话：</label>' +
                  '<div class="controls">' +
                    '<input type="text" id="employee-telephone" name="employee.telephone" class="textinput form-control" v-maxlength="50"/>' +
                  '</div>' +
                '</div>' +
                '<div id="user-info-hasAcl" class="hide">' +
                  '<div id="departmentRow" class="control-group">' +
                    '<label class="control-label">部 门：</label>' +
                    '<div class="controls">' +
                      '<div undeletable="true" id="employee-department" class="entity-container"></div>' +
                      '<span class="typeahead-wrapper hide">' +
                        '<input id="typeahead-department" type="text" class="control-input form-control typeahead search" data-entity="department" placeholder="输入部门"/>' +
                        '<a class="btn typeahead-search"><i class="icon-search"></i></a>' +
                      '</span>' +
                      '<span class="control-btn entity-item-add" title="修改部门" data-placement="top" data-toggle="tooltip"><i class="icon-pencil"></i></span>' +
                    '</div>' +
                  '</div>' +
                  '<div class="control-group">' +
                    '<label class="control-label">职 级：</label>' +
                    '<div class="controls">' +
                      '<select id="employee-rank" class="form-control" name="employee.rank">' +
                        '<option value="user">职员</option>' +
                        '<option value="manager">经理</option>' +
                        '<option value="boss">领导</option>' +
                      '</select>' +
                    '</div>' +
                  '</div>' +
                  '<div id="superiorRow" class="control-group">' +
                    '<label class="control-label" title="设置直属上级，多个直属上级请在其他上级中继续设置">上级：</label>' +
                    '<div class="controls">' +
                      '<div id="employee-superior" class="entity-container"></div>' +
                      '<span class="typeahead-wrapper hide">' +
                        '<input id="typeahead-superior" type="text" class="control-input form-control typeahead search" data-entity="employee" placeholder="输入姓名"/>' +
                        '<a class="btn typeahead-search"><i class="icon-search"></i></a>' +
                      '</span>' +
                      '<span class="control-btn entity-item-add" title="修改上级" data-placement="top" data-toggle="tooltip"><i class="icon-pencil"></i></span>' +
                    '</div>' +
                  '</div>' +
                  '<div id="seniorRow" class="control-group hide">' +
                    '<label class="control-label" title="可以设置多个上级">其他上级：</label>' +
                    '<div class="controls">' +
                      '<div id="business-employee-superior" class="entity-container"></div>' +
                      '<span class="typeahead-wrapper hide">' +
                        '<input type="text" id="typeahead-business-superior" class="control-input typeahead search" data-entity="employee" data-multi="true" placeholder="输入姓名"/>' +
                        '<a class="btn typeahead-search"><i class="icon-search"></i></a>' +
                      '</span>' +
                      '<span class="control-btn entity-item-add" title="修改业务上级" data-placement="top" data-toggle="tooltip"><i class="icon-pencil"></i></span>' +
                    '</div>' +
                  '</div>' +
                  '<div id="assistantRow" class="control-group">' +
                    '<label class="control-label" title="可以查看用户下属的工作内容">助理：</label>' +
                    '<div class="controls">' +
                      '<div id="assistant" class="entity-container"></div>' +
                      '<span class="typeahead-wrapper hide">' +
                        '<input id="typeahead-assistant" type="text" class="control-input form-control typeahead search" data-entity="employee" placeholder="输入姓名"/>' +
                        '<a class="btn typeahead-search"><i class="icon-search"></i></a>' +
                      '</span>' +
                      '<span class="control-btn entity-item-add" title="修改助理" data-placement="top" data-toggle="tooltip"><i class="icon-pencil"></i></span>' +
                    '</div>' +
                  '</div>' +
                  '<div id="openAccessRow" class="control-group">' +
                    '<label class="control-label" title="把开放者的所有工作内容开放给其他同事查阅">权限开放：</label>' +
                    '<div class="controls">' +
                      '<div id="open-access" class="entity-container"></div>' +
                      '<span class="typeahead-wrapper hide">' +
                        '<input type="text" id="typeahead-open-access" class="control-input typeahead search" data-entity="employee" data-multi="true" placeholder="输入姓名"/>' +
                        '<a class="btn typeahead-search"><i class="icon-search"></i></a>' +
                      '</span>' +
                      '<span id="editParticipant" class="control-btn entity-item-add" title="修改权限开放人员" data-placement="top" data-toggle="tooltip"><i class="icon-pencil"></i></span>' +
                    '</div>' +
                  '</div>' +
                  '<div class="control-group">' +
                    '<label class="control-label">角色：</label>' +
                    '<div class="controls">' +
                      '<label class="checkbox-inline">' +
                        '<input type="checkbox" id="ROLE_ADMIN" roleId="5585537017320349068" name="roleChk"> 系统管理员' +
                      '</label></div>' +
                  '</div>' +
                '</div>' +
                '<div id="user-info-noAcl" class="hide">' +
                  '<div id="department-div" class="control-group">' +
                    '<label class="control-label">部 门：</label>' +
                    '<div class="controls controls-textonly"><p></p></div>' +
                  '</div>' +
                  '<div id="rank-div" class="control-group">' +
                    '<label class="control-label">职 级：</label>' +
                    '<div class="controls controls-textonly">' +
                      '<span class="controls-text  user hide">职员</span>' +
                      '<span class="controls-text  manager hide">经理</span>' +
                      '<span class="controls-text  boss hide">领导</span>' +
                    '</div>' +
                  '</div>' +
                  '<div id="superior-div" class="control-group">' +
                    '<label class="control-label">上 级：</label>' +
                    '<div class="controls controls-textonly"><p></p></div>' +
                  '</div>' +
                  '<div id="other-superior-div" class="control-group">' +
                    '<label class="control-label">其他上级：</label>' +
                    '<div class="controls controls-textonly"></div>' +
                  '</div>' +
                  '<div id="assistant-div" class="control-group">' +
                    '<label class="control-label">助 理：</label>' +
                    '<div class="controls controls-textonly"><p></p></div>' +
                  '</div>' +
                  '<div id="open-access-div" class="control-group hide">' +
                    '<label class="control-label">权限开放：</label>' +
                    '<div class="controls controls-textonly"></div>' +
                  '</div>' +
                  '<div id="openAccessRow" class="control-group hide">' +
                    '<label class="control-label">权限开放：</label>' +
                    '<div class="controls">' +
                      '<div id="open-access" class="entity-container"></div>' +
                      '<span class="typeahead-wrapper hide">' +
                        '<input type="text" id="typeahead-open-access" class="control-input typeahead search" data-entity="employee" data-multi="true" placeholder="输入姓名"/>' +
                        '<a class="btn typeahead-search"><i class="icon-search"></i></a>' +
                      '</span>' +
                      '<span id="editParticipant" class="control-btn entity-item-add acl-hide" title="修改权限开放人员" data-placement="top" data-toggle="tooltip"><i class="icon-plus"></i></span>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
                '<div id="statusDiv" class="control-group">' +
                  '<label class="control-label">状 态：</label>' +
                  '<div class="controls controls-textonly">' +
                    '<div class="value" for="status">' +
                      '<span id="employee-status" class="controls-text" style="">离职</span>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
                '<div class="control-group">' +
                  '<div class="btn-container pull-right">' +
                    '<span class="radio" style="display: none;">' +
                      '<a id="employee-unavailable" class="btn btn-sm btn-primary" propertyName="resignation">离职</a>' +
                    '</span>' +
                    '<span class="radio" style="display: none;">' +
                      '<a id="employee-available" class="btn btn-sm btn-primary" propertyName="normal">返聘</a>' +
                    '</span>' +
                    '<span>' +
                      '<a id="js_quit_transfer" class="btn btn-sm btn-primary entitybox-toggle" propertyName="resignation" data-module="quitTransfer" data-id="" data-value="">工作交接</a>' +
                    '</span>' +
                  '</div>' +
                '</div>' +
              '</div>' +
              '<div id="user-info-normal" class="form-horizontal entity-info user-info hide">' +
                '<div id="employee-username-div" class="control-group">' +
                  '<label class="control-label">姓 名：</label>' +
                  '<div class="controls controls-textonly"><p></p></div>' +
                '</div>' +
                '<div id="employee-email-div" class="control-group">' +
                  '<label class="control-label">邮 件：</label>' +
                  '<div class="controls controls-textonly"><p></p></div>' +
                '</div>' +
                '<div id="employee-mobile-div" class="control-group">' +
                  '<label class="control-label ">手 机：</label>' +
                  '<div class="controls controls-textonly"><p></p></div>' +
                '</div>' +
                '<div id="employee-sex-div" class="control-group">' +
                  '<label class="control-label">性 别：</label>' +
                  '<div class="controls controls-textonly">' +
                    '<p class="male hide">男</p>' +
                    '<p class="female hide">女</p>' +
                  '</div>' +
                '</div>' +
                '<div id="employee-telephone-div" class="control-group">' +
                  '<label class="control-label">电话：</label>' +
                  '<div class="controls controls-textonly"><p></p></div>' +
                '</div>' +
                '<div id="department-div" class="control-group">' +
                  '<label class="control-label">部 门：</label>' +
                  '<div class="controls controls-textonly"><p></p></div>' +
                '</div>' +
                '<div id="rank-div" class="control-group">' +
                  '<label class="control-label">职 级：</label>' +
                  '<div class="controls controls-textonly">' +
                    '<p class="user hide">职员</p>' +
                    '<p class="manager hide">经理</p>' +
                    '<p class="boss hide">领导</p>' +
                  '</div>' +
                '</div>' +
                '<div id="superior-div" class="control-group">' +
                  '<label class="control-label">上 级：</label>' +
                  '<div class="controls controls-textonly"><p></p></div>' +
                '</div>' +
                '<div id="other-superior-div" class="control-group">' +
                  '<label class="control-label">其他上级：</label>' +
                  '<div class="controls controls-textonly"></div>' +
                '</div>' +
                '<div id="assistant-div" class="control-group">' +
                  '<label class="control-label">助 理：</label>' +
                  '<div class="controls controls-textonly"><p></p></div>' +
                '</div>' +
                '<div id="open-access-div" class="control-group">' +
                  '<label class="control-label">权限开放：</label>' +
                  '<div class="controls controls-textonly"></div>' +
                '</div>' +
                '<div id="status-div" class="control-group">' +
                  '<label class="control-label">状 态：</label>' +
                  '<div class="controls controls-textonly">' +
                    '<p class="normal hide">在职</p>' +
                    '<p class="unavailable hide">离职</p>' +
                    '<p class="locked hide">锁定</p></div>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div class="tray-cell userinfo-side j_help hide-im">' +
              '<div class="panel panel-alpha">' +
                '<div class="panel-heading">' +
                  '<div class="panel-title">其他权限说明</div>' +
                '</div>' +
                '<div class="panel-body fs-12">' +
                  '<p class="e-row">1.助理：代表可以查看本人下属的工作内容</p>' +
                  '<p class="e-row">2.权限开放：代表可以把自己的所有工作内容开放给其他同事查阅</p>' +
                  '<p class="e-row">3. 其他上级：同上级</p>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>',
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
      '<div id="selector-employee" class="modal fade selector-employee j_chat_filterSlip_js" role="dialog" aria-labelledby="modalLabel-employee" aria-hidden="true">' +
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
                '<span class="selector-btns pull-right">' +
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
            '<ul class="aside-nav nav nav-list">' +
              '<li class="router j_user" href="/organization"><a class="link-item">团队结构</a></li>' +
              '<li class="router j_invitation" href="/organization/<%=userId%>/invitation"><a class="link-item">邀请列表</a></li>' +
            '</ul>' +
          '</div>' +
        '</aside>' +
        '<div class="main j_main">' +
          '<div class="main-hd hide">' +
            '<a class="btn btn-sm btn-success minw-80 pull-right invite-toggle">邀请同事</a>' +
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
                '<div class="container-fluid">' +
                  '<div class="row">' +
                    '<div class="col-sm-4 item username">姓名</div>' +
                    '<div class="col-sm-4 item call">联系方式</div>' +
                    '<div class="col-sm-4 item dept">部门</div>' +
                  '</div>' +
                '</div>' +
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
          '<div class="container-fluid">' +
            '<div class="row">' +
              '<div class="col-sm-4 item username ellipsis">' +
                '<a><input type="checkbox" name="userids" class="user-id hide"/></a>' +
                '<a class="avatar usercard-toggle" userId>' +
                  '<img alt="avatar" title="查看卡片信息" src="/static/images/avatar.png">' +
                '</a>' +
                '<a class="name j_entityslider-toggle" userid="" data-id="" data-module="profile" title="查看他的资料"></a>' +
              '</div>' +
              '<div class="col-sm-4 item call ellipsis"></div>' +
              '<div class="col-sm-4 item dept ellipsis"></div>' +
            '</div>' +
          '</div>' +
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
    'component.top': '' +
      '<header id="navigation" class="navigation">' +
        '<div id="user-panel" class="user-panel dropdown dropdown-menu-toggle pull-left">' +
          '<div class="user-avatar pull-left router" href="/">' +
            '<img class="j_user-currentAvatar" src="/static/cobra/img/avatar/default_avatar.png"/>' +
          '</div>' +
          '<div class=\'user-menu top-user-menu\'>' +
            '<a class="dropdown-toggle ds-ib-w router j_user_menu_portal" href="/portal" data-url="/portal">' +
              '<p class="user-person">' +
                '<span class="user-name ellipsis"><%=currentUser.username%></span>' +
                '<i class="fa fa-angle-down"></i>' +
                '<span class="user-nameof hide">的</span>' +
              '</p>' +
              '<p class="user-team ellipsis" title="<%=organization.name%>"><%=organization.name%></p>' +
            '</a>' +
            '<div id="j_dropUser" class="dropdown-user dropdown-menu dropdown-shadow clearfix">' +
              '<div class=\'clearfix teampanel <%=organizations.length <= 1 ? "hide" : ""%>\'>' +
                '<div class=\'teams-swich pull-left j_teams-swich <%=organizations.length <= 1 ? "hide" : ""%>\'>' +
                  '<span class="txt pull-left">切换组织：</span>' +
                  '<div class="e-selectui dropdown pull-left dropdown-menu-toggle dropdown-gettext">' +
                    '<a class="selectui-result dropdown-toggle ellipsis"><%=organization.name%><i class="fa fa-caret-down"></i></a>' +
                    '<ul class="dropdown-menu border-dropdown eui-scroll">' +
                      '<% _.each(organizations, function(org){ %>' +
                        '<li class=\'<%=org.isCurrent ? "active" : "" %>\'>' +
                          '<a href="/organizations/<%=org.slug%>/"><%=org.name%></a>' +
                        '</li>' +
                      '<% }); %>' +
                    '</ul>' +
                  '</div>' +
                '</div>' +
                '<a class="pull-right btn btn-sm a-team btn-primary  j_joinOrCreate_dropdown">创建或加入团队</a>' +
              '</div>' +
              '<div class="clearfix">' +
                '<div class="mypanel pull-left">' +
                  '<div class="avatar"><img class="j_user-avatar" src="/static/cobra/img/avatar/default_avatar.png"></div>' +
                  '<div class="myoption">' +
                    '<a class="btn btn-sm btn-block on j_to-myspace hide router" href="/">返回我的工作空间</a>' +
                    '<a class="btn btn-sm btn-block j_clickhide router" href="/feed/unfinish/all">未完成事项</a>' +
                    '<a class="btn btn-sm btn-block j_clickhide router" href="/feed/watched/all">关注事项</a>' +
                    '<a class="btn btn-sm btn-block j_clickhide router" href="/tag/privacy/list">标签</a>' +
                    '<a class="btn btn-sm btn-block j_clickhide router" href="/profile">个人设置</a>' +
                  '</div>' +
                '</div>' +
                '<div class="otherspanel pull-left">' +
                  '<div class="hint">' +
                    '在此您可以切换到关注的人或下属的工作空间' +
                    '<div class="user-space-search">' +
                      '<input id="user-search" class="form-control placeholder-sm" type="text" placeholder="人员搜索">' +
                      '<a id="user-search-icon" class="search-btn"><i class="icon-search"></i></a>' +
                    '</div>' +
                  '</div>' +
                  '<ul class="user-tab js_userTab list-unstyled clearfix">' +
                    '<li class="router j_user_follow j_clickhide" href="/users/myfollow" data-items="user_follow">' +
                      '<a>我关注的人</a>' +
                    '</li>' +
                    '<li class="router j_user_mysub j_clickhide j_top_mysubordinates" href="/users/myfollow/<%=currentUser.id%>/subordinate" data-items="user_mysub">' +
                      '<a>我的下属</a>' +
                    '</li>' +
                    '<li class="router j_user_org j_clickhide" href="/organization" data-items="user_org">' +
                      '<a>团队成员</a>' +
                    '</li>' +
                  '</ul>' +
                  '<div class="user-list-container j_userlistScroll clearfix">' +
                    '<ul id="user_follow" class="user-list clearfix"></ul>' +
                    '<ul id="user_mysub" class="user-list clearfix hide"></ul>' +
                    '<ul id="user_org" class="user-list clearfix hide"></ul>' +
                    '<div id="user_followbtn" class="user-follow-btns">' +
                      '<a class="btn btn-sm j_clickhide j_addFollow w-80 mr-10">加关注</a>' +
                      '<a class="btn btn-sm j_clickhide w-80 router" href="/users/myfollow">更多关注</a>' +
                    '</div>' +
                  '</div>' +
                  '<div class="user-list-container clearfix j_user-search-container hide">' +
                    '<ul id="search-result" class="user-list clearfix"></ul>' +
                    '<div class="j_noSearchResult hide"><p align="center">无搜索结果!</p></div>' +
                  '</div>' +
                '</div>' +
              '</div>' +
              '<div class="useroption clearfix">' +
                '<a class="btn btn-sm btn-primary j_clickhide router-fake" href="/organizations/<%=organizationId%>/members/#organization">团队成员设置</a>' +
                '<a class="btn btn-sm btn-danger invite-toggle">邀请同事</a>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="base-nav j_basenav" id="j_navwrap">' +
          '<ul class="nav-ul j_nav_ul list-unstyled">' +
            '<li class="nav-homeli j_homeli">' +
              '<a class="router" href="/portal" data-url="/portal">工作台</a>' +
            '</li>' +
            '<li class="nav-blogli j_blog_NoAuthority hide">' +
              '<a class="router" href="/blog" data-url="/blog"><span>日报</span></a>' +
            '</li>' +
            '<div class="nav-autolis j_baseautolis">' +
              '<% for(var i=0;i<custshowmenus.length;i++) { %>' +
                '<%=custshowmenus[i]%>' +
              '<% } %>' +
            '</div>' +
            '<li class="j_activeli"></li>' +
            '<li id="more-menu" class="more-li dropdown dropdown-menu-toggle">' +
              '<a class="dropdown-toggle">更多应用<i class="fa fa-angle-down"></i></a>' +
              '<div class="sub-cate dropdown-menu j_pageActive">' +
                '<div class="group">' +
                  '<dl>' +
                    '<dt>汇报</dt>' +
                    '<dd>' +
                      '<a class="router-fake j_modnav-blog" href="/organizations/<%=organizationId%>/workreport/daily/<%=currentUser.account%>/" data-url="/organizations/<%=organizationId%>/workreport/daily/<%=currentUser.account%>/"><span>日报</span><span>工作日报</span></a>' +
                      '<a class="router-fake j_modnav-workreport" href="/organizations/<%=organizationId%>/summary/<%=currentUser.account%>/#workreport" data-url="/organizations/heello/summary/<%=currentUser.account%>/#workreport"><span>报告</span><span>工作报告</span></a>' +
                    '</dd>' +
                  '</dl>' +
                  '<dl>' +
                    '<dt>审批</dt>' +
                    '<dd>' +
                      '<a class="router j_modnav-workflow" href="/workflows" data-url="/workflows"><span>审批</span><span>审批流程</span></a>' +
                    '</dd>' +
                  '</dl>' +
                '</div>' +
                '<div class="group">' +
                  '<dl>' +
                    '<dt>协作</dt>' +
                    '<dd>' +
                      '<a class="router j_modnav-mainline" href="/mainlines" data-url="/mainlines"><span>项目</span><span>目标项目</span></a>' +
                      '<a class="router j_modnav-task" href="/tasks" data-url="/tasks"><span>任务</span><span>任务协作</span></a>' +
                      '<a class="router j_modnav-calendar" href="/calendar" data-url="/calendar"><span>日程</span><span>日程安排</span></a>' +
                      '<a class="router j_modnav-document" href="/documents" data-url="/documents"><span>文档</span><span>知识文档</span></a>' +
                    '</dd>' +
                  '</dl>' +
                '</div>' +
                '<div class="group">' +
                  '<dl>' +
                    '<dt>其他</dt>' +
                    '<dd>' +
                      '<a class="router j_modnav-report" href="/report/taskstatistics" data-url="/report/taskstatistics"><span>统计</span><span>统计报表</span></a>' +
                      '<a class="router j_modnav-form" href="/forms" data-url="/forms"><span>表单</span><span>业务表单</span></a>' +
                    '</dd>' +
                  '</dl>' +
                '</div>' +
                '<div class="base-nav-opt">' +
                  '<a id="top_menuset" data-id="new" data-module="custmenu" class="router entitybox-toggle"><i class="fa fa-cog m-r-10"></i>设置</a>' +
                '</div>' +
              '</div>' +
            '</li>' +
          '</ul>' +
        '</div>' +
        '<div class="quick-menu pull-right">' +
          '<ul class="nav nav-pills">' +
            '<li class="dropdown dropdown-menu-toggle quick-create-menu" id="j_quickBuild">' +
              '<a><i class="fa fa-plus-circle font-size-16"></i></a>' +
              '<ul class="dropdown-menu dropdown-menu-right">' +
                '<li><a data-id="new" data-target="#blog-textarea" data-module="blog" class="entitybox-toggle">写日报</a></li>' +
                '<li><a data-id="today" data-module="task" data-value="today" data-target="#task-title" class="entitybox-toggle" id="task-create-fast">安排任务</a></li>' +
                '<li><a data-id="new" data-target="#title" data-module="agenda" class="entitybox-toggle">安排日程</a></li>' +
                '<li><a data-id="new" data-module="document" data-value="new" class="" id="document-create-fast">上传文件</a></li>' +
                '<li><a data-id="new" data-module="workflow" data-value="new" class="entitybox-toggle" id="workflow-create-fast">提交申请</a></li>' +
                '<li><a data-id="new" data-module="mainline" data-value="new" class="" id="mainline-create-fast">添加项目</a></li>' +
                '<li class="divider"></li>' +
                '<li><a data-id="new" data-module="customer" data-value="new" data-target="#customer-name" class="entitybox-toggle" id="customer-create-fast">新建客户</a></li>' +
                '<li><a data-id="0" data-module="contact" data-value="new" class="entitybox-toggle" id="contact-create-fast">新建联系人</a></li>' +
                '<li><a data-id="new" data-target="#title" data-module="record" class="" id="contactRecord-create-fast">客户联系记录</a></li>' +
              '</ul>' +
            '</li>' +
            /*'<li>' +
              '<div class="search-box">' +
                '<input id="searchTop" type="text" class="placeholder-sm" placeholder="全局搜索">' +
                '<a id="searchTopIcon" class="search-btn"><i class="icon-search"></i></a>' +
              '</div>' +
            '</li>' +*/
            '<li id="j_message" class="dropdown dropdown-menu-toggle message-menu j_messageCount">' +
              '<a><i class="fa fa-bell font-size-14"></i><em class="message-count animated bounce  j_point"></em></a>' +
              '<ul id="j_dropMessage" class="dropdown-menu dropdown-menu-right">' +
                '<li><a class="router j_unreadblog" href="/blog/<%=currentUser.id%>/unread"><span class="pull-right badge ml-10"></span>未读日报</a></li>' +
                '<li><a class="router j_newitem" href="/feed/newitem/all"><span class="pull-right badge ml-10"></span>未读事项</a></li>' +
                '<li><a class="router j_newcomment" href="/feed/newcomment/all"><span class="pull-right badge ml-10"></span>事项的新反馈</a></li>' +
                '<li><a class="router j_newfinish" href="/feed/newfinish/all"><span class="pull-right badge ml-10"></span>新完成事项</a></li>' +
                '<li><a class="router j_atme" href="/feed/atme/all"><span class="pull-right badge ml-10"></span>@我的新反馈</a></li>' +
                '<li class="divider"></li>' +
                '<li><a class="router j_wechat" href="/messages/wechat"><span class="pull-right badge ml-10"></span>聊天消息</a></li>' +
                '<li><a class="router j_remind" href="/messages/remind"><span class="pull-right badge ml-10"></span>提醒</a></li>' +
                '<li><a class="router j_follow" href="/messages/follow"><span class="pull-right badge ml-10"></span>关注申请</a></li>' +
                '<li><a class="router j_applyJoin" href="/messages/applyJoin"><span class="pull-right badge ml-10"></span>加入申请</a></li>' +
                '<li><a class="router j_shareJoin" href="/messages/shareJoin"><span class="pull-right badge ml-10"></span>共享申请</a></li>' +
              '</ul>' +
            '</li>' +
            '<li class="dropdown dropdown-menu-toggle">' +
              '<a class="dropdown-toggle"><span class="logo"></span><i class="font-size-16 font-weight-bold">COBRA</i><i class="fa fa-angle-down"></i></a>' +
              '<ul class="dropdown-menu dropdown-menu-right border-dropdown">' +
                '<li><a class="client-toggle">客户端下载</a></li>' +
                '<li class="wechat-toggle"><a>微信号</a>' +
                  '<div class="popover popover-left">' +
                    '<div class="arrow"></div>' +
                    '<div class="popover-content">' +
                      '<strong class="fs-14">微信号</strong>' +
                      '<p class="mb-5">扫描二维码关注我们</p>' +
                      '<img src="/static/img/global/cobra_wechat.png">' +
                    '</div>' +
                  '</div>' +
                '</li>' +
                '<li><a class="invite-toggle" type="modal">邀请同事</a></li>' +
                '<li><a class="j_joinOrCreate">创建或加入团队</a></li>' +
                '<li class="divider"></li>' +
                '<li><a class="router" href="/profile">个人设置</a></li>' +
                '<li><a class="router-fake" href="/organizations/<%=organizationId%>/members/#organization">团队成员设置</a></li>' +
                '<li><a class="router" href="/info">系统设置</a></li>' +
                '<li class="divider"></li>' +
                '<li><a href="http://www.eteams.cn/help" target="_blank" id="help">帮助</a></li>' +
                '<li><a class="advise-toggle">意见反馈</a></li>' +
                '<li><a class="router" href="/versioninfo">系统更新动态</a></li>' +
                '<li><a href="http://www.eteams.cn/product.html" target="_blank">产品介绍</a></li>' +
                '<li><a id="logout">退出系统</a></li>' +
              '</ul>' +
            '</li>' +
          '</ul>' +
        '</div>' +
        '<div class="alert alert-danger notice-overlayer hide" id="module_notice">' +
          '<a class="close">×</a>' +
          '<strong class="mr-5">提示:</strong>' +
          '<span>"您的团队信息还未完善,点击"<a class="router" href="/info">进入完善信息</a>"页面"</span>' +
        '</div>' +
      '</header>' +
      '<div id="cloneDiv" class="hide">' +
        '<li class="user-item j_clickhide j_userItems">' +
          '<a class="pull-left router"><img class="avatar"><em class="ellipsis"></em></a>' +
        '</li>' +
        '<a title="微信" class="j_userItemsWechat pull-right wechat-toggle icon-comments"></a>' +
      '</div>',
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
      '<aside class="aside">' +
        '<div class="scrollwrapper aside-nav-scroll">' +
          '<ul class="aside-nav nav nav-list">' +
            '<li class="j_mine"><a class="link-item router" href="/workreport">我的报告</a></li>' +
            '<li class="j_share "><a class="link-item router" href="/workreport/share">共享我的</a></li>' +
            '<li class="j_replay "><a class="link-item router" href="/workreport/replay">回复我的<span class="pull-right j_replayCount"></span></a></li>' +
            '<li class="j_comment "><a class="link-item router" href="/workreport/comment">评论我的<span class="pull-right j_commentCount"></span></a></li>' +
            '<li class="j_unread "><a class="link-item router" href="/workreport/unread">未读报告<span class="pull-right j_unreadCount"></span></a></li>' +
            '<li class="j_statistics"><a class="link-item router" href="/workreport/statistics">报告统计</a></li>' +
          '</ul>' +
        '</div>' +
      '</aside>' +
      '<div class="main">' +
        '<div class="reports-panel container-fluid p-t-15" id="yearPanel">' +
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
    'component.filter': '' +
      '<div id="filter-div" class="clearfix">' +
        '<div class="loading_large"></div>' +
        '<div id="info-div" class="hide">' +
          '<div class="filter-group">' +
            '<div id="employee-title" class="filter-title">' +
              '<span class="filter-label hide" id="employee-type-task">负责人或创建人</span>' +
              '<span class="filter-label hide" id="employee-type-blog">我关注的人及下属</span>' +
              '<span class="filter-label hide" id="employee-type-document">负责人或创建人</span>' +
              '<span class="filter-label hide" id="employee-type-customer">负责人或创建人</span>' +
              '<span class="filter-label hide" id="employee-type-mainline">负责人或创建人</span>' +
              '<span class="filter-label hide" id="employee-type-workflow">申请人</span>' +
              '<span class="filter-label hide" id="employee-type-tag">创建人</span>' +
              '<span class="filter-label hide" id="employee-type-formdatareport">上报收集人</span>' +
              '<span class="filter-input">' +
                '<input placeholder="搜索人员" data-entity="employee" class="typehead form-control" name="username">' +
              '</span>' +
            '</div>' +
            '<div class="filter-content" id="employee-filter"></div>' +
          '</div>' +
          '<div class="filter-group">' +
            '<div id="due-time" class="filter-title hide">' +
              '<span class="filter-label">到期日</span>' +
            '</div>' +
            '<div id="due-time-filter" class="filter-content due-time-div">' +
              '<span>从</span>' +
              '<input id="due-time-begin"' +
                'type="text" v-name="date"' +
                'insertAfter="true"' +
                'dateGroup="true"' +
                'format="yyyy-mm-dd"' +
                'maxView="decade"' +
                'minView="month"' +
                'class="datepicker form-control"' +
                'name="taskGtDate">' +
              '<span>至</span>' +
              '<input id="due-time-end" type="text" v-name="date" insertAfter="true" dategroup="true" format="yyyy-mm-dd"' +
                'maxView="decade" minView="month" class="datepicker form-control" name="taskLtDate">' +
            '</div>' +
          '</div>' +
          '<div class="filter-group">' +
            '<div id="comment" class="filter-title comment-div">' +
              '<span id="comment-type-task" class="filter-label hide">反馈时间</span>' +
              '<span id="comment-type-document" class="filter-label hide">文档类型</span>' +
              '<span id="comment-type-customer" class="filter-label hide">反馈时间</span>' +
              '<span id="comment-type-workflow" class="filter-label hide">表单</span>' +
            '</div>' +
            '<div id="comment-filter-customer" class="filter-content hide">' +
              '<span id="one-mounth-no" class="filter-item">' +
                '<a data-entity="one_mounth_no" class="comment-click">一个月内未联系的客户</a>' +
              '</span>' +
              '<span id="one-weak-no" class="filter-item">' +
                '<a data-entity="one_weak_no" class="comment-click">一周未联系的客户</a>' +
              '</span>' +
              '<span id="3day-no" class="filter-item">' +
                '<a data-entity="three_day_no" class="comment-click">3天未联系的客户</a>' +
              '</span>' +
              '<span id="1day-no" class="filter-item">' +
                '<a data-entity="one_day_no" class="comment-click">1天未联系的客户</a>' +
              '</span>' +
              '<span id="none" class="filter-item">' +
                '<a data-entity="none" class="comment-click">无联系的客户</a>' +
              '</span>' +
              '<span id="one_weak_yes" class="filter-item">' +
                '<a data-entity="one_weak_yes" class="comment-click">本周内联系的客户</a>' +
              '</span>' +
              '<span id="one-mounth-yes" class="filter-item">' +
                '<a data-entity="one_mounth_yes" class="comment-click">本月内联系的客户</a>' +
              '</span>' +
            '</div>' +
            '<div id="comment-filter-task" class="filter-content hide">' +
              '<span id="one-mounth-no" class="filter-item">' +
                '<a data-entity="one_mounth_no" class="comment-click">一个月内未反馈的任务</a>' +
              '</span>' +
              '<span id="one-weak-no" class="filter-item">' +
                '<a data-entity="one_weak_no" class="comment-click">一周未反馈的任务</a>' +
              '</span>' +
              '<span id="three_day-no" class="filter-item">' +
                '<a data-entity="three_day_no" class="comment-click">3天未反馈的任务</a>' +
              '</span>' +
              '<span id="one_day-no" class="filter-item">' +
                '<a data-entity="one_day_no" class="comment-click">1天未反馈的任务</a>' +
              '</span>' +
              '<span id="none" class="filter-item">' +
                '<a data-entity="none" class="comment-click">无反馈的任务</a>' +
              '</span>' +
              '<span id="one_weak_yes" class="filter-item">' +
                '<a data-entity="one_weak_yes" class="comment-click">本周内反馈的任务</a>' +
              '</span>' +
              '<span id="one-mounth-yes" class="filter-item">' +
                '<a data-entity="one_mounth_yes" class="comment-click">本月内反馈的任务</a>' +
              '</span>' +
            '</div>' +
            '<div id="comment-filter-document" class="filter-content hide">' +
              '<span id="html" class="filter-item">' +
                '<a data-entity="html" class="comment-click">html文档</a>' +
              '</span>' +
              '<span id="office" class="filter-item">' +
                '<a data-entity="office" class="comment-click">Office文档</a>' +
              '</span>' +
              '<span id="text" class="filter-item">' +
                '<a data-entity="text" class="comment-click">文本文档</a>' +
              '</span>' +
              '<span id="pdf" class="filter-item">' +
                '<a data-entity="pdf" class="comment-click">PDF文档</a>' +
              '</span>' +
              '<span id="image" class="filter-item">' +
                '<a data-entity="image" class="comment-click">图片文件</a>' +
              '</span>' +
              '<span id="audio" class="filter-item">' +
                '<a data-entity="audio" class="comment-click">音频文件</a>' +
              '</span>' +
              '<span id="video" class="filter-item">' +
                '<a data-entity="video" class="comment-click">视频文件</a>' +
              '</span>' +
              '<span id="other" class="filter-item">' +
                '<a data-entity="other" class="comment-click">其他类型文件</a>' +
              '</span>' +
            '</div>' +
            '<div id="comment-filter-workflow" class="filter-content hide"></div>' +
          '</div>' +
          '<div class="filter-group">' +
            '<div id="mainline" class="filter-title mainline-div">' +
              '<span class="filter-label">项目</span>' +
              '<span class="filter-input">' +
                '<input name="mainline" class="typehead form-control" data-entity="mainline" placeholder="搜索项目">' +
              '</span>' +
            '</div>' +
            '<div id="mainline-filter" class="filter-content mainline-div"></div>' +
          '</div>' +
          '<div class="filter-group">' +
            '<div id="tag" class="filter-title tag-div">' +
              '<span class="filter-label">标签</span>' +
              '<span class="filter-input">' +
                '<input name="tag" class="typehead form-control" data-entity="tag" placeholder="搜索标签">' +
              '</span>' +
            '</div>' +
            '<div id="tag-filter" class="filter-content tag-div"></div>' +
          '</div>' +
          '<div class="filter-group">' +
            '<div id="formstatus" class="filter-title formstatus-div hide">' +
              '<span class="filter-label">表单状态</span>' +
            '</div>' +
            '<div id="formstatus-filter" class="filter-content formstatus-div hide">' +
              '<span class="filter-item">' +
                '<a data-entity="enable" class="comment-click">收集中</a>' +
              '</span>' +
              '<span class="filter-item">' +
                '<a data-entity="disable" class="comment-click">未发布</a>' +
              '</span>' +
            '</div>' +
          '</div>' +
          '<div class="filter-group">' +
            '<div id="relatedstatus" class="filter-title relatedstatus-div hide">' +
              '<span class="filter-label">关联审批</span>' +
            '</div>' +
            '<div id="relatedstatus-filter" class="filter-content relatedstatus-div hide">' +
              '<span class="filter-item">' +
                '<a data-entity="true" class="comment-click">已关联</a>' +
              '</span>' +
              '<span class="filter-item">' +
                '<a data-entity="false" class="comment-click">未关联</a>' +
              '</span>' +
            '</div>' +
          '</div>' +
          '<div class="filter-group">' +
            '<div class="filter-title hide datareport-div">' +
              '<span class="filter-label">上报时间</span>' +
            '</div>' +
            '<div class="filter-content hide datareport-div due-time-div">' +
              '<span>从</span>' +
              '<input id="report-time-begin"' +
                 'type="text" v-name="date"' +
                 'insertAfter="true"' +
                 'dateGroup="true"' +
                 'format="yyyy-mm-dd"' +
                 'maxView="decade"' +
                 'minView="month"' +
                 'class="datepicker form-control"' +
                 'name="reportGtDate">' +
              '<span>至</span>' +
              '<input id="report-time-end" type="text" v-name="date" insertAfter="true" dategroup="true" format="yyyy-mm-dd"' +
                'maxView="decade" minView="month" class="datepicker form-control" name="reportLtDate">' +
            '</div>' +
          '</div>' +
          '<div class="filter-group">' +
            '<div id="employee-title" class="filter-title datareport-div hide">' +
              '<span class="filter-label" id="employee-type-task">上报表单</span>' +
              '<span class="filter-input hide">' +
                '<input placeholder="上报表单" data-entity="datareport" class="typehead" name="name">' +
              '</span>' +
            '</div>' +
            '<div class="filter-content datareport-div hide" id="datareport-form-list"></div>' +
          '</div>' +
          '<div id="btns" class="filter-btns clearfix">' +
            '<a class="btn filter-submit btn-sm fr mr-8 hide">确定</a>' +
            '<a class="btn filter-cancle btn-sm btn-info fr">重置</a>' +
          '</div>' +
        '</div>' +
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
      '<%}%>',
    "task.taskpage": '' +
      '<aside class="aside">' +
        '<div class="scrollwrapper aside-nav-scroll">' +
          '<ul class="aside-nav nav nav-list">' +
            '<li class="nav-header">任务</li>' +
              '<ul class="sub-nav nav nav-list" id="tasknav">' +
                '<li class="j_mine" data-title="的任务" data-type="mine">' +
                  '<a class="link-item router" href="/tasks/<%=userId%>/mine">' +
                    '<span class="j_type-name">我的任务</span>' +
                  '</a>' +
                '</li>' +
                '<li class="j_watched" data-title="关注的任务" data-type="watched">' +
                  '<a class="link-item router" href="/tasks/<%=userId%>/watched">' +
                    '<span class="j_type-name">关注的任务</span>' +
                  '</a>' +
                '</li>' +
                '<li class="j_subordinates" data-title="下属的任务" data-type="subordinates">' +
                  '<a class="link-item router" href="/tasks/<%=userId%>/subordinates">' +
                    '<span class="j_type-name">下属任务</span>' +
                  '</a>' +
                '</li>' +
                '<li class="j_shareToMe" data-title="共享给我的任务" data-type="shareToMe">' +
                  '<a class="link-item router" href="/tasks/<%=userId%>/shareToMe">' +
                    '<span class="j_type-name">共享给我的任务</span>' +
                  '</a>' +
                '</li>' +
                '<li class="j_mineCreate" data-title="创建的任务" data-type="mineCreate">' +
                  '<a class="link-item router" href="/tasks/<%=userId%>/mineCreate">' +
                    '<span class="j_type-name">创建的任务</span>' +
                  '</a>' +
                '</li>' +
                '<li class="j_finished" data-title="已完成的任务" data-type="finished">' +
                  '<a class="link-item router" href="/tasks/<%=userId%>/finished">' +
                    '<span class="j_type-name">已完成的任务</span>' +
                  '</a>' +
                '</li>' +
                '<li class="j_all" data-title="的全部任务" data-type="all">' +
                  '<a class="link-item router" href="/tasks/<%=userId%>/all">' +
                    '<span class="j_type-name">全部任务</span>' +
                  '</a>' +
                '</li>' +
              '</ul>' +
            '<li class="j_feedback" data-type="feedback">' +
              '<a class="link-item router" href="/tasks/<%=userId%>/feedback"><i class="item-icon icon-chat-3"></i>任务评论及反馈</a>' +
            '</li>' +
            '<li class="j_taskstatistics" data-type="taskstatistics">' +
              '<a class="link-item router" href="/tasks/<%=userId%>/taskstatistics"><i class="item-icon icon-stats"></i>任务统计报表</a>' +
            '</li>' +
            '<li class="j_taskreport" data-type="taskreport">' +
              '<a class="link-item router" href="/tasks/<%=userId%>/taskreport"><i class="item-icon icon-stats"></i>任务完成情况</a>' +
            '</li>' +
            '<% if(isAdmin) { %>' +
            '<li class="j_taskform" data-type="taskform">' +
              '<a class="link-item router" href="/tasks/<%=userId%>/taskform"><i class="item-icon icon-th-large"></i>自定义字段管理</a>' +
            '</li>' +
            '<% } %>' +
            '<li class="j_recylce" data-type="recylce">' +
              '<a class="link-item router" href="/tasks/<%=userId%>/recylce"><i class="item-icon icon-trash"></i>回收站</a>' +
            '</li>' +
          '</ul>' +
        '</div>' +
      '</aside>' +
      '<div class="main" id="j_taskcenter"></div>',
    "task.mytask": '' +
      '<div class="j_mainscroll mCus-mh100 scrollwrapper">' +
        '<div class="main-hd">' +
          '<ul class="toolkit-list">' +
            '<li class="toolkit-item toolkit-item-sn"><i class="icon-checkbox-unchecked j_check-all"></i></li>' +
            '<li id="view-taskType" class="toolkit-item hide">' +
              '<div class="j_mineType btn-group dropdown dropdown-menu-toggle">' +
                '<a id="task-taskType" class="btn btn-sm dropdown-toggle">分类 <i class="icon-caret-down"></i></a>' +
                '<ul class="dropdown-menu border-dropdown">' +
                  '<li data-entity="mine" class="active"><a>全部</a></li>' +
                  '<li data-entity="mineManager" title="负责的任务"><a>负责的任务</a></li>' +
                  '<li data-entity="mineParticipants" title="参与的任务"><a>参与的任务</a></li>' +
                '</ul>' +
              '</div>' +
            '</li>' +
            '<li id="view-state-toggle" class="toolkit-item">' +
              '<div class="btn-group dropdown dropdown-menu-toggle">' +
                '<a class="btn btn-sm dropdown-toggle">视图<i class="icon-caret-down"></i></a>' +
                '<ul id="view-state" class="dropdown-menu border-dropdown">' +
                  '<li data-value="list"><a>列表视图</a></li>' +
                  '<li data-value="dueDate"><a>到期日视图</a></li>' +
                  '<li data-value="beginDate"><a>起始日视图</a></li>' +
                '</ul>' +
              '</div>' +
            '</li>' +
            '<li class="toolkit-item">' +
              '<a class="tasks-calendar btn btn-sm j_timeview hide router" href="/tasks/<%=userId%>/calendar">时间视图</a>' +
            '</li>' +
            '<li class="toolkit-item">' +
              '<div class="btn-group dropdown dropdown-menu-toggle">' +
                '<a id="task-order" class="btn btn-sm dropdown-toggle">排序<i class="icon-caret-down"></i></a>' +
                '<ul class="dropdown-menu border-dropdown">' +
                  '<li><a data-entity="default" class="orderType" data-direction="DESC">默认</a></li>' +
                  '<li><a class="orderType" data-entity="last_comment_time" data-direction="DESC">按反馈时间</a></li>' +
                  '<li><a class="orderType" data-entity="last_update_time" data-direction="DESC">按任务更新时间</a></li>' +
                  '<li><a class="orderType" data-entity="create_time" data-direction="DESC">按任务创建时间(最新)</a></li>' +
                  '<li><a class="orderType" data-entity="create_time" data-direction="ASC">按任务创建时间(最早)</a></li>' +
                  '<li><a class="orderType" data-entity="due_date" data-direction="DESC">按任务到期时间(最新)</a></li>' +
                  '<li><a class="orderType" data-entity="due_date" data-direction="ASC">按任务到期时间(最早)</a></li>' +
                  '<li><a class="orderType" data-entity="manager" data-direction="ASC">按负责人</a></li>' +
                  '<li><a class="orderType" data-entity="priority" data-direction="DESC">按紧急程度</a></li>' +
                '</ul>' +
              '</div>' +
            '</li>' +
            '<li class="toolkit-item">' +
              '<div class="btn-group dropdown" id="task-filter" data-toggle="#task-filter-dropdown">' +
                '<a class="btn btn-sm dropdown-toggle">筛选 <i class="icon-caret-down"></i></a>' +
                '<div class="dropdown-filter border-dropdown dropdown-div">' +
                  '<div id="task-filter-dropdown"></div>' +
                '</div>' +
              '</div>' +
            '</li>' +
            '<li class="toolkit-item search">' +
              '<input class="form-control" type="text" placeholder="搜索" id="tasksearch-keywords">' +
              '<i class="icon-search" title="搜索"></i>' +
            '</li>' +
            '<li class="toolkit-item pull-right m-r-0">' +
              '<a class="btn btn-success btn-sm j_entityslider-toggle" data-module="task" data-id="today" id="newTask">' +
                '<i class="icon-plus-thin glyphicon"></i>安排任务' +
              '</a>' +
            '</li>' +
          '</ul>' +
        '</div>' +
        '<div class="main-hd main-hd-fixed j_batchEl hide">' +
          '<ul class="toolkit-list">' +
            '<li class="toolkit-item toolkit-item-sn"><i class="icon-checkbox-unchecked j_check-all"></i></li>' +
            '<li class="toolkit-item"><a class="task-watchs btn btn-sm">批量关注</a></li>' +
            '<li class="toolkit-item"><a class="task-reminds btn btn-sm">批量催办</a></li>' +
            '<li class="toolkit-item"><a class="task-share btn btn-sm" data-entity="employee" data-multi="true">批量共享</a></li>' +
            '<li class="toolkit-item"><a class="task-finished btn btn-sm">批量完成</a></li>' +
            '<li class="toolkit-item pull-right m-r-0">' +
              '<a class="btn btn-success btn-sm j_entityslider-toggle" data-module="task" data-id="today" id="newTask">' +
                '<i class="icon-plus-thin glyphicon"></i>安排任务' +
              '</a>' +
            '</li>' +
          '</ul>' +
        '</div>' +
        '<div class="main-bd sidebar-in j_sidebarPren">' +
          '<div class="table-tray scrollwrapper">' +
            '<div class="tray-cell main-content j_center" id="mytask-container">' +
              '<div class="task-creater">' +
                '<input id="qcreatetask" class="placeholder-italic" placeholder="提交新任务，直接@任务责任人，Ctrl+Enter快速新建">' +
                '<a class="addbtn j_qcreatetask"><i class="icon-plus-thin"></i></a>' +
              '</div>' +
              '<div class="j_due group-view e-list-group delay">' +
                '<div class="e-list-head">' +
                  '<a class="e-list-title group-switch" title="折叠" data-status="on">' +
                    '<strong>已经延期<i class="j_count"></i></strong><i class="icon-angle-right "></i>' +
                  '</a>' +
                '</div>' +
                '<ul class="e-list task-list" group="dueDate/delay"></ul>' +
              '</div>' +
              '<div class="j_due group-view e-list-group today">' +
                '<div class="e-list-head">' +
                  '<a class="group-add pull-right" title="安排任务" data-toggle="tooltip" data-placement="top"><i class="icon-plus"></i></a>' +
                  '<a class="e-list-title group-switch" title="折叠" data-status="on">' +
                    '<strong>今天到期<i class="j_count"></i></strong><i class="icon-angle-right "></i>' +
                  '</a>' +
                '</div>' +
                '<ul class="e-list task-list" group="dueDate/today">' +
                  '<li class="notask">还没有今天到期的任务，点击这里或右边的“<b class="group-add">+</b>”新建一条任务</li>' +
                '</ul>' +
              '</div>' +
              '<div class="j_due group-view e-list-group tomorrow">' +
                '<div class="e-list-head">' +
                  '<a class="group-add pull-right" title="安排任务" data-toggle="tooltip" data-placement="top"><i class="icon-plus"></i></a>' +
                  '<a class="e-list-title group-switch" title="折叠" data-status="on">' +
                    '<strong>明天到期<i class="j_count"></i></strong><i class="icon-angle-right "></i>' +
                  '</a>' +
                '</div>' +
                '<ul class="e-list task-list" group="dueDate/tomorrow">' +
                  '<li class="notask">还没有明天到期的任务，点击这里或右边的“<b class="group-add">+</b>”新建一条任务</li>' +
                '</ul>' +
              '</div>' +
              '<div class="j_due group-view e-list-group future">' +
                '<div class="e-list-head">' +
                  '<a class="group-add pull-right" title="安排任务" data-toggle="tooltip" data-placement="top"><i class="icon-plus"></i></a>' +
                  '<a class="e-list-title group-switch" title="折叠" data-status="on">' +
                    '<strong>即将到期<i class="j_count"></i></strong><i class="icon-angle-right "></i>' +
                  '</a>' +
                '</div>' +
                '<ul class="e-list task-list" group="dueDate/future"></ul>' +
              '</div>' +
              '<div class="j_due group-view e-list-group memo">' +
                '<div class="e-list-head">' +
                  '<a class="group-add pull-right" title="安排任务" data-toggle="tooltip" data-placement="top"><i class="icon-plus"></i></a>' +
                  '<a class="e-list-title group-switch" title="折叠" data-status="on">' +
                    '<strong>无到期日<i class="j_count"></i></strong><i class="icon-angle-right "></i>' +
                  '</a>' +
                '</div>' +
                '<ul class="e-list task-list" group="dueDate/memo"></ul>' +
              '</div>' +
              '<div class="j_begin group-view e-list-group past">' +
                '<div class="e-list-head">' +
                  '<a class="group-add pull-right" title="安排任务" data-toggle="tooltip" data-placement="top"><i class="icon-plus"></i></a>' +
                  '<a class="e-list-title group-switch" title="折叠" data-status="on">' +
                    '<strong>已经开始<i class="j_count"></i></strong><i class="icon-angle-right "></i>' +
                  '</a>' +
                '</div>' +
                '<ul class="e-list task-list" group="beginDate/past"></ul>' +
              '</div>' +
              '<div class="j_begin group-view e-list-group today">' +
                '<div class="e-list-head">' +
                  '<a class="group-add pull-right" title="安排任务" data-toggle="tooltip" data-placement="top"><i class="icon-plus"></i></a>' +
                  '<a class="e-list-title group-switch" title="折叠" data-status="on">' +
                    '<strong>今天开始<i class="j_count"></i></strong><i class="icon-angle-right "></i>' +
                  '</a>' +
                '</div>' +
                '<ul class="e-list task-list" group="beginDate/today">' +
                  '<li class="notask">还没有今天开始的任务，点击这里或右边的“<b class="group-add">+</b>”新建一条任务</li>' +
                '</ul>' +
              '</div>' +
              '<div class="j_begin group-view e-list-group tomorrow">' +
                '<div class="e-list-head">' +
                  '<a class="group-add pull-right" title="安排任务" data-toggle="tooltip" data-placement="top"><i class="icon-plus"></i></a>' +
                  '<a class="e-list-title group-switch" title="折叠" data-status="on">' +
                    '<strong>明天开始<i class="j_count"></i></strong><i class="icon-angle-right "></i>' +
                  '</a>' +
                '</div>' +
                '<ul class="e-list task-list" group="beginDate/tomorrow">' +
                  '<li class="notask">还没有明天开始的任务，点击这里或右边的“<b class="group-add">+</b>”新建一条任务</li>' +
                '</ul>' +
              '</div>' +
              '<div class="j_begin group-view e-list-group future">' +
                '<div class="e-list-head">' +
                  '<a class="group-add pull-right" title="安排任务" data-toggle="tooltip" data-placement="top"><i class="icon-plus"></i></a>' +
                  '<a class="e-list-title group-switch" title="折叠" data-status="on">' +
                    '<strong>即将开始<i class="j_count"></i></strong><i class="icon-angle-right "></i>' +
                  '</a>' +
                '</div>' +
                '<ul class="e-list task-list" group="beginDate/future"></ul>' +
              '</div>' +
              '<div class="j_begin group-view e-list-group memo">' +
                '<div class="e-list-head">' +
                  '<a class="group-add pull-right" title="安排任务" data-toggle="tooltip" data-placement="top"><i class="icon-plus"></i></a>' +
                  '<a class="e-list-title group-switch" title="折叠" data-status="on">' +
                    '<strong>无起始日<i class="j_count"></i></strong><i class="icon-angle-right "></i>' +
                  '</a>' +
                '</div>' +
                '<ul class="e-list task-list" group="beginDate/memo"></ul>' +
              '</div>' +
              '<div class="all-type-view e-list-group all-type hide">' +
                '<ul id="all-type-list" class="e-list center-list task-list hide" group="all-type"></ul>' +
                '<div class="hide no-result j_fast-create">没有任务</div>' +
                '<div class="hide no-result j_no-result-tip">没有任务</div>' +
                '<div class="hide common-more j_moretask">加载更多<i class="icon-angle-down"></i></div>' +
                '<div class="hide common-nodata j_nodata">已加载所有任务</div>' +
              '</div>' +
              '<div id="mytask-loading" class="loading_small"><span>正在加载数据，请稍后...</span></div>' +
            '</div>' +
            '<div class="tray-cell main-sidebar j_rightView" id="mytask-right"></div>' +
          '</div>' +
        '</div>' +
        '<div class="hide">' +
          '<li id="taskClone" class="task">' +
            '<span class="sn"></span>' +
            '<span class="checkbox"><i class="icon-checkbox-unchecked"></i></span>' +
            '<span class="e-list-loading"></span>' +
            '<div class="title j_entityslider-toggle">' +
              '<div class="text"></div>' +
              '<span class="importance hide"></span>' +
            '</div>' +
            '<div class="right">' +
              '<span class="comment-count"></span>' +
              '<span class="user ellipsis"></span>' +
              '<span class="date"></span>' +
            '</div>' +
            '<div class="shortcut hide">' +
              '<span class="watch"><i class="icon-favourite"></i>&nbsp;关注</span>' +
              '<span class="finish"><i class="icon-todo"></i>&nbsp;标记未完成</span>' +
              '<span class="share selector-toggle" data-entity="employee" data-multi="true" targetId=""><i class="icon-share"></i>&nbsp;共享</span>' +
            '</div>' +
          '</li>' +
        '</div>' +
      '</div>'

  };
}(app));
