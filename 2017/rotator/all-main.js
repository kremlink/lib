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
   .item{
    opacity:0;
    display:none;
    &.active1{
      display:block;
    }
    &.shown{
      opacity:1;
      @include trs('opacity .6s ease-in-out');
      &~.shown{
        @include trs(.2s,'de');
      }
    }
  }
   
   rotator:{
    container:'.corp-clients .wrap',
    items:'.item',
    next:'.corp-clients .caller',
    amount:mgr.helpers.win.width()<1381?3:4,
    activeClass:'active1',
    extra_:{
     cls:'shown',
     data:'img',
     loaded:'loaded'
    }
   }
   //-----
   var rotator=function(opts){
    var into=$(opts.data.container),
        items=into.find(opts.data.items),
        extra=opts.data.extra_,
        t=[];

    items.each(function(){
     t.push($(this).data(extra.data));
    });

    mgr.get('lib.utils.imgsReady')({src:t,elements:items,callback:function(){
     into.addClass(extra.loaded);
     mgr.set({dest:'index.t.r',data:'index.rotator',object:'Rotator',on:{
      show:function(e,opts){
       var u=this.getInner('extra');

       opts.items.removeClass(u.cls);
       setTimeout(function(){
        opts.active.addClass(u.cls);
       },0);
      }
     }});
    }});
   };
   //------------------------------------------------------
   //------------------------------------------------------
   $(function(){
    mgr.set({data:'index.rotator',object:rotator,call:true});
   });
  });
 }
}));