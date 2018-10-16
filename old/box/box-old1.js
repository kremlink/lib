/*!by Alexander Kremlev*/
/*
<div class="box-pop-overlay"></div>
 <div class="box-pop">
 <div class="box-pop-viewport">
 <div class="box-pop-center">
 <div class="box-pop-wrap">
 <div class="box-pop-content"></div>
 <a class="box-pop-close" href=""></a>
 <a href="" class="box-pop-prev"></a>
 <a href="" class="box-pop-next"></a>
 <span class="box-pop-loader"></span>
 <span class="box-pop-zoom"></span>
 </div>
 </div>
 </div>
 </div>

 var box={
 open:function(){
 var u=this.userObject;

 u.$what.addClass(u.cls);
 },
 close:function(){
 var u=this.userObject;

 u.$what.removeClass(u.cls);
 }
 };

 box:{
 callers:'.contacts-right .photo',
 pop:'.box-pop',
 overlay:'.box-pop-overlay',
 siteContainer:'#wrap',
 effect:'opacity',
 transition:'box-pop-trs',
 data:'box',
 fixing:true,
 userObject:{
 cls:'blur',
 $what:'#wrap'
 }
 }
*/
(function (factory) {
 'use strict';
 
 if(typeof define==='function'&&define.amd){
  define(['jquery','base'/*,'mustache'*/,'jquery.imagesloaded','lib/utils'],factory);
 }else
 {
  if('SiteManager' in window)
  {
   if(!SiteManager.lib)
    throw 'SiteManager.lib doesn\'t exist!';
   SiteManager.lib['Box']=factory(jQuery,SiteManager);
  }
 }
}(function($,mgr){
 function Box(opts,func){
  "use strict";
  
  var self=this;
  
  mgr.Base.apply(this,arguments);
  
  self.options=$.extend(true,{
   close:'.box-pop-close',
   viewport:'.box-pop-viewport',
   center:'.box-pop-center',
   prev:'.box-pop-prev',
   next:'.box-pop-next',
   zoom:'.box-pop-zoom',
   insert:'.box-pop-content',
   image:'.box-pop-image',
   loadingClass:'box-pop-loading',
   showClass:'box-pop-shown',
   minClass:'box-pop-min',
   zoomableClass:'box-pop-zoomable',
   stretchClass:'box-pop-stretch',
   galleryClass:'box-pop-gallery',
   activeClass:'box-pop-active',
   readyClass:'box-pop-ready',
   bgClass:'box-pop-bg',
   transition:null,
   trsClasses:{
    opacity:'box-pop-opacity',
    dims:'box-pop-dims'
   },
   touch:{
    speed:2,
    mult:2,
    enabled:true
   },
   resize:true,
   resizeEvent:'resize.box',
   keydownEvent:'keydown.box',
   initEvent:'init',
   openEvent:'open',
   closeEvent:'close',
   afterEvent:'after',
   changeEvent:'change',
   fakeTransition:{
    prop:'font-size',//and in css in rule &.stretch &-center.opacity
    values:['3px','4px']
   },
   gallery:true,
   initialDims:100,
   fixing:true,
   template:'<img class="box-pop-image" src="[src]" /><div class="box-pop-title">[title]</div>',
   titleMarkup:'<div class="box-pop-title">[title]</div>',
   data:'',
   speed:300,
   overlayOpacity:0.5,
   effect:'none'//'none','dims','opacity','sim','dimsOpacity'(dimsOpacity triggers 'after' after dims animation)
  },opts);
  
  self.props={
   delegateCallers:$.isPlainObject(self.options.callers),
   callers:null,
   delegateContainer:null,
   pop:{
    item:$(opts.pop),
    closer:null,
    viewport:{
     item:null,
     paddingRight:null,
     paddingBottom:null
    },
    center:null,
    insert:null,
    prev:null,
    next:null,
    zoom:null
   },
   overlay:$(opts.overlay),
   mTemplate:$(opts.mTemplate),
   img:{obj:null,k:null,w:null,h:null},
   resize:true,
   show:false,
   caller:null,
   index:-1,
   data:null,
   effect:{
    css:{},
    dims:{},
    dimsFlag:false,
    opacity:{},
    dimsOpacityFlag:false
   },
   helpers:{
    wrap:$(opts.siteContainer)
   },
   coords:{pageX:0,pageY:0},
   swipe:null
  };
      
  init();
  
  function init(){
   self.setData();
   self.setResize();
   self.trigger(self.options.initEvent,[{props:self.props}]);
   self.setControls();
  }
 }
 //-----------------
 mgr.extend(Box);
 //-----------------
 $.extend(Box.prototype,{
  setData:function(){
   var self=this,
       d=self.options.data,
       p=self.props.pop,
       ef=self.props.effect;

   self.props.callers=self.props.delegateCallers?null:$(self.options.callers);
   self.props.delegateContainer=self.props.delegateCallers?$(self.options.callers.container):null;

   if(d&&mgr.utils.type(self.props.callers.eq(0).data(d)[d])=='array')
    self.props.data=self.props.callers.eq(0).data(d)[d];

   if(!self.props.data&&(self.props.delegateCallers||!self.props.delegateCallers&&self.props.callers.length<2)
    ||self.props.data&&self.props.data.length<2)
    self.options.gallery=false;

   p.closer=p.item.find(self.options.close);
   p.viewport.item=p.item.find(self.options.viewport);
   p.viewport.paddingRight=parseInt(p.viewport.item.css('right'));
   p.viewport.paddingBottom=parseInt(p.viewport.item.css('bottom'));
   p.center=p.item.find(self.options.center);
   p.insert=p.item.find(self.options.insert);
   p.prev=p.item.find(self.options.prev);
   p.next=p.item.find(self.options.next);
   p.zoom=p.item.find(self.options.zoom);

   if(self.options.transition)
    p.center.css(self.options.fakeTransition.prop,self.options.fakeTransition.values[0]);

   switch(self.options.effect){
    case 'none':
     ef.css['opacity']=1;
     break;
    case 'dims':
     ef.css['opacity']=1;
     ef.dimsFlag=true;
     ef.cls=self.options.trsClasses['dims'];
     break;
    case 'opacity':
     ef.css['opacity']=0;
     ef.opacity['opacity']=1;
     ef.cls=self.options.trsClasses['opacity'];
     break;
    case 'sim':
     ef.css['opacity']=0;
     ef.opacity['opacity']=1;
     ef.dimsFlag=true;
     ef.cls=self.options.trsClasses['dims'];
     break;
    case 'dimsOpacity':
     ef.css['opacity']=0;
     ef.opacity['opacity']=1;
     ef.dimsFlag=true;
     ef.dimsOpacityFlag=true;
     ef.cls=self.options.trsClasses['dims'];
     break;
   }

   if(self.options.effect=='opacity'||self.options.effect=='sim'||self.options.effect=='dimsOpacity')
    p.item.addClass(self.options.transition);
  },
  destroy:function(){
   var self=this;

   self.off();
   self.props.pop.item.off('click');
   self.props.pop.zoom.off('click');
   self.props.pop.prev.off('click');
   self.props.pop.next.off('click');
   self.props.pop.center.off('transitionend webkitTransitionEnd');
   self.props.swipe.disable();
   self.props.pop.closer.add(self.props.overlay).off('click');
   mgr.helpers.win.off(self.options.resizeEvent);
   if(self.props.delegateCallers)
    self.props.delegateContainer.off('click');else
    self.props.callers.off('click');
   self.close();
  },
  setControls:function(){
   var self=this;

   self.setCallers();
   self.setClosers();

   self.props.pop.item.on('click',function(e){
    var target=$(e.target);

    if(self.props.shown&&(target.is(self.props.pop.item)||target.is(self.props.pop.viewport.item)))
     self.close();
   });

   if(self.options.resize)
   {
    self.props.pop.zoom.on('click',function(e){
     if(self.props.shown)
     {
      self.props.pop.item.toggleClass(self.options.stretchClass);
      if(self.props.pop.item.hasClass(self.options.stretchClass))
       self.startResize();else
       self.stopResize();
     }

     e.preventDefault();
    });
   }

   self.props.pop.prev.on('click',function(e){
    //if(!self.props.pop.center.is(':animated')&&!self.props.pop.item.hasClass(self.options.loadingClass))
    if(self.props.shown)
     self.change(false);

    e.preventDefault();
   });
   self.props.pop.next.on('click',function(e){
    //if(!self.props.pop.center.is(':animated')&&!self.props.pop.item.hasClass(self.options.loadingClass))
    if(self.props.shown)
     self.change(true);

    e.preventDefault();
   });

   if(self.options.transition)
   {
    self.props.pop.center.on('transitionend webkitTransitionEnd',function(e){
     if(self.props.shown&&self.options.resize&&self.props.resize&&$(e.target).is(self.props.pop.center))
     {
      if(e.originalEvent.propertyName==self.options.fakeTransition.prop)
       self.afterDimsAnim();
     }
    });
    /*self.props.pop.center.add(self.props.img.obj).on('transitionend',function(e){
     if(self.options.resize&&self.props.resize&&($(e.target).is(self.props.pop.center)||$(e.target).is(self.props.img.obj)))
     {
     if(e.originalEvent.propertyName==self.options.fakeTransition.prop||
     self.options.effect=='dimsOpacity'&&e.originalEvent.propertyName=='opacity')
     self.afterDimsAnim();
     }
     });*/
   }

   if(self.options.touch.enabled)
   {
    self.props.swipe=new (mgr.get('lib.utils.swipe'))({
     vertical:self.options.vertical,
     mult:self.options.touch.mult,
     speed:self.options.touch.speed,
     container:self.props.pop.center,
     callback:function(delta){
      if(self.props.shown&&self.options.gallery)
      {
       if(delta>0)
        self.change(true);else
        self.change(false);
      }
     }
    });
   }
  },
  setCallers:function(){
   var self=this;

   if(self.props.delegateCallers)
   {
    self.props.delegateContainer.on('click',self.options.callers.selector,function(e){
     self.open({caller:$(this)});

     e.preventDefault();
    });
   }else
   {
    self.props.callers.on('click',function(e){
     self.open({caller:$(this)});

     e.preventDefault();
    });
   }
  },
  setClosers:function(){
   var self=this;

   self.props.pop.closer.add(self.props.overlay).on('click',function(e){self.close();e.preventDefault();});
   mgr.helpers.doc.on(self.options.keydownEvent,function(e){
    if(self.props.shown&&e.which==27)
     self.close();
   });
  },
  setResize:function(){
   var self=this,
       debounce=mgr.get('lib.utils.debounce')(function(){
        if(self.props.shown)
         self.redraw(false);
       },200);

   mgr.helpers.win.on(self.options.resizeEvent,function(){
    if(self.props.shown&&self.props.resize)
     self.props.pop.item.css('overflow','hidden').removeClass(self.options.zoomableClass);
    debounce();
   });

   /*mgr.get('lib.utils.winResizeScroll')({
    events:self.options.resizeEvent,
    time:200,
    outside:function(){
     if(self.props.shown&&self.props.resize)
      self.props.pop.item.css('overflow','hidden').removeClass(self.options.zoomableClass);
    },
    inside:function(){
     if(self.props.shown)
      self.redraw(false);
    }
   });*/
  },
  close:function(){
   var self=this,
       p=self.props.pop;
   
   if(self.options.fixing)
    mgr.get('lib.utils.fixed')(false);

   p.item.removeClass(self.options.galleryClass+' '+self.options.showClass);
   self.props.overlay.removeClass(self.options.activeClass+' '+self.options.transition);
   self.props.shown=false;
   p.insert.html('');
   p.item.removeClass(self.options.stretchClass+' '+self.options.zoomableClass+' '+self.options.readyClass);
   self.trigger(self.options.closeEvent);
  },
  open:function(opts){
   var self=this,
       p=self.props.pop;

   self.props.caller=opts.caller;
   self.trigger(self.options.openEvent,[{caller:opts.caller}]);

   if(self.options.gallery)
    p.item.addClass(self.options.galleryClass);

   p.item.addClass(self.options.showClass);
   self.setIniWrapWidth();
   p.insert.css({width:0,height:0});

   self.dimsTrs();
   
   self.props.shown=true;
   p.center.addClass(self.options.bgClass);
   
   if(self.options.fixing)
    mgr.get('lib.utils.fixed')(true,self.props.helpers.wrap);
   
   self.openAnim();

   self.props.index=(self.props.data||self.props.delegateCallers?0:self.props.callers.index(self.props.caller));
   self.insertData();
   
   self.props.img.obj=p.insert.find(self.options.image);
   
   p.item.addClass(self.options.minClass+' '+self.options.loadingClass);
   self.props.img.obj.imagesLoaded(function(){//TODO: if $.fn.imagesLoaded...
    //setTimeout(function(){
     self.show();
    //},1000);
   });
  },
  show:function(){
   var self=this,
       p=self.props.pop;

   p.center.removeClass(self.options.bgClass);
   p.item.addClass(self.options.readyClass);

   self.trigger(self.options.changeEvent,[{first:true}]);

   p.item.removeClass(self.options.minClass+' '+self.options.loadingClass);
   self.props.img.w=self.props.img.obj.width();
   self.props.img.h=self.props.img.obj.height();
   self.props.img.k=self.props.img.w/self.props.img.h;
   p.item.addClass(self.options.stretchClass);
   self.props.resize=true;
   p.insert.css({width:'auto',height:'auto',top:0,right:0,bottom:0,left:0});
   self.props.img.obj.css(self.props.effect.css);
   self.showAnim();

   self.redraw(false);
  },
  openAnim:function(){
   var self=this;

   if(self.options.transition)
   {
    self.props.overlay.addClass(self.options.transition+' '+self.options.activeClass);
   }else
   {
    self.props.overlay.addClass(self.options.activeClass)
     .css('opacity',0)
     .animate({opacity:self.options.overlayOpacity},{duration:self.options.speed});
   }
  },
  showAnim:function(){
   var self=this;

   if(self.options.transition)
   {
    self.props.img.obj
     .addClass(self.options.effect=='none'||self.options.effect=='dims'?'':self.options.transition)
     .show().css(self.options.effect=='dimsOpacity'?{}:self.props.effect.opacity);
    self.props.pop.insert.css(self.props.effect.opacity);
   }else
   {
    self.props.img.obj.stop().animate(self.options.effect=='dimsOpacity'?{}:self.props.effect.opacity,{
     duration:self.options.speed
    });
   }
  },
  changeAnim:function(){
   var self=this;

   if(self.options.transition)
   {
    self.props.img.obj.show().css(self.props.effect.dimsOpacityFlag?{}:self.props.effect.opacity);
   }else
   {
    self.props.img.obj.animate(self.props.effect.dimsOpacityFlag?{}:self.props.effect.opacity,{
     duration:self.options.speed
    });
   }
  },
  dimsTrs:function(){
   var self=this;

   if(self.options.effect!='none')
    self.props.pop.center.show().addClass(self.props.effect.cls);
  },
  forDimsOpacity:function(){
   var self=this;

   if(self.options.transition)
   {
    self.props.img.obj.css(self.props.effect.opacity);
   }else
   {
    self.props.img.obj.animate(self.props.effect.opacity,{
     duration:self.options.speed
    });
   }
  },
  afterDimsAnim:function(){
   var self=this;

   self.trigger(self.options.afterEvent);
   if(self.props.img.obj.width()<self.props.img.w)
    self.props.pop.item.addClass(self.options.zoomableClass);else
    self.props.pop.item.removeClass(self.options.zoomableClass);

   if(self.props.effect.dimsOpacityFlag)
    self.forDimsOpacity();
  },
  getNextSrc:function(){
   var self=this,
       d=self.options.data,
       src;

   if(self.props.data)
   {
    src=self.props.data[self.props.index]['img'];
   }else
   {
    if(d)
     src=self.props.caller.data(d)[d]['img'];else
     src=self.props.caller.attr('href');
   }

   return src;
  },
  getNextIndex:function(flag){
   var self=this,
       callers=self.props.callers,
       objs=self.props.data?self.props.data:callers,
       curr=self.props.data?self.props.index:callers.index(self.props.caller);

   return flag?(curr<objs.length-1?curr+1:0):(curr>0?curr-1:objs.length-1);
  },
  change:function(flag){
   var self=this,
       next=self.getNextIndex(flag),
       im=new Image(),
       p=self.props.pop;

   if(!self.props.data)
    self.props.caller=self.props.callers.eq(next);

   p.item.addClass(self.options.loadingClass);

   if(self.options.resize&&self.props.resize)
    p.item.removeClass(self.options.zoomableClass);

   self.props.index=next;
   im.src=self.getNextSrc();

   $(im).imagesLoaded(function(){
    self.props.img.w=im.width;
    self.props.img.h=im.height;
    self.props.img.k=self.props.img.w/self.props.img.h;

    self.trigger(self.options.changeEvent,[{}]);

    p.item.removeClass(self.options.loadingClass);
    if(!self.props.resize)
     self.setIniWrapWidth();
    self.insertData();

    self.props.img.obj=p.insert.find(self.options.image).css(self.props.effect.css);
    self.changeAnim();

    self.redraw(false);
   });
  },
  setIniWrapWidth:function(){
   var self=this;

   self.props.pop.center.css({
    width:self.options.initialDims,
    height:self.options.initialDims,
    marginLeft:-self.options.initialDims/2,
    marginTop:-self.options.initialDims/2,
    left:'50%',
    top:'50%',
    padding:0
   });
  },
  insertData:function(){
   var self=this,
       d=self.options.data,
       dat;

   if(self.props.data)
   {
    dat=self.props.data[self.props.index];
   }else
   {
    if(d)
     dat=self.props.caller.data(d)[d];else
     dat={img:self.props.caller.attr('href'),title:self.props.caller.attr('title')};
   }

   self.props.pop.insert.html(
    (
     $.trim(dat['title'])?
      self.options.template:
      self.options.template.replace(self.options.titleMarkup,'')
     ).replace('[src]',dat['img'])
     .replace('[title]',dat['title'])
   );
  },
  stopResize:function(){
   var self=this;
   
   self.props.pop.center.removeClass(self.props.effect.cls);
   self.props.pop.item.css('overflow','auto');
   self.props.resize=false;
   self.redraw(false);
  },
  startResize:function(){
   var self=this;
   
   self.props.resize=true;
   self.setIniWrapWidth();
   self.redraw(true);
  },
  redrawResized:function(flag){
   var self=this,
       p=self.props.pop,
       w=p.viewport.item.width(),
       h=p.viewport.item.height(),
       k1,
       k=self.props.img.k,
       data={},
       dimsOpacityFlag ;

   if(w>self.props.img.w)
    w=self.props.img.w;
   if(h>self.props.img.h)
    h=self.props.img.h;
   k1=w/h;
   
   data.css={left:'50%',top:'50%',padding:0};
   
   if(k1<k)
    data.animate={width:w,height:w/k,marginTop:-w/k/2,marginLeft:-w/2};else
    data.animate={height:h,width:h*k,marginLeft:-h*k/2,marginTop:-h/2};
   
   if(flag)
   {
    p.center.css(data.css).css(data.animate);
    self.dimsTrs();

    if(self.props.img.obj.width()<self.props.img.w)
     p.item.addClass(self.options.zoomableClass);else
     p.item.removeClass(self.options.zoomableClass);
   }else
   {
    if(self.props.effect.dimsFlag)
    {
     self.props.effect.dims=data.animate;
    }

    p.center
     .css(data.css)
     .css(self.props.effect.dimsFlag?{}:data.animate);

    dimsOpacityFlag=p.center.width()==self.props.effect.dims.width&&p.center.height()==self.props.effect.dims.height;
    if(self.options.transition)
    {
     if(!dimsOpacityFlag)
      self.props.effect.dims[self.options.fakeTransition.prop]=
       p.center.css(self.options.fakeTransition.prop)==self.options.fakeTransition.values[0]?
        self.options.fakeTransition.values[1]:
        self.options.fakeTransition.values[0];
     p.center.css(self.props.effect.dims);

     if(self.options.effect=='none'||self.props.effect.dimsFlag&&dimsOpacityFlag)
      self.afterDimsAnim();
    }else
    {
     p.center.stop().animate(self.options.effect=='dimsOpacity'&&dimsOpacityFlag?{}:self.props.effect.dims,{
      duration:self.options.speed,
      complete:function(){
       self.afterDimsAnim();
      }
     }).css('overflow','visible');
    }
   }
  },
  redrawUnresized:function(){
   var self=this,
       imgWidth=self.props.img.w,
       imgHeight=self.props.img.h,
       popWrap1Width=self.props.pop.viewport.item.width(),
       popWrap1Height=self.props.pop.viewport.item.height(),
       popWrap1Wider=popWrap1Width>imgWidth,
       popWrap1Taller=popWrap1Height>imgHeight;
   
   self.props.pop.center.css({
    width:'auto',
    height:'auto',
    'left':(popWrap1Wider?'50%':0),
    'margin-left':(popWrap1Wider?-imgWidth/2:0),
    'top':(popWrap1Taller?'50%':0),
    'margin-top':(popWrap1Taller?-imgHeight/2:0),
    'padding-right':(popWrap1Wider?0:self.props.pop.viewport.paddingRight),
    'padding-bottom':(popWrap1Taller?0:self.props.pop.viewport.paddingBottom)
   });
   
   self.forDimsOpacity();
  },
  redraw:function(flag){
   var self=this;
   
   if(self.props.resize)
    self.redrawResized(flag);else
    self.redrawUnresized();
  }
 });
  
 return Box;
}));