(function (app, jQuery, _) {
  "use strict";

  var $ = jQuery;

  app.alert = function (type, message, extra_tags) {
    var safe = false;
    // Check if the message is tagged as safe.
    if (typeof(extra_tags) !== "undefined" && $.inArray('safe', extra_tags.split(' ')) !== -1) {
      safe = true;
    }

    var type_display = {
      'danger': gettext("Danger: "),
      'warning': gettext("Warning: "),
      'info': gettext("Notice: "),
      'success': gettext("Success: "),
      'error': gettext("Error: ")
    }[type];

    // the "error" type needs to be rewritten as "danger" for correct styling
    if (type === 'error') {
      type = 'danger';
    }

    var template = _.template(app.templates.alert_message),
      params = {
        "type": type,
        "type_display": type_display,
        "message": message,
        "safe": safe
      };
    return $(template(params)).hide().prependTo("#messages").fadeIn(100);
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

    $alerts.each(function(index, alert) {
      var $alert = $(this),
        types = $alert.attr('class').split(' '),
        intersection = $.grep(types, function (value) {
          return $.inArray(value, app.config.auto_fade_alerts.types) !== -1;
        });
      // Check if alert should auto-fade
      if (intersection.length > 0) {
        setTimeout(function() {
          $alert.fadeOut(app.config.auto_fade_alerts.fade_duration);
        }, app.config.auto_fade_alerts.delay);
      }
    });
  };

  app.addInitFunction(function () {
    var flash = $("#messages");
    if (flash.length > 0) {
      flash.click(function () {
        $(this).fadeOut();
      });
      flash.show();
      setTimeout(function () {
        flash.fadeOut()
      }, app.config.auto_fade_alerts.delay);
    }

    // Bind AJAX message handling.
    $(document).ajaxComplete(function(event, request, settings){
      var messages = app.ajax.get_messages(request);
      if(messages){
        var message_array = $.parseJSON(messages);
        $.each(message_array.django_messages, function (i, item) {
          app.alert(item.level, item.message, item.extra_tags);
        });
      }

      /*$(message_array).each(function (index, item) {
        app.alert(item[0], item[1], item[2]);
      });*/
    }).ajaxError(function (event, request, settings, exception) {
          app.alert("error", "There was an error processing your request, please try again.", "error");
    });

    // Dismiss alert messages when moving on to a new type of action.
    $('a.ajax-modal').click(function() {
      app.clearAllMessages();
    });

    // Bind dismiss(x) handlers for alert messages.
    $(".alert").alert();

    // Hide alerts automatically if attribute data-dismiss-auto is set to true.
    app.autoDismissAlerts();
  });

}(app, jQuery, _));