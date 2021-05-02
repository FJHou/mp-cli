import { httpsGet ,promiseRequest} from "../../utils/util.js";

// import { appid, url } from "../config";
import { appid, healthUrl, API ,url} from '../config'
 
/**
 * 提现认证-上传身份证图片 https://cf.jd.com/pages/viewpage.action?pageId=425071814
 * fileName  String	必填	文件名称	例如：1232.png
 * fileBase64 String	必填	图片文件base64	
 * code	String	必填	上传操作编码	默认：upload_id_card_img
 */
export function queryUploadImage(params) {
  return promiseRequest({
		url:API.globalJDHpharmacyRequestUrl + healthUrl,
		method: 'post',
    data: {
      functionId: "jdhunion_jss_uploadImage",
      body: JSON.stringify(params),
      appid,
    },
  });
} 
/*
 * 保存用户认证信息  https://cf.jd.com/pages/viewpage.action?pageId=424563759
 *
*/
export function saveCertificationInfo(params) { 
	return promiseRequest({
		url:API.globalJDHpharmacyRequestUrl + healthUrl,
		method: 'post',
			data: {
					functionId: "jdhunion_cps_saveCertificationInfo",
					body: JSON.stringify(params),
					appid
			}
	})
}

/*
 * 保存用户认证信息  https://cf.jd.com/pages/viewpage.action?pageId=424563759
 *
*/
export function queryCertificationInfo() {
	return httpsGet({
			url,
			data: {
					functionId: "jdhunion_cps_queryCertificationInfo",
					body: {},
					appid
			}
	})
}

/*
 * 保存用户银行卡信息  https://cf.jd.com/pages/viewpage.action?pageId=424563670
 *
*/
export function saveBankCard(params) {
	return httpsGet({
			url,
			data: {
					functionId: "jdhunion_cps_saveCpsUserBankcard",
					body: params,
					appid
			}
	})
}