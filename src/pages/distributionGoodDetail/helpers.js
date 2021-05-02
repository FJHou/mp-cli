export function getTypeLabel(itemObj) {
    //如果商品信息里面有 拼购信息，就是展示京东拼团，如果没有拼购信息 判断 是 自营还是 pop商品
    if (itemObj.pinGouInfo != null && itemObj.pinGouInfo.pingouPrice != null) {
        return "京东拼购";
    }
    if (itemObj.owner == "g") {
        return "京东自营";
    }
    return "京东";
}