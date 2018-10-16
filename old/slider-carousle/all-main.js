/*
slider:{
 container:'.the-slider',
 elements:'.item',
 circular:true,
 prev:'.the-slider .prev',
 next:'.the-slider .next',
 extra_:{
  cls:'loaded'
 }
}
*/

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
 mgr.setBlock(function(){
  var shared={
   
  };

  //------------------------------------------------------
  //------------------------------------------------------
  var slider=function(opts){
   var cont=$(opts.data.container);

   cont.find('img').imagesLoaded(function(){
    var obj=mgr.set({data:'all.slider',object:'Slider'});

    cont.addClass(obj.getInner('extra').cls).height(obj.method('getData').elements.eq(0).height());
   });
  };
  //------------------------------------------------------
  //------------------------------------------------------
  $(function(){
   mgr.set({data:'all.slider',object:slider,call:true});
  });
 });
}));