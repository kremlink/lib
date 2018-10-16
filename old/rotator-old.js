(function (factory) {
 'use strict';
 
 if(typeof define==='function'&&define.amd){
  define(['jquery','base'],factory);
 }else
 {
  if('SiteManager' in window)
  {
   if(!SiteManager.lib)
    throw 'SiteManager.lib doesn\'t exist!';
   SiteManager.lib['Rotator']=factory(jQuery,SiteManager);
  }
 }
}(function($,mgr){
 function Rotator(opts,func){
  "use strict";
  
  var self=this;
  
  mgr.Base.apply(this,arguments);
  
  self.options=$.extend(true,{
   data:null
  },opts);
  
  self.props={
   prev:$(opts.prev),
   next:$(opts.next),
   blocks:$(opts.blocks),
   index:0,
   length:null,
   changeable:null,
   direction:'forward'
  };
  
  if(mgr.utils.isS(self.options.data))
   self.options.data=$(self.options.data);
  
  if(!self.options.data||!self.options.data.length)
   return;
  
  self.props.length=self.props.blocks.length;
  self.props.changeable=self.options.data.length>self.props.length;
  
  init();
  
  function init(){
   self.trigger('init',[{blocks:self.props.blocks}]);
   self.show('forward');
   
   self.props.prev.on('click',function(e){
    self.prevClick();
    
    e.preventDefault();
   });
   
   self.props.next.on('click',function(e){
    self.nextClick();
    
    e.preventDefault();
   });
  }
 };
 //-----------------
 mgr.extend(Rotator);
 //-----------------
 $.extend(Rotator.prototype,{
  prevClick:function(){
   var self=this;

   if(self.props.direction=='forward')
   {
    self.props.index=self.props.index-(2*self.props.length)%self.options.data.length;
    if(self.props.index<0)
     self.props.index=self.options.data.length+self.props.index;
   }

   self.props.direction='back';
   self.change('back');
  },
  nextClick:function(){
   var self=this;

   if(self.props.direction=='back')
    self.props.index=(self.props.index+2*self.props.length)%self.options.data.length;
   self.props.direction='forward';
   self.change('forward');
  },
  change:function(dir){
   var self=this;
   
   if(self.props.changeable)
    self.show(dir);
  },
  show:function(dir){
   var self=this;

   self.trigger('before',{changeable:self.props.changeable,blocks:self.props.blocks,index:self.props.index});
   self.props.blocks.each(function(i){
    var ind;
    
    ind=(self.props.index+i>=self.options.data.length)?self.props.index-self.options.data.length+i:self.props.index+i;
    
    if(!self.props.changeable&&i>=self.options.data.length)
     return false;
    self.trigger('each',[{block:$(this),data:self.options.data,index:ind}]);
   });
   
   if(dir=='forward')
   {
    self.props.index=(self.props.index+self.props.length)%self.options.data.length;
   }else
   {
    self.props.index=(self.props.index-self.props.length)%self.options.data.length;
    if(self.props.index<0)
     self.props.index=self.options.data.length+self.props.index;
   }

   self.trigger('after',{blocks:self.props.blocks,index:self.props.index});
  }
 });
  
 return Rotator;
}));