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

  app.TimelineView = Backbone.View.extend({

      template: _.template(app.templates.time_line),

      initialize: function(d) {
          this.userId = d.userId;
          this.year = d.year;
          this.type = d.type;
          this.serialNumber = d.serialNumber;
          this.el = d.container;
          this.parentEl = d.parentEl;
          $(this.el).html(this.template())
      },
      delegateEvents: function() {
          var d = this,
              c = $(this.el);
          c.on("click.timeline", ".j_timetree_spread",
              function() {
                  var b = $(this).parent(),
                      a = b.next(".timetree-weeklist"),
                      c = b.parent().siblings(".timetree-month").parent().find(".timetree-weeklist");
                  a.is(":visible") ? (a.slideUp("fast"), b.addClass("active")) : ($(".timetree-head").removeClass("active"), b.addClass("active"), c.slideUp("fast"), a.slideDown("fast"));
                  $(".j_week").removeClass("active");
                  b = $(this).parent().find("strong").text();
                  a = $(".reports-selectyear span").text();
                  /*ROUTER.navigate("/workreport/" + d.userId + "/" + a + "/month/" + b, {
                      trigger: !0
                  });*/
                  $(".reports-panel").data("year", a).data("type", "month").data("serialNumber", b)
              });
          c.on("click.timeline", ".dropdown-menu a", function(b) {
                  $(this).parents(".dropdown-menu").slideUp(100);
                  $(this).parents(".dropdown-menu-toggle").removeData("showTimer");
                  b = $(this).text();
                  $(this).parents(".dropdown").find("span").text(b);
                  d.genYearSelect(b);
                  d.genTimeLineByYear(b)
              });
          c.on("click.timeline", ".halfyear",
              function(b) {
                  b = $(this);
                  d.changeCSS(b);
                  b = $(".reports-selectyear span").text();
                  /*ROUTER.navigate("/workreport/" + d.userId + "/" + b + "/halfYear", {
                      trigger: !0
                  });*/
                  $(".reports-panel").data("year", b).data("type", "halfYear")
              });
          c.on("click.timeline", ".endyear",
              function(b) {
                  b = $(this);
                  d.changeCSS(b);
                  b = $(".reports-selectyear span").text();
                  /*ROUTER.navigate("/workreport/" + d.userId + "/" + b + "/year", {
                      trigger: !0
                  });*/
                  $(".reports-panel").data("year", b).data("type", "year")
              });
          c.on("click.timeline", ".season",
              function(b) {
                  b = $(this);
                  d.changeCSS(b);
                  b = b.attr("serialNumber");
                  var a = $(".reports-selectyear span").text();
                  /*ROUTER.navigate("/workreport/" + d.userId + "/" + a + "/season/" + b, {
                      trigger: !0
                  });*/
                  $(".reports-panel").data("year", a).data("type", "season").data("serialNumber", b)
              });
          c.on("click.timeline", ".j_week", function(b) {
            b.preventDefault();
                  var a = $(this);
                  $(".j_week").each(function(a, b) {
                      $(b).hasClass("active") && $(b).removeClass("active")
                  });
                  a.hasClass("active") || a.addClass("active");
                  a.parent().prev().removeClass("active");
                  $(".reports-body").data("reportId", null);
                  b = $(".reports-selectyear span").text();
                  a = a.find("span").text();
                  /*ROUTER.navigate("/workreport/" + d.userId + "/" + b + "/week/" + a, {
                      trigger: !0
                  });*/
                  $(".reports-panel").data("year", b).data("type", "week").data("serialNumber", a)
              })
      },
      render: function() {
          $(this.el);
          this.renderTimeLine();
//          f.layout("#timeline");
          $("#myReport").addClass("router").attr("href", "/workreport/" + this.userId)
      },
      changeCSS: function(d) {
          d.hasClass("season") && (1 == d.attr("serialNumber") ? ($("div[serialnumber=1]").addClass("active"), $("div[serialnumber=3]").removeClass("active")) : ($("div[serialnumber=3]").addClass("active"), $("div[serialnumber=1]").removeClass("active")), $(".timetree-weeklist").css("display", "none"), $(".halfyear").removeClass("active"), $(".endyear").removeClass("active"), $(".month").removeClass("active"), $(".j_week").removeClass("active"));
          d.hasClass("halfyear") && ($(".halfyear").addClass("active"), $(".timetree-weeklist").css("display", "none"), $("div[serialnumber=1]").removeClass("active"), $("div[serialnumber=3]").removeClass("active"), $(".endyear").removeClass("active"), $(".month").removeClass("active"), $(".j_week").removeClass("active"));
          d.hasClass("endyear") && ($(".endyear").addClass("active"), $(".timetree-weeklist").css("display", "none"), $("div[serialnumber=1]").removeClass("active"), $("div[serialnumber=3]").removeClass("active"), $(".halfyear").removeClass("active"), $(".month").removeClass("active"), $(".j_week").removeClass("active"))
      },
      renderTimeLine: function() {
          this.type ? (this.genYearSelect(this.year), "week" == this.type ? this.genTimeLineByYear(this.year, this.serialNumber) : "month" == this.type ? this.genTimeLineByYear(this.year, null, this.serialNumber) : this.genTimeLineByYear(this.year, -1, -1)) : (this.genYearSelect(), this.genTimeLineByYear())
      },
      genYearSelect: function(d) {
          var c = $(this.el),
              b = parseInt(Date.create(app.config.organization.currentUser.activeDate).getFullYear()),
              a = parseInt(Date.create(app.config.organization.nowTime).getFullYear()),
              e = new Date(app.config.organization.nowTime);
          d ? (d = parseInt(d),
            c.find(".dropdown-toggle").find("span").text(d),
            c = c.find(".dropdown-menu"),
            c.html(""),
            d - 2 >= b && c.append("<li><a>" + (d - 2) + "</a></li>"),
            d - 1 >= b && c.append("<li><a>" + (d - 1) + "</a></li>"),
            c.append("<li><a>" + d + "</a></li>"),
            d + 1 <= a && c.append("<li><a>" + (d + 1) + "</a></li>"),
            d + 2 <= a && c.append("<li><a>" + (d + 2) + "</a></li>")) : (1 == e.getISOWeek() && 12 == e.getMonth() + 1 && (a += 1),
            c.find(".dropdown-toggle").find("span").text(a),
            c = c.find(".dropdown-menu"),
            c.html(""),
            a - 2 >= b && c.append("<li><a>" + (a - 2) + "</a></li>"),
            a - 1 >= b && c.append("<li><a>" + (a - 1) + "</a></li>"),
            c.append("<li><a>" + a + "</a></li>"))
      },
      genTimeLineByYear: function(d, c, b) {
          var a = new Date(app.config.organization.nowTime);
          d = d ? d : 1 == a.getISOWeek() && 12 == a.getMonth() + 1 ? a.getFullYear() + 1 : a.getFullYear();
          var e = this.getWeekDayDate(d, 1, 1),
              e = this.getWeeksOfYear(e, d);
          c = c ? c : a.getISOWeek();
          var h;
          (new Date(app.config.organization.nowTime)).getMonth();
          var a = 2,
              f = 1,
              k = !0,
              g = !0,
              p = !0,
              n, s = $(".reports-timetree"),
              u = !1;
          s.html("");
          for (var w = 1; w <= e; w++) h = this.getWeekDayDate(d, w, 1),
              3 < f && k ? (k = $("#season").clone(), k.find("span").text("\u7b2c\u4e00\u5b63\u5ea6"), k.find(".season").attr("serialNumber", 1), s.append(k.html()), k = !1) : 6 < f && g ? (g = $("#halfyear").clone(), s.append(g.html()), g = !1) : 9 < f && p && (p = $("#season").clone(), p.find("span").text("\u7b2c\u4e09\u5b63\u5ea6"), p.find(".season").attr("serialNumber", 3), s.append(p.html()), p = !1),
              1 != w && (f = h.getMonth() + 1),
              u = d == h.getFullYear() || d != h.getFullYear() && 1 == w ? !0 : !1,
              a != f ? (n && s.append(n.html()), a = f, n = $("#month").clone(), n.find("strong").text(f), h = $("#week").clone(), u && f == b && (n.find(".timetree-head").addClass("active"), n.find(".timetree-weeklist").css("display", "block"))) : h = $("#week").clone(),
              u && w == c && !b ? (h.find("span").text(w), h.find("li").addClass("active"), n.find(".timetree-weeklist").css("display", "block")) : h.find("span").text(w),
              n.find(".timetree-weeklist").append(h.html()),
              w == e && ($(".reports-timetree").append(n.html()), h = $("#endyear").clone(), h.find("span").text(d + "\u5e74\u5ea6"), s.append(h.html()))
      },
      getWeeksOfYear: function(d, c) {
          return Math.ceil(((0 == c % 4 && 0 != c % 100 || 0 == c % 400 ? 366 : 365) - d.getDay()) / 7)
      },
      getWeekDayDate: function(d, c, b) {
          d = new Date(d, "0", "1");
          var a = d.getTime();
          d.setTime(a + 6048E5 * (c - 1));
          return this.getNextDate(d, b)
      },
      getNextDate: function(d, c) {
          c %= 7;
          var b = d.getDay(),
              a = d.getTime();
          d.setTime(a + 864E5 * (c - b));
          return d
      },
      update: function(d, c, b, a, e) {
          this.userId = d;
          this.year = c;
          this.type = b;
          this.serialNumber = a;
          this.isMyReport = e
      },
      remove: function() {
          $(this.el).off(".timeline")
      }
  });

  app.WorkReportView = Backbone.View.extend({
      initialize: function(b) {
          this.userId = b.userId;
          this.year = b.year;
          this.type = b.type;
          this.serialNumber = b.serialNumber;
          this.model = new app.models.WorkReportModel;
          /*this.userSliderView = new f({
              userId: TEAMS.currentUser.id,
              module: "workreport",
              dataType: "subordinate"
          });*/
          this.timelineView = new app.TimelineView({
              userId: this.userId,
              year: this.year,
              type: this.type,
              serialNumber: this.serialNumber,
              container: "#reports-left"
          })
      },
      render: function() {
          true == app.config.noSubordinates && $("#member-layer").last().addClass("hide");
          this.timelineView.render();
//          this.userSliderView.render();
//          this.getUnreadCount()
      },
      getUnreadCount: function() {
          this.model.getUnreadCount(function(b) {
              0 < b.unReadCount && ($(".j_unreadCount").addClass("badge"), $(".j_unreadCount").text(b.unReadCount));
              0 < b.commentMeCount && ($(".j_commentCount").addClass("badge"), $(".j_commentCount").text(b.commentMeCount));
              0 < b.replayMeCount && ($(".j_replayCount").addClass("badge"), $(".j_replayCount").text(b.replayMeCount))
          })
      },
      update: function(b, a, c, d, f) {
          this.userId = b;
          this.year = a;
          this.type = c;
          this.serialNumber = d;
          this.editable = f;
          this.timelineView && this.timelineView.update(this.userId, this.year, this.type, this.serialNumber, this.editable)
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
          "#print" == this.container && $("#print").addClass("fs-m print-report");
          this.editable ? $(this.el).html(_.template("workreport.reportcontent")()) : this.isStat ? $(this.el).html(_.template("workreport.readonlyreportcontentstat")()) : $(this.el).html(_.template("workreport.readonlyreportcontent")())
      },
      delegateEvents: function() {
          var a = this,
              b = $(this.el);
          b.on("click.workreportcontent", "#current",
              function(b) {
                  b = new Date(app.config.organization.nowTime);
                  var c = b.getFullYear(),
                      d = b.getISOWeek(),
                      e = b.getMonth() + 1;
                  1 == b.getISOWeek() && 12 == b.getMonth() + 1 && (c += 1, e = 1);
                  $(".reports-selectyear span").text(c);
                  "month" == a.type ? (a.trigger("synTimeLine", {
                      year: c,
                      month: e
                  }), $(".reports-panel").data("year", c).data("type", "month").data("serialNumber", e)/*, ROUTER.navigate("/workreport/" + a.userId + "/" + c + "/month/" + e, {
                      trigger: !0
                  })*/) : (a.trigger("synTimeLine", {
                      year: c,
                      week: d
                  }), $(".reports-panel").data("year", c).data("type", "week").data("serialNumber", d)/*, ROUTER.navigate("/workreport/" + a.userId + "/" + c + "/week/" + d, {
                      trigger: !0
                  })*/)
              });
          b.on("click.workreportcontent", "#prev",
              function(b) {
                  var c = new Date(app.config.organization.nowTime);
                  b = a.year ? a.year : c.getFullYear();
                  var d = a.serialNumber ? a.serialNumber : c.getISOWeek(),
                      c = a.serialNumber ? a.serialNumber : c.getMonth() + 1;
                  if ("month" == a.type) {
                      d = c - 1;
                      if (1 > d) {
                          if (2013 > b - 1) {
                              $(this).addClass("disabled");
                              return
                          }
                          b--;
                          d = 12;
                          $(".reports-selectyear span").text(b)
                      }
                      a.trigger("synTimeLine", {
                          year: b,
                          month: d
                      });
                      $(".reports-panel").data("year", b).data("type", "month").data("serialNumber", d);
                      /*ROUTER.navigate("/workreport/" + a.userId + "/" + b + "/month/" + d, {
                          trigger: !0
                      })*/
                  } else {
                      d -= 1;
                      c = b;
                      if (1 > d) {
                          if (2013 > c - 1) {
                              $(this).addClass("disabled");
                              return
                          }
                          c--;
                          d = a.getWeeksOfYear(a.getWeekDayDate(b - 1, 0, 1), b - 1);
                          $(".reports-selectyear span").text(c)
                      }
                      a.trigger("synTimeLine", {
                          year: c,
                          week: d
                      });
                      $(".reports-panel").data("year", c).data("type", "week").data("serialNumber", d);
                      /*ROUTER.navigate("/workreport/" + a.userId + "/" + c + "/week/" + d, {
                          trigger: !0
                      })*/
                  }
              });
          b.on("click.workreportcontent", "#next",
              function(b) {
                  var c = new Date(app.config.organization.nowTime);
                  b = a.year ? a.year : c.getFullYear();
                  var d = a.serialNumber ? a.serialNumber : c.getISOWeek(),
                      c = a.serialNumber ? a.serialNumber : c.getMonth() + 1;
                  if ("month" == a.type) {
                      c = parseInt(c) + 1;
                      d = parseInt(b);
                      if (12 < c) {
                          if (2015 < d + 1) {
                              $(this).addClass("disabled");
                              return
                          }
                          d++;
                          c = 1;
                          $(".reports-selectyear span").text(d)
                      }
                      a.trigger("synTimeLine", {
                          year: d,
                          month: c
                      });
                      $(".reports-panel").data("year", d).data("type", "month").data("serialNumber", c);
                      /*ROUTER.navigate("/workreport/" + a.userId + "/" + d + "/month/" + c, {
                          trigger: !0
                      })*/
                  } else {
                      c = parseInt(d) + 1;
                      d = parseInt(b);
                      if (c > a.getWeeksOfYear(a.getWeekDayDate(b, 0, 1), b)) {
                          if (2015 < d + 1) {
                              $(this).addClass("disabled");
                              return
                          }
                          d++;
                          c = 1;
                          $(".reports-selectyear span").text(d)
                      }
                      a.trigger("synTimeLine", {
                          year: d,
                          week: c
                      });
                      $(".reports-panel").data("year", d).data("type", "week").data("serialNumber", c);
                      /*ROUTER.navigate("/workreport/" + a.userId + "/" + d + "/week/" + c, {
                          trigger: !0
                      })*/
                  }
              });
          b.on("FileUploaded.workreportcontent", "#report-attachment",
              function(a, c) {
                  var d = b.find("#content");
                  if (!d.val() || d.data("text") == d.val()) {
                      var e = (d.data("text") ? d.data("text") + "," : "sdsdsdsdsdsdsdsdsdsd") + c.name;
                      d.val(e);
                      d.data("text", e)
                  }
                  d.focus()
              });
          b.off("click.workreportcontent", "#wr-print").on("click.workreportcontent", "#wr-print",
              function(b) {
                  window.open("/print/" + a.id + "/workreport")
              })
      },
      delegateEditEvents: function() {
          var a = this;
          $(this.el).on("focusout.workreportcontent", "#content,#summary,#plan",
              function(b) {
                  b = $(this);
                  if (b.val() && b.val() != $(this).data(b.attr("id"))) {
                      var c = $(".reports-body").data("reportId"),
                          d = {};
                      c ? (d["workReport." + b.attr("id")] = b.val(), d["workReport.id"] = c) : (d = a.genParam(c, a.userId, a.year, a.type, a.serialNumber), d["workReport." + b.attr("id")] = b.val());
                      a.save(d, c);
                      $(this).data(b.attr("id"), b.val())
                  }
              })
      },
      initComponent: function(a) {
          /*var c = $(this.el);
          a.id && (this.extendView = new d({
              targetId: a.id,
              module: "workreport",
              parentEl: this.el,
              container: "#extend-panel"
          }), this.extendView.render(a), TEAMS.currentUser.id == a.creator.id && (c.find("#report-share").removeClass("hide"), this.shareView = new e({
              entityId: a.id,
              module: "workreport",
              shareContainer: "#report-share",
              parentEl: this.el
          }), this.shareView.render(a.shareEntrys)));
          this.attachment = new b({
              targetId: a.id,
              module: "workreport",
              container: "#report-attachment",
              parentEl: this.el,
              readonly: !this.editable
          });
          this.attachment.render(a.attachments || [])*/
      },
      render: function() {
          var b = this,
              c = $(b.el);
          "#print" == b.container ? (c.find("#workreportcontent").removeClass("scrollwrapper"), c.find("#switch").remove()) : f.layout("#workreportcontent");
          c.find(".loading_large").show();
          var d = b.id;
          b.editable && b.delegateEditEvents();
          b.reportType && !$(".reports-panel").data("id") ? ($(".reports-panel").html("<div class='no-result'>asdfdfdfdf</div>"), $("#unread").parents(".pull-right").addClass("hide"), $(".j_mine").siblings().removeClass("hide")) : (this.reportType && !b.id && (d = $(".reports-panel").data("id")), d = b.genParam(d, b.userId, b.year, b.type, b.serialNumber), b.model.queryWorkReport(d,
              function(d) {
                  if (d.actionMsg && d.actionMsg.message) return $(b.el).html(_.template("base.nopermission")({
                          msg: d.actionMsg,
                          module: "workreport",
                          id: b.id
                      })),
                      $(b.el).find(".scrollwrapper").trigger("resizeSroll"), false;
                  var e = d.workReport,
                      g = d.employee,
                      k = $(".j_mine a");
                  g && !b.reportType ? g.id != app.config.currentUser.id ? ("female" == g.sex ? k.text("sdfsdfsdfddddd") : k.text("fffff"), k.attr("href", "/workreport/" + g.id), $(".j_mine").siblings().addClass("hide")) : (k.text("dfdf"), k.attr("href", "/workreport"), $(".j_mine").siblings().removeClass("hide")) : (k.text("dfdffffff"), k.attr("href", "/workreport"), $(".j_mine").siblings().removeClass("hide"));
                  if (e) {
                      b.id = e.id;
                      b.userId = e.creator.id;
                      g = e.creator.name ? e.creator.name : g.name;
                      0 == e.permission && $("#reports-right").html('<div class="p-10"><div class="alert alert-warning alert-block  fade in"><h4 class="alert-heading">sdfddddd! </h4><p>fffffff</p></div>\t\t</div>');
                      b.renderHeader(e.type, e.year, e.serialNumber, g);
                      b.renderReport(e);
                      if ("comment" == b.reportType) {
                          var u = 0 < d.commentMeCount ? d.commentMeCount : "";
                          setTimeout(function() {
                                  $(".j_commentCount").html(u)
                              },
                              1E3)
                      }
                      "replay" == b.reportType && (u = 0 < d.replayMeCount ? d.replayMeCount : "", setTimeout(function() {
                              $(".j_replayCount").html(u)
                          },
                          1E3));
                      "unread" == b.reportType && (u = 0 < d.unReadCount ? d.unReadCount : "", setTimeout(function() {
                              $(".j_unreadCount").html(u)
                          },
                          1E3));
                      "#print" == b.container ? (c.find("#wr-export").remove(), c.find("#wr-print").remove(), "week" == e.type && (b.weekblog = new a({
                          container: "#week-blog",
                          userId: b.userId,
                          date: Date.create(b.getWeekDayDate(e.year, parseInt(e.serialNumber) + 1, 7)).format("{yyyy}-{MM}-{dd}"),
                          print: !0
                      }), b.weekblog.render(), $("#js_printblog").show(), $("#printFont").show(), c.find("#blog-panel").show())) : (c.find("#wr-print").removeClass("hide"), c.find("#wr-export").attr("href", "/workreport/export.json?id=" + e.id + "&userId=" + e.creator.id).removeClass("hide"))
                  } else b.type ? b.renderHeader(b.type, b.year, b.serialNumber, g.name) : (d = new Date(app.config.organization.nowTime), b.renderHeader("week", d.getFullYear(), d.getISOWeek(), g.name)),
                      b.renderReport({});
                  b.trigger("unreadCount");
                  c.find(".loading_large").hide();
                  c.find("#content,#summary,#plan").autosize()
              }), b.trigger("beforeOpen", b.id), $("body").trigger("printLoaded"))
      },
      save: function(a, b) {
          var c = this;
          if (b) this.model.update(a,
              function(a) {
                  f.notify("dfddddddddddddddddddddddddddddddddddddddddd")
              });
          else {
              var d = c.attachment.getLinkIds();
              a.ids = d.join(",");
              this.model.create(a,
                  function(a) {
                      a = a.workReport;
                      $(".reports-body").data("reportId", a.id);
                      f.notify("gggggggggggggggggggggggg");
                      $("#extend-panel").html("");
                      c.initComponent(a);
                      c.id = a.id;
                      $(c.el).find("#wr-print").removeClass("hide");
                      $(c.el).find("#wr-export").attr("href", "/workreport/export.json?id=" + a.id + "&userId=" + a.creator.id).removeClass("hide")
                  })
          }
      },
      renderHeader: function(a, b, c, d) {
          var e = $(this.el);
          if ("week" == a) {
              $("#planTitle").text("fddddfdfdf");
              $("#contentTitle").text("dddfffff");
              var f = this.getWeekDayDate(b, c, 1),
                  g = this.getWeekDayDate(b, c, 6).addDays(1),
                  f = Date.create(f).format("{MM}-{dd}"),
                  u = g.format("{MM}-{dd}"),
                  w = d + "dfffff" + c + "asdfasdf";
              $("#title").text(w);
              $("#weekDay").html("[<i>" + f + "~" + u + "</i>]");
              this.reportType || ($("#prev").text("上一周"), $("#next").text("下一周"), $("#current").text("本周"), $("#switch").removeClass("hide"));
              app.config.currentUser.activeDate < g.getTime() ? $("#dayReport").text("sssssssssssss") : $("#dayReport").addClass("hide");
              e.find("#weeklyblog").attr("data-id", this.userId).attr("data-value", Date.create(this.getWeekDayDate(b, parseInt(c) + 1, 7)).format("{yyyy}-{MM}-{dd}"))
          }
          "month" == a && (w = d + "\u7684" + b + "\u5e74" + c + "\u6708\u4efd\u5de5\u4f5c\u62a5\u544a", $("#title").text(w), $("#planTitle").text("\u4e0b\u6708\u5de5\u4f5c\u8ba1\u5212"), $("#contentTitle").text("\u672c\u6708\u5de5\u4f5c\u6210\u6548"), $("#weekDay").addClass("hide"), this.reportType || ($("#prev").text("\u4e0a\u4e00\u6708"), $("#next").text("\u4e0b\u4e00\u6708"), $("#current").text("\u672c\u6708"), $("#switch").removeClass("hide")));
          "season" == a && (w = d + "\u7684" + b + "\u5e74\u7b2c" + c + "\u5b63\u5ea6\u5de5\u4f5c\u62a5\u544a", $("#title").text(w), $("#contentTitle").text("\u672c\u5b63\u5ea6\u5de5\u4f5c\u6210\u6548"), $("#planTitle").text("\u4e0b\u5b63\u5ea6\u5de5\u4f5c\u8ba1\u5212"), $("#weekDay").addClass("hide"), $("#switch").addClass("hide"));
          "year" == a && (w = d + "\u7684" + b + "\u5e74\u5e74\u5ea6\u5de5\u4f5c\u62a5\u544a", $("#title").text(w), $("#contentTitle").text("\u672c\u5e74\u5de5\u4f5c\u6210\u6548"), $("#planTitle").text("\u4e0b\u4e00\u5e74\u5de5\u4f5c\u8ba1\u5212"), $("#weekDay").addClass("hide"), $("#switch").addClass("hide"));
          "halfYear" == a && (w = d + "\u7684" + b + "\u5e74\u5e74\u4e2d\u5de5\u4f5c\u62a5\u544a", $("#title").text(w), $("#contentTitle").text("\u4e0a\u534a\u5e74\u5de5\u4f5c\u6210\u6548"), $("#planTitle").text("\u4e0b\u534a\u5e74\u5de5\u4f5c\u8ba1\u5212"), $("#weekDay").addClass("hide"), $("#switch").addClass("hide"));
          this.hideBlog && (e.find("#dayReport").addClass("hide"), e.find("#switch").addClass("hide"))
      },
      renderReport: function(a) {
          a.content ? this.editable ? $("#content").val(a.content).data("content", a.content) : $("#content").html(f.convert2Html(a.content)) : $("#content").val("").data("content", "");
          a.summary ? this.editable ? $("#summary").val(a.summary).data("summary", a.summary) : $("#summary").html(f.convert2Html(a.summary)) : $("#summary").val("").data("summary", "");
          a.plan ? this.editable ? $("#plan").val(a.plan).data("plan", a.plan) : $("#plan").html(f.convert2Html(a.plan)) : $("#plan").val("").data("plan", "");
          this.editable && $(".reports-body").data("reportId", a.id);
          a.lastUpdateTime && $("#createTime").text("  \u6700\u540e\u63d0\u4ea4\u4e8e" + Date.create(a.lastUpdateTime).format("{yyyy}-{MM}-{dd} {HH}:{mm}:{ss}"));
          $("#extend-panel").html("");
          this.initComponent(a);
          (!this.editable && !a.attachments || !this.editable && 0 == a.attachments.length) && $("#report-attachment").css("display", "none");
          this.flag && this.userId == app.config.currentUser.id && ($("#content").html("\u4e0d\u53ef\u586b\u5199"), $("#summary").html("\u4e0d\u53ef\u586b\u5199"), $("#plan").html("\u4e0d\u53ef\u586b\u5199"))
      },
      genParam: function(a, b, c, d, e) {
          if (!a) {
              var f = new Date(app.config.organization.nowTime);
              c = c ? c : f.getFullYear();
              d = d ? d : "week";
              "year" != d && "halfYear" != d && (e = e ? e : f.getISOWeek())
          }
          f = {};
          f["workReport.id"] = a;
          f["workReport.year"] = c;
          f["workReport.serialNumber"] = e;
          f["workReport.type"] = d;
          f["workReport.creator.userId"] = b;
          return f
      },
      getWeekDayDate: function(a, b, c) {
          a = new Date(a, "0", "1");
          var d = a.getTime();
          a.setTime(d + 6048E5 * (b - 1));
          return this.getNextDate(a, c)
      },
      getNextDate: function(a, b) {
          b %= 7;
          var c = a.getDay(),
              d = a.getTime();
          a.setTime(d + 864E5 * (b - c));
          return a
      },
      getWeeksOfYear: function(a, b) {
          return Math.ceil(((0 == b % 4 && 0 != b % 100 || 0 == b % 400 ? 366 : 365) - a.getDay()) / 7)
      },
      isDisable: function() {
          var a = Date.create(app.config.organization.nowTime),
              b = a.getFullYear(),
              c = a.getMonth() + 1,
              d = a.getISOWeek();
          a.getISOWeek();
          1 == a.getISOWeek() && 12 == a.getMonth() + 1 && (b = parseInt(b) + 1, c = 1);
          if (this.year && (a = parseInt(this.year), 2015 < a || 2013 > a)) return !0;
          if (this.year == b) switch (this.type) {
              case "year":
                  if (12 > c) return !0;
                  break;
              case "season":
                  if (1 == this.serialNumber && 3 > c || 3 == this.serialNumber && 9 > c) return !0;
                  break;
              case "halfYear":
                  if (6 > c) return !0;
                  break;
              case "month":
                  if (this.serialNumber > c) return !0;
                  break;
              case "week":
                  if (this.serialNumber > d) return !0
          }
          switch (this.type) {
              case "season":
                  if (1 != this.serialNumber && 3 != this.serialNumber) return !0;
                  break;
              case "month":
                  if (12 < this.serialNumber) return !0;
                  break;
              case "week":
                  if (this.serialNumber > this.getWeeksOfYear(this.getWeekDayDate(this.year, 0, 1), this.year)) return !0
          }
          return !1
      },
      remove: function() {
          $(this.el).off(".workreportcontent");
          this.header && (this.header.remove(), this.header = null);
          this.extendView && (this.extendView.remove(), this.extendView = null);
          this.shareView && (this.shareView.remove(), this.shareView = null)
      }
  });

}(window, app, Backbone, jQuery, _, moment));
