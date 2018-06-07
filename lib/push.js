const glob = require('glob');
const path = require('path');
const async = require('async');
const fs = require('fs');
const request = require('request');
const FormData = require('form-data');
const ProgressBar = require('progress');
const WHITE_SUFFIX = ['*.jpg', '*.png', '*.gif', '*.jpeg', '*.mp4'];

require('./global');


function upload(filePath) {
    return function(callback) {
        const fileStream = fs.createReadStream(filePath);
        const fileName = path.basename(filePath);
        const fileSize = fs.statSync(filePath).size;
        
        // 开始上传
        log(`正在上传 ${fileName}`);
        const bar = new ProgressBar(` uploading [:bar] :percent`, {
            width: 90,
            total: fileSize,
            clear: true,
            complete: '#' 
        });

        const tips = {
            success: `上传 <<${fileName}>> 成功 ===> `,
            error: `上传 <<${fileName}>> 失败，请重试`
        };
        
        const formData = new FormData();
        formData.append('file', fileStream, {
            filename: fileName
        });
        fileStream.on('data', (chunk) => {
            bar.tick(chunk.length);
        });

        // 只能内网访问
        formData.pipe(request.post({
            url: 'http://10.86.219.119:7005/qupd/swift',
            headers: formData.getHeaders(),
            json: true
        }, (err, response, body) => {
            if (err || !body.ret) {
                error(tips.error, err || '');
                return;
            }
            success(`${tips.success}${body.data}`);
            console.info('--------------------\n');
            callback(null);
        }));
    }
}

// 扫描整个目录
function scanDirectory(scanRoot, options) {
    // 扫描图片
    const globOptions = {
        cwd: scanRoot,
        nocase: true
    };

    const globPathPrefix = options.recursive ? '**' : '';
    const globPattern = WHITE_SUFFIX.map(item => {
        return path.join(scanRoot, globPathPrefix + '/' + item);
    }).reduce((a, b) => {
        return a + ',' + b;
    });

    

    glob(`{${globPattern}}`, globOptions,  (err, files) => {
        if (err) {
            throw err;
        }
        const taskList = [];
        const fileCount = files.length;

        taskList.push((callback) => {

            if (fileCount === 0) {
                callback('在此文件夹下未发现可上传的文件。');
                return;
            }
            warn(`在 ${scanRoot} 目录下共扫描到 ${fileCount} 个文件\n`);
            callback(null);
        });
        
        files.forEach((file) => {
            taskList.push(upload(file.toLowerCase()));
        });

        async.series(taskList, (err) => {
            if (err) {
                error(err);
            } else {
                success(`全部上传完毕。`);
            }
        });
    });
}

// 扫描单个文件
function scanSigleFile(file) {
    const taskList = [];
    taskList.push(upload(file));
    async.series(taskList, (err) => {
        if (err) {
            error(err);
        } else {
            success(`上传完毕。`);
        }
    });
}

// pathname 支持一下几种情况
// 1) . 表示当前目录
// 2) ./xx.jpg 或者 xx.jpg 表示当前路径下的文件
// 3) /abc/abc.jpg 表示特定路径下的文件
// 4) /abc/def/ 表示特定路径下的所有文件
async function go(pathname, options) {

     // 获得当前目录
    const scanRoot = pathname === '.' ? process.cwd() : pathname;

    const stat = fs.statSync(scanRoot);
    if (stat.isFile()) {
        const resolvePath = path.resolve(pathname);
        const extName = path.extname(pathname);
        const isPass = WHITE_SUFFIX.some(suffix => {
            return suffix.indexOf(extName) > -1;
        });
        if (!isPass) {
            error(`只允许以 ${WHITE_SUFFIX.join(',')} 后缀的文件。`);
            return;
        }
        scanSigleFile(resolvePath);
        return;
    }

    // 扫描文件夹中的文件
    scanDirectory(scanRoot, options);
}

module.exports = (...args) => {
    go(...args).catch(err => {
        error(err);
        process.exit;
    });
}