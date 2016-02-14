(function (window, app, Backbone, jQuery, _, moment) {
  "use strict";

  var $ = jQuery;

  app.profile = {};

  app.profile.ProfileView = Backbone.View.extend({
    initialize: function(data) {
      this.el = data.container || "#mainContainer";
      this.userId = data.userId || app.config.currentUser.id;
      this.closable = data.closable;
      this.model = new app.models.ProfileModel(data);
    },
    delegateHasAclEvents: function() {
      var a = this,
      b = this.model,
      c = $(a.el);
      /*$("body").on("click.profile", ".goto-top", function(e) {
        app.utils.gotoTop(a.el + " #user-container")
      });*/
      c.on("blur.profile", "#user-info input:not(#typeahead-department,#typeahead-superior,#ROLE_ADMIN,#typeahead-business-superior,#typeahead-assistant,#typeahead-open-access)", function(e) {
        e = $(e.currentTarget);
        a.saveEmployee(e)
      });
      c.on("change.profile", "#user-info select", function(e) {
        e = $(e.currentTarget);
        a.saveEmployee(e)
      });
      c.on("change.profile", "#user-info input[type=radio]", function(e) {
        e = $(e.currentTarget);
        a.saveEmployee(e)
      });
      c.on("removeEntity.profile", "#employee-superior", function(e) {
        b.saveEmployeeProperty({
          propertyName: "superior",
          "employee.id": a.userId
        }, function(e) {
          if (e.message) return f.notify(e.message);
          $("#user-info").data("user", e.employee);
          f.notify("\u5220\u9664\u6210\u529f");
          a.hasSenior() || $("#seniorRow").addClass("hide")
        })
      });
      c.on("click.profile", "#btn-delete-user", function() {
        f.confirm("\u786e\u5b9a\u8981\u5220\u9664\u8be5\u7528\u6237\u5417\uff1f\u5220\u9664\u540e\u5c06\u65e0\u6cd5\u6062\u590d", function(e) {
          e && a.model.deleteUser(a.userId,
          function(a) {
            f.notify(a.message);
            window.location = "/organization"
          })
        })
      });
      c.on("change.profile", "input[id=ROLE_ADMIN][type=checkbox]", function() {
        var e = "",
        b = "",
        c = "",
        m = $(this);
        1 == $("#ROLE_ADMIN:checked").length ? (e = "add", b = "\u786e\u5b9a\u8981\u8d4b\u4e88\u8be5\u7528\u6237\u7ba1\u7406\u5458\u6743\u9650\u5417\uff1f", c = !1) : (e = "remove", b = "\u786e\u5b9a\u8981\u6536\u56de\u8be5\u7528\u6237\u7ba1\u7406\u5458\u6743\u9650\u5417\uff1f", c = !0);
        f.confirm(b,
        function(b) {
          b ? a.model.updateUserRole(a.userId, "ROLE_ADMIN", e,
          function(a) {
            if (a.actionMsg) return m.prop("checked", c),
            f.notify(a.actionMsg.message);
            f.notify("\u66f4\u65b0\u6210\u529f,\u91cd\u65b0\u767b\u5f55\u540e\u751f\u6548")
          }) : m.prop("checked", c)
        })
      });
      app.components.typeahead.init([{
        el: a.el + " #user-container #typeahead-department",
        callback: function(e) {
          e && $("#employee-department").html(f.template("base.department", e));
          a.saveEmployee($(a.el + " #user-container #typeahead-department"))
        }
      }, {
        el: a.el + " #user-container #typeahead-superior",
        callback: function(e) {
          if (e) {
            if (a.hasUser(e.id, $("body").find("#business-employee-superior"))) {
              f.notify("\u4e0d\u80fd\u5c06\u5176\u4ed6\u4e0a\u7ea7\u4eba\u5458\u8bbe\u7f6e\u6210\u4e0a\u7ea7");
              return
            }
            $("#employee-superior").html(f.template("base.user", e));
            $("#employee-superior").find("a").attr("data-value", a.userId)
          }
          a.saveEmployee($(a.el + " #user-container #typeahead-superior"))
        }
      }, {
        el: a.el + " #user-container #typeahead-business-superior",
        callback: function(e) {
          e && a.saveOtherSenior(e)
        }
      }, {
        el: a.el + " #user-container #typeahead-assistant",
        callback: function(e) {
          e && a.saveAssistant(e)
        }
      }, {
        el: a.el + " #user-container #typeahead-open-access",
        callback: function(e) {
          e && a.saveOpenAccess(e)
        }
      }]);
      c.on("click.profile", ".binding_js", function() {
        var b = $(this).attr("propertyName"); (new e({
          userId: a.userId,
          parentEl: a.el + " #user-container",
          propertyName: b
        })).render()
      });
      c.on("click.profile", "#employee-unavailable", function() {
        var e = $(this),
        b = e.attr("propertyName");
        "resignation" == b ? a.resignation(e) : "quit" == b && a.quitCompany()
      });
      c.on("click.profile", "#employee-available", function() {
        var e = $(this);
        "normal" == e.attr("propertyName") && a.rehire(e)
      });
      c.off("click.profile", "#business-employee-superior .entity-item .close").on("click.profile", "#business-employee-superior .entity-item .close", function(e) {
        e.stopPropagation();
        e = $(this).prevAll("a").attr("userid");
        $(this).prevAll("a").attr("data-value");
        var c = $(this).parent();
        e && (b.sids = e);
        b.subordinateUserId = a.userId;
        f.confirm("\u786e\u5b9a\u5220\u9664\u5417?",
        function(e) {
          e && b.deleteOtherSenior(function(e) {
            c.remove();
            f.notify("\u5176\u4ed6\u4e0a\u7ea7\u5df2\u5220\u9664");
            a.hasSenior() || $("#seniorRow").addClass("hide")
          })
        })
      });
      c.off("click.profile", "#assistant .entity-item .close").on("click.profile", "#assistant .entity-item .close", function(e) {
        e.stopPropagation();
        e = $(this).prevAll("a").attr("userid");
        var c = $(this).parent();
        e && (b.assistantId = e);
        b.sids = a.userId;
        f.confirm("\u786e\u5b9a\u5220\u9664\u5417?", function(a) {
          a && b.deleteAssistant(function(a) {
            c.remove();
            f.notify("\u52a9\u7406\u5df2\u5220\u9664")
          })
        })
      });
      c.off("click.profile", "#open-access .entity-item .close").on("click.profile", "#open-access .entity-item .close", function(e) {
        e.stopPropagation();
        e = $(this).prevAll("a").attr("userid");
        $(this).prevAll("a").attr("data-value");
        var c = $(this).parent();
        e && (b.sids = e);
        b.openAccessId = a.userId;
        f.confirm("\u786e\u5b9a\u5220\u9664\u5417?", function(a) {
          a && b.deleteOpenAccess(function(a) {
            c.remove();
            f.notify("\u6743\u9650\u5f00\u653e\u5df2\u5220\u9664")
          })
        })
      })
    },
    renderSummary: function() {
      var a = this;
      this.model.loadSummary(this.userId, function(e) {
        var c = e.user;
        if (c) {
          var d = f.template("home.userinfo", e);
          $("#right-pane").empty().append(d);
          a.visitView = new b({
            userId: c.id,
            container: $("#right-pane").find(".div_visit")
          });
          a.visitView.render(e.myVisitors, e.beVisited)
        }
      })
    },
    initComponent: function() {},
    render: function() {
      $(this.el).html(app.utils.template("base.profile"));
      var a = app.config.currentUser.id;
      app.config.currentUser.admin ? this.renderHasAcl(!0) : a == this.userId ? this.renderHasAcl(!1) : this.renderNoAcl()
    },
    renderNoAcl: function() {
      var a = this,
      e = $(a.el + " #user-container");
      e.find("#user-info-normal");
      var b = e.find("#user-info-normal");
      b.removeClass("hide");
      this.model.loadProfile(this.userId, function(c) {
        var d = c.employee;
        b.find("#employee-username-div .controls p").html(d.username);
        b.find("#employee-email-div .controls p").html(d.email);
        d.sex && b.find("#employee-sex-div .controls").find("." + d.sex).removeClass("hide");
        b.find("#employee-mobile-div .controls p").html(d.mobile);
        b.find("#employee-telephone-div .controls p").html(d.telephone);
        b.find("#rank-div .controls").find("." + d.rank).removeClass("hide");
        b.find("#status-div .controls").find("." + d.status).removeClass("hide");
        b.find("#js_quit_transfer").attr("data-id", a.userId).attr("data-value", d.username);
        d.department && b.find("#department-div .controls p").html(d.department.name);
        d.superior && b.find("#superior-div .controls p").html(d.superior.name);
        d.assistant && b.find("#assistant-div .controls p").html(d.assistant.name);
        if (c.shareEntrys) for (var n = 0; n < c.shareEntrys.length; n++) {
          var s = c.shareEntrys[n];
          b.find("#other-superior-div .controls").append("<span class='controls-text'>" + s.name + "<span>&nbsp;")
        }
        d.avatar && (e.find("#upload-avatar").append('<div class="user-photo"><img id="avatar-img" class="avatar-img" alt="\u5934\u50cf" src="' + d.avatar + '"></div>'));
        if (c.openAccess) for (n = 0; n < c.openAccess.length; n++) s = c.openAccess[n],
        b.find("#open-access-div .controls").append("<span class='controls-text'>" + s.name + "<span>&nbsp;");
        app.utils.layout(a.el + " #user-container")
      })
    },
    renderHasAcl: function(a) {
      var e = this,
        b = $(e.el + " #user-container");
      b.find("#user-info").removeClass("hide");
      var c = app.config.currentUser.id;
      this.model.loadProfile(this.userId, function(d) {
        var n = d.employee,
        s = null == d.userImpl ? {}: d.userImpl;
        b.find("#user-info").data("user", n);
        b.find("#employee-id").val(n.id);
        b.find("#passwd-btn a").attr("userId", n.id);
        b.find("#employee-username").val(null == s.username ? n.username: s.username);
        b.find("#employee-telephone").val(n.telephone);
        b.find("#employee-email").val(null == s.email ? n.email: s.email);
        b.find("#employee-email-span").html(null == s.email ? n.email: s.email);
        b.find("#employee-mobile").val(null == s.mobile ? n.mobile: s.mobile);
        b.find("#employee-mobile-span").html(null == s.mobile ? n.mobile: s.mobile);
        n.sex && b.find("input[value=" + n.sex + "]").attr("checked", "checked");
        b.find("#employee-status").html({
          normal: "在职",
          unavailable: "离职",
          locked: "锁定",
          unactive: "未激活",
          temp: "临时账号",
          detached: "退出团队"
        } [n.status]);
        b.find("#js_quit_transfer").attr("data-id", e.userId).attr("data-value", null == s.username ? n.username: s.username);
        if("normal" == n.status) {
          b.find("#employee-unavailable").parent().show();
        }
        if("unavailable" == n.status) {
          b.find("#passwd-btn").remove();
          b.find("#ROLE_ADMIN").parent().parent().parent().remove();
          b.find("#employee-available").parent().show();
        }
        if (a) {
          b.find("#user-info-hasAcl").removeClass("hide");
          b.find("#employee-rank").val(n.rank);
          if(n.department) {
            b.find("#employee-department").html(app.utils.template("base.department", n.department));
          }
          if(n.superior) {
            b.find("#employee-superior").html(app.utils.template("base.user", n.superior));
            b.find("#employee-superior a").attr("data-value", e.userId);
            b.find("#seniorRow").removeClass("hide");
          } else {
            if(d.shareEntrys && null != d.shareEntrys && 0 != d.shareEntrys.length) {
              b.find("#seniorRow").removeClass("hide");
            }
          }
          if(d.shareEntrys) {
            e.createShareEntryLink(d.shareEntrys);
          }
          if(n.assistant) {
            b.find("#assistant").html(app.utils.template("base.user", n.assistant));
            b.find("#assistant a").attr("data-value", e.userId);
          }
          if(d.openAccess) {
            e.createOpenAccessLink(d.openAccess);
          }
        }
        else {
          b.find("#user-info-hasAcl").remove();
          var u = b.find("#user-info-noAcl");
          u.removeClass("hide");
          u.find("#rank-div .controls").find("." + n.rank).removeClass("hide");
          u.find("#status-div .controls").find("." + n.status).removeClass("hide");
          if(n.department) {
            u.find("#department-div .controls p").html(n.department.name);
          } 
          if(n.superior) {
            u.find("#superior-div .controls p").html(n.superior.name);
          } 
          if(n.assistant) {
            u.find("#assistant-div .controls p").html(n.assistant.name);
          }
          if (d.shareEntrys) {
            for (var g = 0; g < d.shareEntrys.length; g++) {
              var v = d.shareEntrys[g];
              u.find("#other-superior-div .controls").append("<span>" + v.name + "<span>&nbsp;")
            }
          }
          u.find("#openAccessRow").removeClass("hide");
          for (g = 0; g < d.openAccess.length; g++) {
            v = d.openAccess[g];
            u = "";
            u = "#user-info-noAcl #openAccessRow #open-access";
            v = '<span class="entity-item"> <a class="usercard-toggle" data-value="' + v.id + '" userId="' + v.id + '">' + v.name + "</a></span>";
            $("body").find(u).append(v);
          }
        }
        if(null != s) {
          b.find(".accounts_js").find("span").each(function(index) {
            var account = "";
            if(0 == index) {
              account = null == s.account ? s.email: s.account
            } else {
              account = s.mobile;
              if(null == account && null != s.account && s.account != s.email) {
                account = s.email;
              }
            }
            $(this).html(account);
          });
        }
        if(s && s.email && null != s.email && "" != s.email) {
          b.find("#employee-email").attr("readonly", true);
          b.find("#employee-email").addClass("hide");
          b.find("#employee-email-span").removeClass("hide");
        } else {
          b.find("#employee-email-span").addClass("hide");
          b.find("#employee-email").removeClass("hide");
        }
        if(s && s.mobile && null != s.mobile && "" != s.mobile) {
          b.find("#employee-mobile").attr("readonly", !0);
          b.find("#employee-mobile").addClass("hide");
          b.find("#employee-mobile-span").removeClass("hide");
        } else {
          b.find("#employee-mobile-span").addClass("hide");
          b.find("#employee-mobile").removeClass("hide");
        }
        if(c == e.userId) {
          b.find("#employee-unavailable").attr("propertyName", "quit").html("退出团队");
          b.find(".binding_js").show();
          b.find(".remove_js ").hide();
          b.find(".emp-safe-msg").removeClass("hide");
          if(null != s.email && "" != s.email) {
            b.find("#changeEmail").html("[更换绑定]");
            b.find("#changeEmail").attr("propertyName", "againBindingEmail");
            b.find(".emp-safe-msg").addClass("hide");
          }
          if(null != s.mobile && "" != s.mobile) {
            b.find("#changeMobile").html("[更换绑定]");
            b.find("#changeMobile").attr("propertyName", "againBindingMobile");
            b.find(".emp-safe-msg").addClass("hide");
          }
          if(null != s.email && "" != s.email && null != s.mobile && "" != s.mobile) {
            b.find(".remove_js").show();
          }
          b.find("#btn-changePwd").removeClass("hide");
        } else {
          b.find(".binding_js").remove();
          a && b.find("#btn-resetPwd").removeClass("hide");
          if(n.avatar) {
            b.find("#upload-avatar").append('<div class="user-photo"><img id="avatar-img" class="avatar-img" alt="头像" src="' + n.avatar + '"></div>');
          }
        }
        b.find("#ROLE_ADMIN").prop("checked", n.admin);
        app.utils.layout(e.el + " #user-container");
      });
      e.delegateHasAclEvents()
    },
    saveEmployee: function(e) {
      if (!a.validate(e)) return ! 1;
      var b = $("#user-info").data("user"),
      c = $.trim(e.val()),
      d = e.attr("id");
      e = e.attr("name");
      var p = "";
      e && (p = e.replace("employee.", ""));
      var n = {};
      n["employee.id"] = $("#employee-id").val();
      n.propertyName = p;
      n[e] = c;
      if ("typeahead-department" == d) n["employee.department"] = $("#employee-department a").attr("data-value"),
      n.propertyName = "department";
      else if ("typeahead-superior" == d) n["employee.superior.id"] = $("#employee-superior a").attr("userid"),
      n.propertyName = "superior";
      else if ($.trim(b[p]) == $.trim(n[e])) return;
      "employee-username" == d && "" == c ? f.notify("\u59d3\u540d\u4e0d\u80fd\u4e3a\u7a7a\uff01") : this.model.saveEmployeeProperty(n,
      function(a) {
        if (a.message) return "\u56e2\u961f\u5df2\u6709\u4eba\u4f7f\u7528\u8be5\u624b\u673a\uff01" == a.message ? ($("#employee-mobile-repeat").fadeIn(300), $("#employee-mobile-repeat").fadeOut(3E3)) : "\u56e2\u961f\u5df2\u6709\u4eba\u4f7f\u7528\u8be5\u90ae\u7bb1\uff01" == a.message && ($("#employee-email-repeat").fadeIn(300), $("#employee-email-repeat").fadeOut(3E3)),
        f.notify(a.message);
        $("#user-info").data("user", a.employee);
        a.employee.superior && $("#seniorRow").removeClass("hide");
        TEAMS.currentUser.department.name = a.employee.department.name;
        TEAMS.currentUser.department.id = a.employee.department.id;
        f.notify("\u4fdd\u5b58\u6210\u529f")
      })
    },
    resignation: function(a) {
      var e = this;
      var container = $(e.el + " #user-container");
      var b = container.find("#employee-username").val();
      f.confirm("\u786e\u5b9a\u8981\u5c06\u3010" + b + "\u3011\u79bb\u804c\u5417\uff1f",
      function(b) {
        b && e.model.resignation(e.userId,
        function(e) {
          e.message ? f.notify(e.message) : "unavailable" == e.employee.status && (f.notify("\u64cd\u4f5c\u6210\u529f"), container.find("#employee-status").html("\u79bb\u804c"), container.find("#ROLE_ADMIN").parent().parent().parent().hide(), container.find("#passwd-btn").hide(), a.parent().hide(), container.find("#employee-available").parent().show())
        })
      })
    },
    quitCompany: function() {
      var a = this;
      f.confirm("\u9000\u51fa\u60a8\u5c06\u4e3a\u65e0\u56e2\u961f\u72b6\u6001\uff0c\u786e\u5b9a\u8981\u9000\u51fa\u56e2\u961f\u5417\uff1f",
      function(e) {
        e && a.model.quitCompany(null,
        function(a) {
          a.message ? f.notify(a.message) : "unavailable" == a.employee.status && (window.location.href = TEAMS.passportUrl + "/logout")
        })
      })
    },
    rehire: function(a) {
      var e = this;
      var container = $(e.el + " #user-container");
      var b = container.find("#employee-username").val();
      f.confirm("\u786e\u5b9a\u8981\u5c06\u3010" + b + "\u3011\u8fd4\u8058\u5417\uff1f",
      function(b) {
        b && e.model.rehire(e.userId,
        function(e) {
          f.notify(e.employee.status);
          e.message ? f.notify(e.message) : "normal" == e.employee.status && (f.notify("\u64cd\u4f5c\u6210\u529f"), container.find("#employee-status").html("\u5728\u804c"), container.find("#ROLE_ADMIN").removeAttr("checked"), container.find("#ROLE_ADMIN").parent().parent().parent().show(), container.find("#passwd-btn").show(), a.parent().hide(), container.find("#employee-unavailable").parent().show())
        })
      })
    },
    saveOtherSenior: function(a) {
      var e = this,
      b = this.model,
      c = !1,
      d = "";
      if (a && !$.isEmptyObject(a)) {
        var n = "";
        a = $.isArray(a) ? a: [a];
        for (var s = [], u = 0; u < a.length; u++) {
          var g = a[u];
          e.hasUser(g.id, $("body").find("#business-employee-superior")) || (e.hasUser(g.id, $("body").find("#employee-superior")) ? (c = !0, d += g.name + ",") : (n += g.id + ",", s.push({
            sid: g.id,
            name: g.name
          })))
        }
        c && f.notify(d.substring(0, d.length - 1) + "\u5df2\u7ecf\u5b58\u5728\u4e8e\u4e0a\u7ea7");
        n = n.substring(0, n.length - 1);
        b.sids = n;
        b.subordinateUserId = e.userId;
        s && 0 < s.length && b.saveOtherSenior(function(a) {
          a.message ? f.notify(a.message) : (f.notify("\u6dfb\u52a0\u5176\u4ed6\u4e0a\u7ea7\u6210\u529f"), e.createShareEntryLink(a.shareEntrys))
        })
      }
    },
    createShareEntryLink: function(a) {
      if (a) for (var e = 0; e < a.length; e++) {
        var b = a[e],
        c = "",
        c = "#business-employee-superior",
        b = '<span class="entity-item"> <a class="usercard-toggle" data-value="' + b.id + '" userId="' + b.id + '">' + b.name + "</a></span>";
        $("body").find(c).append(b)
      }
    },
    hasUser: function(a, e) {
      var b = !1;
      e.find("a").each(function() {
        var e = $(this).attr("userid");
        parseInt(e) == parseInt(a) && (b = !0)
      });
      return b
    },
    hasSenior: function() {
      var a = !1,
      e = 0,
      b = 0;
      $("#employee-superior").find("a").each(function() {
        e++
      });
      $("#business-employee-superior").find("a").each(function() {
        b++
      });
      0 < e + b && (a = !0);
      return a
    },
    saveAssistant: function(a) {
      var e = this.model;
      e.sids = this.userId;
      e.assistantId = a.id;
      e.saveAssistant(function(a) {
        a.message ? f.notify(a.message) : ($("#assistant").html(f.template("base.user", a.employee.assistant)), $("#assistant a").attr("data-value", a.employee.assistant.id), f.notify("\u6dfb\u52a0\u52a9\u7406\u6210\u529f"))
      })
    },
    saveOpenAccess: function(a) {
      var e = this,
      b = this.model;
      if (a && !$.isEmptyObject(a)) {
        var c = "";
        a = $.isArray(a) ? a: [a];
        for (var d = [], n = 0; n < a.length; n++) {
          var s = a[n];
          e.hasUser(s.id, $("body").find("#open-access")) || (c += s.id + ",", d.push({
            sid: s.id,
            name: s.name
          }))
        }
        c = c.substring(0, c.length - 1);
        b.sids = c;
        b.openAccessId = e.userId;
        d && 0 < d.length && b.saveOpenAccess(function(a) {
          a.message ? f.notify(a.message) : (f.notify("\u6743\u9650\u5f00\u653e\u6210\u529f"), e.createOpenAccessLink(a.openAccess))
        })
      }
    },
    createOpenAccessLink: function(a) {
      if (a) for (var e = 0; e < a.length; e++) {
        var b = a[e],
        c = "",
        c = "#open-access",
        b = '<span class="entity-item"> <a class="usercard-toggle" data-value="' + b.id + '" userId="' + b.id + '">' + b.name + "</a></span>";
        $("body").find(c).append(b)
      }
    },
    remove: function() {
      var a = $(this.el);
      a.off(".profile");
      a.empty()
    }
  });

}(window, app, Backbone, jQuery, _, moment));