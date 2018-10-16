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
   datepick:{//container:'.classes-dp .dp',//popup
    input:'.classes-dp .dp',//inline
    alt:'.classes-dp input',
    extra_:{
     inactive:'inactive'
    }
   }
   //-----
   var dp={
    activeDates:[],
    onDate:function(opts){
     var u=this.getInner('extra');

     return (!~$.inArray(opts.date.getTime(),this.prepareDates(dp.activeDates).map(function(v){
      return v.getTime();
     })))?{dateClass:u.inactive,selectable:false}:{};
    }
   };
   //------------------------------------------------------
   //------------------------------------------------------
   $(function(){
    mgr.set({data:'classes.datepick',object:'Datepick',extra:{onDate:dp.onDate}})
   });
  });
 }
}));