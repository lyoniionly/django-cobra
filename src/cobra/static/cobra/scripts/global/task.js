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

  app.task.TaskRightView = Backbone.View.extend({
    initialize: function(options) {
      this.container = options.container;
      this.subId = this.userId = options.userId;
      this.el = "#task-right";
      this.pageNo = 1;
      this.pageSize = 5;
      this.sub = false;
      $(this.container).html(app.utils.template("task.taskright"));
    },
    delegateEvents: function() {
      var self = this;
      var $el = $(self.el);
      $el.on("click.taskright", ".j_submore", function() {
        self.pageNo++;
        self.renderSub();
      });
      $el.on("click.taskright", ".j_employee-click", function() {
        var $empList = $(this).parents("#empList");
        var title = $(this).attr("title");
        $(this).addClass("checked");
        self.sub = true;
        self.name = title;
        self.subId = $(this).attr("userId");
        $empList.find('a[title!="' + title + '"]').removeClass("checked");
        self.subId ? self.renderSubChart(false) : self.renderSubChart(true);
      });
    },
    render: function() {
      if(app.config.noSubordinates==1) {
        $(".sbox").last().addClass("hide");
      }
      var self = this;
      $(self.el);
      self.option = {
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b} : {c}"
        },
        legend: {
          orient: "horizontal",
          x: "center",
          y: "bottom",
          borderColor: "#CCC",
          borderWidth: 1,
          textStyle: {
            fontFamily: "Arial,Microsoft YaHei,sans-serif"
          },
          data: [{
            name: "延期的"
          }, {
            name: "未完成的"
          }, {
            name: "有进展的"
          }, {
            name: "已完成的"
          }]
        },
        toolbox: {
          show: true,
          feature: {
            restore: {
              show: true
            },
            saveAsImage: {
              show: true,
              name: ""
            }
          }
        },
        series: [{
          name: "任务统计",
          type: "pie",
          center: ["50%", "40%"],
          minAngle: 20,
          startAngle: 45,
          radius: ["40%", "70%"],
          itemStyle: {
            normal: {
              label: {
                show: true,
                formatter: "{c}"
              },
              labelLine: {
                show: true,
                length: 5
              }
            },
            emphasis: {
              label: {
                show: true,
                position: "center",
                textStyle: {
                  fontSize: "15",
                  fontWeight: "bold"
                }
              }
            }
          },
          data: [{
            value: 0,
            name: "未完成的"
          }, {
            value: 0,
            name: "有进展的"
          }, {
            value: 0,
            name: "延期的"
          }, {
            value: 0,
            name: "已完成的"
          }]
        }]
      };
      self.load(false, function(c) {
        h.async("/js/echarts.min.js", function() {
          self.tc = echarts.init($("#mytask")[0]);
          var b = self.option.series[0].data;
          var a = c.chartData;
          var g = $(self.el).find(".sbox-title");
          if(!a || 0 == a.todoCount && 0 == a.feedCount && 0 == a.dueCount && 0 == a.finishedCount) {
            b[0].value = 1;
            b[1].value = 1;
            b[2].value = 1;
            b[3].value = 1;
            self.tc.setOption(self.option);
            g.text("今天任务统计示例");
          } else {
            b[0].value = a.todoCount;
            b[1].value = a.feedCount;
            b[2].value = a.dueCount;
            b[3].value = a.finishedCount;
            self.tc.setOption(self.option);
            g.text("今天任务统计");
          }
        })
      });
      self.renderSub();
    },
    renderSub: function() {
      var $el = $(this.el);
      var self = this;
      $.ajax({
        type: "get",
        url: "/tasks/subList.json",
        dataType: "json",
        data: {
          pageNo: self.pageNo,
          pageSize: self.pageSize,
          userId: self.userId
        },
        success: function(res) {
          var result = res.pageSub.result;
          if (result && 0 < result.length) {
            self.sub = true;
            $el.find("#sub").show();
            if(self.pageNo==1) {
              self.renderSubChart(true);
            }
            var $empList = $("#empList");
            $empList.find(".j_submore").remove();
            if (self.pageNo==1) {
              var $empItem = $("#empItem span").clone();
              $empItem.find("a").attr({
                userId: null,
                title: "所有下属"
              }).text("所有下属").addClass("checked");
              $empList.append($empItem);
            }
            $(result).each(function(index, item) {
              $empItem = $("#empItem span").clone();
              $empItem.find("a").attr({
                userId: item.subId,
                title: item.subName
              }).text(item.subName);
              $empList.append($empItem);
            });
            if(res.pageSub.hasNext) {
              $empList.append($(".j_submore ").clone().removeClass("hide"));
            }
          } else {
            $el.find(".j_nosub").show();
            $("#subtask").addClass("hide");
          }
        }
      });
    },
    renderSubChart: function(sub) {
      var self = this;
      var name = self.name ? self.name: "下属";
      $(self.el).find(".j_sub").text(name + "今天任务统计");
      self.load(sub, function(res) {
        h.async("/js/echarts.min.js",
        function() {
          self.tc1 = echarts.init($("#subtask")[0]);
          var data = self.option.series[0].data;
          var chartData = res.chartData;
          if(!chartData || 0 == chartData.todoCount && 0 == chartData.feedCount && 0 == chartData.dueCount && 0 == chartData.finishedCount) {
            $("#empList").addClass("hide");
            $("#subtask").addClass("hide");
            $(".j_notask").removeClass("hide");
          } else {
            data[0].value = chartData.todoCount;
            data[1].value = chartData.feedCount;
            data[2].value = chartData.dueCount;
            data[3].value = chartData.finishedCount;
            $("#empList").removeClass("hide");
            $("#subtask").removeClass("hide");
            $(".j_notask").addClass("hide");
          }
          if(self.sub) {
            $("#empList").removeClass("hide");
          }
          self.tc1.setOption(self.option);
          self.tc1.resize();
          self.tc1.restore();
        });
      });
    },
    load: function(sub, callback) {
      var subId = this.subId;
      var userId = this.userId;
      $.ajax({
        type: "get",
        url: "/tasks/chartData.json",
        dataType: "json",
        data: {
          userId: subId ? subId: userId,
          sub: sub
        },
        success: function(res) {
          if(callback) {
            callback(res);
          }
        }
      })
    },
    remove: function() {
      if(this.tc) {
        this.tc.clear();
        this.tc.dispose();
      }
      if(this.tc1) {
        this.tc1.clear();
        this.tc1.dispose();
      }
      $(this.el).off(".taskright");
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
      var self = this,
        model = this.model,
        $el = this.$el;
      /*this._$MAP.body.off("click.TaskList", ".goto-top").on("click.TaskList", ".goto-top", function(e) {
        app.utils.gotoTop(".j_mainscroll")
      });*/
      $el.off("click.TaskList", ".j_moretask").on("click.TaskList", ".j_moretask", function() {
        model.pageNo++;
        self.search(true);
      });
      $el.off("click.TaskList", "#view-state li").on("click.TaskList", "#view-state li", function() {
        var $this = $(this);
        $this.addClass("active").siblings().removeClass("active");
        $this = $this.data("value");
        self._toggleViewState($this);
      });
      $el.off("mouseenter.TaskList", "#task-filter").on("mouseenter.TaskList", "#task-filter", function(e) {
        $(this).addClass("open");
        var $toggledEl = $(this).attr("data-toggle");
        if(!self.dropdownFilter) {
          self.dropdownFilter = new app.components.filter({
            el: $toggledEl,
            module: "task",
            targetObj: $(this),
            userId: self.userId,
            scroll: true
          });
          self.dropdownFilter.render(e);
        }
        var timer = setTimeout(function() {
          $($toggledEl).parents(".dropdown-filter").slideDown("fast");
        }, 300);
        $(this).data("showTimer", timer);
      }).off("mouseleave.TaskList", "#task-filter").on("mouseleave.TaskList", "#task-filter", function(e) {
        $(this).removeClass("open");
        var toggleEl = $(this).attr("data-toggle");
        var showTimer = $(this).data("showTimer");
        if(showTimer) {
          clearTimeout(showTimer);
        }
        $(this).removeData("showTimer");
        $(toggleEl).parents(".dropdown-filter").slideUp(100);
      }).off("filter.TaskList", "#task-filter").on("filter.TaskList", "#task-filter", function(e) {
        if("mine" == self.type) {
          self.mine();
        } else {
          model.pageNo = 1;
          self.search(false);
        }
        $(this).removeClass("open");
      });
      $el.off("click.TaskList", ".orderType").on("click.TaskList", ".orderType", function() {
        $(".orderType").parent("li").removeClass("active");
        $(this).parent("li").addClass("active");
        $("#task-order").attr("data-entity", $(this).attr("data-entity"));
        $("#task-order").attr("data-direction", $(this).attr("data-direction"));
        if("mine" == self.type) {
          self.mine();
        } else {
          model.pageNo = 1;
          self.search(!1);
        }
        ROUTER.navigate("/tasks/" + self.userId, {
          trigger: false
        });
      });
      $el.off("click.TaskList", ".j_mineType ul li").on("click.TaskList", ".j_mineType ul li", function() {
        if(!$(this).hasClass("active")) {
          $(this).addClass("active").siblings("li").removeClass("active");
          $(this).data("type");
          $("#task-taskType").attr("data-entity", $(this).attr("data-entity"));
          self.mine();
        }
      });
      $el.off("search.TaskList", "#tasksearch-keywords").on("search.TaskList", "#tasksearch-keywords", function(e) {
        model.pageNo = 1;
        self.search(false);
      });
      $el.off("keyup.TaskList", "#tasksearch-keywords").on("keyup.TaskList", "#tasksearch-keywords", function(e) {
        if(app.config.keyCode.ENTER == e.which) {
          $(this).trigger("search");
        }
      });
      $el.on("click.TaskList", ".task-watchs", function() {
        var ids = self.findSelectedLi();
        if(0 < ids.length) {
          self.watchModel.watch('{"module":"task","ids":"' + ids + '"}', function(e) {
            app.alert('success', "批量关注成功");
            self.updateFastKey("watch", ids);
          });
        } else {
          app.alert('warning', "请先选中记录");
        }
      });
      this._$MAP.body.off("click.TaskList", ".task-reminds").on("click.TaskList", ".task-reminds", function(e) {
        var ids = self.findSelectedLi();
        if (0 < ids.length) {
          var $this = $(this);
          $this.attr("module", "task");
          $this.attr("targetIds", ids);
          var remindView = new app.components.remind({
            obj: $this
          });
          remindView.render();
        } else {
          app.alert('warning', "请先选中记录");
        }
      });
      $el.off("click.TaskList", ".shortcut .watch").on("click.TaskList", ".shortcut .watch", function(e) {
        e.stopPropagation();
        var data = {};
        var $this = $(this);
        data.module = $this.attr("module");
        data.id = $this.attr("targetId");
        if("true" == $this.attr("watched")) {
          data._method = "DELETE";
          self.watchModel.watchOne(data, function(res) {
            app.alert('success', "取消关注成功");
            $this.html('<i class="icon-favourite"></i>&nbsp;关注');
            $this.attr("watched", "false");
            var subView = self.subView;
            if(subView.id && subView.id == data.id) {
              subView.changeWatch(false);
            }
          });
        } else {
          data._method = "PUT";
          self.watchModel.watchOne(data, function(res) {
            app.alert('success', "关注成功");
            $this.html('<i class="icon-star"></i>&nbsp;取消关注');
            $this.attr("watched", "true");
            var subView = self.subView;
            if(subView.id && subView.id == data.id) {
              subView.changeWatch(true);
            }
          });
        }
      });
      $el.off("confirmHandler.TaskList", ".task-share").on("confirmHandler.TaskList", ".task-share", function(event, data) {
        var objs = data.objs;
        if (objs && !$.isEmptyObject(objs)) {
          objs = $.isArray(objs) ? objs: [objs];
          self.sids = "";
          for (var i = 0; i < objs.length; i++) {
            self.sids += objs[i].id + ",";
          }
          self.shareModel.sids = self.sids;
          self.shareModel.entityIds = self.findSelectedLi();
          self.shareModel._module = "task";
          self.shareModel.saveAll(function(res) {
            if(res.addUserMessage) {
              app.alert('info', res.addUserMessage);
            } else {
              app.alert('success', "批量共享操作成功");
            }
          });
        }
      });
      $el.off("click.TaskList", ".task-share").on("click.TaskList", ".task-share", function(e) {
        e.stopPropagation();
        var entityIds = self.findSelectedLi();
        if(0 < entityIds.length) {
          (new app.components.BatchSelector({
            module: "task",
            entityIdArr: entityIds
          })).render();
        } else {
          app.alert('warning',"请先选中记录");
        }
      });
      $el.off("click.TaskList", ".task-finished").on("click.TaskList", ".task-finished", function() {
        var ids = self.findSelectedUsefulLi();
        if(0 < ids.length) {
          self.model.updateStatus("finished", ids, function(res) {
            app.alert('success', "批量完成操作成功");
            self.updateFastKey("finished", ids);
          });
        } else {
          app.alert('warning', "请选择有完成权限的记录");
        }
      });
      $el.off("click.TaskList", ".shortcut .finish").on("click.TaskList", ".shortcut .finish", function(e) {
        e.stopPropagation();
        var $this = $(this);
        if ($(this).attr("targetId") && $(this).attr("status") && !$this.data("post")) {
          var status = "finished" == $this.attr("status") ? "todo": "finished";
          var targetId = $this.attr("targetId");
          $this.data("post", true);
          model.updateStatus(status, targetId, function(res) {
            $this.data("post", false);
            if(res.actionMsg && res.actionMsg.message) {
              app.alert('info', res.actionMsg.message);
            } else {
              app.alert('success', "状态修改成功");
              self._renderStatus(status, $this.parents("li"));
            }
          })
        } else {
          app.alert('warning', "没有完成权限");
        }
      });
      $el.off("keyup.TaskList", "li.task input.input").on("keyup.TaskList", "li.task input.input", function(e, data) {
        var $this = $(this);
        var $el = $this.parents("ul:first");
        var value = $this.val();
        if(e.which==app.config.keyCode.ENTER && value && $.trim(value)) {
          self._insertBlank($el);
        }
      });
      $el.off("confirmHandler.TaskList", ".shortcut .share").on("confirmHandler.TaskList", ".shortcut .share", function(e, data) {
        var objs = data.objs;
        if (objs && !$.isEmptyObject(objs)) {
          objs = $.isArray(objs) ? objs: [objs];
          self.sids = "";
          for (var i = 0; i < objs.length; i++) {
            self.sids += objs[i].id + ",";
          }
          var entityIds = $(this).attr("targetId");
          self.shareModel.sids = self.sids;
          self.shareModel.entityIds = entityIds;
          self.shareModel._module = "task";
          self.shareModel.saveAll(function(res) {
            if(res.addUserMessage) {
              app.alert('info', res.addUserMessage)
            } else {
              app.alert('success', "共享操作成功");
            }
            var subView = self.subView;
            if(subView.id && subView.id == entityIds) {
              subView.addShare(res.shareEntrys);
            }
          });
        }
      });
      $el.off("click.TaskList", ".shortcut .share").on("click.TaskList", ".shortcut .share", function(e) {
        e.stopPropagation();
        if($(this).hasClass("selector-toggle")) {
          (new window.UserSelector({
            $target: $(this)
          })).open();
        } else {
          app.alert("没有共享权限");
        }
      });
      $el.off("click.TaskList", ".e-list-head").on("click.TaskList", ".e-list-head", function(e) {
        var len = $(e.target).closest(".group-add").length;
        if (len <= 0) {
          var $el = $(this).find(".group-switch");
          var $taskEl = $el.parents(".group-view").find(".task-list");
          if("on" == $el.attr("data-status")) {
            $el.attr("title", "展开");
            $el.attr("data-status", "off");
            $el.find("i:last").removeClass().addClass("icon-angle-down");
            $taskEl.slideUp();
          } else {
            $el.attr("title", "折叠");
            $el.attr("data-status", "on");
            $el.find("i:last").removeClass().addClass("icon-angle-right");
            $taskEl.slideDown();
          }
        }
      });
      $el.off("click.TaskList", "#mytask-container .notask").on("click.TaskList", "#mytask-container .notask", function(e, data) {
        $(this).parent().siblings().children(".group-add").trigger("click");
      });
      $el.off("click.TaskList", "#mytask-container .group-view .group-add").on("click.TaskList", "#mytask-container .group-view .group-add", function() {
        var $el = $(this).parents(".group-view");
        var $taskList = $el.find(".task-list");
        if ($taskList.find("input").size()) {
          $taskList.find("input").focus();
        } else {
          var $group = $el.find(".group-switch");
          if("off" == $group.data("status")) {
            $group.attr("title", "折叠");
            $group.attr("data-status", "on");
            $group.find("i:last").removeClass().addClass("icon-angle-down");
            $el.find(".task-list").slideDown();
          }
          self._insertBlank($taskList);
        }
      });
      $el.off("focusout.TaskList", "li.task input.input:not([readonly])").on("focusout.TaskList", "li.task input.input:not([readonly])", function(a, e) {
        var $this = $(this);
        var $li = $this.parents("li:first");
        var $ul = $this.parents("ul:first");
        if ($this.val() && $this.val().trim()) {
          $this.val();
          $this.attr("title");
          var data = {};
          if(!$li.attr("data-module")) {
            var group = $ul.attr("group");
            data.content = "";
            data.name = $this.val();
            data.sn = $li.attr("sn");
            $li.find(".e-list-loading").show();
            $this.attr("readonly", true);
            model.create(data, group, function(res) {
              app.alert('success', "任务创建成功");
              var task = model.task;
              $li.attr({
                id: task.id
              });
              $li.find(".shortcut").removeClass("hide");
              $li.find(".finish").attr({
                targetId: task.id,
                status: task.status
              });
              $li.find(".e-list-loading").hide();
              $li.find("input").remove();
              $li.find(".checkbox").after('<div class="title j_entityslider-toggle" data-module="task" data-id="' + task.id + '"><div class="text" title="' + task.name + '"></div><span class="importance" style="display:none">紧急</span></div>');
              $li.find(".title .text").text(task.name);
              self._refreshViewBaseCount();
            })
          }
        }
      });
      $el.off("click.TaskList", "li.task").on("click.TaskList", "li.task", function(e) {
        var unreadCount = 0;
        var commentCount = 0;
        if($(this).hasClass("unread")) {
          unreadCount = $(".j_unread").text().trim();
          unreadCount = $.isNumeric(unreadCount) ? unreadCount: 0;
          if(0 >= unreadCount - 1) {
            $(".j_unread").addClass("hide");
          } else {
            $(".j_unread").text(unreadCount - 1);
          }
        } else {
          if($(this).hasClass("newComment")) {
            commentCount = $(".j_feed").text().trim();
            commentCount = $.isNumeric(commentCount) ? commentCount: 0;
            if($.isNumeric(commentCount) && 0 >= commentCount - 1) {
              $(".j_feed").addClass("hide");
            } else {
              $(".j_feed").text(commentCount - 1);
            }
          }
        }
        $(this).removeClass("unread");
        $(this).removeClass("newComment");
      });
      this._$MAP.dragableUL.sortable({
        opacity: .9,
        handle: ".title",
        revert: true,
        connectWith: ".j_center .task-list",
        placeholder: "task-placeholder",
        cancel: ".readonly",
        over: function(event, ui) {
          var item = ui.item;
          var $this = $(this);
          var dateGroup;
          var dateType;
          switch (self.viewState) {
            case "beginDate":
              dateType = $this.attr("group").split("/")[1];
              dateGroup = item.attr("due-date-group");
              break;
            case "dueDate":
              dateType = item.attr("begin-date-group");
              dateGroup = $this.attr("group").split("/")[1];
              break;
            default:
              return
          }
          if(self._dateGroupValid(dateType, dateGroup)) {
            ui.placeholder.removeClass("disable");
            item.data("cancel", false);
            ui.placeholder.html("");
          } else {
            ui.placeholder.addClass("disable");
            item.data("cancel", true);
            ui.placeholder.html("&nbsp;&nbsp;起始日不能在到期日之后");
          }
        },
        update: function(event, ui) { //event, ui
          if(ui.item.data("cancel")) {
            $(this).sortable("cancel");
          } else {
            self.rebuildSN(ui.item.parent());
            self.changeGroupWhileSort(ui.item);
            if("list" != self.viewState && ui.sender) {
              self.rebuildSN(ui.sender);
              self._changDateGroupByDrag(ui.item);
              self._refreshViewBaseCount();
            }
          }
        }
      }).disableSelection().off("click.mytask").on("click.mytask", function() {
        if($("textarea:focus, input:focus").length) {
          $("textarea:focus, input:focus").trigger("focusout");
        }
      });
      $el.off("focusin.mytask", "#qcreatetask").on("focusin.mytask", "#qcreatetask", function() {
        $(this).parent().addClass("active");
        self.atmeview.render();
      });
      $el.off("focusout.mytask", "#qcreatetask").on("focusout.mytask", "#qcreatetask", function() {
        $(this).parent().removeClass("active");
      });
      $el.off("keydown.mytask", "#qcreatetask").on("keydown.mytask", "#qcreatetask", function(e) {
        if(e.ctrlKey && e.which==app.config.keyCode.ENTER) {
          $el.find(".j_qcreatetask").trigger("click");
        }
      });
      $el.off("click.mytask", ".j_qcreatetask").on("click.mytask", ".j_qcreatetask", function() {
        var $createTask = $("#qcreatetask");
        if (!$createTask.attr("readonly")) {
          var taskContent = $createTask.val();
          if (taskContent && $.trim(taskContent) && "" != $.trim(taskContent)) {
            var userId = null;
            var userIds = [];
            var data = $createTask.data("userData");
            if (data) {
              for (var i = 0; i < data.length; i++) {
                if ( - 1 != taskContent.indexOf(data[i].userName)) {
                  var atUserName = "@" + data[i].userName;
                  if(- 1 != taskContent.indexOf(atUserName)) {
                    if(userId) {
                      userIds.push(data[i].userId)
                    } else {
                      userId = data[i].userId;
                    }
                  }
                  taskContent = taskContent.replace(new RegExp(atUserName, "gm"), "");
                }
              }
            }
            if(100 < $.trim(taskContent).length) {
              app.alert('warning', "任务名字长度不超过100字");
            } else {
              if(0 == $.trim(taskContent).length) {
                app.alert('warning', "请输入任务名称");
              } else {
                data = {
                  content: ""
                };
                data.name = taskContent;
                data.sn = (new Date).getTime();
                data.dueDate = (new Date).getTime();
                if(userId) {
                  data.manager = {
                    id: userId
                  }
                }
                model.create(data, null, function(res) {
                  var task = model.task;
                  if (userIds && 0 < userIds.length) {
                    var shareModel = self.shareModel;
                    shareModel.sids = userIds.join(",");
                    shareModel.entityIds = task.id;
                    shareModel.entryType = "user";
                    shareModel._module = "task";
                    shareModel.shareType = "participants";
                    shareModel.saveAll();
                  }
                  app.alert('success', "任务创建成功");
                  self._renderOneTask(task, true);
                  self._refreshViewBaseCount();
                  self.highLight(task.id);
                  $createTask.attr("readonly", false).data("manager", null).val("");
                  userIds = [];
                });
              }
            }
          }
        }
      });
    },
    changeGroupWhileSort: function(el) {
      if (el) {
        var group = $(el).parent().attr("group");
        if (0 < group.indexOf("/") && group.substr(group.indexOf("/"))) {
          var dateGroup = group.substr(group.indexOf("/") + 1);
          var model = this.model;
          var taskList = model.taskList;
          var tasks = [];
          if (taskList) {
            for (var k = 0, n = taskList.length; k < n; k++) {
              if (taskList[k].id == $(el).data("id")) {
                switch (this.viewState) {
                  case "beginDate":
                    taskList[k].beginDateGroup = dateGroup;
                    break;
                  case "dueDate":
                    taskList[k].dateGroup = dateGroup;
                }
              }
              tasks.push(taskList[k]);
            }
          }
          model.taskList = tasks;
        }
      }
    },
    _dateGroupValid: function(beginDateType, dueDateType) {
      if (beginDateType && dueDateType) {
        var beginDate = this._getDateByGroup("beginDate", beginDateType);
        var dueDate = this._getDateByGroup("dueDate", dueDateType);
        if(beginDate && dueDate) {
          if(beginDate <= dueDate) {
            return true;
          } else {
            return false;
          }
        } else {
          return true;
        }
      }
      return true;
    },
    _changDateGroupByDrag: function($el) {
      var model = this.model;
      var propertyNames = $el.parent().attr("group").split("/");
      var date = this._getDateByGroup(propertyNames[0], propertyNames[1]);
      var taskId = $el.attr("id");
      model.changeProperty(taskId, propertyNames[0], date, function(res) {
        $el.attr({
          "begin-date-group": res.task.beginDateGroup,
          "due-date-group": res.task.dueDateGroup
        });
        if($("#entitySlider .taskId" + taskId).size()) {
          if("beginDate" == propertyNames[0]) {
            $("#entitySlider #beginDate").trigger("updateDate.Task", date);
          } else {
            $("#entitySlider #dueDate").trigger("updateDate.Task", date);
          }
        }
      });
    },
    _getDateByGroup: function(oldDateType, dateType) {
      var now = Date.create();
      var date;
      switch (dateType) {
        case "past":
        case "delay":
          date = now.addDays( - 1).format("{yyyy}-{MM}-{dd}");
          break;
        case "today":
          date = now.format("{yyyy}-{MM}-{dd}");
          break;
        case "tomorrow":
          date = now.addDays(1).format("{yyyy}-{MM}-{dd}");
          break;
        case "future":
          date = now.addDays(7).format("{yyyy}-{MM}-{dd}");
          break;
        case "memo":
          date = null;
      }
      return date;
    },
    render: function() {
      var self = this;
      var $el = this.$el;
      self._request(self.type, self.viewState);
      switch (self.type) {
        case "mine":
          $el.find("#view-taskType").removeClass("hide");
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
          $el.find("#view-state-toggle").addClass("hide");
          $el.find("#view-state-toggle").addClass("hide");
          $(".task-finished").addClass("hide");
          self.viewState = "list";
          self.search(false);
      }
      if("watched" == self.type) {
        $(".task-watchs").addClass("hide");
      } else {
        $(".task-watchs").removeClass("hide");
      }
      self.renderUserConfig();
      (new app.task.TaskRightView({
        container: "#mytask-right",
        userId: this.userId
      })).render();
      setTimeout(function() {
        var $listGroup = self.$el.find("#mytask-container .e-list-group");
        _.each($listGroup, function(el) {
          $(el).removeClass("animated");
          $(el).removeClass("zoomIn");
        });
      }, 1500);
      app.utils.layout(".j_mainscroll");
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
        for (var e in a) a[e].children("[class~=task]").remove();
        break;
      case "dueDate":
        for (e in a = {
          delay: this.$el.find("#mytask-container .j_due").filter(".delay").children(".task-list"),
          today: this.$el.find("#mytask-container .j_due").filter(".today").children(".task-list"),
          tomorrow: this.$el.find("#mytask-container .j_due").filter(".tomorrow").children(".task-list"),
          future: this.$el.find("#mytask-container .j_due").filter(".future").children(".task-list"),
          memo: this.$el.find("#mytask-container .j_due").filter(".memo").children(".task-list")
        },
        a) a[e].children("[class~=task]").remove()
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
      a.watched ? (g.find(".watch").html('<i class="icon-star"></i>&nbsp;\u53d6\u6d88\u5173\u6ce8'), g.find(".watch").attr("watched", "true")) : g.find(".watch").attr("watched", "false");
      g.find(".watch").attr("targetId", a.id);
      g.find(".watch").attr("module", "task");
      "urgency" == a.priority ? g.find(".importance").removeClass("hide").text("\u975e\u5e38\u7d27\u6025").addClass("urgency") : "high" == a.priority && g.find(".importance").removeClass("hide").text("\u7d27\u6025").addClass("high");
      "finished" != this.type ? this._renderStatus(a.status, g) : g.find(".finish").html('<i class="icon-finished"></i>&nbsp;\u6807\u8bb0\u672a\u5b8c\u6210').attr({
        status: "finished",
        title: "\u5f53\u524d\u72b6\u6001\u4e3a\u5df2\u5b8c\u6210\uff0c\u70b9\u51fb\u8bbe\u7f6e\u4e3a\u672a\u5b8c\u6210"
      });
      this.type && "unRead" == this.type ? g.addClass("unread") : this.type && "newConment" == this.type ? g.addClass("newComment") : (a.newConment && g.addClass("newComment"), a.unread && g.addClass("unread").removeClass("newComment"));
      a.commentCount = 0;
      0 != a.commentCount && g.find(".comment-count").html('<i class="icon-chat-3 mr-3"></i><em>' + a.commentCount + "</em>");
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
      "finished" == a ? (e.find(".finish").html('<i class="icon-finished"></i>&nbsp;\u6807\u8bb0\u672a\u5b8c\u6210').attr({
        status: "finished",
        title: "\u5f53\u524d\u72b6\u6001\u4e3a\u5df2\u5b8c\u6210\uff0c\u70b9\u51fb\u8bbe\u7f6e\u4e3a\u672a\u5b8c\u6210"
      }), e.find(".title .text").addClass("finished-line")) : (e.find(".finish").html('<i class="icon-todo"></i>&nbsp;\u6807\u8bb0\u5b8c\u6210').attr({
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
      e.find(".title .text").replaceWith('<input type="text" class="input" value="" tabindex="-1" maxlength="100"/>');
      a.prepend(e).find(".notask").addClass("hide");
      this.rebuildSN(a);
      this.highLight(g);
      e.find("input.input").focus()
    },
    updateFastKey: function(a, e) {
      for (var g = e.split(","), b = 0; b < g.length - 1; b++) {
        var c = $("#mytask-container #" + g[b]);
        "watch" == a ? (c.find(".watch").html('<i class="icon-star"></i>&nbsp;\u53d6\u6d88\u5173\u6ce8'), c.find(".watch").attr("watched", "true")) : "finished" == a && this._renderStatus("finished", c)
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
      e ? (g.find(".watch").html('<i class="icon-star"></i>&nbsp;\u53d6\u6d88\u5173\u6ce8'), g.find(".watch").attr("watched", "true")) : (g.find(".watch").html('<i class="icon-favourite"></i>&nbsp;\u5173\u6ce8'), g.find(".watch").attr("watched", "false"))
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