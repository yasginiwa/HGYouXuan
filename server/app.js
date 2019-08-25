const Koa = require('koa'),
    path = require('path'),
    serve = require('koa-static'),
    bodyParser = require('koa-bodyparser')();


let app = new Koa();

//  解析请求体
app.use(bodyParser);

//  图片静态资源（服务端)
const images = path.join(__dirname, './public/images');
app.use(serve(images));


//  引入路由分发
const router = require('./routes/index.js');
app.use(router.routes())
    .use(router.allowedMethods());

app.listen(3000, () => {
    console.log('running on http://localhost:3000');
});

