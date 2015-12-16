(function (window, app, Backbone, jQuery, _, moment) {
  "use strict";

  var $ = jQuery;

  var router = new app.router();

  window.ROUTER = router;

  Backbone.history.start(/*{
    pushState: true
  }*/);

  $("body").on("click", ".router", function(c) {
    c.preventDefault();
    (c = $(this).attr("href")) && "#" != c && ($(".modal").trigger("click"), router.navigate(c, {
        trigger: true
    }))
  });


}(window, app, Backbone, jQuery, _, moment));