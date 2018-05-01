//压缩 ，re是文件,  req是浏览器支持几种压缩方式。 res
const {createGzip, createDeflate} = require('zlib');

module.exports = (rs, req, res) => {
    const acceptEncoding = req.headers['accept-encoding'];
    if (!acceptEncoding || !acceptEncoding.match(/\b(gzip|deflate)\b/)) {
        return rs;
    } else if (acceptEncoding.match(/\bgzip\b/)) {
        res.setHeader('Content-Encoding','gzip');
        return rs.pipe(createGzip())
    } else if (acceptEncoding.match(/\bdeflate\b/)) {
        res.setHeader('Content-Encoding', 'deflate');
        return rs.pipe(createDeflate())
    }
};