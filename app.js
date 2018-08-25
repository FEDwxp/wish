const http = require('http');
const server = http.createServer();
const url = require('url');
const mime = require('mime');
const handlebars = require('handlebars');
const querystring = require('querystring');
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

//设置链接数库
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'wish'
});
    // 拼接模板路径
    let viewsPath = path.join(__dirname,'views');

server.on('request',(req,res) => {
    // 提取地址栏路径
    let {pathname} = url.parse(req.url);
    //设置路由
    if(pathname == '/' || pathname == '/index' && req.method.toLowerCase() == 'get') {
        // 读取文件
        fs.readFile(path.join(viewsPath,'index.html'),'utf8',(err, result)=> {
            // 编写sql语句
            let sql = "select * from list";
            //执行sql语句
            connection.query(sql,(err,rows) => {
                // 设置模板
                let template = handlebars.compile(result);
                // 调用模板,参数必须是对象
                let str = template({rows});
                //响应页面
                res.end(str);
            });
        });
    }else if(pathname == '/add' && req.method.toLowerCase() == 'post'){
        // 获取post传输的数据
        let formData = '';
        req.on('data', data=>{
            formData += data;
        });
        req.on('end',()=>{
            // 将获取的数据转化为对象
            formData = querystring.parse(formData);
            formData.publishDate = new Date(); 
        // 拼接sql语句
        let sql = "insert into list set ?";
        connection.query(sql, formData, (err) => {
            res.writeHead(200,{
                'content-Type':'application/json'
            });
            if(err) {
                res.end({success: true,message:'愿望添加成功'});
            }else{
                res.end({success: false,message:'愿望添加成功'});
            }
        });
        });
    }else {
        // 拼接静态资源路径
        let publicPath = path.join(__dirname, 'public', pathname);
        // 读取文件
        fs.readFile(publicPath, (err, result) => {
            //  设置请求头
            if(!err){
            res.writeHead(200,{
            'Content-Type': mime.getType(publicPath)
            });
            res.end(result);
            }else{
                res.writeHead(400,{
                    'content-Type':'text/html;charset=utf8'
                });
                res.end('页面找不到了');
            }
        });
    }
});


server.listen(3000,err => {
    if(!err) {
        console.log('服务器启动成功，监听3000端口');
        return;
    }
    console.log(err);
});

handlebars.registerHelper('formatTime', publishDate => {
    return moment(publishDate).format('YYYY年MM月DD日');
});