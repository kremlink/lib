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
   SiteManager.set({data:'lib.Top',object:factory(jQuery,SiteManager),lib:false});
  }
 }
}(function($,mgr){
 mgr.extend(Top);

 function Top(){
  "use strict";

  this.options={
   text:null,
   shownClass:'shown',
   backClass:'back',
   speed:500,
   both:false,
   time:200,
   namespace:'.scrollTop',
   shift:100,
   helpers:{
    debounce:null
   }
  };

  this.props={
   caller:null,//init
   callerText:null,//init
   once:false,
   clicked:false,
   shown:false,
   scrollTop:0,
   t:null,
   scroll:$('html,body'),
   helpers:{
    win:$(window)
   }
  };
 }
 //-----------------
 $.extend(Top.prototype,{
  init:function(opts){
   var self=this;

   self.options=$.extend(true,self.options,opts);

   self.props=$.extend(true,self.props,{
    caller:$(opts.caller)
   });

   self.props.callerText=opts.callerText?$(opts.callerText):self.props.caller;

   self.prepare();
  },
  prepare:function(){
   var self=this,
       db=$.type(self.options.helpers.debounce)=='function'?self.options.helpers.debounce(function(){
        self.onResizeAndScroll();
       },self.options.time):(function(){
        throw new Error('No debounce function set! ['+self.getInner('PATH')+']')
       })();

   self.props.helpers.win.on('scroll'+self.options.namespace+' resize'+self.options.namespace,function(){
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
    self.toggle(self.props.helpers.win.scrollTop()>self.options.shift?'add':'remove');
   }else
   {
    if(self.props.helpers.win.scrollTop()>self.options.shift)
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
     if(self.props.helpers.win.scrollTop())
     {
      self.props.scrollTop=self.props.helpers.win.scrollTop();
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
     self.props.scroll.stop().animate({
      scrollTop:(self.props.helpers.win.scrollTop()?0:self.props.scrollTop)
     },self.options.speed);
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