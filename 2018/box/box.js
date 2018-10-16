/*!by Alexander Kremlev*/
(function (factory) {
 'use strict';
 
 if(typeof define==='function'&&define.amd){
  define(['jquery','base'/*,'mustache'*/,'jquery.imagesloaded','lib/utils'],factory);
 }else
 {
  if('theApp' in window)
  {
   if(!theApp.lib)
    throw 'theApp.lib doesn\'t exist!';
   theApp.set({data:'lib.Box',object:factory(jQuery,theApp),lib:false});
  }
 }
}(function($,mgr){
 mgr.extend(Box);

 function Box(){
  "use strict";
  
  this.options={
   selectors:{
    pop:'.box-pop',
    close:'.box-pop-close',
    viewport:'.box-pop-viewport',
    center:'.box-pop-center',
    prev:'.box-pop-prev',
    next:'.box-pop-next',
    zoom:'.box-pop-zoom',
    insert:'.box-pop-content',
    image:'.box-pop-image',
    overlay:'.box-pop-overlay'
   },
   loadingClass:'box-pop-loading',
   showClass:'box-pop-shown',
   minClass:'box-pop-min',
   zoomableClass:'box-pop-zoomable',
   stretchClass:'box-pop-stretch',
   hideCtrlsClass:'box-pop-hide-ctrls',
   unblockClass:'box-pop-unblock',
   galleryClass:'box-pop-gallery',
   activeClass:'box-pop-active',
   readyClass:'box-pop-ready',//is set when box is opened and img is ready
   bgClass:'box-pop-bg',
   noBgClass:'box-pop-no-bg',
   ctrlDisabledClass:'box-pop-ctrl-disabled',
   ctrlHiddenClass:'box-pop-ctrl-hidden',
   titleHiddenClass:'box-pop-title-hidden',
   transition:'trs',
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
   data:'data',
   zoomable:true,
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
   template:{
    src:{
     html:'<img class="box-pop-image" src="[src]" />',
     attr:'href'
    },
    title:{
     html:'<div class="box-pop-title">[title]</div>',
     attr:'title',
     selector:'.box-pop-title'
    }
   },
   circular:true,
   speed:800,
   overlayOpacity:0.5,
   //effect:'none','dims','opacity','sim','dimsOpacity'
   //bugs: transition: dimsOpacity triggers 'after' after dims animation
   effect:'none',
   helpers:{
    debounce:null//init
   }
  };

  this.props={
   win:$(window),
   doc:$(document),
   delegateCallers:null,//init
   callers:null,
   delegateContainer:null,
   pop:{
    item:null,//init
    closer:null,//init
    viewport:{
     item:null,//init
     paddingRight:null,
     paddingBottom:null
    },
    center:null,//init
    insert:null,//init
    prev:null,//init
    next:null,//init
    zoom:null,//init
    title:null
   },
   overlay:null,//init
   resize:true,
   noResize:{value:false,resize:false},
   shown:false,
   data:[],
   index:0,
   effect:{
    css:{},
    dims:{},
    dimsFlag:false,
    opacity:{}
   },
   swipe:null
  };
 }
 //-----------------
 $.extend(Box.prototype,{
  init:function(){
   var self=this,
    p=self.props.pop;

   self.options=$.extend(true,self.options,{
    helpers:{debounce:function(){throw new Error('No debounce function set! ['+self.getInner('PATH')+']');}}
   },self.data.options);

   self.props=$.extend(true,self.props,{
    overlay:$(self.options.selectors.overlay),
    pop:{
     item:$(self.options.selectors.pop)
    }
   });

   p.closer=p.item.find(self.options.selectors.close);
   p.viewport.item=p.item.find(self.options.selectors.viewport);
   p.center=p.item.find(self.options.selectors.center);
   p.insert=p.item.find(self.options.selectors.insert);
   p.prev=p.item.find(self.options.selectors.prev);
   p.next=p.item.find(self.options.selectors.next);
   p.zoom=p.item.find(self.options.selectors.zoom);

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
  // index===-1:
  // 1) "delegated" container - self.props.data clears every time
  // 2) normal container - when initial call occurs,
  // otherwise we patch self.props.data with the latest data (maybe, href or data attr array have changed)
  parseData:function(obj,index){
   var self=this,
       opts=self.options,
       o={html:'',type:'',caller:obj,width:0,height:0,k:0,fixedWidth:false},
       d=obj.data(opts.data),
       a,x,base;

   if(!d)
   {
    for(x in opts.template)
    {
     if(opts.template.hasOwnProperty(x))
     {
      a=obj.attr(opts.template[x].attr);
      if(a)
       o.html+=opts.template[x].html.replace('['+x+']',a);
     }
    }
    o.type='img';
    if(!~index)
     self.props.data.push(o);else
     self.props.data[index]=o;
   }else
   {
    if($.type(d)!=='array')
     throw new Error('Data must be an array! ['+self.getInner('PATH')+']');

    d.forEach(function(t,i){
     t.caller=obj;
     if(t.hasOwnProperty('href'))
     {
      t.html='';
      for(x in opts.template)
      {
       if(opts.template.hasOwnProperty(x))
       {
        a=t[opts.template[x].attr];
        if(a)
         t.html+=opts.template[x].html.replace('['+x+']',a);
       }
      }
      t.type='img';
     }else
     {
      t.type='html';
     }

     if(!~index)
     {
      self.props.data.push(t);
     }else
     {
      base=self.props.data.indexOf($.grep(self.props.data,function(o){
       return o.caller===t.caller;
      })[0]);
      self.props.data[i+base]=t;
     }
    });
   }
  },
  setData:function(){
   var self=this,
       p=self.props.pop,
       ef=self.props.effect;

   if($.isPlainObject(self.data.callers))
   {
    self.props.callers=null;
    self.props.delegateContainer=$(self.data.callers.container);
   }else
   {
    self.props.callers=$(self.data.callers).each(function(){
     self.parseData($(this),-1);
    });
   }

   p.viewport.paddingRight=parseInt(p.viewport.item.css('right'));
   p.viewport.paddingBottom=parseInt(p.viewport.item.css('bottom'));
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

   if(self.options.effect==='opacity'||self.options.effect==='sim'||self.options.effect==='dimsOpacity')
    p.item.addClass(self.options.transition);

   self.props.dummy=$('<div />').css({left:-5000,top:-5000,position:'absolute'}).appendTo('body');
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
   if(self.props.delegateContainer)
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

   if(self.options.zoomable)
   {
    self.props.pop.zoom.on('click',function(e){
     if(self.props.shown)
     {
      self.props.pop.item.toggleClass(self.options.stretchClass);
      if(self.props.pop.item.hasClass(self.options.stretchClass))
       self.startResize({ini:true});else
       self.stopResize();
     }

     e.preventDefault();
    });
   }

   self.props.pop.prev.on('click',function(e){
    if(self.props.shown)
     self.show({type:'change',dir:'prev'});

    e.preventDefault();
   });
   self.props.pop.next.on('click',function(e){
    if(self.props.shown)
     self.show({type:'change',dir:'next'});

    e.preventDefault();
   });

   self.props.doc.on('keydown',function(e){
    if(self.props.shown&&(e.which===37||e.which===39))
     self.show({type:'change',dir:e.which===37?'prev':'next'});
   });

   self.props.pop.center.on('transitionend webkitTransitionEnd',function(e){
    if(self.props.shown&&self.options.zoomable&&self.props.resize&&$(e.target).is(self.props.pop.center)&&e.originalEvent.propertyName===self.options.fakeTransition.prop)
    {
     self.afterDimsAnim();
    }
   });

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
         self.show({type:'change',dir:'next'});else
         self.show({type:'change',dir:'prev'});
       }
      }
     });
    }
   }
  },
  getIndex:function(obj){
   var self=this;

   return self.props.data.indexOf($.grep(self.props.data,function(o){
    return o.caller.is(obj);
   })[0]);
  },
  setCallers:function(){
   var self=this;

   if(self.props.delegateContainer)
   {
    self.props.delegateContainer.on('click',self.data.callers.selector,function(e){
     self.show({type:'open',caller:$(this)});

     e.preventDefault();
    });
   }else
   {
    self.props.callers.on('click',function(e){
     self.props.index=self.getIndex($(this));
     self.show({type:'open'});

     e.preventDefault();
    });
   }
  },
  setClosers:function(){
   var self=this;

   self.props.pop.closer.add(self.props.overlay).on('click',function(e){self.close();e.preventDefault();});
   self.props.doc.on(self.options.keydownEvent,function(e){
    if(self.props.shown&&e.which===27)
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

   self.trigger(self.options.openEvent,[{caller:opts.caller}]);

   if(opts.type!=='ext'&&self.props.data.length<2)
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

   self.props.overlay.addClass(self.options.transition+' '+self.options.activeClass);

   p.item.addClass(self.options.minClass+' '+self.options.loadingClass);
  },
  getNext:function(opts){
   var self=this,
       curr=self.props.index,
       l=self.props.data.length;

   return opts.dir==='next'?(curr<l-1?curr+1:0):(curr>0?curr-1:l-1);
  },
  noResizeReady:function(d){
   var self=this,
    p=self.props.pop,
    w,h;

   if(self.props.noResize.value&&self.props.noResize.resize)
   {
    w=self.props.dummy.width();
    h=self.props.dummy.height();
    d.k=w/h;
    d.w=w;
    d.h=h;
    p.item.css('overflow','hidden');
    p.item.addClass(self.options.stretchClass);
    self.startResize({ini:false});
    self.props.noResize.value=false;
   }
  },
  calcObj:function(opts_){
   var self=this,
       shown=opts_.shown,
       opts=opts_.opts,
       p=self.props.pop,
       d=self.props.data[self.props.index],
       im,w,h;

   if(opts.data.type==='img')
   {
    im=$(opts.data.html).filter('img');
    im.imagesLoaded(function(e){
     var fail=e.hasAnyBroken;

     self.noResizeReady(d);
     if(fail)
     {
      d.k=1;
      d.w=200;
      d.h=200;
     }else
     {
      d.k=im[0].naturalWidth/im[0].naturalHeight;
      d.w=im[0].naturalWidth;
      d.h=im[0].naturalHeight;
     }

     self.loaded({shown:shown,opts:opts});

     im.remove();
    });
   }else
   {
    if(!opts.data.fixedWidth&&opts.data.noResize)
    {
     self.props.noResize.value=true;
     self.props.noResize.resize=self.props.resize;
     p.item.removeClass(self.options.stretchClass);
     self.stopResize();
    }else
    {
     self.noResizeReady(d);
    }

    if(!opts.data.width||!opts.data.height)
    {
     self.props.dummy.html(opts.data.html);
     w=opts.data.width?opts.data.width:self.props.dummy.width();
     h=opts.data.height?opts.data.height:self.props.dummy.height();
    }else
    {
     w=opts.data.width;
     h=opts.data.height;
    }

    d.k=w/h;
    d.w=w;
    d.h=h;
    p.item.removeClass(self.options.zoomableClass);
    p.item.addClass(self.options.hideCtrlsClass);
    p.item.css('overflow','hidden');

    self.loaded({shown:shown,opts:opts});
   }
  },
  show:function(opts){//opts.type=='ext'->opts.data provided
   var self=this,
       p=self.props.pop,
       shown=self.props.shown;

   p.prev.removeClass(self.options.ctrlHiddenClass);
   p.next.removeClass(self.options.ctrlHiddenClass);

   if(opts.hasOwnProperty('ext')||self.props.delegateContainer)
   {
    if(self.props.delegateContainer)
    {
     if(!shown||self.props.data.length===0||self.props.data.length===1)
     {
      self.props.index=0;
      self.props.data=[];
      self.parseData(opts.caller,-1);
     }
    }else
    {
     self.props.index=opts.index;
     opts.dir=shown&&!opts.hasOwnProperty('dir')?'next':'prev';
     if(!shown)
      opts.caller=self.props.callers.eq(self.props.index);
    }

    opts.type=shown?'change':'open';
   }

   if(opts.type==='open'&&!self.options.circular)
   {
    if(self.props.index===0)
     p.prev.addClass(self.options.ctrlHiddenClass);
    if(self.props.index===self.props.data.length-1)
     p.next.addClass(self.options.ctrlHiddenClass);
   }

   if(opts.type==='change')
   {
    if(self.props.data.length<2)
     return;

    if(!self.options.circular)
    {
     if(opts.dir==='next'&&self.props.index===self.props.data.length-2)
      p.next.addClass(self.options.ctrlHiddenClass);
     if(opts.dir==='prev'&&self.props.index===1)
      p.prev.addClass(self.options.ctrlHiddenClass);

     if(opts.dir==='next'&&self.props.index===self.props.data.length-1||
      opts.dir==='prev'&&self.props.index===0)
      return;
    }

    self.props.index=self.getNext(opts);
   }

   if(!opts.hasOwnProperty('ext')&&!self.props.delegateContainer)
    self.parseData(self.props.data[self.props.index].caller,self.props.index);

   if(opts.type==='open'||opts.type==='change')
    opts.data=self.props.data[self.props.index];

   if(!shown)
    self.open(opts.data);else
    p.item.addClass(self.options.loadingClass);

   p.insert
    .css(self.props.effect.css)
    .removeClass(self.options.trsClasses['opacity']);

   p.item.removeClass(self.options.zoomableClass);

   self.calcObj({shown:shown,opts:opts});
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

   if(opts.opts.data.type==='img')
    p.center.removeClass(self.options.noBgClass);else
    p.center.addClass(self.options.noBgClass);

   if(opts.opts.type==='change')
   {
    self.trigger(self.options.changeEvent,[{}]);
    if(!self.props.resize)
     self.setIniWrapWidth();
   }

   p.item.removeClass(self.options.minClass+' '+self.options.loadingClass);
   if(opts.opts.data.unblock)
    p.item.addClass(self.options.unblockClass);else
    p.item.removeClass(self.options.unblockClass);

   self.insertData(opts.opts.data);

   self.props.data[self.props.index].img=p.insert.css(self.props.effect.css).find(self.options.selectors.image);
   setTimeout(function(){//firefox trs opacity fix
    p.item.removeClass(self.options.hideCtrlsClass);
    self.showAnim();
    if(!self.props.resize)
     self.props.pop.item.css('overflow','auto');
    self.redraw(false);
   },1);
  },
  showAnim:function(){
   var self=this,
       op=self.options.effect==='opacity'||self.options.effect==='sim'||self.options.effect==='dimsOpacity',
       p=self.props.pop;

   if(self.options.effect!=='dimsOpacity')
    p.insert.css(self.props.effect.opacity);
   if(op)
    p.insert.addClass(self.options.trsClasses['opacity']);
  },
  dimsTrs:function(){
   var self=this;

   if(self.options.effect!=='none')
    self.props.pop.center.show().addClass(self.props.effect.cls);
  },
  forDimsOpacity:function(){
   var self=this;

   self.props.pop.insert.css(self.props.effect.opacity);
  },
  afterDimsAnim:function(){
   var self=this,
       d=self.props.data[self.props.index];

   self.trigger(self.options.afterEvent);
   if(d.type==='img')
   {
    if(Math.round(d.img.width())<d.w)
     self.props.pop.item.addClass(self.options.zoomableClass);else
     self.props.pop.item.removeClass(self.options.zoomableClass);
   }

   if(self.options.effect==='dimsOpacity')
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
   var self=this;

   self.props.pop.viewport.item.find(self.options.template.title.selector).remove();
   self.props.pop.insert.html(opts.html);
   if(self.options.titleInto==='viewport')
    self.props.pop.insert.find(self.options.template.title.selector).appendTo(self.props.pop.viewport.item);
  },
  stopResize:function(){
   var self=this;

   self.props.pop.center.removeClass(self.props.effect.cls);
   self.props.resize=false;
   self.redraw(false);
  },
  startResize:function(opts){
   var self=this;

   self.props.resize=true;
   if(opts.ini)
    self.setIniWrapWidth();
   self.redraw(true);
  },
  redrawResized:function(flag){
   var self=this,
       p=self.props.pop,
       w=p.viewport.item.width(),
       h=p.viewport.item.height(),
       k1,
       d=self.props.data[self.props.index],
       k=d.k,
       data={},
       dimsOpacityFlag;

   if(w>d.w)
    w=d.w;
   if(h>d.h)
    h=d.h;
   k1=w/h;

   data.css={left:'50%',top:'50%',padding:0};

   if(!d.fixedWidth)
   {
    if(k1<k)
     data.animate={width:w,height:w/k,marginTop:-w/k/2,marginLeft:-w/2};else
     data.animate={height:h,width:h*k,marginLeft:-h*k/2,marginTop:-h/2};
   }else
   {
    data.animate={width:d.w,height:d.h,marginTop:-d.h/2,marginLeft:-d.w/2};
   }

   if(flag)
   {
    p.center.css(data.css).css(data.animate);
    self.dimsTrs();

    if(d.type==='img'&&!self.props.noResize.value)
    {
     if(Math.round(d.img.width())<d.w)
      p.item.addClass(self.options.zoomableClass);else
      p.item.removeClass(self.options.zoomableClass);
    }
   }else
   {
    if(self.props.effect.dimsFlag)
     self.props.effect.dims=data.animate;

    p.center
     .css(data.css)
     .css(self.props.effect.dimsFlag?{}:data.animate);

    dimsOpacityFlag=p.center.width()===self.props.effect.dims.width&&p.center.height()===self.props.effect.dims.height;
    if(!dimsOpacityFlag)
     self.props.effect.dims[self.options.fakeTransition.prop]=
      p.center.css(self.options.fakeTransition.prop)===self.options.fakeTransition.values[0]?
       self.options.fakeTransition.values[1]:
       self.options.fakeTransition.values[0];
    p.center.css(self.props.effect.dims);

    if(self.options.effect==='none'||self.props.effect.dimsFlag&&dimsOpacityFlag)
     self.afterDimsAnim();
   }
  },
  redrawUnresized:function(){
   var self=this,
       d=self.props.data[self.props.index],
       imgWidth=d.w,
       imgHeight=d.h,
       popWrap1Width=self.props.pop.viewport.item.width(),
       popWrap1Height=self.props.pop.viewport.item.height(),
       popWrap1Wider=popWrap1Width>imgWidth,
       popWrap1Taller=popWrap1Height>imgHeight,
       p=self.props.pop;

   self.props.pop.item.css('overflow','auto');

   if(self.props.data[self.props.index].type==='img')
    p.item.addClass(self.options.zoomableClass);

   p.center.css({
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