import { httpsGet } from "../../utils/util.js";
import { appid, url } from "../config";

/**
 * 发送短信验证码 https://cf.jd.com/pages/viewpage.action?pageId=408108584
 * @param {string} userPhone
 */
export function promoterSendSmsCod(
  userPhone,
  businessTag = "reference_user_verify"
) {
  return httpsGet({
    url,
    data: {
      functionId: "jdhunion_sms_sendSmsCode",
      body: {
        userPhone,
        businessTag,
      },
      appid,
    },
  });
}
/**
 * 根据pin获取推荐人关联信息 https://cf.jd.com/pages/viewpage.action?pageId=408116458
 */
export function queryUserInfoByPin() {
  return httpsGet({
    url,
    data: {
      functionId: "jdhunion_user_queryUserInfoByPin",
      body: {},
      appid,
    },
  });
}
/**
 * 注册用户 https://cf.jd.com/pages/viewpage.action?pageId=408116473
 */
export function registerUser({
  mobile,
  nickName,
  sex,
  inviteCode,
  wxOpenId,
  verifyCode,
  headImg = ''
}) {
  return httpsGet({
    url,
    data: {
      functionId: "jdhunion_cps_registerUser",
      body: {
        mobile,
        nickName,
        sex,
        inviteCode,
        wxOpenId,
        verifyCode,
        headImg
      },
      appid,
    },
  });
}
