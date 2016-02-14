(function (app, Backbone) {
  "use strict";

  app.models = {};

  app.models.CustMenuModel = Backbone.Model.extend({
    initialize: function() {
      this.baseUrl = app.config.urlPrefix + '/menu/ajax/';
      this.menu = {
        1 : '<li><a class="router-fake j_modnav-daily" href="/organizations/'+app.config.organizationId+'/workreport/daily/'+app.config.currentUser.account+'/" data-url="/organizations/'+app.config.organizationId+'/workreport/daily/'+app.config.currentUser.account+'/"><span>日报</span></a></li>',
        2 : '<li><a class="router-fake j_modnav-workreport" href="/organizations/'+ app.config.organizationId +'/summary/'+ app.config.currentUser.account +'/#workreport" data-url="/organizations/'+ app.config.organizationId +'/summary/'+ app.config.currentUser.account +'/#workreport"><span>报告</span></a></li>',
        3 : '<li><a class="router-fake j_modnav-task" href="/organizations/'+ app.config.organizationId + '/#tasks" data-url="/organizations/'+ app.config.organizationId + '/#tasks"><span>任务协作</span></a></li>',
        4 : '<li><a class="router j_modnav-document" href="/documents" data-url="/documents"><span>项目</span></a></li>',
        5 : '<li><a class="router j_modnav-customers" href="/crms/customer" data-url="/crms/customer"><span>知识文档</span></a></li>'
      }
    },
    loadEmpAllMenus: function(d) {
      var c = this;
      $.ajax({
        type: "get",
        url: this.baseUrl + "member/queryMenus.json",
        cache: false,
        dataType: "json",
        success: function(b) {
          d && d.call(c, b.empmenus)
        }
      })
    },
    updateMenuStatus: function(d, c) {
      var b = this;
      $.ajax({
        type: "post",
        url: this.baseUrl + "member/updateMemberCustMenuStatus.json",
        data: d,
        dataType: "json",
        success: function(a) {
          c && c.call(b, a)
        }
      })
    },
    updateMenuOrders: function(d, c) {
      var b = this;
      $.ajax({
        type: "post",
        url: this.baseUrl + "member/updateMemberCustMenuOrder.json",
        data: d,
        dataType: "json",
        success: function(a) {
          c && c.call(b, a)
        }
      })
    },
    getMenuElTpl: function(d) {
      for (var c = [], b = 0, a = d.length; b < a; b++) {
        c.push(this.menu[d[b].id]);
      }
      return c
    },
    resetNavsetting: function(d) {
      $.ajax({
        type: "post",
        url: this.baseUrl + "member/resetMenuSetting.json",
        dataType: "json",
        success: function(c) {
          d && d(c)
        }
      })
    }
  });

  app.models.ProfileModel = Backbone.Model.extend({
    sids: "",
    businessSuperiorId: "",
    subordinateUserId: "",
    assistantId: "",
    openAccessId: "",
    initialize: function(f) {
      this.userId = f.userId;
      this.baseUrl = app.config.urlPrefix + '/organizations/' + app.config.organizationId + '/ajax/';
    },
    loadSummary: function(f, d) {
      $.ajax({
        type: "get",
        url: "/profile/summary/" + f + ".json",
        dataType: "json",
        success: function(c) {
          d && d(c)
        }
      })
    },
    loadProfile: function(f, d) {
      $.ajax({
        url: this.baseUrl + "member/" + f + ".json",
        type: "get",
        dataType: "json",
        beforeSend: function() {},
        success: function(c) {
          d && d(c)
        }
      })
    },
    updateUserRole: function(f, d, c, b) {
      $.ajax({
        url: "/base/role/updateUserRole.json",
        type: "post",
        dataType: "json",
        data: {
          id: f,
          "role.roleKey": d,
          type: c
        },
        success: function(a) {
          b && b(a)
        }
      })
    },
    saveEmployeeProperty: function(f, d) {
      $.ajax({
        url: "/base/employee/saveProperty.json",
        type: "post",
        dataType: "json",
        data: f,
        success: function(c) {
          d && d(c)
        }
      })
    },
    saveOtherSenior: function(f) {
      $.ajax({
        url: "/base/employee/saveOtherSenior.json",
        type: "post",
        dataType: "json",
        data: {
          sids: this.sids,
          subordinateUserId: this.subordinateUserId
        },
        success: function(d) {
          f && f(d)
        }
      })
    },
    saveAssistant: function(f) {
      $.ajax({
        url: "/base/employee/saveAssistant.json",
        type: "post",
        dataType: "json",
        data: {
          sids: this.sids,
          assistantId: this.assistantId
        },
        success: function(d) {
          f && f(d)
        }
      })
    },
    saveOpenAccess: function(f) {
      $.ajax({
        url: "/base/employee/saveOpenAccess.json",
        type: "post",
        dataType: "json",
        data: {
          sids: this.sids,
          openAccessId: this.openAccessId
        },
        success: function(d) {
          f && f(d)
        }
      })
    },
    deleteOtherSenior: function(f) {
      $.ajax({
        url: "/base/employee/deleteOtherSenior.json",
        type: "post",
        dataType: "json",
        data: {
          sids: this.sids,
          subordinateUserId: this.subordinateUserId
        },
        success: function(d) {
          f && f(d)
        }
      })
    },
    deleteAssistant: function(f) {
      $.ajax({
        url: "/base/employee/deleteAssistant.json",
        type: "post",
        dataType: "json",
        data: {
          sids: this.sids,
          assistantId: this.assistantId
        },
        success: function(d) {
          f && f(d)
        }
      })
    },
    deleteOpenAccess: function(f) {
      $.ajax({
        url: "/base/employee/deleteOpenAccess.json",
        type: "post",
        dataType: "json",
        data: {
          sids: this.sids,
          openAccessId: this.openAccessId
        },
        success: function(d) {
          f && f(d)
        }
      })
    },
    deleteUser: function(f, d) {
      $.ajax({
        url: "/base/employee/delete.json",
        type: "post",
        dataType: "json",
        data: {
          id: f
        },
        success: function(c) {
          d && d(c)
        }
      })
    },
    changePassword: function(f, d) {
      $.ajax({
        type: "post",
        url: "/base/account/changePassword.json",
        dataType: "json",
        data: {
          "employee.id": f.employeeId,
          oldPassword: f.oldPassword,
          newPassword: f.newPassword
        },
        success: function(c) {
          d && d(c)
        }
      })
    },
    resetPassword: function(f, d) {
      $.ajax({
        type: "post",
        url: "/base/account/resetPassword.json",
        dataType: "json",
        data: {
          "employee.id": f.employeeId,
          newPassword: f.newPassword
        },
        success: function(c) {
          d && d(c)
        }
      })
    },
    cut: function(f, d) {
      $.ajax({
        contentType: "application/json;charset\x3dUTF-8",
        type: "post",
        url: "/profile/cut.json",
        dataType: "json",
        data: '{"id":' + this.userId + ',"imageArea":{"id":' + f.id + ',"x":' + f.x + ',"y":' + f.y + ',"width":' + f.width + ',"height":' + f.height + "}}",
        success: function(c) {
          d && d(c)
        }
      })
    },
    sendCaptcha: function(f, d) {
      $.ajax({
        type: "post",
        url: "/base/account/sendCaptcha.json",
        dataType: "json",
        data: {
          "employee.id": f.employeeId,
          propertyName: f.propertyName,
          "employee.email": f.email,
          "employee.mobile": f.mobile
        },
        success: function(c) {
          d && d(c)
        }
      })
    },
    detectCaptcha: function(f, d) {
      $.ajax({
        type: "post",
        url: "/base/account/detectCaptcha.json",
        dataType: "json",
        data: {
          captcha: f.captcha,
          "employee.email": f.email,
          "employee.mobile": f.mobile
        },
        success: function(c) {
          d && d(c)
        }
      })
    },
    updateBinding: function(f, d) {
      $.ajax({
        type: "post",
        url: "/base/account/updateBinding.json",
        dataType: "json",
        data: {
          "employee.id": f.employeeId,
          propertyName: f.propertyName,
          "employee.email": f.email,
          "employee.mobile": f.mobile,
          captcha: f.captcha
        },
        success: function(c) {
          d && d(c)
        }
      })
    },
    accountIsOccupied: function(f, d) {
      $.ajax({
        type: "post",
        url: "/base/account/accountIsOccupied.json",
        dataType: "json",
        data: {
          propertyName: f.propertyName,
          "employee.email": f.email,
          "employee.mobile": f.mobile
        },
        success: function(c) {
          d && d(c)
        }
      })
    },
    countAllAdmin: function(f, d) {
      $.ajax({
        type: "post",
        url: "/base/employee/countAllAdmin.json",
        dataType: "json",
        success: function(c) {
          d && d(c)
        }
      })
    },
    resignation: function(f, d) {
      $.ajax({
        type: "post",
        url: "/base/account/resignation.json",
        dataType: "json",
        data: {
          "employee.id": f
        },
        success: function(c) {
          d && d(c)
        }
      })
    },
    quitCompany: function(f, d) {
      $.ajax({
        type: "post",
        url: "/base/account/quitCompany.json",
        dataType: "json",
        success: function(c) {
          d && d(c)
        }
      })
    },
    quitTransfer: function(f, d) {
      $.ajax({
        contentType: "application/json;charset\x3dUTF-8",
        type: "post",
        url: "/profile/quitTransfer.json",
        dataType: "json",
        data: f,
        success: function(c) {
          d && d(c)
        }
      })
    },
    rehire: function(f, d) {
      $.ajax({
        type: "post",
        url: "/base/account/rehire.json",
        dataType: "json",
        data: {
          "employee.id": f
        },
        success: function(c) {
          d && d(c)
        }
      })
    }
  });

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
