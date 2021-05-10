const EntryPlugin = require('webpack/lib/EntryPlugin');
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');

const path = require('path');
const fs = require('fs-extra');

const { toAbsolute } = require('./helpers');

class MPWebpackPlugin {
    constructor(options) {
        this.appjson = fs.readJSONSync(path.resolve(__dirname, '../src/app.json'));

        this.pages = [];
        this.subPackages = [];
    }

    apply(compiler) {
        this.resolvePages(compiler);
        this.addEntry(compiler);
    }
    /**
     * 解析appjson的模块，把pages和subPackages都处理为入口文件
     */
    resolvePages(compiler) {
        const { context } = compiler;
        const { pages, subPackages } = this.appjson;

        this.pages = pages.map((pkg) => toAbsolute(context, pkg));
        // TODO: 确定subpackages的路径
        this.subPackages = subPackages.reduce((acc, { root, pages: pkg }) => {
            pkg.forEach((page) => {
                acc.push(toAbsolute(context, path.join(root, page)));
            });

            return acc;
        }, []);
    }

    addEntry(compiler) {
        const { context } = compiler;

        compiler.hooks.make.tapAsync('makeAddScriptEntry', (compilation, callback) => {
            this.pages.slice(0, 6).forEach((page) => {
                const opt = {
                    name: path.basename(page),
                };
                const dep = EntryPlugin.createDependency(page, opt);

                compilation.addEntry(context, dep, opt, callback);
            });
        });
    }
}

module.exports = MPWebpackPlugin;
