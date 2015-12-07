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
          }
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
          $.ajax({
              type: "post",
              url: "/workreport/view.json",
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

}(app, Backbone));
