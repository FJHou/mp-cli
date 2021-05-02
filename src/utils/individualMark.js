export function getCustomerinfo() {
    let customerinfo = wx.getStorageSync('customerinfo');
    return customerinfo;
}
