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
   <a data-zoom='{"src":"images/cat1.png","view":"images/cat1-big.png"}'
   
   zoom:{
    block:'.objects-block .img-zoom',
    drag:'.zoom',
    view:'.view',
    data:'zoom'
   }
   
   var zoom=function(opts){
    var data=opts.data,
     blocks=$(data.block);

    blocks.each(function(){
     var obj=$(this);

     mgr.set({
      data:opts.name,
      object:'Zoom',
      collection:true,
      extra:{
       block:obj,
       drag:obj.find(data.drag),
       view:obj.find(data.view),
       helpers:{imgsReady:mgr.get('lib.utils.imgsReady')}
      }
     });
    });
   };
   //------------------------------------------------------
   //------------------------------------------------------
   $(function(){
    mgr.set({data:'catalog.zoom',object:zoom,call:true});
    
    //zoom.method('change')//no data to pass means get it from element
   });
  });
 }
}));