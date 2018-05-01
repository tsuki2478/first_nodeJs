const fs = require('fs');
const promisify = require('util').promisify;
const Handlebars = require('handlebars');
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const mime = require('./mime.js');
//压缩
const compress =require('./compress');
//读取字节
const range =require('./range');
const isFresh = require('./cache');
//绝对路径
const path = require('path');
const tplPath = path.join(__dirname, '../template/dir.tpl');
//这个是同步，因为只执行一次. 要转成字符串，也可以,'utf-8'
const source = fs.readFileSync(tplPath);
const template = Handlebars.compile(source.toString());

module.exports = async function (req, res, filePath,config) {

    try {
        const stats = await stat(filePath);
        if (stats.isFile()) {
            const  contentType = mime(filePath);
            res.setHeader('Content-Type', contentType);
            
            if(isFresh(stats,req,res)) {
                res.statusCode = 304,
                res.end();
                return false;
            }

            let rs;
            const {code,start, end} = range(stats.size,req,res);
            if(code === 200) {
                res.statusCode = 200;
                rs = fs.createReadStream(filePath);
            } else {
                res.statusCode = 206;
                rs = fs.createReadStream(filePath,{start,end});
            }

            //压缩文件
            if(filePath.match(config.compress)) {
                rs = compress(rs,req,res)
            }
           rs.pipe(res)
        } else if (stats.isDirectory()) {
            const files = await readdir(filePath);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html'); 
            const dir = path.relative(config.root, filePath)
            const data = {
                title: path.basename(filePath),
                dir: dir
                    ? `/${dir}`
                    : '',
                files:files.map(file =>{
                    return {
                        file,
                        icon: mime(file)
                    }
                })
            };
            res.end(template(data));
        }
    } catch (ex) {
        console.error(ex)
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end(`${filePath} is not a directory or file ${ex}`);
    }
}