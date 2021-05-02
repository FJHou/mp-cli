// <!-- 积分商城优惠券 -->
Component({
    externalClasses: ["points-coupon-class", "coupon-button-class"],
    properties: {
        price: {
            type: String,
        },
        condition: {
            type: String,
        },
        description: {
            type: String,
        },
        type: {
            type: String,
        },
        points: {
            type: String,
        },
        buttonStatus: {
            type: String,
        },
        size: {
            type: String,
        },
    },

    methods: {
        handleClick() {
            this.triggerEvent("click");
        },
    },
});