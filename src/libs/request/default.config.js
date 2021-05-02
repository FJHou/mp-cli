const app = getApp();

export const config = {
    timeout: 10000,
    baseUrl: app.globalHealthPayRequestUrl,
    header: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
}