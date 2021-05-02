
Component({
    externalClasses: ['list-view-class'],
    properties: {
        dataSource: {
            type: Array,
            value: []
        },

        refresherEnabled: {
            type: Boolean,
            value: true
        },

        refresherThreshold: {
            type: Number,
            value: 45
        },
				lowerThreshold:{
					type: Number,
					value: 200
				},
        refresherTriggered: {
            type: Boolean,
        },

        loading: {
            type: Boolean,
            value: false
        },

        total: {
            type: Number,
        },

        height: {
            type: Number,
        },

        emptyImage: {
            type: String,
            value: 'https://img13.360buyimg.com/imagetools/jfs/t1/128926/18/14772/11511/5f85834bE6e1c6a8c/6a37ac6feb5df66a.png'
        },

        emptyText: {
            type: String,
            value: '暂无订单～'
        },
        /**
         * 设置是否加载更多
         */
        loadOver: {
            type: Boolean,
            value: false
        },
        /**
         * 自动计算是否加载完毕，适用于total字段准确的情况下
         * 默认为false，需要开发者手动计算是否加载完毕并传入
         * loadOver配置
         */
        autoLoadOver: {
            type: Boolean,
            value: false
        },
    },

    data: {
        // triggered: false,
        listHeight: '100%',
        backHidden: true,
        scrollTop: null
        // loadOver: false
    },

    observers: {
        height(val) {
            this.setData({
                listHeight: `${val}px`
            })
        },

        dataSource(val) {
            const {total, autoLoadOver} = this.data
            if (autoLoadOver) {
                this.setData({
                    loadOver: val.length === total
                })
            }
        }
    },

    methods: {
        bindrefresherrefresh(e) {
            this.triggerEvent('refresherrefresh', e)
        },

        bindscrolltolower(e) {
            if (this.data.loadOver || this.data.loading) return
            this.triggerEvent('scrolltolower', e)
        },

        bindscroll(e) {
            const { scrollTop} = e.detail
            // 判断滚动到一屏以外
            if (scrollTop > 500 ) {
                // 防止频繁出发导致页面闪烁
                if (this.data.backHidden === true) {
                    this.setData({
                        backHidden: false
                    })
                }
            } else {
                if (this.data.backHidden === false) {
                    this.setData({
                        backHidden: true
                    })  
                }
            }
        },

        backTop() {
            this.setData({
                scrollTop: 0,
                backHidden: true
            })
        }
    }
})
