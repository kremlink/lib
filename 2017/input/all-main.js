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
   <input data-filter='{"charFilter":"[0-9-()]","valueFilter":"^[0-9-()]+$"}' data-valid="\S+" type="text" />
   
   masked:{
    inputs:'input.masked'
   }
   
   var inputs={
    empty:function(e,opts){
     opts.input.val(1);
    },
    change:function(e,opts){
     var u=this.getInner('extra'),
         v=parseInt(opts.input.val());

     if(v!=0)
      shared.cart.method('changeAmount',{id:opts.input.data(u.data),amount:v});

     if(v==0)
      opts.input.val(1);
    }
   };
   //------------------------------------------------------
   //------------------------------------------------------
   $(function(){
    mgr.set({data:'all.masked',object:'Input'});
   });
  });
 }
}));