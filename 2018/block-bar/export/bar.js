
export class Bar{
 "use strict";

 options={
  clickable:null,
  horizontal:false,
  steps:0,
  hideClass:'hidden',
  namespace:'.bar',
  value:[],
  touch:{
   mult:2,
   threshold:5
  },
  helpers:{
   drag:null//drag detection function
  }
 };

 props={
  container:null,
  bar:null,//init
  holder:null,//init
  prop:null,//init
  coord:null,//init
  holderDim:null,
  barDim:null,
  bounds:null,
  start:null,
  value:[],
  steps:0,
  active:0,
  stepsValues:[],
  body:$('body'),
  stopResize:false,
  drag:null
 };
}
//-----------------
$.extend(Bar.prototype,{
 init:function(){

  var self=this;

  self.options=$.extend(true,self.options,self.data.options);

  self.props=$.extend(true,self.props,{
   bar:$(self.data.bar),
   holder:$(self.data.holder),
   prop:self.options.horizontal?'left':'top',
   coord:self.options.horizontal?'pageX':'pageY'
  });

  self.prepare();
  self.setDims();
  self.setIniValues();
  self.trigger('init',[{bounds:self.props.bounds}]);
 },
 destroy:function(){
  var self=this;

  self.props.container.off('mousedown'+self.options.namespace);
  $(document).off('mouseup'+self.options.namespace);
  self.props.touch.disable();
 },
 showHide:function(f){
  var self=this;

  if(!f)
   self.props.holder.addClass(self.options.hideClass);else
   self.props.holder.removeClass(self.options.hideClass);
 },
 setIniValues:function(){
  var self=this;

  if(self.options.value.length)
   self.setPosition({value:self.options.value,ini:true});
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
   self.props.stepsValues[i]=i===l-1?self.props.bounds[1]:i*self.props.bounds[1]/(l-1);
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
   barDim:self.props.barDim,
   stopResize:self.props.stopResize,
   container:self.props.container
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
   min=self.props.bounds[0],
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
   if(self.props.value[i]<min)
    self.props.value[i]=min;

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
   ini:opts.ini,
   external:opts.external,
   data:opts.data
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

  self.props.container=self.data.container?$(self.data.container):self.props.holder;

  self.props.container.on('mousedown'+self.options.namespace,function(e){
   self.containerMouseDown(e);
  });

  $(document).on('mouseup'+self.options.namespace,function(){
   self.trigger('up');
  });

  if(!self.options.helpers.drag)
   throw new Error('No drag handler set! ['+self.get('data').path_+']');

  self.props.touch=new (self.options.helpers.drag)($.extend({
   horizontal:self.options.horizontal,
   container:self.props.bar,
   mouse:true,
   downCallback:function(opts){
    self.props.active=opts.index;
    self.props.start=opts.e[0][self.props.coord]-self.props.value[opts.index];
    self.trigger('down',[{
     active:self.props.active
    }]);
   },
   dragCallback:function(opts){
    var delta,
     bds=self.props.bounds;

    delta=opts.e[0][self.props.coord]-self.props.start;
    self.props.value[self.props.active]=(delta>=bds[0]&&delta<=bds[1])?delta:(delta<bds[0]?bds[0]:bds[1]);
    self.setPosition({drag:true});
   },
   upCallback:function(){
    self.trigger('dragend');
    self.trigger('up');
   }
  },self.options.touch));
 },
 containerMouseDown:function(e){
  var self=this,
   c,
   what,
   d,
   target=$(e.target);

  if(target.is(self.props.holder)||self.options.clickable&&target.closest(self.options.clickable).length)
  {
   d=e[self.props.coord]-self.props.holder.offset()[self.props.prop];
   //if(mobile and zoomed)
   //d+=mgr.helpers.doc['scroll'+self.props.prop.replace(/(?:^|\s)\S/g,function(a){return a.toUpperCase();})]();
   c=10000;

   what=self.props.bar.eq(0);

   self.trigger('paneClick');

   if(self.props.bar.length!==1)
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