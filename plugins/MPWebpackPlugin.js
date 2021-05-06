const EntryPlugin = require('webpack/lib/EntryPlugin')
const path = require('path')

class MPWebpackPlugin {
    constructor() {

    }

    apply(compiler) {
        const { options, context } = compiler;
        const secondEntry = path.resolve(context, './src/pages/address/address.js')
        compiler.hooks.make.tap('run', (compilation) => {
            const dep = EntryPlugin.createDependency(secondEntry, options);
            compilation.addEntry(context, dep, options, err => {});
        })
        console.log(compiler);
    }
}

module.exports = MPWebpackPlugin