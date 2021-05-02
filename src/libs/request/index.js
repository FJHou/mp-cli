const Axios = require('../lib/flyio')
//const queryString = require('query-string')
import queryString from 'query-string';
// const { getCookies } = require('../../utils/util')
import { getCookies } from "../../utils/util.js";
const DEFAULT_CONFIG = require('./default.config')

const axios = new Axios()

axios.config.baseURL = DEFAULT_CONFIG.baseUrl
axios.config.timeout = DEFAULT_CONFIG.timeout

/**
 * 重新构造请求
 * @param {*} config 
 */
const configBuild = (config) => {
    const headerCookie = getCookies() //通用的cookie
    const selfCookie = config.selfCookie

    const url = queryString.stringifyUrl({
        url: config.url, query: {
            fromType: 'wxapp',
            timestamp: new Date().getTime(),
            // 判断是否为预售  如果为预售 请求需要统一加 isPresale=true 字段
            isPresale: wx.getStorageSync("presale") == '1'
        }
    })
    // const data = jsonSerialize(config.data)
    const cookies = selfCookie ? headerCookie + selfCookie : headerCookie

    config.url = url
    // config.data = data
    config.headers.Cookie = cookies

    return config
}

axios.interceptors.request.use(configBuild)

//添加响应拦截器，响应拦截器会在then/catch处理之前执行
axios.interceptors.response.use(
    (response) => {
        //只将请求结果的data字段返回
        return response.data
    },
    (err) => {
        //发生网络错误后会走到这里
        //return Promise.resolve("ssss")
    }
)

exports = request