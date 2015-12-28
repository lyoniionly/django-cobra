/* Queued ajax handling for Cobra.
 *
 * Note: The number of concurrent AJAX connections hanlded in the queue
 * can be configured by setting an "ajax_queue_limit" key in
 * COBRA_CONFIG to the desired number (or None to disable queue
 * limiting).
 */
(function (app, jQuery) {
  "use strict";

  var $ = jQuery;

  app.ajax = {
    // This will be our jQuery queue container.
    _queue: [],
    _active: [],
    get_messages: function (request) {
      //var contentType = request.getResponseHeader("Content-Type");
      //if (contentType == "application/javascript" || contentType == "application/json") {
      //  return request.responseText;
      //}
      return request.getResponseHeader("X-Cobra-Messages");
    },
    // Function to add a new call to the queue.
    queue: function(opts) {
      var complete = opts.complete,
          active = app.ajax._active;

      opts.complete = function () {
        var index = $.inArray(request, active);
        if (index > -1) {
          active.splice(index, 1);
        }
        app.ajax.next();
        if (complete) {
          complete.apply(this, arguments);
        }
      };

      function request() {
        return $.ajax(opts);
      }

      // Queue the request
      app.ajax._queue.push(request);

      // Start up the queue handler in case it's stopped.
      app.ajax.next();
    },
    next: function () {
      var queue = app.ajax._queue,
          limit = app.conf.ajax.queue_limit,
          request;
      if (queue.length && (!limit || app.ajax._active.length < limit)) {
        request = queue.pop();
        app.ajax._active.push(request);
        return request();
      }
    }
  };
}(app, jQuery));