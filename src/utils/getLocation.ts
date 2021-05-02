import {LocationInfoType} from '../types/index'

export default function getLocation(
    successFunc?: (locationInfo: LocationInfoType) => void,
    failFunc?: (error) => void,
    completeFunc?: () => void
) {
    // 将获取的用户的地理位置写入缓存，全局调用。
    let locationInfo:LocationInfoType = wx.getStorageSync("locationInfo");
    if (locationInfo) {
        if (typeof successFunc === "function") {
            successFunc && successFunc(locationInfo);
        }
    } else {
        wx.getLocation({
            type: "gcj02",
            success: (res) => {
                if (res.latitude && res.longitude) {
                    locationInfo = {
                        latitude: res.latitude,
                        longitude: res.longitude,
                    };
                    
                    wx.setStorageSync("locationInfo", locationInfo);
                }
                if (typeof successFunc === "function") {
                    successFunc && successFunc(locationInfo);
                }
            },
            fail: (res) => {
                console.log("getlocation failed", res);
                if (typeof failFunc === "function") {
                    failFunc && failFunc(res);
                }
            },
            complete: () => {
                completeFunc && completeFunc();
            },
        });
    }
}
