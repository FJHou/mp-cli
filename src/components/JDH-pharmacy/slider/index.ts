Component({
    externalClasses: ["slider-class"],

    properties: {
        scrollProgress: {
            type: Boolean,
            observer(val: boolean) {
                if (val) {
                    wx.createSelectorQuery()
                    .in(this)
                    .select(".slider")
                    .boundingClientRect((res) => {
                        const { width: containerWidth } = res;
                        this.setData({ containerWidth})
                        // 由于无法在初始化的时候拿到scroll-view的滚动的长度
                        // 所以这里触发一下scroll事件
                        setTimeout(() => {
                            this.setData({
                                scrollLeft: 1
                            })
                        })
                    })
                    .exec();
                }
            },
        }
    },

    data: {
        containerWidth: 0,
        barWidth: 0,
        scrollWidth: 0,
        moved: 0,
        scrollLeft: 0
    },

    methods: {
        onScroll(e) {
            const {scrollWidth, scrollLeft} = e.detail
            // console.log({
            //     scrollWidth: scrollWidth,
            //     scrollLeft: scrollLeft * (this.data.containerWidth / scrollWidth),
            // });
            this.setData({
                scrollWidth: scrollWidth,
                moved: (scrollLeft / scrollWidth)*100,
                barWidth: 48 * (this.data.containerWidth / scrollWidth)
            });
        },
    },
});
