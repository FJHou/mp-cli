const toast = {
  show: function ({ icon = toast.icon.error, message = '', duration = 2000, pageObj = '', complete = '', isPositionTop = '' }) {
    if (!message) {
      return
    }
    if (pageObj) {
      this.pageObj = pageObj;
    } else {
      const pages = getCurrentPages();
      this.pageObj = pages[pages.length - 1];
    }
    if (typeof complete == 'function') {
      this.complete = complete;
    }
    this.pageObj.setData({
      toastData: {}
    });
    clearTimeout(this.timer);

    if (isPositionTop) {
      this.pageObj.setData({
        toastData: {
          icon: icon,
          message: message,
          marginTop: "300rpx",
          alignItems: "flex-start"
        }
      });
    } else {
      this.pageObj.setData({
        toastData: {
          icon: icon,
          message: message
        }
      });
    }
    setTimeout(() => {
      this.hide();
    }, duration);
  },
  hide: function () {
    clearTimeout(this.timer);
    this.pageObj.setData({
      toastData: {}
    });
    if (this.complete) {
      this.complete();
    }
  }
}
toast.icon = {
  success: 'success-icon',
  error: 'error-icon'
}
export default toast