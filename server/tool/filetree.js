const walk = require('walk'),
    path = require('path');


let dirs = [],
    files = [],
    fileTree = [];

/**
 * 获取images下的文件结构
 * */
let walkDir = (pathname) => {
    return  new Promise((resolve, reject) => {

        let walker = walk.walk(pathname, {followLinks: false});

        //  遍历所有文件夹 加到dirs数组
        walker.on('directory', (roots, stat, next) => {
            dirs.push(stat.name);
            next();
        });

        //  遍历所有文件 加到files数组
        walker.on('file', (roots, stat, next) => {
            let url = roots + '/' + stat.name;
            files.push({
                'path': path.basename(roots),
                'filename': stat.name
            });
            next();
        });

        //  结束遍历
        walker.on('end', () => {

            dirs.forEach((val, idx) => {
                fileTree.push({
                    'name': val
                })
            });

            fileTree.forEach((val, idx) => {
                fileTree[idx].imgs = [];
                files.forEach((value, index) => {
                    if (val.name === value.path) {
                        // console.log(fileTree[idx]);
                        // console.log(files[index].filename);

                        fileTree[idx].imgs.push(path.join(val.name, files[index].filename));
                    }
                })
            });

            console.log(fileTree)

            //  Promise onfilled状态返回结果
            resolve(fileTree);

            // 清空数组 下次备查
            dirs = [];
            files = [];
            fileTree = [];
        });

    })
}


module.exports = {
    walkDir: walkDir
}





