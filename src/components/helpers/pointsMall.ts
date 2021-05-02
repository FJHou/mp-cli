export function pointsMallButtonStatus(points: number, coupon: any) {
    const { exchangeScore, stock, activityAlreadyExchangeQty } = coupon;
    if (points >= exchangeScore) {
        if (stock - activityAlreadyExchangeQty === 0) {
            coupon.buttonText = "库存不足";
            coupon.buttonStatus = 0;
            coupon.buttonClass = "unactive";
        } else {
            coupon.buttonText = "去兑换";
            coupon.buttonStatus = 1;
        }
    } else {
        coupon.buttonText = "积分不足";
        coupon.buttonStatus = 2;
        coupon.buttonClass = "unactive";
    }
    return coupon;
}
