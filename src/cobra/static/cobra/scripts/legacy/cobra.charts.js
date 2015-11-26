if (Cobra === undefined) {
    var Cobra = {};
}
(function(jQuery, moment){
    "use strict";

    var $ = jQuery;

    var average = function(a) {
        var r = {mean: 0, variance: 0, deviation: 0}, t = a.length;
        for (var m, s = 0, l = t; l--; s += a[l]);
        for (m = r.mean = s / t, l = t, s = 0; l--; s += Math.pow(a[l] - m, 2));
        r.deviation = Math.sqrt(r.variance = s / t);
        return r;
    };

    var percentile = function(a, nth) {
        a = a.sort();
        a.slice(0, a.length - Math.floor(nth / a.length));
        return average(a);
    };

    var timeUnitSize = {
        "second": 1000,
        "minute": 60 * 1000,
        "hour": 60 * 60 * 1000,
        "day": 24 * 60 * 60 * 1000,
        "month": 30 * 24 * 60 * 60 * 1000,
        "quarter": 3 * 30 * 24 * 60 * 60 * 1000,
        "year": 365.2425 * 24 * 60 * 60 * 1000
    };

    var tickFormatter = function (value, axis) {
        var d = moment(value);

        var t = axis.tickSize[0] * timeUnitSize[axis.tickSize[1]];
        var span = axis.max - axis.min;
        var fmt;

        if (t < timeUnitSize.minute) {
            fmt = 'LT';
        } else if (t < timeUnitSize.day) {
            fmt = 'LT';
            if (span < 2 * timeUnitSize.day) {
                fmt = 'LT';
            } else {
                fmt = 'MMM D LT';
            }
        } else if (t < timeUnitSize.month) {
            fmt = 'MMM D';
        } else if (t < timeUnitSize.year) {
            if (span < timeUnitSize.year) {
                fmt = 'MMM';
            } else {
                fmt = 'MMM YY';
            }
        } else {
            fmt = 'YY';
        }

        return d.format(fmt);
    };

    Cobra.charts = {};
    Cobra.charts.init = function(el){
      Cobra.charts.render(el);

      if($(el).hasClass('has-carousel')){
        var $parent = $(el).parent();
        var $control = $parent.find('.carousel-control');
        $control.on('click', function(e){
          e.preventDefault();
          var $this = $(this);
          $(el).attr('data-since', $this.attr('data-since'));
          $(el).attr('data-until', $this.attr('data-until'));
          $(el).maskLoading();
          Cobra.charts.render(el);
        });
      }
    };
    Cobra.charts.render = function(el){
        var $sparkline = $(el);

        var unit = $(el).attr('data-unit') || 'beats/minute';

        if ($sparkline.length < 1) {
            return; // Supress an empty chart
        }

        $.ajax({
            url: $sparkline.attr('data-api-url'),
            type: 'get',
            dataType: 'json',
            data: {
                since: $sparkline.attr('data-since'),//new Date().getTime() / 1000 - 3600 * 24 * 7,
                until: $sparkline.attr('data-until'),
                resolution: $sparkline.attr('data-resolution')
            },
            success: function(res){
                var data = res[app.config.jsonDataRoot];
                var inputs = [], avg, i, data_avg = [], p_95th;
              var has_prev = res['has_prev'];
              var has_next = res['has_next'];
                for (i = 0; i < data.length; i++) {
                    inputs.push(data[i][1]);

                    // set timestamp to be in millis
                    data[i][0] = data[i][0] * 1000;
                }
                p_95th = percentile(inputs);

                for (i = 0; i < data.length; i++) {
                    data_avg.push([data[i][0], p_95th.mean]);
                }

                var points = [
                    {
                        data: data,
                        color: 'rgba(86, 175, 232, 1)',
                        shadowSize: 0,
                        lines: {
                            lineWidth: 2,
                            show: true,
                            fill: false
                        }
                    },
                    {
                        data: data_avg,
                        color: 'rgba(244, 63, 32, .4)',
                        // color: '#000000',
                        shadowSize: 0,
                        dashes: {
                            lineWidth: 2,
                            show: true,
                            fill: false
                        }
                    }
                ];
                var options = {
                    xaxis: {
                       mode: "time",
                       tickFormatter: tickFormatter
                    },
                    yaxis: {
                       min: 0,
                       tickFormatter: function(value) {
                            if (value > 999999) {
                                return (value / 1000000) + 'mm';
                            }
                            if (value > 999) {
                                return (value / 1000) + 'k';
                            }
                            return value;
                       }
                    },
                    tooltip: true,
                    tooltipOpts: {
                        content: function(label, xval, yval, flotItem) {
                          console.log(label);
                            return yval + ' ' + unit + '<br>' + moment(xval).format('llll');
                        },
                        defaultTheme: false
                    },
                    grid: {
                        show: true,
                        hoverable: true,
                        backgroundColor: '#ffffff',
                        borderColor: '#DEE3E9',
                        borderWidth: 2,
                        tickColor: '#DEE3E9'
                    },
                    hoverable: false,
                    legend: {
                        noColumns: 5
                    },
                    lines: { show: false }
                };

                $.plot($sparkline, points, options);

                $(window).resize(function(){
                    $.plot($sparkline, points, options);
                });

              if($sparkline.hasClass('has-carousel')){
                var $parent = $sparkline.parent();
                var $left_btn = $parent.find('.left');
                var $right_btn = $parent.find('.right');
                if(has_prev){
                  $left_btn.removeClass('disabled');
                  $left_btn.attr('data-since', res['prev_since']);
                  $left_btn.attr('data-until', res['prev_until']);
                }else{
                  $left_btn.addClass('disabled');
                  $left_btn.attr('data-since', '');
                  $left_btn.attr('data-until', '');
                }
                if(has_next){
                  $right_btn.removeClass('disabled');
                  $right_btn.attr('data-since', res['next_since']);
                  $right_btn.attr('data-until', res['next_until']);
                }else{
                  $right_btn.addClass('disabled');
                  $right_btn.attr('data-since', '');
                  $right_btn.attr('data-until', '');
                }
              }

              $(el).unmaskLoading();

            }

        });
    };
}(jQuery, moment));
