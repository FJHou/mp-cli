// @ts-ignore
import queryString from "query-string";
import getMemeberCardInfo from "./getMemberCardInfo";
import {LOGIN_FROM_SCENE} from "../constants/index"

interface BuildUrlInterface {
    url: string;
    query: {
        [key: string]: any;
    };
}
export function buildUrl(options: BuildUrlInterface): string {
    return queryString.stringifyUrl(options);
}

export function debounce(fn: Function, delay: number) {
    // 定时器，用来 setTimeout
    let timer: NodeJS.Timeout;

    // 返回一个函数，这个函数会在一个时间区间结束后的 delay 毫秒时执行 fn 函数
    return function() {
        // 保存函数调用时的上下文和参数，传递给 fn
        // @ts-ignore
        let context = this;
        const args = arguments;

        // 每次这个返回的函数被调用，就清除定时器，以保证不执行 fn
        clearTimeout(timer);

        // 当返回的函数被最后一次调用后（也就是用户停止了某个连续的操作），
        // 再过 delay 毫秒就执行 fn
        timer = setTimeout(function() {
            fn.apply(context, args);
        }, delay);
    };
}

export function throttle(fn: Function, delay: number) {
    let last = 0;
    delay = delay || 200
    return function() {
        var curr = +new Date();
        if (curr - last > delay) {
            //  @ts-ignore
            fn.apply(this, arguments);
            last = curr;
        }
    };
}

export const loginScene = {
    set: function setLoginScene(value: string) {
        wx.setStorageSync(LOGIN_FROM_SCENE, value)
    },

    get: function getLoginScene() {
        return wx.getStorageSync(LOGIN_FROM_SCENE)
    }
}

export { getMemeberCardInfo };
