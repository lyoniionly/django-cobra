(function (app, Backbone, jQuery, _) {
  "use strict";

   var $ = jQuery;

  app.components = {};

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
              url: "/base/upload.json?refId\x3d" + c.targetId + "\x26module\x3d" + c._module + "\x26ETEAMSID\x3d" + ETEAMSID,
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
              -600 == b.code && f.notify("\u53ea\u80fd\u4e0a\u4f20\u6700\u5927\u4e0d\u8d85\u8fc7" + a.settings.max_file_size / 1024 / 1024 + "M\u7684\u6587\u4ef6", "\u6587\u4ef6\u5927\u5c0f\u8d85\u8fc7\u9650\u5236", "error");
              a.refresh()
          });
      b.bind("FileUploaded",
          function(a, b, h) {
              a = jQuery.parseJSON(h.response);
              h = a.fileObj;
              c.callback && c.callback(a);
              c.callbacks && c.callbacks.link && c.callbacks.link(h, a.stream);
              $(c.container).trigger("FileUploaded", h);
              f.notify("\u6587\u4ef6\u4e0a\u4f20\u6210\u529f");
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
                  f.confirm("\u786e\u5b9a\u8981\u5220\u9664\u5417\uff1f",
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
                                  f.notify("\u6570\u636e\u5df2\u5220\u9664");
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

  app.components.Timeline = Backbone.View.extend({

      template: _.template(app.templates.time_line),

      initialize: function(d) {
          this.userId = d.userId;
          this.year = d.year;
          this.type = d.type;
          this.serialNumber = d.serialNumber;
          this.el = d.container;
          this.parentEl = d.parentEl;
          $(this.el).html(this.template())
      },
      delegateEvents: function() {
          var d = this,
              c = $(this.el);
          c.on("click.timeline", ".j_timetree_spread",
              function() {
                  var b = $(this).parent(),
                      a = b.next(".timetree-weeklist"),
                      c = b.parent().siblings(".timetree-month").parent().find(".timetree-weeklist");
                  a.is(":visible") ? (a.slideUp("fast"), b.addClass("active")) : ($(".timetree-head").removeClass("active"), b.addClass("active"), c.slideUp("fast"), a.slideDown("fast"));
                  $(".j_week").removeClass("active");
                  b = $(this).parent().find("strong").text();
                  a = $(".reports-selectyear span").text();
                  /*ROUTER.navigate("/workreport/" + d.userId + "/" + a + "/month/" + b, {
                      trigger: !0
                  });*/
                  $(".reports-panel").data("year", a).data("type", "month").data("serialNumber", b)
              });
          c.on("click.timeline", ".dropdown-menu a", function(b) {
                  $(this).parents(".dropdown-menu").slideUp(100);
                  $(this).parents(".dropdown-menu-toggle").removeData("showTimer");
                  b = $(this).text();
                  $(this).parents(".dropdown").find("span").text(b);
                  d.genYearSelect(b);
                  d.genTimeLineByYear(b)
              });
          c.on("click.timeline", ".halfyear",
              function(b) {
                  b = $(this);
                  d.changeCSS(b);
                  b = $(".reports-selectyear span").text();
                  /*ROUTER.navigate("/workreport/" + d.userId + "/" + b + "/halfYear", {
                      trigger: !0
                  });*/
                  $(".reports-panel").data("year", b).data("type", "halfYear")
              });
          c.on("click.timeline", ".endyear",
              function(b) {
                  b = $(this);
                  d.changeCSS(b);
                  b = $(".reports-selectyear span").text();
                  /*ROUTER.navigate("/workreport/" + d.userId + "/" + b + "/year", {
                      trigger: !0
                  });*/
                  $(".reports-panel").data("year", b).data("type", "year")
              });
          c.on("click.timeline", ".season", function(b) {
            b = $(this);
            d.changeCSS(b);
            b = b.attr("serialNumber");
            var a = $(".reports-selectyear span").text();
            /*ROUTER.navigate("/workreport/" + d.userId + "/" + a + "/season/" + b, {
                trigger: !0
            });*/
            $(".reports-panel").data("year", a).data("type", "season").data("serialNumber", b)
          });
          c.on("click.timeline", ".j_week", function(e) {
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
            ROUTER.navigate("/workreport/" + d.userId + "/" + year + "/week/" + week, {
              trigger: true
            });
            $(".reports-panel").data("year", year).data("type", "week").data("serialNumber", week)
          })
      },
      render: function() {
          $(this.el);
          this.renderTimeLine();
//          f.layout("#timeline");
          $("#myReport").addClass("router").attr("href", "/workreport/" + this.userId)
      },
      changeCSS: function(d) {
          d.hasClass("season") && (1 == d.attr("serialNumber") ? ($("div[serialnumber=1]").addClass("active"), $("div[serialnumber=3]").removeClass("active")) : ($("div[serialnumber=3]").addClass("active"), $("div[serialnumber=1]").removeClass("active")), $(".timetree-weeklist").css("display", "none"), $(".halfyear").removeClass("active"), $(".endyear").removeClass("active"), $(".month").removeClass("active"), $(".j_week").removeClass("active"));
          d.hasClass("halfyear") && ($(".halfyear").addClass("active"), $(".timetree-weeklist").css("display", "none"), $("div[serialnumber=1]").removeClass("active"), $("div[serialnumber=3]").removeClass("active"), $(".endyear").removeClass("active"), $(".month").removeClass("active"), $(".j_week").removeClass("active"));
          d.hasClass("endyear") && ($(".endyear").addClass("active"), $(".timetree-weeklist").css("display", "none"), $("div[serialnumber=1]").removeClass("active"), $("div[serialnumber=3]").removeClass("active"), $(".halfyear").removeClass("active"), $(".month").removeClass("active"), $(".j_week").removeClass("active"))
      },
      renderTimeLine: function() {
          this.type ? (this.genYearSelect(this.year), "week" == this.type ? this.genTimeLineByYear(this.year, this.serialNumber) : "month" == this.type ? this.genTimeLineByYear(this.year, null, this.serialNumber) : this.genTimeLineByYear(this.year, -1, -1)) : (this.genYearSelect(), this.genTimeLineByYear())
      },
      genYearSelect: function(d) {
          var c = $(this.el),
              b = parseInt(Date.create(app.config.currentUser.activeDate).getFullYear()),
              a = parseInt(Date.create(app.config.organization.nowTime).getFullYear()),
              e = new Date(app.config.organization.nowTime);
          d ? (d = parseInt(d),
            c.find(".dropdown-toggle").find("span").text(d),
            c = c.find(".dropdown-menu"),
            c.html(""),
            d - 2 >= b && c.append("<li><a>" + (d - 2) + "</a></li>"),
            d - 1 >= b && c.append("<li><a>" + (d - 1) + "</a></li>"),
            c.append("<li><a>" + d + "</a></li>"),
            d + 1 <= a && c.append("<li><a>" + (d + 1) + "</a></li>"),
            d + 2 <= a && c.append("<li><a>" + (d + 2) + "</a></li>")) : (1 == e.getISOWeek() && 12 == e.getMonth() + 1 && (a += 1),
            c.find(".dropdown-toggle").find("span").text(a),
            c = c.find(".dropdown-menu"),
            c.html(""),
            a - 2 >= b && c.append("<li><a>" + (a - 2) + "</a></li>"),
            a - 1 >= b && c.append("<li><a>" + (a - 1) + "</a></li>"),
            c.append("<li><a>" + a + "</a></li>"))
      },
      genTimeLineByYear: function(d, c, b) {
          var a = new Date(app.config.organization.nowTime);
          d = d ? d : 1 == a.getISOWeek() && 12 == a.getMonth() + 1 ? a.getFullYear() + 1 : a.getFullYear();
          var e = this.getWeekDayDate(d, 1, 1),
              e = this.getWeeksOfYear(e, d);
          c = c ? c : a.getISOWeek();
          var h;
          (new Date(app.config.organization.nowTime)).getMonth();
          var a = 2,
              f = 1,
              k = !0,
              g = !0,
              p = !0,
              n, s = $(".reports-timetree"),
              u = !1;
          s.html("");
          for (var w = 1; w <= e; w++) h = this.getWeekDayDate(d, w, 1),
              3 < f && k ? (k = $("#season").clone(), k.find("span").text("第一季度"), k.find(".season").attr("serialNumber", 1), s.append(k.html()), k = !1) : 6 < f && g ? (g = $("#halfyear").clone(), s.append(g.html()), g = !1) : 9 < f && p && (p = $("#season").clone(), p.find("span").text("第三季度"), p.find(".season").attr("serialNumber", 3), s.append(p.html()), p = !1),
              1 != w && (f = h.getMonth() + 1),
              u = d == h.getFullYear() || d != h.getFullYear() && 1 == w ? !0 : !1,
              a != f ? (n && s.append(n.html()), a = f, n = $("#month").clone(), n.find("strong").text(f), h = $("#week").clone(), u && f == b && (n.find(".timetree-head").addClass("active"), n.find(".timetree-weeklist").css("display", "block"))) : h = $("#week").clone(),
              u && w == c && !b ? (h.find("span").text(w), h.find("li").addClass("active"), n.find(".timetree-weeklist").css("display", "block")) : h.find("span").text(w),
              n.find(".timetree-weeklist").append(h.html()),
              w == e && ($(".reports-timetree").append(n.html()), h = $("#endyear").clone(), h.find("span").text(d + "年度"), s.append(h.html()))
      },
      getWeeksOfYear: function(d, c) {
          return Math.ceil(((0 == c % 4 && 0 != c % 100 || 0 == c % 400 ? 366 : 365) - d.getDay()) / 7)
      },
      getWeekDayDate: function(d, c, b) {
          d = new Date(d, "0", "1");
          var a = d.getTime();
          d.setTime(a + 6048E5 * (c - 1));
          return this.getNextDate(d, b)
      },
      getNextDate: function(d, c) {
          c %= 7;
          var b = d.getDay(),
              a = d.getTime();
          d.setTime(a + 864E5 * (c - b));
          return d
      },
      update: function(d, c, b, a, e) {
          this.userId = d;
          this.year = c;
          this.type = b;
          this.serialNumber = a;
          this.isMyReport = e
      },
      remove: function() {
          $(this.el).off(".timeline")
      }
  });

}(app, Backbone, jQuery, _));