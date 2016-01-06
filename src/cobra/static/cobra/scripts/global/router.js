(function (window, app, Backbone, jQuery, _, moment) {
  "use strict";

  var $ = jQuery;

  app.router = Backbone.Router.extend({
      initialize: function(d) {
          this.app = new app.Page();
      },
      routes: {
//          "": "home",
//          home: "home",
//          "home/:userId": "home",
//          portal: "home",
//          "portal/:userId": "home",
//          ";jsessionid\x3d:session": "home_session",
//          tasks: "task_tasks",
//          "tasks/": "task_tasks",
//          "tasks/:userId/:type": "tasks_nav",
//          "tasks/calendar": "task_calendar",
//          "tasks/calendar/:userId": "task_calendar",
//          "tasks/:userId": "task_tasks",
//          "tasks/:userId/:id": "task_tasks",
          workreport: "workReport",
          "workreport/:type": "workReport_type",
          "workreport/:type/:id": "workReport_type",
          "workreport/unreadComment": "workReport_unreadComment",
          "workreport/unreadComment/:id": "workReport_unreadComment",
          "workreport/unreadReplay": "workReport_unreadReplay",
          "workreport/unreadReplay/:id": "workReport_unreadReplay",
          "workreport/:userId": "workReport",
          "workreport/:userId/:year/:type": "workReport",
          "workreport/:userId/:year/:type/:serialNumber": "workReport",
          /*"search/keywords/:keywords": "search_keywords",
          "search/keywords/:keywords/:module": "search_keywords",
          "search/keywords/:keywords/:module/:objId": "search_keywords",
          "feed/watched": "feed_watched",
          "feed/watched/:module": "feed_watched",
          "feed/watched/:module/:objId": "feed_watched",
          "feed/unfinish": "feed_unfinish",
          "feed/unfinish/:module": "feed_unfinish",
          "feed/unfinish/:module/:objId": "feed_unfinish",
          "feed/:type": "feed_newitem",
          "feed/:type/:module": "feed_newitem",
          "feed/:type/:module/:objId": "feed_newitem",
          "search/mainline/:searchId": "search_mainline",
          "search/mainline/:searchId/:module": "search_mainline",
          "search/mainline/:searchId/:module/:objId": "search_mainline",
          "search/tag/:searchId": "search_tag",
          "search/tag/:searchId/:module": "search_tag",
          "search/tag/:searchId/:module/:objId": "search_tag",
          blog: "blog",
          "blog/": "blog",
          "blog/:userId": "blog",
          "blog/:userId/:type": "blog",
          "blog/:userId/:type/:id": "blog",
          "blog/:userId/:type/:id/:param": "blog",
          "users/myfollow": "user_myfollow",
          "users/myfollow/:id": "user_myfollow",
          "users/myfollow/:id/:type": "user_myfollow",*/
          organization: "user_organization",
          "organization/:id": "user_organization",
          "organization/:id/:type": "user_organization",
          "organization/:id/:type/:operation": "user_organization",
          "organization/:id/:type/:operation/:userOrg": "user_organization",
          "organization/:id/:type/:operation/:userOrg/:creator": "user_organization"/*,
          info: "info",
          "info/:type": "info_navigation",
          profile: "profile",
          "profile/:id": "profile",
          "profile/:id/:type": "profile",
          messages: "messages",
          "messages/wechat": "messagesWechat",
          "messages/wechat/:userId": "messagesWechatChat",
          "messages/wechat/channel/:channelId": "messagesWechatChannel",
          "messages/follow": "messagesFollow",
          "messages/applyJoin": "messagesApplyJoin",
          "messages/shareJoin": "messagesShareJoin",
          "messages/applyReceive": "messagesApplyReceive",
          "messages/remind": "messagesRemind",
          mainlines: "mainline",
          mainline: "mainline",
          "mainlines/:userId": "mainline",
          "mainlines/:userId/:id": "mainline",
          "mainlines/:userId/:filterType": "mainline",
          "mainlines/:userId/:filterType/:id": "mainline",
          "mainline/link/:userId/:id": "mainlinelink",
          "mainline/link/:userId/:id/:mainlineType": "mainlinelink",
          "mainline/link/:userId/:id/:mainlineType/:filterType": "mainlinelink",
          "mainline/link/:userId/:id/:mainlineType/:filterType/:module": "mainlinelink",
          "mainline/link/:userId/:id/:mainlineType/:filterType/:module/:objId": "mainlinelink",
          tag: "tag",
          "tag/:type/:id": "tag",
          "report/taskstatistics": "task_statistics",
          "report/task": "task_reports",
          "report/task/:userId": "task_reports",
          "report/flow": "flow_reports",
          "report/logs": "logs",
          "report/logs/:type": "logs",
          "report/logs/:type/:employeeId": "logs",
          "report/timecard": "timecard",
          "report/timecard/:id": "timecard",
          "report/blog": "blog_reports",
          "report/workhour": "workhour",
          workdays: "workdays",
          documents: "documents",
          "documents/": "documents",
          "documents/:userId": "documents",
          "documents/:userId/:type/": "document",
          "documents/:userId/:id": "documents",
          "documents/:userId/:type/:folderId": "document",
          workflows: "workflows_navigation",
          "workflows/": "workflows_navigation",
          "workflows/:userId": "workflows_navigation",
          "workflows/:userId/": "workflows_navigation",
          "workflows/:userId/:type": "workflows_navigation",
          "workflows/:userId/:type/": "workflows_navigation",
          "workflows/:userId/:type/:formId": "workflows_navigation",
          "workflows/:userId/:type/:formId/": "workflows_navigation",
          "wechat/:id": "wechats_chat",
          "wechat/channel/:id": "wechats_channel",
          wechat: "wechats",
          "wechat/": "wechats",
          "comment/unreadall": "unread_feedback",
          "comment/unreadall/": "unread_feedback",
          "comment/unreadall/:module/:id": "unread_feedback",
          versioninfo: "versioninfo",
          "versioninfo/": "versioninfo",
          "calendar/:userId": "calendar",
          "calendar/": "calendar",
          calendar: "calendar",
          forms: "forms",
          "forms/": "forms",
          "forms/:userId": "forms",
          "forms/:userId/": "forms",
          "forms/:userId/:type": "forms",
          "forms/:userId/:type/": "forms",
          "forms/:userId/:type/:formId": "forms",
          "forms/:userId/:type/:formId/": "forms",
          "print/:id/:module": "print",
          crms: "showCrmPage",
          "crms/:param": "showCrmPage",
          crmapp: "showCrmPage",
          "crmapp/:param": "showCrmPage",
          "synchronizeddata/syncData": "syncData_channel"*/
      },
      /*home: function(d) {
          this.app.renderHome(d)
      },
      home_session: function() {
          this.home()
      },
      task_tasks: function(d, c) {
          this.app.renderTask(d, c)
      },
      tasks_nav: function(d, c) {
          this.app.renderTaskByType(d, c)
      },
      task_calendar: function(d) {
          this.app.renderTasksCalendar(d)
      },
      task_report: function(d) {
          this.app.renderTaskreport(d)
      },
      task_reports: function(d) {
          this.app.renderTaskreports(d)
      },
      task_statistics: function(d) {
          this.app.renderTaskStatistics(d)
      },
      blog_reports: function(d) {
          this.app.renderBlogreports(d)
      },
      flow_reports: function() {
          this.app.renderFlowreports()
      },*/
      workReport: function(userId, year, type, serialNumber) {
        this.app.renderWorkReport(userId, year, type, serialNumber);
      },
      workReport_type: function(d, c) {
          isNaN(d) ? this.app.renderWorkReportType(d, c) : this.app.renderWorkReport(d);
      },
      /*workReport_unreadComment: function(d) {
          this.app.renderWorkReportType("comment", d, !0)
      },
      workReport_unreadReplay: function(d) {
          this.app.renderWorkReportType("replay", d, !0)
      },
      search_keywords: function(d, c, b) {
          this.app.renderSearch("keywords", d, c, b)
      },
      feed_watched: function(d, c) {
          this.app.renderWatched(d ? d : "all", c)
      },
      feed_unfinish: function(d, c) {
          this.app.renderUnfinish(d ? d : "all", c)
      },
      feed_newitem: function(d, c, b) {
          this.app.renderFeedSearch(d, c ? c : "all", b)
      },
      search_mainline: function(d, c, b) {
          this.app.renderSearch("mainline", d, c, b)
      },
      search_tag: function(d, c, b) {
          this.app.renderSearch("tag", d, c, b)
      },
      blog: function(d, c, b, a) {
          this.app.renderBlog(d, c, b, a)
      },
      user_myfollow: function(d, c) {
          this.app.renderMyfollow(d, c)
      },*/
      user_organization: function(d, c, b, a, e) {
          this.app.renderOrganization(d, c, b, a, e)
      }/*,
      profile: function(d, c) {
          this.app.renderProfile(d, c)
      },
      info: function() {
          this.app.renderInfo()
      },
      info_navigation: function(d) {
          this.app.renderInfoByType(d)
      },
      messages: function(d) {
          this.app.messages(d)
      },
      messagesRemind: function() {
          this.app.messages("remind")
      },
      messagesWechat: function() {
          this.app.messages("wechat")
      },
      messagesWechatChat: function(d) {
          this.app.messages("wechat", {
              userId: d,
              chatType: "chat"
          })
      },
      messagesWechatChannel: function(d) {
          this.app.messages("wechat", {
              channelId: d,
              chatType: "channel"
          })
      },
      messagesFollow: function() {
          this.app.messages("follow")
      },
      messagesApplyJoin: function() {
          this.app.messages("applyJoin")
      },
      messagesShareJoin: function() {
          this.app.messages("shareJoin")
      },
      messagesApplyReceive: function() {
          this.app.messages("applyReceive")
      },
      mainline: function(d, c, b) {
          this.app.mainline(d, c, b)
      },
      mainlinelink: function(d, c, b, a, e, f) {
          this.app.mainlinelink(d, c, b, a, e, f)
      },
      tag: function(d, c) {
          this.app.tag(d, c)
      },
      showCrmPage: function(d) {
          d || (d = "customer");
          this.app.showCrmPage(d)
      },
      logs: function(d, c) {
          this.app.renderLog(c, d)
      },
      timecard: function(d) {
          this.app.renderTimecard(d)
      },
      workhour: function() {
          this.app.renderWorkhour()
      },
      workdays: function() {
          this.app.renderWorkdays()
      },
      documents: function(d, c, b) {
          d = d ? d : TEAMS.currentUser.id;
          this.app.documents(d, c, b)
      },
      document: function(d, c, b) {
          d = d ? d : TEAMS.currentUser.id;
          this.app.documents(d, null, c, b)
      },
      workflows_navigation: function(d, c, b) {
          this.app.renderWorkflowByType(d, c, b)
      },
      wechats_chat: function(d) {
          this.app.chat(d)
      },
      wechats_channel: function(d) {
          this.app.channel(d)
      },
      wechats: function() {
          this.app.wechats()
      },
      unread_feedback: function(d, c) {
          this.app.unreadfeedback(d, c)
      },
      versioninfo: function(d) {
          this.app.versioninfo(d)
      },
      calendar: function(d) {
          this.app.renderCalendar(d)
      },
      forms: function(d, c, b) {
          this.app.renderForms(d, c, b)
      },
      print: function(d, c) {
          this.app.print(d, c)
      },
      syncData_channel: function() {
          this.app.syncData_channel()
      }*/
  });

}(window, app, Backbone, jQuery, _, moment));