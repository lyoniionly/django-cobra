(function (window, app, Backbone, jQuery, _, moment) {
  "use strict";

  var $ = jQuery;

  app.task = {};

  app.task.MyTaskModel = Backbone.Model.extend({
    initialize: function(options) {
      this.userId = options.userId || null;
      this.taskList = this.isPaged = this.id = null;
      this.pageNo = 1;
      this.pageSize = 25;
      this.lastPage = null;
      this.pages = [];
      this.feedCount = this.unreadCount = 0
    },
    load: function(data, callback) {
      var self = this;
      $.ajax({
        contentType: "application/json;charset=UTF-8",
        type: "post",
        url: "/tasks/" + b.userId + ".json",
        dataType: "json",
        data: data,
        success: function(res) {
          self.taskList = res.taskList;
          self.isPaged = false;
          self.unreadCount = res.unreadCount || 0;
          self.feedCount = res.feedCount || 0;
          if(callback) {
            callback(res);
          }
        }
      });
    },
    create: function(task, param, callback) {
      var self = this;
      var data = {
        task: task
      };
      if(param) {
        var params = param.split("/");
        if("beginDate" == params[0]) {
          data.beginDateGroup = params[1];
        } else {
          data.group = data.dueDateGroup = params[1];
        }
      }
      $.ajax({
        contentType: "application/json;charset=UTF-8",
        type: "post",
        url: "/task.json",
        dataType: "json",
        data: JSON.stringify(data),
        success: function(res) {
          self.task = res.task;
          self.id = res.task.id;
          self.add(res.task);
          if(callback) {
            callback(res);
          }
        }
      })
    },
    changeProperty: function(taskId, propertyName, propertyValue, callback) {
      var data = {
        _method: "put",
        propertyName: propertyName
      };
      data["task." + propertyName] = propertyValue;
      $.ajax({
        type: "post",
        dataType: "json",
        url: "/task/" + taskId + ".json",
        data: data,
        success: function(res) {
          if(callback) {
            callback(res);
          }
        }
      })
    },
    updateSN: function(taskId, value, callback) {
      if(value) {
        this.changeProperty(taskId, "sn", value, callback);
      }
    },
    search: function(data, callback) {
      var self = this;
      $.ajax({
        contentType: "application/json;charset=UTF-8",
        type: "post",
        url: "/tasks/search.json",
        dataType: "json",
        data: data,
        success: function(res) {
          self.lastPage = res.page;
          self.pages.push(res.page);
          self.isPaged = true;
          self.unreadCount = res.unreadCount || 0;
          self.feedCount = res.feedCount || 0;
          if(callback) {
            callback(res);
          }
        }
      })
    },
    updateStatus: function(status, ids, callback) {
      var data = {};
      data.status = status;
      data.ids = ids;
      $.ajax({
        type: "get",
        url: "/task/updateStatus.json",
        dataType: "json",
        data: data,
        success: function(res) {
          if(callback) {
            callback(res);
          }
        }
      })
    },
    saveConfig: function(data, callback) {
      $.ajax({
        contentType: "application/json;charset=UTF-8",
        type: "post",
        url: "/base/configuration/saveConfig.json",
        dataType: "json",
        data: JSON.stringify({
          config: data
        }),
        success: function(res) {
          if(res.actionMsg) {
            app.alert('warning', "保存用户配置中遇到问题，请稍后再试")
          } else {
            if(callback) {
              callback();
            }
          }
        }
      });
    },
    clear: function() {
      this.pageNo = 1;
      this.lastPage = null;
      this.pages = []
    },
    add: function(task) {
      var taskList = this.isPaged ? this.lastPage.result: this.taskList;
      if(taskList && taskList.length) {
        0 > taskList.findIndex(function(t) {
          return t.id == task.id
        }) && taskList.push(task)
      } else {
        taskList.push(task);
      }
    },
    remove: function(task) {
      var taskList = this.isPaged ? this.lastPage.result: this.taskList;
      if(taskList && taskList.length) {
        taskList.remove(function(t) {
          return t.id == task
        });
      }
    }
  });

  app.task.WatchModel = Backbone.Model.extend({
    watch: function(data, callback) {
      $.ajax({
        contentType: "application/json;charset=UTF-8",
        url: "/watch/addAll.json",
        type: "post",
        dataType: "json",
        data: data,
        success: function(res) {
          if(callback) {
            callback(res);
          }
        }
      });
    },
    watchDelete: function(data, callback) {
      $.ajax({
        contentType: "application/json;charset=UTF-8",
        url: "/watch/deleteAll.json",
        type: "post",
        dataType: "json",
        data: data,
        success: function(res) {
          if(callback) {
            callback(res);
          }
        }
      });
    },
    watchOne: function(data, callback) {
      $.ajax({
        type: "post",
        dataType: "json",
        url: "/watch/" + data.id + ".json",
        data: data,
        success: function(res) {
          if(callback) {
            callback(res);
          }
        }
      });
    }
  });

  app.task.MyTaskView = Backbone.View.extend({
    el: "#j_taskcenter",
    initialize: function(options) {
      this.taskId = options.taskId;
      this.userId = options.userId;
      this.type = options.type;
      this.viewState = this._getConfig("viewState.task") || "list";
      this.model = new app.task.MyTaskModel(options);
      this.watchModel = new app.task.WatchModel();
      this.shareModel = new app.components.Share({
        entityId: "",
        module: ""
      });
      $(this.el).html(
        app.utils.template("task.mytask", {
          userId: this.userId
        })
      );
      this._$MAP = null;
      this._cache$();
      this._renderType();
      this.atmeview = new app.components.AtMeView({
        $input: $(this.el).find("#qcreatetask")
      });
    },
    _cache$: function() {
      var $beginDate = this.$el.find("#mytask-container .j_begin"),
      $dueDate = this.$el.find("#mytask-container .j_due");
      this._$MAP = {
        body: $("body"),
        beginDate: {
          divs: $beginDate,
          ulMap: {
            past: $beginDate.filter(".past").children(".task-list"),
            today: $beginDate.filter(".today").children(".task-list"),
            tomorrow: $beginDate.filter(".tomorrow").children(".task-list"),
            future: $beginDate.filter(".future").children(".task-list"),
            memo: $beginDate.filter(".memo").children(".task-list")
          }
        },
        dueDate: {
          divs: $dueDate,
          ulMap: {
            delay: $dueDate.filter(".delay").children(".task-list"),
            today: $dueDate.filter(".today").children(".task-list"),
            tomorrow: $dueDate.filter(".tomorrow").children(".task-list"),
            future: $dueDate.filter(".future").children(".task-list"),
            memo: $dueDate.filter(".memo").children(".task-list")
          }
        },
        list: {
          div: this.$el.find("#mytask-container .all-type-view"),
          ul: this.$el.find("#mytask-container .all-type .task-list")
        },
        dragableUL: this.$el.find("#mytask-container ul.task-list")
      }
    },
    delegateEvents: function() {
      var g = this,
        b = this.model,
        c = this.$el;
      /*this._$MAP.body.off("click.TaskList", ".goto-top").on("click.TaskList", ".goto-top", function(a) {
        app.utils.gotoTop(".j_mainscroll")
      });*/
      c.off("click.TaskList", ".j_moretask").on("click.TaskList", ".j_moretask", function() {
        b.pageNo++;
        g.search(true);
      });
      c.off("click.TaskList", "#view-state li").on("click.TaskList", "#view-state li", function() {
        var $this = $(this);
        $this.addClass("active").siblings().removeClass("active");
        $this = $this.data("value");
        g._toggleViewState($this);
      });
      c.off("mouseenter.TaskList", "#task-filter").on("mouseenter.TaskList", "#task-filter", function(a) {
        $(this).addClass("open");
        var $toggledEl = $(this).attr("data-toggle");
        if(!g.dropdownFilter) {
          g.dropdownFilter = new app.components.filter({
            el: $toggledEl,
            module: "task",
            targetObj: $(this),
            userId: g.userId,
            scroll: !0
          });
          g.dropdownFilter.render(a);
        }
        var timer = setTimeout(function() {
          $($toggledEl).parents(".dropdown-filter").slideDown("fast")
        }, 300);
        $(this).data("showTimer", timer);
      }).off("mouseleave.TaskList", "#task-filter").on("mouseleave.TaskList", "#task-filter", function(a) {
        $(this).removeClass("open");
        a = $(this).attr("data-toggle");
        var e = $(this).data("showTimer");
        e && clearTimeout(e);
        $(this).removeData("showTimer");
        $(a).parents(".dropdown-filter").slideUp(100)
      }).off("filter.TaskList", "#task-filter").on("filter.TaskList", "#task-filter", function(a) {
        "mine" == g.type ? g.mine() : (b.pageNo = 1, g.search(!1));
        $(this).removeClass("open")
      });
      c.off("click.TaskList", ".orderType").on("click.TaskList", ".orderType", function() {
        $(".orderType").parent("li").removeClass("active");
        $(this).parent("li").addClass("active");
        $("#task-order").attr("data-entity", $(this).attr("data-entity"));
        $("#task-order").attr("data-direction", $(this).attr("data-direction"));
        "mine" == g.type ? g.mine() : (b.pageNo = 1, g.search(!1));
        ROUTER.navigate("/tasks/" + g.userId, {
          trigger: !1
        })
      });
      c.off("click.TaskList", ".j_mineType ul li").on("click.TaskList", ".j_mineType ul li", function() {
        $(this).hasClass("active") || ($(this).addClass("active").siblings("li").removeClass("active"), $(this).data("type"), $("#task-taskType").attr("data-entity", $(this).attr("data-entity")), g.mine())
      });
      c.off("search.TaskList", "#tasksearch-keywords").on("search.TaskList", "#tasksearch-keywords", function(a) {
        b.pageNo = 1;
        g.search(!1)
      });
      c.off("keyup.TaskList", "#tasksearch-keywords").on("keyup.TaskList", "#tasksearch-keywords", function(a) {
        13 == a.which && $(this).trigger("search")
      });
      c.on("click.TaskList", ".task-watchs", function() {
        var a = g.findSelectedLi();
        0 < a.length ? g.watchModel.watch('{"module":"task","ids":"' + a + '"}',
        function(e) {
          f.notify("\u6279\u91cf\u5173\u6ce8\u6210\u529f");
          g.updateFastKey("watch", a)
        }) : f.notify("\u8bf7\u5148\u9009\u4e2d\u8bb0\u5f55")
      });
      this._$MAP.body.off("click.TaskList", ".task-reminds").on("click.TaskList", ".task-reminds", function(e) {
        e = g.findSelectedLi();
        if (0 < e.length) {
          var b = $(this);
          b.attr("module", "task");
          b.attr("targetIds", e); (new a({
            obj: b
          })).render()
        } else f.notify("\u8bf7\u5148\u9009\u4e2d\u8bb0\u5f55")
      });
      c.off("click.TaskList", ".shortcut .watch").on("click.TaskList", ".shortcut .watch", function(a) {
        a.stopPropagation();
        var e = {},
        b = $(this);
        e.module = b.attr("module");
        e.id = b.attr("targetId");
        "true" == b.attr("watched") ? (e._method = "DELETE", g.watchModel.watchOne(e, function(a) {
          f.notify("\u53d6\u6d88\u5173\u6ce8\u6210\u529f");
          b.html('\x3ci class\x3d"icon-favourite"\x3e\x3c/i\x3e\x26nbsp;\u5173\u6ce8');
          b.attr("watched", "false");
          a = g.subView;
          a.id && a.id == e.id && a.changeWatch(!1)
        })) : (e._method = "PUT", g.watchModel.watchOne(e, function(a) {
          f.notify("\u5173\u6ce8\u6210\u529f");
          b.html('\x3ci class\x3d"icon-star"\x3e\x3c/i\x3e\x26nbsp;\u53d6\u6d88\u5173\u6ce8');
          b.attr("watched", "true");
          a = g.subView;
          a.id && a.id == e.id && a.changeWatch(!0)
        }))
      });
      c.off("confirmHandler.TaskList", ".task-share").on("confirmHandler.TaskList", ".task-share", function(a, e) {
        var b = e.objs;
        if (b && !$.isEmptyObject(b)) {
          b = $.isArray(b) ? b: [b];
          g.sids = "";
          for (var c = 0; c < b.length; c++) g.sids += b[c].id + ",";
          g.shareModel.sids = g.sids;
          b = g.findSelectedLi();
          g.shareModel.entityIds = b;
          g.shareModel._module = "task";
          g.shareModel.saveAll(function(a) {
            a.addUserMessage ? f.notify(a.addUserMessage) : f.notify("\u6279\u91cf\u5171\u4eab\u64cd\u4f5c\u6210\u529f")
          })
        }
      });
      c.off("click.TaskList", ".task-share").on("click.TaskList", ".task-share", function(a) {
        a.stopPropagation();
        a = g.findSelectedLi();
        0 < a.length ? (new k({
          module: "task",
          entityIdArr: a
        })).render() : f.notify("\u8bf7\u5148\u9009\u4e2d\u8bb0\u5f55")
      });
      c.off("click.TaskList", ".task-finished").on("click.TaskList", ".task-finished", function() {
        var a = g.findSelectedUsefulLi();
        0 < a.length ? g.model.updateStatus("finished", a,
        function(e) {
          f.notify("\u6279\u91cf\u5b8c\u6210\u64cd\u4f5c\u6210\u529f");
          g.updateFastKey("finished", a)
        }) : f.notify("\u8bf7\u9009\u62e9\u6709\u5b8c\u6210\u6743\u9650\u7684\u8bb0\u5f55")
      });
      c.off("click.TaskList", ".shortcut .finish").on("click.TaskList", ".shortcut .finish", function(a) {
        a.stopPropagation();
        var e = $(this);
        if ($(this).attr("targetId") && $(this).attr("status") && !e.data("post")) {
          var c = "finished" == e.attr("status") ? "todo": "finished";
          a = e.attr("targetId");
          e.data("post", !0);
          b.updateStatus(c, a,
          function(a) {
            e.data("post", !1);
            a.actionMsg && a.actionMsg.message ? f.notify(a.actionMsg.message) : (f.notify("\u72b6\u6001\u4fee\u6539\u6210\u529f"), g._renderStatus(c, e.parents("li")))
          })
        } else f.notify("\u6ca1\u6709\u5b8c\u6210\u6743\u9650")
      });
      c.off("keyup.TaskList", "li.task input.input").on("keyup.TaskList", "li.task input.input", function(a, e) {
        var b = $(this),
        c = b.parents("ul:first");
        13 == a.which && (b = b.val()) && $.trim(b) && g._insertBlank(c)
      });
      c.off("confirmHandler.TaskList", ".shortcut .share").on("confirmHandler.TaskList", ".shortcut .share", function(a, e) {
        var b = e.objs;
        if (b && !$.isEmptyObject(b)) {
          b = $.isArray(b) ? b: [b];
          g.sids = "";
          for (var c = 0; c < b.length; c++) g.sids += b[c].id + ",";
          var k = $(this).attr("targetId");
          g.shareModel.sids = g.sids;
          g.shareModel.entityIds = k;
          g.shareModel._module = "task";
          g.shareModel.saveAll(function(a) {
            a.addUserMessage ? f.notify(a.addUserMessage) : f.notify("\u5171\u4eab\u64cd\u4f5c\u6210\u529f");
            var e = g.subView;
            e.id && e.id == k && e.addShare(a.shareEntrys)
          })
        }
      });
      c.off("click.TaskList", ".shortcut .share").on("click.TaskList", ".shortcut .share", function(a) {
        a.stopPropagation();
        $(this).hasClass("selector-toggle") ? (new n({
          $target: $(this)
        })).open() : f.notify("\u6ca1\u6709\u5171\u4eab\u6743\u9650")
      });
      c.off("click.TaskList", ".e-list-head").on("click.TaskList", ".e-list-head", function(a) {
        if (! (0 < $(a.target).closest(".group-add").length)) {
          a = $(this).find(".group-switch");
          var e = a.parents(".group-view").find(".task-list");
          "on" == a.attr("data-status") ? (a.attr("title", "\u5c55\u5f00"), a.attr("data-status", "off"), a.find("i:last").removeClass().addClass("icon-angle-down"), e.slideUp()) : (a.attr("title", "\u6298\u53e0"), a.attr("data-status", "on"), a.find("i:last").removeClass().addClass("icon-angle-right"), e.slideDown())
        }
      });
      c.off("click.TaskList", "#mytask-container .notask").on("click.TaskList", "#mytask-container .notask", function(a, e) {
        $(this).parent().siblings().children(".group-add").trigger("click")
      });
      c.off("click.TaskList", "#mytask-container .group-view .group-add").on("click.TaskList", "#mytask-container .group-view .group-add", function() {
        var a = $(this).parents(".group-view"),
        e = a.find(".task-list");
        if (e.find("input").size()) e.find("input").focus();
        else {
          var b = a.find(".group-switch");
          "off" == b.data("status") && (b.attr("title", "\u6298\u53e0"), b.attr("data-status", "on"), b.find("i:last").removeClass().addClass("icon-angle-down"), a.find(".task-list").slideDown());
          g._insertBlank(e)
        }
      });
      c.off("focusout.TaskList", "li.task input.input:not([readonly])").on("focusout.TaskList", "li.task input.input:not([readonly])", function(a, e) {
        var c = $(this),
        k = c.parents("li:first"),
        n = c.parents("ul:first");
        if (c.val() && c.val().trim()) {
          c.val();
          c.attr("title");
          var p = {};
          k.attr("data-module") || (n = n.attr("group"), p.content = "", p.name = c.val(), p.sn = k.attr("sn"), k.find(".e-list-loading").show(), c.attr("readonly", !0), b.create(p, n,
          function(a) {
            f.notify("\u4efb\u52a1\u521b\u5efa\u6210\u529f");
            a = b.task;
            k.attr({
              id: a.id
            });
            k.find(".shortcut").removeClass("hide");
            k.find(".finish").attr({
              targetId: a.id,
              status: a.status
            });
            k.find(".e-list-loading").hide();
            k.find("input").remove();
            k.find(".checkbox").after('\x3cdiv class\x3d"title j_entityslider-toggle" data-module\x3d"task" data-id\x3d"' + a.id + '"\x3e\x3cdiv class\x3d"text" title\x3d"' + a.name + '"\x3e\x3c/div\x3e\x3cspan class\x3d"importance" style\x3d"display:none"\x3e\u7d27\u6025\x3c/span\x3e\x3c/div\x3e');
            k.find(".title .text").text(a.name);
            g._refreshViewBaseCount()
          }))
        }
      });
      c.off("click.TaskList", "li.task").on("click.TaskList", "li.task", function(a) {
        $(this).hasClass("unread") ? (a = $(".j_unread").text().trim(), a = $.isNumeric(a) ? a: 0, 0 >= a - 1 ? $(".j_unread").addClass("hide") : $(".j_unread").text(a - 1)) : $(this).hasClass("newComment") && (a = $(".j_feed").text().trim(), a = $.isNumeric(a) ? a: 0, $.isNumeric(a) && 0 >= a - 1 ? $(".j_feed").addClass("hide") : $(".j_feed").text(a - 1));
        $(this).removeClass("unread");
        $(this).removeClass("newComment")
      });
      this._$MAP.dragableUL.sortable({
        opacity: .9,
        handle: ".title",
        revert: !0,
        connectWith: ".j_center .task-list",
        placeholder: "task-placeholder",
        cancel: ".readonly",
        over: function(a, e) {
          var b = e.item,
          c = $(this),
          k;
          switch (g.viewState) {
          case "beginDate":
            k = c.attr("group").split("/")[1];
            c = b.attr("due-date-group");
            break;
          case "dueDate":
            k = b.attr("begin-date-group");
            c = c.attr("group").split("/")[1];
            break;
          default:
            return
          }
          g._dateGroupValid(k, c) ? (e.placeholder.removeClass("disable"), b.data("cancel", !1), e.placeholder.html("")) : (e.placeholder.addClass("disable"), b.data("cancel", !0), e.placeholder.html("\x26nbsp;\x26nbsp;\u8d77\u59cb\u65e5\u4e0d\u80fd\u5728\u5230\u671f\u65e5\u4e4b\u540e"))
        },
        update: function(a, e) {
          e.item.data("cancel") ? $(this).sortable("cancel") : (g.rebuildSN(e.item.parent()), g.changeGroupWhileSort(e.item), "list" != g.viewState && e.sender && (g.rebuildSN(e.sender), g._changDateGroupByDrag(e.item), g._refreshViewBaseCount()))
        }
      }).disableSelection().off("click.mytask").on("click.mytask", function() {
        $("textarea:focus, input:focus").length && $("textarea:focus, input:focus").trigger("focusout")
      });
      c.off("focusin.mytask", "#qcreatetask").on("focusin.mytask", "#qcreatetask", function() {
        $(this).parent().addClass("active");
        g.atmeview.render()
      });
      c.off("focusout.mytask", "#qcreatetask").on("focusout.mytask", "#qcreatetask", function() {
        $(this).parent().removeClass("active")
      });
      c.off("keydown.mytask", "#qcreatetask").on("keydown.mytask", "#qcreatetask", function(a) {
        a.ctrlKey && 13 == a.which && c.find(".j_qcreatetask").trigger("click")
      });
      c.off("click.mytask", ".j_qcreatetask").on("click.mytask", ".j_qcreatetask", function() {
        var a = $("#qcreatetask");
        if (!a.attr("readonly")) {
          var e = a.val();
          if (e && $.trim(e) && "" != $.trim(e)) {
            var c = null,
            k = [],
            n = a.data("userData");
            if (n) for (var p = 0; p < n.length; p++) if ( - 1 != e.indexOf(n[p].userName)) {
              var d = "@" + n[p].userName; - 1 != e.indexOf(d) && (c ? k.push(n[p].userId) : c = n[p].userId);
              e = e.replace(new RegExp(d, "gm"), "")
            }
            100 < $.trim(e).length ? f.notify("\u4efb\u52a1\u540d\u5b57\u957f\u5ea6\u4e0d\u8d85\u8fc7100\u5b57") : 0 == $.trim(e).length ? f.notify("\u8bf7\u8f93\u5165\u4efb\u52a1\u540d\u79f0") : (n = {
              content: ""
            },
            n.name = e, n.sn = (new Date).getTime(), n.dueDate = (new Date).getTime(), c && (n.manager = {
              id: c
            }), b.create(n, null,
            function(e) {
              e = b.task;
              if (k && 0 < k.length) {
                var c = g.shareModel;
                c.sids = k.join(",");
                c.entityIds = e.id;
                c.entryType = "user";
                c._module = "task";
                c.shareType = "participants";
                c.saveAll()
              }
              f.notify("\u4efb\u52a1\u521b\u5efa\u6210\u529f");
              g._renderOneTask(e, !0);
              g._refreshViewBaseCount();
              g.highLight(e.id);
              a.attr("readonly", !1).data("manager", null).val("");
              k = []
            }))
          }
        }
      })
    },
    changeGroupWhileSort: function(a) {
      if (a) {
        var e = $(a).parent().attr("group");
        if (0 < e.indexOf("/") && e.substr(e.indexOf("/"))) {
          var e = e.substr(e.indexOf("/") + 1),
          g = this.model,
          b = g.taskList,
          c = [];
          if (b) for (var k = 0,
          n = b.length; k < n; k++) {
            if (b[k].id == $(a).data("id")) switch (console.log($(a).data("id")), console.log(e), this.viewState) {
            case "beginDate":
              b[k].beginDateGroup = e;
              break;
            case "dueDate":
              b[k].dateGroup = e
            }
            c.push(b[k])
          }
          g.taskList = c
        }
      }
    },
    _dateGroupValid: function(a, e) {
      if (a && e) {
        var g = this._getDateByGroup("beginDate", a),
        b = this._getDateByGroup("dueDate", e);
        return g && b ? g <= b ? !0 : !1 : !0
      }
      return ! 0
    },
    _changDateGroupByDrag: function(a) {
      var e = this.model,
      g = a.parent().attr("group").split("/"),
      b = this._getDateByGroup(g[0], g[1]),
      c = a.attr("id");
      e.changeProperty(c, g[0], b,
      function(e) {
        a.attr({
          "begin-date-group": e.task.beginDateGroup,
          "due-date-group": e.task.dueDateGroup
        });
        $("#entitySlider .taskId" + c).size() && ("beginDate" == g[0] ? $("#entitySlider #beginDate").trigger("updateDate.Task", b) : $("#entitySlider #dueDate").trigger("updateDate.Task", b))
      })
    },
    _getDateByGroup: function(a, e) {
      var g = Date.create(),
      b;
      switch (e) {
        case "past":
        case "delay":
          b = g.addDays( - 1).format("{yyyy}-{MM}-{dd}");
          break;
        case "today":
          b = g.format("{yyyy}-{MM}-{dd}");
          break;
        case "tomorrow":
          b = g.addDays(1).format("{yyyy}-{MM}-{dd}");
          break;
        case "future":
          b = g.addDays(7).format("{yyyy}-{MM}-{dd}");
          break;
        case "memo":
          b = null
      }
      return b
    },
    render: function() {
      var a = this,
      e = this.$el;
      a._request(a.type, a.viewState);
      switch (a.type) {
      case "mine":
        e.find("#view-taskType").removeClass("hide");
        this.mine();
        break;
      case "all":
        $(".j_timeview").removeClass("hide");
      case "mineManager":
      case "mineParticipants":
      case "mineCreate":
      case "unRead":
      case "newComment":
      case "watched":
      case "shareToMe":
      case "subordinates":
      case "finished":
        e.find("#view-state-toggle").addClass("hide"),
        e.find("#view-state-toggle").addClass("hide"),
        $(".task-finished").addClass("hide"),
        a.viewState = "list",
        a.search(!1)
      }
      "watched" == a.type ? $(".task-watchs").addClass("hide") : $(".task-watchs").removeClass("hide");
      a.renderUserConfig(); (new b({
        container: "#mytask-right",
        userId: this.userId
      })).render();
      setTimeout(function() {
        var e = a.$el.find("#mytask-container .e-list-group");
        _.each(e,
        function(a) {
          $(a).removeClass("animated");
          $(a).removeClass("zoomIn")
        })
      },
      1500);
      app.utils.layout(".j_mainscroll")
    },
    _renderAfterLoadMine: function() {
      var a = this.model;
      $("#mytask-loading").addClass("hide");
      this._renderByViewState(a.taskList, !1);
      this._renderMeta(!1);
      this.taskId && this.highLight(this.taskId)
    },
    _renderByViewState: function(a, e) {
      var g = this.viewState;
      e || this._clearView(this.viewState);
      switch (g) {
      case "list":
        this._renderAsList(a);
        break;
      case "dueDate":
      case "beginDate":
        this._renderAsDateGroup(a, g)
      }
    },
    _clearView: function(a) {
      switch (a) {
      case "list":
        this.$el.find("#mytask-container .all-type .task-list").empty();
        break;
      case "beginDate":
        a = {
          past: this.$el.find("#mytask-container .j_begin").filter(".past").children(".task-list"),
          today: this.$el.find("#mytask-container .j_begin").filter(".today").children(".task-list"),
          tomorrow: this.$el.find("#mytask-container .j_begin").filter(".tomorrow").children(".task-list"),
          future: this.$el.find("#mytask-container .j_begin").filter(".future").children(".task-list"),
          memo: this.$el.find("#mytask-container .j_begin").filter(".memo").children(".task-list")
        };
        for (var e in a) a[e].children("[class~\x3dtask]").remove();
        break;
      case "dueDate":
        for (e in a = {
          delay: this.$el.find("#mytask-container .j_due").filter(".delay").children(".task-list"),
          today: this.$el.find("#mytask-container .j_due").filter(".today").children(".task-list"),
          tomorrow: this.$el.find("#mytask-container .j_due").filter(".tomorrow").children(".task-list"),
          future: this.$el.find("#mytask-container .j_due").filter(".future").children(".task-list"),
          memo: this.$el.find("#mytask-container .j_due").filter(".memo").children(".task-list")
        },
        a) a[e].children("[class~\x3dtask]").remove()
      }
    },
    _renderMeta: function(a) {
      var e = this.model,
      g;
      switch (this.viewState) {
      case "list":
        if (g = this.$el.find("#mytask-container .all-type-view"), a) {
          a = e.lastPage;
          var b = (e = a.result) && e.length == a.pageSize;
          if (e.length) g.children(".no-result").addClass("hide"),
          g.children("#all-type-list").removeClass("hide"),
          b ? (g.children(".j_moretask").removeClass("hide"), g.children(".j_nodata").addClass("hide")) : (g.children(".j_moretask").addClass("hide"), g.children(".j_nodata, .center-more").addClass("hide"), 1 < a.pageNo && g.children(".j_nodata").removeClass("hide"));
          else switch (g.children().addClass("hide"), this.type) {
          case "mine":
          case "mineManager":
          case "mineCreate":
            g.children(".j_fast-create").removeClass("hide");
            break;
          default:
            g.children(".j_no-result-tip").removeClass("hide")
          }
        } else if (e = e.taskList, g.children().addClass("hide"), e.length) g.children().addClass("hide").filter("#all-type-list").removeClass("hide");
        else switch (g.children().addClass("hide"), this.type) {
        case "mine":
        case "mineManager":
        case "mineCreate":
          g.children(".j_fast-create").removeClass("hide");
          break;
        default:
          g.children(".j_no-result-tip").removeClass("hide")
        }
      }
    },
    _toggleViewState: function(a) {
      var e = this.model;
      this.viewState = a;
      this._request(this.type, this.viewState);
      this.$el.find("#mytask-loading").addClass("hide");
      this._renderByViewState(e.isPaged ? e.lastPage.result: e.taskList);
      this.setConfig("viewState.task", a)
    },
    _getConfig: function(configKey) {
      var config = null;
      var configValue = null;
      if(this.userId == app.config.currentUser.id) {
        config = app.config.userConfig.find(function(config) {
          return config.configKey == configKey
        });
        if(config) {
          configValue = config.configValue;
        }
      }
      return configValue;
    },
    setConfig: function(configKey, configValue) {
      if (this.userId == app.config.currentUser.id) {
        var model = this.model,
          config = null,
          flag = false;
        if (app.config.userConfig) {
          for (var i = 0; i < app.config.userConfig.length; i++) {
            config = app.config.userConfig[i];
            if (config.configKey == configKey) {
              flag = true;
              var oldValue = config.configValue;
              config.configValue = configValue;
              if(oldValue != configValue) {
                model.saveConfig(config);
              }
              break
            }
          }
          if(!flag) {
            config = {
              configKey: configKey,
              configValue: configValue
            };
            model.saveConfig(config, function() {
              app.config.userConfig.push(config);
            })
          }
        }
      }
    },
    _renderAsDateGroup: function(a, e) {
      for (var g = 0; g < a.length; g++) this._renderOneTask(a[g]);
      this._refreshViewBaseCount()
    },
    _renderOneTask: function(a, e) {
      $("#task-type").attr("data-entity");
      var g = $("#taskClone").clone();
      g.attr({
        id: a.id,
        sn: a.sn,
        "data-module": "task",
        "data-id": a.id,
        "begin-date-group": a.beginDateGroup,
        "due-date-group": a.dueDateGroup
      });
      g.find(".j_entityslider-toggle").attr({
        "data-module": "task",
        "data-id": a.id
      });
      a.watched ? (g.find(".watch").html('\x3ci class\x3d"icon-star"\x3e\x3c/i\x3e\x26nbsp;\u53d6\u6d88\u5173\u6ce8'), g.find(".watch").attr("watched", "true")) : g.find(".watch").attr("watched", "false");
      g.find(".watch").attr("targetId", a.id);
      g.find(".watch").attr("module", "task");
      "urgency" == a.priority ? g.find(".importance").removeClass("hide").text("\u975e\u5e38\u7d27\u6025").addClass("urgency") : "high" == a.priority && g.find(".importance").removeClass("hide").text("\u7d27\u6025").addClass("high");
      "finished" != this.type ? this._renderStatus(a.status, g) : g.find(".finish").html('\x3ci class\x3d"icon-finished"\x3e\x3c/i\x3e\x26nbsp;\u6807\u8bb0\u672a\u5b8c\u6210').attr({
        status: "finished",
        title: "\u5f53\u524d\u72b6\u6001\u4e3a\u5df2\u5b8c\u6210\uff0c\u70b9\u51fb\u8bbe\u7f6e\u4e3a\u672a\u5b8c\u6210"
      });
      this.type && "unRead" == this.type ? g.addClass("unread") : this.type && "newConment" == this.type ? g.addClass("newComment") : (a.newConment && g.addClass("newComment"), a.unread && g.addClass("unread").removeClass("newComment"));
      a.commentCount = 0;
      0 != a.commentCount && g.find(".comment-count").html('\x3ci class\x3d"icon-chat-3 mr-3"\x3e\x3c/i\x3e\x3cem\x3e' + a.commentCount + "\x3c/em\x3e");
      g.find(".share").attr("targetId", a.id);
      g.find(".shortcut").removeClass("hide");
      1 < a.permission ? g.addClass("editable") : g.addClass("readonly");
      1 == a.permission ? (g.find("input").attr("value", a.name).attr("title", a.name).attr("readonly", !0), "subordinates" == this.type && g.find(".finish").attr("targetId", a.id), "subordinates" == this.type && 1 == a.locked && g.find(".finish").removeAttr("targetId"), "subordinates" == this.type && 0 == a.relationflag && g.find(".finish").removeAttr("targetId")) : (g.find(".finish").attr("targetId", a.id), 3 === a.permission && a.locked && g.find(".finish").removeAttr("targetId"), g.find("input").attr("value", a.name).attr("title", a.name));
      g.find(".title .text").attr("title", a.name).text(a.name);
      var b = a.dueDate ? Date.create(a.dueDate).format("{yyyy}-{MM}-{dd}") : "";
      g.find(".date").html(b);
      a.manager && a.manager.username != TEAMS.currentUser.username && g.find(".user").html(a.manager.username);
      b = null;
      switch (this.viewState) {
      case "beginDate":
        b = this._$MAP[this.viewState].ulMap[a.beginDateGroup];
        break;
      case "dueDate":
        b = this.$el.find("#mytask-container .j_due");
        b = {
          delay: b.filter(".delay").children(".task-list"),
          today: b.filter(".today").children(".task-list"),
          tomorrow: b.filter(".tomorrow").children(".task-list"),
          future: b.filter(".future").children(".task-list"),
          memo: b.filter(".memo").children(".task-list")
        } [a.dateGroup];
        break;
      case "list":
        b = this.$el.find("#mytask-container .all-type .task-list")
      }
      var c = b.children(".task").size(),
      c = c ? c + 1 : 1;
      e ? (b.prepend(g), this.rebuildSN(b)) : (g.find(".sn").html(c), b.append(g))
    },
    _refreshViewBaseCount: function() {
      function a() {
        for (b in g) c = g[b],
        k = c.parent(),
        n = c.children(".task").size(),
        0 < n ? (k.removeClass("hide").find(".j_count").html("(" + n + ")"), c.children(".notask").addClass("hide")) : c.children(".notask").size() ? (c.children(".notask").removeClass("hide"), k.removeClass("hide").find(".j_count").html("")) : k.addClass("hide").find(".j_count").html("")
      }
      function e(a) {
        c = g;
        k = c.parent();
        switch (a) {
        case "mine":
        case "mineManager":
        case "mineCreate":
          c.children().size() ? (k.children(".j_fast-create, .j_no-result-tip").addClass("hide"), c.removeClass("hide")) : (k.children(".j_fast-create").removeClass("hide"), k.children(".j_no-result-tip").addClass("hide"), c.addClass("hide"));
          break;
        default:
          c.children().size() ? (k.children(".j_fast-create, .j_no-result-tip").addClass("hide"), c.removeClass("hide")) : (k.children(".j_fast-create").addClass("hide"), k.children(".j_no-result-tip").removeClass("hide"), c.addClass("hide"))
        }
      }
      var g, b, c, k, n;
      switch (this.viewState) {
      case "beginDate":
        g = this._$MAP.beginDate.ulMap;
        a();
        break;
      case "dueDate":
        g = {
          delay: this.$el.find("#mytask-container .j_due").filter(".delay").children(".task-list"),
          today: this.$el.find("#mytask-container .j_due").filter(".today").children(".task-list"),
          tomorrow: this.$el.find("#mytask-container .j_due").filter(".tomorrow").children(".task-list"),
          future: this.$el.find("#mytask-container .j_due").filter(".future").children(".task-list"),
          memo: this.$el.find("#mytask-container .j_due").filter(".memo").children(".task-list")
        };
        a();
        break;
      case "list":
        g = this._$MAP.list.ul,
        e(this.type)
      }
    },
    renderUserConfig: function() {
      var a = this,
      e = a._getConfig("order.task.search"),
      g = a._getConfig("order.task.searchDirection");
      e && g && $(".orderType").each(function(a) {
        a = $(this);
        a.attr("data-entity") == e && a.attr("data-direction") == g && (a.parent().addClass("active"), $("#task-order").attr("data-entity", e).attr("data-direction", g))
      });
      a.viewState && a.$el.find("#view-state").children().removeClass("active").each(function(e) {
        e = $(this);
        if (e.attr("data-value") == a.viewState) return e.addClass("active"),
        !1
      })
    },
    _renderStatus: function(a, e) {
      "finished" == a ? (e.find(".finish").html('\x3ci class\x3d"icon-finished"\x3e\x3c/i\x3e\x26nbsp;\u6807\u8bb0\u672a\u5b8c\u6210').attr({
        status: "finished",
        title: "\u5f53\u524d\u72b6\u6001\u4e3a\u5df2\u5b8c\u6210\uff0c\u70b9\u51fb\u8bbe\u7f6e\u4e3a\u672a\u5b8c\u6210"
      }), e.find(".title .text").addClass("finished-line")) : (e.find(".finish").html('\x3ci class\x3d"icon-todo"\x3e\x3c/i\x3e\x26nbsp;\u6807\u8bb0\u5b8c\u6210').attr({
        status: "todo",
        title: "\u5f53\u524d\u72b6\u6001\u4e3a\u672a\u5b8c\u6210\uff0c\u70b9\u51fb\u8bbe\u7f6e\u4e3a\u5b8c\u6210"
      }), e.find(".title .text").removeClass("finished-line"))
    },
    _insertBlank: function(a) {
      var e = $("#taskClone").clone(),
      g = a.attr("group").split("/");
      "beginDate" == g[0] ? e.attr("begin-date-group", g[1]) : e.attr("due-date-group", g[1]);
      g = (new Date).getTime();
      e.attr({
        sn: g,
        id: g
      });
      e.find(".sn").html("");
      e.find(".title .text").replaceWith('\x3cinput type\x3d"text" class\x3d"input" value\x3d"" tabindex\x3d"-1" maxlength\x3d"100"/\x3e');
      a.prepend(e).find(".notask").addClass("hide");
      this.rebuildSN(a);
      this.highLight(g);
      e.find("input.input").focus()
    },
    updateFastKey: function(a, e) {
      for (var g = e.split(","), b = 0; b < g.length - 1; b++) {
        var c = $("#mytask-container #" + g[b]);
        "watch" == a ? (c.find(".watch").html('\x3ci class\x3d"icon-star"\x3e\x3c/i\x3e\x26nbsp;\u53d6\u6d88\u5173\u6ce8'), c.find(".watch").attr("watched", "true")) : "finished" == a && this._renderStatus("finished", c)
      }
    },
    findSelectedUsefulLi: function() {
      var a = "";
      $(".j_center .e-list .checkbox").each(function() {
        $(this).find("i").hasClass("icon-checkbox-checked") && void 0 != $(this).parent("li").find(".finish").attr("targetId") && (a += $(this).parent("li").attr("id") + ",")
      });
      return a
    },
    findSelectedLi: function() {
      var a = "";
      $(".j_center .e-list .checkbox").each(function() {
        $(this).find("i").hasClass("icon-checkbox-checked") && (a += $(this).parent("li").attr("id") + ",")
      });
      return a
    },
    highLight: function(a) {
      $("#mytask-container li.active").removeClass("active");
      $("#mytask-container #" + a).addClass("active")
    },
    rebuildSN: function(a) {
      a = a.find("li.task");
      for (var e = 0; e < a.length; e++) $(a[e]).find(".sn").html(e + 1)
    },
    beforeOpenTask: function(a) {
      this.highLight(a)
    },
    insertTask: function(a) {
      this.model.add(a);
      this._renderOneTask(a, !0);
      this._refreshViewBaseCount();
      this.highLight(a.id)
    },
    removeTask: function(a) {
      this.model.remove(a);
      a = $("#mytask-container #" + a);
      var e = a.parent();
      a.remove();
      this.rebuildSN(e);
      this._refreshViewBaseCount()
    },
    changeStatus: function(a, e) {
      var g = this.$el.find("#mytask-container #" + a);
      this._renderStatus(e, g)
    },
    changeWatch: function(a, e) {
      var g = $("#mytask-container #" + a);
      e ? (g.find(".watch").html('\x3ci class\x3d"icon-star"\x3e\x3c/i\x3e\x26nbsp;\u53d6\u6d88\u5173\u6ce8'), g.find(".watch").attr("watched", "true")) : (g.find(".watch").html('\x3ci class\x3d"icon-favourite"\x3e\x3c/i\x3e\x26nbsp;\u5173\u6ce8'), g.find(".watch").attr("watched", "false"))
    },
    changeTitle: function(a, e) {
      $("#mytask-container #" + a).find(".title .text").text(e).attr("title", e)
    },
    changeManager: function(a, e) {
      a && (a.username != TEAMS.currentUser.username ? $("#mytask-container #" + e + " .user").html(a.username) : $("#mytask-container #" + e + " .user").html(""))
    },
    changeDuedate: function(a) {
      var e = $("#mytask-container #" + a.id);
      0 < e.length && (e = $(e[0]));
      var g = a.dueDate ? Date.create(a.dueDate).format("{yyyy}-{MM}-{dd}") : "";
      e.find(".date").html(g);
      if ("dueDate" == this.viewState) {
        if (g = e.attr("due-date-group"), g != a.dueDateGroup) {
          var g = this._$MAP[this.viewState].ulMap[g],
          b = this._$MAP[this.viewState].ulMap[a.dueDateGroup];
          e.prependTo(b);
          e.attr("due-date-group", a.dueDateGroup);
          this.changeTaskGroup(a);
          this.rebuildSN(g);
          this.rebuildSN(b);
          this._refreshViewBaseCount();
          this.highLight(a.id)
        }
      } else e.attr("due-date-group", a.dueDateGroup)
    },
    changeTaskGroup: function(a) {
      if (a) {
        var e = this.model,
        g = e.taskList,
        b = [];
        if (g) for (var c = 0,
        k = g.length; c < k; c++) g[c].id == a.id && (g[c].dueDateGroup = a.dueDateGroup, g[c].dateGroup = a.dueDateGroup),
        b.push(g[c]);
        e.taskList = b
      }
    },
    changeBeginDate: function(a) {
      var e = $("#mytask-container #" + a.id);
      0 < e.length && (e = $(e[0]));
      if ("beginDate" == this.viewState) {
        var g = e.attr("begin-date-group");
        if (g != a.beginDateGroup) {
          var g = this._$MAP[this.viewState].ulMap[g],
          b = this._$MAP[this.viewState].ulMap[a.beginDateGroup];
          e.attr("begin-date-group", a.beginDateGroup);
          e.prependTo(b);
          0 < g.find("#" + a.id).length && g.find("#" + a.id).remove();
          this.changeBeginDateGroup(a);
          this.rebuildSN(g);
          this.rebuildSN(b);
          this._refreshViewBaseCount();
          this.highLight(a.id)
        }
      } else e.attr("begin-date-group", a.beginDateGroup)
    },
    changeBeginDateGroup: function(a) {
      if (a) {
        var e = this.model,
        g = e.taskList,
        b = [];
        if (g) for (var c = 0,
        k = g.length; c < k; c++) g[c].id == a.id && (g[c].dateGroup = a.beginDateGroup, g[c].beginDateGroup = a.beginDateGroup),
        b.push(g[c]);
        e.taskList = b
      }
    },
    _buildQueryParam: function() {
      var a = this.model,
      e = {},
      g = $("#task-filter").data("data-filter"),
      b = $("#task-order").attr("data-entity"),
      c = $("#task-order").attr("data-direction"),
      k = $("#task-taskType").attr("data-entity"),
      n = this.type ? this.type: "mine";
      if ("mine" == n || null == n)"mineManager" == k ? n = "mineManager": "mineParticipants" == k ? n = "mineParticipants": "mine" == k && (n = "mine");
      var k = $.trim($("#tasksearch-keywords").val()),
      p = $("#tasksearch-keywords").attr("placeholder");
      k == p && (k = "");
      g = g ? JSON.parse("{" + g + "}") : {};
      k && (n = "all", g.keywords = k);
      g.type = n;
      "all" != n && (g.taskStatus = "todo");
      e.filter = g;
      b && c && (e.order = {
        property: b,
        direction: c
      });
      a.userId = this.userId ? this.userId: a.userId;
      a.id = this.id ? this.id: a.id;
      e.userId = a.userId;
      e.pageNo = a.pageNo;
      e.noPageCount = !0;
      return JSON.stringify(e)
    },
    _request: function(a, e) {
      switch (a) {
      case "mine":
        switch (e) {
        case "list":
          this._$MAP.list.div.removeClass("hide");
          this._$MAP.list.ul.removeClass("hide");
          this._$MAP.beginDate.divs.addClass("hide");
          this._$MAP.dueDate.divs.addClass("hide");
          break;
        case "dueDate":
          this._$MAP.list.div.addClass("hide");
          this._$MAP.list.ul.addClass("hide");
          this._$MAP.beginDate.divs.addClass("hide");
          this._$MAP.dueDate.divs.removeClass("hide");
          break;
        case "beginDate":
          this._$MAP.list.div.addClass("hide"),
          this._$MAP.list.ul.addClass("hide"),
          this._$MAP.beginDate.divs.removeClass("hide"),
          this._$MAP.dueDate.divs.addClass("hide")
        }
        break;
      default:
        this._$MAP.list.div.removeClass("hide"),
        this._$MAP.beginDate.divs.addClass("hide"),
        this._$MAP.dueDate.divs.addClass("hide")
      }
      $("#mytask-loading").removeClass("hide")
    },
    mine: function() {
      var a = this,
      e = this.model,
      g = this._buildQueryParam();
      e.load(g,
      function() {
        a._renderAfterLoadMine()
      })
    },
    search: function(a) {
      var e = this,
        g = e.model,
        b = e._buildQueryParam();
      g.search(b, function(g) {
        e._renderAfterSearch(a)
      });
    },
    _renderAfterSearch: function(a) {
      var e = this.model;
      this.$el.find("#mytask-loading").addClass("hide");
      this._renderByViewState(e.lastPage.result, a);
      this._renderMeta(!0)
    },
    _renderAsList: function(a) {
      for (var e = 0; e < a.length; e++) this._renderOneTask(a[e], !1);
      a = this.$el.find("#mytask-container .all-type .task-list");
      0 == a.children().length && this.$el.find("#mytask-container .all-type .j_fast-create").removeClass("hide");
      this.rebuildSN(a);
      $(".j_center #check-all").removeClass("icon-checkbox-checked").addClass("icon-checkbox-unchecked")
    },
    _renderType: function() {
      var a = "";
      TEAMS.blogUser && "female" == TEAMS.blogUser.sex ? a = "\u5979": TEAMS.blogUser && (a = "\u4ed6");
      $("#view-taskType li").each(function() {
        var e = $(this),
        g = e.attr("title");
        g && e.children("a").html(a + g)
      })
    },
    undelegateEvents: function() {
      null != this._$MAP && (this._$MAP.body.off(".TaskList"), this._$MAP.dragableUL.sortable("destroy"));
      this.$el.off(".TaskList")
    },
    remove: function() {
      this.undelegateEvents();
      this._$MAP = null;
      this.header && (this.header.remove(), this.header = null);
      this.dropdownFilter && (this.dropdownFilter.remove(), this.dropdownFilter = null)
    }
  });

}(window, app, Backbone, jQuery, _, moment));