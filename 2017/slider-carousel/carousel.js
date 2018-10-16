/*!by Alexander Kremlev*/
(function (factory) {
 'use strict';
 
 if(typeof define==='function'&&define.amd){
  define(['jquery','base'],factory);
 }else
 {
  if('theApp' in window)
  {
   if(!theApp.lib)
    throw 'theApp.lib doesn\'t exist!';
   theApp.set({data:'lib.Carousel',object:factory(jQuery,theApp),lib:false});
  }
 }
}(function($,mgr){
 mgr.extend(Carousel);

 function Carousel(){
  "use strict";
  
  this.options={
   mousewheel:false,
   circular:false,
   auto:-1,
   speed:200,
   dim:false,
   elements:null,
   pagTmpl:'<a href=""></a>',//[num]
   transition:null,
   hiddenClass:'hidden',
   disabledClass:'disabled',
   activeClass:'active',
   initEvent:'init',
   beforeEvent:'before',
   afterEvent:'after',
   recalcEvent:'resize',
   pagEvent:'pagination',
   namespace:'.carousel',//for events namespace
   touch:{
    speed:0.5,
    mult:4,
    enabled:true
   },
   easing:null,
   scroll:1,
   margin:0,
   start:0,
   visible:3,
   vertical:false,
   helpers:{
    swipe:null//swipe detection function
   }
  };
  
  this.props={
   container:null,//init
   block:null,//init
   pauser:null,//init
   next:null,//init
   prev:null,//init
   pagContainer:null,//init
   pagElements:null,
   elements:null,
   running:false,
   animCss:null,//init
   sizeCss:null,//init
   length:null,
   elSize:null,
   current:0,
   old:-1,
   t:-1,
   hover:false,
   pause:false,
   swipe:null
  };
 }
 //-----------------
 $.extend(Carousel.prototype,{
  init:function(opts){
   var self=this;

   self.options=$.extend(true,self.options,opts);

   self.props=$.extend(true,self.props,{
    container:$(opts.container),
    block:$(opts.block),
    pauser:$(opts.pauser),
    next:$(opts.next),
    prev:$(opts.prev),
    pagContainer:$(opts.pagContainer),
    animCss:opts.vertical?"top":"left",
    sizeCss:opts.vertical?"height":"width"
   });

   self.preparing();
   if(self.props.length<=self.options.visible)
    return;
   self.setControls();
   self.setDims();
  },
  destroy:function(){
   var self=this,
       n=self.options.namespace;

   clearTimeout(self.props.t);
   self.props.block.off('webkitTransitionEnd'+n+' transitionend'+n+' mouseenter'+n+' mouseleave'+n+' mousewheel'+n);
   if(self.options.touch.enabled&&self.props.swipe)
    self.props.swipe.disable();
   self.props.prev.off('click');
   self.props.next.off('click');
   self.props.block.css(self.props.animCss,0);
   if(self.options.circular)
    self.props.elements.filter(':gt('+(self.props.elements.length/2-1)+')').remove();

   self.off('*');
  },
  preparing:function(){
   var self=this;

   self.props.elements=self.options.elements?self.props.block.find(self.options.elements):self.props.block.children();
   self.props.length=self.props.elements.length;
   if(self.props.length<self.options.scroll+self.options.visible-1)
    self.options.circular=false;

   self.trigger(self.options.initEvent,[{elements:self.props.elements}]);

   self.props.next.removeClass(self.options.hiddenClass+' '+self.options.disabledClass);
   self.props.prev.removeClass(self.options.hiddenClass+' '+self.options.disabledClass);
   self.props.pagContainer.removeClass(self.options.hiddenClass);

   if(self.props.length<=self.options.visible)
   {
    self.props.container.addClass(self.options.hiddenClass);
    self.props.next.addClass(self.options.hiddenClass);
    self.props.prev.addClass(self.options.hiddenClass);
    self.props.pagContainer.addClass(self.options.hiddenClass);
    self.options.circular=false;
    self.setDims();
	self.makePagination();
    self.trigger(self.options.beforeEvent,[{
     current:0,
     next:-1,
     elements:self.props.elements
    }]);
	
    return;
   }

   if(self.options.circular)
    self.options.start=self.options.start%self.props.length;

   self.props.current=self.options.start?
    (
     self.options.circular?
     self.options.start:
     (
      self.options.start>self.props.length-self.options.visible?
      self.props.length-self.options.visible:
      self.options.start
     )
    ):0;

   if(!self.options.circular)
   {
    if(self.props.current==0)
     self.props.prev.addClass(self.options.disabledClass);
    if(self.props.current==self.props.length-self.options.visible)
     self.props.next.addClass(self.options.disabledClass);
   }

   if(self.options.scroll>self.props.length)
    self.options.scroll=self.props.length;
   if(!self.options.scroll)
    self.options.scroll=1;

   if(self.options.circular)
    self.props.block.append(self.props.elements.clone());

   self.props.elements=self.options.elements?self.props.block.find(self.options.elements):self.props.block.children();

   self.makePagination();
   self.trigger(self.options.beforeEvent,[{
    current:self.props.current,
    next:self.props.old,
    elements:self.props.elements
   }]);
  },
  setDims:function(){
   var self=this,
       cDim=self.options.vertical?self.props.container.height():self.props.container.width(),
       elDim=self.options.vertical?self.props.elements.eq(0).outerHeight():self.props.elements.eq(0).outerWidth(),
       d=self.options.dim?elDim:Math.floor((cDim-(self.options.visible-1)*self.options.margin)/self.options.visible),
       m=self.options.dim?Math.floor((cDim-self.options.visible*elDim)/(self.options.visible-1)):self.options.margin;

   if(self.props.length>self.options.visible)
   {
    if(!self.options.dim)
     self.props.elements.css(self.props.sizeCss,d);
    self.props.elements.css(self.options.vertical?'margin-bottom':'margin-right',m);

    self.props.elSize=d+m;
    self.props.block.css(self.props.sizeCss,self.props.elSize*self.props.length*(self.options.circular?2:1))
     .css(self.props.animCss,-self.props.current*self.props.elSize);
   }

   self.trigger(self.options.recalcEvent,[{
    container:self.props.container,
    block:self.props.block,
    elements:self.props.elements,
    visible:self.options.visible
   }]);
  },
  makePagination:function(){
   var self=this,
       j=Math.ceil((self.props.length-(self.options.circular?1:self.options.visible))/self.options.scroll)+1,
       s='';

   for(var i=0;i<j;i++)
    s+=self.options.pagTmpl.replace('[num]',String(i+1));

   self.props.pagContainer.html(s);
   self.props.pagElements=self.props.pagContainer.children();
   self.props.pagElements.eq(self.props.current).addClass(self.options.activeClass);
   self.trigger(self.options.pagEvent,[{
    elements:self.props.elements,
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
    self.props.block.removeClass(self.options.transition);
    self.animDone(true);
   }else
   {
    self.props.block.stop(false,true);
   }
  },
  setControls:function(){
   var self=this;
   
   if(self.options.transition)
   {
    self.props.block.on('webkitTransitionEnd'+self.options.namespace+' transitionend'+self.options.namespace,function(e){
     if(!$(e.target).is(self.props.block))
      return;

     if(e.originalEvent.propertyName!=self.props.animCss)
      return;

     self.props.block.removeClass(self.options.transition);
     self.animDone();
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
    self.go({to:self.props.current-self.options.scroll,dir:'back'});
    
    e.preventDefault();
   });
   
   self.props.next.on('click',function(e){
    clearTimeout(self.props.t);
    self.go({to:self.props.current+self.options.scroll,dir:'forward'});
    
    e.preventDefault();
   });
   
   self.props.pagElements.each(function(i){
    var obj=$(this),
        to=i*self.options.scroll;
    
    obj.on('click',function(e){
     if(!(obj.hasClass(self.options.activeClass)||self.props.running))
     {
      self.props.pagElements.removeClass(self.options.activeClass);
      obj.addClass(self.options.activeClass);
      clearTimeout(self.props.t);
      self.go({to:to,dir:(self.props.current>to?'back':'forward')});
     }
     
     e.preventDefault();
    });
   });
   
   if(self.options.mousewheel)
   {
    self.props.block.on('mousewheel'+self.options.namespace,function(e,d){
     clearTimeout(self.props.t);
     if(d>0)
      self.go({to:self.props.current-self.options.scroll,dir:'back'});else
      self.go({to:self.props.current+self.options.scroll,dir:'forward'});
     
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
      container:self.props.block,
      callback:function(delta){
       if(delta<0)
        self.go({to:self.props.current-self.options.scroll,dir:'back'});else
        self.go({to:self.props.current+self.options.scroll,dir:'forward'});
      }
     });
    }
   }
   
   self.auto();
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
   
   if(~self.options.auto&&!self.props.hover&&!self.props.pause)
   {
    self.props.t=setTimeout(function(){
     clearTimeout(self.props.t);
     self.go({to:self.props.current+self.options.scroll,dir:'forward'});
    },self.options.auto);
   }
  },
  getData:function(){
   var self=this;

   return {
    current:self.props.current,
    elements:self.props.elements,
    circular:self.options.circular,
    length:self.props.length,
    running:self.props.running,
    pause:self.props.pause
   }
  },
  setScroll:function(v){
   var self=this;

   self.options.scroll=v;
  },
  animDone:function(stop){
   var self=this;
   
   self.trigger(self.options.afterEvent,[{
    current:self.props.current%self.props.length,
    previous:self.props.old%self.props.length,
    dir:self.props.dir,
    elements:self.props.elements
   }]);
   
   self.props.running=false;
   if(~self.options.auto&&!stop)
    self.auto();
  },
  setCurrAndPos:function(i){
   var self=this;
   
   self.props.old=self.props.current;
   if(self.options.circular)
   {
    if(i>=0&&self.props.dir=='back')
     self.props.current=i;
    if(i<0&&self.props.dir=='back'&&self.props.current+self.options.visible<=self.props.length)
    {
     self.props.block.css(self.props.animCss,-self.props.current*self.props.elSize-self.props.length*self.props.elSize);
     self.props.current=self.props.current+self.props.length-self.options.scroll;
    }
    if(i<=2*self.props.length-self.options.visible&&self.props.dir=='forward')
     self.props.current=i;
    if(i>2*self.props.length-self.options.visible&&self.props.dir=='forward')
    {
     self.props.block.css(self.props.animCss,-self.props.current*self.props.elSize+self.props.length*self.props.elSize);
     self.props.current=self.props.current-self.props.length+self.options.scroll;
    }
   }else
   {
    if(self.props.current==0&&self.props.dir=='back'||self.props.current==self.props.length-self.options.visible&&self.props.dir=='forward')
     return false;
    
    if(self.props.dir=='back'&&i<0)
     self.props.current=0;
    if(self.props.dir=='back'&&i>=0)
     self.props.current=i;
    if(self.props.dir=='forward'&&i>self.props.length-self.options.visible)
     self.props.current=self.props.length-self.options.visible;
    if(self.props.dir=='forward'&&i<=self.props.length-self.options.visible)
     self.props.current=i;
   }
   
   return true;
  },
  go:function(to){
   var self=this;
   
   if(!self.props.running)
   {
    self.props.dir=to.dir;
    if(!self.setCurrAndPos(to.to))
     return;
    
    self.props.running=true;
    self.props.pagElements.removeClass(self.options.activeClass);
    self.props.pagElements.eq(Math.ceil((self.props.current%self.props.length)/self.options.scroll))
     .addClass(self.options.activeClass);
    
    self.trigger(self.options.beforeEvent,[{
     next:self.props.current%self.props.length,
     current:self.props.old%self.props.length,
     dir:self.props.dir,
     elements:self.props.elements
    }]);
    
    if(self.options.transition)
    {
     self.props.block.show()
      .addClass(self.options.transition)
      .css(self.props.animCss=="left"?{left:-self.props.current*self.props.elSize}:{top:-self.props.current*self.props.elSize});
    }else
    {
     self.props.block.animate(self.props.animCss=="left"?
      {left:-self.props.current*self.props.elSize}:
      {top:-self.props.current*self.props.elSize},self.options.speed,self.options.easing,function(){
       self.animDone();
     });
    }
    
    if(!self.options.circular)
    {
     if(!self.props.prev)
      return;
     
     self.props.prev.removeClass(self.options.disabledClass);
     self.props.next.removeClass(self.options.disabledClass);
     if(self.props.current==0&&self.props.dir=='back')
      self.props.prev.addClass(self.options.disabledClass);
     if(self.props.current==self.props.length-self.options.visible&&self.props.dir=='forward')
      self.props.next.addClass(self.options.disabledClass);
    }
   }
  }
 });
  
 return Carousel;
}));