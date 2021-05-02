import { GWAjax } from "./api-member";
import { getBrandBaseInfo } from "./JDH-pharmacy/index";
import { MEMBER_CARD_INFO } from "../constants/index";

// type MemberCardReponseType = {
//     code: string,
//     data: {
//         data: {
//             points: number,
//             cardNo: string | null,
//             customerLevel: string,
//             [key: string]: any,
//         }
//     }
// }

type MemberCardInfo = {
    customerLevel: string;
    points: number;
    cardNo: string | null;
    isVip: boolean;
    levelName: string;
    cardCls: string;
};

export default function getMemeberCardInfo(): Promise<MemberCardInfo> {
    // const info = wx.getStorageSync(MEMBER_CARD_INFO);

    return new Promise(async (resolve, reject) => {
        // if (info) {
        //     resolve(info);
        // } else {
            const { brandId, bizId } = await getBrandBaseInfo();

            GWAjax({
                functionName: "CardExportService.getCustomerCardInfo",
                data: {
                    brandId: brandId,
                    bId: bizId,
                },
                success: (res: any) => {
                    const { code, data } = res.data;

                    if (code === "0" && data) {
                        let { points, customerLevel = "", cardNo } = data.data;
                        const levelMap = {
                            1: "普通会员",
                            2: "白银会员",
                            3: "黄金会员",
                            4: "铂金会员",
                        };
                        const info: MemberCardInfo = {
                            customerLevel,
                            points,
                            cardNo,
                            isVip: customerLevel ? true : false,
                            // @ts-ignore
                            levelName: levelMap[customerLevel] || "",
                            cardCls: `level-${customerLevel}`,
                        };
                        wx.setStorageSync(MEMBER_CARD_INFO, info);
                        resolve(info);
                    } else {
                        reject(null);
                    }
                },
                error: (err: any) => {
                    reject(err);
                },
            });
        // }
    });
}
