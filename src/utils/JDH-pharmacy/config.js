
const hostArr = ['', '-pre1', '-pre2', '-gray', '-prod'];
const dev = hostArr[0]
exports.requestURL = "https://yunshang-buyer" + dev + "-api.jcloudec.com";
exports.h5Domain = 'yunshang-buyer' + dev + '.jcloudec.com';

// ************开租户请注意【修改埋点】配置（切记!!）************
const pointConfig = {
  "other": ["500677671", "500677672"], // {京X} 有品埋点配置
  "jingXiang": ["500687430", "500687434"], // 【京享】有品埋点配置
}
exports.pointAppId = pointConfig["jingXiang"][0]; // 应用ID(创建应用时得知)
exports.pointEventID = pointConfig["jingXiang"][1]; // 自定义事件统计ID(开通自定义事件时得知)
// *******************END*******************************

exports.brandTxt = {
  mine1: '京享',
  mine2: '有品',
  jd: '京东',
  pt: '拼团',
  kj: '砍价',
  ms: '秒杀',
  zy: '自营',
  p_jd: '京东价',
  p_jd_sale: '券后价',
  p_mine: '京享价',
  p_mine_sale: '优惠价',
  p_pt: '拼团价',
  p_kj: '砍后价',
  p_ms: '秒杀价'
};

// exports.jdReplaceDwzUrl = 'https://dwz.cn';
// exports.jdUrl = "http://j.jd.com"; // 所有h5短链dwz.cn替换为改链接

