export type CouponFromType = 1 | 2 | 3
export type JpassStoreInfoType = {
    latitude: number;
    longitude: number;
    storeId: number;
    venderId: number;
    storeName: string;
    storeAddress: string;
    storePic: string;
    businessTime: string;
    slogan:string;
    hasJpassStoreCoupon: boolean;
    supportDs: boolean;
    distance: number;
    isWithinFence: boolean;
    phone: string;
    [key: string]: any;
}