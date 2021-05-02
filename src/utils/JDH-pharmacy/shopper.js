/**
 * 导购助手相关工具
 */
const { setStorageSync } = requirePlugin("loginPlugin");

 /**
  * 在企业微信，导购助手跳转大药房/便利购需要打通登录态。
  * 设置导购pin，打通登录态。
  */
export function setEmployeePinFromShopperAssistant() {
  // 兼容低版本基础库
    const { referrerInfo } = wx.getEnterOptionsSync ? wx.getEnterOptionsSync() : wx.getLaunchOptionsSync();
    // 存入employedpin。由于零售助手和大药房网关不在一个体系。大药房color网关需要同时验证pt_key和pt_pin
    // 零售助手只验证pt_key。零售助手调大药房时只传入了pt_key，则需要在这里记录下pt_pin。
    if (referrerInfo && referrerInfo.extraData) {
      const employeePin = referrerInfo.extraData.fromPin;
      if (employeePin) {
        // 必须要删除这个字段，要不然个人中心查询用户信息会出错
        wx.removeStorageSync("USER_FLAG_CHECK");
        setStorageSync("jdlogin_pt_pin", employeePin);
        wx.setStorageSync("jdlogin_pt_pin", employeePin);
      }
    }
  }