/*!by Alexander Kremlev*/
(function (factory){
 'use strict';
 
 if(typeof define==='function'&&define.amd)
 {
  define(['jquery','base'],factory);
 }else
 {
  if('theApp' in window)
  {
   if(!theApp.lib)
    throw 'theApp.lib doesn\'t exist!';
   theApp.set({data:'lib.Slider',object:factory(jQuery,theApp),lib:false});
  }
 }
}(function($,mgr){
 mgr.extend(Slider);

 function Slider(){
  "use strict";

  this.options={
   mousewheel:false,
   vertical:false,
   circular:false,
   pagination:'<a href=""></a>',//[num]
   sync:true,
   auto:-1,
   speed:500,
   start:0,
   easing:null,
   elements:null,
   dragDistance:10,
   transition:null,
   firstTransition:false,
   transitionProp:null,//is checked in transitionend callback
   noOldSliderTransition:true,//show()
   hiddenClass:'hidden',
   disabledClass:'disabled',
   activeClass:'active',
   initEvent:'init',
   beforeEvent:'before',
   afterEvent:'after',
   pagEvent:'pagination',
   namespace:'.slider',//for events namespace
   touch:{
    speed:0.5,
    mult:4,
    enabled:true
   },
   animData:{
    initialCss:{},
    newCssBefore:{
     back:{},
     forward:{}
    },
    newCssAfter:{
     back:{},
     forward:{}
    },
    oldCssBefore:{
     back:{},
     forward:{}
    },
    oldCssAfter:{
     back:{},
     forward:{}
    },
    newAnim:{
     back:{},
     forward:{}
    },
    oldAnim:{
     back:{},
     forward:{}
    }
   },
   helpers:{
    swipe:null//swipe detection function
   }
  };

  this.props={
   container:null,//init
   pauser:null,//init
   next:null,//init
   prev:null,//init
   pagContainer:null,//init
   pagElements:null,
   running:false,
   current:0,
   old:-1,
   t:null,
   hover:false,
   length:0,
   paused:false,
   swipe:null
  };
 }
 //-----------------
 $.extend(Slider.prototype,{
  init:function(opts){
   var self=this;

   self.options=$.extend(true,self.options,opts);

   self.props=$.extend(true,self.props,{
    container:$(opts.container),
    pauser:$(opts.pauser),
    next:$(opts.next),
    prev:$(opts.prev),
    pagContainer:$(opts.pagContainer)
   });

   self.preparing();
   if(self.props.length<=1)
    return;
   self.setControls();
  },
  destroy:function(){
   var self=this,
       n=self.options.namespace;

   clearTimeout(self.props.t);
   self.props.elements.off('webkitTransitionEnd'+n+' transitionend'+n);
   self.props.container.off('mouseenter'+n+' mouseleave'+n+' mousewheel'+n);
   if(self.options.touch.enabled&&self.props.swipe)
    self.props.swipe.disable();
   self.props.prev.off('click');
   self.props.next.off('click');
   self.off('*');
   self.props.elements.removeClass(self.options.activeClass);
  },
  setStart:function(i){//external
   var self=this;

   self.options.start=i;
  },
  firstSlide:function(){
   var self=this;
   
   self.props.elements.eq(self.props.current)
    .css(self.options.animData.initialCss)
    .addClass(self.options.activeClass);
   if(!self.options.firstTransition)
   {
    self.props.elements.each(function(){
     this.offsetHeight;
    }).addClass(self.options.transition);
   }else
   {
    self.props.elements.addClass(self.options.transition);
    if(self.options.transition)
     self.props.running=true;
   }
   
   self.trigger(self.options.beforeEvent,[{
    next:self.props.current,
    current:self.props.old,
    elements:self.props.elements,
    dir:'init',
    by:'init'
   }]);
  },
  preparing:function(){
   var self=this;
   
   self.props.elements=self.options.elements?self.props.container.find(self.options.elements):self.props.container.children();
   self.props.length=self.props.elements.length;

   self.trigger(self.options.initEvent,[{
    elements:self.props.elements,
    container:self.props.container
   }]);

   self.props.current=self.options.start;

   self.props.next.removeClass(self.options.hiddenClass+' '+self.options.disabledClass);
   self.props.prev.removeClass(self.options.hiddenClass+' '+self.options.disabledClass);
   self.props.pagContainer.removeClass(self.options.hiddenClass);

   self.makePagination();
   if(self.props.length<=1)
   {
    self.props.next.addClass(self.options.hiddenClass);
    self.props.prev.addClass(self.options.hiddenClass);
    self.props.pagContainer.addClass(self.options.hiddenClass);
    if(self.props.length)
     self.firstSlide();
    
    return;
   }

   self.firstSlide();
   
   if(!self.options.circular)
   {
    if(self.props.current==0)
     self.props.prev.addClass(self.options.disabledClass);
    if(self.props.current==self.props.length-1)
     self.props.next.addClass(self.options.disabledClass);
   }
  },
  makePagination:function(){
   var self=this,
       s='';

   for(var i=0;i<self.props.length;i++)
    s+=self.options.pagination.replace('[num]',i+1);
   
   self.props.pagContainer.html(s);
   self.props.pagElements=self.props.pagContainer.children();
   
   self.props.pagElements.eq(self.props.current).addClass(self.options.activeClass);
   self.trigger(self.options.pagEvent,[{
    pagContainer:self.props.pagContainer,
    pagElements:self.props.pagElements
   }]);
  },
  end:function(){
   var self=this;
   
   if(!self.props.running)
    return;
   
   if(self.options.transition)
   {
    self.props.elements.eq(self.props.current).removeClass(self.options.transition);
    self.props.elements.eq(self.props.old).removeClass(self.options.transition);
    self.animNext(true);
   }else
   {
    self.props.elements.eq(self.props.current).stop(false,true);
    self.props.elements.eq(self.props.old).stop(false,true);
   }
  },
  setControls:function(){
   var self=this;

   if(self.options.transition)
   {
    self.props.elements.on('webkitTransitionEnd'+self.options.namespace+' transitionend'+self.options.namespace,function(e){
     if(!$(e.target).is(self.props.elements))
      return;

     if(e.originalEvent.propertyName!=self.options.transitionProp)
     {
      if(!self.options.transitionProp)
       console.log('transitionProp is not set!');

      return;
     }

     if($(e.target).is(self.props.elements.eq(self.props.current)))
     {
      self.animNext();
     }else
     {
      if(!self.options.sync)
      self.props.elements.eq(self.props.current).css(self.options.animData.newCssAfter[self.props.dir]);
     }
    });
   }
   
   self.props.pauser.on('mouseenter'+self.options.namespace,function(){
    clearTimeout(self.props.t);
    self.props.hover=true;
   }).on('mouseleave'+self.options.namespace,function(){
    self.props.hover=false;
    if(!self.props.running)
     self.auto();
   });
   
   self.props.prev.on('click',function(e){
    clearTimeout(self.props.t);
    self.go({dir:'back',by:'click'});
    
    e.preventDefault();
   });
   
   self.props.next.on('click',function(e){
    clearTimeout(self.props.t);
    self.go({dir:'forward',by:'click'});
    
    e.preventDefault();
   });
   
   self.props.pagElements.each(function(i){
    var obj=$(this);
    
    obj.on('click',function(e){
     if(!(obj.hasClass(self.options.activeClass)||self.props.running))
     {
      self.props.pagElements.removeClass(self.options.activeClass);
      obj.addClass(self.options.activeClass);
      clearTimeout(self.props.t);
      self.go({dir:(self.props.current>i?'back':'forward'),index:i,by:'pag'});
     }
     
     e.preventDefault();
    });
   });
   
   if(self.options.mousewheel)
   {
    self.props.container.on('mousewheel'+self.options.namespace,function(e,d){
     clearTimeout(self.props.t);
     self.go({dir:(d>0?'back':'forward'),by:'wheel'});
     
     e.preventDefault();
    });
   }

   if(self.options.touch.enabled)
   {
    if(self.options.helpers.swipe)
    {
     self.props.swipe=new (self.options.helpers.swipe)({
      vertical:self.options.vertical,
      mult:self.options.touch.mult,
      speed:self.options.touch.speed,
      container:self.props.container,
      callback:function(delta){
       clearTimeout(self.props.t);
       self.go({dir:(delta>0?'forward':'back'),by:'swipe'});
      }
     });
    }
   }
   
   self.auto();
  },
  forward:function(){//external
   var self=this;
   
   self.go({dir:'forward',by:'ext'});
  },
  back:function(){//external
   var self=this;
   
   self.go({dir:'back',by:'ext'});
  },
  getData:function(){
   var self=this;

   return {
    current:self.props.current,
    previous:self.props.old,
    elements:self.props.elements,
    running:self.props.running,
    pause:self.props.pause
   }
  },
  toSlide:function(i){//external
   var self=this;
   
   if(self.props.current==i||self.props.running)
    return;
   
   self.props.pagElements.removeClass(self.options.activeClass);
   self.props.pagElements.eq(i).addClass(self.options.activeClass);
   clearTimeout(self.props.t);
   self.go({dir:(self.props.current>i?'back':'forward'),index:i,by:'ext'});
  },
  pause:function(f){//external
   var self=this;
   
   if(f)
   {
    self.props.paused=true;
    clearTimeout(self.props.t);
   }else
   {
    self.props.paused=false;
    self.auto();
   }
  },
  auto:function(){
   var self=this;
   
   if(~self.options.auto&&!self.props.hover&&!self.props.paused)
    self.props.t=setTimeout(function(){
     clearTimeout(self.props.t);
     self.go({dir:'forward',by:'auto'});
    },self.options.auto);
  },
  animNext:function(stop){
   var self=this;
   
   self.props.elements.eq(self.props.current)
    .animate(self.options.animData.newAnim[self.props.dir],self.options.speed,self.options.easing,function(){
     self.trigger(self.options.afterEvent,[{
      current:self.props.current,
      previous:self.props.old,
      elements:self.props.elements,
      dir:self.props.dir
     }]);
     
     if(!self.options.transition)
      self.props.elements.eq(self.props.current).css(self.options.animData.newCssAfter[self.props.dir]);
     
     self.props.running=false;
     if(~self.options.auto&&!stop)
      self.auto();
   });
  },
  setCurr:function(i){
   var self=this;
   
   self.props.old=self.props.current;
   if(i!=undefined)
   {
    self.props.current=i;
   }else
   {
    if(self.options.circular)
    {
     self.props.current=self.props.dir=='forward'?
      (self.props.current<self.props.length-1?++self.props.current:0):
      (self.props.current>0?--self.props.current:self.props.length-1);
    }else
    {
     if(self.props.current==0&&self.props.dir=='back'||self.props.current==self.props.length-1&&self.props.dir=='forward')
      return false;
     
     self.props.current=self.props.dir=='forward'?++self.props.current:--self.props.current;
    }
   }
   
   return true;
  },
  go:function(opts){
   var self=this;
   
   if(!self.props.running)
   {
    self.props.dir=opts.dir;
    if(!self.setCurr(opts.index))
     return false;
    
    self.props.pagElements.eq(self.props.old).removeClass(self.options.activeClass);
    self.props.pagElements.eq(self.props.current).addClass(self.options.activeClass);
    self.props.running=true;
    self.trigger(self.options.beforeEvent,[{
     next:self.props.current,
     current:self.props.old,
     dir:self.props.dir,
     elements:self.props.elements,
     by:opts.by
    }]);
    
    self.props.elements.eq(self.props.current).addClass(self.options.activeClass);
    
    self.props.elements.eq(self.props.old).removeClass(self.options.activeClass);
    
    if(self.options.transition)
    {
     self.props.elements
      .eq(self.props.current)
      .removeClass(self.options.transition)
      .css(self.options.animData.newCssBefore[self.props.dir]);
     if(self.options.noOldSliderTransition)
      self.props.elements.eq(self.props.current)[0].offsetHeight;
     self.props.elements
      .eq(self.props.current)
      .css(self.options.sync?self.options.animData.newCssAfter[self.props.dir]:{})
      .addClass(self.options.transition);
     self.props.elements
      .eq(self.props.old)
      .removeClass(self.options.transition)
      .css(self.options.animData.oldCssBefore[self.props.dir]);
     if(self.options.noOldSliderTransition)
      self.props.elements.eq(self.props.old)[0].offsetHeight;
     self.props.elements
      .eq(self.props.old)
      .css(self.options.animData.oldCssAfter[self.props.dir])
      .addClass(self.options.transition);
    }else
    {
     self.props.elements
      .eq(self.props.current)
      .css(self.options.animData.newCssBefore[self.props.dir]);
     
     if(self.options.sync)
      self.animNext();
     
     self.props.elements.eq(self.props.old)
      .css(self.options.animData.oldCssBefore[self.props.dir])
      .animate(self.options.animData.oldAnim[self.props.dir],self.options.speed,self.options.easing,function(){
       self.props.elements.eq(self.props.old).css(self.options.animData.oldCssAfter[self.props.dir]);
       if(!self.options.sync&&!self.options.transition)
        self.animNext();
     });
    }
    
    if(!self.options.circular)
    {
     if(!self.props.prev)
      return false;
     
     self.props.prev.removeClass(self.options.disabledClass);
     self.props.next.removeClass(self.options.disabledClass);
     if(self.props.current==0&&self.props.dir=='back')
      self.props.prev.addClass(self.options.disabledClass);
     if(self.props.current==self.props.length-1&&self.props.dir=='forward')
      self.props.next.addClass(self.options.disabledClass);
    }
   }
   
   return false;
  }
 });
  
 return Slider;
}));