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
        $(this.partEl).html(_.template("share.simpleshare")({
          panel: "participants"
        }));
      }
      $(this.shareEl).html(_.template("share.shareall")({
        panel: "share"
      }));
      if("mainline" == this._module || "task" == this._module || "workreport" == this._module) {
        $(this.shareEl).find("#share-select").addClass("hide");
      }
    },
    delegateEvents: function() {
      var b = this;
      $(b.shareEl).off("click", ".j_more_show").on("click ", ".j_more_show", function(a) {
        a.stopPropagation();
        a = $(this);
        var e = a.data("type");
        a.addClass("hide").siblings(".j_more_hide").removeClass("hide");
        $(b.shareEl + " #" + e).children(".j_entity_item").show()
      });
      $(b.partEl).off("click", ".j_more_show").on("click ", ".j_more_show", function(a) {
        a.stopPropagation();
        a = $(this);
        var e = a.data("type");
        a.addClass("hide").siblings(".j_more_hide").removeClass("hide");
        $(b.partEl + " #" + e).children(".j_entity_item").show()
      });
      $(b.shareEl).off("click", ".j_more_hide").on("click ", ".j_more_hide", function(a) {
        a.stopPropagation();
        a = $(this);
        var e = a.data("type");
        a.addClass("hide").siblings(".j_more_show").removeClass("hide");
        $(b.shareEl + " #" + e).find(".j_entity_item:lt(5)").show();
        $(b.shareEl + " #" + e).find(".j_entity_item:gt(4)").hide()
      });
      $(b.partEl).off("click", ".j_more_hide").on("click ", ".j_more_hide", function(a) {
        a.stopPropagation();
        a = $(this);
        var e = a.data("type");
        a.addClass("hide").siblings(".j_more_show").removeClass("hide");
        $(b.partEl + " #" + e).find(".j_entity_item:lt(5)").show();
        $(b.partEl + " #" + e).find(".j_entity_item:gt(4)").hide()
      });
      $(b.shareEl).off("click", ".entity-item .close").on("click ", ".entity-item .close", function(a) {
        a.stopPropagation();
        b.deleteEvent($(this))
      });
      $(b.partEl).off("click", ".entity-item .close").on("click ", ".entity-item .close", function(a) {
        a.stopPropagation();
        b.deleteEvent($(this))
      });
      $(b.shareEl).find("#share-select").change(function() {
        var val = $(this).val();
        "all" == val ? ($(".sharetype-dept").addClass("hide"), $(".sharetype-group").addClass("hide"), $(".sharetype-user").removeClass("hide"), $(b.shareEl).find("#editShare").removeClass("hide"), $(b.shareEl).find(".typeahead-wrapper").addClass("hide"), $(this).val("user"), b.save(val, [{
          id: 0
        }], "sharer")) : "group" == val ? ($(".sharetype-dept").addClass("hide"), $(".sharetype-group").removeClass("hide"), $(".sharetype-user").addClass("hide")) : "department" == val ? ($(".sharetype-dept").removeClass("hide"), $(".sharetype-group").addClass("hide"), $(".sharetype-user").addClass("hide")) : "user" == val && ($(".sharetype-group").addClass("hide"), $(".sharetype-dept").addClass("hide"), $(".sharetype-user").removeClass("hide"))
      });
      d([{
        el: b.shareEl + " .sharetype-group input",
        callback: function(a) {
          b.save("group", [a], "sharer")
        }
      },
      {
        el: b.shareEl + " .sharetype-dept input",
        callback: function(a) {
          b.save("department", [a], "sharer")
        }
      },
      {
        el: b.shareEl + " .sharetype-user input",
        callback: function(a) {
          b.save("user", a, "sharer")
        }
      }]);
      this.partEl && d({
        el: b.partEl + " #typeahead-participants",
        callback: function(a) {
          b.save("user", a, "participants")
        }
      })
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
              f.notify("\u6570\u636e\u5df2\u5220\u9664");
              a.callbacks && a.callbacks.unlink && a.callbacks.unlink(c, b.streams || b.stream)
            }
          })
        };
        d.attr("data-noConfirm") ? b(!0) : f.confirm("\u786e\u5b9a\u8981\u5220\u9664\u5417\uff1f", b)
      } else b.parent().hasClass("tag") || (b.parent(".entity-item").remove(), d.trigger("removeEntity", e))
    },
    render: function(b, a) {
      var e = this.model,
      c = this;
      c.entityId && (a ? e.query(function(a) {
        c.createShareEntryLink(a.shareEntrys);
        c.shareEntrys = a.shareEntrys
      }) : (c.shareEntrys = b, c.createShareEntryLink(b)));
      c.renderMoreType("#participants");
      c.renderMoreType("#shareentrys")
    },
    renderMoreType: function(b) {
      if (b) {
        var a = $(this.parentEl).find(b).children(),
        e = a.length;
        $(this.parentEl + " " + b + " .j_more_show");
        if (5 < e) {
          for (var c = 5; c < e; c++) $(a[c]).hide();
          $(this.parentEl).find(b).find(".j_more_btn").remove();
          a = b && 1 < b.length && b.substr(1) || "";
          $(this.parentEl).find(b).append('\x3cspan class\x3d"j_more_btn"\x3e\x3cspan class\x3d"j_more_show" data-type\x3d"' + a + '"\x3e\x3ca\x3e\u663e\u793a\u66f4\u591a...\x3c/a\x3e\x3c/span\x3e\x3cspan class\x3d"j_more_hide hide" data-type\x3d"' + a + '"\x3e\x3ca\x3e\u6536\u8d77\x3c/a\x3e\x3c/span\x3e\x3c/span\x3e')
        }
      }
    },
    save: function(b, a, e) {
      var c = this,
      d = this.model;
      if (a && !$.isEmptyObject(a)) {
        if ("sharer" == e) {
          if ("all" == b && 0 < $(this.shareEl).find("#shareentrys a[userid=0]").length) {
            f.notify("\u5df2\u5171\u4eab\u7ed9\u6240\u6709\u4eba,\u4e0d\u7528\u91cd\u590d\u6dfb\u52a0");
            return
          }
          if ("department" == b && 0 < $(this.shareEl).find("#shareentrys a[userid\x3d" + a[0].id + "]").length) {
            f.notify("\u5df2\u5171\u4eab\u7ed9\u8be5\u90e8\u95e8,\u4e0d\u7528\u91cd\u590d\u6dfb\u52a0");
            return
          }
          if ("user" == b && 0 < $(this.shareEl).find("#shareentrys a[userid\x3d" + a.id + "]").length) {
            f.notify("\u5df2\u5b58\u5728\u5171\u4eab\u4eba,\u4e0d\u7528\u91cd\u590d\u6dfb\u52a0");
            return
          }
        }
        var k = "";
        a = $.isArray(a) ? a: [a];
        for (var q = [], p = 0; p < a.length; p++) {
          var n = a[p];
          if ("sharer" == e) {
            if (c.hasUser(n.id, $(c.shareEl).find("#shareentrys"))) continue
          } else if ("participants" == e && c.hasUser(n.id, $(c.partEl))) continue;
          k += n.id + ",";
          q.push({
            sid: n.id,
            name: n.name,
            shareType: e
          })
        }
        k = k.substring(0, k.length - 1);
        d.sids = k;
        d.entryType = b;
        d.shareType = e;
        c.shareEntrys || (c.shareEntrys = []);
        c.entityId ? ("all" == b && f.notify("\u5171\u4eab\u7ed9\u6240\u6709\u4eba\u65f6\uff0c\u64cd\u4f5c\u65f6\u95f4\u8f83\u957f\uff0c\u8bf7\u8010\u5fc3\u7b49\u5f85..."), d.saveAll(function(a) {
          a.msg ? f.notify(a.msg) : (c.createShareEntryLink(a.shareEntrys), c.shareEntrys.add(a.shareEntrys), "sharer" == e && (a.addUserMessage ? f.notify(a.addUserMessage) : f.notify("\u5df2\u6dfb\u52a0\u5171\u4eab\u4eba")), "participants" == e && (a.addUserMessage ? f.notify(a.addUserMessage) : f.notify("\u5df2\u6dfb\u52a0\u53c2\u4e0e\u4eba")), $(c.parentEl).find("#stream").trigger("insertStream", a.streams), $(c.parentEl).find("#readinfo").trigger("insertReadInfo", [c.entityId, c.shareEntrys]))
        })) : (c.createShareEntryLink(q), c.shareEntrys.push(q))
      }
    },
    createShareEntryLink: function(b) {
      if (b) for (var a = 0; a < b.length; a++) {
        var e = b[a],
        c = e.shareType,
        d = "",
        f = "usercard-toggle";
        if ("sharer" == c) {
          0 == e.sid ? (e.name = "\u6240\u6709\u4eba", f = "") : "department" == e.entryType ? f = "": "group" == e.entryType && ("" == e.name && (e.name = "\u672a\u547d\u540d(\u7fa4\u7ec4)"), f = "");
          if (this.hasUser(e.sid, $(this.shareEl).find("#shareentrys"))) continue;
          $(this.shareEl).removeClass("hide");
          $(this.parentEl).find($(this.shareEl).attr("icon")).parent().addClass("hide");
          d = "#shareentrys"
        } else if ("participants" == c) {
          if (this.hasUser(e.sid, $(this.partEl))) continue;
          $(this.partEl).removeClass("hide");
          d = "#participants";
          $(this.parentEl).find($(this.partEl).attr("icon")).parent().addClass("hide")
        }
        e.id || (e.id = e.sid, $(this.parentEl).find(d).attr("data-url", ""));
        c = '\x3cspan class\x3d"entity-item j_entity_item"\x3e \x3ca class\x3d"' + f + '" id\x3d"' + e.sid + '" data-value\x3d"' + e.id + '" userId\x3d"' + e.sid + '""\x3e\x3cspan class\x3d"j_shareEntry_name hide"\x3e' + e.name + "\x3c/span\x3e\x3c/a\x3e\x3c/span\x3e";
        0 < $(this.parentEl).find(d + " .j_more_btn").length && "" != d ? $(this.parentEl).find(d + " .j_more_btn").before(c) : $(this.parentEl).find(d).append(c);
        this.renderShareEmpImg(e, $(this.parentEl).find(d))
      }
    },
    renderShareEmpImg: function(b, a) {
      var e = "";
      "mainline" == this._module || "task" == this._module || "workreport" == this._module ? b.shareEmp && (e = b.shareEmp, e = "\x3cimg class\x3d'avatar' src\x3d'" + (e.avatar && e.avatar.p5 && "/base/download/" + e.avatar.p5 || "/static/images/avatar.png") + "' /\x3e", a.find("#" + b.sid).prepend($(e))) : "user" == b.entryType && (e = b.avatar ? "\x3cimg class\x3d'avatar' src\x3d'/base/download/" + b.avatar.p5 + "' /\x3e": "\x3cimg class\x3d'avatar' src\x3d'/static/images/avatar.png' /\x3e", a.find("#" + b.sid).prepend($(e)));
      a.find("#" + b.sid + " .j_shareEntry_name").removeClass("hide")
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

  app.components.Timeline = Backbone.View.extend({

    template: _.template(app.templates.time_line),

    initialize: function(data) {
      this.userId = data.userId;
      this.year = data.year;
      this.type = data.type;
      this.serialNumber = data.serialNumber;
      this.el = data.container;
      this.parentEl = data.parentEl;
      $(this.el).html(this.template());
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
      var h;
      (new Date(app.config.organization.nowTime)).getMonth();
      var a = 2,
          f = 1,
          k = !0,
          g = !0,
          p = !0,
          n, $timeTree = $(".reports-timetree"),
          u = !1;
      $timeTree.html("");
      for (var w = 1; w <= cal_week; w++) {
        h = this.getWeekDayDate(year, w, 1);
        if(3 < f && k) {
          k = $("#season").clone();
          k.find("span").text("第一季度");
          k.find(".season").attr("serialNumber", 1);
          $timeTree.append(k.html());
          k = !1;
        } else if(6 < f && g) {
          g = $("#halfyear").clone();
          $timeTree.append(g.html());
          g = !1;
        } else if(9 < f && p) {
          p = $("#season").clone();
          p.find("span").text("第三季度");
          p.find(".season").attr("serialNumber", 3);
          $timeTree.append(p.html());
          p = !1;
        }
        if(1 != w) {
          f = h.getMonth() + 1
        }
        if(year == h.getFullYear()) {
          u = true;
        } else {
          u = year != h.getFullYear() && 1 == w;
        }
        if(a != f) {
          if(n) {
            $timeTree.append(n.html());
          }
          a = f;
          n = $("#month").clone();
          n.find("strong").text(f);
          h = $("#week").clone();
          if(u && f == serialNumber) {
            n.find(".timetree-head").addClass("active");
            n.find(".timetree-weeklist").css("display", "block");
          }
        } else {
          h = $("#week").clone();
        }
        if(u && w == week && !serialNumber) {
          h.find("span").text(w);
          h.find("li").addClass("active");
          n.find(".timetree-weeklist").css("display", "block");
        } else {
          h.find("span").text(w);
        }
        n.find(".timetree-weeklist").append(h.html());
        if(w == cal_week) {
          $(".reports-timetree").append(n.html());
          h = $("#endyear").clone();
          h.find("span").text(year + "年度");
          $timeTree.append(h.html());
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