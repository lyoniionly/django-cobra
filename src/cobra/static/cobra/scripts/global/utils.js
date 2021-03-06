(function (app, jQuery, _, moment) {
  "use strict";

  var $ = jQuery;
  var number_formats = [
    [1000000000, 'b'],
    [1000000, 'm'],
    [1000, 'k']
  ];

  var _datetimeFrame = {
    defaults: {
      el: "input.datepicker",
      callback: function(ev) {},
      eventType: "focusin.datePicker"
    },
    init: function(data) {
      var options = [];
      $.isArray(data) ? options = data: options.push(data);
      for (var i = 0; i < options.length; i++) {
        var option = options[i];
        if ($.isFunction(option)) {
          var callback = option;
          option = {};
          option.callback = callback
        }
        option = $.extend(true, {}, this.defaults, option);
        (function(option) {
          var $el = $(option.el),
            format = $el.attr("format") || "yyyy-mm-dd",
            startView = $el.attr("startView") || "month",
            minView = $el.attr("minView") || "month",
            maxView = $el.attr("maxView") || "decade",
            position = $el.attr("position") || "bottom-right",
            dateGroup = $el.attr("dateGroup"),
            writeValue = $el.attr("writeValue"),
            insertAfter = $el.attr("insertAfter"),
            startDate = option.startDate || null,
            endDate = option.endDate || null,
            callback = option.callback;
          $el.each(function() {
            var $this = $(this);
            $this.on("focusin.datePicker", function() {
              $this.datetimepicker({
                format: format,
                language: "zh-CN",
                todayHighlight: true,
                todayBtn: dateGroup,
                autoclose: true,
                initialDate: new Date,
                startView: startView,
                minView: minView,
                maxView: maxView,
                pickerPosition: position,
                showMeridian: false,
                writeValue: writeValue,
                startDate: startDate,
                endDate: endDate
              }).on("show", function() {
                if(insertAfter && !$this.attr("relocated")) {
                  $this.data("datetimepicker").picker.insertAfter($this).css("position", "fixed");
                  $this.attr("relocated", true);
                }
              });
              $this.datetimepicker("show");
              $this.off("focusin.datePicker")
            }).on("changeDate", function(ev) {
              callback(ev);
            });
          });
        })(option);
      }
    },
    remove: function(e) {
      if (arguments) {
        for (var i = 0; i < arguments.length; i++) {
          $(arguments[i]).datetimepicker("remove");
        }
      }
    }
  };

  var scrollbar = {
    setLayout: function(a, b, c) {
      if (0 == a.indexOf("#print")) $(a).removeClass("scrollwrapper");
      else {
        var d = $(a);
        if (d) {
          var f = d.attr("height"),
          g = d.attr("auto-scroll");
          if (!f) var f = d.attr("marginbottom") || 0,
          q = d.offset().top,
          f = $(window).height() - q - f;
          if (null != d.parents("#entitybox").get(0)) var m = d.parents("#entitybox").find(".modal-content"),
          q = m.height(),
          m = m.offset().top,
          q = $(window).height() - q - m,
          f = f - q;
          q = d.attr("theme") ? d.attr("theme") : "minimal-dark";
          if (!d.hasClass("mCustomScrollbar")) {
            m = {
              onScroll: function() {
                $("body .goto-top").removeClass("hide")
              },
              onTotalScrollBack: function() {
                $("body .goto-top").addClass("hide")
              }
            };
            if (b) {
              $.isArray(b) && (c = b);
              c && !c[0].gotoTopButton && (m.onScroll = null, m.onTotalScrollBack = null);
              var s = $.extend(m, b)
            }
            b = {
              theme: q,
              callbacks: s ? s: m
            };
            if (c) var u = $.extend(b, c[0]);
            c && "x" == c[0].axis && (g = "yes");
            f && "yes" != g && d.css("height", f);
            d.mCustomScrollbar(u ? u: b);
            c && !c[0].bottomBlank && null != d.parents("#entitybox").get(0) && d.children().children(".mCSB_container").addClass("pb-0");
            "#chat-container" == a && (d.mCustomScrollbar("update"), d.mCustomScrollbar("scrollTo", "bottom"));
            setTimeout(function() {
              $("body .goto-top").addClass("hide")
            },
            200)
          }
        }
      }
    },
    destroy: function(a) {
      $(a).mCustomScrollbar("destroy")
    }
  };

  app.utils = {
    getQueryParams: function () {

      var vars = {},
        href = window.location.href,
        hashes, hash;

      if (href.indexOf('?') == -1)
        return vars;

      hashes = href.slice(href.indexOf('?') + 1, (href.indexOf('#') != -1 ? href.indexOf('#') : href.length)).split('&');
      $.each(hashes, function (_, chunk) {
        hash = chunk.split('=');
        if (!hash[0] && !hash[1])
          return;

        vars[decodeURIComponent(hash[0])] = (hash[1] ? decodeURIComponent(hash[1]).replace(/\+/, ' ') : '');
      });

      return vars;
    },

    floatFormat: function (number, places) {
      var multi = Math.pow(10, places);
      return parseInt(number * multi, 10) / multi;
    },

    formatNumber: function (number) {
      var b, x, y, o, p;

      number = parseInt(number, 10);

      for (var i = 0; (b = number_formats[i]); i++) {
        x = b[0];
        y = b[1];
        o = Math.floor(number / x);
        p = number % x;
        if (o > 0) {
          if (o / 10 > 1 || !p)
            return '' + o + y;
          return '' + this.floatFormat(number / x, 1) + y;
        }
      }
      return '' + number;
    },

    slugify: function (str) {
      str = str.replace(/^\s+|\s+$/g, ''); // trim
      str = str.toLowerCase();

      // remove accents, swap ñ for n, etc
      var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
      var to = "aaaaeeeeiiiioooouuuunc------";
      for (var i = 0, l = from.length; i < l; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
      }

      str = str.replace(/[^a-z0-9\s\-]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

      return str;
    },

    varToggle: function (link, $elm) {
      var $link = $(link);

      // assume its collapsed by default
      if (!$link.attr('data-expand-label'))
        $link.attr('data-expand-label', $link.html());

      $elm.toggle();
      if ($elm.is(':visible'))
        $link.html($link.attr('data-collapse-label'));
      else
        $link.html($link.attr('data-expand-label'));
    },

    getSearchUsersUrl: function () {
      return app.config.urlPrefix + '/api/' + app.config.teamId + '/users/search/';
    },

    getSearchProjectsUrl: function () {
      return app.config.urlPrefix + '/api/' + app.config.teamId + '/projects/search/';
    },

    getSearchTagsUrl: function () {
      return app.config.urlPrefix + '/api/' + app.config.teamId + '/' + app.config.projectId + '/tags/search/';
    },

    makeSearchableInput: function (el, url, callback, options) {
      $(el).select2($.extend({
        allowClear: true,
        width: 'element',
        initSelection: function (el, callback) {
          var $el = $(el);
          callback({id: $el.val(), text: $el.val()});
        },
        ajax: {
          url: url,
          dataType: 'json',
          data: function (term, page) {
            return {
              query: term,
              limit: 10
            };
          },
          results: function (data, page) {
            var results = callback(data);
            return {results: callback(data)};
          }
        }
      }, options || {}));
    },

    escape: function (str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },

    makeSearchableUsersInput: function (el) {
      this.makeSearchableInput(el, this.getSearchUsersUrl(), _.bind(function (data) {
        var results = [];
        $(data.results).each(_.bind(function (_, val) {
          var label;
          if (val.first_name) {
            label = this.escape(val.first_name) + ' &mdash; ' + this.escape(val.username);
          } else {
            label = this.escape(val.username);
          }
          label += '<br>' + this.escape(val.email);
          results.push({
            id: val.username,
            text: label
          });
        }, this));

        if (data.query && $(results).filter(function () {
          return this.id.localeCompare(data.query) === 0;
        }).length === 0) {
          results.push({
            id: this.escape(data.query),
            text: this.escape(data.query)
          });
        }

        return results;
      }, this), {
        escapeMarkup: function (s) {
          return s;
        }
      });
    },

    colors: function(name, level) {
      if ("primary" === name && (name = app.config.primaryColor, name || (name = "red")), "undefined" == typeof app.config.colors)
        return null;
      if ("undefined" != typeof app.config.colors[name]) {
        if (level && "undefined" != typeof app.config.colors[name][level])
          return app.config.colors[name][level];
        if ("undefined" == typeof level)
          return app.config.colors[name]
      }
      return null;
    },

    layout: function(a, b, d) {
      scrollbar.setLayout(a, b, d)
    },

    template: function(templateName, data) {
      var html = app.templates[templateName];
      return data ? _.template(html, data) : html;
    },
    
    confirm: function(txt, callback) {
      swal({
        title: "确定吗?",
        text: txt,
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "确认",
        cancelButtonText: "取消"
      }, function(isConfirm){
        if(callback) {
          callback(isConfirm);
        }
      });
    },
    uuid: function() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
      });
    },
    convert2Html: function(html) {
      return html ? html.replace(/\r\n|\n/g, "<br/>").replace(/[ ]/g, "&nbsp;") : html
    },
    getWeekDate: function(a) {
      a = a.clone().endOfISOWeek();
      return {
        year: a.getFullYear(),
        month: a.getMonth() + 1,
        week: 1 + Math.floor(a.daysSince(a.clone().beginningOfYear()) / 7)
      }
    },
    getWeeksOfYear: function(a) {
      var b = 0 == a % 4 && 0 != a % 100 || 0 == a % 400 ? 366 : 365;
      a = new Date(a, 11, 31);
      7 > a.getDay() && (b -= a.getDay());
      return Math.ceil(b / 7)
    },
    datepicker: function(data) {
      _datetimeFrame.init(data);
    }

  };

  $(function () {
    // Change all select boxes to select2 elements.
    /*$('.body select').each(function () {
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
    });*/

    // Update date strings periodically
    setInterval(function () {
      $('.pretty-date').each(function (_, el) {
        var $el = $(el);
        var dt = $el.data('datetime');
        if (dt) {
          var date = moment(dt);
          if (date) {
            $el.text(date.fromNow());
            $el.attr('title', date.format('llll'));
          }
        }
      });
    }, 5000);

    $('.simditor-content table').addClass('table');
  });

}(app, jQuery, _, moment));
