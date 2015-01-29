(function (app, jQuery) {
  "use strict";

  var $ = jQuery;

  app.config = $.extend(app.config, {
    spinner_options: {
      modal: {
        lines: 10,
        length: 15,
        width: 4,
        radius: 10,
        color: '#000',
        speed: 0.8,
        trail: 50
      }
    }
  });

}(app, jQuery));