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
    _render: function (el) {
      $(".modal-backdrop,.modal").remove();
      if(el) {
        $(el).parents("aside.aside").find(".active").removeClass("active");
        $(el).addClass("active");
        if($("body").find(".aside-nav").data("nav")) {
          $(".aside-nav>li>ul").find(".active").parents(".sub-nav").show().prev().addClass("on");
        }
        $("body").trigger("sideNav");
      }
      this.mainView.render();
    },
    _renderSubview: function () {
      var self = this;
      if (this.mainView.subView = this.subView) {
        this.subView.on("all", function (event, data) {
          self.trigger(event, data);
        });
        this.subView.render();
      }
    },
    initLayout: function (d, c) {
      $(this.el);
      $("body").trigger("slideClose");
      var b = false;
      var a = "j_modnav-" + this.pageActive;
      $("#navigation .j_nav_ul li").removeClass("active");
      var e = $("#navigation .j_nav_ul .j_baseautolis li");
      for (var h = 0, g = e.length; h < g; h++) {
        if ($(e[h]).find("a").hasClass(a)) {
          b = true;
          break;
        }
      }
      if(b) {
        $("#navigation").find(".j_modnav-" + this.pageActive).parent().addClass("active");
        $("#navigation .j_activeli").empty()
      } else {
        b = $(".j_pageActive").find(".j_modnav-" + this.pageActive).clone();
        b.find("span").eq(1).remove();
        $("#navigation .j_activeli").addClass("active").html(b || "");
      }
      if(null == this.pageActive) {
        $("#navigation .j_activeli,#navigation .j_homeli").removeClass("active")
      } else {
        if("portal" == this.pageActive) {
          $("#navigation .j_activeli").removeClass("active");
          $("#navigation .j_homeli").addClass("active");
        } else {
          $("#navigation .j_activeli").addClass("active");
          $("#navigation .j_homeli").removeClass("active");
        }
      }
      this.browserTit();
      if(this.template) {
        $("#mainContainer").html(app.utils.template(this.template, d));
        /*app.config.blogUser*/'' && c && c();
        if(app.config.noSubordinates) {
          $("#mainContainer").find(".j_subordinates,.j_subordinate").remove();
        }
        if(null != this.userId && this.userId != app.config.currentUser.id) {
          $("#mainContainer").find(".aside-nav>li").not(":first").remove();
        }
      }
      if(0 < $(".aside-nav-scroll:not(.mCustomScrollbar)").length) {
        app.utils.layout(".aside-nav-scroll", [{
          gotoTopButton: false
        }]);
      }
    },
    browserTit: function () {
      var d, c = $(".j_pageActive").find(".j_modnav-" + this.pageActive + " span:eq(0)").text() || "cobra";
      var oldbt = document.title;
      d = oldbt.slice(oldbt.indexOf(" - "));
      c && (document.title = "portal" == this.pageActive || null == this.pageActive ? "cobra" + d : c + d);
      if (this.isPrintPage) switch (this.pageKey) {
        case "flow":
          document.title = "w" + d;
          break;
        case "task":
          document.title = "t" + d;
          break;
        case "workreport":
          document.title = "w" + d
      }
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
      var localLocale = moment;
      localLocale.locale('en');
      var month_short_name = localLocale.monthsShort();
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
	  		labels : ['未提交', '已提交'],
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
        label: '未提交'
    },
    {
        value: submit_count,
        color: app.utils.colors("green", 300),
        highlight: app.utils.colors("green", 400),
        label: '已提交'
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
    initialize: function(data) {
      this.userId = data.userId;
      this.year = data.year;
      this.type = data.type;
      this.serialNumber = data.serialNumber;
      this.editable = data.editable;
      this.pageKey = "workreportpage";
      this.template = "workreport.workreportpage";
      this.pageActive = "workreport";
      if(this.mainView) {
        this.year = this.year ? this.year : $(".reports-panel").data("year");
        this.type = this.type ? this.type : $(".reports-panel").data("type");
        this.serialNumber = this.serialNumber ? this.serialNumber : $(".reports-panel").data("serialNumber");
        this.mainView.update(
          this.userId,
          this.year,
          this.type,
          this.serialNumber,
          this.editable
        );
      }
    },
    delegateEvents: function() {
      this.on("synTimeLine", function(res) {
        this.mainView.timelineView.genTimeLineByYear(res.year, res.week, res.month);
      });
      this.on("unreadCount", function() {
        this.mainView.getUnreadCount();
      });
    },
    render: function() {
      this.initLayout({
          flag: false
      });
      $(".aside").find("li.j_mine").addClass("active");
      $(".goto-top").remove();
      this.mainView = new app.WorkReportView({
        userId: this.userId,
        year: this.year,
        type: this.type,
        serialNumber: this.serialNumber,
        editable: this.editable
      });
      this._render();
      this.subView = new app.WorkReportContentView({
        userId: this.userId,
        year: this.year,
        type: this.type,
        serialNumber: this.serialNumber,
        editable: this.editable,
        container: "#reports-right"
      });
      this._renderSubview();
    },
    renderSubview: function() {
      if(this.mainView) {
        this.year = this.year ? this.year : $(".reports-panel").data("year");
        this.type = this.type ? this.type : $(".reports-panel").data("type");
        this.serialNumber = this.serialNumber ? this.serialNumber : $(".reports-panel").data("serialNumber");
        this.mainView.update(
          this.userId,
          this.year,
          this.type,
          this.serialNumber,
          this.editable
        );
      }
      this.subView = new app.WorkReportContentView({
        userId: this.userId,
        year: this.year,
        type: this.type,
        serialNumber: this.serialNumber,
        editable: this.editable,
        container: "#reports-right"
      });
      this._renderSubview();
    }
  });

  app.OrgPage = BasePage.extend({
    initialize: function(data) {
      this.id = data.id;
      this.type = data.type || "user";
      this.operation = data.operation;
      this.userOrg = data.userOrg;
      this.pageKey = this.type;
      this.creator = data.creator;
      if("department" == this.type) {
        this.pageKey = "user";
      }
      this.template = "org.page";
      this.el = "#mainContainer"
    },
    delegateEvents: function() {
      $("#mainContainer").on("click.Messages", ".sub-nav li", function(a) {
        $(".sub-nav li").removeClass("active");
        $(this).addClass("active")
      });
      this.on("addNode", function(a) {
        this.mainView.addNode(a)
      });
      this.on("updateNode", function(a) {
        this.mainView.updateNode(a.propertyName, a.value)
      });
      this.on("updateGroup", function() {
        this.mainView.updateGroup()
      });
      this.on("deleteSelectedNode", function(a) {
        this.mainView.deleteSelectedNode(a)
      });
      this.on("rerenderTree", function() {
        this.mainView.render()
      })
    },
    render: function() {
      var e = this,
      c = this.el;
      this.initLayout({
        userId: app.config.currentUser.id
      });
      $(e.el).find(".aside-nav li.j_" + e.type).addClass("active");
      e.inviteView = new app.components.InviteView({
        container: c + " #org_container .j_main #invite-main-bd",
        type: "inline",
        callback: function(a) {
          e.mainView.loadInviteInfo && e.mainView.loadInviteInfo(a, "prepend")
        }
      });
      $(e.inviteView.container).find("#invite-cancel").addClass("hide");
      switch (e.type) {
        case "user":
          $(e.el).find("#org-main-bd").hasClass("hide") && $(e.el).find("#org-main-bd").removeClass("hide");
          $(e.el).find("#invite-main-bd").addClass("hide");
          this.mainView = new app.org.DepartmentTreeView({
            id: this.id,
            type: e.type,
            el: c + " #org_container .j_main .org-left-col",
            operation: this.operation
          });
          this._render();
          this.renderSubview();
          break;
        case "invitation":
          $(e.el).find("#invite-main-bd").hasClass("hide") && $(e.el).find("#invite-main-bd").removeClass("hide"),
          $(e.el).find("#org-main-bd").addClass("hide"),
          this.mainView = new b({
            container: c + " #org_container .j_main #invite-members .invite-view-wrapper"
          }),
          this._render()
      }
    },
    renderSubview: function() {
      var a = this.el,
        b = this.id,
        m = this.type,
        k = this.userOrg,
        f = this.creator;
      if("user" == m) {
        this.subView = new app.org.UserView({
          id: b,
          operation: this.operation,
          el: a + " #org_container .j_main .org-right-col",
          editable: !0,
          userOrg: k,
          isDepartment: !0,
          creator: f
        });
      } else if("department" == m) {
        this.subView = new app.org.DepartmentView({
          id: this.id,
          el: a + " #org_container .j_main .org-right-col",
          operation: this.operation
        });
      }
      this._renderSubview();
    },
    undelegateEvents: function() {
      $(window).off("resize.OrgPage");
    }
  });

  app.TaskPage = BasePage.extend({
    initialize: function(options) {
      this.userId = options.userId;
      this.id = options.id;
      this.pageKey = options.pageKey || "mine";
      this.type = options.type;
      this.template = "task.taskpage";
      this.el = "#mainContainer";
      this.pageActive = "task";
      this.options = options || {};
    },
    delegateEvents: function() {
      $(this.el);
      this.on("beforeOpen", function(e) {
        if(this.mainView && typeof this.mainView.beforeOpenTask == "function") {
          this.mainView.beforeOpenTask(e);
        }
      });
      this.on("create", function(e) {
        this.mainView.insertTask(e);
      });
      this.on("remove", function(e) {
        this.mainView.removeTask(e);
      });
      this.on("changeStatus", function(e) {
        this.mainView.changeStatus(e.id, e.status);
      });
      this.on("changeWatch", function(e) {
        this.mainView.changeWatch(e.id, e.watched);
      });
      this.on("changeTitle", function(e) {
        this.mainView.changeTitle(e.id, e.title);
      });
      this.on("changeBeginDate", function(e) {
        this.mainView.changeBeginDate(e);
      });
      this.on("changeDuedate", function(e) {
        this.mainView.changeDuedate(e);
      });
      this.on("changeManager", function(e) {
        this.mainView.changeManager(e.manager, e.id);
      });
      this.on("changeSubtaskStatus", function(id, status) {
        this.subView.subtaskView.changeStatus(id, status);
      });
    },
    render: function() {
      var self = this;
      $(self.el);
      self.initLayout({
        userId: this.options.userId ? this.options.userId: app.config.currentUser.id,
        self: !this.options.userId || this.options.userId == app.config.currentUser.id,
        isAdmin: app.config.currentUser.admin
      }, function() {
        self.renderType()
      });
      if("calendar" == self.type) {
        self.mainView = new c({
          userId: this.userId,
          container: "#j_taskcenter"
        });
      } else if("feedback" == self.type) {
        $(".j_feedback").addClass("active");
        self.mainView = new d({
          container: "#j_taskcenter",
          showtitle: "0",
          navs: [".charger", ".participants", "subordinatemodule", ".task-dynamic"],
          module: "task",
          moduleName: "任务",
          userId: this.userId,
          showReaded: "1",
          noscroll: true
        });
      } else if("recylce" == self.type) {
        $(".j_recycle").addClass("active");
        self.mainView = new b({
          container: "#j_taskcenter",
          userId: this.userId,
          module: "task"
        });
      } else if("taskstatistics" == self.type) {
        self.mainView = new e({
          el: "#j_taskcenter"
        });
      } else if("taskreport" == self.type) {
        self.mainView = new a({
          viewMode: "1",
          el: "#j_taskcenter"
        });
      } else if("taskform" == self.type) {
        self.mainView = new g({
          userId: this.userId,
          container: "#j_taskcenter"
        });
      } else {
        $(".aside").find(".sub-nav li.j_" + this.type).addClass("active");
        self.mainView = new app.task.MyTaskView({
          taskId: this.id,
          userId: this.userId,
          type: this.type
        });
      }
      self._render(".j_" + ("calendar" == this.type ? "all": this.type));
    },
    renderType: function() {
      var sex = "";
      if(app.config.blogUser) {
        sex = "female" == app.config.blogUser.sex ? "她": "他";
        $("#tasknav li").each(function() {
          var $this = $(this);
          var title = $this.data("title");
          if($this.hasClass("j_shareToMe")) {
            $this.find(".j_type-name").html("共享给" + sex + "的任务");
          } else {
            $this.find(".j_type-name").html(sex + title);
          }
        });
      } else {
        $("#tasknav li").each(function() {
          var $this = $(this);
          var title = $this.data("title");
          if($this.hasClass("j_mine")) {
            $this.find(".j_type-name").html("我" + title)
          } else {
            if(!$this.hasClass("j_subordinates") && !$this.hasClass("j_all")) {
              $this.find(".j_type-name").html(title);
            }
          }
        });
      }
    }
  });

  app.Page = Backbone.View.extend({
    initialize: function(options) {
      this.relogin = true;
      if(document.location.href && -1 == document.location.href.indexOf("print/")) {
        this.top = new app.components.Top();
        this.top.render();
      }
//    this.portalModel = new app.models.PortalModel;
    },
    delegateEvents: function() {
      var self = this;
      app.components.event.initEvent();
      $("body").on("click", ".wechat-toggle", function(e) {
        e.stopPropagation();
        var employee = $(this).data("employee");
        employee && employee.id == app.config.currentUser.id || !self.top.newmessage || (self.top.newmessage.openChatWindow(employee, "employee"), o.markMessageRead(self.type))
      });
      $("body").on("mouseenter", ".popover-toggle", function(e) {
        $(this).find(".popover-bottom").fadeTo(100, 1);
      }).on("mouseleave", ".popover-toggle", function(e) {
        $(this).find(".popover-bottom").fadeTo(0).hide();
      });
      $("body").off("click", "a.client-toggle").on("click", "a.client-toggle", function() {
        (new a).render();
      });
      $("body").on("click", ".advise-toggle", function(e) {
        (new y).render();
      });
      var keyCode = -1;
      $(document).off("keydown").on("keydown", function(e) {
        keyCode = e.keyCode;
        if(null == $(".modal-backdrop.fade.in").get(0) && 27 == keyCode) { //ESC
          self.initSlider({
            callBack: function(result) {
              if(result) {
                window.formJsonStr = null;
                $("body").trigger("slideClose");
              }
            }
          });
        }
      });
      $(window).off("beforeunload.dropdownmenu").on("beforeunload.dropdownmenu", function() {
        if (116 == keyCode) { // F5
          keyCode = -1;
        } else if (navigator.userAgent.toLowerCase().indexOf("firefox") == -1 && app.config.currentUser.loginCount && app.config.currentUser.loginCount < 1) {
          return "您可以通过快捷键Ctrl+D将cobra加入到收藏夹";
        }
      });
      $("body").off("triggerClose").on("triggerClose", function(e) {
        var path = location.pathname;
        var hash = location.hash;
        path = path.substring(0, path.lastIndexOf("/"));
        if("" == path && "" != hash) {
          path = "/" + hash.substring(1, hash.lastIndexOf("/"));
        }
        ROUTER.navigate(path, {
          trigger: true
        });
      });
      $("body").off("click", "a.pwd-toggle").on("click", "a.pwd-toggle", function() {
        var userId = $(this).attr("userId"),
          type = $(this).attr("type");
        (new v({
          userId: userId,
          type: type
        })).render();
      });
      $("body").off("click", "a.invite-toggle").on("click", "a.invite-toggle", function(e) {
        (new z).render();
      });
      $("body").off("click", "div.invite-toggle").on("click", "div.invite-toggle", function(e) {
        (new z).render();
      });
      $("body").off("click", "a.chat-history-toggle").on("click", "a.chat-history-toggle", function(e) {
        var chatType = $(this).data("chatType");
        if ("employee" == chatType) {
          var userId = $(this).data("targetId");
        } else if ("channel" == chatType) {
          var channelId = $(this).data("targetId");
        }
        (new A({
            userId: userId,
            channelId: channelId,
            chatType: chatType
        })).render();
      });
      $("body").off("click", "p.quick-invite-toggle").on("click", "p.quick-invite-toggle", function(e) {
        var userName = $(this).find("span").text();
        var inviteView = new D({
          userName: userName
        });
        inviteView.render();
        setTimeout(inviteView.focusInput, 200);
      });
      $("body").off("click", "a.upload-toggle").on("click", "a.upload-toggle", function() {
        (new x({})).renderBox();
      });
      $("body").off("click", ".share-join").on("click", ".share-join", function() {
        var entityId = $(this).attr("entityId"),
          module = $(this).attr("module");
        $.ajax({
          type: "post",
          dataType: "json",
          data: {
            entityId: entityId,
            module: module
          },
          url: "/blog-message/shareApply.json",
          success: function(a) {
            app.alert('success', '共享申请已发送');
          }
        });
      });
      $("body").on("click", ".j_entityslider-toggle", function(e) {
        var $this = $(this);
        $(this).parents(".unread").removeClass("unread");
        $(this).parents(".newComment").removeClass("newComment");
        self.initSlider({
          callBack: function(isOk) {
            if (isOk) {
              var barType = $this.attr("barType"),
                idList = $this.attr("idList"),
                mainlineId = $this.attr("mainlineId"),
                group = $this.attr("group"),
                checkDate = $this.attr("checkDate"),
                userName = $this.attr("userName"),
                module = $this.attr("data-module"),
                id = $this.attr("data-id"),
                userId = $this.attr("userId"),
                renderType = $this.attr("renderType"),
                tolink = $this.data("tolink"),
                formData = $this.attr("formData"),
                title = $this.attr("title"),
                formCreator = $this.attr("form-creator");
              $("body").trigger("slideOpen", {
                barType: barType,
                mainlineId: mainlineId,
                group: group,
                checkDate: checkDate,
                userName: userName,
                module: module,
                id: id,
                idList: idList,
                userId: userId,
                renderType: renderType,
                tolink: tolink,
                formData: formData,
                formTitle: title,
                formCreator: formCreator
              });
            }
          }
        });
      });
      $("body").off("slideOpen").on("slideOpen", function(e, data) {
        var barType = data.barType,
          mainlineId = data.mainlineId,
          group = data.group,
          checkDate = data.checkDate,
          userName = data.userName,
          module = data.module,
          id = data.id,
          idList = data.idList,
          userId = data.userId,
          renderType = data.renderType,
          slideCallback = data.slideCallback,
          tolink = data.tolink,
          formData = data.formData,
          formTitle = data.formTitle,
          formCreator = data.formCreator;
        if("task" == module && !$(this).hasClass("btn")) {
          $(this).addClass("active");
        }
        if(module && id) {
          if(self.entitySlider) {
            self.entitySlider.remove();
          }
          var es = new app.components.EntitySlider({
            barType: barType,
            mainlineId: mainlineId,
            group: group,
            checkDate: checkDate,
            userName: userName,
            module: module,
            id: id,
            idList: idList,
            userId: userId,
            renderType: renderType,
            page: self.lastPage,
            slideCallback: slideCallback,
            tolink: tolink,
            formData: formData,
            formTitle: formTitle,
            formCreator: formCreator
          });
          es.render();
          self.entitySlider = es;
        }
      });
      $("body").on("click", function(e) {
        var $target = $(e.target);
        if(null == $("#entitybox").get(0) && null == $(".modal-backdrop.fade.in").get(0)) {
          $target.hasClass("j_entityslider-toggle")
          || null != $target.parents(".j_entityslider-toggle").get(0)
          || $target.hasClass(".smwx-box")
          || null != $target.parents(".smwx-box").get(0)
          || null != $target.parents("body").get(0)
          && (
            $target.hasClass("filterSlip_js")
            || null == $target.parents(".filterSlip_js").get(0)
            && null == $target.parents(".ui-pnotify ").get(0)
            && null == $(".fancybox-overlay.fancybox-overlay-fixed").get(0)
            && $("#entitySlider").hasClass("in")
            && (
              $target.hasClass("fc-event-inner")
              || null != $target.parents(".fc-event-inner").get(0)
              || null != $target.parents("#j_content").get(0)
              || "j_content" == $target.context.id
              || "newAgenda" == $target.context.id
              || 0 < $(".js_stopExecute").size()
              || 0 == $target.closest("#entitySlider").length
              && self.initSlider({
                callBack: function(result) {
                  if(result) {
                    window.formJsonStr = null;
                    $("body").trigger("slideClose");
                  }
                }
              })
            )
          )
        }
      });
      $("body").off("slideClose").on("slideClose", function(e) {
        $("#entitySlider").removeClass("in");
        if(self.entitySlider) {
          self.entitySlider.remove();
        }
      });
      $("body").off("sideNav").on("sideNav", function() {
        $('.aside-nav[data-nav="fold"] li>div.link-item').each(function() {
          if(null != $(this).next(".sub-nav").get(0)) {
            $(this).css("cursor", "pointer");
          }
          $(this).append('<i class="icon-angle-down pull-right"></i>');
        });
        $("body").off("click", '.aside-nav[data-nav="fold"] li>div.link-item').on("click", '.aside-nav[data-nav="fold"] li>div.link-item', function(e) {
          var $parentLi = $(this).parent("li");
          var $subNav = $(this).next(".sub-nav");
          if(null != $subNav.get(0)) {
            if($subNav.is(":visible")) {
              $subNav.slideUp("fast");
              $(this).removeClass("on");
            } else {
              $subNav.slideDown("fast");
              $parentLi.siblings().find("div.link-item").removeClass("on").end().find(".sub-nav").slideUp("fast");
              $(this).addClass("on");
            }
          }
        });
      });
      $("#navigation").off("click", ".j_nav_ul a[class*='j_modnav-'], .j_nav_ul li.j_homeli a, #user-panel .j_user_menu_portal")
        .on("click", ".j_nav_ul a[class*='j_modnav-'], .j_nav_ul li.j_homeli a, #user-panel .j_user_menu_portal", function(e) {
        var $this = $(this);
        var href = $this.attr("href");
        var url = $this.data("url");
        if(href == url) {
          self.setConfig(app.config.currentUser.id, href);
        }
      });
    },
    initSlider: function(data) {
      var callBack = data.callBack;
      if (window.formJsonStr && $("body .form-view_js").get(0) && window.formPlugin) {
        var form = formPlugin.submitAssembleForm({
          parentEl: $("body .form-view_js")
        });
        JSON.stringify(form.formData.dataDetails) != window.formJsonStr ? app.utils.confirm("确定放弃填写审批表单吗？放弃后数据将不会被保存！", callBack) : callBack({
          result: true
        });
      } else {
        callBack({
          result: true
        });
      }
    },
    render: function(lastPage, pageKey) {
      if (null == this.lastPage) {
        this.lastPage = lastPage;
      } else if (this.lastPage.pageKey != lastPage.pageKey || pageKey) {
        this.lastPage.remove ? this.lastPage.remove() : this.lastPage.mainView && this.lastPage.mainView.remove();
        this.lastPage = lastPage;
      } else {
        this.update(lastPage);
        if(this.lastPage.subView) {
          this.lastPage.subView.remove();
          this.lastPage.renderSubview();
        }
        return;
      }
      this.lastPage.render();
      app.components.event.setLastPage(this.lastPage);
      $("body").trigger("rViewSlide");
      $(window).trigger("resize");
    },
    update: function(page) {
      this.lastPage.initialize(page);
      page.remove();
    },
    /*renderHome: function(a) {
        a || (a = app.config.currentUser.id);
        a != app.config.currentUser.id ? this.renderBlog(a) : (this.top && this.top.renderNavUrl(a), this.getDispalyConfig(a))
    },*/
    renderTask: function(userId, taskId) {
      if(!userId) {
        userId = app.config.currentUser.id;
      }
      var taskPage = new app.TaskPage({
        userId: userId,
        id: taskId,
        type: "mine"
      });
      this.top && this.top.renderNavUrl(userId, function() {
        taskPage.renderType()
      });
      this.render(taskPage);
    },
    renderTaskByType: function(userId, type) {
      if(!userId) {
        userId = app.config.currentUser.id;
      }
      type = type ? type : "mine";
      var taskPage = new app.TaskPage({
        pageKey: "task-" + type,
        userId: userId,
        type: type
      });
      this.top && this.top.renderNavUrl(userId, function() {
        taskPage.renderType()
      });
      this.render(taskPage);
    },
    /*renderWorkflow: function(a, c, d) {
        a || (a = TEAMS.currentUser.id);
        var e = new b({
            userId: a,
            id: c,
            formId: d
        });
        this.top && this.top.renderNavUrl(a,
            function() {
                e.renderType()
            });
        this.render(e)
    },
    renderNewWorkflow: function(a, c, d) {
        null == c || "new" == c && null == d ? this.renderWorkflow(a, c, d) : (a || (a = TEAMS.currentUser.id), a = new b({
            userId: a,
            id: c,
            formId: d
        }), this.render(a))
    },
    renderWorkflowByType: function(a, c, d) {
        a || (a = TEAMS.currentUser.id);
        var e = new b({
            userId: a,
            formId: d,
            searchType: c
        });
        this.top && this.top.renderNavUrl(a,
            function() {
                e.renderType()
            });
        this.render(e)
    },*/
    renderWorkReport: function(userId, year, type, serialNumber) { // Week report userId, year, type, serialNumber
      var editable = true, page;
      if(userId){
        editable = (userId == app.config.currentUser.id);
      } else {
        userId = app.config.currentUser.id;
      }
      page = new app.SummaryPage({
          userId: userId,
          editable: editable,
          year: year,
          type: type,
          serialNumber: serialNumber
      });
      this.top && this.top.renderNavUrl(userId);
      this.render(page);
    },
    /*renderWorkReportType: function(a, b, c) {
        var d;
        "comment" == a ? d = c ? "unreadworeportcomment" : "workreportcomment" : "replay" == a ? d = c ? "unreadworkreportreplay" : "workreportreplay" : "share" == a ? pagekey = "workreportshare" : d = "statistics" == a ? "workreportstatistics" : "unreadworkreport";
        a = new B({
            reportType: a,
            unreadFlag: c,
            pageKey: d,
            editable: "replay" == a || "unread" == a || "share" == a ? !1 : !0,
            id: b
        });
        this.render(a)
    },
    renderSearch: function(a, b, c, d) {
        a = new e({
            type: a,
            param: b,
            module: c,
            objId: d
        });
        this.top.renderNavUrl();
        this.render(a)
    },
    renderWatched: function(a, b) {
        var c = new K({
            type: "watched",
            module: a,
            objId: b
        });
        this.render(c)
    },
    renderUnfinish: function(a, b) {
        var c = new K({
            type: "unfinish",
            module: a,
            objId: b
        });
        this.top && this.top.renderNavUrl();
        this.render(c)
    },
    renderFeedSearch: function(a, b, c) {
        a = new h({
            type: a,
            module: b,
            objId: c
        });
        this.top && this.top.renderNavUrl();
        this.render(a)
    },*/
    renderOrganization: function(a, b, c, d, e) {
      a = new app.OrgPage({
          id: a,
          type: b,
          operation: c,
          userOrg: d,
          creator: e
      });
      this.top && this.top.renderNavUrl();
      this.render(a);
    },
    /*renderMyfollow: function(a, b) {
        a || (a = TEAMS.currentUser.id);
        var c = new P({
            pageKey: "myfollow",
            userId: a,
            active: "myfollow",
            type: b
        });
        this.top && this.top.renderNavUrl(a,
            function() {
                c.renderType()
            });
        this.render(c)
    },
    renderBlog: function(a, b, c, d) {
        a || (a = TEAMS.currentUser.id);
        a != TEAMS.currentUser.id && (TEAMS.subordinate || $.ajax({
            type: "get",
            url: "/users/subordinate/" + TEAMS.currentUser.id + ".json",
            dataType: "json",
            async: !1,
            success: function(a) {
                a = a.page.result;
                var b = [];
                if (a && 0 < a.length)
                    for (var c = 0; c < a.length; c++) b.push(a[c].employeeId);
                else b.push("");
                TEAMS.subordinate = b
            }
        }));
        var e = new k({
            userId: a,
            type: b,
            param: d,
            id: c
        });
        this.top && this.top.renderNavUrl(a,
            function() {
                e.renderType()
            });
        this.render(e)
    },
    renderInfo: function() {
        var a = new G({
            pageKey: "info"
        });
        this.top && this.top.renderNavUrl();
        this.render(a)
    },
    renderInfoByType: function(a) {
        a = new G({
            pageKey: a
        });
        this.render(a)
    },
    renderProfile: function(a, b) {
        var c = new H({
            userId: a,
            type: b
        });
        this.top && (this.top.renderNavUrl(a,
            function() {}), a && a != TEAMS.currentUser.id && $.ajax({
            url: "/base/employee/" + a + ".json",
            type: "get",
            dataType: "json",
            async: !1,
            success: function(a) {
                a.employee && !a.employee.followAndSub ? $(".j_basenav .j_blog_NoAuthority").addClass("hide") : $(".j_basenav .j_blog_NoAuthority").removeClass("hide")
            }
        }));
        this.render(c, !0)
    },
    documents: function(a, b, c, d) {
        a || (a = TEAMS.currentUser.id);
        var e = new p({
            userId: a,
            id: b,
            type: c,
            folderId: d
        });
        this.top && this.top.renderNavUrl(a,
            function() {
                e.renderType()
            });
        this.render(e, !0)
    },
    mainline: function(a, b, c) {
        var d = new J({
            pageKey: "mainline-" + (b ? b : "mine"),
            userId: a,
            id: c,
            filterType: b
        });
        this.top && this.top.renderNavUrl(a,
            function() {
                d.renderType()
            });
        this.render(d)
    },
    mainlinelink: function(a, b, c, d, e, f) {
        $("#" + b + " .j_goalname").tooltip("hide");
        var h = new n({
            id: b,
            userId: a,
            mainlineType: c,
            module: e,
            objId: f,
            filterType: d
        });
        this.top && this.top.renderNavUrl(a,
            function() {
                h.renderType()
            });
        this.render(h)
    },
    tag: function(a, b) {
        var c = new s({
            type: a,
            id: b
        });
        this.render(c)
    },
    messages: function(a, b) {
        var c = new h({
            type: a,
            module: "messages",
            param: b,
            newMessage: this.top.newmessage
        });
        this.top && this.top.renderNavUrl();
        this.render(c)
    },*/
    renderTaskreport: function(a) {
        a = new q({
            pageKey: "tasksreport",
            userId: a
        });
        this.render(a)
    },
    renderTaskreports: function(a) {
        a = new E({
            pageKey: "taskreport",
            userId: a,
            module: "task"
        });
        this.render(a)
    },
    renderTaskStatistics: function(a) {
        a = new E({
            userId: a,
            module: "taskstatistics"
        });
        this.render(a)
    },
    /*renderFlowreports: function() {
        var a = new E({
            pageKey: "flowreport",
            module: "flow"
        });
        this.render(a)
    },
    renderWorkhour: function() {
        var a = new E({
            pageKey: "workhourreport",
            module: "workhour"
        });
        this.render(a)
    },
    renderTimecard: function(a) {
        a = new E({
            pageKey: "timecardreport",
            userId: a,
            module: "timecard"
        });
        this.render(a)
    },
    renderBlogreports: function(a) {
        a = new E({
            pageKey: "blogreport",
            userId: a,
            module: "blog"
        });
        this.render(a)
    },
    renderLog: function(a, b) {
        a || (a = TEAMS.currentUser.id);
        var c = new E({
            pageKey: "log#" + b,
            userId: a,
            type: b,
            module: "log"
        });
        this.render(c)
    },
    wechats: function() {
        var a = new u({
            chatType: "unread",
            pageKey: "wechats"
        });
        this.render(a)
    },
    chat: function(a) {
        a = new u({
            id: a,
            pageKey: "chats"
        });
        this.render(a)
    },
    channel: function(a) {
        a = new u({
            id: a,
            chatType: "channel",
            pageKey: "channels"
        });
        this.render(a)
    },
    unreadfeedback: function(a, b) {
        var c = new w({
            userId: TEAMS.currentUser.id,
            module: a,
            id: b
        });
        this.render(c)
    },*/
    renderTasksCalendar: function(a) {
        a || (a = app.config.currentUser.id);
        a = new q({
            pageKey: "taskscalendar",
            userId: a
        });
        this.render(a)
    },
    /*versioninfo: function(a) {
        a = new G({
            pageKey: "versioninfo",
            type: a
        });
        this.top && this.top.renderNavUrl();
        this.render(a)
    },
    renderCalendar: function(a) {
        a = new C({
            userId: a
        });
        this.render(a)
    },
    renderForms: function(a, b, c) {
        a || (a = TEAMS.currentUser.id);
        var d = new R({
            type: b,
            userId: a,
            formId: c
        });
        this.top && this.top.renderNavUrl(a,
            function() {
                d.renderType()
            });
        this.render(d)
    },
    print: function(a, b) {
        var c = new I({
            pageKey: b,
            id: a
        });
        this.render(c)
    },
    invitation: function() {
        var a = new m({
            type: "invitation"
        });
        this.render(a)
    },
    showCrmPage: function(a) {
        var b = this,
            c = "",
            c = "develop" == TEAMS.runMode ? TEAMS.service.crm + "/static/js/crm-dev.js" : TEAMS.service.crm + "/static/js/crm.js?v=" + TEAMS.version;
        g.async(c,
            function() {
                b.lastPage && (b.lastPage.mainView && b.lastPage.mainView.remove(), b.lastPage.remove(), null == b.lastPage);
                if (!b.crmApp) {
                    var c = g("crm/CrmApp");
                    b.crmApp = new c
                }
                b.crmApp.showPage(a, b.top, b)
            })
    },*/
    setConfig: function(userId, url) {
      if (url && app.config.userConfig && userId == app.config.currentUser.id) {
        var portalModel = this.portalModel;
        var config = null;
        var flag = false;
        for (var i = 0; i < app.config.userConfig.length; i++) {
          config = app.config.userConfig[i];
          if ("system.menu.display" == config.configKey) {
            flag = true;
            var value = config.configValue;
            config.configValue = url;
            if(value != url) {
              portalModel.updateConfigValue(config);
            }
            break;
          }
        }
        if(!flag) {
          config = {
            configKey: "system.menu.display",
            configValue: url
          };
          portalModel.saveConfig(config, function() {
            app.config.userConfig.push(config)
          });
        }
      }
    }/*,
    getDispalyConfig: function(a) {
      if (a == TEAMS.currentUser.id && TEAMS.userConfig) {
          var b = this._getConfig("system.menu.display", a);
          if (b) {
              switch (b) {
                  case "/blog":
                      this.renderBlog(a);
                      break;
                  case "/workreport":
                      this.renderWorkReport(a);
                      break;
                  case "/workflows":
                      this.renderWorkflowByType(a);
                      break;
                  case "/mainlines":
                      this.mainline(a);
                      break;
                  case "/tasks":
                      this.renderTask(a);
                      break;
                  case "/calendar":
                      this.renderCalendar(a);
                      break;
                  case "/documents":
                      this.documents(a);
                      break;
                  case "/report/taskstatistics":
                      this.renderTaskStatistics(a);
                      break;
                  case "/info/wechat":
                      this.renderInfoByType("wechat");
                      break;
                  case "/info/wechatservice":
                      this.renderInfoByType("wechatservice");
                      break;
                  case "/forms":
                      this.renderForms(a);
                      break;
                  case "/crms/customer":
                      this.showCrmPage("customer");
                      break;
                  case "/crms/contact":
                      this.showCrmPage("contact");
                      break;
                  default:
                      a = new L({
                              userId: a,
                              pageKey: "portal"
                          }),
                          this.render(a)
              }
              ROUTER.navigate(b, {
                  trigger: !1
              })
          } else a = new L({
                  userId: a,
                  pageKey: "portal"
              }),
              this.render(a)
      }
    },
    _getConfig: function(a, b) {
        var c = null;
        return b != TEAMS.currentUser.id ? null : (c = TEAMS.userConfig.find(function(b) {
            return b.configKey == a
        })) ? c.configValue : null
    },
    syncData_channel: function() {
        $.ajax({
            type: "get",
            url: "/synchronizeddata/syncData.json",
            dataType: "json",
            success: function(a) {
                f.notify("更新完成")
            }
        })
    }*/
  });

  Backbone.sync = function (method, model, success, error) {
    success();
  };
}(window, app, Backbone, jQuery, _, moment));
