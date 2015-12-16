(function (app, Backbone) {
  "use strict";

  app.models = {};

  app.models.Group = Backbone.Model.extend({

    defaults: {
      count: 0,
      version: 0,
      annotations: [],
      tags: [],
      hasSeen: false,
      isBookmarked: false,
      historicalData: [],
      waveData: []
    }

  });

  app.models.WorkReportModel = Backbone.Model.extend({
      initialize: function(f) {
          this.page = {
              pageNo: 1,
              pageSize: 10
          };
        this.baseUrl = app.config.urlPrefix + '/organizations/' + app.config.organizationId + '/summary/ajax/';
      },
      loadDepartment: function(f) {
          $.ajax({
              type: "post",
              url: "/workreport/queryDepartment.json",
              dataType: "json",
              success: function(d) {
                  f && f(d)
              }
          })
      },
      queryWorkReport: function(f, d) {
        var url = this.baseUrl + 'view.json';
          $.ajax({
              type: "get",
              url: url,
              dataType: "json",
              data: f,
              success: function(c) {
                  d && d(c)
              }
          })
      },
      loadReport: function(f, d, c, b, a) {
          $.ajax({
              type: "post",
              url: "/workreport/loadReport.json",
              dataType: "json",
              data: {
                  currentYear: f,
                  choiceType: c,
                  checkType: d,
                  departmentId: b
              },
              success: function(b) {
                  a && a(b)
              }
          })
      },
      queryGoalUserlist: function(f, d, c, b, a, e) {
          $.ajax({
              type: "post",
              url: "/workreport/queryGoalUserList.json",
              dataType: "json",
              data: {
                  currentYear: f,
                  choiceType: c,
                  checkType: d,
                  number: b,
                  departmentId: a
              },
              success: function(a) {
                  e && e(a)
              }
          })
      },
      create: function(f, d) {
          $.ajax({
              type: "post",
              url: "/workreport.json",
              dataType: "json",
              data: f,
              success: function(c) {
                  d && d(c)
              }
          })
      },
      update: function(f, d) {
          f._method = "PUT";
          $.ajax({
              type: "post",
              url: "/workreport/" + f["workReport.id"] + ".json?",
              dataType: "json",
              data: f,
              success: function(c) {
                  d && d(c)
              }
          })
      },
      queryWorkReportType: function(f, d, c, b) {
          $.ajax({
              type: "get",
              url: "/workreport.json",
              dataType: "json",
              data: {
                  type: f,
                  pageSize: this.page.pageSize,
                  pageNo: this.page.pageNo,
                  commentTime: d,
                  unreadFlag: c
              },
              async: !1,
              success: function(a) {
                  b && b(a)
              }
          })
      },
      getUnreadCount: function(f) {
          $.ajax({
              type: "get",
              url: "/workreport/unreadCount.json",
              dataType: "json",
              success: function(d) {
                  f && f(d)
              }
          })
      },
      readAll: function(f) {
          $.ajax({
              type: "get",
              url: "/workreport/readAll.json",
              dataType: "json",
              success: function(d) {
                  f && f(d)
              }
          })
      }
  });

  app.models.Share = Backbone.Model.extend({
    id: 1,
    entityId: 1,
    entityIds: "",
    sids: "",
    shareType: "sharer",
    original: !1,
    initialize: function(f) {
      this.entityId = f.entityId;
      this.entityIds = f.entityIds;
      this.serverPath = f.serverPath ? f.serverPath: "";
      this._module = f.module
    },
    save: function(f) {
      $.ajax({
        type: "post",
        url: this.serverPath + "/share/editUser.json",
        dataType: "json",
        data: {
          sids: this.sids,
          entityIds: this.entityIds,
          entryType: this.entryType,
          module: this._module,
          shareType: this.shareType
        },
        success: function(d) {
          f && f(d)
        }
      })
    },
    saveAll: function(f) {
      $.ajax({
        type: "post",
        url: this.serverPath + "/share/addUser.json",
        dataType: "json",
        data: {
          sids: this.sids,
          entityIds: this.entityIds,
          entryType: this.entryType,
          module: this._module,
          shareType: this.shareType
        },
        success: function(d) {
          f && f(d)
        }
      })
    },
    saveAllSearch: function(f, d) {
      $.ajax({
        contentType: "application/json;charset\x3dUTF-8",
        type: "post",
        url: this.serverPath + "/share/addUser.json",
        dataType: "json",
        data: f,
        success: function(c) {
          d && d(c)
        }
      })
    },
    saveShareAll: function(f, d) {
      $.ajax({
        type: "post",
        url: this.serverPath + "/share/shareAll.json",
        dataType: "json",
        data: f,
        success: function(c) {
          d && d(c)
        }
      })
    },
    getProcess: function(f, d) {
      $.ajax({
        type: "post",
        url: this.serverPath + "/share/getBatchShareProcess.json",
        dataType: "json",
        data: f,
        success: function(c) {
          d && d(c)
        }
      })
    },
    query: function(f) {
      $.ajax({
        type: "get",
        url: this.serverPath + "/share/" + this.entityId + ".json",
        dataType: "json",
        success: function(d) {
          f && f(d)
        }
      })
    },
    querySuperior: function(f, d) {
      $.ajax({
        type: "get",
        url: "/users/superiors.json",
        data: {
          userIds: f.join(",")
        },
        dataType: "json",
        success: function(c) {
          d(c)
        }
      })
    }
  });
}(app, Backbone));
