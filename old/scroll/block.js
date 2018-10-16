(function (factory){
 'use strict';
 
  if(typeof define==='function'&&define.amd)
  {
   define(['jquery','base','lib/utils','lib/bar'],factory);
  }else
  {
   if('SiteManager' in window)
   {
    if(!SiteManager.lib)
     throw 'SiteManager.lib doesn\'t exist!';
    SiteManager.lib['Block']=factory(jQuery,SiteManager);
   }
  }
}(function($,mgr){
 function Block(opts){
  "use strict";

  var self=this;

  mgr.Base.apply(this,arguments);

  self.options=$.extend(true,{
   horizontal:false,
   scrollClass:'hidden',
   length:0,
   items:'',
   namespace:'.block',
   touch:{
    mult:2,
    mouse:false,
    threshold:5
   }
  },opts);

  self.props={
   wrap:$(opts.wrap),
   block:$(opts.block),
   items:null,
   prop:opts.horizontal?'left':'top',
   coord:opts.horizontal?'pageX':'pageY',
   wrapDim:null,
   blockDim:null,
   down:false,
   scrolling:false,
   wheeling:0,
   value:0,
   start:0,
   coords:{pageX:0,pageY:0},
   hide:false,
   stopResize:false,
   drag:null
  };
  
  init();
  
  function init(){
   self.prepare();
  }
 }
 //-----------------
 mgr.extend(Block);
 //-----------------
 $.extend(Block.prototype,{
  wheel:function(e,delta){
   var self=this,
       pr=self.props.value,
       d;

   if(delta>0&&pr<=0)
    if(pr+self.props.wheeling>0)
     d=0;else
     d=pr+self.props.wheeling;
   if(delta<0&&pr>=self.props.wrapDim-self.props.blockDim)
    if(pr-self.props.wheeling<self.props.wrapDim-self.props.blockDim)
     d=self.props.wrapDim-self.props.blockDim;else
     d=pr-self.props.wheeling;

   self.move({value:d});

   return false;
  },
  stop:function(){
   var self=this;

   self.props.block.stop();
   self.trigger('stop');
  },
  getData:function(){
   var self=this;

   return {
    items:self.props.items,
    wrapDim:self.props.wrapDim,
    blockDim:self.props.blockDim,
    dim:self.props.blockDim-self.props.wrapDim,
    stopResize:self.props.stopResize
   };
  },
  setLength:function(v){
   var self=this;

   self.options.length=v;
  },
  move:function(opts){
   var self=this,
       obj={},
       prop=self.props.prop;

   obj[prop]=opts.value;

   if(opts.select)
   {
    self.props.block.stop().animate(obj,{duration:opts.duration,easing:'linear',step:function(n){
     self.props.value=n;
    }});
   }else
   {
    self.props.value=obj[prop];
    self.props.block.css(obj);
   }

   $.extend(opts,self.getData());
   self.trigger('move',[opts]);
  },
  stopResize:function(f){
   var self=this;

   self.props.stopResize=f;
  },
  prepare:function(){
   var self=this;

   self.props.block.css(self.props.prop,0);
   self.props.items=self.options.items?self.props.block.find(self.options.items):self.props.block.children();

   if(self.options.wheel)
   {
    self.props.wrap.on('mousewheel'+self.options.namespace,function(e,d){
     if(!self.props.hide)
      self.wheel(e,d);

     e.preventDefault();
    });
   }

   self.props.block.on('mousedown'+self.options.namespace,function(){
    if(!self.props.hide)
     self.blockMouseDown();
   });

   self.recalc();

   self.props.touch=new (mgr.get('lib.utils.drag'))($.extend({
    horizontal:self.options.horizontal,
    container:self.props.block,
    downCallback:function(opts){
     if(!self.props.hide)
     {
      self.props.start=opts.e[0][self.props.coord]-self.props.value;
      self.trigger('down');
     }
    },
    dragCallback:function(opts){
     var delta;

     if(!self.props.hide)
     {
      delta=opts.e[0][self.props.coord]-self.props.value-self.props.start;

      self.move({value:delta>0?
       (self.props.value+delta<=0?self.props.value+delta:0):
       (self.props.value+delta>=self.props.wrapDim-self.props.blockDim?
       self.props.value+delta:
       self.props.wrapDim-self.props.blockDim)
      });
     }
    },
    upCallback:function(){
     self.trigger('dragend');
    }
   },self.options.touch));
  },
  documentEnd:function(){
   var self=this;

   self.props.down=false;
   self.stop();
   self.trigger('up');
   self.props.scrolling=false;
   mgr.helpers.doc
    .off('mouseup'+self.options.namespace)
    .off('mousemove'+self.options.namespace);
  },
  blockMouseDown:function(){
   var self=this;

   self.props.down=true;

   mgr.helpers.doc.on('mouseup'+self.options.namespace,function(){
    self.documentEnd();
   }).on('mousemove'+self.options.namespace,function(e){
     self.documentMouseMove(e);
    });
  },
  documentMouseMove:function(e){
   var self=this;

   if(!self.props.down||!self.options.select)
    return;

   var v=e[self.props.coord],
       d,
       pr=Math.abs(self.props.value);

   if(v-self.props.wrap.offset()[self.props.prop]>=0&&v-self.props.wrap.offset()[self.props.prop]<=self.props.wrapDim)
   {
    self.props.scrolling=false;
    self.stop();
    self.trigger('up');
   }
   if(v-self.props.wrap.offset()[self.props.prop]<0&&!self.props.scrolling)
   {
    self.props.scrolling=true;
    d=0;
    self.move({value:d,duration:2*pr,select:true});
   }
   if(v-self.props.wrap.offset()[self.props.prop]>self.props.wrapDim&&!self.props.scrolling)
   {
    self.props.scrolling=true;
    d=-(self.props.blockDim-self.props.wrapDim);
    self.move({value:d,duration:2*(self.props.blockDim-self.props.wrapDim-pr),select:true});
   }
  },
  distribute:function(){
   var self=this,
       s=0,
       items=self.props.items,
       l=items.length<self.options.length?items.length:self.options.length,
       hor=self.options.horizontal,
       prop=hor?'Width':'Height';

   for(var i=0;i<l;i++)
    s+=items.eq(i)['outer'+prop]();

   items
    .filter(':not(:last)')
    .css((hor?'margin-right':'margin-bottom'),(self.props.wrap['inner'+prop]()-s)/(l>1?l-1:1));
  },
  recalc:function(){
   var self=this;

   if(self.options.length)
    self.distribute();

   self.props.wrapDim=self.options.horizontal?self.props.wrap.width():self.props.wrap.height();
   self.props.blockDim=self.options.horizontal?self.props.block.width():self.props.block.height();
   self.props.hide=self.props.blockDim<=self.props.wrapDim;
   self.props.wheeling=self.props.wrapDim/4;

   if(self.props.hide)
    self.props.wrap.addClass(self.options.scrollClass);else
    self.props.wrap.removeClass(self.options.scrollClass);

   self.move({
    value:self.props.hide?
     0:
     self.props.wrapDim-self.props.blockDim>self.props.value?
      self.props.wrapDim-self.props.blockDim:
      self.props.value,
    resize:true,
    hide:self.props.hide
   });
  }
 });
  
 return Block;
}));