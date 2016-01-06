(function (app, jQuery, _, moment) {
  "use strict";

  var $ = jQuery;

  var validFunc = {
    mobile: function(mobileNum) {
      var b = false;
      /^13\d{9}$/.test(mobileNum) && (b = true);
      /^14\d{9}$/.test(mobileNum) && (b = true);
      /^15\d{9}$/.test(mobileNum) && (b = true);
      /^18\d{9}$/.test(mobileNum) && (b = true);
      /^17\d{9}$/.test(mobileNum) && (b = true);
      return b
    },
    tel: function(a) {
      return /(^(\d{7,8})$)|(^(\d{3,4})-(\d{7,8})$)|(^(\d{3,4})-(\d{7,8})-(\d{1,4})$)|(^(\d{7,8})-(\d{1,4})$)|(^0{0,1}1[3|4|5|6|7|8|9][0-9]{9}$)/.exec(a) ? !0 : !1
    },
    name: function(a) {
      return /^([\u2e80-\u9fff]+){2,}$|^([a-zA-Z]+[\s.]?){0,4}[a-zA-Z]+$/.exec(a) ? !0 : !1
    },
    company: function(a) {
      return /^([\u2e80-\u9fff]+){2,}$|^([a-zA-Z]+[\s.]?){0,}[a-zA-Z]+$/.exec(a) ? !0 : !1
    },
    teamName: function(a) {
      return /^[\u4e00-\u9fa5aa-zA-Z\d\(\)\uFF08\uFF09]+$/.exec(a) ? !0 : !1
    },
    email: function(a) {
      return /^((([a-zA-Z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-zA-Z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/.exec(a) ? !0 : !1
    },
    emailOrMobile: function(a) {
      return - 1 != a.indexOf("@") ? this.email(a) : this.mobile(a)
    },
    number: function(a) {
      return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.exec(a) ? !0 : !1
    },
    degit: function(a) {
      return /^\d+$/.exec(a) ? !0 : !1
    },
    parseISO8601: function(a) {
      var b = new Date(NaN),
      c = /^\s*(\d{4})-(\d\d)-(\d\d)\s*$/.exec(a);
      c && (a = +c[2], b.setFullYear(c[1], a - 1, c[3]), a != b.getMonth() + 1 && b.setTime(NaN));
      return b
    },
    date: function(a) {
      return ! /Invalid|NaN/.test(this.parseISO8601(a).toString())
    },
    dateTime: function(a) {
      return /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2} (?:(?:0?|1)\d|2[0-3]):[0-5]\d$/.test(a)
    },
    dateISO: function(a) {
      return /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2} (?:(?:0?|1)\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(a)
    },
    code: function(a) {
      return /^[0-9]\d{5}(?!\d)$/.test(a)
    },
    fax: function(a) {
      return /^[+]{0,1}(\d){1,3}[ ]?([-]?((\d)|[ ]){1,12})+$/.test(a)
    },
    url: function(a) {
      return - 1 == a.indexOf(".") ? !1 : /^((https|http|ftp|rtsp|mms)?:\/\/)?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?(([0-9]{1,3}.){3}[0-9]{1,3}|([0-9a-z_!~*'()-]+.)*([0-9a-z][0-9a-z-]{0,61})?[0-9a-z].[a-z]{2,6})(:[0-9]{1,4})?((\/?)|(\/[0-9a-zA-Z_!~*'().;?:@&=+$,%#-]+)+\/?)$/.test(a)
    }
  };

  var errorMsg = {
    mobile: "请输入有效的手机号码",
    tel: "请输入有效的固定电话",
    name: "姓名输入不正确",
    company: "团队输入不正确",
    teamName: "请输入以中文、英文、数字或括号组合的团队名称",
    email: "邮箱格式不正确",
    degit: "只能为整型",
    number: "只能为精度两位小数, 如:1.11",
    date: "必须为日期格式, 如:2013-01-01",
    dateTime: "必须为日期时间格式, 如:2013-01-01 12:01",
    dateISO: "必须为日期时间格式, 如:2013-01-01 12:01:01",
    code: "邮编只能为6位数字",
    fax: "传真格式不正确",
    url: "网址不正确",
    emailOrMobile: "请输入有效的邮箱或手机号码"
  };

  app.validations = {
    validate: function($el) {
      var required = $el.attr("v-required");
      var val = $.trim($el.val());
      $el.removeClass("error");
      if(required && !val) {
        $el.addClass("error");
        return false;
      } else {
        return app.validations.dataValidate($el);
      }
    },
    formValidate: function($form) {
      var isValidated = true;
      $form.find("input,textarea").each(function() {
        var $this = $(this);
        if(!app.validations.validate($this)) {
          isValidated = false;
        }
      });
      return isValidated;
    },
    formValidateImm: function($form) {
      var isValidated = !0;
      $form.find("input,textarea").each(function() {
        var $this = $(this),
        required = $this.attr("v-required"),
        val = $.trim($this.val()),
        messageName = $this.attr("v-message-name");
        $this.removeClass("error");
        if (required && !val) {
          $this.addClass("error");
          if(messageName) {
            app.alert('warning', "请输入" + messageName);
          } else {
            app.alert('warning', "请输入必填项");
          }
          $this.focus();
          isValidated = false;
          return isValidated;
        }

        if (!app.validations.dataValidate($this)) {
          $this.focus();
          isValidated = false;
          return isValidated;
        }
      });
      return isValidated;
    },
    formDataValidate: function($form) {
      var isValidated = true;
      $form.find("input,textarea").each(function() {
        var $this = $(this);
        if(!app.validations.dataValidate($this)) {
          isValidated = false;
        }
      });
      return isValidated;
    },
    dataValidate: function($el) {
      var name = $el.attr("v-name"),
      maxlength = $el.attr("v-maxlength"),
      minlength = $el.attr("v-minlength"),
      equalTo = $el.attr("v-equalTo"),
      val = $.trim($el.val());
      $el.removeClass("error");
      if ($.trim(val)) {
        if (minlength && val && val.length < minlength) {
          app.alert('error', "最小长度为" + minlength);
          $el.addClass("error");
          return false;
        }
        if (maxlength && val && val.length > maxlength) {
          app.alert('error', "最大长度为" + maxlength);
          $el.addClass("error");
          return false;
        }
        if (equalTo && $(equalTo).val() != $el.val()) {
          app.alert('error', "两次密码不一致");
          $el.addClass("error");
          return false;
        }
        if ($.isFunction(validFunc[name]) && !validFunc[name](val)) {
          app.alert('error', errorMsg[name]);
          $el.addClass("error");
          return false;
        }
      }
      return true;
    },
    flowFormValidate: function($form) {
      var isValidated = true;
      $form.find("input,textarea").each(function() {
        var $this = $(this);
        if(!app.validations.validate($this)) {
          isValidated = false;
        }
      });
      if (isValidated) {
        var count = 0;
        if(0 < $("#flowList").length) {
          $("#flowList").find("input,textarea").each(function() {
            $(this).val() ? isValidated = true : count++;
          });
          if(count == $("#flowList").find("input,textarea").length) {
            app.alert('warning', "明细至少填写一项");
            isValidated = false;
          }
        }
      }
      return isValidated;
    },
    emptyFormValidate: function($form) {
      var isValidated = true;
      if(0 < $("#flowList").length) {
        $("#flowList").find("input:enabled[type!=hidden][type!=radio],textarea").each(function() {
          if ($(this).val()) {
            return isValidated = false;
          }
        });
        if(isValidated) {
          app.alert('warning', "表单明细至少添加一项");
          return isValidated;
        }
      }
      $form.find("input:enabled[type!=hidden][type!=radio],textarea").each(function() {
        if ($(this).val()) {
          return isValidated = false;
        }
      });
      if(isValidated) {
        app.alert('info', "未添加数据,不需保存");
      }
      return isValidated;
    },
    timeCompare: function($startTime, $endTime) {
      var startTime = $startTime.data("date") || $startTime.val();
      var endTime = $endTime.data("date") || $endTime.val();
      var sDate = Date.create(startTime);
      var eDate = Date.create(endTime);
      return startTime && endTime && sDate > eDate ? false : true;
    },
    flowTimeCompare: function($el) {
      var name = $el.attr("name");
      var isTimeRight = !app.validations.timeCompare($("input[name=START_TIME]"), $("input[name=END_TIME]"));
      if ("START_TIME" == name) {
        if (isTimeRight) {
          $el.val("");
          app.alert('error', "开始时间必须小于结束时间");
          return false;
        }
      } else if ("END_TIME" == name && isTimeRight) {
        $el.val("");
        app.alert('error', "结束时间必须大于开始时间");
        return false;
      }
      return true;
    }
  };

}(app, jQuery, _, moment));