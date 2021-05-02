Component({
    externalClasses: ['title-class', 'desc-class', 'link-text-class'],
    // TODO: 待开发
    // options: {
    //     multipleSlots: true
    // },

    properties: {
        title: {
            type: String,
        },
        desc: {
            type: String,
        },
        isLink: {
            type: Boolean,
        },
        linkText: {
            type: String,
            value: "更多",
        },
        linkType: {
            type: String,
        },
    },

    methods: {
        onClick() {
            this.triggerEvent('click');
        }
    }
});
