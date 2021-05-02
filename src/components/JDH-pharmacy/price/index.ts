Component({
    externalClasses: ['price-class', 'symbol-class', 'number-class'],
    properties: {
        price: {
            type: Number,
        },

        color: {
            type: String,
            value: '#F14747'
        },

        symbolSize: {
            type: Number,
        },

        numberSize: {
            type: Number,
        },

        family: {
            type: String,
            value: 'bold',
            observer(val: string) {
                if (['bold', 'regular', 'light'].includes(val)) {
                    this.setData({
                        prefixCls: this.data.prefixCls += ` ${val}`
                    })
                }
                
            }
        }
    },

    data: {
        prefixCls: ''
    },
})