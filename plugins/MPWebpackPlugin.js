const EntryPlugin = require('webpack/libs/EntryPlugin')

class MPWebpackPlugin {
    constructor() {

    }

    apply() {
        new EntryPlugin()
    }
}