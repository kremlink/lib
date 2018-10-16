<head>
<meta property="og:image" content="http://xn----7sbbsaogpfm9br6k.xn--p1ai/images/300x300.jpg" />
<meta property="og:title" content="Your page title goes here" />
<meta property="og:description" content="Your page description" />

<div id="vk_share"></div>
<div class="fb-share-button" data-href="http://www.joint-group.ru/i/new/marquis/www/19.03.2014" data-type="button_count"></div>
<a href="https://twitter.com/share" data-text="Text text" data-url="http://www.joint-group.ru/i/new/marquis/www/19.03.2014" class="twitter-share-button" data-lang="ru">Твитнуть</a>
  
   vk:{
    id:'#vk_share',
    data:{
     type:'round',
     text:'Поделиться',
     url:'http://www.joint-group.ru/i/new/marquis/www/19.03.2014',
     title:'Title',
     description:'Description'
    }
   }
 
 var vk=mgr.get('data.contacts.vk');
 //---------
 $.getScript('http://vk.com/js/api/share.js?90',function(){
  $(vk.id).html(VK.Share.button(vk.data));
 });
 $('body').prepend($('<div id="fb-root" />')).prepend('<script src="//connect.facebook.net/ru_RU/sdk.js#xfbml=1&version=v2.3" />');
 $.getScript('//platform.twitter.com/widgets.js');
 //----------------------------
 //----------------------------appId for fb?
 //----------------------------
 <div class="fb-like" data-href="http://www.joint-group.ru" data-layout="button_count" data-action="like" data-show-faces="true" data-share="false"></div>
 <a href="https://twitter.com/share" class="twitter-share-button" data-via="trailerss" data-lang="en">Твитнуть</a>
 <div id="vk_like"></div>
 
 $.getScript('http://userapi.com/js/api/openapi.js?49',function(){
  VK.init({apiId:4411852,onlyWidgets:true});//appId form data
  VK.Widgets.Like("vk_like",{type:"mini",height:18});//id and params from data
 });
 $.getScript('//platform.twitter.com/widgets.js');
 $('body').prepend($('<div id="fb-root" />')).prepend('<script src="//connect.facebook.net/ru_RU/sdk.js#xfbml=1&version=v2.3" />');