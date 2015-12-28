(function (app, Backbone, jQuery, _) {
  "use strict";

   var $ = jQuery;

  var pages = {};

  app.components = {};

  app.components.event = {
    setLastPage: function(a) {
      pages = a
    },
    initEvent: function() {
      $.ajaxSetup({
        cache: !1
      });
      var g = this;
      /*$(document).ajaxComplete(function(a, b, c) {
        a = {};
        try {
          a = $.parseJSON(b.responseText)
        } catch(e) {}
        g.relogin && a.actionMsg && -1 == a.actionMsg.code ? (g.relogin = !1, (new u({
          currentUser: TEAMS.currentUser
        })).render()) : g.relogin = !0
      });*/
      $("body").on("click", "table.j_stripedTable td:first-child", function(a) {
        $(this).parent("tr").addClass("active").siblings().removeClass("active")
      });
      /*$("body").on("mouseenter.dropdownmenu", ".dropdown-menu-toggle", function(a) {
        var b = $(this);
        $(this).hasClass("j_tag") && (new s).render();
        b.addClass("open");
        a = null != b.find(".dropdown-user").get(0) ? setTimeout(function() {
          b.find(".dropdown-user").slideDown("fast")
        },
        300) : null != b.find(".dropdown-tag").get(0) ? setTimeout(function() {
          b.find(".dropdown-tag").slideDown("fast")
        },
        300) : setTimeout(function() {
          b.children(".dropdown-menu").slideDown("fast")
        },
        300);
        b.data("showTimer", a);
        $(this).hasClass("user-panel") && (null == $("body").find(".user-menu-backdrop").get(0) && $("body").append('<div class\x3d"user-menu-backdrop fade"></div>'), a = setTimeout(function() {
          $("body").find(".user-menu-backdrop").addClass("in")
        },
        150), $(this).data("dropTimer", a))
      }).on("mouseleave.dropdownmenu", ".dropdown-menu-toggle", function(a) {
        a = $(this).data("showTimer");
        $(this).removeClass("open");
        a && clearTimeout(a);
        $(this).removeData("showTimer");
        $(this).children(".dropdown-menu").slideUp(100);
        $(this).find(".dropdown-user,.dropdown-tag").slideUp(100);
        $(this).hasClass("user-panel") && (a = $(this).data("dropTimer")) && (clearTimeout(a), $("body").find(".user-menu-backdrop").removeClass("in"), setTimeout(function() {
          $("body").find(".user-menu-backdrop").remove()
        },
        150), $(this).removeData("dropTimer"))
      });
      $("body").on("click.dropdownmenu", ".dropdown-menu a",
      function(a) {
        a = $(this).closest(".dropdown-menu-toggle");
        if (0 < a.length) {
          var b = a.data("mode");
          if (b && "select" == b) {
            var b = a.find(".title"),
            c = a.data("entity"),
            e = $(this).data("entity");
            c != e && (b.html($(this).html()), a.data("entity", e), a.trigger("change"))
          }
        }
        a = $($(this).parents(".dropdown")[0]);
        a.hasClass("dropdown-gettext") && (b = $(this).text(), a.find(".dropdown-toggle").html(b + ' <i class\x3d"icon-caret-down"></i>'));
        $(this).closest(".dropdown-menu-toggle");
        $(this).closest(".dropdown-menu").slideUp(100)
      });*/
      $("body").off("mouseenter.typeahead", ".typeahead-wrapper").on("mouseenter.typeahead", ".typeahead-wrapper", function(a) {
        $(this).data("enter", !0)
      }).off("mouseleave.typeahead", ".typeahead-wrapper").on("mouseleave.typeahead", ".typeahead-wrapper", function(a) {
        $(this).data("enter", !1)
      });
      $("body").off("click.controlbtn", ".control-btn").on("click.controlbtn", ".control-btn", function(a) {
        a.stopPropagation();
        $(this).addClass("hide");
        $(this).siblings(".typeahead-wrapper").removeClass("hide");
        $(this).siblings(".typeahead-wrapper").find(".control-input").focus()
      });
      $("body").off("focusout.controlinput", ".control-input").on("focusout.controlinput", ".control-input", function(a, b) {
        a.stopPropagation();
        var c = $(this).parents(".typeahead-wrapper");
        c.data("enter") && "tt" != b || (c.addClass("hide"), c.siblings(".control-btn").removeClass("hide"), c.trigger("hide"))
      });
      /*$("body").off("click", ".links-control-group a").on("click", ".links-control-group a", function(a) {
        $(this).addClass("hide");
        if (a = $(this).attr("for")) if ("#task-subtask" == a) {
          var b = $("#subtaskClone").clone();
          b.find(".title .text").replaceWith("<input type='text' style='border:none;background-color:transparent;width:450px;' class='title j_nameInput ellipsis' value='' tabindex='-1' maxlength='100' />");
          b.removeAttr("id");
          0 < $("#entitybox-container #task-subtask").length ? ($("#entitybox-container #task-subtask").find(".task-list").append(b), $("#entitybox-container #task-subtask").removeClass("hide"), $("#entitybox-container #task-subtask").find(".j_nameInput").focus()) : ($("#entitySlider #task-subtask").find(".task-list").append(b), $(a).removeClass("hide"), $(a).find(".j_nameInput").focus())
        } else a = $(this).parents(".links-control-group").parent().find(a),
        a.removeClass("hide"),
        a.find(".control-btn").trigger("click"),
        a.trigger("addAttachment")
      });
      $("body").on("click", ".remind-toggle", function(a) {
        if ($(this).attr("userId") || $(this).attr("targetId") || $(this).attr("module"))(0 == $(this).parents("#entitybox").size() ? new h({
          obj: $(this),
          el: "body"
        }) : new h({
          obj: $(this),
          el: "#entitybox"
        })).render(),
        0 < $("#htmleditmodeEsc").length ? $("body").find("#remind-div").css("z-index", "1036") : null != $(".modal-backdrop.fade.in").get(0) && $("body").find("#remind-div").addClass("highIdex")
      });
      $("body").on("click", ".agenda-toggle", function(a) {
        if (($(this).attr("userId") || $(this).attr("targetId") || $(this).attr("module")) && $(this).attr("targetId") && $(this).attr("module")) {
          var b = new Date;
          a = b.getFullYear();
          var c = b.getMonth(),
          c = c + 1,
          c = 10 > c ? "0" + c: c,
          d = b.getDate(),
          b = d,
          d = d + 1,
          b = a + "-" + c + "-" + (10 > b ? "0" + b: b);
          a = a + "-" + c + "-" + (10 > d ? "0" + d: d);
          b = Date.create(b).getTime();
          a = Date.create(a).getTime();
          var h = new e({
            entityModule: "agenda",
            obj: $(this),
            entityId: "new",
            allDay: !0,
            start: b,
            end: a,
            callbacks: {
              afterOpen: function() {
                $("#entitybox-container .j_title").focus()
              },
              afterOperate: function() {
                h.close();
                app.alert('success', "日程创建成功");
              }
            }
          });
          h.render()
        }
      });
      $("body").on("click", ".entitybox-toggle", function(a) {
        var b = $(this).attr("data-module");
        a = $(this).attr("data-id");
        var c = $(this).attr("data-target"),
        d = $(this).attr("data-value"),
        h = $(this).attr("userId"),
        f = $(this).attr("data-type");
        if (b && a) {
          var k = new e({
            entityModule: b,
            entityId: a,
            entityValue: d,
            dataType: f,
            target: $(this),
            userId: h,
            callbacks: {
              afterOpen: function() {
                c && $("#entitybox-container " + c).focus()
              },
              afterOperate: function() {
                k.close();
                "agenda" == b && (1 == $("#portal-container #calendar-list").size() && $("#portal-container #calendar-list").trigger("refresh"), $("#calendar").trigger("refetch"))
              }
            },
            page: w
          });
          k.render()
        }
      });
      $("body").on("click", ".usercard-toggle",
      function(a) { (a = $(this).attr("userId")) && "10000" != a && (new b({
          targetEl: $(this),
          userId: a
        })).render()
      });
      $("body").on("click", ".remindcard-toggle",
      function(b) { (b = $(this).attr("data-id")) && (new a({
          targetEl: $(this),
          userId: b
        })).render()
      });
      $("body").on("click", ".locus-toggle",
      function(a) {
        a = $(this).attr("user-id");
        var b = $(this).attr("user-name");
        a && (new d({
          userId: a,
          userName: b
        })).render()
      });
      $("body").on("click", ".entity-toggle",
      function(a) {
        a = $(this);
        var b = $(this).parents(".mainline-controls"),
        e = [],
        d = $(this).find("#js_customer-import-btn").attr("taskid");
        1 == b.size() && b.find(".entity-container .entity-item").each(function() {
          e.push($(this).data("object"))
        });
        b = a.prev("input"); (new c({
          targetEl: a,
          keyword: b ? b.val() : "",
          currentTaskId: d,
          module: a.attr("module"),
          type: a.attr("data-type"),
          seletedList: e
        })).render()
      });*/
      $("body").off("mouseenter", ".entity-item").on("mouseenter", ".entity-item",
      function(a) {
        $(this).attr("undeletable") || $(this).parents(".entity-container").attr("undeletable") || $(this).find("a:first").after('<a class="close" title="删除">&times;</a>')
      });
      $("body").off("mouseleave", ".entity-item").on("mouseleave ", ".entity-item",
      function(a) {
        $(this).find(".close").remove()
      });
      $("body").off("click", ".entity-item .close").on("click ", ".entity-item .close",
      function(a) {
        a = $(this).prevAll("a").attr("id");
        var b = $(this).prevAll("a").attr("data-value"),
        c = $(this).parents(".entity-container"),
        e = c.attr("data-url");
        if (e && b) {
          var d = $(this).parent(),
          h = c.data("param") || {};
          h._method = "delete";
          a = function(a) {
            a && $.ajax({
              type: "POST",
              dataType: "json",
              data: h,
              url: e.replace("{id}", b),
              success: function(a) {
                d.remove();
                c.trigger("removeEntity", a);
                $("#stream").trigger("insertStream", a.streams || a.stream);
                $("#readinfo").trigger("updateReadInfo");
                app.alert('success', "数据已删除");
              }
            })
          };
          c.attr("data-noConfirm") ? a(!0) : f.confirm("确定要删除吗？", a)
        } else $(this).parent().hasClass("tag") || ($(this).parent(".entity-item").remove(), c.trigger("removeEntity", a))
      });
      $("body").off("click", ".j_btn_close").on("click ", ".j_btn_close",
      function(a) { (a = $(this).parents("#entitybox")) && 0 < a.length ? a.find(".modal-header .close").click() : $("body").trigger("slideClose")
      });
      $("body").off("triggerClose").on("triggerClose",
      function(a) {
        var b = location.pathname;
        a = location.hash;
        b = b.substring(0, b.lastIndexOf("/"));
        "" == b && "" != a && (b = "/" + a.substring(1, a.lastIndexOf("/")));
        ROUTER.navigate(b, {
          trigger: !0
        })
      });
      /*$("body").off("click", ".j_center .e-list .checkbox").on("click", ".j_center .e-list .checkbox",
      function(a) {
        var b = !1;
        $(this).find("i").hasClass("icon-checkbox-checked") && (b = !0);
        a.stopPropagation();
        $(this).find("i").toggleClass("icon-checkbox-checked").toggleClass("icon-checkbox-unchecked");
        $(this).parent("li").toggleClass("selected");
        b ? $(".main .j_check-all").addClass("icon-checkbox-unchecked").removeClass("icon-checkbox-checked") : 0 == $(".j_center .e-list i.icon-checkbox-unchecked").size() && $(".main .j_check-all").removeClass("icon-checkbox-unchecked").addClass("icon-checkbox-checked");
        $("body").trigger("batch")
      });
      $("body").off("click", ".j_check-all").on("click", ".j_check-all",
      function() {
        var a = !1;
        $(this).hasClass("icon-checkbox-checked") && (a = !0);
        a ? $(this).parents(".main").find(".j_center span.checkbox").each(function() {
          $(this).find("i").removeClass("icon-checkbox-checked").addClass("icon-checkbox-unchecked");
          $(this).parent("li").removeClass("selected")
        }) : $(this).parents(".main").find(".j_center span.checkbox").each(function() {
          $(this).find("i").addClass("icon-checkbox-checked").removeClass("icon-checkbox-unchecked");
          $(this).parent("li").addClass("selected")
        });
        $(".main .j_check-all").toggleClass("icon-checkbox-checked").toggleClass("icon-checkbox-unchecked");
        $("body").trigger("batch")
      });
      $("body").off("batch").on("batch",
      function(a) {
        0 < $(".main").find(".j_center .selected").size() ? ($("body").addClass("batch-open"), $(".j_batchEl").removeClass("hide")) : ($("body").removeClass("batch-open"), $(".j_batchEl").addClass("hide"))
      });*/
      $("body").off("click", ".typeahead-search,.selector-toggle").on("click", ".typeahead-search,.selector-toggle",
      function() {
        var a = $(this);
        switch (a.attr("data-entity")) {
        case "employee":
          (new m({
            $target:
            $(this)
          })).open();
          break;
        case "department":
          (new q({
            $el:
            $(this)
          })).open();
          break;
        case "group":
          (new p({
            $el:
            $(this)
          })).open();
          break;
        case "formLabel":
          (new n({
            $el:
            $(this)
          })).open();
          break;
        case "tag":
          var b = "1" == a.siblings("input").attr("privacy") ? !0 : !1; (new k({
            $el: $(this),
            privacy: b
          })).open()
        }
        a = a.parents(".typeahead-wrapper");
        0 < a.length && a.find(".control-input").trigger("focusout.controlinput", "tt")
      });
      /*$("body").off("click", ".btn-back,.btn-group .back").on("click", ".btn-back,.btn-group .back",
      function(a) {
        0 < $(this).parents("#entitySlider").size() ? $("body").trigger("slideClose") : 0 < $(this).parents("#entitybox").size() ? $("#entitybox").modal("hide") : history.back();
        return ! 1
      });
      $("body").off("click", ".btn-feedback").on("click", ".btn-feedback",
      function() {
        var a = $(this).parents("#entitybox");
        0 == a.length && (a = $("#entitySlider"));
        a.find(".extend-comment").hasClass("active") ? a.find("#comment-textarea").focus() : a.find(".extend-comment").trigger("click.extend");
        var b = a.find(".extend-panel").position().top;
        a.find(".scrollwrapper").mCustomScrollbar("scrollTo", b - 100)
      });
      $("body").off("click", ".share-join").on("click", ".share-join",
      function() {
        var a = $(this).attr("entityId"),
        b = $(this).attr("module");
        $.ajax({
          type: "post",
          dataType: "json",
          data: {
            entityId: a,
            module: b
          },
          url: "/blog-message/shareApply.json",
          success: function(a) {
            app.alert('success', '共享申请已发送');
          }
        })
      });
      $(window).on("resize",
      function(a) {
        setTimeout(function() {
          $("body div.scrollwrapper").each(function(a) {
            $(this).trigger("resizeSroll", a)
          })
        },
        100);
        if (0 < $("body").find("#navigation .j_basenav").length) {
          a = $("body").find("#navigation .j_basenav").offset().top || 0;
          for (var b = $("body").find("#navigation .j_baseautolis li"), c = 0, e = b.length; c < e; c++) if ($(b[c]).hasClass("active")) { ($(b[c]).offset().top || 0) > a ? $("#navigation .j_activeli").addClass("active").html($(b[c]).find("a").clone() || "") : $("#navigation .j_activeli").empty();
            break
          }
        }
      });
      $("body").off("resizeSroll").on("resizeSroll", "div.scrollwrapper",
      function(a) {
        a = $(this);
        if (a.attr("horizontal")) {
          var b = $(window).width(),
          c = a.offset().left;
          a.css("width", b - c)
        } else {
          b = a.attr("height");
          b || (b = a.attr("marginbottom") || 0, c = a.offset().top, b = $(window).height() - c - b);
          if (null != a.parents("#entitybox").get(0)) var e = a.parents("#entitybox").find(".modal-content"),
          c = e.height(),
          e = e.offset().top,
          c = $(window).height() - c - e,
          b = b - c;
          a.css("height", b)
        }
        a.mCustomScrollbar("update")
      });
      $("body").off("rViewSlide").on("rViewSlide",
      function(a) {
        1439 < $(window).width() ? ($(".j_sidebarPren").addClass("sidebar-in"), $(".j_sidebarCtrl").data("open", !0).addClass("on")) : ($(".j_sidebarPren").removeClass("sidebar-in"), $(".j_sidebarCtrl").data("open", !1).removeClass("on"));
        setTimeout(function() {
          $(window).trigger("resize.customerTable")
        },
        400)
      });
      $("body").off("click", ".j_sidebarCtrl").on("click", ".j_sidebarCtrl",
      function() {
        $(this).data("open") ? ($(".j_sidebarPren").removeClass("sidebar-in"), $(this).data("open", !1).removeClass("on")) : ($(".j_sidebarPren").addClass("sidebar-in"), $(this).data("open", !0).addClass("on"));
        setTimeout(function() {
          $(window).trigger("resize.customerTable")
        },
        400)
      });
      setInterval(function() {
        $('[data-toggle="tooltip"]').tooltip({
          container: "body",
          animation: !0,
          html: !0
        })
      },
      1E3);
      $("body").off("mouseenter", "li.search").on("mouseenter", "li.search",
      function() {
        var a = $(this).find("input");
        a.focus().addClass("on").attr("placeholder", a.next().attr("title"))
      });
      $("body").off("mouseleave", "li.search").on("mouseleave", "li.search",
      function() {
        var a = $(this).find("input");
        "" == $.trim(a.val()) && a.removeAttr("placeholder").blur().removeClass("on")
      });
      $("body").off("blur", "li.search input").on("blur", "li.search input",
      function() {
        var a = $(this);
        "" == $.trim(a.val()) && a.removeAttr("placeholder").removeClass("on")
      });
      $("body").off("paste", "textarea.smart-title").on("paste", "textarea.smart-title", function(a) {
        if ((a = ((a.originalEvent || a).clipboardData || window.clipboardData).getData("text")) && (0 < a.indexOf("\n") || 0 < a.indexOf("\r"))) return a = a.replace(/[\n\r]/g, ""),
        $(this).val($(this).val() + a),
        !1
      })*/
    }
  };

  app.components.Preview = Backbone.View.extend({
    initialize: function(data) {
      this.afterJqObj = data.afterJqObj;
      this.container = data.container;
      this.previewType = data.previewType || "";
      this.rel = data.rel || "0";
      this.maxSize = data.maxSize || 10;
      if(data.fileObj) {
        var file_obj = data.fileObj;
        this.isImage = file_obj.image;
        this.docFileType = file_obj.docType;
        this.docFileId = file_obj.id;
        this.fileSize = file_obj.size;
        this.title = file_obj.name || "预览";
      } else {
        if(data.document) {
          var doc = data.document;
          this.isImage = doc.docFile.image;
          this.docFileType = doc.docFile.docType;
          this.docFileId = doc.docFile.id;
          this.fileSize = doc.docFile.size;
        }
      }
    },
    initEvents: function() {},
    render: function() {
      var $container = this.container, $afterJqObj = this.afterJqObj;
      if(this.isImage) {
        $afterJqObj.after("<a id='document-preview-" + this.docFileId + "' rel='" + this.rel + "' title='" + this.title + "' class='document-preview-btn btn btn-xs btn-info' href=''>预览</a>");
        $container.find("#document-preview-" + this.docFileId).addClass("fancybox").attr("type", "image").attr("href", "/base/download/" + this.docFileId + "?type=" + this.previewType + "&timestamp=" + Date.parse(new Date));
        $container.find(".fancybox").fancybox({
          closeBtn: true,
          afterLoad: function() {
            this.title = "Image " + (this.index + 1) + " of " + this.group.length + (this.title ? " - " + this.title : "");
          }
        });
      } else {
        if("office" == this.docFileType || "pdf" == this.docFileType) {
          $afterJqObj.after("<a id='document-preview-" + this.docFileId + "'  data-value='" + this.docFileId + "' title='预览' class='document-preview-btn btn btn-xs btn-info' href=''>预览</a>");
          if("version" == this.previewType) {
            $container.find("#document-preview-" + this.docFileId).attr({
              href: "/wopi/files/preview?id=" + this.docFileId + "&type=" + this.previewType,
              target: "_blank"
            })
          } else {
            $container.find("#document-preview-" + this.docFileId).attr({
              href: "/wopi/files/preview?id=" + this.docFileId,
              target: "_blank"
            })
          }
          if (this.fileSize > 1048576 * this.maxSize) {
            $container.find("#document-preview-" + this.docFileId).attr("disabled", "true").css({
              "background-color": "#ccc",
              "border-color": "#ccc"
            }).after("<a data-value='" + this.docFileId + "' style='color:#ccc;size:10px;text-decoration:none;cursor:default;margin-left:5px;'>超过预览最大限制" + this.maxSize + "M</a>");
          }
        } else {
          if("text" == this.docFileType) {
            $afterJqObj.after("<a id='document-preview-" + this.docFileId + "'  data-value='" + this.docFileId + "' title='预览' class='document-preview-btn btn btn-xs btn-info' href=''>预览</a>");
            $container.find("#document-preview-" + this.docFileId).attr({
              href: "/wopi/files/preview/txtView?id=" + this.docFileId + "&type=" + this.previewType,
              target: "_blank"
            })
          }
        }
      }
    },
    remove: function() {}
  });

  app.components.Attachment = Backbone.View.extend({
    el: "",
    targetId: "",
    initialize: function(c) {
      this.container = c.container;
      this.el = (this.parentEl = c.parentEl) ? this.parentEl + " " + this.container : this.container;
      this.callback = c.callback;
      this.targetId = c.targetId;
      this._module = c.module;
      this.readonly = c.readonly;
      this.callbacks = c.callbacks;
      $(this.el).html(_.template(app.templates.component_attachment)());
    },
    delegateEvents: function() {
      var c = this,
          b = this.uploader = new plupload.Uploader({
              runtimes: "html5,flash",
              file_data_name: "data",
              container: c.el,
              browse_button: c.el + " #pickFiles",
              drop_element: c.el + " #upload-wrap",
              max_file_size: "normal" == TEAMS.currentTenant.status ? "50mb" : "20mb",
              url: "/base/upload.json?refId=" + c.targetId + "&module=" + c._module + "&ETEAMSID=" + ETEAMSID,
              flash_swf_url: "/static/swf/plupload.swf"
          });
      b.init();
      b.bind("FilesAdded",
          function(a, b) {
              $.each(b,
                  function(a, b) {
                      $(c.el).find(".entity-container").append(f.template("base.newattachment", b))
                  });
              a.refresh();
              a.start();
              $(c.el).find(".fancybox").fancybox({
                  closeBtn: !0,
                  afterLoad: function() {
                      this.title = "Image " + (this.index + 1) + " of " + this.group.length + (this.title ? " - " + this.title : "")
                  }
              })
          });
      b.bind("UploadProgress",
          function(a, b) {
              $("#" + b.id + " i").html(b.percent + "%")
          });
      b.bind("Error",
          function(a, b) {
              -600 == b.code && app.alert('error', "只能上传最大不超过" + a.settings.max_file_size / 1024 / 1024 + "M的文件", "文件大小超过限制");
              a.refresh()
          });
      b.bind("FileUploaded",
          function(a, b, h) {
              a = jQuery.parseJSON(h.response);
              h = a.fileObj;
              c.callback && c.callback(a);
              c.callbacks && c.callbacks.link && c.callbacks.link(h, a.stream);
              $(c.container).trigger("FileUploaded", h);
              app.alert('success', "文件上传成功");
              $("#" + b.id).parent().replaceWith(f.template("base.attachment", h));
              $("#stream").trigger("insertStream", a.stream);
              $("#" + h.id).children().addClass("remoteDownload").data("dlid", h.id);
              (new d({
                  container: $("body"),
                  afterJqObj: $("#" + h.id).children(),
                  fileObj: h
              })).render()
          });
      $("#upload-wrap").addClass(b.runtime);
      $(this.el).on("addAttachment",
          function(a) {
              "html5" == b.runtime && (a = document.getElementById(b.id + "_html5")) && !a.disabled && a.click()
          });
      $(this.el).off("click", ".entity-item .close").on("click ", ".entity-item .close",
          function(a) {
              a.stopPropagation();
              a = $(this).prevAll("a").attr("id");
              var b = $(this).prevAll("a").attr("data-value"),
                  d = $(this).parents(".entity-container"),
                  m = d.attr("data-url");
              if (m && b) {
                  var k = $(this).parent(),
                      q = d.data("param") || {};
                  q._method = "delete";
                  f.confirm("确定要删除吗？",
                      function(a) {
                          a && $.ajax({
                              type: "POST",
                              dataType: "json",
                              data: q,
                              url: m.replace("{id}", b),
                              success: function(a) {
                                  k.remove();
                                  d.trigger("removeEntity", a);
                                  $("#stream").trigger("insertStream", a.streams || a.stream);
                                  $("#readinfo").trigger("updateReadInfo");
                                  app.alert('success', "数据已删除");
                                  c.callbacks && c.callbacks.unlink && c.callbacks.unlink(a.fileObj, a.stream)
                              }
                          })
                      })
              } else $(this).parent().hasClass("tag") || ($(this).parent(".entity-item").remove(), d.trigger("removeEntity", a))
          })
    },
    render: function(c) {
        this.readonly && ($(this.el + " #upload-wrap").remove(), $(this.el).find(".entity-container").removeAttr("data-url").attr("undeletable", !0));
        if (c) {
            var b = $(this.el).find(".entity-container");
            b.data("param", {
                refId: this.targetId
            });
            for (var a = 0,
                    e = c.length; a < e; a++) {
                var h = c[a];
                b.append(f.template("base.attachment", h));
                b.find("#" + h.id).children().addClass("remoteDownload").data("dlid", h.id);
                (new d({
                    container: b,
                    afterJqObj: b.find("#" + h.id).children(),
                    fileObj: h
                })).render()
            }
            0 < c.length && ($(this.el).slideDown(300), $(this.parentEl).find($(this.el).attr("icon")).parent().addClass("hide"));
            $(this.el).find(".fancybox").fancybox({
                closeBtn: !0,
                afterLoad: function() {
                    this.title = "Image " + (this.index + 1) + " of " + this.group.length + (this.title ? " - " + this.title : "")
                }
            })
        }
    },
    getLinkIds: function() {
        var c = [];
        $(this.el).find(".entity-item").each(function() {
            c.push($(this).find("a").attr("data-value"))
        });
        return c
    },
    remove: function() {
        this.undelegateEvents();
        this.uploader && (this.uploader.destroy(), this.uploader = null)
    }
  });

  app.components.TypeaheadView = Backbone.View.extend({
    initialize: function(c) {
      this.$input = c.$el;
      this.clickHandler = c.clickHandler;
      this.remote = c.remote || app.config.urlPrefix + '/organizations/' + app.config.organizationId + "/search/suggestion.json";
      this.resultHandler = c.resultHandler;
    },
    render: function() {
      $("#typeahead-div").remove();
      this.$input.after(app.templates["component.typeahead"]);
      this.show();
      this.htmlEvents()
    },
    htmlEvents: function() {
      var c = this, b = this.$input;
      b.off("focus.tt").on("focus.tt", function(a) {
        c.search($(this))
      });
      b.off("click.tt").on("click.tt", function(a) {
        a.stopPropagation()
      });
      b.off("keyup.tt").on("keyup.tt", function(a) {
        a = a.which;
        13 == a ? $("#typeahead-div p.active").trigger("click.tt") : 27 == a ? c.hide() : 38 == a ? (a = $("#typeahead-div p.active"), 1 > a.length ? $("#typeahead-div p").last().addClass("active") : (a.removeClass("active"), (0 < a.prev().length ? a.prev() : $("#typeahead-div p").last()).addClass("active"))) : 40 == a ? (a = $("#typeahead-div p.active"), 1 > a.length ? $("#typeahead-div p").first().addClass("active") : (a.removeClass("active"), (0 < a.next().length ? a.next() : $("#typeahead-div p").first()).addClass("active"))) : c.search($(this))
      });
      $("body").off("click.tt", "#typeahead-div p").on("click.tt", "#typeahead-div p", function(a) {
        a = $(this).data("obj");
        $(this).hasClass("invite-toggle") && "new" == a.id || (15 < b.val().length ? (app.alert('warning', '关键字长度不能大于15,请重新设置'), b.val("")) : c.clickHandler(a, b));
        b.trigger("focusout", "tt")
      });
      $("#typeahead-div").off("mouseenter .tt", "p").on("mouseenter .tt", "p", function() {
        $(this).addClass("active");
        $("#typeahead-div p.active").removeClass("active")
      })
    },
    search: function(c) {
      var b = this,
      a = $.trim(c.val());
      a == c.attr("placeholder") && (a = "");
      var e = c.attr("data-entity");
      this.suggestion = a;
      this.entity = e;
      if ("relevance" == e) {
        var d = c.parent().find(".typeahead-search");
        "customer" == d.attr("module") ? b.remote = TEAMS.service.crm + "/customer/suggestion.json": "calendar" == d.attr("module") ? b.remote = "/agendas/suggestion.json": b.remote = "/" + d.attr("module") + "s/suggestion.json"
      }
      this.privacy = "1" == c.attr("privacy") ? !0 : !1;
      if (e) if ($("#typeahead-div .loading_small").addClass(e).show(), c = b.remote, d = {},
      "formField" == e) {
        c = "/formdatastat/getFiledOptions.json";
        var f = $("#js_form_field_set").find("option:selected").attr("id");
        d.fieldId = f;
        $.ajax({
          type: "get",
          url: c,
          dataType: "json",
          data: d,
          success: function(c) {
            c = c.fieldOptions;
            $("#typeahead-div .loading_small").hide();
            10 < c.length && c.push({
              id: "all",
              name: a,
              module: "all"
            });
            b.loadList(c)
          }
        })
      } else d.keywords = a,
      d.searchType = e,
      "tag" == e && (d.privacy = b.privacy, d.allTag = !1),
      $.ajax({
        type: "get",
        url: c,
        dataType: "json",
        data: d,
        success: function(c) {
          c = c[e + "s"];
          $("#typeahead-div .loading_small").hide();
          10 < c.length && c.push({
            id: "all",
            name: a,
            module: "all"
          });
          b.loadList(c)
        }
      })
    },
    loadList: function(c) {
      this.resultHandler && (c = this.resultHandler(c));
      $("#typeahead-div #searchList").empty();
      var suggestion = this.suggestion;
      var entity = this.entity;
      if (suggestion && 2 < escape(suggestion).length) {
        for (var b = !0,
        a = 0,
        e = c.length; a < e; a++) {
          var d = c[a];
          if ((d.name || d.username) == suggestion) {
            b = !1;
            break
          }
        }
        a = this.$input.data("showNew");
        "forceDisabled" == a && (b = !1);
        b && "department" != entity && "group" != entity && "relevance" != entity && "formLabel" != entity && c.push({
          id: "new",
          name: suggestion,
          username: suggestion,
          privacy: this.privacy
        });
        "relevance" == entity && 0 == c.length && $("#typeahead-div #searchList").append('<p class="relevance"><span>无相关记录</span></p>')
      }
      a = 0;
      for (e = c.length; a < e; a++) {
        if ("formField" == entity) d = c[a],
        d.name = d.name.replace(/</g, "&lt").replace(/>/g, "&gt").replace("/[\r\n]/g", " "),
        b = '<p class="fieldOption" id="' + d.id + '"><span>' + d.name + "</sapn></p>",
        b = $($.trim(b)),
        b.data("obj", d);
        else if (d = c[a], console.log(d),d.createTime = Date.create(d.createTime).format("{yyyy}-{MM}-{dd}"), d.name = d.name.replace(/</g, "&lt").replace(/>/g, "&gt").replace("/[\r\n]/g", " "), b = _.template(app.templates["suggestion." + entity], d), b = $($.trim(b)), b.data("obj", d), d.avatar && b.find(".avatar").attr("src", d.avatar), "relevance" == entity) switch (d.module) {
        case "calendar":
          b.find(".icon-calendar").addClass("hide")
        }
        $("#typeahead-div #searchList").append(b)
      }
      b = !0;
      a = this.$input.data("showNew");
      "forceDisabled" == a && (b = !1);
      b && "employee" == entity && 2 >= escape(suggestion).length && $("#typeahead-div #searchList").append(app.templates["suggestion.invite"]);
      this.show()
    },
    hide: function() {
      $("#typeahead-div").hide()
    },
    show: function() {
      $("#typeahead-div").show()
    },
    resetPostion: function() {
      var $target = this.$input;
      var c = $target.offset().top,
      b = $target.offset().left;
      $("#typeahead-div").css("left", b + "px");
      $("#typeahead-div").css("top", c + 25 + "px")
    },
    remove: function() {
      $("body").off(".tt");
      $("#typeahead-div").off(".tt");
      this.$input.off(".tt");
      $("#typeahead-div").remove()
    }
  });

  app.components.typeahead = {
    defaults: {
      el: "input.typeahead",
      valueKey: "id",
      creatable: !0,
      callback: function(d) {}
    },
    init: function(d) {
      var c = [];
      $.isArray(d) ? c = d : c.push(d);
      for (var b = 0, a = c.length; b < a; b++) {
          d = c[b];
          var e = $(d.el),
              h = d.callback,
              m = d.resultHandler;
          (function(a, b, c, e) {
              a.off("focusin.tt").on("focusin.tt", function(d) {
                      (new app.components.TypeaheadView({
                          $el: a,
                          clickHandler: b,
                          remote: c,
                          resultHandler: e
                      })).render()
                  })
          })(e, h, d.remote, m);
          var k = e.next(".typeahead-search");
          k && 0 < k.size() && (k.attr("data-entity", $(d.el).attr("data-entity")), k.attr("module", $(d.el).attr("module")), k.attr("data-multi", $(d.el).attr("data-multi")),
              function(a, b, c, e) {
                  c.off("confirmHandler").on("confirmHandler",
                      function(c, e) {
                          b(e.objs, a)
                      })
              }(e, h, k, m))
      }
    }
  };

  app.components.ShareAllview = Backbone.View.extend({
    partEl: "",
    shareEl: "",
    initialize: function(data) {
      this.parentEl = data.parentEl;
      this.partEl = this.parentEl + " " + data.partContainer;
      this.shareEl = this.parentEl + " " + data.shareContainer;
      this.entityId = data.entityId;
      this.serverPath = data.serverPath;
      this._module = data.module;
      this.model = new app.models.Share({
        entityIds: this.entityId,
        module: this._module,
        serverPath: this.serverPath
      });
      if(data.partContainer) {
        $(this.partEl).html(app.utils.template("share.simpleshare", {
          panel: "participants"
        }));
      }
      $(this.shareEl).html(app.utils.template("share.shareall", {
          panel: "share"
      }));
      if("mainline" == this._module || "task" == this._module || "workreport" == this._module) {
        $(this.shareEl).find("#share-select").addClass("hide");
      }
    },
    delegateEvents: function() {
      var self = this;
      $(self.shareEl).off("click", ".j_more_show").on("click ", ".j_more_show", function(e) {
        e.stopPropagation();
        var $this = $(this);
        var type = $this.data("type");
        $this.addClass("hide").siblings(".j_more_hide").removeClass("hide");
        $(self.shareEl + " #" + type).children(".j_entity_item").show();
      });
      $(self.partEl).off("click", ".j_more_show").on("click ", ".j_more_show", function(e) {
        e.stopPropagation();
        var $this = $(this);
        var type = $this.data("type");
        $this.addClass("hide").siblings(".j_more_hide").removeClass("hide");
        $(self.partEl + " #" + type).children(".j_entity_item").show();
      });
      $(self.shareEl).off("click", ".j_more_hide").on("click ", ".j_more_hide", function(e) {
        e.stopPropagation();
        var $this = $(this);
        var type = $this.data("type");
        $this.addClass("hide").siblings(".j_more_show").removeClass("hide");
        $(self.shareEl + " #" + type).find(".j_entity_item:lt(5)").show();
        $(self.shareEl + " #" + type).find(".j_entity_item:gt(4)").hide();
      });
      $(self.partEl).off("click", ".j_more_hide").on("click ", ".j_more_hide", function(e) {
        e.stopPropagation();
        var $this = $(this);
        var type = $this.data("type");
        $this.addClass("hide").siblings(".j_more_show").removeClass("hide");
        $(self.partEl + " #" + type).find(".j_entity_item:lt(5)").show();
        $(self.partEl + " #" + type).find(".j_entity_item:gt(4)").hide();
      });
      $(self.shareEl).off("click", ".entity-item .close").on("click ", ".entity-item .close", function(e) {
        e.stopPropagation();
        self.deleteEvent($(this));
      });
      $(self.partEl).off("click", ".entity-item .close").on("click ", ".entity-item .close", function(e) {
        e.stopPropagation();
        self.deleteEvent($(this));
      });
      $(self.shareEl).find("#share-select").change(function() {
        var val = $(this).val();
        if("all" == val) {
          $(".sharetype-dept").addClass("hide");
          $(".sharetype-group").addClass("hide");
          $(".sharetype-user").removeClass("hide");
          $(self.shareEl).find("#editShare").removeClass("hide");
          $(self.shareEl).find(".typeahead-wrapper").addClass("hide");
          $(this).val("user");
          self.save(val, [{
            id: 0
          }], "sharer");
        } else if ("group" == val) {
          $(".sharetype-dept").addClass("hide");
          $(".sharetype-group").removeClass("hide");
          $(".sharetype-user").addClass("hide");
        } else if("department" == val) {
          $(".sharetype-dept").removeClass("hide");
          $(".sharetype-group").addClass("hide");
          $(".sharetype-user").addClass("hide");
        } else if("user" == val) {
          $(".sharetype-group").addClass("hide");
          $(".sharetype-dept").addClass("hide");
          $(".sharetype-user").removeClass("hide");
        }
      });
      app.components.typeahead.init([{
        el: self.shareEl + " .sharetype-group input",
        callback: function(res) {
          self.save("group", [res], "sharer");
        }
      }, {
        el: self.shareEl + " .sharetype-dept input",
        callback: function(res) {
          self.save("department", [res], "sharer");
        }
      }, {
        el: self.shareEl + " .sharetype-user input",
        callback: function(res) {
          self.save("user", res, "sharer");
        }
      }]);
      if(this.partEl) {
        app.components.typeahead.init({
          el: self.partEl + " #typeahead-participants",
          callback: function(res) {
            self.save("user", res, "participants");
          }
        });
      }
    },
    deleteEvent: function(b) {
      var a = this,
      e = b.prevAll("a").attr("id"),
      c = b.prevAll("a").attr("data-value"),
      d = b.parents(".entity-container"),
      k = d.attr("data-url");
      if (k && c) {
        var q = b.parent(),
        p = d.data("param") || {};
        p._method = "delete";
        var n = a.serverPath || "";
        b = function(b) {
          b && $.ajax({
            type: "POST",
            dataType: "json",
            data: p,
            url: n + k.replace("{id}", c),
            success: function(b) {
              q.remove();
              d.trigger("removeEntity", b);
              $("#stream").trigger("insertStream", b.streams || b.stream);
              $("#readinfo").trigger("updateReadInfo");
              app.alert('success', '数据已删除');
              a.callbacks && a.callbacks.unlink && a.callbacks.unlink(c, b.streams || b.stream)
            }
          })
        };
        d.attr("data-noConfirm") ? b(!0) : f.confirm("确定要删除吗？", b)
      } else b.parent().hasClass("tag") || (b.parent(".entity-item").remove(), d.trigger("removeEntity", e))
    },
    render: function(shareEntrys, flag) {
      var shareModel = this.model, self = this;
      if(self.entityId) {
        if(flag) {
          shareModel.query(function(res) {
            self.createShareEntryLink(res.shareEntrys);
            self.shareEntrys = res.shareEntrys
          });
        } else {
          self.shareEntrys = shareEntrys;
          self.createShareEntryLink(shareEntrys);
        }
      }
      self.renderMoreType("#participants");
      self.renderMoreType("#shareentrys")
    },
    renderMoreType: function(domId) {
      if (domId) {
        var $childrens = $(this.parentEl).find(domId).children(), len = $childrens.length;
        $(this.parentEl + " " + domId + " .j_more_show");
        if (5 < len) {
          for (var i = 5; i < len; i++) {
            $($childrens[i]).hide();
          }
          $(this.parentEl).find(domId).find(".j_more_btn").remove();
          var type = domId && 1 < domId.length && domId.substr(1) || "";
          $(this.parentEl).find(domId).append('<span class="j_more_btn"><span class="j_more_show" data-type="' + type + '"><a>显示更多...</a></span><span class="j_more_hide hide" data-type="' + type + '"><a>收起</a></span></span>');
        }
      }
    },
    save: function(b, a, e) {
      var c = this,
      d = this.model;
      if (a && !$.isEmptyObject(a)) {
        if ("sharer" == e) {
          if ("all" == b && 0 < $(this.shareEl).find("#shareentrys a[userid=0]").length) {
            app.alert('warning', "已共享给所有人,不用重复添加");
            return;
          }
          if ("department" == b && 0 < $(this.shareEl).find("#shareentrys a[userid=" + a[0].id + "]").length) {
            app.alert('warning', "已共享给该部门,不用重复添加");
            return;
          }
          if ("user" == b && 0 < $(this.shareEl).find("#shareentrys a[userid=" + a.id + "]").length) {
            app.alert('warning', "已存在共享人,不用重复添加");
            return;
          }
        }
        var k = "";
        a = $.isArray(a) ? a: [a];
        for (var q = [], p = 0; p < a.length; p++) {
          var n = a[p];
          if ("sharer" == e) {
            if (c.hasUser(n.id, $(c.shareEl).find("#shareentrys"))) {
              continue;
            }
          } else if ("participants" == e && c.hasUser(n.id, $(c.partEl))) {
            continue;
          }
          k += n.id + ",";
          q.push({
            sid: n.id,
            name: n.name,
            shareType: e
          });
        }
        k = k.substring(0, k.length - 1);
        d.sids = k;
        d.entryType = b;
        d.shareType = e;
        if(!c.shareEntrys) {
          c.shareEntrys = [];
        }
        if(c.entityId) {
          if("all" == b) {
            app.alert('info', '共享给所有人时，操作时间较长，请耐心等待...');
          }
          d.saveAll(function(a) {
            if(a.msg) {
              app.alert('success', a.msg);
            } else {
              c.createShareEntryLink(a.shareEntrys);
              c.shareEntrys.add(a.shareEntrys);
              if("sharer" == e) {
                if(a.addUserMessage) {
                  app.alert('success', a.addUserMessage);
                } else {
                  app.alert('success', '已添加共享人');
                }
              }
              if("participants" == e) {
                if(a.addUserMessage) {
                  app.alert('success', a.addUserMessage);
                } else {
                  app.alert('success', '已添加参与人');
                }
              }
              $(c.parentEl).find("#stream").trigger("insertStream", a.streams);
              $(c.parentEl).find("#readinfo").trigger("insertReadInfo", [c.entityId, c.shareEntrys]);
            }
          });
        } else {
          c.createShareEntryLink(q);
          c.shareEntrys.push(q);
        }
      }
    },
    createShareEntryLink: function(shareEntrys) {
      if (shareEntrys) {
        for (var i = 0; i < shareEntrys.length; i++) {
          var shareEntry = shareEntrys[i], shareType = shareEntry.shareType, domId = "", domClass = "usercard-toggle";
          if ("sharer" == shareType) {
            if(0 == shareEntry.sid) {
              shareEntry.name = "所有人";
              domClass = "";
            } else {
              if("department" == shareEntry.entryType) {
                domClass = "";
              } else {
                if("group" == shareEntry.entryType) {
                  if("" == shareEntry.name) {
                    shareEntry.name = "未命名(群组)";
                  }
                  domClass = "";
                }
              }
            }
            if (this.hasUser(shareEntry.sid, $(this.shareEl).find("#shareentrys"))) {
              continue;
            }
            $(this.shareEl).removeClass("hide");
            $(this.parentEl).find($(this.shareEl).attr("icon")).parent().addClass("hide");
            domId = "#shareentrys";
          } else if ("participants" == shareType) {
            if (this.hasUser(shareEntry.sid, $(this.partEl))) {
              continue;
            }
            $(this.partEl).removeClass("hide");
            domId = "#participants";
            $(this.parentEl).find($(this.partEl).attr("icon")).parent().addClass("hide");
          }
          if(!shareEntry.id) {
            shareEntry.id = shareEntry.sid;
            $(this.parentEl).find(domId).attr("data-url", "");
          }
          var shareEntityItem = '<span class="entity-item j_entity_item"> <a class="' + domClass + '" id="' + shareEntry.sid + '" data-value="' + shareEntry.id + '" userId="' + shareEntry.sid + '""><span class="j_shareEntry_name hide">' + shareEntry.name + "</span></a></span>";
          if(0 < $(this.parentEl).find(domId + " .j_more_btn").length && "" != domId) {
            $(this.parentEl).find(domId + " .j_more_btn").before(shareEntityItem);
          } else {
            $(this.parentEl).find(domId).append(shareEntityItem);
          }
          this.renderShareEmpImg(shareEntry, $(this.parentEl).find(domId));
        }
      }
    },
    renderShareEmpImg: function(shareEntry, $el) {
      var midVar = "";
      if("mainline" == this._module || "task" == this._module || "workreport" == this._module) {
        if(shareEntry.shareEmp) {
          midVar = shareEntry.shareEmp;
          midVar = "<img class='avatar' src='" + (midVar.avatar || "/static/images/avatar.png") + "' />";
          $el.find("#" + shareEntry.sid).prepend($(midVar));
        }
      } else {
        if("user" == shareEntry.entryType) {
          midVar = shareEntry.avatar ? "<img class='avatar' src='" + shareEntry.avatar + "' />": "<img class='avatar' src='/static/images/avatar.png' />";
          $el.find("#" + shareEntry.sid).prepend($(midVar));
        }
      }
      $el.find("#" + shareEntry.sid + " .j_shareEntry_name").removeClass("hide");
    },
    findEmployeeId: function() {
      var b = "";
      if (this.shareEntrys) for (var a = 0; a < this.shareEntrys.length; a++) b += this.shareEntrys[a].sid + ",";
      return b
    },
    getLinkIds: function() {
      var b = [];
      $(this.shareEl).find(".entity-item").each(function() {
        b.push($(this).find("a").attr("data-value"))
      });
      return b
    },
    hasUser: function(b, a) {
      var e = !1;
      a.find("a").each(function() {
        var a = $(this).attr("userid");
        parseInt(a) == parseInt(b) && (e = !0)
      });
      return e
    }
  });

  app.components.Userslider = Backbone.View.extend({
    initialize: function(data) {
      this.pageNO = 1;
      this.el = "#member-layer";
      this.userId = data.userId ? data.userId: app.config.currentUser.id;
      this._module = data.module;
      this.dataType = data.dataType;
      this.pageKey = this._module + "#" + this.userId;
      this.isFind = false;
      this.baseUrl = app.config.urlPrefix + '/organizations/' + app.config.organizationId;
      $("#member-layer").html(app.utils.template("component.userslider"));
      app.utils.layout("#memebers-wrapper");
    },
    delegateEvents: function() {
      var self = this, $el = $(self.el);
      $el.on("click.UserSlider", "li.more", function() {
        self.pageNO++;
        self.renderOthers(true);
      });
      $el.on("keydown.UserSlider", "#membersearch-keywords", function(e) {
        if (13 === e.keyCode) {
          self.pageNO = 1;
          self.isFind = true;
          var $li = $el.find("#members li:first");
          $el.find("#members").empty();
          $el.find("#members").prepend($li);
          var keywords = $el.find("#membersearch-keywords").val();
          var url = "";
          switch (self.dataType) {
            case "all":
              url = "/users.json";
              break;
            case "subordinate":
              if("" == $.trim(keywords)) {
                url = self.baseUrl + "/users/workreportSubordinates/" + self.userId + ".json?allSubordinate=false";
              } else {
                url = self.baseUrl + "/users/workreportSubordinates/" + self.userId + ".json";
              }
          }
          self.fetchData(url, keywords);
        }
      });
      $el.on("click.UserSlider", ".j_user p", function(e) {
        var $p = $(this).parent();
        $p.find(".j_expend");
        $p.find("#avatar").attr("user-id");
        var url = $p.find("#avatar").attr("url");
        ROUTER.navigate(url, {
          trigger: true
        });
        void 0 == $(this).parent().attr("parent_id") && $(this).parent().find(".j_expend").trigger("click");
      });
      $el.on("click.UserSlider", ".j_expend", function(e) {
        var $p = $(this).parent();
        var $this = $(this);
        var userId = $p.find("#avatar").attr("user-id");
        var url = "/users/directSubordinates/" + userId + ".json";
        if($this.hasClass("caret")) {
          if($this.hasClass("caret-up")) {
            $this.removeClass("caret-up");
            self.removeSubs($p, userId);
          } else {
            if(!self.existSubs($p, userId)) {
              self.fetchData(url, null, $p, userId);
            }
            $this.addClass("caret-up");
          }
        }
      });
    },
    render: function() {
      $(this.el);
      this.buildUser(app.config.currentUser);
      this.renderOthers(false);
    },
    removeAllSub: function(data, url) {
      var $el = $(this.el);
      $.ajax({
        type: "get",
        url: url,
        dataType: "json",
        success: function(res) {
          if (res && res.subordinates) {
            for (var i = 0; i < res.subordinates.length; i++) {
              $el.find("li[dele_id='" + res.subordinates[i].id + "']").remove();
            }
          }
        }
      })
    },
    removeSubs: function(data, userId) {
      $(this.el).find("li[parent_id='" + userId + "']").each(function() {
        $(this).addClass("hide");
      })
    },
    existSubs: function(data, userId) {
      var $el = $(this.el);
      if($el.find("li[parent_id='" + userId + "']") && 0 < $el.find("li[parent_id='" + userId + "']").size()) {
        $el.find("li[parent_id='" + userId + "']").each(function() {
          $(this).removeClass("hide");
        });
        return true;
      } else {
        return false;
      }
    },
    renderOthers: function(isAllSubordinate) {
      var kw = $(this.el).find("#membersearch-keywords").val();
      var url = '';
      switch (this.dataType) {
        case "all":
          url = "/users.json";
          $("#listTitle").text("所有成员");
          break;
        case "subordinate":
          url = this.baseUrl + "/users/workreportSubordinates/" + this.userId + ".json?allSubordinate=" + isAllSubordinate;
          $("#listTitle").text("我的下属");
      }
      this.fetchData(url, kw);
    },
    fetchData: function(url, userName, $UserSlider, userId) {
      var self = this, $el = $(this.el);
      $.ajax({
        type: "get",
        url: url,
        dataType: "json",
        data: {
          pageNo: self.pageNO,
          pageSize: 10,
          userName: userName
        },
        success: function(res) {
          var page = res.page || [];
          var subordinates = page.result || [];
          if("subordinate" == self.dataType) {
            subordinates = res.subordinates ? res.subordinates: page.result || [];
          }
          $el.find(".more").remove();
          for (var i = 0; i < subordinates.length; i++) {
            var subordinate = subordinates[i];
            if(subordinate && subordinate.id != app.config.currentUser.id) {
              self.buildUser(subordinate, $UserSlider, userId);
            }
          }
          if(page && page.hasNext) {
            $el.find("#members").append('<li class="more"><a>显示更多...</a></li>');
          }
        }
      })
    },
    buildUser: function(subordinate, $UserSlider, userId) {
      var $el = $(this.el),
      username = subordinate.username,
      subordinateId = subordinate.id,
      $user = $("#userClone").clone(),
      avatarUrl = subordinate.avatar ? subordinate.avatar: "/static/images/avatar.png";

      if("subordinate" == this.dataType) {
        $user.find("li").attr("dele_id", subordinate.id);
        subordinate.subordinate && $user.find(".j_expend").addClass("caret");
        if(userId) {
          $user.find("li").attr("parent_id", userId);
        }
        if(subordinateId == app.config.currentUser.id) {
          $user.find(".j_user").removeClass("j_user");
          $user.find("#avatar").attr("href", "/" + this._module + "/" + subordinateId).attr("user-id", subordinateId).attr("user-name", username).find("img").attr("src", avatarUrl);
          $user.find("#name").attr("href", "/" + this._module + "/" + subordinateId).attr("user-id", subordinateId).attr("user-name", username).text(username);
        } else {
          $user.find("#avatar").attr("url", "/" + this._module + "/" + subordinateId).attr("user-id", subordinateId).attr("user-name", username).find("img").attr("src", avatarUrl);
          $user.find("#name").attr("url", "/" + this._module + "/" + subordinateId).attr("user-id", subordinateId).attr("user-name", username).text(username);
        }
      } else {
        $user.find(".j_user").removeClass("j_user");
        $user.find(".j_expend").remove();
        $user.find("#avatar").attr("href", "/" + this._module + "/" + subordinateId).attr("user-id", subordinateId).attr("user-name", username).find("img").attr("src", avatarUrl);
        $user.find("#name").attr("href", "/" + this._module + "/" + subordinateId).attr("user-id", subordinateId).attr("user-name", username).text(username);
      }
      if($UserSlider) {
        $($UserSlider).after($user.html());
      } else {
        $el.find("#members").append($user.html());
      }
    },
    remove: function() {
      $(this.el).off(".UserSlider");
    }
  });

  app.components.Timeline = Backbone.View.extend({

    initialize: function(data) {
      this.userId = data.userId;
      this.year = data.year;
      this.type = data.type;
      this.serialNumber = data.serialNumber;
      this.el = data.container;
      this.parentEl = data.parentEl;
      $(this.el).html(app.utils.template('component.timeline'));
    },
    delegateEvents: function() {
      var self = this, $el = $(this.el);
      $el.on("click.timeline", ".j_timetree_spread", function() {
        var $treeHead = $(this).parent(),
            $treeWeekList = $treeHead.next(".timetree-weeklist"),
            c = $treeHead.parent().siblings(".timetree-month").parent().find(".timetree-weeklist");
        if($treeWeekList.is(":visible")) {
          $treeWeekList.slideUp("fast");
          $treeHead.addClass("active");
        } else {
          $(".timetree-head").removeClass("active");
          $treeHead.addClass("active");
          c.slideUp("fast");
          $treeWeekList.slideDown("fast");
        }
        $(".j_week").removeClass("active");
        var month = $(this).parent().find("strong").text();
        var year = $(".reports-selectyear span").text();
        ROUTER.navigate("/workreport/" + self.userId + "/" + year + "/month/" + month, {
            trigger: true
        });
        $(".reports-panel").data("year", year).data("type", "month").data("serialNumber", month);
      });
      $el.on("click.timeline", ".dropdown-menu a", function(e) {
        $(this).parents(".dropdown-menu").slideUp(100);
        $(this).parents(".dropdown-menu-toggle").removeData("showTimer");
        var year = $(this).text();
        $(this).parents(".dropdown").find("span").text(year);
        self.genYearSelect(year);
        self.genTimeLineByYear(year);
      });
      $el.on("click.timeline", ".halfyear", function(e) {
        var $this = $(this);
        self.changeCSS($this);
        var year = $(".reports-selectyear span").text();
        ROUTER.navigate("/workreport/" + self.userId + "/" + year + "/halfYear", {
          trigger: true
        });
        $(".reports-panel").data("year", year).data("type", "halfYear");
      });
      $el.on("click.timeline", ".endyear", function(e) {
        var $this = $(this);
        self.changeCSS($this);
        var year = $(".reports-selectyear span").text();
        ROUTER.navigate("/workreport/" + self.userId + "/" + year + "/year", {
            trigger: true
        });
        $(".reports-panel").data("year", year).data("type", "year")
      });
      $el.on("click.timeline", ".season", function(e) {
        var $this = $(this);
        self.changeCSS($this);
        var serialNumber = $this.attr("serialNumber");
        var year = $(".reports-selectyear span").text();
        ROUTER.navigate("/workreport/" + self.userId + "/" + year + "/season/" + serialNumber, {
          trigger: true
        });
        $(".reports-panel").data("year", year).data("type", "season").data("serialNumber", serialNumber);
      });
      $el.on("click.timeline", ".j_week", function(e) {
        e.preventDefault();
        var $this = $(this), year, week;
        $(".j_week").each(function(index, el) {
          if($(el).hasClass("active")) {
            $(el).removeClass("active")
          }
        });
        if(!$this.hasClass("active")){
          $this.addClass("active");
        }
        $this.parent().prev().removeClass("active");
        $(".reports-body").data("reportId", null);
        year = $(".reports-selectyear span").text();
        week = $this.find("span").text();
        ROUTER.navigate("/workreport/" + self.userId + "/" + year + "/week/" + week, {
          trigger: true
        });
        $(".reports-panel")
          .data("year", year)
          .data("type", "week")
          .data("serialNumber", week);
      })
    },
    render: function() {
      $(this.el);
      this.renderTimeLine();
//      app.utils.layout("#timeline");
      $("#myReport").addClass("router").attr("href", "/workreport/" + this.userId);
    },
    changeCSS: function(el) {
      if(el.hasClass("season")) {
        if(1 == el.attr("serialNumber")) {
          $("div[serialnumber=1]").addClass("active");
          $("div[serialnumber=3]").removeClass("active");
        } else {
          $("div[serialnumber=3]").addClass("active");
          $("div[serialnumber=1]").removeClass("active");
        }
        $(".timetree-weeklist").css("display", "none");
        $(".halfyear").removeClass("active");
        $(".endyear").removeClass("active");
        $(".month").removeClass("active");
        $(".j_week").removeClass("active");
      }
      if(el.hasClass("halfyear")) {
        $(".halfyear").addClass("active");
        $(".timetree-weeklist").css("display", "none");
        $("div[serialnumber=1]").removeClass("active");
        $("div[serialnumber=3]").removeClass("active");
        $(".endyear").removeClass("active");
        $(".month").removeClass("active");
        $(".j_week").removeClass("active");
      }
      if(el.hasClass("endyear")) {
        $(".endyear").addClass("active");
        $(".timetree-weeklist").css("display", "none");
        $("div[serialnumber=1]").removeClass("active");
        $("div[serialnumber=3]").removeClass("active");
        $(".halfyear").removeClass("active");
        $(".month").removeClass("active");
        $(".j_week").removeClass("active");
      }
    },
    renderTimeLine: function() {
      if(this.type) {
        this.genYearSelect(this.year);
        if("week" == this.type) {
          this.genTimeLineByYear(this.year, this.serialNumber);
        } else if("month" == this.type) {
           this.genTimeLineByYear(this.year, null, this.serialNumber);
        } else {
          this.genTimeLineByYear(this.year, -1, -1);
        }
      } else {
        this.genYearSelect();
        this.genTimeLineByYear();
      }
    },
    genYearSelect: function(year) {
      var $el = $(this.el),
          activeYear = parseInt(Date.create(app.config.currentUser.activeDate).getFullYear()),
          nowYear = parseInt(Date.create(app.config.organization.nowTime).getFullYear()),
          nowTime = new Date(app.config.organization.nowTime);
      if(year) {
        year = parseInt(year);
        $el.find(".dropdown-toggle").find("span").text(year);
        $el = $el.find(".dropdown-menu");
        $el.html("");
        if(year - 2 >= activeYear) {
          $el.append("<li><a>" + (year - 2) + "</a></li>");
        }
        if(year - 1 >= activeYear) {
          $el.append("<li><a>" + (year - 1) + "</a></li>");
        }
        $el.append("<li><a>" + year + "</a></li>");
        if(year + 1 <= nowYear) {
          $el.append("<li><a>" + (year + 1) + "</a></li>");
        }
        if(year + 2 <= nowYear) {
          $el.append("<li><a>" + (year + 2) + "</a></li>");
        }
      } else {
        if(1 == nowTime.getISOWeek() && 12 == nowTime.getMonth() + 1) {
          nowYear += 1;
        }
        $el.find(".dropdown-toggle").find("span").text(nowYear);
        $el = $el.find(".dropdown-menu");
        $el.html("");
        if(nowYear - 2 >= activeYear) {
          $el.append("<li><a>" + (nowYear - 2) + "</a></li>");
        }
        if(nowYear - 1 >= activeYear) {
          $el.append("<li><a>" + (nowYear - 1) + "</a></li>");
        }
        $el.append("<li><a>" + nowYear + "</a></li>");
      }
    },
    genTimeLineByYear: function(year, week, serialNumber) {
      var nowTime = new Date(app.config.organization.nowTime);
      if(!year) {
        if(1 == nowTime.getISOWeek() && 12 == nowTime.getMonth() + 1) {
          year = nowTime.getFullYear() + 1;
        } else {
          year = nowTime.getFullYear();
        }
      }
      var cal_week = this.getWeeksOfYear(this.getWeekDayDate(year, 1, 1), year);
      if(!week) {
        week = nowTime.getISOWeek();
      }
      var weekDayDate, $weekEl, $endYearEl;
      (new Date(app.config.organization.nowTime)).getMonth();
      var nextMonth = 2,
          month = 1,
          $seasonEl = true,
          $halfYearEl = true,
          $thirdSeasonEl = true,
          $monthEl, $timeTree = $(".reports-timetree"),
          isThisYear = false;
      $timeTree.html("");
      for (var w = 1; w <= cal_week; w++) {
        weekDayDate = this.getWeekDayDate(year, w, 1);
        if(3 < month && $seasonEl) {
          $seasonEl = $("#season").clone();
          $seasonEl.find("span").text("第一季度");
          $seasonEl.find(".season").attr("serialNumber", 1);
          $timeTree.append($seasonEl.html());
          $seasonEl = false;
        } else if(6 < month && $halfYearEl) {
          $halfYearEl = $("#halfyear").clone();
          $timeTree.append($halfYearEl.html());
          $halfYearEl = false;
        } else if(9 < month && $thirdSeasonEl) {
          $thirdSeasonEl = $("#season").clone();
          $thirdSeasonEl.find("span").text("第三季度");
          $thirdSeasonEl.find(".season").attr("serialNumber", 3);
          $timeTree.append($thirdSeasonEl.html());
          $thirdSeasonEl = !1;
        }
        if(1 != w) {
          month = weekDayDate.getMonth() + 1
        }
        if(year == weekDayDate.getFullYear()) {
          isThisYear = true;
        } else {
          isThisYear = year != weekDayDate.getFullYear() && 1 == w;
        }
        if(nextMonth != month) {
          if($monthEl) {
            $timeTree.append($monthEl.html());
          }
          nextMonth = month;
          $monthEl = $("#month").clone();
          $monthEl.find("strong").text(month);
          $weekEl = $("#week").clone();
          if(isThisYear && month == serialNumber) {
            $monthEl.find(".timetree-head").addClass("active");
            $monthEl.find(".timetree-weeklist").css("display", "block");
          }
        } else {
          $weekEl = $("#week").clone();
        }
        if(isThisYear && w == week && !serialNumber) {
          $weekEl.find("span").text(w);
          $weekEl.find("li").addClass("active");
          $monthEl.find(".timetree-weeklist").css("display", "block");
        } else {
          $weekEl.find("span").text(w);
        }
        $monthEl.find(".timetree-weeklist").append($weekEl.html());
        if(w == cal_week) {
          $(".reports-timetree").append($monthEl.html());
          $endYearEl = $("#endyear").clone();
          $endYearEl.find("span").text(year + "年度");
          $timeTree.append($endYearEl.html());
        }
      }
    },
    getWeeksOfYear: function(date, year) {
      var daysOfYear = 0 == year % 4 && 0 != year % 100 || 0 == year % 400 ? 366 : 365; // 闰年 366 天
      return Math.ceil((daysOfYear - date.getDay()) / 7);
    },
    getWeekDayDate: function(year, week, weekDay) {
      var date = new Date(year, "0", "1");
      var time = date.getTime();
      date.setTime(time + 6048E5 * (week - 1));
      return this.getNextDate(date, weekDay);
    },
    getNextDate: function(date, weekDay) {
      weekDay %= 7;
      var day = date.getDay(), time = date.getTime();
      date.setTime(time + 864E5 * (weekDay - day));
      return date;
    },
    update: function(userId, year, type, serialNumber, isMyReport) {
      this.userId = userId;
      this.year = year;
      this.type = type;
      this.serialNumber = serialNumber;
      this.isMyReport = isMyReport;
    },
    remove: function() {
      $(this.el).off(".timeline")
    }
  });

}(app, Backbone, jQuery, _));