const app = getApp()

Component({
    data: {
        width: app.globalData.menuButtonRect.width,
        height: app.globalData.menuButtonRect.height - 1,
    }
})