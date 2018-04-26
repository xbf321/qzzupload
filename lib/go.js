const glob = require('glob');
const path = require('path');
const async = require('async');
const fs = require('fs');
const request = require('request');
const FormData = require('form-data');;

require('./global');

function upload(filePath) {
    return function(callback) {
        const fileStream = fs.createReadStream(filePath);
        const fileName = path.basename(filePath);

        // 开始上传
        log(`正在上传 <<${fileName}>>`);

        const tips = {
            success: `上传成功，<<${fileName}>> => https://img1.qunarzz.com`,
            error: `<<${fileName}>> 图片上传失败，请重试`
        };
        
        const formData = new FormData();
        formData.append('file', fileStream, {
            filename: fileName
        });

        // 只能内网访问
        formData.pipe(request.post({
            url: 'http://10.86.219.119:7005/qupd/upload',
            headers: formData.getHeaders(),
            json: true
        }, (err, response, body) => {

            if (err) {
                error(tips.error);
            }
            if (body.ret && body.data.length === 1) {
                const retUrl = body.data[0].img;
                success(`${tips.success}${retUrl}`);
            } else {
                error(tips.error);
            }
            callback(null);
        }));
    }
}

async function go(options) {
    // 获得当前目录
    const scanRoot = process.cwd();

    // 扫描图片
    const globOptions = {
        cwd: scanRoot
    };

    const globPathPrefix = options.recursive ? '**' : '';

    const globPattern = [ globPathPrefix + '/*.jpg', globPathPrefix + '/*.png'].reduce((a, b) => {
        return path.join(scanRoot, a) + ',' + path.join(scanRoot, b);
    });

    
    glob(`{${globPattern}}`, globOptions,  (err, files) => {
        if (err) {
            throw err;
        }
        const taskList = [];
        const fileCount = files.length;
        taskList.push((callback) => {
            if (fileCount === 0) {
                callback('在此文件夹下未发现图片。');
                return;
            }
            log(`共找到 ${fileCount} 张图片。`);
            callback(null);
        });
        
        files.forEach((file) => {
            taskList.push(upload(file));
        });

        async.series(taskList, (err) => {
            if (err) {
                error(err);
            } else {
                log(`全部上传完毕。`);
            }
        });
    });
}

module.exports = (...args) => {
    go(...args).catch(err => {
        error(err);
        process.exit;
    });
}