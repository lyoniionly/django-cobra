(function (window, app, Backbone, jQuery, _) {
  "use strict";

  var $ = jQuery;

  var pages = {};

  app.components = {};

  app.components.Top = Backbone.View.extend({
    initialize: function(b) {
//      this.model = new c;
//      this.newmessage = new a;
      if($("#header").length>0) {
        this.custmenumodel = new app.models.CustMenuModel();
        app.config.custshowmenus = this.custmenumodel.getMenuElTpl(_.sortBy(_.filter(empMenusContext, function(a) {
          return 1 == a.menuStatus
        }), "orderIndex"));
        app.config.custhidemenus = this.custmenumodel.getMenuElTpl(_.sortBy(_.filter(empMenusContext, function(a) {
          return 0 == a.menuStatus
        }), "orderIndex"));
        $("#header").html(app.utils.template("component.top", app.config));
      }

//      app.utils.layout("#header #navigation .j_userlistScroll");
//      this.modifyCrmsPath();
//      this.crmService = new q;
      $(window).trigger("resize");
    },
    delegateEvents: function() {
      var a = this,
      b = this.model;
      $("#user-panel").off("mouseenter", ".js_userTab li").on("mouseenter", ".js_userTab li", function(b) {
        var c = $(this);
        b = setTimeout(function() {
          var b = c.attr("data-items");
          $("#user_followbtn").hide();
          $("#user-panel .js_userTab li").removeClass("active");
          c.addClass("active");
          $("#user-panel .user-list").addClass("hide");
          if("user_follow" == b) {
            $("#user_followbtn").show();
            $("#user-panel #user_follow").removeClass("hide");
            if(!$("#user-panel #user_follow").hasClass("no-follow") && 0 >= $("#user-panel #user_follow").children().length) {
              a.renderMyfollow(!0);
            }
          }
          "user_mysub" == b && ($("#user-panel #user_mysub").removeClass("hide"), 0 >= $("#user-panel #user_mysub").children().length && a.renderSubordinate(!0));
          "user_org" == b && ($("#user-panel #user_org").removeClass("hide"), 0 >= $("#user-panel #user_org").children().length && a.renderOrgMembers(!0))
        },
        300);
        c.data("timmer", b)
      }).on("mouseleave", ".nav-tabs li", function(a) {
        (a = $(this).data("timmer")) && clearTimeout(a)
      });
      $("body").off("mouseenter.dropdownmenu", ".dropdown-menu-toggle").on("mouseenter.dropdownmenu", ".dropdown-menu-toggle", function(b) {
        ! $("#user-panel #user_follow").hasClass("no-follow") && 0 >= $("#user-panel #user_follow").children().length && a.renderMyfollow(!0, !0);
        $("#j_dropUser .js_userTab").removeClass("hide");
        $("#j_dropUser .j_userlistScroll").removeClass("hide");
        $("#j_dropUser .j_user-search-container").addClass("hide")
      });
      $("#user-panel").on("click", "li.more", function(c) {
        switch ($(this).attr("for")) {
        case "user_follow":
          $(this).hide();
          b.myfollowPage.pageNo++;
          a.renderMyfollow();
          break;
        case "user_mysub":
          $(this).hide();
          b.subordinatePage.pageNo++;
          a.renderSubordinate();
          break;
        case "user_org":
          $(this).hide();
          b.userPage.pageNo++;
          a.renderOrgMembers();
          break;
        case "search-result":
          c = {},
          c.keywords = $(this).attr("kwords"),
          $(this).hide(),
          b.searchUserPage.pageNo++,
          a.renderSearch(c, !1)
        }
      });
      $("body").on("click", ".j_addFollow", function(a) {
        var b = $(this);
        b.data("addFollowCallback",
        function() {
          $("#follow-container").find("#follower-add").click();
          b.data("addFollowCallback", null)
        });
        $("#follow-container").find("#follower-add").click();
        ROUTER.navigate("/users/myfollow", {
          trigger: !0
        })
      });
      $("body").on("click", ".j_clickhide", function(a) {
        $("#navigation #j_dropUser").hide()
      });
      $("#logout").on("click", function(a) {
        f.confirm("\u786e\u5b9a\u8981\u9000\u51fa\u5417?", function(a) {
          a && (0 < navigator.userAgent.indexOf("MSIE") && (0 < navigator.userAgent.indexOf("MSIE 6.0") || 0 < navigator.userAgent.indexOf("MSIE 7.0") || 0 < navigator.userAgent.indexOf("MSIE 8.0") || 0 < navigator.userAgent.indexOf("MSIE 9.0")) || $.websocket.close(), window.location = "/logout")
        })
      });
      $("body").on("mouseenter", ".j_messageCount", function() {
        $(this).find(".message-count").removeClass("hint");
//        d.clear();
      });
      $("body").on("keyup", "#searchTop", function(a) {
        var b = $.trim($(this).val()),
        b = b.replace(/\%/g, "");
        13 == a.which && b && 0 < b.length && (b = b.replace(/\\/g, "\\\\"), ROUTER.navigate("/search/keywords/" + b, {
          trigger: !0
        }));
        $("body").find("#middlePageSearch").val(b)
      });
      $("body").on("click", "#searchTopIcon", function(a) {
        a = $.trim($("#searchTop").val()); (a = a.replace(/\%/g, "")) && 0 < a.length && (a = a.replace(/\\/g, "\\\\"), ROUTER.navigate("/search/keywords/" + $.trim(a), {
          trigger: !0
        }));
        $("#searchTop").val(a)
      });
      $("#left").off("refresh").on("refresh", function(a, b) {
        var c = $("#statistic-panel .nav-tabs li.active");
        switch (b) {
        case "latest":
          "latest" == c.attr("data-items") && c.trigger("click");
          break;
        case "watched":
          "watched" == c.attr("data-items") && c.trigger("click")
        }
      });
      $("body").on("click", "#mainline-create-fast", function(b) {
        a.mainlinenew = new h({
          parentEl: "body",
          userId: a.userId,
          callback: function(b) {
            a.mainlinenew.hide();
            ROUTER.app.lastPage && ("mainline" == ROUTER.app.lastPage.pageKey ? ROUTER.app.lastPage.mainView.insertMainline(b) : -1 < ROUTER.app.lastPage.pageKey.indexOf("mainlinelinkpage#") && ROUTER.app.lastPage.mainView.insertMainline(b))
          }
        });
        a.mainlinenew.render()
      });
      $("body").on("click", "#document-create-fast", function(b) {
        a.documentnewview = new m({
          userId: a.userId,
          callback: function(a) {
            ROUTER.app.lastPage && ROUTER.app.lastPage.pageKey == "documentpage#" + TEAMS.currentUser.id + "mine" && ROUTER.app.lastPage.mainView.insertDocument(a)
          }
        });
        a.documentnewview.render()
      });
      $("body").on("click", ".j_joinOrCreate,.j_joinOrCreate_dropdown", function(a) { (new p({
          userId: app.config.currentUser.id,
          parentEl: ""
        })).render()
      });
      $("body").on("click", "#module_notice a.close", function(a) {
        $(this).parent().addClass("hide")
      });
      $("body").on("click", "#module_notice span a", function(a) {
        $("#module_notice a.close").trigger("click")
      });
      $("body").on("click", "#contactRecord-create-fast", function(b) {
        b = g("crm/customer/remind/FastContactRecordView");
        a.fastContactRecordView = new b({
          callback: function(a) {}
        });
        a.fastContactRecordView.render()
      });
      $("body").off("keyup", "#user-search").on("keyup", "#user-search", function(b) {
        var c = {},
        e = $.trim($(this).val()),
        e = e.replace(/\%/g, "");
        13 == b.which && e && 0 < e.length && ($("#j_dropUser .js_userTab").addClass("hide"), $("#j_dropUser .j_userlistScroll").addClass("hide"), $("#j_dropUser .j_user-search-container").removeClass("hide"), $("#j_dropUser #search-result").removeClass("hide"), $(".j_user-search-container #search-result").empty(), c.keywords = e.replace(/\\/g, "\\\\"), a.renderSearch(c, !0));
        if ("" == e || 0 == e.length) $("#j_dropUser .js_userTab").removeClass("hide"),
        $("#j_dropUser .j_userlistScroll").removeClass("hide"),
        $("#j_dropUser .j_user-search-container").addClass("hide");
        $("#user-search").val(e)
      });
      $("body").off("click", "#user-search-icon").on("click", "#user-search-icon", function(b) {
        b = {};
        var c = $.trim($("#j_dropUser #user-search").val()),
        c = c.replace(/\%/g, "");
        $("#j_dropUser .js_userTab").addClass("hide");
        $("#j_dropUser .j_userlistScroll").addClass("hide");
        $("#j_dropUser .j_user-search-container").removeClass("hide");
        $("#j_dropUser #search-result").removeClass("hide");
        $(".j_user-search-container #search-result").empty();
        b.keywords = c.replace(/\\/g, "\\\\");
        a.renderSearch(b, !0);
        $("#user-search").val(c)
      });
      $("body").off("click.top", ".j_teams-swich ul.dropdown-menu li").on("click.top", ".j_teams-swich ul.dropdown-menu li", function() {
        if (!$(this).hasClass("active")) {
          var a = $(this).data("employeeId");
          location.href = TEAMS.passportUrl + "/changeTenant?employeeId=" + a
        }
      })
    },
    render: function() {
      var a = this,
      b = app.utils.uuid(),
      c = navigator.userAgent,
      h = !1;
      if (0 < c.indexOf("AppleWebKit")) {
        for (var c = navigator.userAgent.split("/"), k = 0; k < c.length; k++) 0 < c[k].indexOf("Safari") && (c = c[k].split(" ")[0]);
        8 > parseInt(c) && (h = !0)
      }
      /*h || 0 < navigator.userAgent.indexOf("MSIE") && (0 < navigator.userAgent.indexOf("MSIE 6.0") || 0 < navigator.userAgent.indexOf("MSIE 7.0") || 0 < navigator.userAgent.indexOf("MSIE 8.0") || 0 < navigator.userAgent.indexOf("MSIE 9.0")) ? (POLLING.register(e.feedCounter), POLLING.register(e.messageCounter), POLLING.register(e.blogCounter)) : $.websocket("/websocket/portal", a.userId ? a.userId: TEAMS.currentUser.id, TEAMS.currentTenant.tenantKey, "protal", b,
      function(a) {
        if (void 0 != a.chatMessage) $("body").trigger("chatMessage", a),
        $("body").trigger("history", a);
        else if (void 0 != a.channel)"updateChannelName" == a.operateType ? ($("body").trigger("updateChannelName0", a), $("body").trigger("updateChannelName1", a), $("body").trigger("updateChannelName2", a)) : "createChannel" == a.operateType ? $("body").trigger("createChannel0", a) : "quitChannel" == a.operateType ? $("body").trigger("quitChannel0", a) : "addUsers" == a.operateType ? $("body").trigger("addUsers0", a) : "deleteChannel" == a.operateType && $("body").trigger("deleteChannel", a);
        else {
          var b = !1,
          c = $("#navigation .j_messageCount a.j_unreadblog span").html(),
          h = $("#navigation .j_messageCount a.j_newitem span").html(),
          f = $("#navigation .j_messageCount a.j_newcomment span").html(),
          k = $("#navigation .j_messageCount a.j_newfinish span").html(),
          m = $("#navigation .j_messageCount a.j_atme span").html();
          if (null == c || "" == c) c = 0;
          if (null == h || "" == h) h = 0;
          if (null == f || "" == f) f = 0;
          if (null == k || "" == k) k = 0;
          if (null == m || "" == m) m = 0;
          var n = $("#navigation .j_messageCount a.j_wechat span").html(),
          g = $("#navigation .j_messageCount a.j_remind span").html(),
          p = $("#navigation .j_messageCount a.j_follow span").html(),
          q = $("#navigation .j_messageCount a.j_applyJoin span").html(),
          s = $("#navigation .j_messageCount a.j_shareJoin span").html();
          if (null == n || "" == n) n = 0;
          if (null == g || "" == g) g = 0;
          if (null == p || "" == p) p = 0;
          if (null == q || "" == q) q = 0;
          if (null == s || "" == s) s = 0;
          $("#j_dropMessage li a span").html("");
          $(".statistic-panel .panel-border").show();
          $(".statistic-panel .statistic-line").show();
          var u = a.unreadBlogCount,
          w = a.feedCount.newitem,
          v = a.feedCount.newcomment,
          l = a.feedCount.newfinish,
          r = a.feedCount.atme;
          $("#navigation .j_messageCount a.j_unreadblog span").html(u);
          $("#navigation .j_messageCount a.j_newitem span").html(w);
          $("#navigation .j_messageCount a.j_newcomment span").html(v);
          $("#navigation .j_messageCount a.j_newfinish span").html(l);
          $("#navigation .j_messageCount a.j_atme span").html(r);
          a.feedCount && (a.feedCount.newitem ? $("#j_dropMessage a.j_newitem span").html(a.feedCount.newitem) : $("#j_dropMessage a.j_newitem span").html(""), a.feedCount.newcomment ? $("#j_dropMessage a.j_newcomment span").html(a.feedCount.newcomment) : $("#j_dropMessage a.j_newcomment span").html(""), a.feedCount.newfinish ? $("#j_dropMessage a.j_newfinish span").html(a.feedCount.newfinish) : $("#j_dropMessage a.j_newfinish span").html(""), a.feedCount.atme ? $("#j_dropMessage a.j_atme span").html(a.feedCount.atme) : $("#j_dropMessage a.j_atme span").html(""));
          if (a.messageCounts) for (u = 0; u < a.messageCounts.length; u++) w = a.messageCounts[u],
          $("#j_dropMessage li a.j_" + w.messageType + " span").html(0 == w.count ? "": w.count);
          a.wechatCount && $("#j_dropMessage li a.j_wechat span").html(0 == a.wechatCount ? "": a.wechatCount);
          a = $("#navigation .j_messageCount a.j_unreadblog span").html();
          u = $("#navigation .j_messageCount a.j_newitem span").html();
          w = $("#navigation .j_messageCount a.j_newcomment span").html();
          v = $("#navigation .j_messageCount a.j_newfinish span").html();
          l = $("#navigation .j_messageCount a.j_atme span").html();
          if (null == a || "" == a) a = 0;
          if (null == u || "" == u) u = 0;
          if (null == w || "" == w) w = 0;
          if (null == v || "" == v) v = 0;
          if (null == l || "" == l) l = 0;
          var r = $("#navigation .j_messageCount a.j_wechat span").html(),
          N = $("#navigation .j_messageCount a.j_remind span").html(),
          O = $("#navigation .j_messageCount a.j_follow span").html(),
          L = $("#navigation .j_messageCount a.j_applyJoin span").html(),
          M = $("#navigation .j_messageCount a.j_shareJoin span").html();
          if (null == r || "" == r) r = 0;
          if (null == N || "" == N) N = 0;
          if (null == O || "" == O) O = 0;
          if (null == L || "" == L) L = 0;
          if (null == M || "" == M) M = 0;
          a > c && (b = !0);
          u > h && (b = !0);
          w > f && (b = !0);
          v > k && (b = !0);
          l > m && (b = !0);
          r > n ? (b = !0, $(".smwx-msg-number").html("(" + r + ")").data("count", r), $(".smwx-mini-list-trigger").addClass("high-light")) : ($(".smwx-msg-number").html("").data("count", 0), $(".smwx-mini-list-trigger").removeClass("high-light"));
          N > g && (b = !0);
          O > p && (b = !0);
          L > q && (b = !0);
          M > s && (b = !0);
          e.totaling();
          c = $("#navigation #j_message em.message-count").html();
          d.needRemind() && b && null != c && "" != c ? d.show() : (null == c || "" == c || $("#navigation #j_message em.message-count").hasClass("hide")) && d.clear()
        }
      },
      function() {
        POLLING.register(e.feedCounter);
        POLLING.register(e.messageCounter);
        POLLING.register(e.blogCounter)
      });*/
      app.config.currentUser.avatar && $("#user-panel img").attr("src", app.config.currentUser.avatar);
      this.checkTime();
      app.config.currentUser.activeDate && app.config.currentUser.lastLoginTime && this.inviteModal();
//      this.newmessage.render();
//      a.loadMessage(e.feedCounter);
//      a.loadMessage(e.messageCounter);
//      a.loadMessage(e.blogCounter);
      if(app.config.noSubordinates) {
        $(".j_top_mysubordinates").addClass("hide");
        $(".user-tab").addClass("nosub");
      } else {
        $(".j_top_mysubordinates").removeClass("hide");
        $(".user-tab").removeClass("nosub");
      }
//      this.crmService.isShowMessage(function(a) {
//        0 != a.actionMsg.code ? f.notify(a.actionMsg.message) : a.data && $("#j_dropMessage .j_applyReceive").parent().removeClass("hide")
//      });
//      setInterval(function() {
//        a.processTimeout()
//      },
//      6E5)
    },
    renderMyfollow: function(a, b) {
      /*var c = this,
      e = this.model;
      a && (e.myfollowPage.pageNo = 1);
      $("#user_followbtn").show();
      e.loadMyfollow(function(a) {
        if (a = e.myfollowPage) 1 == e.myfollowPage.pageNo && 0 >= a.result.length && b ? (1 > $("#user_follow").children().length && $("#user_follow").append('<div class="ta-c" style="margin-top:60px"><span>\u76ee\u524d\u6ca1\u6709\u5173\u6ce8\u4eba,\u60a8\u53ef\u4ee5\u70b9\u51fb<a class="j_clickhide j_addFollow">\u52a0\u5173\u6ce8</a>\u6dfb\u52a0\u5173\u6ce8\u4eba\uff01</span></div>'), $("#user-panel .user-list").addClass("hide"), $("#user-panel #user_org").removeClass("hide"), $("#user-panel .js_userTab li").removeClass("active"), $("#user-panel .js_userTab li.j_user_org").addClass("active"), 0 >= $("#user-panel #user_org").children().length && c.renderOrgMembers(!0)) : ($("#user-panel .js_userTab li.j_user_follow").addClass("active"), c._renderUser(a, "user_follow"))
      })*/
    },
    renderSubordinate: function(a) {
      var b = this,
      c = this.model;
      a && (c.subordinatePage.pageNo = 1);
      $("#user_followbtn").hide();
      c.loadSubordinate(function(a) {
        1 == c.subordinatePage.pageNo && 0 == c.subordinatePage.result.length ? $("#user_mysub").append('<div class="ta-c"><span>\u76ee\u524d\u6ca1\u6709\u4e0b\u5c5e\uff01</span></div>') : b._renderUser(c.subordinatePage, "user_mysub")
      })
    },
    renderOrgMembers: function(a) {
      var b = this,
      c = this.model;
      a && (c.userPage.pageNo = 1);
      $("#user_followbtn").hide();
      c.loadOrgMembers(function(a) {
        b._renderUser(c.userPage, "user_org");
        1 == c.userPage.pageNo && 1 == c.userPage.result.length ? $("#user_org").append('<div class="ta-c" style="margin-top:80px">\u56e2\u961f\u6210\u5458\u53ea\u6709\u60a8\u4e00\u4eba\uff0c<a class="invite-toggle">\u9080\u8bf7\u540c\u4e8b</a>\u52a0\u5165\u534f\u4f5c\u5427\uff01</div>') : $("#user_org a.invite-toggle").parent().parent().remove()
      })
    },
    renderSearch: function(a, b) {
      var c = this,
      e = this.model;
      b && (e.searchUserPage.pageNo = 1);
      $("#user_followbtn").addClass("hide");
      e.searchUserByKeywords(a,
      function(a) {
        a = a.keywords;
        0 == e.searchUserPage.result.length ? $(".j_user-search-container .j_noSearchResult").removeClass("hide") : (c._renderUser(e.searchUserPage, "search-result", a), $(".j_user-search-container .j_noSearchResult").addClass("hide"))
      })
    },
    renderNavUrl: function(a, b) {
      $(".j_basenav .j_blog_NoAuthority").addClass("hide");
      if(a && a != app.config.currentUser.id) {
        ($("#navigation").addClass("navigation-themeB"), $(".j_hidetosub").addClass("hide"), $(".user-nameof").removeClass("hide"), $(".j_nav_ul a").each(function(b, c) {
          var e = $(this).data("url");
          if (e) {
            var d = "",
            d = $(c).hasClass("j_modnav-customers") ? app.config.menuCrmContext + "/customer?blogUser=id_" + a: $(c).hasClass("j_modnav-contacts") ? app.config.menuCrmContext + "/contact?blogUser=id_" + a: e + "/" + a;
            $(this).attr("href", d)
          }
        }), app.config.blogUser && app.config.blogUser.id == a || $.ajax({
          url: "/base/employee/" + a + ".json",
          type: "get",
          dataType: "json",
          async: !1,
          success: function(a) {
            if (a.employee) {
              var c = a.employee;
              $("#user-panel .user-name").html(c.username);
              $("#user-panel img.j_user-currentAvatar").attr("src", c.avatar ? c.avatar: "/static/images/avatar.png");
              $("#user-panel img.j_user-avatar").attr("src", app.config.currentUser.avatar ? app.config.currentUser.avatar: "/static/images/avatar.png");
              $(".j_basenav .j_homeli").addClass("hide");
              $(".j_basenav #top_menuset").parent().addClass("hide");
              $(".j_baseautolis").addClass("hideli");
              a.employee && a.employee.subordinate ? ($(".j_basenav #more-menu").show(), $(".j_pageActive .j_modnav-report").addClass("hide"), $(".j_pageActive .j_modnav-wechat").addClass("hide"), $(".j_pageActive .j_modnav-form").addClass("hide"), $(".j_pageActive .j_modnav-wechatservice").addClass("hide")) : ($(".j_pageActive .j_modnav-report").removeClass("hide"), $(".j_pageActive .j_modnav-wechat").removeClass("hide"), $(".j_pageActive .j_modnav-form").removeClass("hide"), $(".j_pageActive .j_modnav-wechatservice").removeClass("hide"), $(".j_basenav #more-menu").hide());
              $(".j_pageActive .group dl").each(function() {
                var a = !0;
                $(this).find("a").each(function() {
                  $(this).hasClass("hide") || (a = !1)
                });
                a ? $(this).hide() : $(this).show()
              });
              $(".j_to-myspace").removeClass("hide");
              app.config.blogUser = c;
              b && b();
              $(window).trigger("resize")
            }
          }
        }))
      } else {
        $(".j_hidetosub").removeClass("hide");
        $(".user-nameof").addClass("hide");
        $("#navigation").removeClass("navigation-themeB");
        $("#user-panel .user-name").html(app.config.currentUser.username);
        $("#user-panel img.j_user-currentAvatar").attr("src", app.config.currentUser.avatar ? app.config.currentUser.avatar: "/static/images/avatar.png");
        $(".j_nav_ul a").each( function(index) {
          var url = $(this).data("url");
          if(url) {
            $(this).attr("href", url);
          }
        });
        $(".j_basenav #top_menuset").parent().removeClass("hide");
        $(".j_pageActive, .j_pageActive a").removeClass("hide");
        $(".j_basenav .j_blogli").addClass("hide");
        $(".j_basenav #more-menu").show();
        $(".j_baseautolis").removeClass("hideli");
        $(".j_to-myspace").addClass("hide");
        $(".j_pageActive .group dl").each(function() {
          var a = !0;
          $(this).find("a").each(function() {
            $(this).hasClass("hide") || (a = !1)
          });
          a ? $(this).hide() : $(this).show()
        });
        app.config.blogUser = null;
        b && b();
        $(".j_basenav .j_homeli").removeClass("hide");
        $(".j_basenav .j_blogli").addClass("hide");
        $(window).trigger("resize");
      }
    },
    modifyCrmsPath: function() {
      var a = $("#header").find("#menu-customers"),
      b = a.attr("href"),
      c = a.attr("data-url");
      a.attr({
        href: app.config.menuCrmContext + b,
        "data-url": app.config.menuCrmContext + c
      })
    },
    checkTime: function() {
      /*var a = this;
      this.model.checkTime(function(b) {
        a.checkIn = b.checkIn;
        a.checkIn ? $(".j_check_inOrOut").attr("id", "check-out").html("\u7b7e\u9000") : $(".j_check_inOrOut").attr("id", "check-in").html("\u7b7e\u5230")
      })*/
    },
    inviteModal: function() {
      /*if (3 >= app.config.currentTenant.usedLicense) {
        var a = new b;
        $(a.el).find(".modal-title").html("\u60a8\u56e2\u961f\u4e2d\u4eba\u5458\u8fd8\u6bd4\u8f83\u5c11\uff0c\u9a6c\u4e0a\u9080\u8bf7\u81ea\u5df1\u7684\u540c\u4e8b\u6765\u52a0\u5165\uff0c\u4e00\u8d77\u4f53\u9a8c\u4e91\u529e\u516c\u534f\u4f5c");
        a.render()
      }*/
    },
    _renderUser: function(a, b, c) {
      var e = "#" + b;
      "" == b && (e = "#user_org");
      if (a) {
        for (var d = a.result || [], h = 0; h < d.length; h++) {
          var f = a.result[h];
          if (! (0 < $(e).find("#" + f.id).length)) {
            var k = "/static/images/avatar.png";
            null != f.avatar && (k = f.avatar);
            var m = $("#cloneDiv .j_userItems").clone();
            f.relation && "approved" == f.relation || f.id == app.config.currentUser.id || f.subordinate || "user_mysub" == b ? (m.attr("title", f.username), m.find("a").attr("href", "/blog/" + f.id)) : (m.attr("title", f.username), m.removeClass("j_clickhide"), m.find("a").addClass("usercard-toggle"), m.find("a").attr("userId", f.id), m.find("a").removeClass("router"), m.find("a").attr("user-name", f.username));
            m.find("a img").attr("src", k);
            m.find("a em").html(f.username);
            f.id != app.config.currentUser.id ? (k = $("#cloneDiv .j_userItemsWechat").clone(), k.attr("id", f.id).data("employee", f), 0 < f.unReadChatCount && (k.addClass("show"), k.removeClass("hide")), m.append(k)) : m.find("a").attr("id", f.id);
            $(e).append(m)
          }
        }
        $(e).find(".more").remove();
        a.hasNext && ("#search-result" == e ? $(e).append('<li class="user-item more" kwords="' + c + '" for = "' + b + '"><a>\u663e\u793a\u66f4\u591a...</a></li>') : $(e).append('<li class="user-item more" for = "' + b + '"><a>\u663e\u793a\u66f4\u591a...</a></li>'))
      }
    },
    hideMyfollow: function() {
      $("#follow-panel li.follow").hide()
    },
    loadMessage: function(a) {
      var b = a.param ? a.param: {};
      b.count = 1;
      $.ajax({
        type: "get",
        global: !1,
        url: a.url,
        dataType: "json",
        data: b,
        success: function(b) {
          b.actionMsg && -1 == b.actionMsg.code || a.callback && a.callback(b)
        }
      })
    },
    processTimeout: function() {
      $.ajax({
        type: "get",
        global: !1,
        url: "/global",
        dataType: "json",
        success: function(a) {}
      })
    },
    remove: function() {
      this.model = null;
      this.fastContactRecordView && (this.fastContactRecordView.remove(), this.fastContactRecordView = null)
    }
  });

  app.components.event = {
    setLastPage: function(page) {
      pages = page;
    },
    initEvent: function() {
      $.ajaxSetup({
        cache: false
      });
      var g = this;
      /*$(document).ajaxComplete(function(a, b, c) {
        a = {};
        try {
          a = $.parseJSON(b.responseText)
        } catch(e) {}
        g.relogin && a.actionMsg && -1 == a.actionMsg.code ? (g.relogin = !1, (new u({
          currentUser: app.config.currentUser
        })).render()) : g.relogin = !0
      });*/
      $("body").on("click", "table.j_stripedTable td:first-child", function(e) {
        $(this).parent("tr").addClass("active").siblings().removeClass("active");
      });
      $("body").on("mouseenter.dropdownmenu", ".dropdown-menu-toggle", function(a) {
        var b = $(this);
        $(this).hasClass("j_tag") && (new s).render();
        b.addClass("open");
        a = null != b.find(".dropdown-user").get(0) ? setTimeout(function() {
          b.find(".dropdown-user").slideDown("fast")
        },
        300) : null != b.find(".dropdown-tag").get(0) ? setTimeout(function() {
          b.find(".dropdown-tag").slideDown("fast")
        },
        300) : setTimeout(function() {
          b.children(".dropdown-menu").slideDown("fast")
        },
        300);
        b.data("showTimer", a);
        $(this).hasClass("user-panel") && (null == $("body").find(".user-menu-backdrop").get(0) && $("body").append('<div class="user-menu-backdrop fade"></div>'), a = setTimeout(function() {
          $("body").find(".user-menu-backdrop").addClass("in")
        },
        150), $(this).data("dropTimer", a))
      }).on("mouseleave.dropdownmenu", ".dropdown-menu-toggle", function(a) {
        a = $(this).data("showTimer");
        $(this).removeClass("open");
        a && clearTimeout(a);
        $(this).removeData("showTimer");
        $(this).children(".dropdown-menu").slideUp(100);
        $(this).find(".dropdown-user,.dropdown-tag").slideUp(100);
        $(this).hasClass("user-panel") && (a = $(this).data("dropTimer")) && (clearTimeout(a), $("body").find(".user-menu-backdrop").removeClass("in"), setTimeout(function() {
          $("body").find(".user-menu-backdrop").remove()
        },
        150), $(this).removeData("dropTimer"))
      });
      $("body").on("click.dropdownmenu", ".dropdown-menu a",
      function(a) {
        a = $(this).closest(".dropdown-menu-toggle");
        if (0 < a.length) {
          var b = a.data("mode");
          if (b && "select" == b) {
            var b = a.find(".title"),
            c = a.data("entity"),
            e = $(this).data("entity");
            c != e && (b.html($(this).html()), a.data("entity", e), a.trigger("change"))
          }
        }
        a = $($(this).parents(".dropdown")[0]);
        a.hasClass("dropdown-gettext") && (b = $(this).text(), a.find(".dropdown-toggle").html(b + ' <i class="icon-caret-down"></i>'));
        $(this).closest(".dropdown-menu-toggle");
        $(this).closest(".dropdown-menu").slideUp(100)
      });
      $("body").off("mouseenter.typeahead", ".typeahead-wrapper").on("mouseenter.typeahead", ".typeahead-wrapper", function(e) {
        $(this).data("enter", true);
      }).off("mouseleave.typeahead", ".typeahead-wrapper").on("mouseleave.typeahead", ".typeahead-wrapper", function(e) {
        $(this).data("enter", false);
      });
      $("body").off("click.controlbtn", ".control-btn").on("click.controlbtn", ".control-btn", function(e) {
        e.stopPropagation();
        $(this).addClass("hide");
        $(this).siblings(".typeahead-wrapper").removeClass("hide");
        $(this).siblings(".typeahead-wrapper").find(".control-input").focus()
      });
      $("body").off("focusout.controlinput", ".control-input").on("focusout.controlinput", ".control-input", function(e, prefix) {
        e.stopPropagation();
        var $wrapper = $(this).parents(".typeahead-wrapper");
        if(!$wrapper.data("enter") || "tt" == prefix) {
          $wrapper.addClass("hide");
          $wrapper.siblings(".control-btn").removeClass("hide");
          $wrapper.trigger("hide");
        }
      });
      /*$("body").off("click", ".links-control-group a").on("click", ".links-control-group a", function(a) {
        $(this).addClass("hide");
        if (a = $(this).attr("for")) if ("#task-subtask" == a) {
          var b = $("#subtaskClone").clone();
          b.find(".title .text").replaceWith("<input type='text' style='border:none;background-color:transparent;width:450px;' class='title j_nameInput ellipsis' value='' tabindex='-1' maxlength='100' />");
          b.removeAttr("id");
          0 < $("#entitybox-container #task-subtask").length ? ($("#entitybox-container #task-subtask").find(".task-list").append(b), $("#entitybox-container #task-subtask").removeClass("hide"), $("#entitybox-container #task-subtask").find(".j_nameInput").focus()) : ($("#entitySlider #task-subtask").find(".task-list").append(b), $(a).removeClass("hide"), $(a).find(".j_nameInput").focus())
        } else a = $(this).parents(".links-control-group").parent().find(a),
        a.removeClass("hide"),
        a.find(".control-btn").trigger("click"),
        a.trigger("addAttachment")
      });
      $("body").on("click", ".remind-toggle", function(a) {
        if ($(this).attr("userId") || $(this).attr("targetId") || $(this).attr("module"))(0 == $(this).parents("#entitybox").size() ? new h({
          obj: $(this),
          el: "body"
        }) : new h({
          obj: $(this),
          el: "#entitybox"
        })).render(),
        0 < $("#htmleditmodeEsc").length ? $("body").find("#remind-div").css("z-index", "1036") : null != $(".modal-backdrop.fade.in").get(0) && $("body").find("#remind-div").addClass("highIdex")
      });
      $("body").on("click", ".agenda-toggle", function(a) {
        if (($(this).attr("userId") || $(this).attr("targetId") || $(this).attr("module")) && $(this).attr("targetId") && $(this).attr("module")) {
          var b = new Date;
          a = b.getFullYear();
          var c = b.getMonth(),
          c = c + 1,
          c = 10 > c ? "0" + c: c,
          d = b.getDate(),
          b = d,
          d = d + 1,
          b = a + "-" + c + "-" + (10 > b ? "0" + b: b);
          a = a + "-" + c + "-" + (10 > d ? "0" + d: d);
          b = Date.create(b).getTime();
          a = Date.create(a).getTime();
          var h = new e({
            entityModule: "agenda",
            obj: $(this),
            entityId: "new",
            allDay: !0,
            start: b,
            end: a,
            callbacks: {
              afterOpen: function() {
                $("#entitybox-container .j_title").focus()
              },
              afterOperate: function() {
                h.close();
                app.alert('success', "日程创建成功");
              }
            }
          });
          h.render()
        }
      });*/
      $("body").on("click", ".entitybox-toggle", function(a) {
        var b = $(this).attr("data-module");
        a = $(this).attr("data-id");
        var c = $(this).attr("data-target"),
        d = $(this).attr("data-value"),
        h = $(this).attr("userId"),
        f = $(this).attr("data-type");
        if (b && a) {
          var k = new app.components.EntityBox({
            entityModule: b,
            entityId: a,
            entityValue: d,
            dataType: f,
            target: $(this),
            userId: h,
            callbacks: {
              afterOpen: function() {
                c && $("#entitybox-container " + c).focus()
              },
              afterOperate: function() {
                k.close();
                "agenda" == b && (1 == $("#portal-container #calendar-list").size() && $("#portal-container #calendar-list").trigger("refresh"), $("#calendar").trigger("refetch"))
              }
            },
            page: pages
          });
          k.render()
        }
      });
      $("body").on("click", ".usercard-toggle", function(e) {
        var userId = $(this).attr("userId");
        if(userId && "10000" != userId) {
          (new b({
            targetEl: $(this),
            userId: userId
          })).render();
        }
      });
      /*$("body").on("click", ".remindcard-toggle",
      function(b) { (b = $(this).attr("data-id")) && (new a({
          targetEl: $(this),
          userId: b
        })).render()
      });
      $("body").on("click", ".locus-toggle",
      function(a) {
        a = $(this).attr("user-id");
        var b = $(this).attr("user-name");
        a && (new d({
          userId: a,
          userName: b
        })).render()
      });
      $("body").on("click", ".entity-toggle",
      function(a) {
        a = $(this);
        var b = $(this).parents(".mainline-controls"),
        e = [],
        d = $(this).find("#js_customer-import-btn").attr("taskid");
        1 == b.size() && b.find(".entity-container .entity-item").each(function() {
          e.push($(this).data("object"))
        });
        b = a.prev("input"); (new c({
          targetEl: a,
          keyword: b ? b.val() : "",
          currentTaskId: d,
          module: a.attr("module"),
          type: a.attr("data-type"),
          seletedList: e
        })).render()
      });*/
      $("body").off("mouseenter", ".entity-item").on("mouseenter", ".entity-item", function(e) {
        if(!$(this).attr("undeletable") && !$(this).parents(".entity-container").attr("undeletable")) {
          $(this).find("a:first").after('<a class="close" title="删除">&times;</a>');
        }
      });
      $("body").off("mouseleave", ".entity-item").on("mouseleave ", ".entity-item", function(e) {
        $(this).find(".close").remove();
      });
      $("body").off("click", ".entity-item .close").on("click ", ".entity-item .close", function(evt) {
        var entityItemId = $(this).prevAll("a").attr("id");
        var shareId = $(this).prevAll("a").attr("data-value"),
        $container = $(this).parents(".entity-container"),
        url = $container.attr("data-url");
        if (url && shareId) {
          var $parent = $(this).parent(),
          data = $container.data("param") || {};
          data._method = "delete";
          var removeEntity = function(sure) {
            sure && $.ajax({
              type: "POST",
              dataType: "json",
              data: data,
              url: url.replace("{id}", shareId),
              success: function(res) {
                $parent.remove();
                $container.trigger("removeEntity", res);
                $("#stream").trigger("insertStream", res.streams || res.stream);
                $("#readinfo").trigger("updateReadInfo");
                app.alert('success', "数据已删除");
              }
            })
          };
          if($container.attr("data-noConfirm")) {
            removeEntity(true);
          } else {
            f.confirm("确定要删除吗？", removeEntity);
          }
        } else {
          if(!$(this).parent().hasClass("tag")) {
            $(this).parent(".entity-item").remove();
            $container.trigger("removeEntity", entityItemId);
          }
        }
      });
      $("body").off("click", ".j_btn_close").on("click ", ".j_btn_close", function(e) {
        var $entitybox = $(this).parents("#entitybox");
        if($entitybox) {
          if(0 < $entitybox.length) {
            $entitybox.find(".modal-header .close").click();
          } else {
            $("body").trigger("slideClose");
          }
        }
      });
      $("body").off("triggerClose").on("triggerClose", function(e) {
        var pathName = location.pathname;
        var hash = location.hash;
        pathName = pathName.substring(0, pathName.lastIndexOf("/"));
        if("" == pathName && "" != hash) {
          pathName = "/" + hash.substring(1, hash.lastIndexOf("/"));
        }
        ROUTER.navigate(pathName, {
          trigger: true
        })
      });
      /*$("body").off("click", ".j_center .e-list .checkbox").on("click", ".j_center .e-list .checkbox",
      function(a) {
        var b = !1;
        $(this).find("i").hasClass("icon-checkbox-checked") && (b = !0);
        a.stopPropagation();
        $(this).find("i").toggleClass("icon-checkbox-checked").toggleClass("icon-checkbox-unchecked");
        $(this).parent("li").toggleClass("selected");
        b ? $(".main .j_check-all").addClass("icon-checkbox-unchecked").removeClass("icon-checkbox-checked") : 0 == $(".j_center .e-list i.icon-checkbox-unchecked").size() && $(".main .j_check-all").removeClass("icon-checkbox-unchecked").addClass("icon-checkbox-checked");
        $("body").trigger("batch")
      });
      $("body").off("click", ".j_check-all").on("click", ".j_check-all",
      function() {
        var a = !1;
        $(this).hasClass("icon-checkbox-checked") && (a = !0);
        a ? $(this).parents(".main").find(".j_center span.checkbox").each(function() {
          $(this).find("i").removeClass("icon-checkbox-checked").addClass("icon-checkbox-unchecked");
          $(this).parent("li").removeClass("selected")
        }) : $(this).parents(".main").find(".j_center span.checkbox").each(function() {
          $(this).find("i").addClass("icon-checkbox-checked").removeClass("icon-checkbox-unchecked");
          $(this).parent("li").addClass("selected")
        });
        $(".main .j_check-all").toggleClass("icon-checkbox-checked").toggleClass("icon-checkbox-unchecked");
        $("body").trigger("batch")
      });
      $("body").off("batch").on("batch",
      function(a) {
        0 < $(".main").find(".j_center .selected").size() ? ($("body").addClass("batch-open"), $(".j_batchEl").removeClass("hide")) : ($("body").removeClass("batch-open"), $(".j_batchEl").addClass("hide"))
      });*/
      $("body").off("click", ".typeahead-search,.selector-toggle").on("click", ".typeahead-search,.selector-toggle", function() {
        var a = $(this);
        switch (a.attr("data-entity")) {
        case "employee":
          (new window.UserSelector({
            $target: $(this)
          })).open();
          break;
        case "department":
          (new window.DepartmentSelector({
            $el: $(this)
          })).open();
          break;
        case "group":
          (new p({
            $el: $(this)
          })).open();
          break;
        case "formLabel":
          (new n({
            $el: $(this)
          })).open();
          break;
        case "tag":
          var b = "1" == a.siblings("input").attr("privacy") ? !0 : !1; (new k({
            $el: $(this),
            privacy: b
          })).open()
        }
        a = a.parents(".typeahead-wrapper");
        0 < a.length && a.find(".control-input").trigger("focusout.controlinput", "tt")
      });
      /*$("body").off("click", ".btn-back,.btn-group .back").on("click", ".btn-back,.btn-group .back",
      function(a) {
        0 < $(this).parents("#entitySlider").size() ? $("body").trigger("slideClose") : 0 < $(this).parents("#entitybox").size() ? $("#entitybox").modal("hide") : history.back();
        return ! 1
      });
      $("body").off("click", ".btn-feedback").on("click", ".btn-feedback",
      function() {
        var a = $(this).parents("#entitybox");
        0 == a.length && (a = $("#entitySlider"));
        a.find(".extend-comment").hasClass("active") ? a.find("#comment-textarea").focus() : a.find(".extend-comment").trigger("click.extend");
        var b = a.find(".extend-panel").position().top;
        a.find(".scrollwrapper").mCustomScrollbar("scrollTo", b - 100)
      });
      $("body").off("click", ".share-join").on("click", ".share-join",
      function() {
        var a = $(this).attr("entityId"),
        b = $(this).attr("module");
        $.ajax({
          type: "post",
          dataType: "json",
          data: {
            entityId: a,
            module: b
          },
          url: "/blog-message/shareApply.json",
          success: function(a) {
            app.alert('success', '共享申请已发送');
          }
        })
      });*/
      $(window).on("resize", function(a) {
        setTimeout(function() {
          $("body div.scrollwrapper").each(function(a) {
            $(this).trigger("resizeSroll", a)
          })
        },
        100);
        if (0 < $("body").find("#navigation .j_basenav").length) {
          a = $("body").find("#navigation .j_basenav").offset().top || 0;
          for (var b = $("body").find("#navigation .j_baseautolis li"), c = 0, e = b.length; c < e; c++) if ($(b[c]).hasClass("active")) { ($(b[c]).offset().top || 0) > a ? $("#navigation .j_activeli").addClass("active").html($(b[c]).find("a").clone() || "") : $("#navigation .j_activeli").empty();
            break
          }
        }
      });
      $("body").off("resizeSroll").on("resizeSroll", "div.scrollwrapper",
      function(a) {
        a = $(this);
        if (a.attr("horizontal")) {
          var b = $(window).width(),
          c = a.offset().left;
          a.css("width", b - c)
        } else {
          b = a.attr("height");
          b || (b = a.attr("marginbottom") || 0, c = a.offset().top, b = $(window).height() - c - b);
          if (null != a.parents("#entitybox").get(0)) var e = a.parents("#entitybox").find(".modal-content"),
          c = e.height(),
          e = e.offset().top,
          c = $(window).height() - c - e,
          b = b - c;
          a.css("height", b)
        }
        a.mCustomScrollbar("update")
      });
      /*$("body").off("rViewSlide").on("rViewSlide",
      function(a) {
        1439 < $(window).width() ? ($(".j_sidebarPren").addClass("sidebar-in"), $(".j_sidebarCtrl").data("open", !0).addClass("on")) : ($(".j_sidebarPren").removeClass("sidebar-in"), $(".j_sidebarCtrl").data("open", !1).removeClass("on"));
        setTimeout(function() {
          $(window).trigger("resize.customerTable")
        },
        400)
      });
      $("body").off("click", ".j_sidebarCtrl").on("click", ".j_sidebarCtrl",
      function() {
        $(this).data("open") ? ($(".j_sidebarPren").removeClass("sidebar-in"), $(this).data("open", !1).removeClass("on")) : ($(".j_sidebarPren").addClass("sidebar-in"), $(this).data("open", !0).addClass("on"));
        setTimeout(function() {
          $(window).trigger("resize.customerTable")
        },
        400)
      });
      setInterval(function() {
        $('[data-toggle="tooltip"]').tooltip({
          container: "body",
          animation: !0,
          html: !0
        })
      },
      1E3);
      $("body").off("mouseenter", "li.search").on("mouseenter", "li.search",
      function() {
        var a = $(this).find("input");
        a.focus().addClass("on").attr("placeholder", a.next().attr("title"))
      });
      $("body").off("mouseleave", "li.search").on("mouseleave", "li.search",
      function() {
        var a = $(this).find("input");
        "" == $.trim(a.val()) && a.removeAttr("placeholder").blur().removeClass("on")
      });
      $("body").off("blur", "li.search input").on("blur", "li.search input",
      function() {
        var a = $(this);
        "" == $.trim(a.val()) && a.removeAttr("placeholder").removeClass("on")
      });
      $("body").off("paste", "textarea.smart-title").on("paste", "textarea.smart-title", function(a) {
        if ((a = ((a.originalEvent || a).clipboardData || window.clipboardData).getData("text")) && (0 < a.indexOf("\n") || 0 < a.indexOf("\r"))) return a = a.replace(/[\n\r]/g, ""),
        $(this).val($(this).val() + a),
        !1
      })*/
    }
  };

  app.components.CustMenuView = Backbone.View.extend({
    initialize: function(data) {
      this.userId = data.userId || app.config.currentUser.id;
      this.el = data.container || "body";
      this.container = $(data.container);
      this.model = new app.models.CustMenuModel({
        userId: this.userId
      });
    },
    delegateEvents: function() {
      var self = this,
        menuModel = this.model,
        $el = $(this.el);
      /*$("body").on("click.custMenuView", ".goto-top", function(e) {
        app.utils.gotoTop(self.el + " #menuset-wrapper")
      });*/
      $el.off("click.custMenuView", ".reset-navsetting a").on("click.custMenuView", ".reset-navsetting a", function(e) {
        e.preventDefault();
        menuModel.resetNavsetting(function(res) {
          app.alert('success', "重置成功,刷新页面或重新登录后生效");
          if (res.empmenus) {
            var menus = _.sortBy(res.empmenus, "orderIndex");
            $el.find(".j_sortmenus").empty();
            for (var i = 0; i < menus.length; i++) {
              if (i != 0) {
                var checkd = "";
                if(menus[i].menuStatus === 1) {
                  checkd = 'checked="checked"'
                }
                checkd = '<li class="on_off cs-m"><span class="middle_helper"></span><span data-id="' + menus[i].id + '" class="menu_name">' + menus[i].menuName + '</span><input  type="checkbox" ' + checkd + ' +/><span title="拖拉排序" class="menu_move"></span></li>';
                $el.find(".j_sortmenus").append(checkd)
              }
            }
            $el.find(".j_sortmenus .on_off :checkbox").tzCheckbox({
              labels: ["", ""]
            })
          }
        })
      });
      $el.off("click.custMenuView", ".on_off :checkbox").on("click.custMenuView", ".on_off :checkbox", function(e) {
        var $this = $(this),
          checked = $this.next(".tzCheckBox").hasClass("checked") ? 1 : 0,
          menu = {};
        if ($(".sortmenus").find(".tzCheckBox.checked").length === 0) {
          $this.next("span.tzCheckBox").addClass("open checked");
          app.alert('warning', "请至少保留一个应用!");
        } else {
          var menuId = $this.parents("li").find(".menu_name").attr("data-id");
          self.model.loadEmpAllMenus(function(res) {
            var menus = _.filter(res, function(m) {
              return m.menuStatus === 1
            });
            if(menus.length===1 && menus[0].id===menuId && checked===0) {
              $this.next("span.tzCheckBox").addClass("open checked");
              app.alert('warning', "请至少保留一个应用!");
            } else {
              menu.menuId = menuId;
              menu.menuStatus = checked;
              menuModel.updateMenuStatus(menu, function(a) {
                app.alert('success', "更新成功,刷新页面或重新登录后生效");
              });
            }
          })
        }
      });
    },
    render: function() {
      var el = this.el,
        $container = this.container,
        self = this;
      this.model.loadEmpAllMenus(function(res) {
        var menus = _.sortBy(res, "orderIndex");
        $container.html(app.utils.template("base.custmenu", {
          menus: menus
        }));
        $container.find(".on_off :checkbox").tzCheckbox({
          labels: ["", ""]
        });
        $(".sortmenus").sortable({
          stop: function() {
            self.updateMenuOrders();
          }
        });
        $(".sortmenus").disableSelection();
        if("#entitybox-container" == el) {
          $(el).find(".j_menuset_close").removeClass("hide");
        }
        app.utils.layout(el + " #menuset-wrapper", [{
          gotoTopButton: false,
          bottomBlank: false
        }]);
        if(null != $(el + " #menuset-wrapper").parents("#entitybox").get(0)) {
          $(el + " #menuset-wrapper").height(465).mCustomScrollbar("update")
        }
      });
    },
    updateMenuOrders: function() {
      var $sortList = $(".sortmenus li"),
        menuIds = [],
        menuOrders = [],
        menu = {},
        menuId,
        menuOrder;
      $.each($sortList, function(index, el) {
        menuId = $(el).find(".menu_name").attr("data-id");
        menuOrder = index;
        menuIds.push(menuId);
        menuOrders.push(menuOrder);
      });
      menu.menuIds = menuIds.join(",");
      menu.menuOrders = menuOrders.join(",");
      this.model.updateMenuOrders(menu, function(a) {
        app.alert('success', "更新成功,重新登录后生效")
      })
    },
    remove: function() {
      $(this.el).off(".custMenuView")
    }
  });

  app.components.EntityBox = Backbone.View.extend({
    el: "#entitybox",
    initialize: function(data) {
      this.target = data.target;
      this.entityId = data.entityId;
      this.entityModule = data.entityModule;
      this.entityValue = data.entityValue;
      this.extProperties = data.extProperties;
      this.callbacks = data.callbacks;
      this.page = data.page;
      if($("#entitybox").length < 1) {
        $("body").append(app.utils.template("base.entitybox"));
      } else {
        $("#entitybox").trigger("destroy");
      }
      this.options = data || {};
    },
    delegateEvents: function() {
      var self = this;
      $("#entitybox").on("hidden.bs.modal.EntityBox", function() {
        self.remove()
      });
      $("#entitybox").on("shown.bs.modal.EntityBox", function(e) {
        if(self.scroller) {
          if(!$("#entitybox #entitybox-container").find(self.scroller).hasClass("mCustomScrollbar")) {
            app.utils.layout(self.scroller, [{
              gotoTopButton: false,
              bottomBlank: self.hasBlank
            }]);
          }
          $("#entitybox #entitybox-container").find(self.scroller).height(465).mCustomScrollbar("update");
        }
        $(window).trigger("resize");
        self.callbacks && self.callbacks.afterOpen && self.callbacks.afterOpen();
      });
      $("#entitybox").on("remove.EntityBox", "#btn-linkdomain", function(e) {
        $("#entitybox").modal("hide")
      });
      $("#entitybox").on("remove.EntityBox", "#btn-delete, #pass-submit, #back-submit,#add-step-confirm", function(e) {
        $("#entitybox").modal("hide");
        if(self.target.attr("need-delete") && self.target.attr("need-delete") != "no" && $(self.target).attr("id") != "task-create-fast") {
          self.target.trigger("remove");
        }
      });
      $("#entitybox").on("click.EntityBox", ".btn-back", function(e) {
        $("#entitybox").modal("hide");
        e.stopPropagation();
      });
      $("#entitybox").on("click.EntityBox", ".entitybox-toggle", function(a) {});
      $("#entitybox").on("shown", function(e) {
        self.callbacks && self.callbacks.afterOpen && self.callbacks.afterOpen()
      });
      $("#entitybox").on("destroy", function(e) {
        if(self.entityView) {
          self.entityView.remove();
          self.entityView = null;
        }
        $("#entitybox").off(".EntityBox");
      });
      $("#entitybox").off("click.EntityBox").on("click.EntityBox", function(e) {
        if (e.target == e.currentTarget && (self.entityModule == "customer" || self.entityModule == "contact")) {
          var $commentTextarea = $("#entitybox #comment-textarea");
          if($commentTextarea.size() > 0 && $commentTextarea.val().replace($commentTextarea.attr("placeholder"), "").trim().length > 0) {
            e.currentTarget = void 0; // 为了返回undefined
            app.utils.confirm("存在未提交的联系记录，确认关闭？", function(isConfirm) {
              if(isConfirm) {
                $("#entitybox .modal-header .close").click();
              } else {
                setTimeout(function() {
                  $("#entitybox #comment-textarea").focus();
                }, 500);
              }
            });
          }
        }
      });
      $("#entitybox").off("keydown.EntityBox").on("keydown.EntityBox", function(e) {
        if(e.which == 27) {
          if(window.formJsonStr && $("body .form-view_js").get(0) && window.formPlugin) {
            var form = formPlugin.submitAssembleForm({
              parentEl: $("body .form-view_js")
            });
            if(JSON.stringify(form.formData.dataDetails) != window.formJsonStr) {
              app.utils.confirm("确定放弃填写表单吗？放弃后数据将不会被保存！", function(isConfirm) {
                if(isConfirm) {
                  $("#entitybox").modal("hide");
                }
              });
            } else {
              $("#entitybox").modal("hide");
            }
          } else {
            $("#entitybox").modal("hide");
          }
        }
      });
    },
    render: function() {
      var self = this,
        entityId = this.entityId,
        title = "",
        options = {};
      self.scroller = "";
      self.hasBlank = true;
      switch (this.entityModule) {
      case "task":
        title = "<h5 class='modal-title'>任务信息</h5>";
        this.entityView = new d({
          id: entityId,
          container: "#entitybox-container",
          callback: this.callbacks ? this.callbacks.afterCreate: null,
          page: self.page
        });
        self.scroller = "#task-wrapper";
        break;
      case "document":
        title = "<h5 class='modal-title'>文档信息</h5>";
        this.entityView = new c({
          id: entityId,
          container: "#entitybox-container",
          page: self.page
        });
        self.scroller = "#document-container";
        break;
      case "workflow":
        title = "<h5 class='modal-title'>审批信息</h5>";
        if(isNaN(parseInt(entityId))) {
          this.entityView = new e({
            requestId: entityId,
            userId: app.config.currentUser.id,
            container: "#entitybox-container",
            callback: function() {
              self.close();
            },
            page: self.page,
            closable: false
          });
        } else {
          this.entityView = new b({
            requestId: entityId,
            container: "#entitybox-container",
  //          page: this.page,
            callback: function() {
              self.close();
            },
            page: self.page,
            closable: false
          });
        }
        break;
      case "mainline":
        title = "<h5 class='modal-title'>项目信息</h5>";
        this.entityView = new n({
          id: entityId,
          container: "#entitybox-container",
          callback: function() {
            self.close();
          },
          page: self.page
        });
        self.scroller = "#mainline-container";
        break;
      case "blog":
        title = "<h5 class='modal-title'>日报信息</h5>";
        this.entityView = new k({
          container: "#entitybox-container",
          isEntityBox: !0,
          callback: function() {
            self.close();
          },
          page: self.page
        });
        self.scroller = "#blog-post-fast";
        break;
      case "agenda":
        options = self.options;
        if (options.detail) {
          title = "<h5 class='modal-title'>日程详情</h5>";
          options.container = "#entitybox-container";
          options.callback = this.callbacks ? this.callbacks.afterOperate: null;
          this.entityView = new q(options);
          self.scroller = "#agendaInfo-wrapper";
          break;
        }
        title = "<h5 class='modal-title'>日程</h5>";
        if(options.allDay == void 0) {
          options.allDay = true;
        }
        if (!options.start) {
          var now = new Date,
            year = now.getFullYear(),
            month = (now.getMonth() + 1) < 10 ? "0" + (now.getMonth() + 1): (now.getMonth() + 1),
            day = now.getDate(),
            realDay = day + 1,
            dateString = year + "-" + month + "-" + (realDay < 10 ? "0" + realDay: realDay);
          options.start = Date.create(year + "-" + month + "-" + (10 > day ? "0" + day: day)).getTime();
          options.end = Date.create(dateString).getTime();
        }
        if("new" == options.entityId) {
          options.entityId = null;
        }
        options.container = "#entitybox-container";
        options.callback = this.callbacks ? this.callbacks.afterOperate: null;
        options.userId = app.config.currentUser.id;
        this.entityView = new p(options);
        self.scroller = "#agenda-wrapper";
        break;
      case "weeklyblog":
        title = "<h5 class='modal-title'>本周工作日报</h5>";
        options = self.options;
        options.container = "#entitybox-container";
        options.callback = this.callbacks ? this.callbacks.afterOperate: null;
        this.entityView = new m({
          container: "#entitybox-container",
          userId: this.entityId,
          date: this.entityValue,
          callback: function() {
            self.close();
          }
        });
        self.scroller = "#blogs-wrapper";
        break;
      case "flowSequence":
        title = "<h5 class='modal-title'>固定审批</h5>";
        options = self.options;
        if("new" == options.entityId) {
          options.entityId = null;
        }
        options.container = "#entitybox-container";
        options.callback = this.callbacks ? this.callbacks.afterOperate: null;
        this.entityView = new a(options);
        self.scroller = "#fasten-container";
        break;
      case "custmenu":
        options = self.options;
        if("new" == options.entityId) {
          options.entityId = null;
        }
        options.userId = app.config.currentUser.id;
        options.container = "#entitybox-container";
        this.entityView = new app.components.CustMenuView(options);
        break;
      case "quitTransfer":
        title = "<h5 class='modal-title'>离职交接</h5>";
        options = self.options;
        if("new" == options.entityId) {
          options.entityId = null;
        }
        options.container = "#entitybox-container";
        options.userId = entityId;
        options.userName = this.entityValue;
        options.callback = this.callbacks ? this.callbacks.afterOperate: null;
        this.entityView = new g(options);
        self.scroller = "#fasten-container";
      }
      if("weeklyblog" == this.entityModule) {
        $(".modal-header").removeClass("hide");
        $("#entitybox").find(".modal-header h5").remove();
        $("#entitybox").find(".modal-header").append(title);
      }
      if("workflow" == this.entityModule) {
        $("#entitybox").modal({
          keyboard: false
        });
      } else {
        $("#entitybox").modal();
      }
      this.entityView.render();
      if("blog" == this.entityModule) {
        $("#entitybox-container").find(".j_postsize").focus();
        $("#entitybox-container").find(".j_blog-post").addClass("active");
      }
    },
    close: function() {
      $("#entitybox").modal("hide");
    },
    remove: function() {
      if(this.entityView) {
        this.entityView.remove();
        this.entityView = null;
      }
      $("#entitybox").off(".EntityBox");
      $("#entitybox").off(".bs.modal");
      $("#entitybox").remove();
    }
  });

  app.components.EntitySlider = Backbone.View.extend({
    initialize: function(data) {
      this.idList = data.idList;
      this.id = data.id;
      this.formId = data.formId;
      this.module = data.module;
      this.userId = data.userId;
      this.renderType = data.renderType;
      this.slideCallback = data.slideCallback;
      this.page = data.page;
      this.formData = data.formData;
      this.tolink = data.tolink || false;
      this.mainlineId = data.mainlineId;
      this.userName = data.userName;
      this.barType = data.barType;
      this.dataName = data.dataName;
      this.seriesName = data.seriesName;
      this.group = data.group;
      this.checkDate = data.checkDate;
      this.formTitle = data.formTitle;
      this.formCreator = data.formCreator
    },
    delegateEvents: function() {},
    render: function() {
      var self = this,
      u = this.idList,
      id = this.id,
      v = this.slideCallback,
      x = this.mainlineId,
      y = this.userName,
      l = this.barType,
      r = this.dataName,
      D = this.seriesName,
      C = this.group,
      B = this.checkDate,
      F = this.formTitle,
      I = this.formCreator;
      switch (this.module) {
      case "task":
        this.stretchView = new f({
          id: id,
          container: "#entitySlider",
          page: this.page,
          closable: !0
        });
        break;
      case "document":
        this.stretchView = new c({
          id: id,
          container: "#entitySlider",
          closable: !0,
          page: this.page,
          tolink: this.tolink
        });
        break;
      case "customer":
        this.stretchView = new(g("crm/customer/CustomerView"))({
          customerId: id,
          el: "#entitySlider",
          userId: app.config.currentUser.id,
          closable: !0,
          page: this.page,
          slideCallback: v,
          callbacks: {
            afterDel: function(a) {
              self.page && sself.page.trigger("remove", a)
            },
            afterCreateByName: function(a) {},
            afterUpdateField: function(a, b, e) {
              "name" == b && self.page && self.page.trigger("changeTitle", {
                id: a,
                title: e
              })
            },
            afterChangeWatch: function(a, b) {
              self.page && self.page.trigger("changeWatch", {
                id: a,
                watched: b
              })
            }
          }
        });
        break;
      case "workflow":
        this.stretchView = new b({
          requestId: id,
          container: "#entitySlider",
          page: this.page,
          closable: !0,
          renderType: this.renderType
        });
        break;
      case "flowform":
        this.stretchView = new a({
          requestId: id,
          userId: app.config.currentUser.id,
          container: "#entitySlider",
          page: this.page,
          closable: !0
        });
        break;
      case "biaogeform":
        this.stretchView = new k({
          userId: app.config.currentUser.id,
          formId: id,
          dataId: id,
          container: "#entitySlider",
          renderType: this.renderType,
          page: this.page
        });
        break;
      case "mainline":
        this.stretchView = new e({
          id: id,
          container: "#entitySlider",
          page: this.page,
          tolink: this.tolink
        });
        break;
      case "mainlineTaskList":
        this.stretchView = new d({
          idList: u,
          id: id,
          group: C,
          checkDate: B,
          mainlineId: x,
          dataName: r,
          seriesName: D,
          userName: y,
          barType: l,
          container: "#entitySlider",
          page: this.page,
          closable: !0
        });
        break;
      case "workreport":
        this.stretchView = new h({
          id: id,
          container: "#entitySlider",
          isStat: !0,
          hideBlog: !0
        });
        break;
      case "profile":
        this.stretchView = new app.profile.ProfileView({
          container: "#entitySlider",
          userId: id,
          closable: !0
        });
        break;
      case "agenda":
        u = self.options;
        void 0 == u.allDay && (u.allDay = !0);
        var w;
        u.start || (x = new Date, w = x.getFullYear(), v = x.getMonth(), v += 1, v = 10 > v ? "0" + v: v, x = x.getDate(), y = x + 1, y = w + "-" + v + "-" + (10 > y ? "0" + y: y), u.start = Date.create(w + "-" + v + "-" + (10 > x ? "0" + x: x)).getTime(), u.end = Date.create(y).getTime());
        "new" == u.id && (u.id = null);
        u.callback = this.slideCallback ? this.slideCallback.afterOperate: null;
        u.changeEvent = this.slideCallback ? this.slideCallback.changeEvent: null;
        this.stretchView = new q({
          container: "#entitySlider",
          userId: app.config.currentUser.id,
          allDay: u.allDay,
          start: u.start,
          end: u.end,
          entityId: u.id,
          page: this.page,
          callback: u.callback,
          changeEvent: u.changeEvent
        });
        break;
      case "formdatareport":
        this.stretchView = new p({
          id: id,
          userId: app.config.currentUser.id,
          formData: self.formData,
          container: "#entitySlider",
          closable: !0,
          page: this.page
        });
        break;
      case "mainlineview":
        this.stretchView = new e({
          id: self.id,
          container: "#entitySlider",
          page: this.page,
          tolink: !0
        });
        break;
      case "writeform":
        this.stretchView = new n({
          userId: app.config.currentUser.id,
          formId: id,
          dataId: id,
          container: "#entitySlider",
          page: this.page,
          formTitle: F,
          formCreator: I
        })
      }
      $("#entitySlider").hasClass("in") || $("#entitySlider").addClass("in");
      this.stretchView.render()
    },
    remove: function() {
      this.stretchView && (this.stretchView.remove(), this.stretchView = null)
    }
  });

  app.components.Preview = Backbone.View.extend({
    initialize: function(data) {
      this.afterJqObj = data.afterJqObj;
      this.container = data.container;
      this.previewType = data.previewType || "";
      this.rel = data.rel || "0";
      this.maxSize = data.maxSize || 10;
      if(data.fileObj) {
        var file_obj = data.fileObj;
        this.isImage = file_obj.image;
        this.docFileType = file_obj.docType;
        this.docFileId = file_obj.id;
        this.fileSize = file_obj.size;
        this.title = file_obj.name || "预览";
      } else {
        if(data.document) {
          var doc = data.document;
          this.isImage = doc.docFile.image;
          this.docFileType = doc.docFile.docType;
          this.docFileId = doc.docFile.id;
          this.fileSize = doc.docFile.size;
        }
      }
    },
    initEvents: function() {},
    render: function() {
      var $container = this.container, $afterJqObj = this.afterJqObj;
      if(this.isImage) {
        $afterJqObj.after("<a id='document-preview-" + this.docFileId + "' rel='" + this.rel + "' title='" + this.title + "' class='document-preview-btn btn btn-xs btn-info' href=''>预览</a>");
        $container.find("#document-preview-" + this.docFileId).addClass("fancybox").attr("type", "image").attr("href", "/base/download/" + this.docFileId + "?type=" + this.previewType + "&timestamp=" + Date.parse(new Date));
        $container.find(".fancybox").fancybox({
          closeBtn: true,
          afterLoad: function() {
            this.title = "Image " + (this.index + 1) + " of " + this.group.length + (this.title ? " - " + this.title : "");
          }
        });
      } else {
        if("office" == this.docFileType || "pdf" == this.docFileType) {
          $afterJqObj.after("<a id='document-preview-" + this.docFileId + "'  data-value='" + this.docFileId + "' title='预览' class='document-preview-btn btn btn-xs btn-info' href=''>预览</a>");
          if("version" == this.previewType) {
            $container.find("#document-preview-" + this.docFileId).attr({
              href: "/wopi/files/preview?id=" + this.docFileId + "&type=" + this.previewType,
              target: "_blank"
            })
          } else {
            $container.find("#document-preview-" + this.docFileId).attr({
              href: "/wopi/files/preview?id=" + this.docFileId,
              target: "_blank"
            })
          }
          if (this.fileSize > 1048576 * this.maxSize) {
            $container.find("#document-preview-" + this.docFileId).attr("disabled", "true").css({
              "background-color": "#ccc",
              "border-color": "#ccc"
            }).after("<a data-value='" + this.docFileId + "' style='color:#ccc;size:10px;text-decoration:none;cursor:default;margin-left:5px;'>超过预览最大限制" + this.maxSize + "M</a>");
          }
        } else {
          if("text" == this.docFileType) {
            $afterJqObj.after("<a id='document-preview-" + this.docFileId + "'  data-value='" + this.docFileId + "' title='预览' class='document-preview-btn btn btn-xs btn-info' href=''>预览</a>");
            $container.find("#document-preview-" + this.docFileId).attr({
              href: "/wopi/files/preview/txtView?id=" + this.docFileId + "&type=" + this.previewType,
              target: "_blank"
            })
          }
        }
      }
    },
    remove: function() {}
  });

  app.components.Attachment = Backbone.View.extend({
    el: "",
    targetId: "",
    initialize: function(c) {
      this.container = c.container;
      this.el = (this.parentEl = c.parentEl) ? this.parentEl + " " + this.container : this.container;
      this.callback = c.callback;
      this.targetId = c.targetId;
      this._module = c.module;
      this.readonly = c.readonly;
      this.callbacks = c.callbacks;
      $(this.el).html(_.template(app.templates.component_attachment)());
    },
    delegateEvents: function() {
      var c = this,
          b = this.uploader = new plupload.Uploader({
              runtimes: "html5,flash",
              file_data_name: "data",
              container: c.el,
              browse_button: c.el + " #pickFiles",
              drop_element: c.el + " #upload-wrap",
              max_file_size: "normal" == app.config.currentTenant.status ? "50mb" : "20mb",
              url: "/base/upload.json?refId=" + c.targetId + "&module=" + c._module + "&ETEAMSID=" + ETEAMSID,
              flash_swf_url: "/static/swf/plupload.swf"
          });
      b.init();
      b.bind("FilesAdded",
          function(a, b) {
              $.each(b,
                  function(a, b) {
                      $(c.el).find(".entity-container").append(f.template("base.newattachment", b))
                  });
              a.refresh();
              a.start();
              $(c.el).find(".fancybox").fancybox({
                  closeBtn: !0,
                  afterLoad: function() {
                      this.title = "Image " + (this.index + 1) + " of " + this.group.length + (this.title ? " - " + this.title : "")
                  }
              })
          });
      b.bind("UploadProgress",
          function(a, b) {
              $("#" + b.id + " i").html(b.percent + "%")
          });
      b.bind("Error",
          function(a, b) {
              -600 == b.code && app.alert('error', "只能上传最大不超过" + a.settings.max_file_size / 1024 / 1024 + "M的文件", "文件大小超过限制");
              a.refresh()
          });
      b.bind("FileUploaded",
          function(a, b, h) {
              a = jQuery.parseJSON(h.response);
              h = a.fileObj;
              c.callback && c.callback(a);
              c.callbacks && c.callbacks.link && c.callbacks.link(h, a.stream);
              $(c.container).trigger("FileUploaded", h);
              app.alert('success', "文件上传成功");
              $("#" + b.id).parent().replaceWith(f.template("base.attachment", h));
              $("#stream").trigger("insertStream", a.stream);
              $("#" + h.id).children().addClass("remoteDownload").data("dlid", h.id);
              (new d({
                  container: $("body"),
                  afterJqObj: $("#" + h.id).children(),
                  fileObj: h
              })).render()
          });
      $("#upload-wrap").addClass(b.runtime);
      $(this.el).on("addAttachment",
          function(a) {
              "html5" == b.runtime && (a = document.getElementById(b.id + "_html5")) && !a.disabled && a.click()
          });
      $(this.el).off("click", ".entity-item .close").on("click ", ".entity-item .close",
          function(a) {
              a.stopPropagation();
              a = $(this).prevAll("a").attr("id");
              var b = $(this).prevAll("a").attr("data-value"),
                  d = $(this).parents(".entity-container"),
                  m = d.attr("data-url");
              if (m && b) {
                  var k = $(this).parent(),
                      q = d.data("param") || {};
                  q._method = "delete";
                  f.confirm("确定要删除吗？",
                      function(a) {
                          a && $.ajax({
                              type: "POST",
                              dataType: "json",
                              data: q,
                              url: m.replace("{id}", b),
                              success: function(a) {
                                  k.remove();
                                  d.trigger("removeEntity", a);
                                  $("#stream").trigger("insertStream", a.streams || a.stream);
                                  $("#readinfo").trigger("updateReadInfo");
                                  app.alert('success', "数据已删除");
                                  c.callbacks && c.callbacks.unlink && c.callbacks.unlink(a.fileObj, a.stream)
                              }
                          })
                      })
              } else $(this).parent().hasClass("tag") || ($(this).parent(".entity-item").remove(), d.trigger("removeEntity", a))
          })
    },
    render: function(c) {
        this.readonly && ($(this.el + " #upload-wrap").remove(), $(this.el).find(".entity-container").removeAttr("data-url").attr("undeletable", !0));
        if (c) {
            var b = $(this.el).find(".entity-container");
            b.data("param", {
                refId: this.targetId
            });
            for (var a = 0,
                    e = c.length; a < e; a++) {
                var h = c[a];
                b.append(f.template("base.attachment", h));
                b.find("#" + h.id).children().addClass("remoteDownload").data("dlid", h.id);
                (new d({
                    container: b,
                    afterJqObj: b.find("#" + h.id).children(),
                    fileObj: h
                })).render()
            }
            0 < c.length && ($(this.el).slideDown(300), $(this.parentEl).find($(this.el).attr("icon")).parent().addClass("hide"));
            $(this.el).find(".fancybox").fancybox({
                closeBtn: !0,
                afterLoad: function() {
                    this.title = "Image " + (this.index + 1) + " of " + this.group.length + (this.title ? " - " + this.title : "")
                }
            })
        }
    },
    getLinkIds: function() {
        var c = [];
        $(this.el).find(".entity-item").each(function() {
            c.push($(this).find("a").attr("data-value"))
        });
        return c
    },
    remove: function() {
        this.undelegateEvents();
        this.uploader && (this.uploader.destroy(), this.uploader = null)
    }
  });

  app.components.TypeaheadView = Backbone.View.extend({
    initialize: function(c) {
      this.$input = c.$el;
      this.clickHandler = c.clickHandler;
      this.remote = c.remote || app.config.urlPrefix + '/organizations/' + app.config.organizationId + "/search/suggestion.json";
      this.resultHandler = c.resultHandler;
    },
    render: function() {
      $("#typeahead-div").remove();
      this.$input.after(app.templates["component.typeahead"]);
      this.show();
      this.htmlEvents()
    },
    htmlEvents: function() {
      var c = this, b = this.$input;
      b.off("focus.tt").on("focus.tt", function(a) {
        c.search($(this))
      });
      b.off("click.tt").on("click.tt", function(a) {
        a.stopPropagation()
      });
      b.off("keyup.tt").on("keyup.tt", function(a) {
        a = a.which;
        13 == a ? $("#typeahead-div p.active").trigger("click.tt") : 27 == a ? c.hide() : 38 == a ? (a = $("#typeahead-div p.active"), 1 > a.length ? $("#typeahead-div p").last().addClass("active") : (a.removeClass("active"), (0 < a.prev().length ? a.prev() : $("#typeahead-div p").last()).addClass("active"))) : 40 == a ? (a = $("#typeahead-div p.active"), 1 > a.length ? $("#typeahead-div p").first().addClass("active") : (a.removeClass("active"), (0 < a.next().length ? a.next() : $("#typeahead-div p").first()).addClass("active"))) : c.search($(this))
      });
      $("body").off("click.tt", "#typeahead-div p").on("click.tt", "#typeahead-div p", function(a) {
        a = $(this).data("obj");
        $(this).hasClass("invite-toggle") && "new" == a.id || (15 < b.val().length ? (app.alert('warning', '关键字长度不能大于15,请重新设置'), b.val("")) : c.clickHandler(a, b));
        b.trigger("focusout", "tt")
      });
      $("#typeahead-div").off("mouseenter .tt", "p").on("mouseenter .tt", "p", function() {
        $(this).addClass("active");
        $("#typeahead-div p.active").removeClass("active")
      })
    },
    search: function(c) {
      var b = this,
      a = $.trim(c.val());
      a == c.attr("placeholder") && (a = "");
      var e = c.attr("data-entity");
      this.suggestion = a;
      this.entity = e;
      if ("relevance" == e) {
        var d = c.parent().find(".typeahead-search");
        "customer" == d.attr("module") ? b.remote = app.config.service.crm + "/customer/suggestion.json": "calendar" == d.attr("module") ? b.remote = "/agendas/suggestion.json": b.remote = "/" + d.attr("module") + "s/suggestion.json"
      }
      this.privacy = "1" == c.attr("privacy") ? !0 : !1;
      if (e) if ($("#typeahead-div .loading_small").addClass(e).show(), c = b.remote, d = {},
      "formField" == e) {
        c = "/formdatastat/getFiledOptions.json";
        var f = $("#js_form_field_set").find("option:selected").attr("id");
        d.fieldId = f;
        $.ajax({
          type: "get",
          url: c,
          dataType: "json",
          data: d,
          success: function(c) {
            c = c.fieldOptions;
            $("#typeahead-div .loading_small").hide();
            10 < c.length && c.push({
              id: "all",
              name: a,
              module: "all"
            });
            b.loadList(c)
          }
        })
      } else d.keywords = a,
      d.searchType = e,
      "tag" == e && (d.privacy = b.privacy, d.allTag = !1),
      $.ajax({
        type: "get",
        url: c,
        dataType: "json",
        data: d,
        success: function(c) {
          c = c[e + "s"];
          $("#typeahead-div .loading_small").hide();
          10 < c.length && c.push({
            id: "all",
            name: a,
            module: "all"
          });
          b.loadList(c)
        }
      })
    },
    loadList: function(c) {
      this.resultHandler && (c = this.resultHandler(c));
      $("#typeahead-div #searchList").empty();
      var suggestion = this.suggestion;
      var entity = this.entity;
      if (suggestion && 2 < escape(suggestion).length) {
        for (var b = !0,
        a = 0,
        e = c.length; a < e; a++) {
          var d = c[a];
          if ((d.name || d.username) == suggestion) {
            b = !1;
            break
          }
        }
        a = this.$input.data("showNew");
        "forceDisabled" == a && (b = !1);
        b && "department" != entity && "group" != entity && "relevance" != entity && "formLabel" != entity && c.push({
          id: "new",
          name: suggestion,
          username: suggestion,
          privacy: this.privacy
        });
        "relevance" == entity && 0 == c.length && $("#typeahead-div #searchList").append('<p class="relevance"><span>无相关记录</span></p>')
      }
      a = 0;
      for (e = c.length; a < e; a++) {
        if ("formField" == entity) d = c[a],
        d.name = d.name.replace(/</g, "&lt").replace(/>/g, "&gt").replace("/[\r\n]/g", " "),
        b = '<p class="fieldOption" id="' + d.id + '"><span>' + d.name + "</sapn></p>",
        b = $($.trim(b)),
        b.data("obj", d);
        else if (d = c[a], d.createTime = Date.create(d.createTime).format("{yyyy}-{MM}-{dd}"), d.name = d.name.replace(/</g, "&lt").replace(/>/g, "&gt").replace("/[\r\n]/g", " "), b = _.template(app.templates["suggestion." + entity], d), b = $($.trim(b)), b.data("obj", d), d.avatar && b.find(".avatar").attr("src", d.avatar), "relevance" == entity) switch (d.module) {
        case "calendar":
          b.find(".icon-calendar").addClass("hide")
        }
        $("#typeahead-div #searchList").append(b)
      }
      b = !0;
      a = this.$input.data("showNew");
      "forceDisabled" == a && (b = !1);
      b && "employee" == entity && 2 >= escape(suggestion).length && $("#typeahead-div #searchList").append(app.templates["suggestion.invite"]);
      this.show()
    },
    hide: function() {
      $("#typeahead-div").hide()
    },
    show: function() {
      $("#typeahead-div").show()
    },
    resetPostion: function() {
      var $target = this.$input;
      var c = $target.offset().top,
      b = $target.offset().left;
      $("#typeahead-div").css("left", b + "px");
      $("#typeahead-div").css("top", c + 25 + "px")
    },
    remove: function() {
      $("body").off(".tt");
      $("#typeahead-div").off(".tt");
      this.$input.off(".tt");
      $("#typeahead-div").remove()
    }
  });

  app.components.typeahead = {
    defaults: {
      el: "input.typeahead",
      valueKey: "id",
      creatable: true,
      callback: function(d) {}
    },
    init: function(d) {
      var c = [];
      $.isArray(d) ? c = d : c.push(d);
      for (var b = 0, a = c.length; b < a; b++) {
          d = c[b];
          var e = $(d.el),
              h = d.callback,
              m = d.resultHandler;
          (function(a, b, c, e) {
              a.off("focusin.tt").on("focusin.tt", function(d) {
                      (new app.components.TypeaheadView({
                          $el: a,
                          clickHandler: b,
                          remote: c,
                          resultHandler: e
                      })).render()
                  })
          })(e, h, d.remote, m);
          var k = e.next(".typeahead-search");
          k && 0 < k.size() && (k.attr("data-entity", $(d.el).attr("data-entity")), k.attr("module", $(d.el).attr("module")), k.attr("data-multi", $(d.el).attr("data-multi")),
              function(a, b, c, e) {
                  c.off("confirmHandler").on("confirmHandler",
                      function(c, e) {
                          b(e.objs, a)
                      })
              }(e, h, k, m))
      }
    }
  };

  window.DepartmentSelector = Backbone.View.extend({
    initialize: function(data) {
      this.$el = data = data.$el;
      this.entity = data.attr("data-entity");
      this.module = data.attr("module");
      this.multi = data.attr("data-multi");
      this.winEl = "#selector-" + this.entity;
      $("body").append(app.templates["selector." + this.entity]);
    },
    delegateEvents: function() {
      var self = this;
      var $winEl = $(self.winEl);
      $("body").on("keydown.depart-win", function(e) {
        if(e.which == 27) {
          $winEl.modal("hide");
        }
      });
      $winEl.on("hidden.bs.modal", function() {
        self.remove();
      })
    },
    open: function() {
      $(this.winEl).modal("toggle");
      this._loadDepartment();
    },
    close: function() {
      $(this.winEl).modal("hide");
    },
    _loadDepartment: function() {
      var self = this;
      self.treeView = new app.org.TreeView({
        el: "#selector-org-tree",
        hasUrl: !1,
        editable: !1,
        readonly: !0,
        noUrl: !0
      });
      self.treeView.render(null, function() {
        $("#selector-org-tree").on("click.depart-win", ".treenode", function(e) {
          e.preventDefault();
          var node = $(this).data("node");
          self.close();
          self.$el.trigger("confirmHandler", {
            objs: node
          });
        });
      });
    },
    remove: function() {
      var $winEl = $(this.winEl);
      $("#selector-org-tree").off(".depart-win");
      $winEl.remove();
      if(this.treeView) {
        this.treeView.remove();
        this.treeView = null;
      }
    }
  });

  window.UserSelector = Backbone.View.extend({
    initialize: function(g) {
      this.$target = g = g.$target;
      this.isMulti = !1;
      this.entity = g.attr("data-entity");
      this.module = g.attr("module");
      this.multi = g.attr("data-multi");
      this.el = "#selector-employee";
      g = app.templates["selector." + this.entity];
      $("body").append(g);
      $("#all-org-users").html(app.utils.template("org.departmenttree"));
      $("#all-group-users").html(app.utils.template("org.user"));
      $(this.el).find(".j_selectedUsersScr").css("max-height", "70px");
      app.utils.layout(this.el + " .j_selectedUsersScr");
      this.isMulti = this.multi ? !0 : !1;
      this.departmentTreeView = new app.org.DepartmentTreeView({
        id: "",
        type: "user",
        readonly: !0,
        noUrl: !0,
        height: 310,
        el: "#all-org-users"
      });
      this.userView = new app.org.UserView({
        id: "",
        operation: "user",
        editable: !1,
        isMulti: this.isMulti,
        height: 280,
        el: "#userSelector-multi #all-group-users",
        removeSlider: !0,
        target: this.$target
      });
      this.groupModel = new app.org.GroupModel();
    },
    delegateEvents: function() {
      var a = this,
      b = $(a.el);
      $("body").on("keydown.user-win",
      function(a) {
        27 == a.which && b.modal("hide")
      });
      b.on("hidden.bs.modal",
      function() {
        a.remove()
      });
      b.on("click.user-win", "#org-tree-list a",
      function() {
        var b = $(this).parent().attr("id");
        a.userView.id = b;
        a.userView.editable = !1;
        a.userView.isMulti = a.isMulti;
        a.userView.userOrg = "";
        a.userView.operation = "";
        a.userView.el = "#userSelector-multi #all-group-users";
        a.userView.render(a.getAllChecked());
        $("#org-user-info").addClass("hide");
        $("#group-user-info").addClass("hide")
      });
      b.on("click.user-win", "#org-group-list a",
      function() {
        var b = $(this).attr("id");
        a.userView.id = b;
        a.userView.editable = !1;
        a.userView.isMulti = a.isMulti;
        a.userView.userOrg = "searchgroup";
        a.userView.operation = "search";
        a.userView.el = "#userSelector-multi #all-group-users";
        a.userView.render(a.getAllChecked());
        $("#org-user-info").addClass("hide");
        $("#group-user-info").addClass("hide")
      });
      b.on("addUser.user-win", "#all-group-users",
      function(b, e) {
        var c = $("<a> " + e.username + " </a>");
        c.attr("id", e.id);
        c.data("user", e);
        0 == $("#userSelector-multi .selected-users #" + e.id).size() && $("#userSelector-multi .selected-users").prepend(c);
        a.haveCheckedUser()
      });
      b.on("deleteUser.user-win", "#all-group-users",
      function(b, e) {
        $("#userSelector-multi .selected-users #" + e.id).remove();
        a.haveCheckedUser()
      });
      b.on("addAllUser.user-win", "#all-group-users",
      function(b, e) {
        for (var c = 0; c < e.length; c++) {
          var d = e[c];
          if (!a.isExistUser(d)) {
            var f = $("<a> " + d.username + " </a>");
            f.attr("id", d.id);
            f.data("user", d);
            $("#userSelector-multi .selected-users").prepend(f)
          }
        }
        a.haveCheckedUser()
      });
      b.on("deleteAllUser.user-win", "#all-group-users",
      function(b, e) {
        for (var c = 0; c < e.length; c++) $("#userSelector-multi .selected-users #" + e[c].id).remove();
        a.haveCheckedUser()
      });
      if (!a.isMulti) b.on("click.user-win", "#employee-container li",
      function(b) {
        if (b = $(this).data("user")) a.close(),
        b.sourceId = $(this).attr("id"),
        a.$target.trigger("confirmHandler", {
          objs: b
        })
      });
      b.on("click.user-win", ".j_user_ok",
      function() {
        var b = [];
        $("#userSelector-multi .selected-users>a").each(function() {
          var a = $(this).data("user");
          b.push(a)
        });
        a.$target.trigger("confirmHandler", {
          objs: b
        });
        a.close()
      });
      b.on("click.user-win", ".j_user_cancel",
      function() {
        a.close()
      });
      b.on("click.user-win", "#addUserToGroupButton",
      function(a) {
        var b = [];
        $("#userSelector-multi .selected-users>a").each(function() {
          var a = $(this).data("user");
          b.push(a)
        });
        0 < b.length ? ($(this).addClass("hide"), $("#add-group-input-text").show(), $("#addConfirmButton").removeClass("hide"), $("#addCancelButton").removeClass("hide"), $("#add-group-input-text").focus()) : f.notify("\u8bf7\u9009\u62e9\u7fa4\u7ec4\u6210\u5458")
      });
      b.on("click.user-win", "#addConfirmButton",
      function(b) {
        b = $("#add-group-input-text").val();
        if ("" == $.trim(b)) f.notify("\u8bf7\u8f93\u5165\u7fa4\u7ec4\u540d\u79f0"),
        $("#add-group-input-text").focus();
        else if (20 < $.trim(b).length) f.notify("\u7fa4\u7ec4\u540d\u79f0\u4e0d\u5f97\u8d85\u8fc720\u4e2a\u5b57\u7b26"),
        $("#add-group-input-text").focus();
        else {
          var e = {},
          c = "";
          $("#userSelector-multi .selected-users>a").each(function() {
            c += $(this).attr("id") + ","
          });
          e["group.name"] = $.trim(b);
          e.employeeId = TEAMS.currentUser.id;
          e.ids = c;
          a.groupModel.saveGroupAddEmployee(e,
          function(a) {
            $("#add-group-input-text").val("");
            $("#add-group-input-text").hide();
            $("#addUserToGroupButton").removeClass("hide");
            $("#addConfirmButton").addClass("hide");
            $("#addCancelButton").addClass("hide");
            f.notify("\u6dfb\u52a0\u6210\u529f");
            $("#group-users").trigger("click")
          })
        }
      });
      b.on("click.user-win", "#addCancelButton",
      function(a) {
        $("#add-group-input-text").hide();
        $("#addUserToGroupButton").removeClass("hide");
        $("#addConfirmButton").addClass("hide");
        $("#addCancelButton").addClass("hide")
      })
    },
    open: function() {
      var a = $(this.el);
      a.modal("toggle");
      this._openEmpMulti();
      "flow" == this.module ? a.find("#modalLabel-employee").html("\u9009\u62e9\u529e\u7406\u4eba") : a.find("#modalLabel-employee").html("\u4eba\u5458\u9009\u62e9")
    },
    close: function() {
      $(this.el).modal("hide")
    },
    _openEmpMulti: function() {
      $(this.el);
      $("#userSelector-multi").removeClass("hide");
      $("#add-group-input-text").hide();
      this.departmentTreeView.render();
      this.userView.render();
      this.isMulti ? $(".selector-btns .j_user_ok").removeClass("hide") : ($("#userSelector-multi .user-selector-header").addClass("hide"), $("#userSelector-multi .user-wrapper").addClass("hide"));
      $("#dept-user-invite").addClass("hide");
      $(this.el).find("#add-dept-group").addClass("hide");
      $("#org-user-info").addClass("hide");
      $("#group-user-info").addClass("hide");
      $("#control-hide").addClass("hide")
    },
    haveCheckedUser: function() {
      this.isChecked() ? "none" == $("#add-group-input-text").css("display") && $("#addUserToGroupButton").removeClass("hide") : $("#addUserToGroupButton").addClass("hide")
    },
    isExistUser: function(a) {
      var b = !1;
      $("#userSelector-multi .selected-users>a").each(function() {
        var c = $(this).data("user");
        a.id == c.id && (b = !0)
      });
      return b
    },
    isChecked: function() {
      var a = [],
      a = this.getAllChecked();
      return 0 < a.length ? !0 : !1
    },
    getAllChecked: function() {
      var a = [];
      $("#userSelector-multi .selected-users>a").each(function() {
        var b = $(this).data("user");
        a.push(b)
      });
      return a
    },
    remove: function() {
      var a = $(this.el);
      a.off(".user-win");
      a.remove()
    }
  });

  app.components.ShareAllview = Backbone.View.extend({
    partEl: "",
    shareEl: "",
    initialize: function(data) {
      this.parentEl = data.parentEl;
      this.partEl = this.parentEl + " " + data.partContainer;
      this.shareEl = this.parentEl + " " + data.shareContainer;
      this.entityId = data.entityId;
      this.serverPath = data.serverPath;
      this._module = data.module;
      this.model = new app.models.Share({
        entityIds: this.entityId,
        module: this._module,
        serverPath: this.serverPath
      });
      if(data.partContainer) {
        $(this.partEl).html(app.utils.template("share.simpleshare", {
          panel: "participants"
        }));
      }
      $(this.shareEl).html(app.utils.template("share.shareall", {
          panel: "share"
      }));
      if("mainline" == this._module || "task" == this._module || "workreport" == this._module) {
        $(this.shareEl).find("#share-select").addClass("hide");
      }
    },
    delegateEvents: function() {
      var self = this;
      $(self.shareEl).off("click", ".j_more_show").on("click ", ".j_more_show", function(e) {
        e.stopPropagation();
        var $this = $(this);
        var type = $this.data("type");
        $this.addClass("hide").siblings(".j_more_hide").removeClass("hide");
        $(self.shareEl + " #" + type).children(".j_entity_item").show();
      });
      $(self.partEl).off("click", ".j_more_show").on("click ", ".j_more_show", function(e) {
        e.stopPropagation();
        var $this = $(this);
        var type = $this.data("type");
        $this.addClass("hide").siblings(".j_more_hide").removeClass("hide");
        $(self.partEl + " #" + type).children(".j_entity_item").show();
      });
      $(self.shareEl).off("click", ".j_more_hide").on("click ", ".j_more_hide", function(e) {
        e.stopPropagation();
        var $this = $(this);
        var type = $this.data("type");
        $this.addClass("hide").siblings(".j_more_show").removeClass("hide");
        $(self.shareEl + " #" + type).find(".j_entity_item:lt(5)").show();
        $(self.shareEl + " #" + type).find(".j_entity_item:gt(4)").hide();
      });
      $(self.partEl).off("click", ".j_more_hide").on("click ", ".j_more_hide", function(e) {
        e.stopPropagation();
        var $this = $(this);
        var type = $this.data("type");
        $this.addClass("hide").siblings(".j_more_show").removeClass("hide");
        $(self.partEl + " #" + type).find(".j_entity_item:lt(5)").show();
        $(self.partEl + " #" + type).find(".j_entity_item:gt(4)").hide();
      });
      $(self.shareEl).off("click", ".entity-item .close").on("click ", ".entity-item .close", function(e) {
        e.stopPropagation();
        self.deleteEvent($(this));
      });
      $(self.partEl).off("click", ".entity-item .close").on("click ", ".entity-item .close", function(e) {
        e.stopPropagation();
        self.deleteEvent($(this));
      });
      $(self.shareEl).find("#share-select").change(function() {
        var val = $(this).val();
        if("all" == val) {
          $(".sharetype-dept").addClass("hide");
          $(".sharetype-group").addClass("hide");
          $(".sharetype-user").removeClass("hide");
          $(self.shareEl).find("#editShare").removeClass("hide");
          $(self.shareEl).find(".typeahead-wrapper").addClass("hide");
          $(this).val("user");
          self.save(val, [{
            id: 0
          }], "sharer");
        } else if ("group" == val) {
          $(".sharetype-dept").addClass("hide");
          $(".sharetype-group").removeClass("hide");
          $(".sharetype-user").addClass("hide");
        } else if("department" == val) {
          $(".sharetype-dept").removeClass("hide");
          $(".sharetype-group").addClass("hide");
          $(".sharetype-user").addClass("hide");
        } else if("user" == val) {
          $(".sharetype-group").addClass("hide");
          $(".sharetype-dept").addClass("hide");
          $(".sharetype-user").removeClass("hide");
        }
      });
      app.components.typeahead.init([{
        el: self.shareEl + " .sharetype-group input",
        callback: function(res) {
          self.save("group", [res], "sharer");
        }
      }, {
        el: self.shareEl + " .sharetype-dept input",
        callback: function(res) {
          self.save("department", [res], "sharer");
        }
      }, {
        el: self.shareEl + " .sharetype-user input",
        callback: function(res) {
          self.save("user", res, "sharer");
        }
      }]);
      if(this.partEl) {
        app.components.typeahead.init({
          el: self.partEl + " #typeahead-participants",
          callback: function(res) {
            self.save("user", res, "participants");
          }
        });
      }
    },
    deleteEvent: function(b) {
      var a = this,
      e = b.prevAll("a").attr("id"),
      c = b.prevAll("a").attr("data-value"),
      d = b.parents(".entity-container"),
      k = d.attr("data-url");
      if (k && c) {
        var q = b.parent(),
        p = d.data("param") || {};
        p._method = "delete";
        var n = a.serverPath || "";
        b = function(b) {
          b && $.ajax({
            type: "POST",
            dataType: "json",
            data: p,
            url: n + k.replace("{id}", c),
            success: function(b) {
              q.remove();
              d.trigger("removeEntity", b);
              $("#stream").trigger("insertStream", b.streams || b.stream);
              $("#readinfo").trigger("updateReadInfo");
              app.alert('success', '数据已删除');
              a.callbacks && a.callbacks.unlink && a.callbacks.unlink(c, b.streams || b.stream)
            }
          })
        };
        d.attr("data-noConfirm") ? b(!0) : f.confirm("确定要删除吗？", b)
      } else b.parent().hasClass("tag") || (b.parent(".entity-item").remove(), d.trigger("removeEntity", e))
    },
    render: function(shareEntrys, flag) {
      var shareModel = this.model, self = this;
      if(self.entityId) {
        if(flag) {
          shareModel.query(function(res) {
            self.createShareEntryLink(res.shareEntrys);
            self.shareEntrys = res.shareEntrys
          });
        } else {
          self.shareEntrys = shareEntrys;
          self.createShareEntryLink(shareEntrys);
        }
      }
      self.renderMoreType("#participants");
      self.renderMoreType("#shareentrys")
    },
    renderMoreType: function(domId) {
      if (domId) {
        var $childrens = $(this.parentEl).find(domId).children(), len = $childrens.length;
        $(this.parentEl + " " + domId + " .j_more_show");
        if (5 < len) {
          for (var i = 5; i < len; i++) {
            $($childrens[i]).hide();
          }
          $(this.parentEl).find(domId).find(".j_more_btn").remove();
          var type = domId && 1 < domId.length && domId.substr(1) || "";
          $(this.parentEl).find(domId).append('<span class="j_more_btn"><span class="j_more_show" data-type="' + type + '"><a>显示更多...</a></span><span class="j_more_hide hide" data-type="' + type + '"><a>收起</a></span></span>');
        }
      }
    },
    save: function(b, a, e) {
      var c = this,
      d = this.model;
      if (a && !$.isEmptyObject(a)) {
        if ("sharer" == e) {
          if ("all" == b && 0 < $(this.shareEl).find("#shareentrys a[userid=0]").length) {
            app.alert('warning', "已共享给所有人,不用重复添加");
            return;
          }
          if ("department" == b && 0 < $(this.shareEl).find("#shareentrys a[userid=" + a[0].id + "]").length) {
            app.alert('warning', "已共享给该部门,不用重复添加");
            return;
          }
          if ("user" == b && 0 < $(this.shareEl).find("#shareentrys a[userid=" + a.id + "]").length) {
            app.alert('warning', "已存在共享人,不用重复添加");
            return;
          }
        }
        var k = "";
        a = $.isArray(a) ? a: [a];
        for (var q = [], p = 0; p < a.length; p++) {
          var n = a[p];
          if ("sharer" == e) {
            if (c.hasUser(n.id, $(c.shareEl).find("#shareentrys"))) {
              continue;
            }
          } else if ("participants" == e && c.hasUser(n.id, $(c.partEl))) {
            continue;
          }
          k += n.id + ",";
          q.push({
            sid: n.id,
            name: n.name,
            shareType: e
          });
        }
        k = k.substring(0, k.length - 1);
        d.sids = k;
        d.entryType = b;
        d.shareType = e;
        if(!c.shareEntrys) {
          c.shareEntrys = [];
        }
        if(c.entityId) {
          if("all" == b) {
            app.alert('info', '共享给所有人时，操作时间较长，请耐心等待...');
          }
          d.saveAll(function(a) {
            if(a.msg) {
              app.alert('success', a.msg);
            } else {
              c.createShareEntryLink(a.shareEntrys);
              c.shareEntrys.add(a.shareEntrys);
              if("sharer" == e) {
                if(a.addUserMessage) {
                  app.alert('success', a.addUserMessage);
                } else {
                  app.alert('success', '已添加共享人');
                }
              }
              if("participants" == e) {
                if(a.addUserMessage) {
                  app.alert('success', a.addUserMessage);
                } else {
                  app.alert('success', '已添加参与人');
                }
              }
              $(c.parentEl).find("#stream").trigger("insertStream", a.streams);
              $(c.parentEl).find("#readinfo").trigger("insertReadInfo", [c.entityId, c.shareEntrys]);
            }
          });
        } else {
          c.createShareEntryLink(q);
          c.shareEntrys.push(q);
        }
      }
    },
    createShareEntryLink: function(shareEntrys) {
      if (shareEntrys) {
        for (var i = 0; i < shareEntrys.length; i++) {
          var shareEntry = shareEntrys[i], shareType = shareEntry.shareType, domId = "", domClass = "usercard-toggle";
          if ("sharer" == shareType) {
            if(0 == shareEntry.sid) {
              shareEntry.name = "所有人";
              domClass = "";
            } else {
              if("department" == shareEntry.entryType) {
                domClass = "";
              } else {
                if("group" == shareEntry.entryType) {
                  if("" == shareEntry.name) {
                    shareEntry.name = "未命名(群组)";
                  }
                  domClass = "";
                }
              }
            }
            if (this.hasUser(shareEntry.sid, $(this.shareEl).find("#shareentrys"))) {
              continue;
            }
            $(this.shareEl).removeClass("hide");
            $(this.parentEl).find($(this.shareEl).attr("icon")).parent().addClass("hide");
            domId = "#shareentrys";
          } else if ("participants" == shareType) {
            if (this.hasUser(shareEntry.sid, $(this.partEl))) {
              continue;
            }
            $(this.partEl).removeClass("hide");
            domId = "#participants";
            $(this.parentEl).find($(this.partEl).attr("icon")).parent().addClass("hide");
          }
          if(!shareEntry.id) {
            shareEntry.id = shareEntry.sid;
            $(this.parentEl).find(domId).attr("data-url", "");
          }
          var shareEntityItem = '<span class="entity-item j_entity_item"> <a class="' + domClass + '" id="' + shareEntry.sid + '" data-value="' + shareEntry.id + '" userId="' + shareEntry.sid + '""><span class="j_shareEntry_name hide">' + shareEntry.name + "</span></a></span>";
          if(0 < $(this.parentEl).find(domId + " .j_more_btn").length && "" != domId) {
            $(this.parentEl).find(domId + " .j_more_btn").before(shareEntityItem);
          } else {
            $(this.parentEl).find(domId).append(shareEntityItem);
          }
          this.renderShareEmpImg(shareEntry, $(this.parentEl).find(domId));
        }
      }
    },
    renderShareEmpImg: function(shareEntry, $el) {
      var midVar = "";
      if("mainline" == this._module || "task" == this._module || "workreport" == this._module) {
        if(shareEntry.shareEmp) {
          midVar = shareEntry.shareEmp;
          midVar = "<img class='avatar' src='" + (midVar.avatar || "/static/images/avatar.png") + "' />";
          $el.find("#" + shareEntry.sid).prepend($(midVar));
        }
      } else {
        if("user" == shareEntry.entryType) {
          midVar = shareEntry.avatar ? "<img class='avatar' src='" + shareEntry.avatar + "' />": "<img class='avatar' src='/static/images/avatar.png' />";
          $el.find("#" + shareEntry.sid).prepend($(midVar));
        }
      }
      $el.find("#" + shareEntry.sid + " .j_shareEntry_name").removeClass("hide");
    },
    findEmployeeId: function() {
      var b = "";
      if (this.shareEntrys) for (var a = 0; a < this.shareEntrys.length; a++) b += this.shareEntrys[a].sid + ",";
      return b
    },
    getLinkIds: function() {
      var b = [];
      $(this.shareEl).find(".entity-item").each(function() {
        b.push($(this).find("a").attr("data-value"))
      });
      return b
    },
    hasUser: function(b, a) {
      var e = !1;
      a.find("a").each(function() {
        var a = $(this).attr("userid");
        parseInt(a) == parseInt(b) && (e = !0)
      });
      return e
    }
  });

  app.components.AtMeView = Backbone.View.extend({
    initialize: function(options) {
      this.$input = options.$input;
      this.clickHandler = options.clickHandler;
      this.remote = options.remote || "/search/suggestion.json";
      this.el = "#atdiv";
      this.hiddenHtml = '<div id="autoTalkBox" style="z-index:-2000;top:$top$px;left:$left$px;width:$width$px;height:$height$px;position:absolute;scroll-top:$SCTOP$px;overflow:hidden;overflow-y:auto;visibility:hidden;word-break:break-all;word-wrap:break-word;*letter-spacing:0.6px;"><span id="autoTalkText"></span></div>';
      this.positionHTML = '<span id="autoUserTipsPosition">&nbsp;123</span>'
    },
    render: function() {
      var rect = this.$input[0].getBoundingClientRect(),
        width = this.$input[0].offsetWidth,
        height = this.$input[0].offsetHeight,
        html = this.hiddenHtml.slice();
      $("body").append(html);
      $("#autoTalkBox").css({
        top: rect.top,
        left: rect.left,
        width: width,
        height: height,
        SCTOP: "0"
      });
      this.delegateEvents();
    },
    delegateEvents: function() {
      var self = this,
        $el = $(self.el),
        $input = self.$input;
      $(window).off("resize.at").on("resize.at", function(e) {
        if(null != $("#autoTalkText")[0]) {
          var rect;
          try {
            rect = self.$input[0].getBoundingClientRect();
          } catch(e) {
            return;
          }
          var width = self.$input[0].offsetWidth;
          var height = self.$input[0].offsetHeight;
          $("#autoTalkBox").css({
            top: rect.top,
            left: rect.left,
            width: width,
            height: height,
            SCTOP: "0"
          });
          var cursorPosition = self.getCursorPosition($input);
          if (!cursorPosition) {
            return self.hide();
          }
          var txt = $input.val().slice(0, cursorPosition);
          $("#autoTalkText")[0].innerHTML = txt.slice(0, txt.length).replace(/\n/g, "<br/>").replace(/\s/g, "&nbsp;") + self.positionHTML;
          rect = $("#autoUserTipsPosition")[0].getBoundingClientRect();
          var userAgent = window.navigator.userAgent.toLowerCase();
          if(/msie 9\.0/i.test(userAgent)) {
            document.getElementById("atdiv").style.top = rect.top + 1 + "px";
            document.getElementById("atdiv").style.left = rect.left - 5 + "px";
          } else {
            $el.css({
              top: rect.top + 1 + "px",
              left: rect.left - 5 + "px"
            });
          }
        }
      });
      $input.off("focusin.at").on("focusin.at", function(e, nil) {
        if(!nil) {
          $("[id=atdiv]").each(function() {
            $(this).remove();
          });
          $("[id=autoTalkBox]").each(function(a) {
            $(this).remove();
          });
          $("body").append('<div id="atdiv" class="controls hide" style="position: absolute;z-index:9999;">' + app.utils.template("component.typeahead") + "</div>")
        }
      });
      $input.off("click.at").on("click.at", function(e) {
        $input.trigger("keyup.at");
      });
      $input.off("keydown.at").on("keydown.at", function(e) {
        var keyCode = (e || window.event).keyCode;
        if ((app.config.keyCode.UP == keyCode || app.config.keyCode.DOWN == keyCode) && $el.find("#typeahead-div p").hasClass("employee")) {
          self.preventEvent(e);
          return false;
        }
        if(app.config.keyCode.ENTER == keyCode && $el.find("#typeahead-div p").hasClass("active")) {
          self.preventEvent(e);
        }
      });
      $("body").not($input).not($el).off("click.at").on("click.at", function(e) {
        self.hide();
      });
      $input.off("keyup.at").on("keyup.at", function(e) {
        var rect = self.$input[0].getBoundingClientRect();
        if(rect) {
          $("#autoTalkBox").css({
            top: rect.top
          });
        }
        var keyCode = (e || window.event).keyCode;
        var $p;
        if (app.config.keyCode.ENTER == keyCode) {
          $el.find("#typeahead-div p.active").trigger("click.at");
        } else if (app.config.keyCode.ESCAPE == keyCode) {
          self.hide();
        } else if (app.config.keyCode.UP == keyCode) {
          $p = $el.find("#typeahead-div p.active");
          if(1 > $p.length) {
            $el.find("#typeahead-div p").last().addClass("active");
          } else {
            $p.removeClass("active");
            if(0 < $p.prev().length) {
              $p.prev().addClass("active");
            } else {
              $el.find("#typeahead-div p").last().addClass("active");
            }
          }
        } else if (app.config.keyCode.DOWN == keyCode) {
          $p = $el.find("#typeahead-div p.active");
          if(1 > $p.length) {
            $el.find("#typeahead-div p").first().addClass("active");
          } else {
            $p.removeClass("active");
            if(0 < $p.next().length) {
              $p.next().addClass("active");
            } else {
              $el.find("#typeahead-div p").first().addClass("active");
            }
          }
        } else {
          var cursorPosition = self.getCursorPosition($input);
          if (!cursorPosition) {
            return self.hide();
          }
          var txt = $input.val().slice(0, cursorPosition);
          $("#autoTalkText")[0].innerHTML = txt.slice(0, txt.length).replace(/\n/g, "<br/>").replace(/\s/g, "&nbsp;") + self.positionHTML;
          var copiedText = txt.slice( - txt.length);
          copiedText.match(/(\w+)?@(\w+)$|@$/);
          if (copiedText && -1 != copiedText.indexOf("@") && $.trim(copiedText.substr( - 1))) {
            if ( - 1 == copiedText.substr(copiedText.lastIndexOf("@"), cursorPosition).indexOf(" ")) {
              var name = copiedText.substr(copiedText.lastIndexOf("@"));
              self.search($.trim(name.replace("@", "")));
              $el.removeClass("hide");
              var tipRect = $("#autoUserTipsPosition")[0].getBoundingClientRect(),
                userAgent = window.navigator.userAgent.toLowerCase(),
                left = $input.data("left") || 0,
                top = $input.data("top") || 0,
                offsetpx = 0;
              if("true" == $input.attr("isoffsetpx")) {
                var count = txt.split("\n").length;
                if(1 < count) {
                  offsetpx = $input.data("offsetpx") || 0;
                  if(1 <= userAgent.indexOf("firefox") && 0 != offsetpx) {
                    offsetpx += 1;
                  }
                  offsetpx *= count - 1;
                }
              }
              if(/msie 9\.0/i.test(userAgent)) {
                document.getElementById("atdiv").style.top = tipRect.top + 1 + top + offsetpx + "px";
                document.getElementById("atdiv").style.left = tipRect.left - 5 + left + "px";
              } else {
                $el.css({
                  top: tipRect.top + 1 + top + offsetpx + "px",
                  left: tipRect.left - 5 + left + "px"
                });
              }
            }
            $el.removeClass("hide");
          } else {
            return self.hide();
          }
        }
      });
      $el.off("click.at", "#typeahead-div p").on("click.at", "#typeahead-div p", function(e) {
        var obj = $(this).data("obj");
        if (self.clickHandler) {
          self.clickHandler(obj, $input);
        } else {
          var cursorPosition = self.getCursorPosition($input);
          var userDatas = self.$input.data("userData");
          var userId = obj.id,
            userName = obj.name,
            userNameWithBlank = userName + " ",
            inputVal = self.$input.val(),
            atIndex = 0;
          var atContents = "";
          var newInputVal = "";
          var subTxt;
          if (inputVal && (subTxt = inputVal.substr(0, cursorPosition))) {
            atIndex = subTxt.length;
            atContents = subTxt.split("@");
            var withoutLastAtContent = "";
            for (var i = 0; i < atContents.length; i++) {
              if(0 == i) {
                withoutLastAtContent = withoutLastAtContent + atContents[i];
              } else {
                if(i != atContents.length - 1) {
                  withoutLastAtContent = withoutLastAtContent + "@" + atContents[i];
                } else {
                  withoutLastAtContent = withoutLastAtContent + "@";
                }
              }
            }
            newInputVal = withoutLastAtContent + userNameWithBlank + inputVal.substr(cursorPosition);
          }
          var userObj = {
            userId: userId,
            userName: userName,
            atIndex: atIndex
          };
          if (userDatas) {
            for (var g = 0, k = 0; g < userDatas.length; g++) {
              if(userDatas[g].userId != userId) {
                k++;
              } else {
                if(-1 == $input.val().indexOf(userDatas[g].userName)) {
                  k++;
                }
              }
            }
            if(k == userDatas.length) {
              userDatas.push(userObj);
              self.$input.val("").focus().val(newInputVal);
            } else {
              self.$input.val("").focus().val(newInputVal + " ");
            }
          } else {
            userDatas = [];
            userDatas.push(userObj);
            self.$input.val("").focus().val(newInputVal);
          }
          self.$input.data("userData", userDatas);
          self.$input.focus();
          $("body").find($el).addClass("hide");
          self.hide();
        }
      });
    },
    preventEvent: function(e) {
      if(e && e.preventDefault) {
        e.preventDefault();
      } else {
        window.event.returnValue = false;
      }
      e.stopPropagation();
    },
    getCursorPosition: function($input) {
      if (document.selection && document.selection.length) {
        $input.focus();
        var selection = document.selection.createRange();
        var copiedSelection = selection.duplicate();
        copiedSelection.moveToElementText($input[0]);
        copiedSelection.setEndPoint("EndToEnd", selection);
        $input[0].selectionStart = copiedSelection.text.length - selection.text.length;
        $input[0].selectionEnd = $input[0].selectionStart + selection.text.length
      }
      return $input[0].selectionStart;
    },
    search: function(kw) {
      var self = this,
        $el = $(self.el);
      this.suggestion = kw;
      this.entity = "employee";
      $el.find("#typeahead-div .loading_small").addClass("employee").show();
      var url = self.remote,
        data = {};
      if(2 < escape(kw).length) {
        data.keywords = "%" + kw;
      }
      data.searchType = "employee";
      $.ajax({
        type: "get",
        url: url,
        dataType: "json",
        data: data,
        success: function(res) {
          var employees = res.employees;
          $el.find("#typeahead-div .loading_small").hide();
          if(10 < employees.length) {
            employees.push({
              id: "all",
              name: kw,
              module: "all"
            });
          }
          self.loadList(employees);
        }
      })
    },
    loadList: function(employees) {
      var $el = $(this.el);
      var suggestion = this.suggestion;
      var entity = this.entity;
      $el.find("#typeahead-div #searchList").empty();
      if (employees) {
        if (suggestion && 2 < escape(suggestion).length) {
          for (var i = 0, count = employees.length; i < count; i++) {
            var employee = employees[i];
            if ((employee.name || employee.username) == suggestion) {
              break;
            }
          }
        }
        i = 0;
        for (count = employees.length; i < count; i++) {
          employee = employees[i];
          employee.createTime = Date.create(employee.createTime).format("{yyyy}-{MM}-{dd}");
          employee.name = employee.name.replace(/</g, "&lt").replace(/>/g, "&gt").replace("/[\r\n]/g", " ");
          var $html = $($.trim(app.utils.template("suggestion." + entity, employee)));
          $html.data("obj", employee);
          if(employee.avatar) {
            $html.find(".avatar").attr("src", employee.avatar);
          }
          $el.find("#typeahead-div #searchList").append($html);
        }
        this.show();
      }
    },
    hide: function() {
      var $el = $(this.el);
      $el.find("#typeahead-div p").remove();
      $el.find("#typeahead-div").hide();
      $el.addClass("hide");
    },
    show: function() {
      var $el = $(this.el);
      $el.find("#typeahead-div").show();
      $el.removeClass("hide");
    },
    resetPostion: function() {
      var $el = $(this.el);
      var $target = this.$input;
      var top = $target.offset().top,
      left = $target.offset().left;
      $el.css({
        left: left + "px",
        top: top + "px"
      });
    },
    remove: function() {}
  });

  app.components.Userslider = Backbone.View.extend({
    initialize: function(data) {
      this.pageNO = 1;
      this.el = "#member-layer";
      this.userId = data.userId ? data.userId: app.config.currentUser.id;
      this._module = data.module;
      this.dataType = data.dataType;
      this.pageKey = this._module + "#" + this.userId;
      this.isFind = false;
      this.baseUrl = app.config.urlPrefix + '/organizations/' + app.config.organizationId;
      $("#member-layer").html(app.utils.template("component.userslider"));
      app.utils.layout("#memebers-wrapper");
    },
    delegateEvents: function() {
      var self = this, $el = $(self.el);
      $el.on("click.UserSlider", "li.more", function() {
        self.pageNO++;
        self.renderOthers(true);
      });
      $el.on("keydown.UserSlider", "#membersearch-keywords", function(e) {
        if (13 === e.keyCode) {
          self.pageNO = 1;
          self.isFind = true;
          var $li = $el.find("#members li:first");
          $el.find("#members").empty();
          $el.find("#members").prepend($li);
          var keywords = $el.find("#membersearch-keywords").val();
          var url = "";
          switch (self.dataType) {
            case "all":
              url = "/users.json";
              break;
            case "subordinate":
              if("" == $.trim(keywords)) {
                url = self.baseUrl + "/users/workreportSubordinates/" + self.userId + ".json?allSubordinate=false";
              } else {
                url = self.baseUrl + "/users/workreportSubordinates/" + self.userId + ".json";
              }
          }
          self.fetchData(url, keywords);
        }
      });
      $el.on("click.UserSlider", ".j_user p", function(e) {
        var $p = $(this).parent();
        $p.find(".j_expend");
        $p.find("#avatar").attr("user-id");
        var url = $p.find("#avatar").attr("url");
        ROUTER.navigate(url, {
          trigger: true
        });
        void 0 == $(this).parent().attr("parent_id") && $(this).parent().find(".j_expend").trigger("click");
      });
      $el.on("click.UserSlider", ".j_expend", function(e) {
        var $p = $(this).parent();
        var $this = $(this);
        var userId = $p.find("#avatar").attr("user-id");
        var url = "/users/directSubordinates/" + userId + ".json";
        if($this.hasClass("caret")) {
          if($this.hasClass("caret-up")) {
            $this.removeClass("caret-up");
            self.removeSubs($p, userId);
          } else {
            if(!self.existSubs($p, userId)) {
              self.fetchData(url, null, $p, userId);
            }
            $this.addClass("caret-up");
          }
        }
      });
    },
    render: function() {
      $(this.el);
      this.buildUser(app.config.currentUser);
      this.renderOthers(false);
    },
    removeAllSub: function(data, url) {
      var $el = $(this.el);
      $.ajax({
        type: "get",
        url: url,
        dataType: "json",
        success: function(res) {
          if (res && res.subordinates) {
            for (var i = 0; i < res.subordinates.length; i++) {
              $el.find("li[dele_id='" + res.subordinates[i].id + "']").remove();
            }
          }
        }
      })
    },
    removeSubs: function(data, userId) {
      $(this.el).find("li[parent_id='" + userId + "']").each(function() {
        $(this).addClass("hide");
      })
    },
    existSubs: function(data, userId) {
      var $el = $(this.el);
      if($el.find("li[parent_id='" + userId + "']") && 0 < $el.find("li[parent_id='" + userId + "']").size()) {
        $el.find("li[parent_id='" + userId + "']").each(function() {
          $(this).removeClass("hide");
        });
        return true;
      } else {
        return false;
      }
    },
    renderOthers: function(isAllSubordinate) {
      var kw = $(this.el).find("#membersearch-keywords").val();
      var url = '';
      switch (this.dataType) {
        case "all":
          url = "/users.json";
          $("#listTitle").text("所有成员");
          break;
        case "subordinate":
          url = this.baseUrl + "/users/workreportSubordinates/" + this.userId + ".json?allSubordinate=" + isAllSubordinate;
          $("#listTitle").text("我的团队");
      }
      this.fetchData(url, kw);
    },
    fetchData: function(url, userName, $UserSlider, userId) {
      var self = this, $el = $(this.el);
      $.ajax({
        type: "get",
        url: url,
        dataType: "json",
        data: {
          pageNo: self.pageNO,
          pageSize: 10,
          userName: userName
        },
        success: function(res) {
          var page = res.page || [];
          var subordinates = page.result || [];
          if("subordinate" == self.dataType) {
            subordinates = res.subordinates ? res.subordinates: page.result || [];
          }
          $el.find(".more").remove();
          for (var i = 0; i < subordinates.length; i++) {
            var subordinate = subordinates[i];
            if(subordinate && subordinate.id != app.config.currentUser.id) {
              self.buildUser(subordinate, $UserSlider, userId);
            }
          }
          if(page && page.hasNext) {
            $el.find("#members").append('<li class="more"><a>显示更多...</a></li>');
          }
        }
      })
    },
    buildUser: function(subordinate, $UserSlider, userId) {
      var $el = $(this.el),
      username = subordinate.username,
      subordinateId = subordinate.id,
      $user = $("#userClone").clone(),
      avatarUrl = subordinate.avatar ? subordinate.avatar: "/static/images/avatar.png";

      if("subordinate" == this.dataType) {
        $user.find("li").attr("dele_id", subordinate.id);
        subordinate.subordinate && $user.find(".j_expend").addClass("caret");
        if(userId) {
          $user.find("li").attr("parent_id", userId);
        }
        if(subordinateId == app.config.currentUser.id) {
          $user.find(".j_user").removeClass("j_user");
          $user.find("#avatar").attr("href", "/" + this._module + "/" + subordinateId).attr("user-id", subordinateId).attr("user-name", username).find("img").attr("src", avatarUrl);
          $user.find("#name").attr("href", "/" + this._module + "/" + subordinateId).attr("user-id", subordinateId).attr("user-name", username).text(username);
        } else {
          $user.find("#avatar").attr("url", "/" + this._module + "/" + subordinateId).attr("user-id", subordinateId).attr("user-name", username).find("img").attr("src", avatarUrl);
          $user.find("#name").attr("url", "/" + this._module + "/" + subordinateId).attr("user-id", subordinateId).attr("user-name", username).text(username);
        }
      } else {
        $user.find(".j_user").removeClass("j_user");
        $user.find(".j_expend").remove();
        $user.find("#avatar").attr("href", "/" + this._module + "/" + subordinateId).attr("user-id", subordinateId).attr("user-name", username).find("img").attr("src", avatarUrl);
        $user.find("#name").attr("href", "/" + this._module + "/" + subordinateId).attr("user-id", subordinateId).attr("user-name", username).text(username);
      }
      if($UserSlider) {
        $($UserSlider).after($user.html());
      } else {
        $el.find("#members").append($user.html());
      }
    },
    remove: function() {
      $(this.el).off(".UserSlider");
    }
  });

  app.components.InviteView = Backbone.View.extend({
    initialize: function(data) {
      this.username = data.username;
      this.$targetEl = data.$targetEl;
      this.callback = data.callback;
      this.el = data.container || "#user-invite";
      this.container = data.container || "body";
      this.type = data.type;
      this.inviteModel = new app.models.InviteModel();
      $(this.container).append(app.utils.template("component.invite"));
    },
    delegateEvents: function() {
      var self = this;
      $("#invite-modal").on("hidden.bs.modal", function() {
        self.remove();
      });
      $(self.el).on("click.invite", "#invite-submit", function(e) {
        var $this = $(this);
        var $userName = $(self.el).find('input[id="inputUsername"]');
        var userName = $userName.val();
        var ph = $userName.attr("placeholder");
        if(userName == ph) {
          userName = "";
        }
        var $email = $(self.el).find('input[id="inputEmail"]');
        var email = $email.val();
        var emailPh = $email.attr("placeholder");
        if(email == emailPh) {
          email = "";
        }
        if (email && !app.validations.formValidateImm($(self.el).find(".form-invite"))) {
          return false;
        }
        if("" == email) {
          app.alert('warning', "请输入必填项");
        } else {
          $this.attr("disabled", "true");
          var invite = {};
          invite["inviteInfo.invitee"] = userName;
          invite["inviteInfo.contact"] = email;
          self.inviteModel.saveInvite(invite, function(res) {
            $this.removeAttr("disabled");
            if(res.inviteInfo && "" != res.inviteInfo) {
              var inviteInfo = res.inviteInfo;
              if("success" == inviteInfo.msgType) {
                if(null == inviteInfo.id) {
                  app.alert('success', inviteInfo.message);
                  $email.val("");
                  self.clearValue($userName);
                } else {
                  app.alert('success', "已邀请 " + inviteInfo.invitee + " 加入Cobra");
                  if(self.callback) {
                    self.callback(inviteInfo);
                  }
                  if(self.type) {
                    $email.val("");
                    self.clearValue($userName);
                  }
                  self.remove();
                }
              } else {
                app.alert('error', inviteInfo.message);
                $email.val("");
                self.clearValue($userName);
              }
            }
          })
        }
      });
      $(self.el).on("click.invite", "#invite-cancel", function(e) {
        self.remove();
      });
      $(self.el).on("click.invite", function(e) {
        e.stopPropagation();
      });
      if("inline" != this.type) {
        $("body").on("click.invite", function(e) {
          self.remove();
        });
        $("body").on("keydown.invite", function(e) {
          if(27 == e.which) {
            self.remove();
          }
        })
      }
    },
    render: function() {
      var top = this.$targetEl.offset().top + 28;
      var left = this.$targetEl.offset().left;
      if(left + 240 > $(window).width()) {
        left -= 220;
      }
      $(this.el).css("left", left + "px").css("top", top + "px").css("z-index", 2000);
      $(this.el).find("input[name='username']").val(this.username).focus();
    },
    clearValue: function($el) {
      $el.val("");
      $el.focus();
    },
    remove: function() {
      if(!this.type) {
        $("body").off(".invite");
        $(this.el).off(".invite");
        $(this.el).remove();
      }
    }
  });

  app.components.Timeline = Backbone.View.extend({

    initialize: function(data) {
      this.userId = data.userId;
      this.year = data.year;
      this.type = data.type;
      this.serialNumber = data.serialNumber;
      this.el = data.container;
      this.parentEl = data.parentEl;
      $(this.el).html(app.utils.template('component.timeline'));
    },
    delegateEvents: function() {
      var self = this, $el = $(this.el);
      $el.on("click.timeline", ".j_timetree_spread", function() {
        var $treeHead = $(this).parent(),
            $treeWeekList = $treeHead.next(".timetree-weeklist"),
            c = $treeHead.parent().siblings(".timetree-month").parent().find(".timetree-weeklist");
        if($treeWeekList.is(":visible")) {
          $treeWeekList.slideUp("fast");
          $treeHead.addClass("active");
        } else {
          $(".timetree-head").removeClass("active");
          $treeHead.addClass("active");
          c.slideUp("fast");
          $treeWeekList.slideDown("fast");
        }
        $(".j_week").removeClass("active");
        var month = $(this).parent().find("strong").text();
        var year = $(".reports-selectyear span").text();
        ROUTER.navigate("/workreport/" + self.userId + "/" + year + "/month/" + month, {
            trigger: true
        });
        $(".reports-panel").data("year", year).data("type", "month").data("serialNumber", month);
      });
      $el.on("click.timeline", ".dropdown-menu a", function(e) {
        $(this).parents(".dropdown-menu").slideUp(100);
        $(this).parents(".dropdown-menu-toggle").removeData("showTimer");
        var year = $(this).text();
        $(this).parents(".dropdown").find("span").text(year);
        self.genYearSelect(year);
        self.genTimeLineByYear(year);
      });
      $el.on("click.timeline", ".halfyear", function(e) {
        var $this = $(this);
        self.changeCSS($this);
        var year = $(".reports-selectyear span").text();
        ROUTER.navigate("/workreport/" + self.userId + "/" + year + "/halfYear", {
          trigger: true
        });
        $(".reports-panel").data("year", year).data("type", "halfYear");
      });
      $el.on("click.timeline", ".endyear", function(e) {
        var $this = $(this);
        self.changeCSS($this);
        var year = $(".reports-selectyear span").text();
        ROUTER.navigate("/workreport/" + self.userId + "/" + year + "/year", {
            trigger: true
        });
        $(".reports-panel").data("year", year).data("type", "year")
      });
      $el.on("click.timeline", ".season", function(e) {
        var $this = $(this);
        self.changeCSS($this);
        var serialNumber = $this.attr("serialNumber");
        var year = $(".reports-selectyear span").text();
        ROUTER.navigate("/workreport/" + self.userId + "/" + year + "/season/" + serialNumber, {
          trigger: true
        });
        $(".reports-panel").data("year", year).data("type", "season").data("serialNumber", serialNumber);
      });
      $el.on("click.timeline", ".j_week", function(e) {
        e.preventDefault();
        var $this = $(this), year, week;
        $(".j_week").each(function(index, el) {
          if($(el).hasClass("active")) {
            $(el).removeClass("active")
          }
        });
        if(!$this.hasClass("active")){
          $this.addClass("active");
        }
        $this.parent().prev().removeClass("active");
        $(".reports-body").data("reportId", null);
        year = $(".reports-selectyear span").text();
        week = $this.find("span").text();
        ROUTER.navigate("/workreport/" + self.userId + "/" + year + "/week/" + week, {
          trigger: true
        });
        $(".reports-panel")
          .data("year", year)
          .data("type", "week")
          .data("serialNumber", week);
      })
    },
    render: function() {
      $(this.el);
      this.renderTimeLine();
      app.utils.layout("#timeline");
      $("#myReport").addClass("router").attr("href", "/workreport/" + this.userId);
    },
    changeCSS: function(el) {
      if(el.hasClass("season")) {
        if(1 == el.attr("serialNumber")) {
          $("div[serialnumber=1]").addClass("active");
          $("div[serialnumber=3]").removeClass("active");
        } else {
          $("div[serialnumber=3]").addClass("active");
          $("div[serialnumber=1]").removeClass("active");
        }
        $(".timetree-weeklist").css("display", "none");
        $(".halfyear").removeClass("active");
        $(".endyear").removeClass("active");
        $(".month").removeClass("active");
        $(".j_week").removeClass("active");
      }
      if(el.hasClass("halfyear")) {
        $(".halfyear").addClass("active");
        $(".timetree-weeklist").css("display", "none");
        $("div[serialnumber=1]").removeClass("active");
        $("div[serialnumber=3]").removeClass("active");
        $(".endyear").removeClass("active");
        $(".month").removeClass("active");
        $(".j_week").removeClass("active");
      }
      if(el.hasClass("endyear")) {
        $(".endyear").addClass("active");
        $(".timetree-weeklist").css("display", "none");
        $("div[serialnumber=1]").removeClass("active");
        $("div[serialnumber=3]").removeClass("active");
        $(".halfyear").removeClass("active");
        $(".month").removeClass("active");
        $(".j_week").removeClass("active");
      }
    },
    renderTimeLine: function() {
      if(this.type) {
        this.genYearSelect(this.year);
        if("week" == this.type) {
          this.genTimeLineByYear(this.year, this.serialNumber);
        } else if("month" == this.type) {
           this.genTimeLineByYear(this.year, null, this.serialNumber);
        } else {
          this.genTimeLineByYear(this.year, -1, -1);
        }
      } else {
        this.genYearSelect();
        this.genTimeLineByYear();
      }
    },
    genYearSelect: function(year) {
      var $el = $(this.el),
          activeYear = parseInt(Date.create(app.config.currentUser.activeDate).getFullYear()),
          nowYear = parseInt(Date.create(app.config.organization.nowTime).getFullYear()),
          nowTime = new Date(app.config.organization.nowTime);
      if(year) {
        year = parseInt(year);
        $el.find(".dropdown-toggle").find("span").text(year);
        $el = $el.find(".dropdown-menu");
        $el.html("");
        if(year - 2 >= activeYear) {
          $el.append("<li><a>" + (year - 2) + "</a></li>");
        }
        if(year - 1 >= activeYear) {
          $el.append("<li><a>" + (year - 1) + "</a></li>");
        }
        $el.append("<li><a>" + year + "</a></li>");
        if(year + 1 <= nowYear) {
          $el.append("<li><a>" + (year + 1) + "</a></li>");
        }
        if(year + 2 <= nowYear) {
          $el.append("<li><a>" + (year + 2) + "</a></li>");
        }
      } else {
        if(1 == nowTime.getISOWeek() && 12 == nowTime.getMonth() + 1) {
          nowYear += 1;
        }
        $el.find(".dropdown-toggle").find("span").text(nowYear);
        $el = $el.find(".dropdown-menu");
        $el.html("");
        if(nowYear - 2 >= activeYear) {
          $el.append("<li><a>" + (nowYear - 2) + "</a></li>");
        }
        if(nowYear - 1 >= activeYear) {
          $el.append("<li><a>" + (nowYear - 1) + "</a></li>");
        }
        $el.append("<li><a>" + nowYear + "</a></li>");
      }
    },
    genTimeLineByYear: function(year, week, serialNumber) {
      var nowTime = new Date(app.config.organization.nowTime);
      if(!year) {
        if(1 == nowTime.getISOWeek() && 12 == nowTime.getMonth() + 1) {
          year = nowTime.getFullYear() + 1;
        } else {
          year = nowTime.getFullYear();
        }
      }
      var cal_week = this.getWeeksOfYear(this.getWeekDayDate(year, 1, 1), year);
      if(!week) {
        week = nowTime.getISOWeek();
      }
      var weekDayDate, $weekEl, $endYearEl;
      (new Date(app.config.organization.nowTime)).getMonth();
      var nextMonth = 2,
          month = 1,
          $seasonEl = true,
          $halfYearEl = true,
          $thirdSeasonEl = true,
          $monthEl, $timeTree = $(".reports-timetree"),
          isThisYear = false;
      $timeTree.html("");
      for (var w = 1; w <= cal_week; w++) {
        weekDayDate = this.getWeekDayDate(year, w, 1);
        if(3 < month && $seasonEl) {
          $seasonEl = $("#season").clone();
          $seasonEl.find("span").text("第一季度");
          $seasonEl.find(".season").attr("serialNumber", 1);
          $timeTree.append($seasonEl.html());
          $seasonEl = false;
        } else if(6 < month && $halfYearEl) {
          $halfYearEl = $("#halfyear").clone();
          $timeTree.append($halfYearEl.html());
          $halfYearEl = false;
        } else if(9 < month && $thirdSeasonEl) {
          $thirdSeasonEl = $("#season").clone();
          $thirdSeasonEl.find("span").text("第三季度");
          $thirdSeasonEl.find(".season").attr("serialNumber", 3);
          $timeTree.append($thirdSeasonEl.html());
          $thirdSeasonEl = !1;
        }
        if(1 != w) {
          month = weekDayDate.getMonth() + 1
        }
        if(year == weekDayDate.getFullYear()) {
          isThisYear = true;
        } else {
          isThisYear = year != weekDayDate.getFullYear() && 1 == w;
        }
        if(nextMonth != month) {
          if($monthEl) {
            $timeTree.append($monthEl.html());
          }
          nextMonth = month;
          $monthEl = $("#month").clone();
          $monthEl.find("strong").text(month);
          $weekEl = $("#week").clone();
          if(isThisYear && month == serialNumber) {
            $monthEl.find(".timetree-head").addClass("active");
            $monthEl.find(".timetree-weeklist").css("display", "block");
          }
        } else {
          $weekEl = $("#week").clone();
        }
        if(isThisYear && w == week && !serialNumber) {
          $weekEl.find("span").text(w);
          $weekEl.find("li").addClass("active");
          $monthEl.find(".timetree-weeklist").css("display", "block");
        } else {
          $weekEl.find("span").text(w);
        }
        $monthEl.find(".timetree-weeklist").append($weekEl.html());
        if(w == cal_week) {
          $(".reports-timetree").append($monthEl.html());
          $endYearEl = $("#endyear").clone();
          $endYearEl.find("span").text(year + "年度");
          $timeTree.append($endYearEl.html());
        }
      }
    },
    getWeeksOfYear: function(date, year) {
      var daysOfYear = 0 == year % 4 && 0 != year % 100 || 0 == year % 400 ? 366 : 365; // 闰年 366 天
      return Math.ceil((daysOfYear - date.getDay()) / 7);
    },
    getWeekDayDate: function(year, week, weekDay) {
      var date = new Date(year, "0", "1");
      var time = date.getTime();
      date.setTime(time + 6048E5 * (week - 1));
      return this.getNextDate(date, weekDay);
    },
    getNextDate: function(date, weekDay) {
      weekDay %= 7;
      var day = date.getDay(), time = date.getTime();
      date.setTime(time + 864E5 * (weekDay - day));
      return date;
    },
    update: function(userId, year, type, serialNumber, isMyReport) {
      this.userId = userId;
      this.year = year;
      this.type = type;
      this.serialNumber = serialNumber;
      this.isMyReport = isMyReport;
    },
    remove: function() {
      $(this.el).off(".timeline")
    }
  });

}(window, app, Backbone, jQuery, _));