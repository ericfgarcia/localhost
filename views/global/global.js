/**
 * Created by JetBrains WebStorm.
 * User: songsong
 * Date: 12-3-6
 * Time: 下午8:57
 * To change this template use File | Settings | File Templates.
 */




/*
 $(document.body).append('<p style="text-align: center; background: #eee;" id="testContainer">此内容来自global.js中！</p>');
 $('#testContainer').css('opacity', '0').animate({
 padding:'20px',
 'margin-top':'40px',
 opacity:1
 }, 300);
 */

if (!window.console) {
    window.console = {
        log:function (str) {
            window.status = str;
        }
    }
}

var _host = 'http://' + window.location.host;

/*改变配置信息*/
$('#switch-views').bind('change', function () {
    $.post(_host + '/modifyConfig', {currentView:this.value}, function () {
        window.location.reload();
    }, 'json');
});

$('span.del').click(function () {
    $this = $(this);
    $.post(_host + '/delete', {
        'files':$this.parent('li').find('>div.word>a').attr('href'),
        'isdir':$this.parent('li').attr('isdir')
    }, function (data) {
        $this.parent('li').remove();
    }, 'text');
    return false;
});


/*$(document.body).append('<p id="prview"><img src=""></p>');
 $prviewObj = $('#prview');
 $('li').hover(function () {
 var href = $(this).find('a').eq(0).attr('href'),
 _href = href;
 _href = _href.substring(_href.lastIndexOf('.') + 1);
 if (/(png|jpg|jpeg|bmp|gif|ico)$/gi.test(_href) === true) {
 $prviewObj.show();
 $prviewObj.find('img').eq(0).attr('src', href);
 }
 }, function () {
 $prviewObj.hide();
 });*/


//排序，按时间和大小
var modSort = function (id, tag, prop) {
    this.box = document.getElementById(id);
    this.tag = tag;
    this.arr = this.box.getElementsByTagName(this.tag);
    this.prop = prop;
};

modSort.prototype = {
    asc:function () {
        var _this = this, len = _this.arr.length, temp = 0, nums = [];
        for (var i = 0; i < len; i++) {
            nums.push(new Date(_this.arr[i].getAttribute(_this.prop)));

        }
        for (var i = 0; i < len; i++) {
            for (var j = 0; j < len - 1; j++) {
                if (nums[j].getTime() > nums[j + 1].getTime()) {
                    temp = nums[j];
                    nums[j] = nums[j + 1];
                    nums[j + 1] = temp;
                }
            }
        }
        for (var i = 0; i < len; i++) {
            for (var j = 0; j < len; j++) {
                if (nums[i].getTime() == new Date(_this.arr[j].getAttribute(_this.prop)).getTime()) {
                    _this.box.insertBefore(_this.arr[j], _this.arr[i]);
                }
            }
        }
    },
    desc:function () {
        var _this = this, len = _this.arr.length, temp = 0, nums = [];
        for (var i = 0; i < len; i++) {
            nums.push(new Date(_this.arr[i].getAttribute(_this.prop)));
        }
        for (var i = 0; i < len; i++) {
            for (var j = 0; j < len - 1; j++) {
                if (nums[j].getTime() < nums[j + 1].getTime()) {
                    temp = nums[j];
                    nums[j] = nums[j + 1];
                    nums[j + 1] = temp;
                }
            }
        }
        for (var i = 0; i < len; i++) {
            for (var j = 0; j < len; j++) {
                if (nums[i].getTime() == new Date(_this.arr[j].getAttribute(_this.prop)).getTime()) {
                    _this.box.insertBefore(_this.arr[j], _this.arr[i]);
                }
            }
        }
    },
    size_desc:function () {
        var _this = this, len = _this.arr.length, temp = 0, temp1 = 0, nums = [], index = [];
        for (var i = 0; i < len; i++) {
            nums.push(parseInt(_this.arr[i].getAttribute(_this.prop)));
            index.push(i);
        }
        for (var i = 0; i < len; i++) {
            for (var j = 0; j < len - 1; j++) {
                if (nums[j] > nums[j + 1]) {
                    temp = nums[j];
                    nums[j] = nums[j + 1];
                    nums[j + 1] = temp;

                    temp1 = index[j];
                    index[j] = index[j + 1];
                    index[j + 1] = temp1;
                }
            }
        }
        var lis = [];
        for (var i = 0; i < len; i++) {
            lis.push(_this.arr[index[i]]);
        }
        for (var i = 0; i < len; i++) {
            _this.box.insertBefore(lis[i], _this.arr[0]);
        }
    },
    size_asc:function () {
        var _this = this, len = _this.arr.length, temp = 0, temp1 = 0, nums = [], index = [];
        for (var i = 0; i < len; i++) {
            nums.push(parseInt(_this.arr[i].getAttribute(_this.prop)));
            index.push(i);
        }
        for (var i = 0; i < len; i++) {
            for (var j = 0; j < len - 1; j++) {
                if (nums[j] < nums[j + 1]) {
                    temp = nums[j];
                    nums[j] = nums[j + 1];
                    nums[j + 1] = temp;

                    temp1 = index[j];
                    index[j] = index[j + 1];
                    index[j + 1] = temp1;
                }
            }
        }
        var lis = [];
        for (var i = 0; i < len; i++) {
            lis.push(_this.arr[index[i]]);
        }
        for (var i = 0; i < len; i++) {
            _this.box.insertBefore(lis[i], _this.arr[0]);
        }
    }
};

var _list = document.getElementById("list-sort");
_list.onchange = function () {
    if (this.value == "time_asc") {
        new modSort("sort-ul", "li", "time").asc();
    } else if (this.value == "time_desc") {
        new modSort("sort-ul", "li", "time").desc();
    } else if (this.value == "size_desc") {
        new modSort("sort-ul", "li", "size").size_desc();
    } else if (this.value == "size_asc") {
        new modSort("sort-ul", "li", "size").size_asc();
    }
};

$("#search-btn").click(function () {
    /* $.ajax({
     url:_host,
     data:{"key":$("#key_input").val()},
     success:function (ret) {
     //FIXME
     alert(ret);
     }, error:function () {
     alert(11)
     }
     })*/
});
(function () {
    var liObj = document.getElementById('sort-ul').getElementsByTagName('li');
    $('#key_input').bind('keydown', function (ev) {
        setTimeout(function () {
            var value = $.trim(ev.target.value);
            $(liObj).each(function (index, obj) {
                var $obj = $(obj), filename = $obj.attr('filename');
                if (filename.toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) > -1) {
                    $obj.slideDown(200, function () {
                        if ($('#container').hasClass('water_pull')) {
                            console.log(123)
                            new Waterfall({
                                "container":"sort-ul",
                                "colWidth":235,
                                "colCount":4
                            });
                        }
                    });
                } else {
                    $obj.hide();
                }
            });
        }, 0);
    });
})();


//瀑布流展示
function Waterfall(param) {
    this.id = typeof param.container == 'string' ? document.getElementById(param.container) : param.container;
    if (!this.id) {
        return;
    }
    this.colWidth = param.colWidth;
    this.colCount = param.colCount || 4;
    this.cls = param.cls && param.cls != '' ? param.cls : 'list-li';
    this.init();
}

Waterfall.prototype = {
    getByClass:function (cls, p) {
        var arr = [], reg = new RegExp("(^|\\s+)" + cls + "(\\s+|$)", "g");
        var nodes = p.getElementsByTagName("*"), len = nodes.length;
        for (var i = 0; i < len; i++) {
            if (reg.test(nodes[i].className)) {
                arr.push(nodes[i]);
                reg.lastIndex = 0;
            }
        }
        return arr;
    },
    maxArr:function (arr) {
        var len = arr.length, temp = arr[0];
        for (var ii = 1; ii < len; ii++) {
            if (temp < arr[ii]) {
                temp = arr[ii];
            }
        }
        return temp;
    },
    getMar:function (node) {
        var dis = 0;
        if (node.currentStyle) {
            dis = parseInt(node.currentStyle.marginBottom);
        } else if (document.defaultView) {
            dis = parseInt(document.defaultView.getComputedStyle(node, null).marginBottom);
        }
        return dis;
    },
    getMinCol:function (arr) {
        var ca = arr, cl = ca.length, temp = ca[0], minc = 0;
        for (var ci = 0; ci < cl; ci++) {
            if (temp > ca[ci]) {
                temp = ca[ci];
                minc = ci;
            }
        }
        return minc;
    },
    init:function () {
        var _this = this;
        var col = [], //列高
            iArr = [];//索引
        var nodes = _this.getByClass(_this.cls, _this.id), len = nodes.length;
        for (var i = 0; i < _this.colCount; i++) {
            col[i] = 0;
        }
        for (var i = 0; i < len; i++) {
            nodes[i].h = nodes[i].offsetHeight + _this.getMar(nodes[i]);
            iArr[i] = i;
        }
        for (var i = 0; i < len; i++) {
            var ming = _this.getMinCol(col);
            nodes[i].style.left = ming * _this.colWidth + "px";
            nodes[i].style.top = col[ming] + "px";
            col[ming] += nodes[i].h;
        }
        _this.id.style.height = _this.maxArr(col) + "px";
    }
};

document.getElementById("dis_list").onclick = function () {
    document.getElementById("container").className = "";
    var lis = document.getElementById("sort-ul").getElementsByTagName("li"), len = lis.length;
    for (var i = 0; i < len; i++) {
        lis[i].style.position = "relative";
        lis[i].style.left = "0";
        lis[i].style.top = "0";
        lis[i].style.width = "930px";
        lis[i].style.height = "45px";
    }
    document.getElementById("sort-ul").style.height = "auto";
};
document.getElementById("water_pull").onclick = function () {
    document.getElementById("container").className = "water_pull";
    var lis = document.getElementById("sort-ul").getElementsByTagName("li"), len = lis.length;
    for (var i = 0; i < len; i++) {
        lis[i].style.position = "absolute";
    }
    new Waterfall({
        "container":"sort-ul",
        "colWidth":235,
        "colCount":4
    });
};
document.getElementById("dis_mode").onclick = function () {
    document.getElementById("container").className = "dis_mode";
    var lis = document.getElementById("sort-ul").getElementsByTagName("li"), len = lis.length;
    for (var i = 0; i < len; i++) {
        lis[i].style.position = "relative";
        lis[i].style.left = "0";
        lis[i].style.top = "0";
        lis[i].style.width = "400px";
        lis[i].style.height = "50px";
    }
    document.getElementById("sort-ul").style.height = "auto";
};
document.getElementById("water_pull").onclick = function () {
    document.getElementById("container").className = "water_pull";
    var lis = document.getElementById("sort-ul").getElementsByTagName("li"), len = lis.length;
    for (var i = 0; i < len; i++) {
        lis[i].style.position = "absolute";
        lis[i].style.width = "217px";
        lis[i].style.height = "auto";
    }
    new Waterfall({
        "container":"sort-ul",
        "colWidth":235,
        "colCount":4
    });
};

function modifyFileName(ev) {
    switch (ev.type) {
        case "click":
            var $this = $(ev.target);
            if ($this.parents('span.revise').size() > 0 || $this.hasClass('revise')) {
                var worldObj = $this.parents('li').find('div.word');
                if (worldObj.find('input.edit').size() == 0) {
                    worldObj.append('<span class="edit"><input type="text" class="edit" value="' + decodeURIComponent($this.parents('li').attr('filename').replace('/', '')) + '"><span class="status">Esc：取消更名，Enter：确认更名</span></span>');
                }
                worldObj.find('input.edit').focus();
            }
            break;
        case "keydown":
            switch (ev.keyCode) {
                //如果按了ESC
                case 27:
                    console.log('取消重命名');
                    var $this = $(ev.target);
                    if ($this.hasClass('edit') && $this[0].nodeName === 'INPUT') {
                        $this.parents('span.edit').remove();
                    }
                    break;
                //如果按了Enter键
                case 13:
                    var $this = $(ev.target);
                    if ($this.hasClass('edit') && $this[0].nodeName === 'INPUT') {
                        var path = $this.parents('li').attr('path');
                        var origin = $this.parents('li').attr('filename');
                        var to = $.trim($this[0].value);
                        $.post(_host + '/rename', {
                            path:path,
                            origin:origin,
                            to:to
                        }, function (data) {
                            if (data.success === true) {
                                window.location.reload();
                            } else {
                                alert('重命名失败');
                                $this.parents('span.edit').remove();
                            }
                        }, 'json');
                    }
                    break;
            }
            break;
    }
}

$(document).on('keydown', modifyFileName);
$(document).on('click', modifyFileName);

