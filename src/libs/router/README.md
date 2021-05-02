# 路由库说明
这个库主要是解决小程序没有内置路由拦截功能的问题，目标是提供一个简单的路由拦截解决方案。

- 通过config生成路由的映射，定义meta.auth来表明此页面是否需要登录才能访问。
- 通过defineProperty拦截wx.navigate的调用来对路由跳转进行预处理。
- 通过Router类的实例定义beforeEach的钩子进行路由的自定义处理，api和vue-router保持一致。
  
## 目录说明
- router.js 路由类
- config.js 路由映射
- index.js 路由入口文件