(function (factory) {
 'use strict';
 
  if(typeof define==='function'&&define.amd){
   define(['jquery','base'],factory);
  }else
  {
   factory(jQuery,SiteManager);
  }
}(function($,mgr){
 mgr.lib['ScrollTo']=function(opts,func){
  "use strict";
  
  var self=this;
  
  mgr.Base.apply(this,arguments);
  
  self.options=$.extend(true,{
   shift:-30,
   speed:500,
   scroll:false,
   activeClass:'active'
  },opts);
  
  self.props={
   callers:$(opts.callers),
   items:$(opts.items),
   scroll:$('body,html'),
   active:0,
   len:null,
   initialActive:null,
   t:null,
   iniFlag:true
  };
  
  self.props.len=self.props.items.length;
  
  init();
  
  function init(){
   self.trigger('init',[{callers:self.props.callers}]);
   self.props.active=self.props.callers.index(self.props.callers.filter(function(){
    return $(this).hasClass(self.options.activeClass);
   }));
   self.setCallers();
   
   if(self.options.scroll)
   {
    mgr.win.on('scroll resize',function(){
     self.props.iniFlag=false;
     self.setActiveOnResizeAndScroll();
    });
   }
   
   if(~self.props.active)
   {
    mgr.win.on('load',function(){
     if(self.props.iniFlag)
     {
      setTimeout(function(){
       self.scroll(self.props.active);
      },0);
     }
    });
   }
  }
 };
 //-----------------
 mgr.extend(mgr.lib['ScrollTo']);
 //-----------------
 $.extend(mgr.lib['ScrollTo'].prototype,{
  setActiveOnResizeAndScroll:function(){
   var self=this,
       index=self.findIndex();
   
   if(~index)
   {
    self.props.callers.removeClass('active');
    self.props.active=index;
    self.props.callers.eq(self.props.active).addClass('active');
   }else
    self.props.callers.removeClass('active');
  },
  findIndex:function(){
   var self=this,
       j=0,
       top=mgr.win.scrollTop(),
       last=self.props.items.eq(self.props.len-1).offset().top+self.options.shift;
   
   if(top<last&&top+mgr.win.height()==mgr.doc.height()||top>=last)
    return self.props.len-1;else
    self.props.items.each(function(i){
     if(top<self.props.items.eq(i).offset().top+self.options.shift)
     {
      j=i-1;
      return false;
     }
    });
   
   return j;
  },
  scroll:function(i){
   var self=this;
   
   if(self.options.speed)
    self.props.scroll.animate({scrollTop:self.props.items.eq(i).offset().top+self.options.shift+1},self.options.speed);else
    self.props.scroll.scrollTop(self.props.items.eq(i).offset().top+self.options.shift+1);
   
   if(!self.options.scroll||!self.options.speed)
   {
    self.props.callers.removeClass('active');
    self.props.callers.eq(i).addClass('active');
   }
   
   self.props.active=i;
  },
  setCallers:function(){
   var self=this;
   
   self.props.callers.each(function(i){
    var obj=$(this);
    
    obj.on('click',function(e){
     if(!(self.props.scroll.is(':animated')||self.props.items.eq(i).offset().top+self.options.shift+1==mgr.win.scrollTop()))
      self.scroll(i,false);
     
     e.preventDefault();
    });
   });
  }
 });
  
 return mgr.lib['ScrollTo'];
}));