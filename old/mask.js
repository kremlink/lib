(function (factory) {
 'use strict';
 
  if(typeof define==='function'&&define.amd){
   define(['jquery','base'],factory);
  }else
  {
   factory(jQuery,SiteManager);
  }
}(function($,mgr){
 mgr.lib['Mask']=function(opts){
  "use strict";
  
  var container=$(opts.container),
      chrome=navigator.userAgent.toLowerCase().indexOf('chrome')>-1;
  
  init();
  
  function init(){
   container.addClass(opts.cls);
   
   if(chrome)
    $(window).on('resize scroll',function(){
     container.removeClass(opts.cls).show().addClass(opts.cls);
    });
  }
 };
 //-----------------
  
 return mgr.lib['Mask'];
}));