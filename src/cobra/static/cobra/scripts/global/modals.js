/* Namespace for core functionality related to modal dialogs.
 *
 * Modals in Gitgo are treated as a "stack", e.g new ones are added to the
 * top of the stack, and they are always removed in a last-in-first-out
 * order. This allows for things like swapping between modals as part of a
 * workflow, for confirmations, etc.
 *
 * When a new modal is loaded into the DOM, it fires a "new_modal" event which
 * event handlers can listen for. However, for consistency, it is better to
 * add methods which should be run on instantiation of any new modal to be
 * applied via the app.modals.addModalInitFunction method.
 */
(function (app, jQuery, _) {
  "use strict";

  var $ = jQuery;

  app.modals = {
    // Storage for our current jqXHR object.
    _request: null,
    spinner: null,
    _init_functions: []
  };

  app.modals.addModalInitFunction = function (f) {
    app.modals._init_functions.push(f);
  };

  app.modals.initModal = function (modal) {
    $(app.modals._init_functions).each(function (index, f) {
      f(modal);
    });
  };

  /* Creates a modal dialog from the client-side template. */
  app.modals.create = function (title, body, confirm, cancel) {
    if (!cancel) {
      cancel = gettext("Cancel");
    }
    var template = _.template(app.templates.modal_template),
      params = {
        title: title, body: body, confirm: confirm, cancel: cancel,
        modal_backdrop: app.modals.MODAL_BACKDROP
      };
    return $(template(params)).appendTo("#modal_wrapper");
  };

  /* Generates a confirmation modal dialog for the given action. */
  app.modals.confirm = function (action) {
    var $action = $(action),
      $modal_parent = $(action).closest('.modal'),
      name_array = [],
      closest_table_id, action_string, name_string,
      title, body, modal, form;
    if($action.hasClass("disabled")) {
      return;
    }
    action_string = $action.text();
    name_string = "";
    /*// Add the display name defined by table.get_object_display(datum)
    closest_table_id = $(action).closest("table").attr("id");
    // Check if data-display attribute is available
    if ($("#"+closest_table_id+" tr[data-display]").length > 0) {
      var actions_div = $(action).closest("div");
      if(actions_div.hasClass("table_actions") || actions_div.hasClass("table_actions_menu")) {
        // One or more checkboxes selected
        $("#"+closest_table_id+" tr[data-display]").has(".table-row-multi-select:checkbox:checked").each(function() {
          name_array.push(" \"" + $(this).attr("data-display") + "\"");
        });
        name_array.join(", ");
        name_string = name_array.toString();
      } else {
        // If no checkbox is selected
        name_string = " \"" + $(action).closest("tr").attr("data-display") + "\"";
      }
      name_string = interpolate(gettext("You have selected %s. "), [name_string]);
    }*/
    title = interpolate(gettext("Confirm %s"), [action_string]);
    body = name_string + gettext("Please confirm your selection. This action cannot be undone.");
    modal = app.modals.create(title, body, action_string);
    modal.modal();

    if($modal_parent.length) {
      var child_backdrop = modal.next('.modal-backdrop');
      // re-arrange z-index for these stacking modal
      child_backdrop.css('z-index', $modal_parent.css('z-index')+10);
      modal.css('z-index', child_backdrop.css('z-index')+10);
    }
    modal.find('.btn-primary').click(function (evt) {
      form = $action.closest('form');
      form.append("<input type='hidden' name='" + $action.attr('name') + "' value='" + $action.attr('value') + "'/>");
      form.submit();
      modal.modal('hide');
      app.modals.modal_spinner(gettext("Working"));
      return false;
    });
    return modal;
  };

  app.modals.success = function (data, textStatus, jqXHR) {
    var modal;
    $('#modal_wrapper').append(data);
    modal = $('.modal:last');
    modal.modal();
    $(modal).trigger("new_modal", modal);
    return modal;
  };

  app.modals.modal_spinner = function (text) {
    // Adds a spinner with the desired text in a modal window.
    var template = _.template(app.templates.spinner_modal);
    app.modals.spinner = $(template({text: text}));
    app.modals.spinner.appendTo("#modal_wrapper");
    app.modals.spinner.modal({backdrop: 'static'});
    app.modals.spinner.find(".modal-body").spin(app.config.spinner_options.modal);
  };

  app.addInitFunction(app.modals.init = function() {

    // Bind handler for initializing new modals.
    $('#modal_wrapper').on('new_modal', function (evt, modal) {
      app.modals.initModal(modal);
    });

    // Bind "cancel" button handler.
    $(document).on('click', '.modal .cancel', function (evt) {
      $(this).closest('.modal').modal('hide');
      evt.preventDefault();
    });

    // AJAX form submissions from modals. Makes validation happen in-modal.
    $(document).on('submit', '.modal form', function (evt) {
      var $form = $(this),
        form = this,
        $button = $form.find(".modal-footer .btn-primary"),
        update_field_id = $form.attr("data-add-to-field"),
        headers = {},
        modalFileUpload = $form.attr("enctype") === "multipart/form-data",
        formData, ajaxOpts, featureFileList, featureFormData;

      if (modalFileUpload) {
        featureFileList = $("<input type='file'/>").get(0).files !== undefined;
        featureFormData = window.FormData !== undefined;

        if (!featureFileList || !featureFormData) {
          // Test whether browser supports HTML5 FileList and FormData interfaces,
          // which make XHR file upload possible. If not, it doesn't
          // support setting custom headers in AJAX requests either, so
          // modal forms won't work in them (namely, IE9).
          return;
        } else {
          formData = new window.FormData(form);
        }
      } else {
        formData = $form.serialize();
      }
      evt.preventDefault();

      // Prevent duplicate form POSTs
      $button.prop("disabled", true);

      if (update_field_id) {
        headers["X-Gitgo-Add-To-Field"] = update_field_id;
      }

      ajaxOpts = {
        type: "POST",
        url: $form.attr('action'),
        headers: headers,
        data: formData,
        beforeSend: function () {
          $("#modal_wrapper .modal").last().modal("hide");
          $('.ajax-modal, .dropdown-toggle').attr('disabled', true);
          app.modals.modal_spinner(gettext("Working"));
        },
        complete: function () {
          app.modals.spinner.modal('hide');
          $("#modal_wrapper .modal").last().modal("show");
          $button.prop("disabled", false);
        },
        success: function (data, textStatus, jqXHR) {
          var redirect_header = jqXHR.getResponseHeader("X-Gitgo-Location"),
            add_to_field_header = jqXHR.getResponseHeader("X-Gitgo-Add-To-Field"),
            json_data, field_to_update;
          if (redirect_header === null) {
              $('.ajax-modal, .dropdown-toggle').removeAttr("disabled");
          }
          $form.closest(".modal").modal("hide");
          if (redirect_header) {
            location.href = redirect_header;
          }
          else if (add_to_field_header) {
            json_data = $.parseJSON(data);
            field_to_update = $("#" + add_to_field_header);
            field_to_update.append("<option value='" + json_data[0] + "'>" + json_data[1] + "</option>");
            field_to_update.change();
            field_to_update.val(json_data[0]);
          } else {
            app.modals.success(data, textStatus, jqXHR);
          }
        },
        error: function (jqXHR, status, errorThrown) {
          if (jqXHR.getResponseHeader('logout')) {
            location.href = jqXHR.getResponseHeader("X-Gitgo-Location");
          } else {
            $('.ajax-modal, .dropdown-toggle').removeAttr("disabled");
            $form.closest(".modal").modal("hide");
            app.alert("danger", gettext("There was an error submitting the form. Please try again."));
          }
        }
      };

      if (modalFileUpload) {
        ajaxOpts.contentType = false;  // tell jQuery not to process the data
        ajaxOpts.processData = false;  // tell jQuery not to set contentType
      }
      $.ajax(ajaxOpts);
    });

    // Position modal so it's in-view even when scrolled down.
    $(document).on('show.bs.modal', '.modal', function (evt) {
      // Filter out indirect triggers of "show" from (for example) tabs.
      if ($(evt.target).hasClass("modal")) {
        var scrollShift = $('body').scrollTop() || $('html').scrollTop(),
          $this = $(this),
          topVal = $this.css('top');
        $this.css('top', scrollShift + parseInt(topVal, 10));
      }
      // avoid closing the modal when escape is pressed on a select input
      $("select", evt.target).keyup(function (e) {
        if (e.keyCode === 27) {
          // remove the focus on the select, so double escape close the modal
          e.target.blur();
          e.stopPropagation();
        }
      });
    });

    // Focus the first usable form field in the modal for accessibility.
    app.modals.addModalInitFunction(function (modal) {
      $(modal).find(":text, select, textarea").filter(":visible:first").focus();
    });

    /*app.modals.addModalInitFunction(function(modal) {
      app.datatables.validate_button($(modal).find(".table_wrapper > form"));
    });*/
//    app.modals.addModalInitFunction(app.utils.loadAngular);

    // Load modals for ajax-modal links.
    $(document).on('click', '.ajax-modal', function (evt) {
      var $this = $(this);

      // If there's an existing modal request open, cancel it out.
      if (app.modals._request && typeof(app.modals._request.abort) !== undefined) {
        app.modals._request.abort();
      }

      app.modals._request = $.ajax($this.attr('href'), {
        beforeSend: function () {
          app.modals.modal_spinner(gettext("Loading"));
        },
        complete: function () {
          // Clear the global storage;
          app.modals._request = null;
          app.modals.spinner.modal('hide');
        },
        error: function(jqXHR, status, errorThrown) {
          if (jqXHR.status === 401){
            var redir_url = jqXHR.getResponseHeader("X-Gitgo-Location");
            if (redir_url){
              location.href = redir_url;
            } else {
              location.reload(true);
            }
          }
          else {
            if (!app.ajax.get_messages(jqXHR)) {
              // Generic error handler. Really generic.
              app.alert("danger", gettext("An error occurred. Please try again later."));
            }
          }
        },
        success: function (data, textStatus, jqXHR) {
          var update_field_id = $this.attr('data-add-to-field'),
            modal,
            form;
          modal = app.modals.success(data, textStatus, jqXHR);
          if (update_field_id) {
            form = modal.find("form");
            if (form.length) {
              form.attr("data-add-to-field", update_field_id);
            }
          }
        }
      });
      evt.preventDefault();
    });


    /* Manage the modal "stack" */

    // After a modal has been shown, hide any other modals that are already in
    // the stack. Only one modal can be visible at the same time.
    $(document).on("show.bs.modal", ".modal", function () {
      var modal_stack = $("#modal_wrapper .modal");
      modal_stack.splice(modal_stack.length - 1, 1);
      modal_stack.modal("hide");
    });

    // After a modal has been fully hidden, remove it to avoid confusion.
    // Note: the modal should only be removed if it is the "top" of the stack of
    // modals, e.g. it's the one currently being interacted with and isn't just
    // temporarily being hidden.
    $(document).on('hidden.bs.modal', '.modal', function () {
      var $this = $(this),
        modal_stack = $("#modal_wrapper .modal");
      if ($this[0] === modal_stack.last()[0] || $this.hasClass("loading")) {
        $this.remove();
        if (!$this.hasClass("loading")) {
          $("#modal_wrapper .modal").last().modal("show");
        }
      }
    });

    // Make modals draggable
    $(document).on("show.bs.modal", ".modal", function () {
      /*$(".modal-content").draggable({
        handle: ".modal-header"
      });*/
    });
  });
}(app, jQuery, _));