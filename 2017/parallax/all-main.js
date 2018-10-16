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
   bg:{
    mouse:true,
    k:-0.04,
    what:'#header .bg'
   }
   //------------------------------------------------------
   //------------------------------------------------------
   $(function(){
    var thr=mgr.get('data.all.thr'),
        bg={
         th:mgr.get('lib.utils.throttle')(function(opts){
          bg.p.method('move',opts);//or {bg:true} for background position
         },thr),
         p:mgr.set({data:'all.bg',object:'Parallax'})
        },
        ini={};
    
    $(mgr.get('data.all.topPlxCont')).one('mousemove',function(e){
     ini.x=e.pageX;
     ini.y=e.pageY;
    }).on('mousemove',function(e){
     bg.th({x:e.pageX-ini.x,y:e.pageY-ini.y});
    });
    
    /*mgr.helpers.win.on('resize scroll',function(){
     bg.th();
    });*/
   });
  });
 }
}));