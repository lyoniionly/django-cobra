(function (app, jQuery, _) {
  "use strict";

  var $ = jQuery;

  var pluginName, pluginClassName, pluginOptions, defaults, Message;

  pluginName = 'message';

  pluginClassName = pluginName + 'js';

  pluginOptions = {
    clickToHide: true,
    autoHide: true,
    autoHideDelay: 50000,
    className: 'info',
    showAnimation: 'slideDown',
    showDuration: 400,
    hideAnimation: 'slideUp',
    hideDuration: 200,
    container: '#messages',
    safe: false
  };

  defaults = function(opts) {
    return $.extend(pluginOptions, opts);
  };

  Message = (function() {
    function Message(data, options) {
      var type_display_map = {
        'danger': gettext("Danger: "),
        'warning': gettext("Warning: "),
        'info': gettext("Notice: "),
        'success': gettext("Success: "),
        'error': gettext("Error: ")
      }, type_display;
      if (typeof options === 'string') {
        type_display = type_display_map[options];
        options = {
          className: options === 'error' ? 'danger' : options
        };
      }
      this.options = app.utils.inherit(pluginOptions, $.isPlainObject(options) ? options : {});
      type_display = type_display || type_display_map[this.options.className];
      this.options.className = this.options.className === 'error' ? 'danger' : this.options.className;

      var template = _.template(app.templates.alert_message),
      params = {
        "type": this.options.className,
        "type_display": type_display,
        "message": data,
        "safe": this.options.safe
      };
      this.wrapper = $(template(params));
      if (this.options.clickToHide) {
        this.wrapper.addClass("" + pluginClassName + "-hidable");
      }
      this.wrapper.data(pluginClassName, this);
      this.wrapper.hide();
      this.run();
    }

    Message.prototype.show = function(show, userCallback) {
      var args, callback, elems, fn, hidden,
        _this = this;
      callback = function() {
        if (!show) {
          _this.destroy();
        }
        if (userCallback) {
          return userCallback();
        }
      };
      hidden = this.wrapper.parents(':hidden').length > 0;
      elems = this.wrapper;
      args = [];
      if (hidden && show) {
        fn = 'show';
      } else if (hidden && !show) {
        fn = 'hide';
      } else if (!hidden && show) {
        fn = this.options.showAnimation;
        args.push(this.options.showDuration);
      } else if (!hidden && !show) {
        fn = this.options.hideAnimation;
        args.push(this.options.hideDuration);
      } else {
        return callback();
      }
      args.push(callback);
      return elems[fn].apply(elems, args);
    };

    Message.prototype.setPosition = function() {
      var anchor, css;

      if(this.options.container && $(this.options.container).length > 0) {
        anchor = $(this.options.container);
      } else {
        anchor = app.utils.createElem("div");
        css = {
          top: 0,
          right: 0
        };
        anchor.css(css).addClass("" + pluginClassName + "-corner");
        if(this.options.container){
          anchor.attr('id', this.options.container)
        }
        $("body").append(anchor);
      }
      return anchor.prepend(this.wrapper);
    };

    Message.prototype.run = function(options) {
      var d, datas, name, type, value,
        _this = this;
      if ($.isPlainObject(options)) {
        $.extend(this.options, options);
      } else if ($.type(options) === 'string') {
        this.options.className = options === 'error' ? 'danger' : options;
      }
      this.setPosition();
      this.show(true);
      if (this.options.autoHide) {
        clearTimeout(this.autohideTimer);
        return this.autohideTimer = setTimeout(function() {
          return _this.show(false);
        }, this.options.autoHideDelay);
      }
    };

    Message.prototype.destroy = function() {
      return this.wrapper.remove();
    };

    return Message;

  })();

  app.alert = function (type, message, extra_tags) {
    var safe = false;
    // Check if the message is tagged as safe.
    if (typeof(extra_tags) !== "undefined" && $.inArray('safe', extra_tags.split(' ')) !== -1) {
      safe = true;
    }
    /*new Message(message, {
      className: type,
      safe: safe
    });*/
    toastr[type](message);
  };

  app.clearErrorMessages = function() {
    $('#messages .alert.alert-danger').remove();
  };

  app.clearSuccessMessages = function() {
    $('#messages .alert.alert-success').remove();
  };

  app.clearAllMessages = function() {
    app.clearErrorMessages();
    app.clearSuccessMessages();
  };

  app.autoDismissAlerts = function() {
    var $alerts = $('#messages .alert');

    $alerts.each(function() {
      var $alert = $(this),
        types = $alert.attr('class').split(' '),
        intersection = $.grep(types, function (value) {
          return $.inArray(value, app.config.auto_fade_alerts.types) !== -1;
        });
      // Check if alert should auto-fade
      if (intersection.length > 0) {
        setTimeout(function() {
          $alert.slideUp(app.config.auto_fade_alerts.fade_duration).remove();
        }, app.config.auto_fade_alerts.delay);
      }
    });
  };

  app.addInitFunction(function () {
    // Bind AJAX message handling.
    $(document).ajaxComplete(function(event, request, settings){
      /*var messages = app.ajax.get_messages(request);
      if(messages){
        var message_array = $.parseJSON(messages);
        $.each(message_array.django_messages, function (i, item) {
          app.alert(item.level, item.message, item.extra_tags);
        });
      }*/
      var message_array = $.parseJSON(app.ajax.get_messages(request));
      $(message_array).each(function (index, item) {
        app.alert(item[0], item[1], item[2]);
      });
    }).ajaxError(function (event, request, settings, exception) {
          app.alert("error", gettext("There was an error processing your request, please try again."));
    });

    // Dismiss alert messages when moving on to a new type of action.
    $('a.ajax-modal').click(function() {
      app.clearAllMessages();
    });

    // Bind dismiss(x) handlers for alert messages.
    $(".alert").alert();

    $(document).on('click', "." + pluginClassName + "-hidable", function(e) {
      return $(this).trigger('message-hide');
    });

    $(document).on('message-hide', ".alert", function(e) {
      var _ref;
      return (_ref = $(this).data(pluginClassName)) != null ? _ref.show(false) : void 0;
    });

    // Hide alerts automatically if attribute data-dismiss-auto is set to true.
    app.autoDismissAlerts();

    toastr.options.closeButton = true;
    toastr.options.progressBar = true;
    toastr.options.positionClass = "toast-top-center";
    toastr.options.timeOut = 5000;
    toastr.options.extendedTimeOut = 0;
    toastr.options.showMethod = "slideDown";
    toastr.options.hideMethod = "slideUp";
  });

}(app, jQuery, _));