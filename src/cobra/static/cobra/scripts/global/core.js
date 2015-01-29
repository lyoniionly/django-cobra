
var Application = function () {
  var app = {
      config: {},
      templates: {},
      utils: {}
    },
    initFunctions = [];

  /* Use the addInitFunction() function to add initialization code which must
   * be called on DOM ready. This is useful for adding things like event
   * handlers or any other initialization functions which should precede user
   * interaction but rely on DOM readiness.
   */
  app.addInitFunction = function (fn) {
    initFunctions.push(fn);
  };

  /* Call all initialization functions and clear the queue. */
  app.init = function () {
    for (var i = 0; i < initFunctions.length; i += 1) {
      initFunctions[i]();
    }

    // Prevent multiple executions, just in case.
    initFunctions = [];
  };

  /* An utility function for escaping HTML to avoid XSS. */
  app.escape_html = function (text) {
    return text.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  };

  return app;
};

// Create the one and only cobra object.
app = window.app = new Application();