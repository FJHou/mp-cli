import { httpsGet } from "../../utils/util.js";
import { appid, url } from "../config";
 
/**
 * 粉丝管理   https://cf.jd.com/pages/viewpage.action?pageId=423615398
 * pageNo String   是 当前页码
 * pageSize String   是  分页大小 
 */
export function queryFanManagement({pageNo,pageSize}) {
  return httpsGet({
    url,
    data: {
      functionId: "jdhunion_cps_queryDirectMemberList",
      body: {
					pageNo,
					pageSize
			},
      appid,
    },
  });
}
