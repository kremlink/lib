/*
 scrollTo:{
 callers:['#main .nav a'],
 items:'#main .item',
 shift:-190,//[]
 immediate:false
 }

 mgr.set({data:'inj-proj.scrollTo',object:'ScrollTo'});
 */
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
   SiteManager.set({data:'lib.ScrollTo',object:factory(jQuery,SiteManager),lib:false});
  }
 }
}(function($,mgr){
 mgr.extend(ScrollTo);

 function ScrollTo(){
  "use strict";
  
  this.options={
   shift:[],
   //set first shift value to -1 for the first block if it has zero offset from the top;
   //in this case when the first block is active only firefox will scroll from random position of the page to the top,
   //but it won't block scrolling in all browsers if page was at the top before refreshing;
   //if scrolling from random position is needed in this case - don't use -1, use -10 or whatever,
   //but this'll block scrolling for a delay=speed if page was at the top before refreshing
   speed:500,
   easing:'swing',
   immediate:false,
   activeClass:'active',
   time:200,
   namespace:'.scrollTo',
   nowClass:'now',//add it to the nav item which is supposed to be active
   helpers:{
    debounce:null
   }
  };

  this.props={
   callers:[],
   items:null,//init
   scroll:$('body,html'),
   active:-1,
   len:null,
   moving:false,
   iniActive:false,
   helpers:{
    win:$(window),
    doc:$(document)
   }
  };
 }
 //-----------------
 $.extend(ScrollTo.prototype,{
  init:function(opts){
   var self=this;

   self.options=$.extend(true,self.options,opts);

   self.props=$.extend(true,self.props,{
    items:$(opts.items)
   });

   self.setProps();
   self.trigger('init',[{
    callers:self.props.callers,
    now:self.options.nowClass
   }]);
   self.setControls();
   self.getActive();
   self.prepare();
  },
  setProps:function(){
   var self=this,
    clrs=self.options.callers;

   self.props.len=self.props.items.length;

   if(!clrs.length)
   {
    for(var i=0;i<self.props.len;i++)
     clrs[i]=$('<a style="position: absolute;left: -100px;" />').appendTo('body');
   }

   if(!self.props.len)
    return;

   self.props.callers=(function(){
    var ar=[],
     shift=[];

    for(var i=0;i<self.props.len;i++)
    {
     ar[i]=clrs.length==1?$(clrs[0]).eq(i):$(clrs[i]);
     if($.type(self.options.shift)!='array')
      shift[i]=self.options.shift;
    }

    if(shift.length)
     self.options.shift=shift.slice();

    return ar;
   }());
  },
  setControls:function(){
   var self=this;

   for(var i=0;i<self.props.len;i++)
   {
    (function(i){
     self.props.callers[i].on('click',function(e){
      self.scroll(i);

      self.trigger('click',[{
       active:i,
       callers:self.props.callers
      }]);

      e.preventDefault();
     });
    }(i));
   }
  },
  getActive:function(){
   var self=this;

   self.props.active=$.inArray($.grep(self.props.callers,function(obj){
    return obj.hasClass(self.options.nowClass);
   })[0],self.props.callers);

   if(~self.props.active)
    self.props.iniActive=true;
  },
  prepare:function(){
   var self=this,
    db=$.type(self.options.helpers.debounce)=='function'?self.options.helpers.debounce(function(){
     self.setActiveOnResizeAndScroll();
    },self.options.time):(function(){
     throw new Error('No debounce function set! ['+self.getInner('PATH')+']')
    })();
   
   self.trigger('active',[{
    active:self.props.active,
    callers:self.props.callers,
    by:'init'
   }]);

   self.props.callers[~self.props.active?self.props.active:0].addClass(self.options.activeClass);

   db();

   self.props.helpers.win.on('scroll'+self.options.namespace+' resize'+self.options.namespace,function(){
    db();
   });

   if(~self.props.active)
    self.props.callers[self.props.active][0].click();else
    self.props.active=0;
  },
  removeActive:function(){
   var self=this;

   for(var i=0;i<self.props.len;i++)
    self.props.callers[i].removeClass(self.options.activeClass);
  },
  setActiveOnResizeAndScroll:function(){
   var self=this,
       index=self.findIndex();

   if(self.options.immediate&&self.props.iniActive)
    return;

   self.props.iniActive=true;

   self.removeActive();
   if(~index)
   {
    self.props.active=index;
    self.props.callers[self.props.active].addClass(self.options.activeClass);
    self.trigger('active',[{
     active:self.props.active,
     callers:self.props.callers,
     by:'scroll'
    }]);
   }
  },
  findIndex:function(){
   var self=this,
       j=0,
       top=self.props.helpers.win.scrollTop(),
       last=self.props.items.eq(self.props.len-1).offset().top+self.options.shift[self.props.len-1],
       wh=self.props.helpers.win.height(),
       dh=self.props.helpers.doc.height();

   if(top<last&&(top+wh==dh||top+wh==dh-1)||top>=last)
   {
    return self.props.len-1;
   }else
   {
    self.props.items.each(function(i){
     if(top<self.props.items.eq(i).offset().top+self.options.shift[i])
     {
      j=i-1;
      return false;
     }
    });
   }
   
   return j;
  },
  scroll:function(i){
   var self=this;

   if(i>self.props.items.length-1||
    i<0||
    self.props.moving||
    self.props.items.eq(i).offset().top+self.options.shift[i]+1==self.props.helpers.win.scrollTop())
    return;

   self.props.moving=true;
   if(self.options.speed)
   {
    self.props.scroll.stop().animate({scrollTop:self.props.items.eq(i).offset().top+self.options.shift[i]+1},
     self.options.speed,
     self.options.easing,
     function(){
      self.props.moving=false;
     });
   }else
   {
    self.props.scroll.scrollTop(self.props.items.eq(i).offset().top+self.options.shift[i]+1);
    self.props.moving=false;
   }
   
   if(self.options.immediate)
   {
    self.removeActive();
    self.props.callers[i].addClass(self.options.activeClass);
    self.props.active=i;
    self.trigger('active',[{
     active:i,
     callers:self.props.callers,
     by:'expl'
    }]);
   }
  },
  getData:function(){
   return {index:this.props.active};
  }
 });
  
 return ScrollTo;
}));