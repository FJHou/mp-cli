import { API } from "../api/config";

export default function getImgUrl(url: string) {
    if (url.indexOf("http") === -1 && url.indexOf("360buyimg.com") === -1) {
        return API.STATIC_URL + "/popshop/" + url;
    }
    
    return url;
}
