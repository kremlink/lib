/*
 */

(function (factory){
 'use strict';
 
 if(typeof define==='function'&&define.amd)
 {
  define(['jquery','base'],factory);
 }else
 {
  if('SiteManager' in window)
  {
   if(!SiteManager.lib)
    throw 'SiteManager.lib doesn\'t exist!';
   SiteManager.lib['Bar']=factory(jQuery,SiteManager);
  }
 }
}(function($,mgr){
 function Bar(opts){
  "use strict";

  var self=this;

  mgr.Base.apply(this,arguments);

  self.options=$.extend(true,{
   clickable:null,
   horizontal:false,
   resize:false,
   steps:0,
   hideClass:'hidden',
   namespace:'.bar',
   value:[]
  },opts);

  self.props={
   container:null,
   bar:$(opts.bar),
   holder:$(opts.holder),
   prop:opts.horizontal?'left':'top',
   coord:opts.horizontal?'pageX':'pageY',
   holderDim:null,
   barDim:null,
   bounds:null,
   start:null,
   value:[],
   steps:0,
   active:0,
   stepsValues:[],
   body:$('body'),
   stopResize:false
  };
  
  init();
  
  function init(){
   self.prepare();
   self.setDims();
   self.setIniValues();
   self.trigger('init',[{bounds:self.props.bounds}]);
  }
 }
 //-----------------
 mgr.extend(Bar);
 //-----------------
 $.extend(Bar.prototype,{
  showHide:function(f){
   var self=this;

   if(!f)
    self.props.holder.addClass(self.options.hideClass);else
    self.props.holder.removeClass(self.options.hideClass);
  },
  setIniValues:function(){
   var self=this;

   if(self.options.value.length)
    self.setPosition({value:self.options.value});
  },
  setDims:function(){
   var self=this;

   self.props.holderDim=self.options.horizontal?self.props.holder.innerWidth():self.props.holder.innerHeight();
   self.props.barDim=self.options.horizontal?self.props.bar.innerWidth():self.props.bar.innerHeight();
   self.props.bounds=[0,self.props.holderDim-self.props.barDim];
   self.setSteps(self.options.steps);
  },
  setSteps:function(l){
   var self=this;

   self.props.steps=l;
   for(var i=0;i<l;i++)
    self.props.stepsValues[i]=i==l-1?self.props.bounds[1]:i*self.props.bounds[1]/(l-1);
  },
  resize:function(){
   var self=this,
       old=self.props.bounds[1];

   self.setDims();
   self.setPosition({resize:true,max:old});
  },
  getData:function(){
   var self=this;

   return {
    value:self.props.value,
    bar:self.props.bar,
    bounds:self.props.bounds,
    holderDim:self.props.holderDim,
    barDim:self.props.barDim
   };
  },
  fix:function(j){
   var self=this,
       val=self.props.value[j];

   for(var i=0;i<self.props.steps;i++)
   {
    if(self.props.stepsValues[i]>=val)
     break;
   }

   if(!i)
   {
    self.props.value[j]=self.props.stepsValues[i];
   }else
   {
    if(self.props.stepsValues[i]-val<=val-self.props.stepsValues[i-1])
     self.props.value[j]=self.props.stepsValues[i];else
     self.props.value[j]=self.props.stepsValues[i-1];
   }
  },
  stop:function(){
   var self=this;

   self.props.bar.stop();
  },
  setBarDim:function(w){
   var self=this;

   self.props.bar.each(function(i){
    $(this)[self.options.horizontal?'width':'height'](w[i]);
   });

   self.setDims();
  },
  setPosition:function(opts){
   var self=this,
       max=self.props.bounds[1],
       obj={},
       prop=self.props.prop;

   if('value' in opts)
    self.props.value=opts.value.slice();

   self.props.bar.each(function(i){
    var o=$(this);

    if('max' in opts)
     self.props.value[i]=self.props.value[i]*max/opts.max;

    if(self.props.value[i]>max)
     self.props.value[i]=max;

    if(self.options.steps)
     self.fix(i);

    obj[prop]=self.props.value[i];

    if(opts.select)
     o.stop().animate(obj,{duration:opts.duration,easing:'linear'});else
     o.css(obj);
   });

   self.trigger('change',[{
    value:self.props.value,
    bar:self.props.bar,
    drag:opts.drag,
    bounds:self.props.bounds,
    resize:opts.resize,
    external:opts.external
   }]);
  },
  stopResize:function(f){
   var self=this;

   self.props.stopResize=f;
  },
  prepare:function(){
   var self=this;

   self.props.bar.css(self.props.prop,0).each(function(i){
    self.props.value[i]=0;
   });

   self.props.container=self.options.container?$(self.options.container):self.props.holder;

   self.props.container.on('mousedown',function(e){
    self.containerMouseDown(e);
   });

   self.props.bar.on('touchstart mousedown',function(e){
    self.barStart(e,$(this));
   });

   if(self.options.resize)
   {
    mgr.get('lib.utils.winResizeScroll')({
     events:'resize'+self.options.namespace,
     inside:function(){
      if(!self.props.stopResize)
       self.resize();
     },
     time:200
    });
   }
  },
  barStart:function(e,obj){
   var self=this;

   self.props.active=self.props.bar.index(obj);
   self.props.start=(e.originalEvent.touches?e.originalEvent.touches[0][self.props.coord]:e[self.props.coord])-self.props.value[self.props.active];

   self.props.body.on('selectstart'+self.options.namespace,function(){return false;});
   mgr.helpers.doc.on('touchmove'+self.options.namespace+' mousemove'+self.options.namespace,function(e){
    self.documentMove(e);

    e.preventDefault();
   }).on('touchend'+self.options.namespace+' mouseup'+self.options.namespace,function(){
    self.documentEnd();
   });
  },
  documentMove:function(e){
    var self=this,
        d,
        delta,
        bds=self.props.bounds;

   d=(e.originalEvent.touches?e.originalEvent.touches[0][self.props.coord]:e[self.props.coord]);
   delta=d-self.props.start;

   self.props.value[self.props.active]=(delta>=bds[0]&&delta<=bds[1])?delta:(delta<bds[0]?bds[0]:bds[1]);
   self.setPosition({drag:true});
  },
  documentEnd:function(){
   var self=this;

   self.props.body.off('selectstart'+self.options.namespace);
   mgr.helpers.doc
    .off('touchmove'+self.options.namespace+' mousemove'+self.options.namespace)
    .off('touchend'+self.options.namespace+' mouseup'+self.options.namespace);
  },
  containerMouseDown:function(e){
   var self=this,
       c,
       what,
       d,
       target=$(e.target);

   if(target.is(self.props.holder)||self.options.clickable&&target.is(self.options.clickable))
   {
    d=e[self.props.coord]-self.props.holder.offset()[self.props.prop];
    c=10000;

    what=self.props.bar.eq(0);

    if(self.props.bar.length!=1)
    {
     self.props.bar.each(function(i){
      var obj=$(this),
          between=Math.abs(d-self.props.value[i]);

      if(between<c)
      {
       what=obj;
       c=between;
      }
     });
    }

    self.props.active=self.props.bar.index(what);
    d-=self.props.barDim/2;

    if(d<self.props.bounds[0])
     d=self.props.bounds[0];
    if(d>self.props.bounds[1])
     d=self.props.bounds[1];

    self.props.value[self.props.active]=d;

    self.setPosition({});
   }
  }
 });
  
 return Bar;
}));