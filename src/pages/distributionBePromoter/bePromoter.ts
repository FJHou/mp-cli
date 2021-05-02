import {
  promoterSendSmsCod,
  queryUserInfoByPin,
  registerUser,
} from "../../api/index";
import { getMPQrCodeParams, getReturnPage, isFromQRCode,fetchIsReferenceUser } from "../../utils/JDH-pharmacy/index";
import { getUserInfo, globalLoginShow, isLogin } from "../../utils/loginUtils";
import { DEFAULT_AVATAR } from "../../constants/index";   
import kGetCleanOpenid from "../../utils/getOpenid";

type formType = {
  inviteCode: string;
  phone: string; //手机号,
  verifyCode?: string; //验证码
  nickName: string; //昵称
  gender: string; //性别
  [key: string]: any
};
type optionsType = {
  inviteCode: string;
  [key: string]: string
}
Page({
  data: {
    form: {
      inviteCode: "", //邀请码
      phone: "", //手机号,
      verifyCode: "", //验证码
      nickName: "", //昵称
      gender: "", //性别
    } as formType,
    submitFlag: false,
    codeFlag: false,
    times: 90,
    countDownTime: 60, //验证码倒计时
    fromFansDisableInputInviteCode: false, // 从邀请好友卡片或者二维码过来的需要禁用邀请码输入

    genderPicker: ["男", "女"],
    // 是否是实名认证用户，如果是，则会带入手机号和昵称
    isVerifiedUser: false,
    disableSubmit: true, // 确认按钮是否可点击
  },

  onLoad(options: optionsType) {
    if (isLogin()) {
      this.setInvieCodeIfFromFans(options)
      this.queryUserInfoByPin();
    } else {
      globalLoginShow({
        data: {
          returnpage: getReturnPage()
        }
      })
    }
  },
  // 从邀请好友的分享卡片过来或者小程序码过来的的用户需要自动填入邀请码，且邀请码不能修改
  async setInvieCodeIfFromFans(options: optionsType) {
    // 分享卡片进来
    if (options.inviteCode) {

      this.setData!({
        // @ts-ignore
        'form.inviteCode': options.inviteCode,
        fromFansDisableInputInviteCode: true
      })
    } else if(isFromQRCode(options)) {
      // 判断是否是扫小程序码进来
      try {
        const {inviteCode} = await getMPQrCodeParams(options)
        this.setData!({
          // @ts-ignore
          'form.inviteCode': inviteCode,
          fromFansDisableInputInviteCode: true
        })
      } catch(err) {
        console.log(err);
      }
    }
  },
  /**
   * 监听确认按钮是否可以点击
   */
  watchSubmitShouldDisabled() {
    const form:formType = Object.assign({}, this.data.form);
    // 如果是认证用户，则不需要输入验证码
    if (this.data.isVerifiedUser) {
      delete form.verifyCode;
    }

    const disableSubmit = !Object.values(form).every(item => item !== '');
    this.setData!({ disableSubmit });
  },

  async queryUserInfoByPin() {
    try {
      // 通过手机号登陆的用户没有走登陆拦截，这里判断是否是推广者是的话直接跳转到推广中心
      const isReferenceUser = await fetchIsReferenceUser()

      if (isReferenceUser) {
        wx.redirectTo({
          url: "/pages/distributionPromotionCenter/promotionCenter"
        })
      } else {
        queryUserInfoByPin().then((res: any) => {
          if (res.code === '0000') {
            const { mobile: phone, nickName = "", gendar } = res.data;
            this.setData!({
              // @ts-ignore
              "form.phone": phone,
              "form.nickName": nickName,
              "form.gender": gendar === 2 ? '' : gendar,
              isVerifiedUser: true,
            });
            this.watchSubmitShouldDisabled();
          }
        });
      }
    } catch(err) {
      console.log(err);
    }
  },
  /**
   * 邀请码
   */
  inviteCode(e) {
    this.setData!({
      // @ts-ignore
      "form.inviteCode": e.detail.value,
    });
    this.watchSubmitShouldDisabled();
  },
  /**
   * 手机号
   * */
  phoneNum: function(e) {
    // @ts-ignore
    this.setData!({ "form.phone": e.detail.value });
    this.watchSubmitShouldDisabled();
  },
  phoneFocus() {
    // 认证用户修改手机需要重新验证手机
    if (this.data.isVerifiedUser) {
      
      this.setData!({
        isVerifiedUser: false,
        // @ts-ignore
        "form.phone": "",
      });
    }
  },
  /**
   * 验证码
   */
  verifyCode: function(e) {
    // @ts-ignore
    this.setData!({ "form.verifyCode": e.detail.value });
    this.watchSubmitShouldDisabled();
  },
  /**
   * 昵称
   */
  nickName(e) {
    // @ts-ignore
    this.setData!({ "form.nickName": e.detail.value });
    this.watchSubmitShouldDisabled();
  },
  /**
   *  性别
   */
  bindPickerChange(e) {
    this.setData!({
      // @ts-ignore
      "form.gender": e.detail.value,
    });
    this.watchSubmitShouldDisabled();
  },

  /**
   * 获取验证码
   * */
  getCode: function() {
    const { codeFlag } = this.data;
    const phone = this.data.form.phone;

    // 验证手机号
    if (!this.isPhone(phone)) return;
    // 防重提交
    if (codeFlag) return;
    this.setData!({
      codeFlag: true,
    });
    // 调用倒计时
    this.countDown();

    promoterSendSmsCod(phone).then((res: any) => {
      if (res.success) {
        wx.showToast({
          title: "验证码发送成功",
        });
      }
    });
  },

  /**
   * 倒计时
   */
  countDown: function() {
    let { countDownTime, times } = this.data;
    const timmer = setInterval(() => {
      countDownTime--;
      this.setData!({ countDownTime });
      if (countDownTime < 0) {
        clearInterval(timmer);
        this.setData!({ countDownTime: times, codeFlag: false });
      }
    }, 1000);
  },
  /**
   * 验证手机号
   * */
  isPhone(phone: string) {
    // 验证手机号
    const phoneSuc = /^1\d{10}/.test(phone);
    if (!phoneSuc) {
      wx.showToast({
        title: "请输入正确的手机号",
        icon: "none",
      });
    }
    return phoneSuc;
  },
  /**
   * 修改手机号
   */
  async submit() {
    const {
      phone,
      inviteCode,
      nickName,
      gender,
      verifyCode,
    } = this.data.form;
    const { submitFlag } = this.data; // 防重提交

    if (submitFlag) return;

    this.setData!({
      submitFlag: true,
    });
    const wxOpenId = await kGetCleanOpenid();
    
    let { imgUrl } = getUserInfo()
    // 如果头像是默认头像则传空
    imgUrl = imgUrl === DEFAULT_AVATAR ? '' : imgUrl
    registerUser({
      wxOpenId,
      mobile: phone,
      verifyCode,
      nickName,
      sex: gender,
      inviteCode,
      headImg: imgUrl === DEFAULT_AVATAR ? '' : imgUrl
    })
      .then((res: any) => {
        if (res.success) {
          wx.showToast({
            title: "注册成功~",
          });
          wx.switchTab({
            url: "/pages/distributionIndex/distributionIndex",
          });
        } else {
          wx.showToast({
            title: res.msg,
            icon: "none",
          });
        }
      })
      .finally(() => {
        this.setData!({
          submitFlag: false,
        });
      });
  },
});
