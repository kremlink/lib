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
   theApp.set({data:'lib.Box',object:factory(jQuery,theApp),lib:false});
  }
 }
}(function($,mgr){
 mgr.extend(Box);

 function Box(){
  "use strict";

  this.options={
   ss:{
    container:'body',//delegate clicks here
    callers:'.the-box',
    pop:'.the-box-pop',
    close:'.the-box-pop-close',
    vp:'.the-box-pop-vp',
    content:'.the-box-pop-content',
    inner:'.the-box-pop-inner',
    prev:'.the-box-pop-prev',
    next:'.the-box-pop-next',
    title:'.the-box-pop-title'
   },
   cls:{
    active:'active',
    opening:'opening',
    loading:'loading',
    ctrls:'ctrls',
    title:'title'
   },
   evs:{
    click:'click.box',
    resize:'resize.box',
    keydown:'keydown.box'
   },
   fakeProp:'font-size',
   touch:{
    speed:2,
    mult:2,
    enabled:true,
    swipe:null//swipe detection function
   },
   data:{
    data:'data',
    type:'type'
   },
   zoomable:false,//true: future
   initialDims:100,
   effect:{
    type:'sim',
    cls:{none:'',opacity:'op-e',dims:'dims-e',sim:'sim-e'}
   },
   helpers:{
    debounce:null//init
   }
  };

  this.props={
   container:null,
   callers:null,
   pop:{
    item:null,//init
    vp:null,
    content:null,//init
    prev:null,//init
    next:null,//init
    close:null,//init
    title:null
   },
   shown:false,
   data:[],
   index:0,
   fakeIni:10,//font-size, that increments by 1
   helpers:{
    win:$(window),
    doc:$(document)
   }
  };
 }
 //-----------------
 $.extend(Box.prototype,{
  init:function(){
   var self=this,
   ss=self.options.ss;

   self.options=$.extend(true,self.options,{
    helpers:{debounce:function(){throw new Error('No debounce function set! ['+self.get('data').path_+']');}}
   },self.data.options);

   self.props=$.extend(true,self.props,{
    container:$(ss.container),
    pop:{
     item:$(ss.pop),
     vp:$(ss.vp),
     content:$(ss.content),
     inner:$(ss.inner),
     prev:$(ss.prev),
     next:$(ss.next),
     close:$(ss.close),
     title:$(ss.title)
    }
   });

   self.prepare();
  },
  prepare:function(){
   var self=this,
    p=self.props,
    ops=self.options,
    debounce=ops.helpers.debounce(function(){
     self.redraw();
    },200);

   p.pop.inner.css(ops.fakeProp,p.fakeIni);
   p.pop.item.addClass(ops.effect.cls[ops.effect.type]);
   p.helpers.win.on(ops.evs.resize,function(){
    if(p.shown)
     debounce();
   });
   self.trigger('init',[{props:p}]);
   self.setControls();
  },
  show:function(opts){
   var self=this,
    p=self.props,
    ops=self.options;

   if(opts.type==='open')
   {
    p.pop.item.addClass(ops.cls.active+' '+ops.cls.opening+(p.data.length>1?' '+ops.cls.ctrls:''));
    p.pop.inner.css({width:ops.initialDims,height:ops.initialDims});
    self.trigger('open',{activeClass:ops.cls.active});
   }
   if(opts.type==='change')
   {
    if(p.data.length<2)
     return;

    self.props.index=(function(){
     var curr=p.index,
      l=p.data.length;

     return opts.dir==='next'?(curr<l-1?curr+1:0):(curr>0?curr-1:l-1);
    })(self);
   }

   self.insertContent();
  },
  insertContent:function(){
   var self=this,
    p=self.props,
    ops=self.options,
    dfd=$.Deferred(),
    ready=function(){
    var img,
    dat=p.data[p.index];

     p.pop.item.addClass(ops.cls.loading);

     if(!dat.custom)
     {
      img=$('<img />').attr('src',dat.href);
      img.imagesLoaded(function(e){
       p.pop.item.removeClass(ops.cls.loading+' '+ops.cls.opening+' '+ops.effect.cls[ops.effect.type]);
       p.pop.inner.css('opacity',0);
       setTimeout(function(){
        p.pop.item.addClass(ops.effect.cls[ops.effect.type]);
        dfd.resolve();
       },50);
       if(e.hasAnyBroken)
       {
        dat.k=1;
        dat.w=200;
        dat.h=200;
        dat.broken=true;
       }else
       {
        dat.k=img[0].naturalWidth/img[0].naturalHeight;
        dat.w=img[0].naturalWidth;
        dat.h=img[0].naturalHeight;
        img.appendTo(p.pop.inner);
       }
       p.pop.item[(dat.title?'add':'remove')+'Class'](ops.cls.title);
       p.pop.title.html(dat.title);
      });
     }else
     {
      p.pop.item.removeClass(ops.cls.loading+' '+ops.cls.opening+' '+ops.effect.cls[ops.effect.type]);
      p.pop.inner.css('opacity',0);
      setTimeout(function(){
       p.pop.item.addClass(ops.effect.cls[ops.effect.type]);
       dfd.resolve();
      },50);
      dat.w=dat.width;
      dat.h=dat.height;
      p.pop.inner.html(dat.custom);
     }
    };

   p.pop.inner.html('');
   ready();

   $.when(dfd).then(function(){
    self.redraw();
   });
  },
  redraw:function(){
   var self=this,
    p=self.props,
    ops=self.options;

   var w=p.pop.vp.width(),
    h=p.pop.vp.height(),
    d=p.data[p.index],
    anim;

   if(w>d.w)
    w=d.w;
   if(h>d.h)
    h=d.h;

   anim=d.custom?{width:d.w,height:d.h}:(w/h<d.k?{width:w,height:w/d.k}:{height:h,width:h*d.k});
   anim[ops.fakeProp]=++p.fakeIni;
   anim.opacity=1;
   p.pop.inner.css(anim);
  },
  setControls:function(){
   var self=this,
    p=self.props,
    ops=self.options;

   p.container.on(ops.evs.click,ops.ss.callers,function(e){
    var caller=$(this),
     t=caller.data(ops.data.type),
     ctr=0;

    p.data=(function(){
     var arr=[],
     callers=p.container.find(ops.ss.callers);

     callers.filter(function(){
      var obj=$(this);

      return t===obj.data(ops.data.type);
     }).each(function(){
      var obj=$(this),
      d=obj.data(ops.data.data);

      if(caller.is(obj))
       self.props.index=ctr;

      if(!d)
      {
       arr.push({href:obj.attr('href'),title:obj.attr('title')});
       ctr++;
      }else
      {
       d.forEach(function(o){
        arr.push({href:o.href,title:o.title,custom:o.custom,width:o.width,height:o.height});
        ctr++;
       });
      }
     });

     return arr;
    })();

    p.shown=true;
    self.show({type:'open'});
    e.preventDefault();
   });

   p.pop.item.on('click',function(e){
    var target=$(e.target);

    if(target.is(p.pop.item)||target.is(p.pop.vp))//click exactly on these (not on children)
     self.close();
   });

   if(ops.zoomable){}//future

   p.pop.prev.on('click',function(e){
    self.show({type:'change',dir:'prev'});

    e.preventDefault();
   });
   p.pop.next.on('click',function(e){
    self.show({type:'change',dir:'next'});

    e.preventDefault();
   });

   p.helpers.doc.on(ops.evs.keydown,function(e){
    if(p.shown)
    {
     if(e.which===37||e.which===39)
      self.show({type:'change',dir:e.which===37?'prev':'next'});
     if(e.which===27)
      self.close();
    }
   });

   p.pop.close.on('click',function(e){self.close();e.preventDefault();});

   p.pop.content.on('transitionend',function(e){
    var d,w,h;

    if(p.shown&&$(e.target).is(p.pop.inner)&&e.originalEvent.propertyName===ops.fakeProp)
    {
     self.trigger('after');
     d=p.data[p.index];
     if(!d.custom)
     {//future
      /*w=p.pop.vp.width();
      h=p.pop.vp.height();
      p.item[(w<d.w||h<d.h?'add':'remove')+'Class'](ops.cls.zoomable);*/
     }
    }
   });

   if(ops.touch.enabled)
   {
    if(ops.touch.swipe)
    {
     p.swipe=new (ops.touch.swipe)({
      vertical:ops.vertical,
      mult:ops.touch.mult,
      speed:ops.touch.speed,
      container:p.pop.content,
      callback:function(delta){
       if(delta>0)
        self.show({type:'change',dir:'next'});else
        self.show({type:'change',dir:'prev'});
      }
     });
    }
   }
  },
  close:function(){
   var self=this,
    p=self.props,
    ops=self.options;

   p.pop.item.removeClass(ops.cls.active+' '+ops.cls.opening+' '+ops.cls.loading+' '+ops.effect.cls[ops.effect.type]+' '+ops.cls.ctrls+' '+ops.cls.title);
   self.props.shown=false;
   p.pop.inner.css({width:ops.initialDims,height:ops.initialDims,opacity:0});
   self.trigger('close',{activeClass:ops.cls.active});
  },
  destroy:function(){

  }
 });
  
 return Box;
}));