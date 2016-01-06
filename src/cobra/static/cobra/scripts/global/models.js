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
    initialize: function(data) {
      this.page = {
          pageNo: 1,
          pageSize: 10
      };
      this.baseUrl = app.config.urlPrefix + '/organizations/' + app.config.organizationId + '/summary/ajax/';
    },
    loadDepartment: function(callback) {
      $.ajax({
        type: "post",
        url: "/workreport/queryDepartment.json",
        dataType: "json",
        success: function(res) {
          if(callback) {
            callback(res);
          }
        }
      });
    },
    queryWorkReport: function(data, callback) {
      var url = this.baseUrl + 'view.json';
      $.ajax({
        type: "get",
        url: url,
        dataType: "json",
        data: data,
        success: function(res) {
          if(callback) {
            callback(res);
          }
        }
      });
    },
    loadReport: function(year, checkType, choiceType, departmentId, callback) {
      $.ajax({
        type: "post",
        url: "/workreport/loadReport.json",
        dataType: "json",
        data: {
          currentYear: year,
          choiceType: choiceType,
          checkType: checkType,
          departmentId: departmentId
        },
        success: function(res) {
          if(callback) {
            callback(res);
          }
        }
      });
    },
    queryGoalUserlist: function(year, checkType, choiceType, num, departmentId, callback) {
      $.ajax({
        type: "post",
        url: "/workreport/queryGoalUserList.json",
        dataType: "json",
        data: {
          currentYear: year,
          choiceType: choiceType,
          checkType: checkType,
          number: num,
          departmentId: departmentId
        },
        success: function(res) {
          if(callback) {
            callback(res);
          }
        }
      });
    },
    create: function(data, callback) {
      var url = this.baseUrl + 'workreport.json';
      $.ajax({
        type: "post",
        url: url,
        dataType: "json",
        data: data,
        success: function(res) {
          if(callback) {
            callback(res);
          }
        }
      });
    },
    update: function(data, callback) {
      var url = this.baseUrl + data["workReport.id"] + ".json";
      data._method = "PUT";
      $.ajax({
        type: "post",
        url: url,
        dataType: "json",
        data: data,
        success: function(res) {
          if(callback) {
            callback(res);
          }
        }
      });
    },
    queryWorkReportType: function(type, commentTime, unreadFlag, callback) {
      $.ajax({
        type: "get",
        url: "/workreport.json",
        dataType: "json",
        data: {
          type: type,
          pageSize: this.page.pageSize,
          pageNo: this.page.pageNo,
          commentTime: commentTime,
          unreadFlag: unreadFlag
        },
        async: false,
        success: function(res) {
          if(callback) {
            callback(res);
          }
        }
      });
    },
    getUnreadCount: function(callback) {
      $.ajax({
        type: "get",
        url: "/workreport/unreadCount.json",
        dataType: "json",
        success: function(res) {
          if(callback) {
            callback(res);
          }
        }
      });
    },
    readAll: function(callback) {
      $.ajax({
        type: "get",
        url: "/workreport/readAll.json",
        dataType: "json",
        success: function(res) {
          if(callback) {
            callback(res);
          }
        }
      });
    }
  });

  app.models.Share = Backbone.Model.extend({
    id: 1,
    entityId: 1,
    entityIds: "",
    sids: "",
    shareType: "sharer",
    original: false,
    initialize: function(data) {
      this.entityId = data.entityId;
      this.entityIds = data.entityIds;
      this.serverPath = data.serverPath ? data.serverPath: "";
      this._module = data.module
    },
    save: function(callback) {
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
        success: function(res) {
          if(callback) {
            callback(res);
          }
        }
      });
    },
    saveAll: function(callback) {
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
        success: function(res) {
          if(callback) {
            callback(res);
          }
        }
      });
    },
    saveAllSearch: function(data, callback) {
      $.ajax({
        contentType: "application/json;charset=UTF-8",
        type: "post",
        url: this.serverPath + "/share/addUser.json",
        dataType: "json",
        data: data,
        success: function(res) {
          if(callback) {
            callback(res);
          }
        }
      });
    },
    saveShareAll: function(data, callback) {
      $.ajax({
        type: "post",
        url: this.serverPath + "/share/shareAll.json",
        dataType: "json",
        data: data,
        success: function(res) {
          if(callback) {
            callback(res);
          }
        }
      });
    },
    getProcess: function(data, d) {
      $.ajax({
        type: "post",
        url: this.serverPath + "/share/getBatchShareProcess.json",
        dataType: "json",
        data: data,
        success: function(res) {
          if(callback) {
            callback(res);
          }
        }
      });
    },
    query: function(callback) {
      $.ajax({
        type: "get",
        url: this.serverPath + "/share/" + this.entityId + ".json",
        dataType: "json",
        success: function(res) {
          if(callback) {
            callback(res);
          }
        }
      });
    },
    querySuperior: function(userIds, callback) {
      $.ajax({
        type: "get",
        url: "/users/superiors.json",
        data: {
          userIds: userIds.join(",")
        },
        dataType: "json",
        success: function(res) {
          callback(res);
        }
      });
    }
  });

  app.models.InviteModel = Backbone.Model.extend({
    id: "",
    pageNo: 0,
    pageSize: 23,
    invite: {
      invitee: ""
    },
    saveInvite: function(f, d) {
      $.ajax({
        url: "/invite.json",
        type: "post",
        dataType: "json",
        data: f,
        beforeSend: function() {},
        success: function(c) {
          d && d(c)
        }
      })
    },
    saveInvites: function(f, d) {
      $.ajax({
        contentType: "application/json;charset=UTF-8",
        url: "/invite/saves.json",
        type: "post",
        dataType: "json",
        data: f,
        success: function(c) {
          d && d(c)
        }
      })
    },
    queryInvitations: function(f) {
      var d = {};
      d.pageNo = this.pageNo;
      d.pageSize = this.pageSize;
      d["inviteInfo.invitee"] = this.invite.invitee;
      $.ajax({
        url: "/invite.json",
        type: "get",
        dataType: "json",
        data: d,
        success: function(c) {
          f && f(c)
        }
      })
    },
    sendInvite: function(f, d) {
      f && $.ajax({
        type: "post",
        url: "/invite/sendInvite/" + f + ".json",
        dataType: "json",
        success: function(c) {
          d && d(c)
        }
      })
    },
    delInvite: function(f, d) {
      f && $.ajax({
        type: "post",
        dataType: "json",
        data: {
          _method: "delete"
        },
        url: "/invite/" + f + ".json",
        success: function(c) {
          d && d(c)
        }
      })
    }
  });
}(app, Backbone));
