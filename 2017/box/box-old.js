/*!by Alexander Kremlev*/
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
   SiteManager.set({data:'lib.Box',object:factory(jQuery,SiteManager),lib:false});
  }
 }
}(function($,mgr){
 mgr.extend(Box);

 function Box(){
  "use strict";
  
  this.options={
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
   readyClass:'box-pop-ready',//is set when box is opened and img is ready
   bgClass:'box-pop-bg',
   ctrlDisabledClass:'box-pop-ctrl-disabled',
   titleHiddenClass:'box-pop-title-hidden',
   transition:null,
   titleInto:'content',
   trsClasses:{
    opacity:'box-pop-opacity',
    dims:'box-pop-dims'
   },
   touch:{
    speed:2,
    mult:2,
    enabled:true,
    swipe:null//swipe detection function
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
   initialDims:100,
   template:'<img class="box-pop-image" src="[src]" /><div class="box-pop-title">[title]</div>',
   titleMarkup:'<div class="box-pop-title">[title]</div>',
   simple:true,
   circular:true,
   speed:800,
   overlayOpacity:0.5,
   //effect:'none','dims','opacity','sim','dimsOpacity'
   //bugs: transition: dimsOpacity triggers 'after' after dims animation
   effect:'none',
   helpers:{
    debounce:null//init
   },
   getData:null//init
  };

  this.props={
   win:$(window),
   doc:$(document),
   delegateCallers:null,//init
   callers:null,
   delegateContainer:null,
   pop:{
    item:null,//init
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
    zoom:null,
    title:null
   },
   overlay:null,//init
   mTemplate:null,//init
   img:{obj:null,k:null,w:null,h:null},
   resize:true,
   show:false,
   caller:null,
   effect:{
    css:{},
    dims:{},
    dimsFlag:false,
    opacity:{}
   },
   coords:{pageX:0,pageY:0},
   swipe:null
  };
 }
 //-----------------
 $.extend(Box.prototype,{
  init:function(opts){
   var self=this;

   self.options=$.extend(true,self.options,{
    getData:function(){throw new Error('No getData function set! ['+self.getInner('PATH')+']');},
    helpers:{debounce:function(){throw new Error('No debounce function set! ['+self.getInner('PATH')+']');}}
   },opts);

   self.props=$.extend(true,self.props,{
    delegateCallers:$.isPlainObject(opts.callers),
    pop:{item:$(opts.pop)},
    overlay:$(opts.overlay),
    mTemplate:$(opts.mTemplate)
   });

   self.prepare();
  },
  prepare:function(){
   var self=this;

   self.setData();
   self.setResize();
   self.trigger(self.options.initEvent,[{props:self.props}]);
   self.setControls();
  },
  toggleCtrls:function(opts){
   var self=this;

   self.props.pop[opts.ctrl][opts.what+'Class'](self.options.ctrlDisabledClass);
  },
  setData:function(){
   var self=this,
       p=self.props.pop,
       ef=self.props.effect;

   self.props.callers=self.props.delegateCallers?null:$(self.options.callers);
   if(self.props.delegateCallers)
   {
    self.props.delegateContainer=$(self.options.callers.container);
    self.options.simple=false;
   }

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
   self.props.win.off(self.options.resizeEvent);
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
     self.show({type:'change',dir:'prev',flag:false});

    e.preventDefault();
   });
   self.props.pop.next.on('click',function(e){
    //if(!self.props.pop.center.is(':animated')&&!self.props.pop.item.hasClass(self.options.loadingClass))
    if(self.props.shown)
     self.show({type:'change',dir:'next',flag:true});

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
    if(self.options.touch.swipe)
    {
     self.props.swipe=new (self.options.touch.swipe)({
      vertical:self.options.vertical,
      mult:self.options.touch.mult,
      speed:self.options.touch.speed,
      container:self.props.pop.center,
      callback:function(delta){
       if(self.props.shown)
       {
        if(delta>0)
         self.show({type:'change',dir:'next',flag:true});else
         self.show({type:'change',dir:'prev',flag:false});
       }
      }
     });
    }
   }
  },
  setCallers:function(){
   var self=this;

   if(self.props.delegateCallers)
   {
    self.props.delegateContainer.on('click',self.options.callers.selector,function(e){
     self.show({type:'open',data:{caller:$(this)}});

     e.preventDefault();
    });
   }else
   {
    self.props.callers.on('click',function(e){
     self.show({type:'open',data:{caller:$(this)}});

     e.preventDefault();
    });
   }
  },
  setClosers:function(){
   var self=this;

   self.props.pop.closer.add(self.props.overlay).on('click',function(e){self.close();e.preventDefault();});
   self.props.doc.on(self.options.keydownEvent,function(e){
    if(self.props.shown&&e.which==27)
     self.close();
   });
  },
  setResize:function(){
   var self=this,
       debounce=self.options.helpers.debounce(function(){
        if(self.props.shown)
         self.redraw(false);
       },200);

   self.props.win.on(self.options.resizeEvent,function(){
    if(self.props.shown&&self.props.resize)
     self.props.pop.item.css('overflow','hidden').removeClass(self.options.zoomableClass);
    debounce();
   });
  },
  close:function(){
   var self=this,
       p=self.props.pop;

   p.item.removeClass(self.options.showClass);
   self.props.overlay.removeClass(self.options.activeClass+' '+self.options.transition);
   self.props.shown=false;
   p.insert.html('');

   if(self.props.pop.title)
   {
    self.props.pop.title.remove();
    self.props.pop.title=null;
   }

   p.item.removeClass(self.options.stretchClass+' '+self.options.zoomableClass+' '+self.options.readyClass);
   self.trigger(self.options.closeEvent);
  },
  open:function(opts){
   var self=this,
       p=self.props.pop;

   self.props.caller=opts.caller;
   self.trigger(self.options.openEvent,[{caller:opts.caller}]);

   if(self.options.simple&&self.props.callers.length<2)
   {
    p.prev.addClass(self.options.ctrlDisabledClass);
    p.next.addClass(self.options.ctrlDisabledClass);
   }else
   {
    p.prev.removeClass(self.options.ctrlDisabledClass);
    p.next.removeClass(self.options.ctrlDisabledClass);
   }

   p.item.addClass(self.options.showClass);
   self.setIniWrapWidth();
   p.insert.css({width:0,height:0});

   self.dimsTrs();

   self.props.shown=true;
   p.center.addClass(self.options.bgClass);

   self.overlayAnim();

   p.item.addClass(self.options.minClass+' '+self.options.loadingClass);
  },
  getNext:function(opts){
   var self=this,
    s=self.options.simple,
    callers=self.props.callers,
    curr=s?callers.index(self.props.caller):null,
    caller=s?(opts.data?opts.data.caller
     :callers.eq(opts.flag?(curr<callers.length-1?curr+1:0):(curr>0?curr-1:callers.length-1))):null;

   return {
    caller:caller,
    data:s?{img:caller.attr('href'),title:caller.attr('title')}:self.options.getData.apply(self,[opts])
   };
  },
  show:function(opts){
   var self=this,
       p=self.props.pop,
       im=$(new Image()),
       data,
       shown=self.props.shown;

   self.props.pop.prev.removeClass(self.options.ctrlHiddenClass);
   self.props.pop.next.removeClass(self.options.ctrlHiddenClass);

   if(opts.type=='change'&&self.options.simple)
   {
    if(self.props.callers.length<2)
     return;

    if(!self.options.circular)
    {
     if(opts.dir=='next'&&self.props.callers.index(self.props.caller)==self.props.callers.length-2)
      self.props.pop.next.addClass(self.options.ctrlHiddenClass);
     if(opts.dir=='prev'&&self.props.callers.index(self.props.caller)==1)
      self.props.pop.prev.addClass(self.options.ctrlHiddenClass);

     if(opts.dir=='next'&&self.props.callers.index(self.props.caller)==self.props.callers.length-1||
      opts.dir=='prev'&&self.props.callers.index(self.props.caller)==0)
      return;
    }
   }

   if(opts.type=='open'&&self.options.simple&&!self.options.circular)
   {
    if(self.props.callers.index(opts.data.caller)==0)
     self.props.pop.prev.addClass(self.options.ctrlHiddenClass);
    if(self.props.callers.index(opts.data.caller)==self.props.callers.length-1)
     self.props.pop.next.addClass(self.options.ctrlHiddenClass);
   }

   if(!self.props.shown)
    self.open(opts.data);else
    p.item.addClass(self.options.loadingClass);

   data=self.getNext(opts);

   self.props.caller=data.caller;

   self.props.pop.insert
    .css(self.props.effect.css)
    .removeClass(self.options.trsClasses['opacity']);

   if(self.options.resize&&self.props.resize)
    p.item.removeClass(self.options.zoomableClass);

   im[0].src=data.data.img;

   if(self.props.pop.title)
   {
    if(!$.trim(data.data['title']))
     self.props.pop.title.addClass(self.options.titleHiddenClass);else
     self.props.pop.title.removeClass(self.options.titleHiddenClass);
   }

   im.imagesLoaded(function(){
    self.loaded({shown:shown,img:im[0],data:data.data,opts:opts});
    im.remove();
   });
  },
  loaded:function(opts){
   var self=this,
       p=self.props.pop;

   if(!opts.shown)
   {
    p.center.removeClass(self.options.bgClass);
    p.item.addClass(self.options.readyClass);

    p.item.addClass(self.options.stretchClass);
    self.props.resize=true;
    p.insert.css({width:'auto',height:'auto',top:0,right:0,bottom:0,left:0});
   }
   if(opts.type=='change')
   {
    self.trigger(self.options.changeEvent,[{}]);
    if(!self.props.resize)
     self.setIniWrapWidth();
   }

   p.item.removeClass(self.options.minClass+' '+self.options.loadingClass);
   self.props.img.k=opts.img.naturalWidth/opts.img.naturalHeight;
   self.props.img.w=opts.img.naturalWidth;
   self.props.img.h=opts.img.naturalHeight;
   self.insertData(opts.data);

   self.props.img.obj=p.insert.css(self.props.effect.css).find(self.options.image);
   setTimeout(function(){//firefox trs opacity fix
    self.showAnim();
   },1);

   self.redraw(false);
  },
  overlayAnim:function(){
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
   var self=this,
       op=self.options.effect=='opacity'||self.options.effect=='sim'||self.options.effect=='dimsOpacity';

   if(self.options.transition)
   {
    if(self.options.effect!='dimsOpacity')
     self.props.pop.insert.css(self.props.effect.opacity);
    if(op)
     self.props.pop.insert.addClass(self.options.trsClasses['opacity']);
   }else
   {
    if(self.options.effect=='opacity'||self.options.effect=='sim')
    {
     self.props.pop.insert.animate(self.props.effect.opacity,{
      duration:self.options.speed,
      complete:function(){
       if(self.options.effect=='opacity')
        self.afterDimsAnim();
      }
     });
    }

    if(self.options.effect=='none')
     self.props.pop.insert.css(self.props.effect.opacity);
   }
  },
  dimsTrs:function(){
   var self=this;

   if(self.options.transition&&self.options.effect!='none')
    self.props.pop.center.show().addClass(self.props.effect.cls);
  },
  forDimsOpacity:function(){
   var self=this;

   if(self.options.transition)
   {
    self.props.pop.insert.css(self.props.effect.opacity);
   }else
   {
    self.props.pop.insert.animate(self.props.effect.opacity,{
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

   if(self.options.effect=='dimsOpacity')
    self.forDimsOpacity();
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
  insertData:function(opts){
   var self=this,
       t=$.trim(opts['title']);

   if(self.options.titleInto=='content')
   {
    self.props.pop.insert.html((t?self.options.template:self.options.template.replace(self.options.titleMarkup,''))
      .replace('[src]',opts['img'])
      .replace('[title]',opts['title']));
   }

   if(self.options.titleInto=='viewport')
   {
    self.props.pop.insert.html(self.options.template.replace(self.options.titleMarkup,'')
     .replace('[src]',opts['img']));

    if(t)
    {
     if(!self.props.pop.title)
      self.props.pop.title=$(self.options.titleMarkup).appendTo(self.props.pop.viewport.item);

     self.props.pop.title.html(opts['title']);
    }
   }
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
       dimsOpacityFlag;

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
     p.center.animate(self.options.effect=='dimsOpacity'&&dimsOpacityFlag?{}:self.props.effect.dims,{
      duration:self.options.speed,
      complete:function(){
       if(self.options.effect!='opacity')
        self.afterDimsAnim();
      }
     }).css('overflow','visible');//jQuery animate fix
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
    self.redrawUnresized(false);
  }
 });
  
 return Box;
}));