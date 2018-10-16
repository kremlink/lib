(function (factory) {
 'use strict';
 
 if(typeof define==='function'&&define.amd)
 {
  define(['jquery','base'],factory);
 }else
 {
  if('SiteManager' in window)
  {
   if(!SiteManager.lib)
    throw 'SiteManager.lib doesn\'t exist!';
   SiteManager.lib['Hover']=factory(jQuery,SiteManager);
  }
 }
}(function($,mgr){
 function Hover(opts){
  "use strict";
  
  var self=this;
  
  mgr.Base.apply(this,arguments);
  
  self.options=$.extend(true,{
   animate:{
    css:[],
    opts:{}
   }
  },opts);
  
  self.props={
   hover:$(opts.hover),
   also:$(opts.also),
   show:$(opts.show)
  };
  
  init();
  
  function init(){
   self.trigger('init');
   self.setHover();
  }
 };
 //-----------------
 mgr.extend(Hover);
 //-----------------
 $.extend(Hover.prototype,{
  destroy:function(){
   var self=this;
   
   self.props.hover.off('mouseover.hover mouseout.hover');
   self.props.also.off('mouseover.hover mouseout.hover');
  },
  setHover:function(){
   var self=this;
   
   self.props.hover.each(function(i){
    $(this).on('mouseover.hover',function(){
     self.props.show.eq(i).stop().animate(self.options.animate.css[1],self.options.animate.opts);
    }).on('mouseout.hover',function(){
     self.props.show.eq(i).stop().animate(self.options.animate.css[0],self.options.animate.opts);
    });
    self.props.also.eq(i).on('mouseover.hover',function(){
     self.props.show.eq(i).stop().animate(self.options.animate.css[1],self.options.animate.opts);
    }).on('mouseout.hover',function(){
     self.props.show.eq(i).stop().animate(self.options.animate.css[0],self.options.animate.opts);
    });
   });
  }
 });
  
 return Hover;
}));