/*
 mgr.setObject('vacancies.slider','Slider',{
 on:{
 before:function(e,opts){
 var u=this.userObject;

 if(~opts.current)
 u.$text.eq(opts.current).removeClass(u.cls);
 u.$text.eq(opts.next).addClass(u.cls);
 }
 }
 });

 slider:{
 container:'.vacancies-slider',
 elements:'.item',
 circular:true,
 transition:'trs',
 transitionProp:'padding-left',
 noOldSliderTransition:false,
 firstTransition:true,
 pagContainer:'.pag div',
 pagination:'<a href=""><span class="img"><img src="images/s-icon[num].png" alt=""/></span><span class="txt"></span></a>',
 userObject:{
 $text:'.vacancies-slider article',
 cls:'active'
 }
 }
 */

/*!by Alexander Kremlev*/
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
   SiteManager.lib['Slider']=factory(jQuery,SiteManager);
  }
 }
}(function($,mgr){
 function Slider(opts){
  "use strict";
  
  var self=this;
  
  mgr.Base.apply(this,arguments);
  
  self.options=$.extend(true,{
   mousewheel:false,
   vertical:false,
   circular:false,
   pagination:'<a href="">[num]</a>',
   sync:true,
   auto:null,
   hover:true,
   speed:500,
   start:0,
   easing:null,
   load:null,
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
   touchThreshold:10,
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
   }
  },opts);
  
  self.props={
   container:$(opts.container),
   next:$(opts.next),
   prev:$(opts.prev),
   pagContainer:$(opts.pagContainer),
   pagElements:null,
   running:false,
   current:null,
   old:-1,
   t:null,
   hover:false,
   length:null,
   pause:false,
   coords:{pageX:0,pageY:0},
   touch:false
  };
  
  init();
  
  function init(){
   self.preparing();
   if(self.props.length<=1)
    return;
   self.makePagination();
   self.setControls();
  }
 }
 //-----------------
 mgr.extend(Slider);
 //-----------------
 $.extend(Slider.prototype,{
  destroy:function(){
   var self=this,
       n=self.options.namespace;

   clearTimeout(self.props.t);
   self.props.elements.off('webkitTransitionEnd'+n+' transitionend'+n);
   self.props.container.off('mouseenter'+n+' mouseleave'+n+' mousewheel'+n+' swipe'+n+' touchstart'+n);
   self.props.prev.off('click');
   self.props.next.off('click');
   self.off('*');
   self.props.elements.removeClass(self.options.activeClass);
  },
  setStart:function(i){//external
   var self=this;

   self.options.start=i;
  },
  getData:function(){
   var self=this;
   
   return {
    current:self.props.current,
    old:self.props.old,
    elements:self.props.elements
   };
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
    container:self.props.container,
    controls:{
     pagElements:self.props.pagElements,
     next:self.props.next,
     prev:self.props.prev
    }
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
    elements:self.props.elements,
    container:self.props.container,
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
   
   self.props.container.on('mouseenter'+self.options.namespace,function(){
    if(self.options.hover)
    {
     clearTimeout(self.props.t);
     self.props.hover=true;
    }
   }).on('mouseleave'+self.options.namespace,function(){
    if(self.options.hover)
    {
     self.props.hover=false;
     if(!self.props.running)
      self.auto();
    }
   });
   
   self.props.prev.on('click',function(e){
    clearTimeout(self.props.t);
    self.go('back');
    
    e.preventDefault();
   });
   
   self.props.next.on('click',function(e){
    clearTimeout(self.props.t);
    self.go('forward');
    
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
      self.go((self.props.current>i?'back':'forward'),i);
     }
     
     e.preventDefault();
    });
   });
   
   if(self.options.mousewheel)
   {
    self.props.container.on('mousewheel'+self.options.namespace,function(e,d){
     clearTimeout(self.props.t);
     if(d>0)
      self.go('back');else
      self.go('forward');
     
     e.preventDefault();
    });
   }

   self.props.container.on('touchstart'+self.options.namespace,function(e){
    self.containerTouchStart(e);

    e.stopPropagation();
   });
   
   self.auto();
  },
  containerTouchStart:function(e){
   var self=this;

   self.props.touch=true;
   self.props.coords['pageX']=e.originalEvent.touches[0]['pageX'];
   self.props.coords['pageY']=e.originalEvent.touches[0]['pageY'];

   mgr.helpers.doc.on('touchmove'+self.options.namespace,function(e){
    var v=self.options.vertical,
        t1=v?'pageY':'pageX',
        t2=v?'pageX':'pageY',
        delta=self.props.coords[t1]-e.originalEvent.touches[0][t1];

    if(self.props.touch&&Math.abs(delta)>self.options.touchThreshold&&Math.abs(delta)>2*Math.abs(self.props.coords[t2]-e.originalEvent.touches[0][t2]))
    {
     self.props.coords[t1]=e.originalEvent.touches[0][t1];
     self.props.coords[t2]=e.originalEvent.touches[0][t2];
     self.props.touch=false;
     if(delta>0)
      self.go('forward');else
      self.go('back');
     e.preventDefault();
     e.stopPropagation();
    }
   }).on('touchend'+self.options.namespace,function(){
     mgr.helpers.doc
      .off('touchend'+self.options.namespace)
      .off('touchmove'+self.options.namespace);
    });
  },
  forward:function(){
   var self=this;
   
   self.go('forward');
  },
  back:function(){
   var self=this;
   
   self.go('back');
  },
  toSlide:function(i){//external
   var self=this;
   
   if(self.props.current==i||self.props.running)
    return false;
   self.props.pagElements.removeClass(self.options.activeClass);
   self.props.pagElements.eq(i).addClass(self.options.activeClass);
   clearTimeout(self.props.t);
   self.go((self.props.current>i?'back':'forward'),i);
  },
  pause:function(f){//external
   var self=this;
   
   if(f)
   {
    self.props.pause=true;
    clearTimeout(self.props.t);
   }else
   {
    self.props.pause=false;
    self.auto();
   }
  },
  auto:function(){
   var self=this;
   
   if(self.options.auto&&!self.props.hover&&!self.props.pause)
    self.props.t=setTimeout(function(){
     clearTimeout(self.props.t);
     self.go('forward');
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
      container:self.props.container,
      dir:self.props.dir,
      controls:{
       pagElements:self.props.pagElements,
       next:self.props.next,
       prev:self.props.prev
      }
     }]);
     
     if(!self.options.transition)
      self.props.elements.eq(self.props.current).css(self.options.animData.newCssAfter[self.props.dir]);
     
     self.props.running=false;
     if(self.options.auto&&!stop)
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
  go:function(dir,i){
   var self=this;
   
   if(!self.props.running)
   {
    self.props.dir=dir;
    if(!self.setCurr(i))
     return false;
    
    self.props.pagElements.eq(self.props.old).removeClass(self.options.activeClass);
    self.props.pagElements.eq(self.props.current).addClass(self.options.activeClass);
    self.props.running=true;
    self.trigger(self.options.beforeEvent,[{
     next:self.props.current,
     current:self.props.old,
     dir:self.props.dir,
     elements:self.props.elements,
     container:self.props.container,
     controls:{
      pagElements:self.props.pagElements,
      next:self.props.next,
      prev:self.props.prev
     }
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