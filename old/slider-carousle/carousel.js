/*!by Alexander Kremlev*/
/*
 carousel:{
 container:'.search-photo-pop .carousel',
 block:'.search-photo-pop .block',
 next:'.search-photo-pop .down',
 prev:'.search-photo-pop .up',
 vertical:true,
 dim:true,
 circular:true,
 mousewheel:true,
 visible:4
 }

 mgr.setObject('index.carousel','Carousel');
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
   SiteManager.lib['Carousel']=factory(jQuery,SiteManager);
  }
 }
}(function($,mgr){
 function Carousel(opts){
  "use strict";
  
  var self=this;
  
  mgr.Base.apply(this,arguments);
  
  self.options=$.extend(true,{
   mousewheel:false,
   circular:false,
   auto:null,
   hover:true,
   speed:200,
   dim:false,
   elements:null,
   resize:0,
   pag:'<a href="">[num]</a>',
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
    speed:2,
    mult:4,
    enabled:true
   },
   easing:null,
   scroll:1,
   margin:0,
   start:0,
   visible:3,
   load:'all',
   vertical:false
  },opts);
  
  self.props={
   container:$(opts.container),
   block:$(opts.block),
   next:$(opts.next),
   prev:$(opts.prev),
   pagContainer:$(opts.pagContainer),
   pagElements:null,
   elements:null,
   running:false,
   animCss:opts.vertical?"top":"left",
   sizeCss:opts.vertical?"height":"width",
   length:null,
   elSize:null,
   current:null,
   old:-1,
   t:null,
   hover:false,
   pause:false,
   swipe:null
  };
  
  init();
  
  function init(){
   self.preparing();
   if(self.props.length<=self.options.visible)
    return;
   self.makePagination();
   self.setControls();
   self.setDims();
  }
 }
 //-----------------
 mgr.extend(Carousel);
 //-----------------
 $.extend(Carousel.prototype,{
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

   self.off('*');
  },
  preparing:function(){
   var self=this;

   self.props.elements=self.options.elements?self.props.block.find(self.options.elements):self.props.block.children();
   self.props.length=self.props.elements.length;
   if(self.props.length<self.options.scroll+self.options.visible-1)
    self.options.circular=false;

   self.trigger(self.options.initEvent,[{elements:self.props.elements}]);

   if(self.options.resize)
   {
    mgr.get('lib.utils.winResizeScroll')({
     events:'resize'+self.options.namespace,
     inside:function(){
      self.setDims();
     },
     time:self.options.resize
    });
   }

   self.props.next.removeClass(self.options.hiddenClass+' '+self.options.disabledClass);
   self.props.prev.removeClass(self.options.hiddenClass+' '+self.options.disabledClass);
   self.props.pagContainer.removeClass(self.options.hiddenClass);

   if(self.props.length<=self.options.visible)
   {
    self.props.next.addClass(self.options.hiddenClass);
    self.props.prev.addClass(self.options.hiddenClass);
    self.props.pagContainer.addClass(self.options.hiddenClass);
    self.setDims();
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

   if(!self.options.dim)
    self.props.elements.css(self.props.sizeCss,d);
   self.props.elements.css(self.options.vertical?'margin-bottom':'margin-right',m);
   
   self.props.elSize=d+m;
   self.props.block.css(self.props.sizeCss,self.props.elSize*self.props.length*(self.options.circular?2:1))
    .css(self.props.animCss,-self.props.current*self.props.elSize);

   self.trigger(self.options.recalcEvent,[{
    container:self.props.container,
    block:self.props.block,
    elements:self.props.elements
   }]);
  },
  makePagination:function(){
   var self=this,
       j=Math.floor((self.props.length-(self.options.circular?1:self.options.visible))/self.options.scroll)+1,
       s='';
   
   for(var i=0;i<j;i++)
    s+=self.options.pag.replace('[num]',i+1);
   
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
   
   self.props.block.on('mouseenter'+self.options.namespace,function(){
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
    self.props.swipe=new (mgr.get('lib.utils.swipe'))({
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
   
   if(self.options.load&&$.fn.imagesLoaded)
   {
    self.props.container.find('img').imagesLoaded(function(){
     self.auto();
    });
   }else
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
   
   if(self.options.auto&&!self.props.hover&&!self.props.pause)
   {
    self.props.t=setTimeout(function(){
     clearTimeout(self.props.t);
     self.go({to:self.props.current+self.options.scroll,dir:'forward'});
    },self.options.auto);
   }
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
   if(self.options.auto&&!stop)
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
    self.props.pagElements.eq(Math.floor((self.props.current%self.props.length)/self.options.scroll))
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