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
   var scroll={
    init:function(e,opts){
     var u=this.getInner('extra'),
         i=u.names.indexOf(mgr.get('lib.utils.getParam')({name:u.hash}));

     if(~i)
      opts.callers[i].addClass(opts.now);
    },
    active:function(e,opts){
     var u=this.getInner('extra'),
         ac=u.$items.eq(opts.active);

     if(~opts.active)
      mgr.get('lib.utils.setParam')({name:u.hash,value:u.names[opts.active]});
     if(~opts.active)
      u.$ac.css('margin-left',ac.position().left+parseInt(ac.css('margin-left')));
    },
    click:function(e,opts){
     var u=this.getInner('extra'),
         ac=u.$items.eq(opts.active);

     if(~opts.active)
      u.$ac.css('margin-left',ac.position().left+parseInt(ac.css('margin-left')));
    }
   };
   //------------------------------------------------------
   //------------------------------------------------------
   $(function(){
    mgr.set({data:'scrollTo',object:'ScrollTo',on:scroll,extra:{helpers:{debounce:mgr.get('lib.utils.debounce')}}});
   });
  });
 }
}));