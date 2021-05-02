Component({
    data: {
        posterWidth: 265, //海报宽度
        posterHeight: 422, //海报高度
        canvasShow: false,
        defaultTitle: "邀您领取专属优惠券"
    },

    methods: {
        setDefaultData(data) {
            const newData = Object.assign(this.data, data)
            this.setData(newData)
        },
        drawBackground(ctx, imgUrl) {
            this.drawImage({
                ctx,
                imgUrl,
                width: this.data.posterWidth,
                height: this.data.posterHeight,
                left: 0,
                top: 0,
            });
            ctx.save();
        },
        drawAvatar(ctx, imgUrl) {
            ctx.beginPath();

            let avatarurl_width = this.data.posterWidth * 0.6;    //绘制的头像宽度
            let avatarurl_heigth = this.data.posterWidth * 0.6;   //绘制的头像高度
            let avatarurl_x = this.data.posterWidth * 0.2;   //绘制的头像在画布上的位置
            let avatarurl_y = this.data.posterHeight * 0.26;   //绘制的头像在画布上的位置

            const x = avatarurl_width / 2 + avatarurl_x; // 圆心x坐标
            const y = avatarurl_heigth / 2 + avatarurl_y; // 圆心y坐标
            const radius = avatarurl_width / 2; // 半径

            ctx.arc(x, y, radius, 0, Math.PI * 2, false);
            //画好了圆 剪切  原始画布中剪切任意形状和尺寸。一旦剪切了某个区域，则所有之后的绘图都会被限制在被剪切的区域内 这也是我们要save上下文的原因
            ctx.clip();

            this.drawImage({
                ctx,
                imgUrl,
                width: avatarurl_width,
                height: avatarurl_heigth,
                left: avatarurl_x,
                top: avatarurl_y,
                // dx: avatarurl_x + 10,
                // dy: avatarurl_y + 10,
                // dWidth: avatarurl_width,
                // dHeight: avatarurl_heigth,
            });
            ctx.restore();
        },
        drawPosterTitle(ctx, title1) {
            // 如果标题过长需要折行展示
            const width = this.data.posterWidth * 0.5
            const defaultTitle = this.data.defaultTitle
            const posterHeight = this.data.posterHeight;
            const titles = []; // 多行标题的集合
            const deltaY = 0.05 // 多行标题绘制时y轴递增系数
            let defualtY = 0.88; // 标题y轴的位置
            // 这里没有做超过两行的处理，默认标题只有两行。
            // 实际门店名称也不会超过两行
            if (title1.length > 14) {
                defualtY = 0.86
                const title0 = title1.substr(0, 13)
                title1 = title1.substr(13)
                titles.push(title0, title1, defaultTitle)
            } else {
                titles.push(title1, defaultTitle)
            }

            titles.forEach((title, index) => {
                this.drawText({
                    ctx,
                    fillText: title,
                    width,
                    top: posterHeight * (defualtY + index * deltaY)
                });
            })

            ctx.draw();
        },
        makerPoster(obj) {
            this.setData({
                canvasShow: true
            })
            const ctx = wx.createCanvasContext('shareCanvas', this);

            return new Promise((resolve, reject) => {
                try {
                    // 绘制背景图片
                    this.drawBackground(ctx, obj.bGImgUrl)
                    // 绘制头像
                    this.drawAvatar(ctx, obj.qrCodeUrl)
                    // 绘制海报文案
                    this.drawPosterTitle(ctx, obj.title)
                    resolve()
                } catch (err) {
                    reject(err)
                }
            })

        },
        // FIXME:这里重构不下去了，暂时这样
        savePoster() {
            let that = this;
            wx.getNetworkType({
                success(res) {
                    const networkType = res.networkType;
                    if (networkType == "none" || networkType == "unknown") {
                        wx.showToast({
                            title: '网络异常',
                            icon: 'none',
                            duration: 1000
                        });

                    } else {
                        that.getPhotosAlbumSetting().then(resolve => {
                            if (!!resolve) {
                                wx.canvasToTempFilePath({
                                    canvasId: 'shareCanvas',
                                    success: function (res) {
                                        wx.saveImageToPhotosAlbum({
                                            filePath: res.tempFilePath,
                                            success() {
                                                setTimeout(() => {
                                                    wx.showToast({
                                                        title: '保存成功',
                                                        icon: 'none'
                                                    });
                                                    setTimeout(() => {
                                                        wx.hideToast({});
                                                        that.setData({
                                                            canvasShow: false
                                                        })
                                                    }, 1500)
                                                }, 0);
                                                // setTimeout(() => {
                                                //   that.closePosterPopUp();
                                                // }, 1000);
                                            },
                                            fail: function (err) {
                                                console.log(err);
                                                //保存失败，重新获取授权
                                                wx.showToast({
                                                    title: '保存失败,您可以重新尝试',
                                                    icon: 'none',
                                                    duration: 1000
                                                });
                                            },
                                            complete() {
                                                wx.hideLoading();
                                            }
                                        });
                                    },
                                    fail: function (err) {
                                        wx.hideLoading();
                                        wx.showToast({
                                            title: '保存失败,您可以重新尝试',
                                            icon: 'none',
                                            duration: 1000
                                        });
                                        console.log(err);
                                    }
                                }, that);
                            }
                        })
                    }
                }
            })

        },

        getPhotosAlbumSetting() {
            return new Promise((resolve, reject) => {
                // let _this = this;
                wx.getSetting({
                    success(res) {
                        // 已授权
                        if (!!res.authSetting['scope.writePhotosAlbum']) {
                            resolve(true);
                            //  _this.savePoster();
                        } else {
                            // 如果用户拒接过授权，跳转授权页面
                            if (res.authSetting['scope.writePhotosAlbum'] == false) {
                                wx.showModal({
                                    title: '是否重新开启授权？',
                                    success(res) {
                                        if (res.confirm) {
                                            wx.openSetting({
                                                success(result) {
                                                }
                                            });
                                        }
                                    }
                                });
                            } else {
                                // 授权弹框
                                wx.authorize({
                                    scope: 'scope.writePhotosAlbum',
                                    success() {
                                        resolve(true);
                                    },
                                    fail() {
                                        wx.hideLoading();
                                        wx.showToast({
                                            title: '保存失败,您可以重新尝试',
                                            icon: 'none',
                                            duration: 1000
                                        });
                                    },
                                    complete(e) {
                                        console.log('complete', e);
                                    }
                                });
                            }
                        }
                    }
                });
            });
        },

        // 绘制图片
        drawImage({ ctx, imgUrl, width, height, left = 0, top = 0, dx, dy, dWidth, dHeight }) {
            ctx.drawImage(imgUrl, left, top, width, height, dx, dy, dWidth, dHeight);
        },
        // 绘制文字
        drawText({
            ctx,
            fontSize = 16,
            textAlign = 'center',
            fillStyle = '#fff',
            fontWeight = 'normal',
            fillText,
            width = this.data.posterWidth / 2,
            top = this.data.posterHeight / 2
        }) {
            ctx.font = `normal ${fontWeight} ${fontSize}px PingFangSC-Regular`; // 字号及加粗
            ctx.setTextAlign(textAlign); // 对齐方式
            ctx.setFillStyle(fillStyle); // 颜色
            ctx.fillText(fillText, width, top);
        },

        closePoster() {
            this.setData({
                canvasShow: false
            })
           // wx.showTabBar()
        },
    }

})