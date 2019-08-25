const router = require('koa-router')(),
    path = require('path'),
    filetree = require('../tool/filetree.js');


//  请求模板列表
router.get('/patternlist', async (ctx, next) => {
    let trees = [];
    await filetree.walkDir('public/images/sticker')
        .then((tree) => {
            ctx.response.body = tree;
        })
    next();
});

//  请求背景图列表
router.get('/backgroundlist', async (ctx, next) => {
    let trees = [];
    await filetree.walkDir('public/images/')
        .then((tree) => {
            tree.forEach((val, idx) => {
                if (val.name == 'background') {
                    ctx.response.body = val.imgs;
                }
            })
        })
    next();
});

module.exports = router;
