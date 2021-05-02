//https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/template-message.html
//https://developers.weixin.qq.com/miniprogram/dev/api/open-api/uniform-message/sendUniformMessage.html
const Api = require("./api.js");
function send(open_id,template_id,page,form_id,emphasis_keyword,data) {
  var api = new Api();
  var weapp_template_msg = {
    template_id:template_id,
    page:page,
    form_id:form_id,
    emphasis_keyword:emphasis_keyword,
    data:data
  }
  var params = {
    touser:open_id,
    weapp_template_msg: JSON.stringify(weapp_template_msg)
  }
  api.post("/user/sendMiniMessage",params).then(
    res => {
    }
  );
}

exports.send = send;