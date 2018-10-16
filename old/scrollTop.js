(function (factory) {
 'use strict';
 
 if(typeof define==='function'&&define.amd)
 {
  define(['jquery','base','lib/utils'],factory);
 }else
 {
  if('SiteManager' in window)
  {
   if(!SiteManager.lib)
    throw 'SiteManager.lib doesn\'t exist!';
   SiteManager.lib['Top']=factory(jQuery,SiteManager);
  }
 }
}(function($,mgr){
 function Top(opts){
  "use strict";
  
  var self=this;

  mgr.Base.apply(this,arguments);
  
  self.options=$.extend(true,{
   text:null,
   shownClass:'shown',
   backClass:'back',
   speed:500,
   both:false,
   time:200,
   namespace:'.scrollTop',
   shift:100
  },opts);
  
  self.props={
   caller:$(opts.caller),
   callerText:null,
   once:false,
   clicked:false,
   shown:false,
   scrollTop:0,
   t:null,
   scroll:$('html,body')
  };
  
  self.props.callerText=self.options.callerText?$(self.options.callerText):self.props.caller;
  
  init();
  
  function init(){
   self.prepare();
  }
 }
 //-----------------
 mgr.extend(Top);
 //-----------------
 $.extend(Top.prototype,{
  prepare:function(){
   var self=this,
       db=mgr.get('lib.utils.debounce')(function(){
        self.onResizeAndScroll();
       },self.options.time);

   mgr.helpers.win.on('scroll'+self.options.namespace+' resize'+self.options.namespace,function(){
    db();
   });

   self.setControls();
  },
  toggle:function(s){
   var self=this;

   self.props.caller[s+'Class'](self.options.shownClass);
   self.props.shown=s=='add';
   self.trigger('toggle',[{type:s}]);
  },
  onResizeAndScroll:function(){
   var self=this;
   
   if(!self.options.both)
   {
    self.toggle(mgr.helpers.win.scrollTop()>self.options.shift?'add':'remove');
   }else
   {
    if(mgr.helpers.win.scrollTop()>self.options.shift)
    {
     if(self.options.text)
      self.props.callerText.html(self.options.text[0]);
     self.props.caller.removeClass(self.options.backClass);
     if(!self.props.once)
     {
      self.toggle('add');
      self.props.once=true;
     }
    }else
    {
     if(!self.props.clicked)
     {
      self.toggle('remove');
      self.props.once=false;
     }
    }
    
    self.props.clicked=false;
   }
  },
  click:function(){
   var self=this;

   if(self.props.shown)
   {
    if(!self.options.both)
    {
     self.toggle('remove');
     self.props.scroll.stop().animate({scrollTop:0},self.options.speed);
    }else
    {
     if(mgr.helpers.win.scrollTop())
     {
      self.props.scrollTop=mgr.helpers.win.scrollTop();
      if(self.options.text)
       self.props.callerText.html(self.options.text[1]);
      self.props.caller.addClass(self.options.backClass);
     }else
     {
      if(self.options.text)
       self.props.callerText.html(self.options.text[0]);
      self.props.caller.removeClass(self.options.backClass);
     }

     self.props.clicked=true;
     self.props.scroll.stop().animate({scrollTop:(mgr.helpers.win.scrollTop()?0:self.props.scrollTop)},self.options.speed);
    }
   }
  },
  setControls:function(){
   var self=this;
   
   self.props.caller.on('click',function(e){
    self.click();
    
    e.preventDefault();
   });
  }
 });
  
 return Top;
}));