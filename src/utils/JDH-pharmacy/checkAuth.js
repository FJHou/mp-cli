function checkAuth(resolve, reject) {
  var cookie = wx.getStorageSync('cookie');
  var bindPhoneData = wx.getStorageSync('bindPhoneData');
  if (cookie == undefined || cookie == "") {
    reject("login");
  } else if (bindPhoneData == undefined || bindPhoneData == "") {
    reject("bindPhone");
  }else{
    resolve("ok");
  }
}
exports.checkAuth = checkAuth;