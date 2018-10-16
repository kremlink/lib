(function (factory) {
 'use strict';
 
  if(typeof define==='function'&&define.amd)
  {
   define(['jquery','base','data/index-data','lib/utils','lib/save'],factory);
  }else
  {
   factory(jQuery,SiteManager);
  }
}(function($,mgr){
 if(mgr.shared.page_=='forms')
 {
  mgr.setBlock(function(){
   var shared={

   };
   //------------------------------------------------------
   //------------------------------------------------------
   scroll:{
    block:'#header',
    cls:'scroll',
    time:50,
    shift:128
   }
   
   var scroll=function(opts){
    var d=opts.data,
     block=$(d.block),
     db=mgr.get('lib.utils.debounce')(function(){
      if(mgr.helpers.win.scrollTop()>d.shift)
       block.addClass(d.cls);else
       block.removeClass(d.cls);
     },d.time);

    db();
    mgr.helpers.win.on('resize scroll',function(){
     db();
    });
   };
   //------------------------------------------------------
   //------------------------------------------------------
   $(function(){
    mgr.set({data:'all.scroll',object:scroll,call:true});
   });
  });
 }
}));