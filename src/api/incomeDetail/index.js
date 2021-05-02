import { httpsGet } from "../../utils/util.js";
import { appid, url } from "../config";

/**
 * 收益详情 https://cf.jd.com/pages/viewpage.action?pageId=423615707
 */
export function queryIncomeDetail() {
  return httpsGet({
    url,
    data: {
      functionId: "jdhunion_cps_estimateCommissionDetail",
      body: {},
      appid,
    },
  });
}
 