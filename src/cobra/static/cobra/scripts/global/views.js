(function (window, app, Backbone, jQuery, _, moment) {
  "use strict";

  var $ = jQuery;

  app.GroupView = Backbone.View.extend({
    tagName: 'li',
    className: 'group',
    template: _.template(app.templates.group),

    initialize: function () {
      Backbone.View.prototype.initialize.apply(this, arguments);

      _.bindAll(this, 'updateCount', 'updateAllAnnotations', 'updateAnnotation', 'updateLastSeen',
        'updateResolved', 'updateHasSeen', 'renderSparkline', 'renderWaveLine', 'updateBookmarked',
        'render');

      this.model.on({
        'change:count': this.updateCount,
        'change:annotations': this.updateAllAnnotations,
        'change:lastSeen': this.updateLastSeen,
        'change:isBookmarked': this.updateBookmarked,
        'change:isResolved': this.updateResolved,
        'change:hasSeen': this.updateHasSeen,
        'change:historicalData': this.renderSparkline,
        'change:waveData': this.renderWaveLine
      }, this);
    },

    render: function () {
      var data = this.model.toJSON();
      data.projectUrl = app.config.urlPrefix + '/' + app.config.teamId +
        '/' + data.project.slug + '/';
      data.loggerUrl = data.projectUrl + '?logger=' + data.logger;

      this.$el.html(this.template(data));
      this.$el.attr('data-id', this.model.id);
      this.$el.addClass(this.getLevelClassName());
      this.$el.find('a[data-action=resolve]').click(_.bind(function (e) {
        e.preventDefault();
        if (this.model.get('isResolved')) {
          this.unresolve();
        } else {
          this.resolve();
        }
      }, this));
      this.$el.find('a[data-action=bookmark]').click(_.bind(function (e) {
        e.preventDefault();
        this.bookmark();
      }, this));
      this.updateLastSeen();
      this.renderSparkline();
      this.renderWaveLine();
      this.updateResolved();
      this.updateHasSeen();
      this.updateBookmarked();
    },

    updateBookmarked: function () {
      if (this.model.get('isBookmarked')) {
        this.$el.find('a[data-action=bookmark]').addClass('checked');
      } else {
        this.$el.find('a[data-action=bookmark]').removeClass('checked');
      }
    },

    updateResolved: function () {
      if (this.model.get('isResolved')) {
        this.$el.addClass('resolved');
      } else {
        this.$el.removeClass('resolved');
      }
    },

    updateHasSeen: function () {
      if (this.model.get('hasSeen')) {
        this.$el.addClass('seen');
      } else {
        this.$el.removeClass('seen');
      }
    },

    renderSparkline: function (obj) {
      var data = this.model.get('historicalData');
      if (!data || !data.length)
        return;

      this.$el.addClass('with-sparkline');

      app.charts.createSparkline(this.$el.find('.sparkline'), data, {unit: ' times'});
    },

    renderWaveLine: function (obj) {
      var data = this.model.get('waveData');
      if (!data || !data.length)
        return;

      this.$el.addClass('with-waveline');

      app.waveLine.createWaveline(this.$el.find('.js-bg-graph'), data);
    },

    resolve: function () {
      $.ajax({
        url: this.getResolveUrl(),
        type: 'post',
        dataType: 'json',
        success: _.bind(function (response) {
          this.model.set('version', response.version + 5000);
          this.model.set('isResolved', true);
        }, this)
      });
    },

    unresolve: function () {
      $.ajax({
        url: this.getUnresolveUrl(),
        type: 'post',
        dataType: 'json',
        success: _.bind(function (response) {
          this.model.set('version', response.version + 5000);
          this.model.set('isResolved', false);
        }, this)
      });
    },

    getResolveUrl: function () {
      return app.config.urlPrefix + '/api/0' +
        '/record/' + this.model.get('id') +
        '/set/resolved/';
    },

    getUnresolveUrl: function () {
      return app.config.urlPrefix + '/api/0' +
        '/record/' + this.model.get('id') +
        '/set/unresolved/';
    },

    getBookmarkUrl: function () {
      return app.config.urlPrefix + '/api/0/record/' + this.model.get('id') + '/bookmark/';
    },

    bookmark: function () {
      $.ajax({
        url: this.getBookmarkUrl(),
        type: 'post',
        dataType: 'json',
        data: {
          gid: this.model.get('id')
        },
        success: _.bind(function (response) {
          this.model.set('version', response.version);
          this.model.set('isBookmarked', response.isBookmarked);
        }, this)
      });
    },

    getLevelClassName: function () {
      return 'level-' + this.model.get('levelName');
    },

    updateLastSeen: function () {
      var dt = moment(this.model.get('lastSeen'));
      this.$el.find('.last-seen')
        .text(dt.fromNow())
        .data('datetime', this.model.get('lastSeen'))
        .attr('title', dt.format('llll'));
    },

    updateCount: function () {
      var new_count = app.utils.formatNumber(this.model.get('count'));
      var counter = this.$el.find('.count');
      var digit = counter.find('span');

      if (digit.is(':animated'))
        return false;

      if (counter.data('count') == new_count) {
        // We are already showing this number
        return false;
      }

      counter.data('count', new_count);

      var replacement = $('<span></span>', {
        css: {
          top: '-2.1em',
          opacity: 0
        },
        text: new_count
      });

      // The .static class is added when the animation
      // completes. This makes it run smoother.

      digit.before(replacement).animate({
        top: '2.5em',
        opacity: 0
      }, 'fast', function () {
        digit.remove();
      });

      replacement.delay(100).animate({
        top: 0,
        opacity: 1
      }, 'fast');
    },

    updateAnnotation: function (annotation) {
      var value = annotation.count;
      if (value === null)
        return;
      var new_count = app.utils.formatNumber(value);
      var counter = this.$el.find('.annotation[data-tag="' + annotation.label + '"]');
      var digit = counter.find('span');

      if (digit.is(':animated'))
        return false;

      if (counter.data('count') == new_count) {
        // We are already showing this number
        return false;
      }

      counter.data('count', new_count);

      var replacement = $('<span></span>', {
        css: {
          top: '-2.1em',
          opacity: 0
        },
        text: new_count
      });

      // The .static class is added when the animation
      // completes. This makes it run smoother.

      digit.before(replacement).animate({
        top: '2.5em',
        opacity: 0
      }, 'fast', function () {
        digit.remove();
      });

      replacement.delay(100).animate({
        top: 0,
        opacity: 1
      }, 'fast');
    },

    updateAllAnnotations: function () {
      var self = this;
      $.each(this.model.get('annotations'), function (index, annotation) {
        self.updateAnnotation(annotation);
      });
    }

  });

  app.OrderedElementsView = Backbone.View.extend({

    emptyMessage: '<div class="empty-message"><h2>No records to show.</h2><p>We\'ll notify you if that changes. In the meantime why not take a moment to become more familiar with Holter.</p><p class="links"><a href="#">Instructions Documents</a> <a href="settings/">Account settings</a></p></div>',
    loadingMessage: '<p>Loading...</p>',
    model: app.models.Group,

    defaults: {
      maxItems: 50,
      view: Backbone.View
    },

    initialize: function (data) {
      if (_.isUndefined(data))
        data = {};

      var members = data.members;

      Backbone.View.prototype.initialize.apply(this, arguments);

      this.options = $.extend({}, this.defaults, this.options, data);

      this.$wrapper = $('#' + this.id);
      this.$parent = $('<ul></ul>');
      this.$empty = $('<li class="empty"></li>');
      this.$wrapper.html(this.$parent);

      if (this.options.className)
        this.$parent.addClass(this.options.className);

      _.bindAll(this, 'renderMemberInContainer', 'unrenderMember', 'reSortMembers');

      this.collection = new app.ScoredList([], {
        model: data.model
      });
      this.collection.on('add', this.renderMemberInContainer, this);
      this.collection.on('remove', this.unrenderMember, this);
      this.collection.on('reset', this.reSortMembers, this);

      delete data.members;

      this.reset(members);
    },

    reset: function (members) {
      this.$parent.empty();
      this.setEmpty();

      if (members === undefined) {
        this.$empty.html(this.loadingMessage);
        this.collection.reset();
        this.setEmpty();
        this.loaded = false;
      } else {
        this.$empty.html(this.emptyMessage);
        this.collection.reset(members);
        this.loaded = true;
      }
    },

    setEmpty: function () {
      this.$parent.html(this.$empty);
    },

    extend: function (data) {
      for (var i = 0; i < data.length; i++) {
        this.addMember(data[i]);
      }
    },

    addMember: function (member) {
      var existing = this.collection.get(member.id);

      function getAttr(x) {
        if (typeof member.get === 'function') {
          return member.get(x);
        } else {
          return member[x];
        }
      }

      if (!existing) {
        if (this.collection.length >= this.options.maxItems) {
          // bail early if the score is too low
          if (getAttr('score') < this.collection.last().get('score'))
            return;

          // make sure we limit the number shown
          while (this.collection.length >= this.options.maxItems)
            this.collection.pop();
        }
      } else if (existing.get('version') >= (getAttr('version') || 0)) {
        return;
      }
      this.collection.add(member, {merge: true});
    },

    reSortMembers: function () {
      this.collection.each(_.bind(function (member) {
        this.renderMemberInContainer(member);
      }, this));
    },

    updateMember: function (member, options) {
      if (_.isUndefined(options))
        options = {};

      var existing = this.collection.get(member.id);
      if (existing.get('version') >= member.get('version'))
        return;

      this.collection.add(member, {
        merge: true,
        sort: options.sort !== false ? true : false
      });

    },

    hasMember: function (member) {
      return (this.collection.get(member.id) ? true : false);
    },

    removeMember: function (member) {
      this.collection.remove(member);
    },

    renderMemberInContainer: function (member) {
      var new_pos = this.collection.indexOf(member),
        $el, $rel;

      this.$parent.find('li.empty').remove();

      $el = $('#' + this.id + member.id);

      if (!$el.length) {
        // create the element if it does not yet exist
        $el = this.renderMember(member);
      } else if ($el.index() === new_pos) {
        // if the row was already present, ensure it moved
        return;
      }

      // top item
      if (new_pos === 0) {
        this.$parent.prepend($el);
      } else {
        // find existing item at new position
        $rel = $('#' + this.id + this.collection.at(new_pos).id);
        if (!$rel.length) {
          this.$parent.append($el);
        } else if ($el.id !== $rel.id) {
          // TODO: why do we get here?
          $el.insertBefore($rel);
        } else {

          return;
        }
      }

      if (this.loaded)
        $el.css('background-color', '#eee').animate({backgroundColor: '#fff'}, 300);
    },

    renderMember: function (member) {
      var view = new this.options.view({
        model: member,
        id: this.id + member.id
      });
      view.render();
      return view.$el;
    },

    unrenderMember: function (member) {
      this.$parent.find('#' + this.id + member.id).remove();
      if (!this.$parent.find('li').length)
        this.setEmpty();
    }

  });


  app.GroupListView = app.OrderedElementsView.extend({

    defaults: {
      realtime: false,
      stream: false,
      pollUrl: null,
      pollTime: 1000,
      tickTime: 100
    },

    initialize: function (data) {
      if (_.isUndefined(data))
        data = {};

      data.model = app.models.Group;
      data.view = app.GroupView;

      app.OrderedElementsView.prototype.initialize.call(this, data);

      this.options = $.extend({}, this.defaults, this.options, data);

      this.queue = new app.ScoredList([], {
        model: data.model
      });

      this.cursor = null;

      _.bindAll(this, 'poll', 'pollSuccess', 'pollFailure', 'tick');

      this.poll();

      window.setInterval(this.tick, this.options.tickTime);
    },

    tick: function () {
      if (!this.queue.length)
        return;

      var item = this.queue.pop();
      if (this.options.canStream) {
        this.addMember(item);
      } else if (this.hasMember(item)) {
        this.updateMember(item, {
          sort: false
        });
      }
    },

    pollSuccess: function (groups) {
      if (!groups.length)
        return window.setTimeout(this.poll, this.options.pollTime * 5);

      this.cursor = groups[groups.length - 1].score;

      this.queue.add(groups, {merge: true});

      window.setTimeout(this.poll, this.options.pollTime);
    },

    pollFailure: function (jqXHR, textStatus, errorThrown) {
      // if an error happened lets give the server a bit of time before we poll again
      window.setTimeout(this.poll, this.options.pollTime * 10);
    },

    poll: function () {
      var data;

      if (!this.options.realtime || !this.options.pollUrl)
        return window.setTimeout(this.poll, this.options.pollTime);

      data = app.utils.getQueryParams();
      data.cursor = this.cursor || undefined;

      $.ajax({
        url: this.options.pollUrl,
        type: 'GET',
        dataType: 'json',
        data: data,
        success: this.pollSuccess,
        error: this.pollFailure
      });
    }
  });

  app.WorkReportView = Backbone.View.extend({
    initialize: function(data) {
      this.userId = data.userId;
      this.year = data.year;
      this.type = data.type;
      this.serialNumber = data.serialNumber;
      this.model = new app.models.WorkReportModel;
      this.userSliderView = new app.components.Userslider({
          userId: app.config.currentUser.id,
          module: "workreport",
          dataType: "subordinate"
      });
      this.timelineView = new app.components.Timeline({
        userId: this.userId,
        year: this.year,
        type: this.type,
        serialNumber: this.serialNumber,
        container: "#reports-left"
      })
    },
    render: function() {
      if(app.config.noSubordinates) {
        $("#member-layer").last().addClass("hide");
      }
      this.timelineView.render();
      this.userSliderView.render();
//      this.getUnreadCount()
    },
    getUnreadCount: function() {
      this.model.getUnreadCount(function(res) {
        if(0 < res.unReadCount) {
          $(".j_unreadCount").addClass("badge");
          $(".j_unreadCount").text(res.unReadCount);
        }
        if(0 < res.commentMeCount) {
          $(".j_commentCount").addClass("badge");
          $(".j_commentCount").text(res.commentMeCount);
        }
        if(0 < res.replayMeCount) {
          $(".j_replayCount").addClass("badge");
          $(".j_replayCount").text(res.replayMeCount);
        }
      })
    },
    update: function(userId, year, type, serialNumber, editable) {
      this.userId = userId;
      this.year = year;
      this.type = type;
      this.serialNumber = serialNumber;
      this.editable = editable;
      if(this.timelineView) {
        this.timelineView.update(this.userId, this.year, this.type, this.serialNumber, this.editable);
      }
    },
    remove: function() {}
  });

  app.WorkReportContentView = Backbone.View.extend({
    initialize: function(a) {
      this.userId = a.userId;
      this.year = a.year;
      this.type = a.type;
      this.serialNumber = a.serialNumber;
      this.editable = a.editable;
      this.reportType = a.reportType;
      this.id = a.id;
      this.hideBlog = a.hideBlog;
      this.el = (this.container = a.container) || "#reports-right";
      this.extendView = null;
      this.unreadFlag = a.unreadFlag;
      this.isStat = a.isStat;
      this.model = new app.models.WorkReportModel;
      this.isDisable() && (this.editable = false, this.flag = true);
      if("#print" == this.container) {
        $("#print").addClass("fs-m print-report");
      }
      if (this.editable) {
        $(this.el).html(app.utils.template('workreport.reportcontent'));
      } else if (this.isStat) {
        $(this.el).html(app.utils.template('workreport.readonlyreportcontentstat'));
      } else {
        $(this.el).html(app.utils.template('workreport.readonlyreportcontent'));
      }
    },
    delegateEvents: function() {
      var self = this, $el = $(this.el);
      $el.on("click.workreportcontent", "#current", function(evt) {
        var nowTime = new Date(app.config.organization.nowTime);
        var year = nowTime.getFullYear(),
            week = nowTime.getISOWeek(),
            month = nowTime.getMonth() + 1;
        if(1 == nowTime.getISOWeek() && 12 == nowTime.getMonth() + 1) {
          year += 1;
          month = 1;
        }
        $(".reports-selectyear span").text(year);

        if("month" == self.type) {
          self.trigger("synTimeLine", {
            year: year,
            month: month
          });
          $(".reports-panel").data("year", year).data("type", "month").data("serialNumber", month);
          ROUTER.navigate("/workreport/" + self.userId + "/" + year + "/month/" + month, {
            trigger: true
          });
        } else {
          self.trigger("synTimeLine", {
              year: year,
              week: week
          });
          $(".reports-panel").data("year", year).data("type", "week").data("serialNumber", week);
          ROUTER.navigate("/workreport/" + self.userId + "/" + year + "/week/" + week, {
              trigger: true
          })
        }
      });
      $el.on("click.workreportcontent", "#prev", function(evt) {
        var nowTime = new Date(app.config.organization.nowTime);
        var year = self.year ? self.year : nowTime.getFullYear();
        var serialNumberWeek = self.serialNumber ? self.serialNumber : nowTime.getISOWeek(),
            serialNumberMonth = self.serialNumber ? self.serialNumber : nowTime.getMonth() + 1;
        if ("month" == self.type) {
          var month = serialNumberMonth - 1;
          if (1 > month) {
            if (2013 > year - 1) {
              $(this).addClass("disabled");
              return;
            }
            year--;
            month = 12;
            $(".reports-selectyear span").text(year);
          }
          self.trigger("synTimeLine", {
            year: year,
            month: month
          });
          $(".reports-panel").data("year", year).data("type", "month").data("serialNumber", month);
          ROUTER.navigate("/workreport/" + self.userId + "/" + year + "/month/" + month, {
            trigger: true
          });
        } else {
          var week = serialNumberWeek - 1;
          var realYear = year;
          if (1 > week) {
            if (2013 > realYear - 1) {
              $(this).addClass("disabled");
              return;
            }
            realYear--;
            week = self.getWeeksOfYear(self.getWeekDayDate(year - 1, 0, 1), year - 1);
            $(".reports-selectyear span").text(realYear);
          }
          self.trigger("synTimeLine", {
            year: realYear,
            week: week
          });
          $(".reports-panel").data("year", realYear).data("type", "week").data("serialNumber", week);
          ROUTER.navigate("/workreport/" + self.userId + "/" + realYear + "/week/" + week, {
            trigger: true
          });
        }
      });
      $el.on("click.workreportcontent", "#next", function(evt) {
        var nowTime = new Date(app.config.organization.nowTime);
        var year = self.year ? self.year : nowTime.getFullYear();
        var serialNumberWeek = self.serialNumber ? self.serialNumber : nowTime.getISOWeek(),
            serialNumberMonth = self.serialNumber ? self.serialNumber : nowTime.getMonth() + 1;
        var realYear;
        if ("month" == self.type) {
          var realMonth = parseInt(serialNumberMonth) + 1;
          realYear = parseInt(year);
          if (12 < realMonth) {
            if (2015 < realYear + 1) {
              $(this).addClass("disabled");
              return
            }
            realYear++;
            realMonth = 1;
            $(".reports-selectyear span").text(realYear)
          }
          self.trigger("synTimeLine", {
            year: realYear,
            month: realMonth
          });
          $(".reports-panel").data("year", realYear).data("type", "month").data("serialNumber", realMonth);
          ROUTER.navigate("/workreport/" + self.userId + "/" + realYear + "/month/" + realMonth, {
            trigger: true
          });
        } else {
          var realWeek = parseInt(serialNumberWeek) + 1;
          realYear = parseInt(year);
          if (realWeek > self.getWeeksOfYear(self.getWeekDayDate(year, 0, 1), year)) {
            if (2015 < realYear + 1) {
              $(this).addClass("disabled");
              return;
            }
            realYear++;
            realWeek = 1;
            $(".reports-selectyear span").text(realYear);
          }
          self.trigger("synTimeLine", {
            year: realYear,
            week: realWeek
          });
          $(".reports-panel").data("year", realYear).data("type", "week").data("serialNumber", realWeek);
          ROUTER.navigate("/workreport/" + self.userId + "/" + realYear + "/week/" + realWeek, {
            trigger: true
          });
        }
      });
      $el.on("FileUploaded.workreportcontent", "#report-attachment", function(e, attachment) {
        var $content = $el.find("#effect-content");
        if (!$content.val() || $content.data("text") == $content.val()) {
          var content = ($content.data("text") ? $content.data("text") + "," : "上传了附件：") + attachment.name;
          $content.val(content);
          $content.data("text", content);
        }
        $content.focus();
      });
      $el.off("click.workreportcontent", "#wr-print").on("click.workreportcontent", "#wr-print", function(evt) {
        window.open("/print/" + self.id + "/workreport")
      });
    },
    delegateEditEvents: function() {
      var self = this;
      $(this.el).on("focusout.workreportcontent", "#effect-content,#experience-summary,#work-plan", function(e) {
        var $this = $(this);
        if ($this.val() && $this.val() != $(this).data($this.attr("id"))) {
          var reportId = $(".reports-body").data("reportId"), report = {};
          if(reportId) {
            report["workReport." + $this.attr("id")] = $this.val();
            report["workReport.id"] = reportId;
          } else {
            report = self.genParam(reportId, self.userId, self.year, self.type, self.serialNumber);
            report["workReport." + $this.attr("id")] = $this.val();
          }
          self.save(report, reportId);
          $(this).data($this.attr("id"), $this.val());
        }
      });
    },
    initComponent: function(workreport) {
      var $el = $(this.el);
      if(workreport.id) {
        /*this.extendView = new d({
          targetId: workreport.id,
          module: "workreport",
          parentEl: this.el,
          container: "#extend-panel"
        });
        this.extendView.render(workreport);*/
        if(app.config.currentUser.id == workreport.creator.id) {
          $el.find("#report-share").removeClass("hide");
          this.shareView = new app.components.ShareAllview({
            entityId: workreport.id,
            module: "workreport",
            shareContainer: "#report-share",
            parentEl: this.el
          });
          this.shareView.render(workreport.shareEntrys);
        }
      }
      /*this.attachment = new b({
          targetId: workreport.id,
          module: "workreport",
          container: "#report-attachment",
          parentEl: this.el,
          readonly: !this.editable
      });
      this.attachment.render(workreport.attachments || []);*/
    },
    render: function() {
      var self = this;
      var $el = $(self.el);
      if ("#print" == self.container) {
        $el.find("#workreportcontent").removeClass("scrollwrapper");
        $el.find("#switch").remove();
      } else {
        app.utils.layout("#workreportcontent");
      }
      $el.find(".loading_large").show();
      var report = self.id;
      if(self.editable) {
        self.delegateEditEvents();
      }
      if(self.reportType && !$(".reports-panel").data("id")){
        $(".reports-panel").html("<div class='no-result'>没有数据</div>");
        $("#unread").parents(".pull-right").addClass("hide");
        $(".j_mine").siblings().removeClass("hide");
      } else {
        if(this.reportType && !self.id){
          report = $(".reports-panel").data("id");
        }
        report = self.genParam(report, self.userId, self.year, self.type, self.serialNumber);
        self.model.queryWorkReport(report, function(res) {
          if (res.actionMsg && res.actionMsg.message) {
            $(self.el).html(_.template("base.nopermission")({
              msg: res.actionMsg,
              module: "workreport",
              id: self.id
            }));
            $(self.el).find(".scrollwrapper").trigger("resizeSroll");
            return false;
          }
          var workReport = res.workReport, employee = res.employee, $mineNav = $(".j_mine a");
          if(employee && !self.reportType){
            if(employee.id != app.config.currentUser.id) {
              if("female" == employee.sex){
                $mineNav.text("她的报告")
              } else {
                $mineNav.text("他的报告");
                $mineNav.attr("href", "/workreport/" + employee.id);
                $(".j_mine").siblings().addClass("hide");
              }
            } else {
              $mineNav.text("我的报告");
              $mineNav.attr("href", "/workreport");
              $(".j_mine").siblings().removeClass("hide");
            }
          } else {
            $mineNav.text("我的报告");
            $mineNav.attr("href", "/workreport");
            $(".j_mine").siblings().removeClass("hide");
          }

          if (workReport) {
            self.id = workReport.id;
            self.userId = workReport.creator.id;
            employee = workReport.creator.name ? workReport.creator.name : employee.name;
            if(0 == workReport.permission){
              $("#reports-right").html('<div class="p-10"><div class="alert alert-warning alert-block  fade in"><h4 class="alert-heading">对不起! </h4><p>您不具有对当前对象的访问权限。</p></div>\t\t</div>');
            }
            self.renderHeader(workReport.type, workReport.year, workReport.serialNumber, employee);
            self.renderReport(workReport);
            var count = 0;
            if ("comment" == self.reportType) {
              count = 0 < res.commentMeCount ? res.commentMeCount : "";
              setTimeout(function() {
                $(".j_commentCount").html(count)
              }, 1000);
            }
            if("replay" == self.reportType) {
              count = 0 < res.replayMeCount ? res.replayMeCount : "";
              setTimeout(function() {
                $(".j_replayCount").html(count)
              }, 1000);
            }
            if("unread" == self.reportType) {
              count = 0 < res.unReadCount ? res.unReadCount : "";
              setTimeout(function() {
                $(".j_unreadCount").html(count)
              }, 1000);
            }
            if("#print" == self.container) {
              $el.find("#wr-export").remove();
              $el.find("#wr-print").remove();
              if("week" == workReport.type) {
                self.weekblog = new a({
                  container: "#week-blog",
                  userId: self.userId,
                  date: Date.create(self.getWeekDayDate(workReport.year, parseInt(workReport.serialNumber) + 1, 7)).format("{yyyy}-{MM}-{dd}"),
                  print: !0
                });
                self.weekblog.render();
                $("#js_printblog").show();
                $("#printFont").show();
                $el.find("#blog-panel").show();
              }
            } else {
              $el.find("#wr-print").removeClass("hide");
              $el.find("#wr-export").attr("href", "/workreport/export.json?id=" + workReport.id + "&userId=" + workReport.creator.id).removeClass("hide");
            }
          } else {
            if(self.type) {
              self.renderHeader(self.type, self.year, self.serialNumber, employee.name);
            } else {
              var nowTime = new Date(app.config.organization.nowTime);
              self.renderHeader("week", nowTime.getFullYear(), nowTime.getISOWeek(), employee.name);
            }
            self.renderReport({});
          }
//          self.trigger("unreadCount");
          $el.find(".loading_large").hide();
          autosize($el.find("#effect-content,#experience-summary,#work-plan"));
        });
        self.trigger("beforeOpen", self.id);
        $("body").trigger("printLoaded");
      }
    },
    save: function(report, reportId) {
      var self = this;
      if (reportId) {
        this.model.update(report, function() {
          app.alert('success', '报告内容保存成功');
        });
      }
      else {
        // 附件的链接ID，暂时不考虑附件
        /*var linkIds = self.attachment.getLinkIds();
        report.ids = linkIds.join(",");*/
        this.model.create(report, function(res) {
          var workReport = res.workReport;
          $(".reports-body").data("reportId", workReport.id);
          app.alert("success", '报告创建成功');
          $("#extend-panel").html("");
          self.initComponent(workReport);
          self.id = workReport.id;
          $(self.el).find("#wr-print").removeClass("hide");
          $(self.el).find("#wr-export").attr("href", "/workreport/export.json?id=" + workReport.id + "&userId=" + workReport.creator.id).removeClass("hide");
        })
      }
    },
    renderHeader: function(reportType, year, serialNumber, userName) {
      var $el = $(this.el);
      if ("week" == reportType) {
        $("#planTitle").text("下周工作计划");
        $("#contentTitle").text("本周工作成效");
        var fromDate = this.getWeekDayDate(year, serialNumber, 1),
            endDate = this.getWeekDayDate(year, serialNumber, 6).addDays(1),
            fromDateText = Date.create(fromDate).format("{MM}-{dd}"),
            endDateText = endDate.format("{MM}-{dd}"),
            title = userName + "的第" + serialNumber + "周的工作报告";
        $("#title").text(title);
        $("#weekDay").html("[<i>" + fromDateText + "~" + endDateText + "</i>]");
        if(!this.reportType) {
          $("#prev").text("上一周");
          $("#next").text("下一周");
          $("#current").text("本周");
          $("#switch").removeClass("hide");
        }
        if(app.config.currentUser.activeDate < endDate.getTime()) {
          $("#dayReport").text("本周工作日报");
        } else {
          $("#dayReport").addClass("hide");
        }
        $el.find("#weeklyblog")
          .attr("data-id", this.userId)
          .attr("data-value", Date.create(this.getWeekDayDate(year, parseInt(serialNumber) + 1, 7)).format("{yyyy}-{MM}-{dd}"));
      }
      if("month" == reportType){
        title = userName + "的" + year + "年" + serialNumber + "月份工作报告";
        $("#title").text(title);
        $("#planTitle").text("下月工作计划");
        $("#contentTitle").text("本月工作成效");
        $("#weekDay").addClass("hide");
        if(!this.reportType) {
          $("#prev").text("上一月");
          $("#next").text("下一月");
          $("#current").text("本月");
          $("#switch").removeClass("hide");
        }
      }
      if("season" == reportType){
        title = userName + "的" + year + "年第" + serialNumber + "季度工作报告";
        $("#title").text(title);
        $("#contentTitle").text("本季度工作成效");
        $("#planTitle").text("下季度工作计划");
        $("#weekDay").addClass("hide");
        $("#switch").addClass("hide");
      }
      if("year" == reportType) {
        title = userName + "的" + year + "年年度工作报告";
        $("#title").text(title);
        $("#contentTitle").text("本年工作成效");
        $("#planTitle").text("下一年工作计划");
        $("#weekDay").addClass("hide");
        $("#switch").addClass("hide");
      }
      if("halfYear" == reportType) {
        title = userName + "的" + year + "年年中工作报告";
        $("#title").text(title);
        $("#contentTitle").text("上半年工作成效");
        $("#planTitle").text("下半年工作计划");
        $("#weekDay").addClass("hide");
        $("#switch").addClass("hide");
      }
      if(this.hideBlog) {
        $el.find("#dayReport").addClass("hide");
        $el.find("#switch").addClass("hide");
      }
    },
    renderReport: function(report) {
      if(report.content) {
        if(this.editable) {
          $("#effect-content").val(report.content).data("content", report.content);
        } else {
          $("#effect-content").html(f.convert2Html(report.content));
        }
      } else {
        $("#effect-content").val("").data("content", "");
      }
      if(report.summary) {
        if(this.editable) {
          $("#experience-summary").val(report.summary).data("summary", report.summary);
        } else {
          $("#experience-summary").html(f.convert2Html(report.summary));
        }
      } else {
        $("#experience-summary").val("").data("summary", "");
      }
      if(report.plan) {
        if(this.editable) {
          $("#work-plan").val(report.plan).data("plan", report.plan);
        } else {
          $("#work-plan").html(f.convert2Html(report.plan));
        }
      } else {
        $("#work-plan").val("").data("plan", "");
      }
      if(this.editable) {
        $(".reports-body").data("reportId", report.id);
      }
      if(report.lastUpdateTime) {
        $("#createTime").text(" 最后提交于" + Date.create(report.lastUpdateTime).format("{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}"));
      }
      $("#extend-panel").html("");
      this.initComponent(report);
      if(!this.editable && !report.attachments || !this.editable && 0 == report.attachments.length) {
        $("#report-attachment").css("display", "none");
      }
      if(this.flag && this.userId == app.config.currentUser.id) {
        $("#effect-content").html("不可填写");
        $("#experience-summary").html("不可填写");
        $("#work-plan").html("不可填写");
      }
    },
    genParam: function(reportId, userId, year, type, serialNumber) {
      if (!reportId) {
          var nowTime = new Date(app.config.organization.nowTime);
          year = year ? year : nowTime.getFullYear();
          type = type ? type : "week";
        if("year" != type && "halfYear" != type) {
          serialNumber = serialNumber ? serialNumber : nowTime.getISOWeek();
        }
      }
      var workReport = {};
      workReport["workReport.id"] = reportId;
      workReport["workReport.year"] = year;
      workReport["workReport.serialNumber"] = serialNumber;
      workReport["workReport.type"] = type;
      workReport["workReport.creator.userId"] = userId;
      return workReport;
    },
    getWeekDayDate: function(year, week, weekDay) {
      var date = new Date(year, "0", "1");
      var time = date.getTime();
      date.setTime(time + 6048E5 * (week - 1));
      return this.getNextDate(date, weekDay)
    },
    getNextDate: function(date, weekDay) {
      weekDay %= 7;
      var day = date.getDay(), time = date.getTime();
      date.setTime(time + 864E5 * (weekDay - day));
      return date;
    },
    getWeeksOfYear: function(date, year) {
      var daysOfYear = 0 == year % 4 && 0 != year % 100 || 0 == year % 400 ? 366 : 365; // 闰年366
      return Math.ceil((daysOfYear - date.getDay()) / 7);
    },
    isDisable: function() {
      var nowTime = Date.create(app.config.organization.nowTime),
          year = nowTime.getFullYear(),
          month = nowTime.getMonth() + 1,
          week = nowTime.getISOWeek();
      nowTime.getISOWeek();
      if(1 == nowTime.getISOWeek() && 12 == nowTime.getMonth() + 1) {
        year = parseInt(year) + 1;
        month = 1;
      }
      if(this.year && (2015 < parseInt(this.year) || 2013 > parseInt(this.year))){
        return true;
      }
      if (this.year == year) {
        switch (this.type) {
          case "year":
            if (12 > month) {
              return true;
            }
            break;
          case "season":
            if ((1 == this.serialNumber && 3 > month) || (3 == this.serialNumber && 9 > month)) {
              return true;
            }
            break;
          case "halfYear":
            if (6 > month) {
              return true;
            }
            break;
          case "month":
            if (this.serialNumber > month) {
              return true;
            }
            break;
          case "week":
            if (this.serialNumber > week) {
               return true;
            }
        }
      }
      switch (this.type) {
        case "season":
          if (1 != this.serialNumber && 3 != this.serialNumber) {
            return true;
          }
          break;
        case "month":
          if (12 < this.serialNumber) {
            return true;
          }
          break;
        case "week":
          if (this.serialNumber > this.getWeeksOfYear(this.getWeekDayDate(this.year, 0, 1), this.year)) {
            return true
          }
      }
      return false;
    },
    remove: function() {
      $(this.el).off(".workreportcontent");
      if(this.header) {
        this.header.remove();
        this.header = null;
      }
      if(this.extendView) {
        this.extendView.remove();
        this.extendView = null;
      }
      if(this.shareView) {
        this.shareView.remove();
        this.shareView = null;
      }
    }
  });

}(window, app, Backbone, jQuery, _, moment));
