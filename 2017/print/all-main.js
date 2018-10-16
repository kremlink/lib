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
   .printer-iframe{
    @include abs($t:0,$l:0);
    width:0;
    height:0;
   }
    
   print:{
    callers:'.content-header .print',
    css:''
   }
   //-----
   
   //------------------------------------------------------
   //------------------------------------------------------
   $(function(){
    var print=mgr.set({data:'head.print',object:'Print',{extra:what}});
    
    print.setObject(obj);//replaces 'what' function, which returns object to append to frame
   });
  });
 }
}));