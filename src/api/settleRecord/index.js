import { httpsGet } from "../../utils/util.js";
import { appid, url } from "../config";
 
/**
 * 根据pin获取推荐人关联信息 https://cf.jd.com/pages/viewpage.action?pageId=408116458
 */
export function querySettlementList({pageNo,pageSize}) {
  return httpsGet({
    url,
    data: {
      functionId: "jdhunion_cps_querySettlementList",
      body: {
				pageNo,
				pageSize
			},
      appid,
    },
  });
} 