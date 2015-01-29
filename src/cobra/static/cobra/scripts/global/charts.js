/*global Sentry:true*/

(function (app, Backbone, jQuery, moment) {
  "use strict";

  var $ = jQuery;

  app.charts = {

    render: function (el, options) {
      var $el = $(el);
      var url = $el.attr('data-api-url');
      var title = $(el).attr('data-title');
      var unit = $(el).attr('data-unit');
      var $spark = $el.find('.sparkline');

      if (options === undefined) {
        options = {};
      }

      if(options.unit === undefined){
        options.unit = unit === undefined ? ' records' : ' '+unit;
      }

      $spark.height($el.height());

      $.ajax({
        url: $el.attr('data-api-url'),
        type: 'get',
        dataType: 'json',
        data: {
          since: $el.attr('data-since'),//new Date().getTime() / 1000 - 3600 * 24 * 7,
          until: $el.attr('data-until'),
          resolution: $el.attr('data-resolution')
        },
        success: function (resp) {
          var data = [], maxval = 10;
          $spark.empty();
          $.each(resp[app.config.jsonDataRoot], function (_, val) {
            var date = new Date(val[0] * 1000);
            data.push({
              y: val[1],
              label: moment(date).fromNow()
            });
            if (val[1] > maxval) {
              maxval = val[1];
            }
          });
          app.charts.createSparkline($spark, data, options);
        }
      });
    },

    createSparkline: function (el, points, options) {
      // TODO: maxval could default to # of hours since first_seen / times_seen
      var $el = $(el),
        existing = $el.children(),
        maxval = 10,
        title, point, pct, child, point_width;

      if (options === undefined) {
        options = {};
      }

      if(options.unit === undefined){
        options.unit = ' records';
      }

      for (var i = 0; i < points.length; i++) {
        point = points[i];
        if (typeof(point) === "number") {
          point = points[i] = {
            y: point
          };
        }
        if (point.y > maxval) {
          maxval = point.y;
        }
      }

      point_width = app.utils.floatFormat(100.0 / points.length, 2) + '%';

      // TODO: we should only remove nodes that are no longer valid
      for (i = 0; i < points.length; i++) {
        point = points[i];
        pct = app.utils.floatFormat(point.y / maxval * 99, 2) + '%';
        title = point.y + options.unit;
        if (point.label) {
          title = title + '<br>(' + point.label + ')';
        }
        if (existing.get(i) === undefined) {
          $('<a style="width:' + point_width + ';" rel="tooltip" title="' + title + '"><span style="height:' + pct + '">' + point.y + '</span></a>').tooltip({
            placement: options.placement || 'bottom',
            html: true,
            container: 'body'
          }).appendTo($el);
        } else {
          $(existing[i]).find('span').css('height', pct).text(point.y).attr('title', (point.label || point.y));
        }
      }
    }

  };

}(app, Backbone, jQuery, moment));
