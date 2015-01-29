/*global Sentry:true*/

(function (app, Backbone, jQuery, moment) {
  "use strict";

  var $ = jQuery;

  app.waveLine = {

    render: function (el, options) {
      var $el = $('#wave-line');
      var url = $el.attr('data-api-url');
      var title = $(el).attr('data-title');
      var $spark = $el.find('.sparkline');

      $spark.height($el.height());

      $.ajax({
        url: $el.attr('data-api-url'),
        type: 'get',
        dataType: 'json',
        data: {

        },
        success: function (resp) {
          var data = [], maxval = 100;
          $spark.empty();
          $.each(resp.data, function (val) {
            data.push(val);
            if (val > maxval) {
              maxval = val;
            }
          });
          app.waveLine.createWaveline($spark, data, options);
        }
      });
    },

    createWaveline: function (el, points, options) {
      var $el = $(el),
        existing = $el.children(),
        maxval = 100,
        title, point, pct, child, point_width;

      if (options === undefined) {
        options = {};
      }

      var line_options = {
        showScale: false,
        showTooltips: false,
        scaleShowGridLines : false,
        pointDot : false
      };

      line_options = $.extend(line_options, options);

      for (var i = 0; i < points.length; i++) {
        point = points[i];
        if (typeof(point) !== "number") {
          points[i] = 0;
        }
        if (point > maxval) {
          maxval = point;
        }
      }

      // TODO: we should only remove nodes that are no longer valid
      var data = {
        labels: new Array(points.length),
        datasets: [
          {
            label: "",
            fillColor: "rgba(240,240,240,0.2)",
            strokeColor: "rgba(240,240,240,0.8)",
            data: points
          }
        ]
      };

      var ctx = $(el).get(0).getContext("2d");
      new Chart(ctx).Line(data, line_options);
    }

  };
}(app, Backbone, jQuery, moment));
