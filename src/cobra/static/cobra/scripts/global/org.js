(function (window, app, Backbone, jQuery, _, moment) {
  "use strict";

  var $ = jQuery;

  app.org = {};

  app.org.TreeModel = Backbone.Model.extend({
    initialize: function(data) {
      this.baseUrl = app.config.urlPrefix + '/organizations/' + app.config.organizationId + '/ajax/';
    },
    loadData: function(f, d) {
      $.ajax({
        url: this.baseUrl + "departments.json",
        type: "get",
        dataType: "json",
        data: {
          id: d,
          hasUrl: this.hasUrl
        },
        success: function(c) {
          f && f(c)
        }
      })
    },
    deleteDepart: function(f, d, c) {
      $.ajax({
        url: "/base/department/delete.json",
        type: "post",
        dataType: "json",
        data: {
          "department.id": f,
          "department.parent": d
        },
        success: function(b) {
          c && c(b)
        }
      })
    }
  });

  app.org.DepartmentModel = Backbone.Model.extend({
    initialize: function(data) {
      this.baseUrl = app.config.urlPrefix + '/organizations/' + app.config.organizationId + '/ajax/';
    },
    saveDepartment: function(f, d) {
      $.ajax({
        url: "/base/department.json",
        type: "post",
        dataType: "json",
        data: f,
        success: function(c) {
          d && d(c)
        }
      })
    },
    saveDepartmentProperty: function(f, d) {
      $.ajax({
        url: "/base/department/saveProperty.json",
        type: "post",
        dataType: "json",
        data: f,
        success: function(c) {
          d && d(c)
        }
      })
    },
    getById: function(f, d) {
      $.ajax({
        type: "get",
        url: this.baseUrl + "department/" + f + ".json",
        dataType: "json",
        data: "",
        success: function(c) {
          d && d(c)
        }
      })
    }
  });

  app.org.GroupModel = Backbone.Model.extend({
    loadData: function(f, d) {
      $.ajax({
        url: "/group/group.json",
        type: "post",
        dataType: "json",
        data: {
          employeeId: f
        },
        success: function(c) {
          d && d(c)
        }
      })
    },
    deleteGroup: function(f, d) {
      $.ajax({
        url: "/group/delete.json",
        type: "post",
        dataType: "json",
        data: {
          id: f
        },
        success: function(c) {
          d && d(c)
        }
      })
    },
    saveGroup: function(f, d) {
      $.ajax({
        url: "/group.json",
        type: "post",
        dataType: "json",
        data: f,
        success: function(c) {
          d && d(c)
        }
      })
    },
    saveGroupAddEmployee: function(f, d) {
      $.ajax({
        url: "/group/addGroupAddEmployee.json",
        type: "post",
        dataType: "json",
        data: f,
        success: function(c) {
          d && d(c)
        }
      })
    },
    addGroupUser: function(f, d, c) {
      var b = {};
      b.id = f;
      b.employeeId = d;
      $.ajax({
        url: "/group/addUser.json",
        type: "post",
        dataType: "json",
        data: b,
        success: function(a) {
          c && c(a)
        }
      })
    },
    addGroupUsers: function(f, d, c) {
      var b = {};
      b.id = f;
      b.ids = d;
      $.ajax({
        url: "/group/addUsers.json",
        type: "post",
        dataType: "json",
        data: b,
        success: function(a) {
          c && c(a)
        }
      })
    },
    deleteGroupUsers: function(f, d, c) {
      var b = {};
      b.id = f;
      b.ids = d;
      $.ajax({
        url: "/group/deleteUsers.json",
        type: "post",
        dataType: "json",
        data: b,
        success: function(a) {
          c && c(a)
        }
      })
    },
    deleteGroupUser: function(f, d, c) {
      var b = {};
      b.id = f;
      b.employeeId = d;
      $.ajax({
        url: "/group/deleteUser.json",
        type: "post",
        dataType: "json",
        data: b,
        success: function(a) {
          c && c(a)
        }
      })
    },
    saveGroupProperty: function(f, d) {
      $.ajax({
        url: "/group/saveProperty.json",
        type: "post",
        dataType: "json",
        data: f,
        success: function(c) {
          d && d(c)
        }
      })
    }
  });

  app.org.UserModel = Backbone.Model.extend({
    id: "",
    pageSize: 500,
    pageNo: 0,
    groupId: "",
    isGroupEdit: 0,
    employee: {
      department: 1,
      status: "normal"
    },
    queryEmp: function(f) {
      var d = {};
      d["employee.department"] = this.employee.department;
      d["employee.status"] = this.employee.status;
      d["employee.username"] = this.employee.username;
      d["employee.email"] = this.employee.email;
      d["employee.index"] = this.employee.index;
      d.isContainsSub = this.isContainsSub;
      d.pageNo = this.pageNo;
      d.pageSize = this.pageSize;
      d.groupId = this.groupId;
      $.ajax({
        url: "/base/employee/pageQuery.json",
        type: "post",
        dataType: "json",
        data: d,
        success: function(c) {
          f && f(c)
        }
      })
    },
    queryGroupEmp: function(f) {
      var d = {};
      d["employee.status"] = this.employee.status;
      d["employee.index"] = this.employee.index;
      d.isContainsSub = this.isContainsSub;
      d.pageNo = this.pageNo;
      d.pageSize = this.pageSize;
      d.groupId = this.groupId;
      d.isGroupEdit = this.isGroupEdit;
      $.ajax({
        url: "/base/employee/queryGroupEmp.json",
        type: "post",
        dataType: "json",
        data: d,
        success: function(c) {
          f && f(c)
        }
      })
    },
    saveEmployee: function(f, d) {
      $.ajax({
        url: "/base/employee/save.json",
        type: "post",
        dataType: "json",
        data: f,
        beforeSend: function() {},
        success: function(c) {
          d && d(c)
        }
      })
    },
    saveEmployees: function(f, d) {
      $.ajax({
        contentType: "application/json;charset=UTF-8",
        url: "/base/employee/saves.json",
        type: "post",
        dataType: "json",
        data: f,
        success: function(c) {
          d && d(c)
        }
      })
    },
    findPinyinIndexs: function(f) {
      var d = {};
      d["employee.department"] = this.employee.department;
      d["employee.status"] = this.employee.status;
      d.isContainsSub = this.isContainsSub;
      $.ajax({
        type: "get",
        url: "/base/employee/findPinyinIndexs.json",
        dataType: "json",
        data: d,
        success: function(c) {
          f && f(c)
        }
      })
    },
    findGroupPinyinIndexs: function(f) {
      var d = {};
      d["employee.status"] = this.employee.status;
      d.groupId = this.groupId;
      $.ajax({
        type: "get",
        url: "/base/employee/findGroupPinyinIndexs.json",
        dataType: "json",
        data: d,
        success: function(c) {
          f && f(c)
        }
      })
    },
    getServiceAccount: function(f) {
      $.ajax({
        type: "get",
        url: "/users/getServiceAccount.json",
        dataType: "json",
        success: function(d) {
          f && f(d)
        }
      })
    },
    getById: function(f, d) {
      $.ajax({
        type: "get",
        url: "/group/" + f + ".json",
        dataType: "json",
        data: "",
        success: function(c) {
          d && d(c)
        }
      })
    }
  });

  app.org.FollowModel = Backbone.Model.extend({
    loadMyFollow: function(f, d, c) {
      $.ajax({
        type: "get",
        url: "/users/myfollow/" + f + ".json",
        dataType: "json",
        data: d,
        success: function(b) {
          c && c(b)
        }
      })
    },
    loadMyFans: function(f, d, c) {
      $.ajax({
        type: "post",
        url: "/users/myfans/" + f + ".json",
        dataType: "json",
        data: d,
        success: function(b) {
          c && c(b)
        }
      })
    },
    loadMySubordinate: function(f, d, c) {
      $.ajax({
        type: "get",
        url: "/users/subordinate/" + f + ".json",
        dataType: "json",
        data: d,
        success: function(b) {
          c && c(b)
        }
      })
    },
    loadMyDirectSubordinates: function(f, d, c) {
      $.ajax({
        type: "get",
        url: "/users/myDirectSubordinates/" + f + ".json",
        dataType: "json",
        data: d,
        success: function(b) {
          c && c(b)
        }
      })
    },
    loadMyIndirectSubordinates: function(f, d, c) {
      $.ajax({
        type: "get",
        url: "/users/myIndirectSubordinates/" + f + ".json",
        dataType: "json",
        data: d,
        success: function(b) {
          c && c(b)
        }
      })
    },
    unfollow: function(f, d, c) {
      $.ajax({
        type: "post",
        url: "/users/unfollow/" + f + "/" + d + ".json",
        dataType: "json",
        success: function(b) {
          c && c(b)
        }
      })
    },
    cancelMyFans: function(f, d, c) {
      $.ajax({
        type: "post",
        url: "/users/cancelMyFans/" + f + "/" + d + ".json",
        dataType: "json",
        success: function(b) {
          c && c(b)
        }
      })
    },
    follow: function(f, d, c) {
      $.ajax({
        type: "post",
        url: "/users/follow/" + f + "/" + d + ".json",
        dataType: "json",
        success: function(b) {
          var a = b.relation;
          c && c(a, b.user)
        }
      })
    }
  });

  app.org.InvitationView = Backbone.View.extend({
    initialize: function(b) {
      this.container = b.container || "body";
      this.model = new app.components.inviteModel();
      this.el = this.container;
      $(this.el).append(app.utils.template("org.invitation"));
      ZeroClipboard.config({
        swfPath: "/static/swf/clipboard.swf"
      })
    },
    delegateEvents: function() {
      var b = this;
      $("body").on("click.userView", ".goto-top",
      function(a) {
        f.gotoTop("#invitelistCon")
      });
      $(b.el).on("click.invitationView", ".invitation-more",
      function(a) {
        b.loadInvitations()
      });
      $(b.el).on("click.invitationView", ".j_invite_send",
      function(a) {
        a = $(this).parents("li");
        var e = a.attr("id");
        b.model.sendInvite(e,
        function(a) {
          f.notify(a.message)
        });
        b.initClipboard(a.find(".dept a.j_invite_send"))
      });
      $(b.el).on("click.invitationView", ".j_invite_copy",
      function(a) {
        a = $(this);
        b.initClipboard(a)
      });
      $(b.el).on("click.invitationView", ".j_invite_delete",
      function(a) {
        var e = $(this).parents("li"),
        c = e.attr("id");
        f.confirm("\u4f60\u786e\u5b9a\u8981\u5220\u9664\u6b64\u9080\u8bf7\u4fe1\u606f\u5417\uff1f",
        function(a) {
          a && b.model.delInvite(c,
          function(a) {
            a.id || e.remove();
            f.notify(a.message)
          })
        })
      });
      $(b.el).on("mouseenter.invitationView", ".users-list li",
      function(a) {
        $(this).find(".follow-btns")
      }).on("mouseleave.invitationView", ".users-list li",
      function(a) {
        $(this).find(".follow-btns")
      })
    },
    render: function() {
      var b = this;
      this.loadInvitations();
      b.inviteView = new c({
        container: "#dept-user-invite",
        type: "inline",
        callback: function(a) {
          b.loadInviteInfo(a, "prepend");
          f.layout("#invitelistCon")
        }
      });
      $(b.inviteView.container).find("#invite-cancel").addClass("hide");
      $(b.inviteView.container).find(".user-invite").css({
        position: "inherit"
      })
    },
    loadInvitations: function() {
      var b = this,
      a = b.model;
      a.pageNo++;
      1 >= a.pageNo && $(b.el).find("#invitelistCon .j_invite_list").empty();
      a.queryInvitations(function(a) {
        b.loadList(a)
      })
    },
    loadList: function(b) {
      b = b.page;
      var a = $(this.el).find(".invitation-more");
      b.hasNext ? a.removeClass("hide") : a.addClass("hide");
      if (b && 0 >= b.result.length) $(this.el).find(".no-result").removeClass("hide");
      else {
        for (a = 0; a < b.result.length; a++) this.loadInviteInfo(b.result[a], "append");
        f.layout("#invitelistCon")
      }
    },
    loadInviteInfo: function(b, a) {
      var e = $(this.el).find("#invitationListClone li").clone(),
      c = e.find("div.dept");
      e.data("inviteInfo", b);
      e.attr("id", b.id);
      var d = "\u5df2\u63a5\u53d7";
      "refused" == b.status && (d = "\u5df2\u62d2\u7edd");
      "unreceived" == b.status ? (TEAMS.currentUser.admin || c.find(".btn-danger").remove(), b.url && c.find(".btn-warning").attr("data-entity", b.url)) : c.html(d);
      e.find("div.username a").eq(1).html(b.invitee);
      e.find("div.call").html(b.contact);
      b.inviteTime && (c = Date.create(b.inviteTime).format("{yyyy}-{MM}-{dd} {HH}:{mm}"), e.find("div.date").html(c));
      $(this.el).find("#invitelistCon .j_invite_list")[a](e)
    },
    initClipboard: function(b) {
      var a = new ZeroClipboard(b);
      a.on("ready",
      function() {
        a.on("copy",
        function(a) {
          a.clipboardData.setData("text/plain", b.attr("data-entity"))
        });
        a.on("aftercopy",
        function(a) {
          f.notify("\u9080\u8bf7\u94fe\u63a5\u5df2\u7ecf\u590d\u5236\u5230\u526a\u8d34\u677f")
        })
      })
    },
    remove: function() {
      $("body").off(".invitationView");
      $(this.el).off(".invitationView");
      $(this.el).remove()
    }
  });

  app.org.UserView = Backbone.View.extend({
    initialize: function(a) {
      this.id = a.id;
      this.el = a.el;
      this.userOrg = a.userOrg;
      this.operation = a.operation;
      this.editable = a.editable;
      this.height = a.height;
      this.isMulti = a.isMulti;
      this.isDepartment = a.isDepartment;
      this.removeSlider = a.removeSlider;
      this.creator = a.creator;
      this.model = new app.org.UserModel();
      this.followModel = new app.org.FollowModel();
      this.checkCount = 0;
      $(this.el).html(app.utils.template("org.user"));
      this.height && $(this.el).find(".j_userlistScr").attr("height", this.height);
      this.target = a.target
    },
    delegateEvents: function() {
      var a = this,
      b = this.model;
      /*$("body").on("click.userView", ".goto-top", function(a) {
        f.gotoTop(".j_userlistScr")
      });*/
      $(a.el).on("click.userView", "#org-users",
      function(b) {
        $(a.el).find("#employee-container").removeClass("hide");
        $(a.el).find("#invitations-container").addClass("hide");
        $(a.el).find("#org-users").addClass("tab-active");
        $(a.el).find(".org-right-col").removeClass("hide")
      });
      $(a.el).off("click", "#btn-invite").on("click", "#btn-invite",
      function(h) {
        if (!c.formValidate($(a.el + " .form-invite"))) return ! 1;
        h = {};
        var d = $(a.el + " #user-name"),
        k = $(a.el + " #user-email");
        k.val() && (h["employee.username"] = $.trim(d.val()), h["employee.email"] = $.trim(k.val()), k.val(""), h["employee.department"] = a.id, b.saveEmployee(h,
        function(b) {
          "exist" == b.propertyName ? (f.notify(b.message), k.val("").focus()) : "probation" == b.propertyName ? (f.notify(b.message), k.val("").focus()) : b.message && "normal" == b.propertyName ? (f.notify(b.message), k.val("").focus()) : (f.notify("<a>\u5df2\u53d1\u9001\u90ae\u4ef6\u9080\u8bf7" + b.employee.username + "\u52a0\u5165eteams</a>"), a.loadUser(b.employee, !0), d.val("").focus(), k.val(""))
        }))
      });
      $(a.el).on("click.userView", "#chk1,#chk2",
      function(b) {
        a.model.pageNo = 0;
        a.model.employee.index = "";
        a.loadUsersAndIndexs()
      });
      $(a.el).on("click.userView", "#employee-container .center-more",
      function(b) {
        $(a.el + " #checkAll").prop("checked", !1);
        a.loadUsers()
      });
      $("body").on("click.userView",
      function() {
        $(a.el + " #userlistCon .user-invitation-tip").remove()
      });
      $(a.el).on("click.userView", ".btn-follow-add",
      function(b) {
        var e = $(this).parents("li");
        b = e.attr("id");
        a.followModel.follow(b, TEAMS.currentUser.id,
        function(b) {
          a.rendFollow(e, b);
          "approved" == b ? f.notify("\u6dfb\u52a0\u5173\u6ce8\u6210\u529f") : f.notify("\u5173\u6ce8\u7533\u8bf7\u5df2\u53d1\u9001")
        })
      });
      $(a.el).on("click.userView", ".btn-unfollow-cancle",
      function() {
        var b = $(this).parents("li"),
        e = b.attr("id");
        a.followModel.unfollow(e, TEAMS.currentUser.id,
        function(e) {
          a.rendFollow(b, e.relation);
          f.notify("\u5df2\u53d6\u6d88\u5173\u6ce8")
        })
      });
      $(this.el).on("blur.userView", "#group-name",
      function(b) {
        var e = $(this).data("nameData");
        b = $(b.currentTarget);
        var c = $(a.el + " #group-name").val();
        $(this).trigger("updateGroupName", [this, e, b, c])
      });
      $(this.el).on("keyup.userView", "#group-name",
      function(a) {
        13 == a.keyCode && $(this).trigger("blur")
      });
      $(this.el).on("click.userView", "#edit-group-user",
      function(b) {
        b = "/organization/" + a.id + "/user/edit/editgroup";
        $(this).attr("href", b)
      });
      $(this.el).on("click.userView", "#employee-container li",
      function(b) {
        $(b.target).hasClass("router") || $(b.target).parent().hasClass("usercard-toggle") || $(b.target).parents().hasClass("follow-btns") ? a.isMulti && $(this).find("div.username input").trigger("click") : (a.editable && "edit" == a.operation && $(this).find("div.username input").trigger("click"), !a.editable && a.isMulti && $(this).find("div.username input").trigger("click"))
      });
      $(this.el).on("click.userView", "#employee-container .clearfix div.username input", function(b) {
        var e = $(this).parents(".clearfix").data("user");
        len = $(this).filter(":checked").length;
        0 < len ? $(this).trigger("addUser", [e, a.id]) : $(this).trigger("deleteUser", [e, a.id]);
        var len1 = $(a.el + " #employee-container .clearfix div.username input:checked").length;
        var len2 = $(a.el + " #employee-container .clearfix").length;
        0 == len1 && $(a.el + " #checkAll").prop("checked", !1);
        len1 == len2 ? $(a.el + " #checkAll").prop("checked", !0) : $(a.el + " #checkAll").prop("checked", !1);
        b.stopPropagation()
      });
      $(this.el).on("click.userView", "#employee-container .clearfix div.username .name",
      function(b) {
        a.userOrg && "editgroup" == a.userOrg && ($(this).click(), b.stopPropagation())
      });
      $(this.el).off("change.userView", "#checkAll").on("click.userView", "#checkAll",
      function() {
        var b = [];
        if ($(this).prop("checked")) {
          $(a.el + " #employee-container .clearfix div.username input").each(function() {
            if (0 == $(this).filter(":checked").length) {
              var e = $(this).parents(".clearfix").data("user");
              b.push(e);
              $(a.el + " #checkAll").removeAttr("checked");
              $(this).prop("checked", !0)
            }
          });
          var e = $(a.el + " #employee-container .clearfix div.username input:checked").length,
          c = $(a.el + " #employee-container .clearfix").length - 1;
          e == c && $(this).prop("checked", !0);
          $(this).trigger("addAllUser", [b, a.id])
        } else $(a.el + " #employee-container .clearfix div.username input").each(function() {
          var e = $(this).parents(".clearfix").data("user");
          if (e.id != TEAMS.currentUser.id || "editgroup" != a.userOrg) b.push(e),
          $(this).prop("checked", !1)
        }),
        $(this).prop("checked", !1),
        $(this).trigger("deleteAllUser", [b, a.id])
      });
      $(this.el).on("resizeSroll.userView", "div.scrollwrapper",
      function(b) {
        var e = $(this);
        b.stopPropagation();
        b.preventDefault();
        b = 1200 < $(window).width() ? 300 : 220;
        a.isDepartment && ($(a.el + " .center-wrap").width(b), $(a.el + " .right-wrap").width($(a.el + " #two").width() - b - 1));
        b = e.attr("height");
        if (!b) {
          b = e.attr("marginbottom") || 0;
          var c = e.offset().top;
          b = $(window).height() - c - b
        }
        e.css("height", b);
        e.mCustomScrollbar("update")
      })
    },
    render: function(a) {
      this.editable ? $(this.el).find(".follow-btns").removeClass("hide") : $(this.el).find(".follow-btns").addClass("hide");
      this.userOrg && ("searchgroup" == this.userOrg ? ($(this.el + " #group-name").attr("disabled", !0), $(this.el).find("#edit-group-user").removeClass("hide"), $(this.el).find("#add-users").addClass("hide")) : "editgroup" == this.userOrg && ($(this.el).find("#edit-group-user").addClass("hide"), $(this.el).find("#add-users").removeClass("hide")), $(this.el + " #group-user-info").removeClass("hide"), $(this.el + " #org-user-info").addClass("hide"));
      this.model.employee.department = this.id;
      this.model.pageNo = 0;
      this.model.groupId = this.id;
      this.model.employee.index = "";
      $(this.el + " #checkAll").prop("checked", !1);
      "search" != this.operation && "edit" != this.operation || this.renderEdit();
      this.loadUsersAndIndexs(a);
      this.creator && TEAMS.currentUser.id != this.creator && $("#edit-group-user").addClass("hide");
      $(this.el).hasClass("user-selector-body-r") ? app.utils.layout("#userSelector-multi .j_userlistScr") : app.utils.layout("#employee-container .j_userlistScr")
    },
    loadUsersAndIndexs: function(a) {
      var b = this,
      c = b.model;
      0 == $(b.el + " #chk2:checked").length ? c.employee.status = "normal": c.employee.status = "";
      c.isContainsSub = !0;
      b.userOrg ? "editgroup" == b.userOrg ? (b.model.employee.department = "", c.findPinyinIndexs(function(a) {
        b.loadPinyin(a)
      })) : (c.groupId = b.id, c.findGroupPinyinIndexs(function(a) {
        b.loadPinyin(a)
      })) : c.findPinyinIndexs(function(a) {
        b.loadPinyin(a)
      });
      b.loadUsers(a)
    },
    loadPinyin: function(a) {
      var b = this,
      c = b.model;
      a = a.indexs;
      var d = /[0-9]$/,
      k = /^[A-Za-z]+$/,
      f = $(b.el).find(".users-list-pinyin");
      f.find("a.highlight:not(#ALL)").removeClass("highlight");
      for (var p = 0; p < a.length; p++) {
        var n = a[p].toLocaleUpperCase();
        d.test(n) ? n = "degit": k.test(n) || (n = "special");
        n && 0 < n.trim().length && f.find("#" + n).addClass("highlight")
      }
      f.off("click", "a.highlight").on("click", "a.highlight",
      function(a) {
        c.pageNo = 0;
        a = $(this).attr("id").toLocaleLowerCase();
        "all" == a && (a = "");
        c.employee.index = a;
        b.loadUsers()
      })
    },
    loadUsers: function(a) {
      var b = this,
      c = b.model;
      c.pageNo++;
      1 >= c.pageNo && $(b.el + " #userlistCon").empty();
      0 == $(b.el + " #chk2:checked").length ? c.employee.status = "normal": c.employee.status = "";
      c.isContainsSub = !0;
      b.userOrg ? "editgroup" == $.trim(b.userOrg) ? (b.model.isGroupEdit = 1, c.queryGroupEmp(function(c) {
        b.loadUserlist(c, a)
      })) : c.queryGroupEmp(function(c) {
        b.loadUserlist(c, a)
      }) : c.queryEmp(function(c) {
        b.loadUserlist(c, a)
      })
    },
    loadUserlist: function(a, b) {
      for (var c = a.page,
      d = 0; d < c.result.length; d++) {
        var k = c.result[d];
        this.loadUser(k, !1, b)
      }
      0 < c.result.length && c.result.length == this.checkCount ? $(this.el + " #checkAll").prop("checked", !0) : $(this.el + " #checkAll").prop("checked", !1);
      d = $(this.el).find(".center-more");
      c.hasNext ? d.removeClass("hide") : d.addClass("hide");
      this.checkCount = 0;
      if (null != $(this.target).attr("id") && "" != $(this.target).attr("id") && "openauth_user" == $(this.target).attr("id")) for (c = $(this.target).find("span"), d = 0; d < c.length; d++) {
        var f = $(c[d]).attr("uid"),
        p = $(c[d]).attr("uname"),
        k = $(this.el + " #employee-container #userlistCon #" + f + ".clearfix div.username input").parents(".clearfix").data("user"),
        p = $("<a> " + p + " </a>");
        p.attr("id", f);
        p.data("user", k);
        0 == $("#userSelector-multi .selected-users #" + f).size() && $("#userSelector-multi .selected-users").prepend(p);
        $("#addUserToGroupButton").removeClass("hide");
        $(this.el + " #employee-container #userlistCon #" + f + ".clearfix div.username input").attr("checked", "checked")
      }
    },
    loadUser: function(a, b, c) {
      var d = $(this.el).find("#usersListClone li").clone();
      this.userOrg ? "searchgroup" == $.trim(this.userOrg) ? this.isMulti ? (d.find("div.username input").removeClass("hide"), $(this.el).find("#group-user-checkall").removeClass("hide"), a.checked && 1 == a.checked && d.find("div.username input").prop("checked", !0)) : (d.find("div.username input").addClass("hide"), $(this.el).find("#group-user-checkall").addClass("hide")) : this.editable && (d.find("div.username input").removeClass("hide"), $(this.el).find("#group-user-checkall").removeClass("hide"), a.checked && 1 == a.checked && (d.find("div.username input").prop("checked", !0), this.checkCount += 1)) : this.isMulti ? (d.find("div.username input").removeClass("hide"), $(this.el).find("#group-user-checkall").removeClass("hide"), a.checked && 1 == a.checked && d.find("div.username input").prop("checked", !0)) : (d.find("div.username input").addClass("hide"), $(this.el).find("#group-user-checkall").addClass("hide"));
      if (c) for (var k = 0; k < c.length; k++) c[k].id == a.id && (this.checkCount += 1, d.find("div.username input").prop("checked", !0));
      d.data("user", a);
      d.attr("id", a.id);
      a.mobile ? d.find(".call").html(a.mobile) : d.find(".call").html(a.email);
      d.find(".dept").html(a.department.name);
      this.editable && d.find("a.avatar").attr("userId", a.id);
      a.avatar && a.avatar.p4 && (d.find("a.avatar img").attr("src", "/base/download/" + a.avatar.p4), this.editable && (d.find("a.avatar img").attr("id", a.id), d.find("a.avatar img").data("user", a)));
      c = "";
      c = "normal" == a.status ? "": "(\u79bb\u804c)";
      c = "<font color='red'>" + c + "</font>";
      d.find("a.name").html(a.username + c);
      this.removeSlider && d.find("a.name").removeClass("j_entityslider-toggle");
      this.editable ? d.find("a.name").attr("data-id", a.id) : this.isMulti || (d.find("a.name").attr("id", a.id), d.find("a.name").data("user", a));
      c = a.email ? a.email: a.mobile;
      d.find("span.email").attr("title", c).html(c);
      $(this.el).find("#userlistCon");
      a.department && 1 == a.department.rank ? d.find("span.department").text("") : d.find("span.department").attr("title", a.department.name).html(a.department.name);
      this.editable && (a.lastLoginTime ? (c = Date.create(a.lastLoginTime).format("{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}"), d.find("span.lastlogin").attr("title", "\u6700\u8fd1\u767b\u5165" + c + "/\u767b\u5f55\u603b\u6b21\u6570" + a.loginCount + "\u6b21").html("\u6700\u8fd1\u767b\u5165" + c + "/" + a.loginCount + "\u6b21")) : d.find("span.lastlogin").attr("title", "\u672a\u767b\u5f55").append("\u672a\u767b\u5f55"));
      TEAMS.currentUser.id != a.id ? d.find("span." + a.relation).removeClass("hide") : "editgroup" == this.userOrg && d.find("div.username input").attr("disabled", "disabled");
      b ? $(this.el).find("#userlistCon").prepend(d) : $(this.el).find("#userlistCon").append(d)
    },
    rendFollow: function(a, b) {
      a.find(".follow-btns span").addClass("hide");
      a.find(".follow-btns .btn").addClass("hide");
      a.find(".follow-btns ." + b).removeClass("hide")
    },
    renderEdit: function() {
      var a = this;
      this.model.getById(a.id,
      function(b) {
        a.group = b.group;
        $(a.el + " #group-name").data("nameData", b.group.name);
        $(a.el + " #group-name").focus();
        a.loadGroup(b.group)
      })
    },
    loadGroup: function(a) {
      $(this.el + " #group-info").removeClass("hide").data("group", a);
      $(this.el + " #group-id").val(a.id);
      $(this.el + " #group-name").val(a.name)
    },
    remove: function() {
      $(this.el).off(".userView")
    }
  });

  app.org.TreeView = Backbone.View.extend({
    lightClass: "selected",
    fold: "fa fa-caret-right",
    unfold: "fa fa-caret-down",
    initialize: function(d) {
      this.el = d.el;
      this.noUrl = d.noUrl;
      this.readonly = d.readonly;
      this.model = new app.org.TreeModel();
    },
    delegateEvents: function() {
      var d = this,
      c = $(d.el);
      c.off(".tree");
      c.on("click.tree", "." + d.unfold, function(b) {
        b.stopPropagation();
        $(this).parent().parent().find("ul").slideToggle(400);
        $(this).removeClass(d.unfold).addClass(d.fold)
      });
      c.on("click.tree", "." + d.fold, function(b) {
        b.stopPropagation();
        $(this).parent().parent().find("ul").slideToggle(400);
        $(this).removeClass(d.fold).addClass(d.unfold)
      })
    },
    render: function(d, c) {
      var b = this;
      b.id = d;
      b.model.loadData(function(a) {
        a = a.nodes;
        b.initTree(a);
        b.bindData(a);
        c()
      })
    },
    initTree: function(d) {
      var c = this.getRoot(d);
      d = this.createRootTree(c, d);
      $(this.el).html(d)
    },
    createRootTree: function(d, c) {
      var b = "<ul>",
      a = this.createChild(d, c);
      return b = b + a + "</ul>"
    },
    createTree: function(d, c) {
      for (var b = "<ul class='ftl-child-ul'>",
      a = 0,
      e = 0,
      h = c.length; e < h; e++) {
        var m = c[e];
        if (!m) break;
        var k = m.nodeObj.parent;
        k && k.id == d.id && m.id != d.id && (m = this.createChild(m, c), b += m, a++)
      }
      return 0 == a ? "": b + "</ul>"
    },
    createChild: function(d, c) {
      if (d) {
        var b = "root" == d.parentId ? "root": "",
        a = "padding-left:" + 20 * d.rank + "px",
        e = this.createTree(d, c),
        h = e ? this.unfold: "",
        b = "<li>" + ('<div class="treenode router ' + b + '" style="' + a + '" id="' + d.id + '">'),
        m = this.noUrl ? "": d.url ? d.url: "#",
        a = '<span class="num fr">' + d.attachment + '</span><a class="router" title="' + d.name + '" href="' + m + '"><span class="tree-name">' + d.name + "</span></a>";
        "" === m && (a = '<a class="router" title="' + d.name + '"><span class="tree-name">' + d.name + "</span></a>");
        if(!this.readonly) {
          m = "<span class='actions'>";
          if(app.config.currentUser.admin) {
            m += "<a id='edit-department' nodeid='" + d.id + "' class='router' href='/organization/" + d.id + "/department/edit' title='编辑'><i class='fa fa-edit'></i></a>";
            m += "<a id='add-department' nodeid='" + d.id + "' class='router' href='/organization/" + d.id + "/department/add' title='添加下级部门'><i class='fa fa-plus'></i></a>";
            "root" != d.parentId && (m += "<a id='delete-department' nodeid='" + d.id + "' title='删除部门'><i class='fa fa-trash'></i></a>");
          }
          b += m + "</span>";
        }
        b += "<i class='nodeicon " + h + "'></i>";
        b = b + a + "</div>";
        b += e;
        return b += "</li>"
      }
    },
    getRoot: function(d) {
      for (var c = 0,
      b = d.length; c < b; c++) {
        var a = d[c];
        if (!a.nodeObj.parent) return a
      }
    },
    bindData: function(d) {
      for (var c = 0,
      b = d.length; c < b; c++) {
        var a = d[c];
        $(this.el).find("#" + a.id).data("node", a)
      }
    },
    getSelectedNode: function() {
      return $(this.el).find(".selected")
    },
    getSelectedNodeObj: function() {
      return this.getSelectedNode().data("node")
    },
    reloadNode: function(d, c) {
      var b = this,
      a = d.data("node");
      b.model.loadData(function(a) {
        b.restoreNode(d, a.nodes);
        c && c()
      },
      a.id)
    },
    restoreNode: function(d, c) {
      var view = this;
      var b = d.data("node"),
      a = d.parent().prev(),
      e = d.parent().next(),
      h = d.parent().parent();
      d.parent().remove();
      var m = view.createChild(b, c);
      0 < a.length ? a.after(m) : 0 < e.length ? e.before(m) : h.append(m);
      view.highLight(b.id);
      c.push(b);
      view.bindData(c)
    },
    updateNode: function(d, c) {
      var b = d.data("node").name;
      d.find("a").attr("title", b).find(".tree-name").html(b)
    },
    highLight: function(d) {
      var c = $(this.el),
      b = this.lightClass;
      c.find(".treenode").removeClass(b);
      c.find("#" + d).addClass(b);
      d || c.find(".root").addClass(b)
    },
    remove: function() {
      var d = $(this.el);
      d.off(".tree");
      d.remove()
    }
  });

  app.org.GroupView = Backbone.View.extend({
    lightClass: "selected",
    initialize: function(c) {
      this.el = c.el;
      this.noUrl = c.noUrl;
      this.readonly = c.readonly;
      this.model = new app.org.GroupModel();
    },
    delegateEvents: function() {
      var c = this,
      b = $(c.el),
      a = $(".j_user");
      b.off(".group");
      a.on("addUser.group",
      function(a, b, d) {
        c.addGroupUser(d, b.id)
      });
      a.on("deleteUser.group",
      function(a, b, d) {
        c.deleteGroupUser(d, b.id)
      });
      a.on("addAllUser.group",
      function(a, b, d) {
        a = [];
        for (var k = 0; k < b.length; k++) a += b[k].id + ",";
        0 < a.length && c.addGroupUsers(d, a)
      });
      a.on("deleteAllUser.group",
      function(a, b, d) {
        a = [];
        for (var k = 0; k < b.length; k++) a += b[k].id + ",";
        d && 0 < a.length && c.deleteGroupUsers(d, a)
      });
      a.on("updateGroupName.group",
      function(a, b, d, k, q) {
        q && 0 < $.trim(q).length ? d != $.trim(q) && (20 < $.trim(q).length ? f.notify("\u7fa4\u7ec4\u540d\u79f0\u4e0d\u5f97\u8d85\u8fc720\u4e2a\u5b57\u7b26") : (c.saveGroupProperty(k), $(this).find(b).data("nameData", $.trim(q)))) : (f.notify("\u8bf7\u586b\u5199\u7fa4\u7ec4\u7528\u6237\u540d"), $(this).find(b).val($.trim(d)))
      });
      $("body").off("updateChannelName2.websocket").on("updateChannelName2.websocket",
      function(a, b) {
        if (void 0 != b.channel && "updateChannelName" == b.operateType) {
          var c = b.channel.id,
          d = b.channel.name,
          f = b.channel.member.length;
          $("#group-message").find("#" + c).text(d + "\u3010" + f + "\u4eba\u3011")
        }
      })
    },
    render: function(c) {
      var b = this;
      b.model.loadData(c,
      function(a) {
        b.loadPage(a)
      })
    },
    loadPage: function(c) {
      c = c.groups;
      for (var b = "<ul class='clearfix'>",
      a = 0,
      e = c.length; a < e; a++) {
        var h = "",
        d = this.noUrl ? "#": "/organization/" + c[a].id + "/user/search/searchgroup/" + c[a].creator.id,
        k = c[a].createTime ? Date.create(c[a].createTime).format("{yyyy}-{MM}-{dd}") : "",
        h = h + ("<li><a id='" + c[a].id + "' class='router' title='" + c[a].creator.username + "\u521b\u5efa\u4e8e" + k + "' href='" + d + "'>" + c[a].name + "\u3010" + (null == c[a].member ? 0 : c[a].member.length) + "\u4eba\u3011</a>"),
        d = this.noUrl ? "": "/organization/" + c[a].id + "/user/edit/editgroup";
        this.readonly || TEAMS.currentUser.id != c[a].creator.id || (h += "<span class='actions'><a class='router'  href='" + d + "' title='\u7f16\u8f91'>\u8bbe\u7f6e\u7fa4\u7ec4\u6210\u5458</a>", h += "<a id='delete-group' groupid='" + c[a].id + "' class='router' title='\u5220\u9664'><i class='fa fa-trash'></i></a></span>");
        h += "</li>";
        b += h
      }
      b += "</ul>";
      $(this.el).html(b)
    },
    addGroupUser: function(c, b) {
      this.model.addGroupUser(c, b,
      function(a) {
        $(".j_depa").find("#group-users").trigger("click");
        f.notify("\u6210\u529f\u6dfb\u52a0\u8fdb\u7fa4\u7ec4")
      })
    },
    deleteGroupUser: function(c, b) {
      this.model.deleteGroupUser(c, b,
      function(a) {
        $(".j_depa").find("#group-users").trigger("click");
        f.notify("\u6210\u529f\u79fb\u51fa\u7fa4\u7ec4")
      })
    },
    addGroupUsers: function(c, b) {
      this.model.addGroupUsers(c, b,
      function(a) {
        $(".j_depa").find("#group-users").trigger("click");
        f.notify("\u6210\u529f\u52a0\u5165\u7fa4\u7ec4")
      })
    },
    deleteGroupUsers: function(c, b) {
      this.model.deleteGroupUsers(c, b,
      function(a) {
        $(".j_depa").find("#group-users").trigger("click");
        f.notify("\u6210\u529f\u9000\u51fa\u7fa4\u7ec4")
      })
    },
    saveGroupProperty: function(c) {
      var b = c.val(),
      a = c.attr("name"),
      e = "";
      a && (e = a.replace("group.", ""));
      var h = {};
      h["group.id"] = $("#group-id").val();
      h.propertyName = e;
      h[a] = b;
      c && "checkbox" == c[0].type && (b = c[0].checked ? 0 : 1, h[a] = b);
      this.model.saveGroupProperty(h,
      function(a) {
        $(".j_depa").find("#group-users").trigger("click");
        f.notify("\u4fdd\u5b58\u6210\u529f")
      })
    },
    remove: function() {
      var c = $(this.el);
      c.off(".group");
      c.remove()
    }
  });

  app.org.DepartmentTreeView = Backbone.View.extend({
    initialize: function(e) {
      this.id = e.id;
      this.type = e.type;
      this.el = e.el;
      this.readonly = e.readonly;
      this.noUrl = e.noUrl;
      this.height = e.height;
      this.operation = e.operation;
      this.model = new app.org.TreeModel();
      this.groupModel = new app.org.GroupModel();
      this.treeView = new app.org.TreeView({
        el: this.el + " #org-tree-list",
        readonly: this.readonly,
        noUrl: this.noUrl
      });
      this.groupView = new app.org.GroupView({
        el: this.el + " #group-message",
        readonly: this.readonly,
        noUrl: this.noUrl
      });
      $(this.el).html(app.utils.template("org.departmenttree"));
      this.height && $(this.el).find("#org-tree").attr("height", this.height);
      app.utils.layout(this.el + " #org-tree")
    },
    delegateEvents: function() {
      var a = this;
      /*$("body").on("click.departmenttree", ".goto-top", function(a) {
        f.gotoTop("#org-tree")
      });*/
      $(a.el).on("click.departmenttree", "#organization-users", function(b) {
        $(this).addClass("active");
        $(this).siblings().removeClass("active");
        $(a.el).find("#organization-users").parent().addClass("active");
        $(a.el).find("#group-users").parent().removeClass("active");
        $(a.el).find("#org-tree-list").removeClass("hide");
        $(a.el).find("#org-group-list").addClass("hide");
        $(a.el).find(".root").trigger("click");
      });
      $(a.el).on("click.departmenttree", "#group-users", function(b) {
        $(this).addClass("active");
        $(this).siblings().removeClass("active");
        $(a.el).find("#organization-users").parent().removeClass("active");
        $(a.el).find("#group-users").parent().addClass("active");
        $(a.el).find("#org-tree-list").addClass("hide");
        $(a.el).find("#org-group-list").removeClass("hide");
        a.reloadGroup(app.config.currentUser.id);
      });
      $(a.el).on("click.departmenttree", ".nodeicon", function(a) {
        $(this).toggleClass("fa fa-caret-right");
        $(this).toggleClass("fa fa-caret-down");
        $(this).parent(".treenode").next().slideToggle("fast")
      });
      $(a.el).on("click.departmenttree", ".treenode", function(b) {
        a.treeView.highLight($(this).data("node").id)
      });
      $(a.el).on("click.departmenttree", "#delete-department", function(b) {
        var c = $(this);
        f.confirm("\u786e\u5b9a\u8981\u5220\u9664\u90e8\u95e8\u5417\uff1f\u5220\u9664\u540e\u5c06\u65e0\u6cd5\u6062\u590d",
        function(b) {
          b && (b = $(a.el).find("#" + c.attr("nodeid")).data("node").nodeObj, a.model.deleteDepart(b.id, b.parent.id,
          function(b) {
            a.deleteSelectedNode(a.operation);
            f.notify("\u5220\u9664\u6210\u529f")
          }))
        })
      });
      $(a.el).on("click.departmenttree", "#delete-group", function(b) {
        var c = $(this),
        d = -1;
        b = $(a.el).find(c).parents("li").next();
        b[0] ? d = b[0].firstChild.id: b = $(a.el).find(c).parents("li").prev();
        b[0] && (d = b[0].firstChild.id);
        f.confirm("\u786e\u5b9a\u8981\u5220\u9664\u7fa4\u7ec4\u5417\uff1f\u5220\u9664\u540e\u5c06\u65e0\u6cd5\u6062\u590d", function(b) {
          b && (b = $(a.el).find(c).attr("groupid"), a.groupModel.deleteGroup(b,
          function(b) {
            f.notify("\u5220\u9664\u6210\u529f"); - 1 != d ? (b = "/organization/" + d + "/user/edit/editgroup", $("#center-pane").find("#show-first-group").attr("href", b), $("#center-pane").find("#show-first-group").click()) : ($("#right-pane").find("#employee-container").addClass("hide"), $("#right-pane").find("#group-user-info").addClass("hide"));
            a.reloadGroup(TEAMS.currentUser.id)
          }))
        })
      });
      $(a.el).on("click.departmenttree", "#add-dept-group", function(a) {
        $(this).hide();
        $("#group-message").prepend("<div class='ph-20'><input id='group-input-text' class='form-control form-control-block mb-10' type='text' /></div>");
        $("#group-input-text").focus()
      });
      $(a.el).on("blur.departmenttree", "#group-input-text", function(b) {
        b = $(this);
        b.hide();
        b = b.val();
        $("#add-dept-group").show();
        if ("" != $.trim(b)) {
          var c = {};
          20 < $.trim(b).length ? f.notify("\u7fa4\u7ec4\u540d\u79f0\u4e0d\u5f97\u8d85\u8fc720\u4e2a\u5b57\u7b26") : (c["group.name"] = $.trim(b), c.employeeId = TEAMS.currentUser.id, a.groupModel.saveGroup(c, function(b) {
            f.notify("\u6dfb\u52a0\u6210\u529f");
            a.reloadGroup(app.config.currentUser.id);
            b = "/organization/" + b.group.id + "/user/edit/editgroup";
            $("#center-pane").find("#show-first-group").attr("href", b);
            $("#center-pane").find("#show-first-group").click()
          }))
        }
      });
      $(a.el).on("keyup.departmenttree", "#group-input-text", function(a) {
        var b = $(this);
        13 == a.keyCode && b.trigger("blur")
      });
      $(a.el).on("click.departmenttree", "#org-tree-list .treenode", function(a) {
        $(a.target).hasClass("fa-edit") || $(a.target).hasClass("fa-trash") || $(a.target).hasClass("fa-plus") || $(a.target).hasClass("tree-name") || $(this).find(">a")[0].click()
      });
      $(a.el).on("click.departmenttree", "#org-group-list li", function(a) {
        $(a.target).attr("href") || $(a.target).hasClass("fa-trash") || $(this).find(">a")[0].click()
      })
    },
    navigate: function(a) {
      var b = a.attr("href");
      ROUTER.navigate(b, {
        trigger: !0
      });
      b = a.attr("id");
      a = a.attr("nodeid");
      this.treeView.highLight(a ? a: b)
    },
    render: function() {
      var a = this,
      b = a.id,
      c = $(a.el),
      d = a.type;
      this.treeView.render(b,
      function() {
        "department" == d ? a.treeView.highLight(b) : b && 0 < c.find("#" + a.id).length ? c.find("#" + a.id).trigger("click") : c.find(".root").addClass("selected")
      });
      $(a).find("#organization-users").trigger("click")
    },
    reloadSelectedNode: function(a) {
      var b = this.treeView,
      c = b.getSelectedNode();
      b.reloadNode(c, a)
    },
    addNode: function(a) {
      var b = this,
      c = $(b.el);
      b.reloadSelectedNode(function() {
        b.treeView.highLight(a);
        c.find("#" + a).find("#edit-department").trigger("click")
      })
    },
    updateNode: function(a, b) {
      var c = this.treeView,
      d = c.getSelectedNodeObj();
      d.nodeObj[a] = b;
      "name" == a ? d.name = b: "parentId" == a && (d.parentId = b);
      c.updateNode($(this.el).find("#" + d.id), b)
    },
    updateGroup: function() {
      $(this.el).find("#group-users").trigger("click")
    },
    deleteSelectedNode: function(a) {
      var b = this.treeView,
      c = b.getSelectedNodeObj().parentId,
      c = $(this.el).find("#" + c);
      b.reloadNode(c);
      "edit" == a || "add" == a ? c.find("#edit-department").trigger("click") : c.trigger("click")
    },
    reloadGroup: function(a) {
      this.groupView.render(a)
    },
    remove: function() {
      $(this.el).off(".departmenttree")
    }
  });

  app.org.DepartmentView = Backbone.View.extend({
    department: {},
    initialize: function(b) {
      this.id = b.id;
      this.operation = b.operation;
      this.model = new app.org.DepartmentModel();
      this.el == b.el;
      $(this.el).html(app.utils.template("org.department"));
      app.utils.layout("#department-info")
    },
    delegateEvents: function() {
      var b = this;
      $(this.el).on("blur.department", "#department-info :input", function(a) {
        a = $(a.currentTarget);
        var e = $("#department-id").val();
        a.val();
        e ? b.saveDepartmentProperty(a) : b.saveDepart(a)
      });
      app.components.typeahead.init([{
        el: "#department-info #typeahead-department",
        callback: function(a) {
          if (a) {
            if (b.id == a.id) return;
            $("#departmentSelector a").text(a.name);
            $("#department-parent").val(a.id)
          }
          b.saveDepartmentProperty($("#department-info #department-parent"))
        },
        resultHandler: function(a) {
          var e = [];
          $.each(a, function(a, c) {
            b.id != c.id && e.push(c)
          });
          return e
        }
      }])
    },
    render: function() {
      if(app.config.currentUser.admin) {
        if("add" == this.operation) {
          this.renderAdd();
        } else {
          if("edit" == this.operation) {
            this.renderEdit();
          }
        }
      } else {
        if("edit" == this.operation) {
          this.renderShow();
        }
      }
    },
    renderAdd: function() {
      var b = this,
      a = this.model,
      e = b.id,
      c = $("#department-info").removeClass("hide");
      c.find("input:not(#departmentSelector)").val("");
      c.find("textarea").val("");
      a.getById(e, function(a) {
        var e = a.department;
        b.department = a.department;
        c.find("#department-parent").val(e.id);
        c.find("#departmentSelector a").html(e.name)
      })
    },
    renderEdit: function() {
      var b = this;
      this.model.getById(b.id, function(a) {
        b.department = a.department;
        $("#department-info").data("departmentName", b.department.name);
        b.loadDepartment(a.department);
      })
    },
    renderShow: function() {
      var b = this;
      this.model.getById(b.id,
      function(a) {
        b.department = a.department;
        b.loadDepartmentRead(a.department)
      })
    },
    saveDepart: function() {
      var b = this,
      a = $("#department-info"),
      e = {},
      c = $("#department-name").val();
      20 < $.trim(c).length ? app.alert('warning', "部门名称不得超过20个字符") : 0 == $.trim(c).length ? app.alert('warning', "部门名称不得为空") : (a.find("input").each(function() {
        name = $(this).attr("name");
        val = $(this).val();
        name && val && (e[name] = val)
      }), a.find("textarea").each(function() {
        name = $(this).attr("name");
        val = $(this).val();
        name && val && (e[name] = val)
      }), e["department.parent.id"] && 0 != $.trim(e["department.parent.id"]).length ? this.model.saveDepartment(e,
      function(e) {
        e.message ? f.notify(e.message) : e.department.id ? (a.find("#department-id").val(e.department.id), $("#department-info").data("department", e.department), e.department.name && b.trigger("addNode", e.department.id), f.notify("\u4fdd\u5b58\u6210\u529f")) : f.notify("\u6570\u636e\u9519\u8bef\uff0c\u6dfb\u52a0\u5931\u8d25")
      }) : f.notify("\u4e0a\u7ea7\u90e8\u95e8\u4e0d\u80fd\u4e3a\u7a7a"))
    },
    saveDepartmentProperty: function(b) {
      var a = $("#department-info").data("departmentName"),
      e = this,
      c = $("#department-info").data("department"),
      d = b.val();
      b = b.attr("name");
      var k = $("#department-name").val();
      if (20 < $.trim(k).length) $("#department-info").data("departmentName", k),
      f.notify("部门名称不得超过20个字符");
      else if (0 == $.trim(k).length) app.alert('warning', "部门名称不得为空"),
      $("#department-name").val(a);
      else {
        var q = "";
        b && (q = b.replace("department.", ""));
        a = {};
        a["department.id"] = $("#department-id").val();
        a.propertyName = q;
        a[b] = d;
        $.trim(c[q]) != $.trim(a[b]) && e.model.saveDepartmentProperty(a,
        function(a) {
          "parent.id" === q || "disporder" === q ? e.trigger("rerenderTree") : e.trigger("updateNode", {
            propertyName: q,
            value: d
          });
          $("#department-info").data("departmentName", a.department.name);
          f.notify("\u4fdd\u5b58\u6210\u529f")
        })
      }
    },
    loadDepartment: function(b) {
      $("#department-info").removeClass("hide").data("department", b);
      $("#departmentSelector").removeAttr("disabled");
      $("#department-id").val(b.id);
      $("#department-name").val(b.name);
      $("#department-code").val(b.code);
      $("#department-disporder").val(b.disporder);
      if(b.parent) {
        $("#department-parent").val(b.parent.id);
        $("#departmentSelector a").html(b.parent.name);
        $("#btn-delete-department").removeClass("hide");
      } else {
        $("#department-parent").val("");
        $("#departmentSelector a").html("");
        $("#btn-delete-department").addClass("hide");
        $("#department-info #department-root").hide();
      }
      if(b.manager) {
        $("#department-manager").val(b.manager.id);
        $("#userSelector").val(b.manager.username);
      }
      $("#department-description").val(b.description);
    },
    loadDepartmentRead: function(b) {
      $("#department-info-read").removeClass("hide");
      $("#department-name-div .controls span").html(b.name);
      $("#department-code-div .controls span").html(b.code);
      $("#department-disporder-div .controls span").html(b.disporder);
      b.parent && $("#department-parent-div .controls span").html(b.parent.name);
      $("#department-description-div .controls span").html(b.description)
    },
    remove: function() {
      $(this.el).off(".department")
    }
  });

}(window, app, Backbone, jQuery, _, moment));