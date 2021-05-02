export type APPType = {
    globalData: {
        [key: string]: any;
    };
    log: any;
    globalWxclient: string;
    globalRequestUrl: string;
    diansongUrl: string;
    miniWexinAppId: string;
    globalHealthRequestUrl: string;
    globalHealthPayRequestUrl: string;
    staticUrl: string;
    setSystemInfo: () => void;
    queryBrandBaseInfoByAppId: () => void;
    setGlobalStaticFunc: () => void;
    redirectToMemberCodeIfOpenWxPay: (
        options
    ) => void;
    setTopNavigator: (res) => void;
    setPhoneModel: (res) => void;
    toShareUrl: (options: Record<string, string>, self: any) => void;
    getOpenId: (appdata?: any) => Promise<string>;
    getLocation: () => void;
};
