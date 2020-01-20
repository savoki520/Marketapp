var $href = "http://www.youguangchina.cn/";
// var $href = 'http://192.168.0.101:8080/';
// var appid = 'wx04d29c82e1d4eb0f';
var appid = 'wxc4aaae117c8ba4e5';

window.onload = function () {
    var key = localStorage.getItem('key');
    if(key === 'login'){
        var account = localStorage.getItem('account'),password = localStorage.getItem('password');
        $('#login_account').val(account);
        $('#login_password').val(password);
        if(password !== null&&password !== ''){
            $('.login_remeber').prop('checked',true);
        }
    }
    else if(key === 'index'){
        shouquan();
    }
    else if(key === 'activity'){
        $('.slice').show();
        $('.ma_mc').attr({'data-sort':'beginTime','data-page':2,'data-status':'1'}).children()
            .filter(".ma_mc_item").remove();
        actiread(localStorage.getItem('shopid'),1,'1','beginTime');

        $(document).scroll(function () {
            var height = $(document).height();
            var scrheight = $(document).scrollTop();
            var viewh = $(window).height();
            if(viewh+scrheight >= height){
                var load = $('.ma_mc_page');
                var tex = load.text();
                if(tex === '下一页'){
                    $('.slice').show();
                    var art = $('.ma_mc');
                    var page = parseInt(art.attr('data-page'));
                    actiread(localStorage.getItem('shopid'),page,art.attr('data-status'),art.attr('data-sort'));
                }

            }
        })
    }
    else if(key === 'writeoff'){
        $('.wo_content_two').children().filter(".wo_item").remove();
        $('.slice').show();
        wo(localStorage.getItem('shopid'),1,$('.wo_header').attr('data-status'),'');

        $(document).scroll(function () {
            var height = $(document).height();
            var scrheight = $(document).scrollTop();
            var viewh = $(window).height();
            if(viewh+scrheight >= height){
                var load = $('.wo_more');
                var tex = load.text();
                if(tex === '下一页'){
                    $('.slice').show();
                    var page = load.attr('data-page');
                    var status = $('.wo_header').attr('data-status');
                    wo(localStorage.getItem('shopid'),page,status,'');
                }
            }
        })
    }
    else if(key === 'cash'){
        cashread();
    }
};
var handle = function(event){
    event.preventDefault(); //阻止元素发生默认的行为
};
document.body.addEventListener('touchmove',handle,false);//添加监听事件--页面不可滚动
// document.body.removeEventListener('touchmove',handle,false);//移除监听事件--页面恢复可滚动
//登陆功能
//记住密码
$('.login_remeber').click(function () {
    console.log($(this).prop('checked'));
   if($(this).prop('checked')){
       localStorage.setItem('account',$('#login_account').val());
       localStorage.setItem('password',$('#login_password').val());
   }
   else {
       localStorage.setItem('account',$('#login_account').val());
       localStorage.setItem('password','');
   }
});
//登陆
$('.login_ok').click(function () {
    var acount = $('#login_account').val();
    var password = $('#login_password').val();
    var data = {account:acount,initialPassword:password};
    console.log(data);
    if(acount === ''||acount === null||password === ''||password === null){
        alert('账号密码不能为空！');
    }
    else {
        $.ajax({
            url:$href + 'MarketPlatform/seller/login',
            type:'post',
            data:JSON.stringify(data),
            dataType:'json',
            contentType:'application/json',
            success:function (data) {
                console.log(data);
                if(data.result === 'success'){
                    localStorage.setItem('account',acount);
                    localStorage.setItem('shopid',data.shopId);
                    window.location.href = 'index.html';
                }
                else {
                    alert('登陆失败，请确认账号密码是否正确？');
                }
            },
            error:function () {
                alert('请勿频繁操作');
            }
        })
    }
});

//修改密码确认
$('.password_ok').click(function () {
    var acount = localStorage.getItem('account');
    var oldpassword = $('#oldp').val();
    var newpassword = $('#newp').val();
    var data = {account:acount,initialPassword:oldpassword,newinitialPassword:newpassword};
    console.log(data);
    if(oldpassword === ''||oldpassword === null||newpassword === ''||newpassword === null){
        alert('密码不能为空！');
    }
    else {
        $.ajax({
            url:$href + 'MarketPlatform/seller/changeAccountInfo',
            type:'post',
            data:JSON.stringify(data),
            dataType:'json',
            contentType:'application/json',
            success:function (data) {
                console.log(data);
                if(data.result === 'success'){
                    alert('修改成功！');
                    localStorage.setItem('password',newpassword);
                    window.location.href = 'index.html';
                }
                else {
                    if(data.message === '登录已过期！'){
                        alert('登陆已过期，请重新登陆！');
                        window.location.href = 'login.html';
                    }
                    else {
                        alert('修改密码失败，请确认旧密码是否正确？');
                    }
                }
            },
            error:function () {
                alert('请勿频繁操作');
            }
        })
    }
});
//判断新密码是否一致
function pp() {
    if($('#newp').val() !== $('#nnp').val()){
        $('.password_prompt').text('*两次密码输入不一致');
    }
    else {
        $('.password_prompt').text(null);
    }
}

//首页功能
//首页--》绑定银行卡弹框出现
$('.index_main_binding').click(function () {
    $('.index_bind').show();
   document.getElementById('select')[0].selected = true
});
//首页--》绑定银行卡-->确定?
$('.bind_ok').click(function () {
    $('.index_bind').hide();
});
//首页--》绑定银行卡-->取消
$('.bind_canel').click(function () {
    $('.index_bind').hide();
});
//首页-->绑定银行卡-->下拉菜单设置
$("option").click(function(){
    $("#select").removeAttr("size").blur();
});
$("#select").focus(function(){
    $("#select").attr("size","5");
});

//首页-->退出登录
$('#index_canel').click(function () {
   window.location.href = 'login.html';
});
//首页-->修改密码
$('#index_changepass').click(function () {
    window.location.href = 'password.html';
});


//首页--》判定是否微信授权
function shouquan() {
    var getRequest = urlSearch();
    if (getRequest.code!==undefined&&getRequest.code!==null&&getRequest.code!==localStorage.getItem('code')) {
        localStorage.setItem('code', getRequest.code);
        this.code = getRequest.code;
        //把code值传给后台；
        var d = {code: getRequest.code, shopId: localStorage.getItem('shopid'), port: '1'};
        console.log(d);
        $.ajax({//微信授权
            url: $href + 'MarketPlatform/user/search',
            type: 'post',
            contentType: 'application/json',
            data: JSON.stringify(d),
            dataType: 'json',
            success: function (data) {
                console.log(data);
                // alert(JSON.stringify(data));
                localStorage.setItem('openid', data.openid);
                $('#index_acter').attr('src', data.headPic);
                if(data.result === 'error'){
                    alert('该微信号已绑定其他商户！');
                    // window.location.href = 'login.html';
                }else {
                    readproinfor();
                }
            },
            error: function () {
                alert('请勿频繁操作');
            }
        });
    }else {
        readproinfor();
    }}
//首页-->读取个人信息
function readproinfor() {
    var data = {shopId:localStorage.getItem('shopid')};
    console.log(data);
    $.ajax({
        url:$href + 'MarketPlatform/seller/getShopInfo',
        type:'post',
        data:JSON.stringify(data),
        dataType:'json',
        contentType:'application/json',
        success:function (data) {
            console.log(data);
            if(data.isaccredit === '1'){//已绑定
                $('.index_main_wxfont').show();
                $('.index_main_wxbind').hide();
                $('#index_acter').attr('src',data.image);
                $('#index_shopname').text(data.shopName);
                $('#index_phone').text(data.tel1);
                $('#index_address').text(data.shopAddress);
                $('#index_account').text(data.loginaccount);
                $('#totalrevenue').text(data.revenue);
                $('#monthrevenue').text(data.realRevenue);
                var nu = w(data.sellerNum);
                $('.index_py_item_onenumber').text(data.ongoingtimes);
                $('#totalnumber').text(nu);
                $('.index_py_sold').text(nu).attr('data-id',data.sellerNum);
                $('#zjrevenue').text(data.allshopget);
                $('#zhmonthrevenue').text(data.shopget);
                var hand = parseFloat(data.poundagerates)*100;
                var jj = hand.toFixed(1).toString() + '%';
                $('#index_handfee').text(jj);
            }else {//未绑定
                $('.index_main_wxfont').hide();
                $('.index_main_wxbind').show();
                localStorage.setItem('url',window.location.href);
                var pageUrl = window.location.href
                    .replace(/[/]/g, "%2f")
                    .replace(/[:]/g, "%3a")
                    .replace(/[#]/g, "%23")
                    .replace(/[&]/g, "%26")
                    .replace(/[=]/g, "%3d");
                //调用微信登陆授权获取code值
                window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + appid  + "" +
                    "&redirect_uri=" + pageUrl + "&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect";
            }
        },
        error:function () {
            alert('请勿频繁操作');
        }
    })
}
//首页-->提现弹框功能
$('.index_py_withdraw').click(function () {
    var openid = localStorage.getItem('openid');
    if(openid === undefined||openid === null||openid === ''){
        alert('请先进行微信授权再提现！')
    }else{
        $(".index_withdraw").show();
        $('.index_max').text($('.index_py_amount').text());
    }
});
//首页-->提现取消
$('.index_wd_cannel').click(function () {
   $('.index_withdraw').hide();
});
//首页--》提现确认
$('.index_wd_ok').click(function () {
    var d = {openid:localStorage.getItem('openid'),amount:$('#wd_account').val()};
    console.log(d);
    $.ajax({
        url:$href + 'MarketPlatform/transfer/pay',
        type:'post',
        contentType:'application/json',
        data:JSON.stringify(d),
        dataType:'json',
        success:function (data) {
            console.log(data);
        },
        error:function () {
            alert('请勿频繁操作');
        }
    });
});
//首页-->查看售出具体数量?
$('.index_py_solddetail').click(function () {
    var m = $('.index_py_sold').attr('data-id');
    alert(m);
});
//首页--》微信授权
$('.index_main_wxbinging').click(function () {
    //执行微信授权操作；
    localStorage.setItem('url',window.location.href);
    var pageUrl = window.location.href
        .replace(/[/]/g, "%2f")
        .replace(/[:]/g, "%3a")
        .replace(/[#]/g, "%23")
        .replace(/[&]/g, "%26")
        .replace(/[=]/g, "%3d");
    //调用微信登陆授权获取code值
    window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + appid  + "" +
        "&redirect_uri=" + pageUrl + "&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect";
});
//urlSearch()用于将href给json化，方便获取之后的链接之后的code值；
function urlSearch() {
    var str=location.href; //取得整个地址栏
    var num=str.split('?');
    var arr;
    var data={};
    var name;
    $.each(num,function (ind,val) {
        if(ind>0){
            if(val.split('&').length>1){
                for(var i=0;i<val.split('&').length;i++){
                    arr=val.split('&')[i].split('=');
                    name=arr[0];
                    data[name]=arr[1];
                }
            }else {
                arr=val.split('=');
                var name=arr[0];
                data[name]=arr[1];
            }
        }
    });
    return data;
}
//首页--》资金明细跳转
$('.cash_href').click(function () {
   window.location.href = 'cash.html?shopid='+ localStorage.getItem('shopid');
});
//数值过万单位变w
function w(m) {
    var a = m.toString().split(''),n = '';
    if(a.length>4){
        for(var i = 0;i<a.length-4;i++){
            n += a[i];
        }
        n += 'w'
    }
    else {
        n = m;
    }
    return n;
}
//账号手机号数字限制
function numberlimit(e) {
    var content = e.val().length;
    var number = parseInt(e.val()).toString().length;
    // console.log(number);
    if(content !== number){
        alert('请输入数字');
        e.val(null);
    }
    else if(number!==11&&number!==7){
        alert('请输入正确的手机号');
        e.val(null);
    }
}
//银行卡号数字限制
function numlimit(e) {
    var content = e.val().length;
    var number = parseInt(e.val()).toString().length;
    console.log(number);
    if(content !== number){
        alert('请输入数字');
        e.val(null);
    }
}
//提现输入框数字不能超过最大值
function maxx() {
    var wda = $('#wd_account');
    var wd = parseFloat(wda.val());
    // console.log(wd);
    if(wd > parseFloat($('.index_max').text())){
        alert('不能超过最大提现值！');
        wda.val(null);
    }
}

//我的活动
//我的活动--》活动类别切换
$('.ma_nav_item').click(function () {
    // $('.index_anmat').show();
    $('.slice').show();
    $('.ma_nav_item').removeClass('ma_nav_itemadd');
    $(this).addClass('ma_nav_itemadd');
    $('.ma_sort_item_font').removeClass('ma_sort_item_add').eq(0).addClass('ma_sort_item_add');
    var st = $(this).attr('data-status');
    var art = $('.ma_mc');
    art.children().filter(".ma_mc_item").remove();
    art.attr('data-sort','beginTime').attr('data-page',1).attr('data-status',st);
    actiread(localStorage.getItem('shopid'),parseInt(art.attr('data-page')),art.attr('data-status'),art.attr('data-sort'));
});
//我的活动--》活动列表读取
function actiread(spid,page,status,sort) {//spid 商户id,page 页码，status活动的状态即进行中或者已结束，sort排序方式
    var data = {shopId:spid,nowPage:page,eachNumber:5,activitystatus:status,sort:sort};
    console.log(data);
    var pp = $('.ma_mc_page');
    // var pp = $('.slice');
    // pp.show();
    var act = $('.ma_mc');
    act.children('.ma_mc_no').remove();
    $.ajax({
        url:$href + 'MarketPlatform/activity/YDshopManagement',
        type:'post',
        data:JSON.stringify(data),
        dataType:'json',
        contentType:'application/json',
        success:function (data) {
            console.log(data);
            var number = 0;
            var kl = Math.ceil(data.shopActTotalNum/5);
            if(kl === page){
                pp.text('暂无更多数据！');
            } else {
                pp.text('下一页');
            }
            page++;
            act.attr('data-page',page);
            if(data.activitylist.length === 0){
                //没有数据
                act.append('<div class="ma_mc_no"></div>');
                // pp.hide();
                // setTimeout('cartoon()',500);
                $('.slice').hide();
            }
            for(var i = 0;i<data.activitylist.length;i++){
                var st = 'none',nu;
                if(data.activitylist[i].createrLogo3 === '0'){//判断活动是否在平台上架；
                    st = 'block';
                }
                if(i === data.activitylist.length-1){
                    // setTimeout('cartoon()',500);
                    $('.slice').hide();
                }
                number ++;
                nu = parseInt(data.activitylist[i].goodsNumber)+parseInt(data.activitylist[i].sellNumber);
                $('.slice').before('<a class="ma_mc_item" href="http://www.youguangchina.cn/hd/project/platform/index.html' +
                    '?activityId='+ data.activitylist[i].activityId +'&shopId='+ spid +'&openid=null&getertype=1&status=1">\n' +
                    '                <div class="ma_mc_itemone">\n' +
                    '                    <div class="ma_mc_itemimg">\n' +
                    '                        <img src="'+ data.activitylist[i].QRCode1 +'">\n' +
                    '                        <div class="ma_mc_hotbox">热度：<span class="ma_mc_hot">'+ data.activitylist[i].joinnumber +'</span></div>\n' +
                    '                        <div class="ma_mc_platbox" style="display: '+ st +'">已上架</div>\n' +
                    '                    </div>\n' +
                    '                    <div class="ma_mc_itemname">'+ data.activitylist[i].activityName +'</div>\n' +
                    '                    <div class="ma_mc_itemoldprice">原价：￥<span class="ma_oldprice">'+data.activitylist[i].realprice+'</span></div>\n'+
                    '                    <div class="ma_mc_itemprice">\n' +
                    '                        <div class="ma_mc_item_newprice">平台价：￥<span class="ma_newprice">'+ data.activitylist[i].nowprice +'</span></div>\n' +
                    '                        <div class="ma_mc_itemcommission">佣金：￥<span class="ma_commission">'+ data.activitylist[i].commissionMoney +'</span></div>\n' +
                    '                        <div class="ma_mc_itemfour">活动截止时间:<span class="ma_mc_itemfourfont">'+data.activitylist[i].overTime+'</span></div>\n'+
                    '                    </div>\n' +
                    '                </div>\n' +
                    '                <div class="ma_mc_itemtwo">已售: <span class="ma_mc_itemtwofont">'+ data.activitylist[i].sellNumber + '</span>' +
                    '                   <span>总数:</span><span>'+nu+'</span></div>\n' +
                    '               <div class="ma_mc_itemthree">收益:￥<span class="ma_mc_itemthreefont">'+data.activitylist[i].actearnings+'</span></div>\n'+
                    '            </a>')
            }
        },
        error:function () {
            alert('请勿频繁操作');
        }
    })
}
//我的活动--》加载更多功能
$('.ma_mc_page').click(function () {
    if($('.ma_mc_page').text() === '下一页'){
        var art = $('.ma_mc');
        $('.slice').show();
        var page = parseInt(art.attr('data-page'));
        actiread(localStorage.getItem('shopid'),page,art.attr('data-status'),art.attr('data-sort'));
    }
});
//我的活动--》排序切换
$(".ma_sort_item_font").click(function () {
   $('.slice').show();
   $('.ma_sort_item_font').removeClass('ma_sort_item_add');
   $(this).addClass('ma_sort_item_add');
   var so = $(this).attr('data-sort');
   var art = $('.ma_mc');
   art.children().filter(".ma_mc_item").remove();
   art.attr('data-sort',so).attr('data-page',1);
   actiread(localStorage.getItem('shopid'),parseInt(art.attr('data-page')),art.attr('data-status'),art.attr('data-sort'));
});



//核销功能
//核销分类切换
$('.wo_header_item').click(function () {
    // $('.index_anmat').show();
    $('.slice').show();
   $('.wo_header_item').removeClass('wo_header_add');
   $(this).addClass('wo_header_add');
   $('.wo_more').attr('data-page',1);
   var status = $(this).attr('data-status');
    $('.wo_header').attr('data-status',$(this).attr('data-status'));
    $('.wo_content_two').children().not('.slice').remove();
   wo(localStorage.getItem('shopid'),'1',status,'');
});
//核销弹框
function wr(e) {
    $('.wr').show('').attr('data-id',e);
}
$('.wr_cannel').click(function () {
   $('.wr').hide('');
});
//核销确认
$('.wr_ok').click(function () {
   var data = {goodsCdk:$('.wr').attr('data-id')};
   console.log(data);
    $.ajax({
        url:$href + 'MarketPlatform/seller/exchangeCDK',
        type:'post',
        data:JSON.stringify(data),
        dataType:'json',
        contentType:'application/json',
        success:function (data) {
            console.log(data);
            if(data.result === 'success'){
                $('.wr').hide('');
                $('.wo_more').attr('data-page',1);
                $('.wo_content_two').children().not('.slice').remove();
                var status = $('.wo_header').attr('data-status');
                $('.slice').show();
                wo(localStorage.getItem('shopid'),'1',status,'');
            }else {
                alert('核销失败，请重新核销！');
            }
        },
        error:function () {
            alert('请勿频繁操作');
        }
    })
});

//核销列表读取
function wo(shopid,page,status,code) {
    var more = $('.wo_more');
    var data = {cdkstatus:status,goodsCdk:code,shopId:localStorage.getItem('shopid'),nowPage:parseInt(page),eachNumber:10};
    console.log(data);
    $.ajax({
        url:$href + 'MarketPlatform/seller/showgoodsCDK',
        type:'post',
        data:JSON.stringify(data),
        dataType:'json',
        contentType:'application/json',
        success:function (data) {
            console.log(data);
            var time,ss,sss;
            var kl = Math.ceil(data.goodsCdkNum/10);
            if(kl === parseInt(page)){
                more.text('暂无更多数据！');
            } else {
                more.text('下一页');
            }
            more.attr('data-page',parseInt(page)+1);
            if(data.cdkInfo.length === 0){
                $('.wo_content_two').append('<div class="wo_no"></div>');
                // setTimeout('cartoon()',500);
                $('.slice').hide();
            }else {
                for(var i = 0;i<data.cdkInfo.length;i++){
                    if(i === data.cdkInfo.length - 1){
                        // setTimeout('cartoon()',500);
                        $('.slice').hide();
                    }
                    if(status === '0'){//未核销
                        ss = 'none';
                        sss = 'block';
                    }else {
                        ss = 'block';
                        sss = 'none';
                    }
                    $('.slice').before('<div class="wo_item" data-id="'+ data.cdkInfo[i].goodsCdk +'">\n' +
                        '               <div class="wo_item_img">\n' +
                        '                    <img src="'+data.cdkInfo[i].showPic+'">\n' +
                        '                </div>\n'+
                        '                <div class="wo_item_one">\n' +
                        '                <div class="wo_item_title">'+ data.cdkInfo[i].goodsName +'</div>\n' +
                        '                    <div class="wo_item_acterbox">\n' +
                        '                        <div class="wo_item_actername">购买人：</div>\n' +
                        '                        <div class="wo_item_acter">\n' +
                        '                            <img src="'+ data.cdkInfo[i].headPic +'">\n' +
                        '                        </div>\n' +
                        '                    </div>\n' +
                        '                    <div class="wo_item_namebox">\n' +
                        '                        <div class="wo_item_nametit">昵称：</div>\n' +
                        '                        <div class="wo_item_name">'+ data.cdkInfo[i].nickName +'</div>\n' +
                        '                    </div>\n' +
                        '                    <div class="wo_item_button wo_item_wf" style="display: '+ sss +';" onclick="wr(\''+ data.cdkInfo[i].goodsCdk +'\')">核销</div>\n' +
                        '                    <div class="wo_item_button wo_item_wwf" style="display: '+ ss +'">已核销</div>\n' +
                        '                </div>\n' +
                        // '                <div class="wo_item_title">'+ data.cdkInfo[i].goodsName +'</div>\n' +
                        '                <div class="wo_item_paytime">支付时间：'+data.cdkInfo[i].paytime+'</div>\n'+
                        '                <div class="wo_item_amout">\n' +
                        '                    <div class="wo_item_new">平台价(含佣金)：￥<span class="wo_item_newprices">'+ data.cdkInfo[i].realPayMoney +'</span></div>\n' +
                        '                    <div class="wo_item_old">原价：￥<span class="wo_item_oldprices">'+ data.cdkInfo[i].realprice +'</span></div>\n' +
                        '                </div>\n' +
                        '                <div class="wo_item_codebox">\n' +
                        '                    <div class="wo_item_codeone">核销码</div>\n' +
                        '                    <div class="wo_item_codetwo">\n' +
                        '                        <div class="wo_item_code">'+ data.cdkInfo[i].goodsCdk +'</div>\n' +
                        '                        <div class="wo_item_timebox">\n' +
                        '                            <div class="wo_item_timefont">有效期至</div>\n' +
                        '                            <div class="wo_item_time">'+ data.cdkInfo[i].lasttime +'</div>\n' +
                        '                        </div>\n' +
                        '                    </div>\n' +
                        '                </div>\n' +
                        '            </div>')
                }
            }
        },
        error:function () {
            alert('请勿频繁操作');
        }
    })
}
//核销--》加载更多
$('.wo_more').click(function () {
    if($('.wo_more').text() === '下一页'){
        var page = $(this).attr('data-page');
        var status = $('.wo_header').attr('data-status');
        wo(localStorage.getItem('shopid'),page,status,'');
    }
});
//核销搜索回车确定
$('.wo_select').keydown(function (event) {
    if (event.keyCode == 13) {
        $('#wo_select').triggerHandler('click');
    }
});
//核销-->搜索
$('#wo_select').click(function () {
    var code = $('.wo_select').val();
    $('.wo_more').attr('data-page',1).hide();
    var status = $('.wo_header').attr('data-status');
    $('.wo_content_two').children().not('.slice').remove();
    $('.slice').show();
    wo(localStorage.getItem('shopid'),'1',status,code);
});


//资金明细
function cashread() {
    var urll = urlSearch();
    var data = {shopId:urll.shopid,headerId:''};
    console.log(data);
    $.ajax({
        url:$href + 'MarketPlatform/PTYD/getearninglist',
        type:'post',
        data:JSON.stringify(data),
        dataType:'json',
        contentType:'application/json',
        success:function (data) {
            console.log(data);
            if(data.earninglist.length === 0){
                $('.cash_content').append('<div class="cash_content_no"></div>')
            }else{
                for(var i = 0;i<data.earninglist.length;i++){
                    var nn = data.earninglist[i].remark3;
                    if(nn === '已到账！'){
                        nn = '已到账';
                    }else {
                        nn = '未到账';
                    }
                    $('.cash_content').append('<div class="cash_content_item">\n' +
                        '            <div class="cash_content_time">'+data.earninglist[i].transfertime+'</div>\n' +
                        '            <div class="cash_content_amount">￥'+data.earninglist[i].allearning+'</div>\n' +
                        '            <div class="cash_content_amount">￥'+data.earninglist[i].tradingMoney+'</div>\n' +
                        '            <div>'+nn+'</div>\n'+
                        '        </div>')
                }
            }
        },
        error:function () {
            alert('请勿频繁操作');
        }
    })
}


//动画延时函数
function cartoon() {
    $('.index_anmat').animate({
        opacity:'0'
    },function () {
        $('.index_anmat').hide().css('opacity','1');
    })
}


