/*global Cobra:true*/

(function (window, app, Backbone, jQuery, _, moment) {
  "use strict";

  var $ = jQuery;

  var BasePage = Backbone.View.extend({

    defaults: {
      // can this view stream updates?
      canStream: false,
      // should this view default to streaming updates?
      realtime: false,
      // should show pagination?
      pageable: false
    },

    initialize: function (data) {
      Backbone.View.prototype.initialize.apply(this, arguments);

      if (_.isUndefined(data))
        data = {};

      this.options = $.extend({}, this.defaults, this.options, data);

      this.el = "#mainContainer";

      this.views = {};
      this.initializeAjaxTabs();
    },

    initializeAjaxTabs: function () {
      $('body').on('click', 'a[data-toggle=ajtab]', _.bind(function (e) {
//      $('a[data-toggle=ajtab]').click(_.bind(function (e) {
        var $tab = $(e.currentTarget),
          uri = $tab.attr('data-uri'),
          view_id = $tab.attr('href').substr(1),
          view = this.getView(view_id, uri),
          $cont, $parent;
        var that = this;
        e.preventDefault();

        if (!uri)
          return view.reset();

        $cont = $('#' + view_id);
        $parent = $cont.parent();
        $parent.css('opacity', 0.6);

        $.ajax({
          url: uri,
          dataType: 'json',
          success: function (data) {
            view.reset(data[app.config.jsonDataRoot]);
            console.info(that);
            if(that.options.pageable){
              data.linkUrl = uri;
              data.viewId = view_id;
              $cont.find('.btn-toolbar').remove();
              $cont.append(_.template(app.templates.pagination)(data));
            }
            $parent.css('opacity', 1);
            $tab.tab('show');
          },
          error: function () {
            $cont.html('<p>There was an error fetching data from the server.</p>');
          }
        });
      }, this));

      // initialize active tabs
      $('li.active a[data-toggle=ajtab]').click();
    },

    makeDefaultView: function (id) {
      return new app.GroupListView({
        className: 'group-list small',
        id: id,
//        maxItems: 5,
        stream: this.options.stream,
        realtime: this.options.realtime,
        pageable: this.options.pageable,
        model: app.models.Group
      });
    },

    getView: function (id, uri) {
      if (!this.views[id])
        this.views[id] = this.makeDefaultView(id);
      var view = this.views[id];
      view.options.pollUrl = uri;
      return view;
    },

    render: function () {
      console.error("you need to rewrite the method : render")
    },
    renderSubview: function () {
      console.error("you need to rewrite the method : renderSubview")
    },
    _render: function (d) {
      $(".modal-backdrop,.modal").remove();
      d && ($(d).parents("aside.aside").find(".active").removeClass("active"), $(d).addClass("active"), $("body").find(".aside-nav").data("nav") && $(".aside-nav>li>ul").find(".active").parents(".sub-nav").show().prev().addClass("on"), $("body").trigger("sideNav"));
      this.mainView.render();
    },
    _renderSubview: function () {
      var d = this;
      if (this.mainView.subView = this.subView) {
        this.subView.on("all", function (c, b) {d.trigger(c, b)});
        this.subView.render();
      }
    },
    initLayout: function (d, c) {
      this.pageActive = 'tas';
      $(this.el);
      $("body").trigger("slideClose");
      var b = false, a = "j_modnav-" + this.pageActive;
      $("#navigation .j_nav_ul li").removeClass("active");
      for (var e = $("#navigation .j_nav_ul .j_baseautolis li"), h = 0, g = e.length; h < g; h++)
        if ($(e[h]).find("a").hasClass(a)) {
          b = true;
          break;
        }
      b ? ($("#navigation").find(".j_modnav-" + this.pageActive).parent().addClass("active"), $("#navigation .j_activeli").empty()) : (b = $(".j_pageActive").find(".j_modnav-" + this.pageActive).clone(), b.find("span").eq(1).remove(), $("#navigation .j_activeli").addClass("active").html(b || ""));
      null == this.pageActive ? $("#navigation .j_activeli,#navigation .j_homeli").removeClass("active") : "portal" == this.pageActive ? ($("#navigation .j_activeli").removeClass("active"), $("#navigation .j_homeli").addClass("active")) : ($("#navigation .j_activeli").addClass("active"), $("#navigation .j_homeli").removeClass("active"));
      this.browserTit();
      this.template && (
        $("#mainContainer").html(_.template(this.template)(d)),
        /*TEAMS.blogUser*/'' && c && c(),
        app.config.noSubordinates && $("#mainContainer").find(".j_subordinates,.j_subordinate").remove(),
        null != this.userId && this.userId != app.config.currentUser.id && $("#mainContainer").find(".aside-nav>li").not(":first").remove()
      )
    },
    browserTit: function () {
      var d, c = $(".j_pageActive").find(".j_modnav-" + this.pageActive + " span:eq(0)").text() || "cobra";
      oldbt = document.title;
      d = oldbt.slice(oldbt.indexOf(" - "));
      c && (document.title = "portal" == this.pageActive || null == this.pageActive ? "cobra" + d : c + d);
      /*if (this.isPrintPage) switch (this.pageKey) {
        case "flow":
          document.title = "w" + d;
          break;
        case "task":
          document.title = "t" + d;
          break;
        case "workreport":
          document.title = "w" + d
      }*/
    },
    remove: function () {
      this.off();
      this.undelegateEvents();
      this.subView && (this.subView.off(), this.subView.remove(), this.subView = null);
      this.mainView && (this.mainView.off(), this.mainView.remove(), this.mainView = null)
    }

  });

  app.StreamPage = BasePage.extend({

    initialize: function (data) {
      BasePage.prototype.initialize.apply(this, arguments);

      this.group_list = new app.GroupListView({
        className: 'group-list',
        id: 'event_list',
        members: data.groups,
        maxItems: 50,
        realtime: ($.cookie('pausestream') ? false : true),
        canStream: this.options.canStream,
        pollUrl: app.config.urlPrefix + '/api/' + app.config.teamId + '/' + app.config.projectId + '/poll/',
        model: app.models.Group
      });

      this.control = $('a[data-action=pause]');
      this.updateStreamOptions();
      this.initFilters();

      this.control.click(_.bind(function (e) {
        e.preventDefault();
        this.options.realtime = this.group_list.options.realtime = this.control.hasClass('realtime-pause');
        this.updateStreamOptions();
      }, this));

      $('#chart').height('50px');
      app.charts.render('#chart', {
        placement: 'left'
      });
    },

    initFilters: function () {
      $('.filter').each(_.bind(function (_, el) {
        var $filter = $(el);
        var $input = $filter.find('input[type=text]');
        if ($input.length > 0) {
          $input.select2({
            initSelection: function (el, callback) {
              var $el = $(el);
              callback({id: $el.val(), text: $el.val()});
            },
            allowClear: true,
            minimumInputLength: 3,
            ajax: {
              url: app.utils.getSearchTagsUrl(),
              dataType: 'json',
              data: function (term, page) {
                return {
                  query: term,
                  quietMillis: 300,
                  name: $input.attr('name'),
                  limit: 10
                };
              },
              results: function (data, page) {
                var results = [];
                $(data.results).each(function (_, val) {
                  results.push({
                    id: app.utils.escape(val),
                    text: app.utils.escape(val)
                  });
                });
                return {results: results};
              }
            }
          });
        } else {
          $input = $filter.find('select').select2({
            allowClear: true
          });
        }
        if ($input.length > 0) {
          $input.on('change', function (e) {
            var query = app.utils.getQueryParams();
            query[e.target.name] = e.val;
            window.location.href = '?' + $.param(query);
          });
        }
      }, this));
    },

    updateStreamOptions: function () {
      if (this.options.realtime) {
        $.removeCookie('pausestream');
        this.control.removeClass('realtime-pause');
        this.control.addClass('realtime-play');
        this.control.html(this.control.attr('data-pause-label'));
      } else {
        $.cookie('pausestream', '1', {expires: 7});
        this.control.addClass('realtime-pause');
        this.control.removeClass('realtime-play');
        this.control.html(this.control.attr('data-play-label'));
      }
    }

  });

  app.DashboardPage = BasePage.extend({

    initialize: function (data) {
      BasePage.prototype.initialize.apply(this, arguments);

      var key = "dashboard_sidebar_filter";
      // store selection in cookie
      $('.dash-sidebar-tabs a').on('click', function (e) {
        $.cookie(key, $(e.target).attr('id'));
      });

      // show tab from cookie
      var sidebar_filter = $.cookie(key);
      if (sidebar_filter) {
        $("#" + sidebar_filter).tab('show');
      }

      $(".dash-filter").keyup(_.bind(function (e) {
        this.doFilter($(e.currentTarget).parents('.panel').first());
      }, this));

      $('.filter-bar .nav-linker').on('click', _.bind(function(e){
        e.preventDefault();
        var $this = $(e.currentTarget);
        var uiBox = $this.parents('.panel').first();
        uiBox.find('.nav-linker.linker-selected').removeClass('linker-selected');
        $this.addClass('linker-selected');
        this.doFilter(uiBox);
      }, this));
    },

    doFilter: function (uiBox) {
      var filter = uiBox.find('.filter-bar .linker-selected').data('filter') || '';
      var terms = uiBox.find('.dash-filter').val();
      uiBox.find(".dash-list li").hide();
      if (terms == "" || terms == undefined) {
        uiBox.find(".dash-list li"+filter).show();
      } else {
        uiBox.find(".dash-list li"+filter).each(function () {
          var name = $(this).find(".filter-title").text();
          if (name.toLowerCase().search(terms.toLowerCase()) == -1)
            $(this).hide();
          else
            $(this).show();
        });
      }
    }
  });

  app.SelectTeamPage = BasePage.extend({

    initialize: function () {
      BasePage.prototype.initialize.apply(this, arguments);

      this.refreshSparklines();
      $(window).on('resize', this.refreshSparklines);
    },

    refreshSparklines: function () {
      $('.chart').each(function (n, el) {
        var $el = $(el);
        $.ajax({
          url: $el.attr('data-api-url'),
          type: 'get',
          dataType: 'json',
          data: {
            since: new Date().getTime() / 1000 - 3600 * 24,
            resolution: '1h'
          },
          success: _.bind(function (data) {
            for (var i = 0; i < data.length; i++) {
              // set timestamp to be in millis
              data[i][0] = data[i][0] * 1000;
            }

            $.plot($el, [
              {
                data: data,
                color: '#ebeff3',
                shadowSize: 0,
                lines: {
                  lineWidth: 2,
                  show: true,
                  fill: true,
                  color: '#f6f8fa'
                }
              }
            ], {
                yaxis: {
                  min: 0
                },
                grid: {
                  show: false
                },
                hoverable: false,
                legend: {
                  noColumns: 5
                },
                lines: {
                  show: false
                }
              }
            );
          }, this)
        });
      });
    }

  });

  app.GroupDetailsPage = BasePage.extend({

    initialize: function (data) {
      BasePage.prototype.initialize.apply(this, arguments);

      this.group_list = new app.GroupListView({
        className: 'group-list',
        id: 'event_list',
        members: [data.group],
        model: app.models.Group
      });

      $('#chart').height('150px');
      Sentry.charts.render('#chart');

      $('.share-link').popover({
        html: true,
        placement: 'left',
        container: document.body,
        title: 'Share Event',
        content: function () {
          var $this = $(this);
          var $content = $('<form class="share-form"></form>');
          var $urlel = $('<code class="clippy">' + $this.data('share-url') + '</code>');
          $urlel.clippy({
            clippy_path: app.config.clippyPath,
            keep_text: true
          });
          $content.append($urlel);
          $content.append($('<label class="checkbox"><input type="checkbox"> Allow anonymous users to view this event.</label>'));

          $content.find('input[type=checkbox]').change(function () {
            var url = $this.data($(this).is(':checked') ? 'public-url' : 'private-url');
            $.ajax({
              url: url,
              type: 'post',
              success: function (group) {
                $this.data('public', group.isPublic ? 'true' : 'false');
              },
              error: function () {
                window.alert('There was an error changing the public status');
              }
            });
          }).attr('checked', $this.data('public') == 'true');

          return $content;
        }
      });

      $('.add-note-btn').click(function (e) {
        var $el = $(this),
          $form = $('.add-note-form', $el.parent());

        e.preventDefault();

        if ($el.hasClass('selected')) {
          $el.removeClass('selected');
          $form.addClass('hide');
        } else {
          $el.addClass('selected');
          $form.removeClass('hide');
          $form.find('textarea:first').focus();
        }
      });

      $('.add-note-form').submit(function (el) {
        var $this = $(this);
        $this.find('button[type=submit]').attr('disabled', true).addClass('disabled');
        $this.find('textarea').addClass('disabled');
      });

      $('.tag-widget').each(function () {
        var $widget = $(this);
        $.ajax({
          url: $widget.data('url'),
          error: function () {
            $widget.find('.loading').remove();
            $widget.append($('<li class="error">Unable to load tag information</li>'));
          },
          success: function (data) {
            var total = data.total,
              eTagName = encodeURIComponent(data.name);

            $widget.find('.loading').remove();
            if (total === 0) {
              $widget.append($('<li>No data available.</li>'));
            } else {
              $.each(data.values, function (_, item) {
                var tagValue = item[0],
                  timesSeen = item[1],
                  percent = parseInt(timesSeen / total * 100, 10),
                  url = app.config.urlPrefix + '/' + app.config.teamId + '/' + app.config.projectId + '/';

                $('<li>' +
                  '<div class="progressbar">' +
                  '<div style="width:' + percent + '%">' + timesSeen + '</div>' +
                  '<a href="' + url + '?' + eTagName + '=' + encodeURIComponent(tagValue) + '">' +
                  tagValue +
                  '<span>' + percent + '%</span>' +
                  '</a>' +
                  '</div>' +
                  '</li>').appendTo($widget);
              });
            }
          }
        });
      });

      var $event_nav = $('#event_nav');
      if ($event_nav.length > 0) {
        var $window = $(window);
        var $nav_links = $event_nav.find('a[href*=#]');
        var $nav_targets = [];
        var scroll_offset = $event_nav.offset().top;
        var event_nav_height;
        var last_target;

        $window.resize(function () {
          event_nav_height = $event_nav.find('.nav').outerHeight();
          $event_nav.height(event_nav_height + 'px');
        }).resize();

        $nav_links.click(function (e) {
          var $el = $(this);
          var target = $(this.hash);

          $el.parent().addClass('active').siblings().removeClass('active');

          $('html,body').animate({
            scrollTop: target.position().top + event_nav_height
          }, 'fast');

          if (history.pushState) {
            history.pushState({}, '', this.hash);
          }

          e.preventDefault();
        }).each(function () {
          if (this.hash.length > 1 && $(this.hash).length) {
            $nav_targets.push(this.hash);
          }
        });

        var resizeTimer;
        $window.scroll(function () {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(function () {
            // Change fixed nav if needed
            if ($window.scrollTop() > scroll_offset) {
              if (!$event_nav.hasClass('fixed')) {
                $event_nav.addClass('fixed');
              }
            } else if ($event_nav.hasClass('fixed')) {
              $event_nav.removeClass('fixed');
            }

            if ($nav_targets.length) {
              // Get container scroll position
              var from_top = $window.scrollTop() + event_nav_height + 20;

              // Get id of current scroll item
              var cur = $.map($nav_targets, function (hash) {
                if ($(hash).offset().top < from_top) {
                  return hash;
                }
              });

              // Get the id of the current element
              var target = cur ? cur[cur.length - 1] : null;

              if (!target) {
                target = $nav_targets[0];
              }

              if (last_target !== target) {
                last_target = target;

                // Set/remove active class
                $nav_links
                  .parent().removeClass("active")
                  .end().filter("[href=" + target + "]").parent().addClass("active");
              }
            }
          }, 1);
        }).scroll();
      }
    }
  });

  app.WallPage = BasePage.extend({
    initialize: function () {
      BasePage.prototype.initialize.apply(this, {
        realtime: true,
        pollTime: 3000
      });

      this.sparkline = $('.chart');
      this.sparkline.height(this.sparkline.parent().height());
      this.stats = $('#stats');

      _.bindAll(this, 'refreshStats', 'refreshSparkline');

      this.refreshSparkline();
      this.refreshStats();
    },

    makeDefaultView: function (id) {
      return new app.GroupListView({
        className: 'group-list',
        id: id,
        maxItems: 5,
        stream: this.options.stream,
        realtime: this.options.realtime,
        model: app.models.Group
      });
    },

    refreshSparkline: function () {
      $.ajax({
        url: this.sparkline.attr('data-api-url'),
        type: 'get',
        dataType: 'json',
        data: {
          since: new Date().getTime() / 1000 - 3600 * 24,
          resolution: '1h'
        },
        success: _.bind(function (data) {
          for (var i = 0; i < data.length; i++) {
            // set timestamp to be in millis
            data[i][0] = data[i][0] * 1000;
          }
          this.sparkline.empty();
          $.plot(this.sparkline, [
            {
              data: data,
              color: '#52566c',
              shadowSize: 0,
              lines: {
                lineWidth: 2,
                show: true,
                fill: true,
                fillColor: '#232428'
              }
            }
          ], {
              yaxis: {
                min: 0
              },
              grid: {
                show: false
              },
              hoverable: false,
              legend: {
                noColumns: 5
              },
              lines: {
                show: false
              }
            }
          );

          window.setTimeout(this.refreshSparkline, 10000);
        }, this)
      });
    },

    refreshStats: function () {
      $.ajax({
        url: this.stats.attr('data-uri'),
        dataType: 'json',
        success: _.bind(function (data) {
          this.stats.find('[data-stat]').each(function () {
            var $this = $(this);
            var new_count = data[$this.attr('data-stat')];
            var counter = $this.find('big');
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

          });
          window.setTimeout(this.refreshStats, 1000);
        }, this)
      });
    }

  });

  app.AddTeamMemberPage = BasePage.extend({
  });

  app.AccessGroupMembersPage = BasePage.extend({
    initialize: function () {
      BasePage.prototype.initialize.apply(this, arguments);

      app.utils.makeSearchableUsersInput('form input[name=user]');
    }
  });

  app.TeamDetailsPage = BasePage.extend({
    initialize: function () {
      BasePage.prototype.initialize.apply(this, arguments);

      app.utils.makeSearchableUsersInput('form input[name=owner]');
    }
  });

  app.ProjectDetailsPage = BasePage.extend({
    initialize: function () {
      BasePage.prototype.initialize.apply(this, arguments);

      app.utils.makeSearchableUsersInput('form input[name=owner]');

      $("input[type=range]").each(_.bind(function loop(n, el) {
        var $el = $(el),
          min = parseInt($el.attr('min'), 10),
          max = parseInt($el.attr('max'), 10),
          step = parseInt($el.attr('step'), 10),
          values = [],
          $value = $('<span class="value"></span>');

        var i = min;
        while (i <= max) {
          values.push(i);
          if (i < 12) {
            i += 1;
          } else if (i < 24) {
            i += 3;
          } else if (i < 36) {
            i += 6;
          } else if (i < 48) {
            i += 12;
          } else {
            i += 24;
          }
        }

        $el.on("slider:ready", _.bind(function sliderready(event, data) {
            $value.appendTo(data.el);
            $value.html(this.formatHours(data.value));
          }, this)).on("slider:changed", _.bind(function sliderchanged(event, data) {
            $value.html(this.formatHours(data.value));
          }, this)).simpleSlider({
          range: [min, max],
          step: step,
          allowedValues: values,
          snap: true
        });
      }, this));
    },

    formatHours: function formatHours(val) {
      val = parseInt(val, 10);
      if (val === 0) {
        return 'Disabled';
      } else if (val > 23 && val % 24 === 0) {
        val = (val / 24);
        return val + ' day' + (val != 1 ? 's' : '');
      }
      return val + ' hour' + (val != 1 ? 's' : '');
    }
  });

  app.ProjectNotificationsPage = BasePage.extend({
    initialize: function () {
      BasePage.prototype.initialize.apply(this, arguments);

      $("input[type=range]").each(_.bind(function loop(n, el) {
        var $el = $(el),
          min = parseInt($el.attr('min'), 10),
          max = parseInt($el.attr('max'), 10),
          step = parseInt($el.attr('step'), 10),
          $value = $('<span class="value"></span>');

        $el.on("slider:ready", _.bind(function sliderready(event, data) {
            $value.appendTo(data.el);
            $value.html(this.formatThreshold(data.value));
          }, this)).on("slider:changed", _.bind(function sliderchanged(event, data) {
            $value.html(this.formatThreshold(data.value));
          }, this)).simpleSlider({
          range: [min, max],
          step: step,
          snap: true
        });
      }, this));
    },

    formatThreshold: function formatThreshold(value) {
      if (!value) {
        return 'Disabled';
      }
      return value + '%';
    }

  });

  app.NewProjectPage = BasePage.extend({

    initialize: function (data) {
      this.el = $(data.el);

      BasePage.prototype.initialize.apply(this, arguments);

      if (this.options.canSelectTeam && this.options.canCreateTeam) {
        $('#new_team').hide();
        $('a[rel="create-new-team"]').click(function () {
          $('#new_team').show();
          $('#select_team').hide();
        });
        $('a[rel="select-team"]').click(function () {
          $('#new_team').hide();
          $('#select_team').show();
        });
      }
    }

  });


  app.NewProjectRulePage = BasePage.extend({

    initialize: function (data) {
      var select2_options = {
        width: 'element',
        allowClear: false,
        minimumResultsForSearch: 10
      };

      BasePage.prototype.initialize.apply(this, arguments);

      _.bindAll(this, 'addAction', 'addCondition', 'parseFormData');

      this.actions_by_id = {};
      this.conditions_by_id = {};
      this.el = $(data.el);
      this.action_sel = this.el.find('select[id="action-select"]');
      this.action_table = this.el.find('table.action-list');
      this.action_table_body = this.action_table.find('tbody');
      this.condition_sel = this.el.find('select[id="condition-select"]');
      this.condition_table = this.el.find('table.condition-list');
      this.condition_table_body = this.condition_table.find('tbody');

      this.action_sel.empty();
      this.action_sel.append($('<option></option>'));
      $.each(data.actions, _.bind(function (_, action) {
        var opt = $('<option></option>');
        opt.attr({
          value: action.id
        });
        opt.text(action.label);
        opt.appendTo(this.action_sel);

        this.actions_by_id[action.id] = action;
      }, this));

      this.condition_sel.empty();
      this.condition_sel.append($('<option></option>'));
      $.each(data.conditions, _.bind(function (_, condition) {
        var opt = $('<option></option>');
        opt.attr({
          value: condition.id
        });
        opt.text(condition.label);
        opt.appendTo(this.condition_sel);

        this.conditions_by_id[condition.id] = condition;
      }, this));

      this.action_sel.select2(select2_options);
      this.condition_sel.select2(select2_options);

      this.action_sel.change(_.bind(function () {
        this.addAction(this.action_sel.val());
      }, this));
      this.condition_sel.change(_.bind(function () {
        this.addCondition(this.condition_sel.val());
      }, this));

      this.parseFormData(data.form_data, data.form_errors);
    },

    parseFormData: function (form_data, form_errors) {
      // start by parsing into condition/action bits
      var data = {
        action: {},
        action_match: form_data.action_match || 'all',
        condition: {},
        label: form_data.label || ''
      };

      form_errors = form_errors || {};

      $.each(form_data, function (key, value) {
        var matches = key.match(/^(condition|action)\[(\d+)\]\[(.+)\]$/);
        var type, num;
        if (!matches) {
          return;
        }
        type = matches[1];
        num = matches[2];
        if (data[type][num] === undefined) {
          data[type][num] = {};
        }
        data[type][num][matches[3]] = value;
      });

      this.el.find('input[name=label]').val(data.label);
      this.el.find('select[name="action_match"]').val(data.action_match);

      $.each(_.sortBy(data.condition), _.bind(function (num, item) {
        this.addCondition(item.id, item, form_errors['condition[' + num + ']'] || false);
      }, this));
      $.each(_.sortBy(data.action), _.bind(function (num, item) {
        this.addAction(item.id, item, form_errors['action[' + num + ']'] || false);
      }, this));
    },

    addCondition: function (id, options, has_errors) {
      var node = this.conditions_by_id[id],
        row = $('<tr></tr>'),
        remove_btn = $('<button class="btn btn-small">Remove</button>'),
        num = this.condition_table_body.find('tr').length,
        html = $('<div>' + node.html + '</div>'),
        prefix = 'condition[' + num + ']',
        id_field = $('<input type="hidden" name="' + prefix + '[id]" value="' + node.id + '">');

      has_errors = has_errors || false;
      options = options || {};

      if (has_errors) {
        row.addClass('error');
      }

      html.find('select').each(function () {
        var $this = $(this),
          options = {
            width: 'element',
            allowClear: false,
            minimumResultsForSearch: 10
          };

        if ($this.attr('data-allowClear')) {
          options.allowClear = $this.attr('data-allowClear');
        }

        $this.select2(options);
      });

      // we need to update the id of all form elements
      html.find('input, select, textarea').each(function (_, el) {
        var $el = $(el),
          name = $el.attr('name');
        $el.attr('name', prefix + '[' + name + ']');
        $el.val(options[name] || '');
      });
      row.append($('<td></td>').append(html).append(id_field));
      row.append($('<td></td>').append(remove_btn));
      row.appendTo(this.condition_table_body);

      remove_btn.click(function () {
        row.remove();
        return false;
      });

      this.condition_sel.data("select2").clear();
      this.condition_table.show();
    },

    addAction: function (id, options, has_errors) {
      var node = this.actions_by_id[id],
        row = $('<tr></tr>'),
        remove_btn = $('<button class="btn btn-small">Remove</button>'),
        num = this.action_table_body.find('tr').length,
        html = $('<div>' + node.html + '</div>'),
        prefix = 'action[' + num + ']',
        id_field = $('<input type="hidden" name="' + prefix + '[id]" value="' + node.id + '">');

      has_errors = has_errors || false;
      options = options || {};

      if (has_errors) {
        row.addClass('error');
      }

      html.find('select').each(function () {
        var $this = $(this),
          options = {
            width: 'element',
            allowClear: false,
            minimumResultsForSearch: 10
          };

        if ($this.attr('data-allowClear')) {
          options.allowClear = $this.attr('data-allowClear');
        }

        $this.select2(options);
      });

      // we need to update the id of all form elements
      html.find('input, select, textarea').each(function (_, el) {
        var $el = $(el),
          name = $el.attr('name');
        $el.attr('name', prefix + '[' + name + ']');
        $el.val(options[name] || '');
      });
      row.append($('<td></td>').append(html).append(id_field));
      row.append($('<td></td>').append(remove_btn));
      row.appendTo(this.action_table_body);

      remove_btn.click(function () {
        row.remove();
        return false;
      });

      this.action_sel.data("select2").clear();
      this.action_table.show();
    }

  });

  var WorkReportBasePage = BasePage.extend({
    initialize: function (data) {
      BasePage.prototype.initialize.apply(this, arguments);

      _.bindAll(this, 'showViewMoreButton', 'viewHiddenMedicineInfo');

      $('.view-more').on('click', _.bind(function (e) {
        e.preventDefault();
        var target = $(e.target);
        if(target.hasClass("expanded") || target.parent().hasClass("expanded")) {
          this.showViewMoreButton(e);
        } else {
          this.viewHiddenMedicineInfo(e);
        }
      },this));
    },

    viewHiddenMedicineInfo: function(e) {
      var parent, target;
      return target = $(e.target),
      parent = target.hasClass(".track-box") ? target: target.parents(".track-box"),
      parent.find(".view-more").addClass("expanded"),
      parent.find(".view-more a").text("view less"),
      parent.animate({
        height: "100%"
      })
    },

    showViewMoreButton: function (e) {
      var target, viewmore;
      return target = $(e.target).parents(".track-box"),
      viewmore = target.find(".view-more"),
      viewmore.removeClass("expanded").find("a").text("view more"),
      target.animate({
        height: "225px"
      })
    }
  });


  app.WorkReportPage = WorkReportBasePage.extend({

    default_settings: {
      reportType: 'daily',
      isTeam: false,
      year: "2013",
      month: "12",
      day: "1",
      maxDate: "2016/12/30",
      minDate: "2013/01/01"
    },

    ui: {
      datePicker: $(".date-statistics .highlight-date")
    },

    initialize: function (data) {
      BasePage.prototype.initialize.apply(this, arguments);

//      _.bindAll(this, '_getMonthCompleteStatusData');

      if (_.isUndefined(data))
        data = {};

      this.options = $.extend({}, this.default_settings, this.options, data);

      this.firstComeIn = true;

      this._timeBindPicker();
      this.handleReportEdit();

      if(this.options.isTeam){
        this.handleTeamStatisticBar();
      } else {
        if(this.options.reportType==='daily') {
          this.handleSubtasks();
        }
      }

    },

    _addClassDom: function(data) {
      var a, b = this.ui.datePicker.find(".datepicker-days tbody td");
      b.removeClass("complete partcomplete incomplete");
      $.each(b, function(d) {
          var e = {
              0 : "",
              1 : "complete",
              2 : "partcomplete",
              3 : "incomplete",
              4 : "complete",
              5 : "partcomplete",
              6 : "incomplete"
          };
          if (d < data.length) {
              var f = data[d],
              g = f.status;
              e[g] && (b.eq(d).addClass(e[g]), 0 == d ? (a = g, b.eq(d).addClass("startBorder")) : g != a && (b.eq(d - 1).addClass("endBorder"), b.eq(d).addClass("startBorder")))
          }
      });
    },

    _timeBindPicker: function() {
      var month_short_name = moment.monthsShort();
      var date = this.options.year + "/" + this.options.month + "/" + this.options.day;

//      e = moment(b);
      var redirectToUrl = '';

      var datePickerSettings = {
        format: "YYYY/MM/DD",
        inline: true,
        useCurrent: false
      };
      if (this.options.maxDate) {
          var maxDate = this.options.maxDate;
          datePickerSettings.maxDate = moment(maxDate).format("YYYY-MM-DD");
      }
      if (this.options.minDate) {
          var minDate = this.options.minDate;
          datePickerSettings.minDate = moment(minDate).format("YYYY-MM-DD");
      }

      this.ui.datePicker.on("dp.change", _.bind(function(e) { // day change
        var newDate = e.date, oldDate = e.oldDate;
        if(this.firstComeIn) {
          this._getMonthCompleteStatusData(newDate);
          this.firstComeIn = false;
        } else {
          var date_django = newDate.year() + "/" + month_short_name[newDate.month()] + "/" + newDate.date();
          if(this.options.reportType=='daily'){
            if(this.options.isTeam){
              redirectToUrl = app.config.urlPrefix + '/organizations/' + app.config.organizationId + '/workreport/daily/team/report/' + date_django + '/';
            } else { // mine
              redirectToUrl = app.config.urlPrefix + '/organizations/' + app.config.organizationId + '/workreport/daily/'+ this.options.reportUser +'/' + date_django + '/';
            }
          }
          this.ui.datePicker.maskLoading();
          window.location.href = redirectToUrl;
        }

      }, this));
      this.ui.datePicker.on("dp.update", _.bind(function(e) { // Next and Previous buttons, selecting a year.
        var change = e.change, viewDate  = e.viewDate ;
//        console.log(change);
//        console.log(viewDate);
        if(change=='M'){
          this._getMonthCompleteStatusData(viewDate);
        }
      }, this));

      this.ui.datePicker.datetimepicker(datePickerSettings);
      this.ui.datePicker.data("DateTimePicker").date(moment(date));

      this.ui.datePicker.find('.datepicker-days').on("click", 'td.day.active', _.bind(function(e) { // day change
        e.stopPropagation();
      }, this));
    },

    _getMonthCompleteStatusData: function(date, async) {
      var self = this;
      var sync = typeof async !== 'undefined' ? async : false;
      var isTeam = this.options.isTeam?1:0;
      var d = {
          year: date.year(),
          month: date.month()+1,
          day: 1,
          isTeam: this.options.isTeam?1:0,
          reportType: this.options.reportType
      };
      if(!isTeam) {
        d['reportUser'] = this.options.reportUser
      }
      $.ajax({
        dataType: "json",
        url: this.options.pollStatisticUrl,
        async: sync,
        data: d,
        success: function(data) {
            self._addClassDom(data.calendar);
        }
      });
    },
    close: function() {
        this.ui.datePicker.data("datetimepicker") && this.ui.datePicker.data("datetimepicker").remove()
    },

    subtaskTpl: function(data) {
      return '<li class="list-group-item subtask">'+
                '<div class="checkbox-custom checkbox-primary">'+
                  '<h4 class="title list-group-item-heading"><i class="c-green fa fa-check"></i> <span class="title-content">' + data.title + '</span></h4>'+
                  '<strong class="hour text-truncate list-group-item-text" data-val="'+ data.hour +'">' + data.hour + ' Hours</strong>'+
                '</div>'+
                '<div class="subtask-editor">'+
                  '<div class="form-inline">'+
                    '<div class="form-group">'+
                      '<select class="form-control subtask-hour">'+
                        '<option value="0">0 hour</option>'+
                        '<option value="1">1 hour</option>'+
                        '<option value="2">2 hours</option>'+
                        '<option value="3">3 hours</option>'+
                        '<option value="4">4 hours</option>'+
                        '<option value="5">5 hours</option>'+
                        '<option value="6">6 hours</option>'+
                        '<option value="7">7 hours</option>'+
                        '<option value="8">8 hours</option>'+
                      '</select>'+
                    '</div>'+
                    '<div class="form-group">'+
                      '<input class="form-control subtask-title" type="text" name="title">'+
                    '</div>'+
                    '<div class="form-group">'+
                      '<button class="btn btn-primary subtask-editor-save" type="button">Save</button>'+
                      '<a class="btn btn-sm btn-white subtask-editor-delete" href="javascript:void(0)">Delete</a>'+
                    '</div>'+
                  '</div>'+
                '</div>'+
              '</li>';

    },

    handleTeamStatisticBar: function() {
      var randomScalingFactor = function(){
	      return Math.round(Math.random()*100);
	    };
      var $static_el = $('#statistic-canvas-bar').closest('.team-submition-statistic');
      var not_submit_count = $static_el.data('not-submit-count');
      var submit_count = $static_el.data('submit-count');
      var barChartData = {
	  		labels : [gettext("Not submit"),gettext("Submit Yet")],
	  		datasets : [
	  			{
	  				fillColor : "rgba(220,220,220,0.5)",
	  				strokeColor : "rgba(220,220,220,0.8)",
	  				highlightFill: "rgba(220,220,220,0.75)",
	  				highlightStroke: "rgba(220,220,220,1)",
	  				data : [not_submit_count,submit_count]
	  			}
	  		]
	  	};
      var pieChartData = [
    {
        value: not_submit_count,
        color:app.utils.colors("red", 500),
        highlight: app.utils.colors("red", 600),
        label: gettext("Not submit")
    },
    {
        value: submit_count,
        color: app.utils.colors("green", 300),
        highlight: app.utils.colors("green", 400),
        label: gettext("Submit Yet")
    }
];
      var ctx = document.getElementById("statistic-canvas-bar").getContext("2d");
      var ctx_pie = document.getElementById("statistic-canvas-pie").getContext("2d");
	    var chart = new Chart(ctx).Bar(barChartData, {
	  		responsive: true,
	      barShowStroke: false
	  	});
	    var pie = new Chart(ctx_pie).Doughnut(pieChartData, {
	  		responsive: true
	  	});
      chart.datasets[0].bars[0].fillColor = app.utils.colors("red", 500);
      chart.datasets[0].bars[1].fillColor = app.utils.colors("green", 300); //bar 1
      chart.datasets[0].bars[0].highlightFill = app.utils.colors("red", 600);
      chart.datasets[0].bars[1].highlightFill = app.utils.colors("green", 400); //bar 2
      chart.update();
    },

    handleSubtasks: function() {
        var self = this;
        $(document).on("click", ".subtask-toggle", function() {
            var length = $(".subtask").length,
            $input = $(".subtasks-add .subtask-title"),
            $subtasks = $(".subtasks");
            $input.val(""),
            0 === length && $subtasks.addClass("is-show"),
            $subtasks.addClass("is-edit"),
            $input.focus(),
            $(document).on("click.subtask-add",
            function(e) {
                var $target = $(e.target);
                0 === $target.closest($(".subtasks-add")).length && ($subtasks.removeClass("is-edit"), $(document).off("click.subtask-add"))
            })
        }),
        $(document).on("click", ".subtask-add-save", function() {
            var length = $(".subtask").length,
            $subtasks = $(".subtasks"),
            $input = $(".subtasks-add .subtask-title"),
            $input_hour = $(".subtasks-add .subtask-hour"),
            cost_hour = $input_hour.val(),
            value = $input.val();
            if (0 === value.length) 0 === length && $subtasks.removeClass("is-show");
            else {
                var data = {
                    title: value,
                    hour: cost_hour
                },
                $subtask = $(self.subtaskTpl(data));
                $(".subtasks-list").append($subtask)
            }
            $input.val("").focus()
        }),
        $(document).on("click", ".subtask-add-cancel", function() {
            $(".subtasks").removeClass("is-edit"),
            $(document).off("click.subtask-add")
        }),
        $(document).on("click", ".subtask input", function() {
            var $this = $(this),
            $subtask = $this.closest(".subtask"),
            index = $subtask.index();
        }),
        $(document).on("click", ".subtask .title", function() {
            var $this = $(this),
            $subtask = $this.closest(".subtask"),
            subtask_content = $(".title-content", $subtask).html(),
            $input = $(".subtask-title", $subtask);
            $subtask.addClass("is-edit"),
            $input.val("").focus().val(subtask_content),
            $(document).on("click.subtask", function(e) {
                var $target = $(e.target);
                0 === $target.closest($subtask).length && ($subtask.removeClass("is-edit"), $(document).off("click.subtask"))
            })
        }),
        $(document).on("click", ".subtask-editor-save", function() {
            var $this = $(this),
            $subtask = $this.closest(".subtask"),
            title = $(".subtask-title", $subtask).val(),
            hour = $(".subtask-hour", $subtask).val();
            $(".title-content", $subtask).html(title),
            $(".hour", $subtask).html(hour + " hours"),
            $(".hour", $subtask).data('val', hour),
            $subtask.removeClass("is-edit"),
            $(document).off("click.subtask")
        }),
        $(document).on("click", ".subtask-editor-delete", function(e) {
            var $this = $(this);
          swal({   title: "Are you sure?",
                 text: "Your will not be able to recover it!",
                 type: "warning",
                 showCancelButton: true,
                 confirmButtonColor: "#DD6B55",
                 confirmButtonText: "Yes, delete it!",
                 closeOnConfirm: false
          }, function () {
            var $subtask = $this.closest(".subtask");
            $subtask.remove(),
            $(document).off("click.subtask"),
            0 === $(".subtask").length && $(".subtasks").removeClass("is-show");
            swal.close();
          });
        })
    },

    handleReportEdit: function() {
      $(document).on('click', '.edit-report', _.bind(function(e){
        e.preventDefault();
        var $this = $(e.currentTarget);
        var $container = $this.closest('.report-container');
        var $container_body = $container.find('.report-body');
        var $edit_box = $container.find('.report-edit-box');
        var url = $this.data('url');
        $container_body.maskLoading();
        $.get(url, function(data){
          var $h = $(data);
          $h.find('textarea.need-editor').each(function(index, dom){
            new Simditor({
              textarea: $(dom),
              placeholder: 'Input anything what you want to tell your manager...',
              toolbar: ['title', 'bold', 'italic', 'color', '|', 'ol', 'ul', 'code', 'table', '|', 'link', 'image', 'hr', '|', 'indent', 'outdent', 'alignment'],
              pasteImage: true,
              defaultImage: 'assets/images/image.png'
            });
          });
          $container_body.addClass('is-editing');
          $edit_box.html($h);
        }).always(function(){
          $container_body.unmaskLoading();
        });
      }, this));

      $(document).on('keyup', '.code-content', _.bind(function(e){
        var $this = $(e.currentTarget);
        var lines = $this.val().split(/\r|\r\n|\n/);
        var count = 0;
        for(var i=0;i<lines.length;i++){
          if($.trim(lines[i])!=""){
            count ++;
          }
        }
        $this.closest('.form-group').find('.code-line-num strong').html(count);
      }, this));

      $(document).on('click', '.cancel-report-edit', _.bind(function(e){
        e.preventDefault();
        var $this = $(e.currentTarget);
        var $container = $this.closest('.report-container');
        var $container_body = $container.find('.report-body');
        var $edit_box = $container.find('.report-edit-box');
        swal({
          title: "Are you sure?",   text: "If you have done some change, it will lost!",   type: "warning",
          confirmButtonColor: "#DD6B55",   confirmButtonText: "Yes!",   cancelButtonText: "No!",
          showCancelButton: true,
          closeOnConfirm: false,
          showLoaderOnConfirm: true
        }, function () {
          $edit_box.find(".simditor").data("simditor").destroy();
          $edit_box.html('');
          $container_body.removeClass('is-editing');
          swal.close();
        });
      }, this));

      $(document).on('click', '.report-submit', _.bind(function(e){
        e.preventDefault();
        var $this = $(e.currentTarget);
        var $container = $this.closest('.report-container');
        var $container_body = $container.find('.report-body');
        var $edit_box = $container.find('.report-edit-box');

        var is_ok = false;

        var report_desc = $edit_box.find(".simditor").data("simditor").getValue();
        console.log(report_desc);
        var code_content = $edit_box.find('textarea[name="code_content"]').val();
        var $subtask = $('.subtask', $edit_box);
        var subtasks = [];
        $subtask.each(function(index, el){
          if($.trim($(el).find('.title-content').html())){
            is_ok = true;
          }
          var subtask = JSON.stringify({
            content: $(el).find('.title-content').html(),
            hour: $(el).find('.hour').data('val')
          });
          subtasks.push(subtask);
        });
        if($.trim(report_desc)){
          is_ok = true;
        }

        if(is_ok){
          $container_body.maskLoading();
          $.post($this.data('url'), {
            'report_desc': report_desc,
            'code_content': code_content,
            'tasks[]': subtasks
          }, function(res, textStatus, jqXHR){
            location.href = res.redirect_url;
          });
        } else {
          swal("Can not Submit", "Please input some content, and then submit :)", "error");
        }
      }, this));
    }
  });

  app.DailyReportListPage = WorkReportBasePage.extend({

  });
  
  app.OrganizationPage = BasePage.extend({
    initialize: function (data) {
      BasePage.prototype.initialize.apply(this, arguments);


          var t = $(".project");
          t.each(function(t, e) {
            
            var n, i = $(e).find(".add-more"),
            s = i.siblings(".menu");
            i.click(function(t) {
              t.preventDefault()
            }),
            $(e).on("mouseenter", ".add-more, .menu",
            function() {
              clearTimeout(n),
              n = null,
              s.addClass("active")
            }),
            $(e).on("mouseleave", ".add-more, .menu",
            function() {
              n = setTimeout(function() {
                s.removeClass("active")
              },
              400)
            })
          })
    }
  });

  app.SummaryPage = BasePage.extend({
    /*initialize: function (data) {
      BasePage.prototype.initialize.apply(this, arguments);
      this.timelineView = new app.TimelineView({
          userId: this.userId,
          year: this.year,
          type: this.type,
          serialNumber: this.serialNumber,
          container: "#reports-left"
      });
      this.render();
    },

    render: function() {
      this.timelineView.render();
    }*/

    initialize: function(c) {
        this.userId = c.userId;
        this.year = c.year;
        this.type = c.type;
        this.serialNumber = c.serialNumber;
        this.editable = c.editable;
        this.pageKey = "workreportpage";
        this.template = "workreport.workreportpage";
        this.pageActive = "workreport";
        this.mainView && (this.year = this.year ? this.year : $(".reports-panel").data("year"), this.type = this.type ? this.type : $(".reports-panel").data("type"), this.serialNumber = this.serialNumber ? this.serialNumber : $(".reports-panel").data("serialNumber"), this.mainView.update(this.userId, this.year, this.type, this.serialNumber, this.editable))
    },
    delegateEvents: function() {
        this.on("synTimeLine",
            function(c) {
                this.mainView.timelineView.genTimeLineByYear(c.year, c.week, c.month)
            });
        this.on("unreadCount",
            function() {
                this.mainView.getUnreadCount()
            })
    },
    render: function() {
        /*this.initLayout({
            flag: !1
        });*/
        $(".aside").find("li.j_mine").addClass("active");
        $(".goto-top").remove();
        this.mainView = new app.views.WorkReportView({
            userId: this.userId,
            year: this.year,
            type: this.type,
            serialNumber: this.serialNumber,
            editable: this.editable
        });
        this._render();
        this.subView = new app.views.WorkReportContentView({
            userId: this.userId,
            year: this.year,
            type: this.type,
            serialNumber: this.serialNumber,
            editable: this.editable,
            container: "#reports-right"
        });
        this._renderSubview()
    },
    renderSubview: function() {
        this.mainView && (this.year = this.year ? this.year : $(".reports-panel").data("year"), this.type = this.type ? this.type : $(".reports-panel").data("type"), this.serialNumber = this.serialNumber ? this.serialNumber : $(".reports-panel").data("serialNumber"), this.mainView.update(this.userId, this.year, this.type, this.serialNumber, this.editable));
        this.subView = new d({
            userId: this.userId,
            year: this.year,
            type: this.type,
            serialNumber: this.serialNumber,
            editable: this.editable,
            container: "#reports-right"
        });
        this._renderSubview()
    }
  });

  Backbone.sync = function (method, model, success, error) {
    success();
  };
}(window, app, Backbone, jQuery, _, moment));
