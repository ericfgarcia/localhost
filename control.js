/**
 * Created by JetBrains PhpStorm.
 * User: hemin
 * Date: 12-2-18
 * Time: 13:53
 * To change this template use File | Settings | File Templates.
 * TODO:http://club.cnodejs.org/topic/4f16442ccae1f4aa27001071-后续需兼容大文件
 */

"use strict";
var route = require('./config'),
    config = route.config,
    url = require('url'),
    querystring = require('querystring'),
    fs = require('fs'),
    jade = require('jade'),
    path = require('path'),
    mime = require('./mime'),
    os = require('os'),
    isWin = /(Windows)/i.test(os.type()),
    exec = require('child_process').exec;

exports.init = function (req, res) {
    var method = req.method;
    if (method === 'GET') {
        exports.GET(req, res);
    } else if (method === 'POST') {
        exports.POST(req, res);
    }
};

exports.GET = function (req, res) {
    var currentConfig = config[req.headers.host];
    if (!currentConfig) {
        res.end();
        return;
    }
    //搜索功能
    function search_key(str, dir, obj) {
        //FIXME
    }

    var root = currentConfig.path;
    root += (req.url);
    if (-1 != req.url.indexOf("?key=")) {
        var ret;
        var key = req.url.slice(req.url.indexOf("?key=") + 5);
        search_key(key, req.url.slice(0, req.url.indexOf("?key=")), ret);
        res.writeHead(200, {'Content-type':'text/plain;charset=utf-8'});
        res.write(ret);
        res.end();
    }
    var extname = path.extname(root);
    extname = extname !== '' ? extname.substring(1, extname.length) : '';
    root = decodeURIComponent(root);
    if (path.existsSync(root)) {
        fs.stat(root, function (err, stats) {
                //如果是目录，则读取目录的所有文件
                if (stats.isDirectory()) {
                    fs.readdir(root, function (err, files) {
                            res.writeHead(200, {'Content-type':'text/html;charset=utf-8'});
                            var _path = (req.url === '/' ? '' : req.url),
                                data = {
                                    list:[]
                                };
                            if (files) {
                                files.forEach(function (item, index) {
                                    try {
                                        var _stats = fs.statSync(root + '/' + item);
                                        data.list.push({
                                            href:_path + '/' + encodeURIComponent(item),
                                            text:'【' + (_stats.isDirectory() ? 'DIR' : 'File') + '】' + item,
                                            isDirecotory:_stats.isDirectory(),
                                            time:_stats.ctime,
                                            size:_stats.size,
                                            filename:encodeURIComponent(item),
                                            path:_path,
                                            isImg:/(png|jpg|jpeg|bmp|gif)/gi.test(item),
                                            index:index
                                        });

                                    } catch (e) {
                                        console.log('Error:' + item);
                                    }
                                });
                            }

                            data.returnParent = {
                                //由于window和unix操作系统，路径的 / 和 \意义不一样，所以这里需要对win进行处理
                                href:path.normalize(_path + '/..').replace(/\\/gi, '/'),
                                isDirecotory:true
                            };
                            //页面标题
                            data['pageTitle'] = decodeURIComponent(path.normalize(_path));
                            //URL路径
                            if (isWin) {
                                data['path'] = data['pageTitle'].split('\\');
                            } else {
                                data['path'] = data['pageTitle'].split('/');
                            }

                            data['path'] = data['path'].map(function (item, i) {
                                if (i > 0) {
                                    //判断是否为最后一个元素
                                    if (i < data['path'].length - 1) {
                                        return {
                                            text:item,
                                            href:encodeURIComponent(data['path'].slice(1, i + 1).join('/'))
                                        };
                                        //否则，最后一个元素是不需要链接的
                                    } else {
                                        return {
                                            text:item
                                        }
                                    }
                                } else {
                                    return {
                                        text:'Root',
                                        href:''
                                    }
                                }
                            });

                            data.config = config;

                            var fn = jade.compile(fs.readFileSync('./views/layout.jade'));
                            data.dataString = JSON.stringify(data);
                            res.end(fn(data));
                        }
                    )
                }
                //如果是文件则读取文件内容
                else if (stats.isFile()) {
                    fs.readFile(root, function (err, data) {
                        if (!err) {
                            res.writeHead(200, {'Content-Type':mime.config[extname] ? mime.config[extname] : 'object/stream'});
                            res.end(data);
                        } else {
                            res.end(err.toString());
                        }
                    });
                } else {
                    res.writeHead(200, {'Content-type':'text/plain"'});
                    res.end('unsupport type of file.');
                }

            }
        )
    }
    else {
        res.writeHead(404, {'Content-type':'text/html; charset="utf-8"'});
        var fn = jade.compile(fs.readFileSync('./views/404.jade'));
        res.end(fn({path:root}));
    }
};


exports.POST = function (req, res) {
    var _url = url.parse('http://' + req.headers.host + req.url);
    var postData = [];


    if (_url.pathname === '/modifyConfig') {
        console.log('Modify Config!');

        req.addListener("data", function (postDataChunk) {
            postData.push(postDataChunk);
        });
        req.addListener('end', function () {
            config.currentView = querystring.parse(postData.join()).currentView;
            res.end(JSON.stringify(config));
            exports.saveConfig();
        });
    } else if (_url.pathname === '/delete') {
        postData = [];
        req.addListener("data", function (postDataChunk) {
            postData.push(postDataChunk);
        });
        req.addListener('end', function () {
            var filename = querystring.parse(postData.join(''));
            var files = config[req.headers.host].path + decodeURIComponent(filename.files);
            files = files.replace(/\//gmi, '\\');
            if (filename.isdir === 'file') {
                fs.unlink(files, function (err) {
                    console.log(err);
                    if (!err) {
                        res.end(JSON.stringify({success:true}))
                    } else {
                        res.end(JSON.stringify({error:err.toString()}));
                    }
                });
            } else if (filename.isdir === 'dir') {
                files = files.replace(/\//gmi, '\\');
                try {
                    exec('rd /S /Q ' + files);
                    res.end(JSON.stringify({'success':'done'}));
                } catch (e) {
                    res.end(JSON.stringify({"error":e.toString()}));
                }
            } else {
                res.end(JSON.stringify({error:'Not understand!'}));
            }
            postData = [];
        });
    } else if (_url.pathname === "/rename") {
        console.log('Rename file!');
        req.addListener("data", function (postDataChunk) {
            postData.push(postDataChunk);
        });
        req.addListener('end', function () {
            var renamefile = querystring.parse(postData.join());
            var path = renamefile.path;
            var origin = config[req.headers.host].path + path + '\\' + decodeURIComponent(renamefile.origin);
            var to = config[req.headers.host].path + path + '\\' + renamefile.to;
            origin = origin.replace(/\//gmi, '\\');
            to = to.replace(/\//gmi, '\\');
            console.log(path, to, origin)
            fs.rename(origin, to, function (err) {
                if (!err) {
                    res.end(JSON.stringify({success:true}));
                } else {
                    res.end(JSON.stringify({success:false}));
                }
            });
        });
    }
};

exports.saveConfig = function () {
    var _tempObj = [];
    _tempObj.push('exports.config={};');
    Object.keys(config).forEach(function (key) {
        _tempObj.push('exports.config.' + [key] + ' =' + JSON.stringify(config[key], undefined, '\t') + ';');
    });
    fs.writeFile('config.js', _tempObj.join('\r\n\r\n'));
};


