Component({
    properties: {
        coupons: {
            type: Array
        }
    },

    methods: {
        async joinMember() {
            this.triggerEvent('joinMember')
        }
    }
})