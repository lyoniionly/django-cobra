(function (app, jQuery, _) {
  "use strict";

  var $ = jQuery;

  app.addInitFunction(function () {
    var $copy_btns = $('.copy-button');
    if ($copy_btns.length) {
      ZeroClipboard.config( { swfPath: app.config.zeroClipboardPath } );
      var _defaults = {
        title: 'copy to clipboard',
        copied_hint: 'copied!'
      };

      var client = new ZeroClipboard($copy_btns);

      client.on( 'ready', function(event) {
        $copy_btns.tooltip({
          container: 'body'
        });

        client.on( 'copy', function(event) {
          var $this_btn = $(event.target);
          var ori_title = $this_btn.attr('aria-label') || _defaults.title;
          var copied_hint = $this_btn.attr('data-copied-hint') || _defaults.copied_hint;
            $this_btn.tooltip('hide')
              .attr('data-original-title', copied_hint)
              .tooltip('fixTitle')
              .tooltip('show');
          });
        client.on( 'aftercopy', function(event) {
          var $this_btn = $(event.target);
          var ori_title = $this_btn.attr('aria-label') || _defaults.title;
            $this_btn.attr('data-original-title',ori_title);
          });
      });

      client.on( 'error', function(event) {
        ZeroClipboard.destroy();
      });
    }
  });

}(app, jQuery, _));