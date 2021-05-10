const path = require('path');

exports.toAbsolute = function (context, filePath) {
    return path.resolve(context, 'src', filePath);
};
