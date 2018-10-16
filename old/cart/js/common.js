requirejs.config({
 baseUrl:'js/app',
 urlArgs:'bust='+(new Date()).getTime(),
 paths:{
  //'jquery':['http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min','../lib/jquery'],
  'almond':'../lib/almond',
  'common':'../common',
  'base':'base/base'/*,
  'jquery.imagesloaded':'../lib/imagesloaded',
  'mustache':'../lib/mustache'*/
 }/*,
 shim:{
  'jquery.imagesloaded':{
   deps:['jquery'],
   exports:'jQuery.fn.imagesLoaded'
  }
 }*/
});

define('jquery', [], function() {
 return jQuery;
});