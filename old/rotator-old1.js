/*
 var rotatorInit=function(s){
 var d=mgr.get(s),
 into=$(d.into),
 t=[];

 into.find(d.what).each(function(){
 t.push($(this).attr('src'));
 });

 mgr.get('lib.utils.srcToTags')(t).imagesLoaded(function(){
 into.addClass('loaded');
 mgr.setObject('contacts.rotator','Rotator',{
 on:rotator
 });
 });
 };

 var rotator={
 show:function(e,opts){
 var u=this.userObject;

 opts.active.show().addClass(u.cls);
 }
 };

 rotatorInit('data.contacts.rotator-init');

 rotator:{
 container:'.page.contacts .into',
 items:'a',
 //auto:5000,
 amount:5,
 hover:true,
 activeClass:'active1',
 userObject:{
 cls:'shown'
 }
 }
*/

/*! By Alexander Kremlev*/

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
   SiteManager.lib['Rotator']=factory(jQuery,SiteManager);
  }
 }
}(function($,mgr){
 function Rotator(opts,func){
  "use strict";
  
  var self=this;
  
  mgr.Base.apply(this,arguments);
  
  self.options=$.extend(true,{
   amount:1,
   disabledClass:'hidden',
   activeClass:'active',
   what:'append',
   auto:0,
   hover:false
  },opts);
  
  self.props={
   prev:$(opts.prev),
   next:$(opts.next),
   items:$(opts.items),
   container:$(opts.container),
   index:0,
   active:null,
   length:null,
   changeable:null,
   direction:'forward',
   t:null,
   pause:false,
   hover:false
  };
  
  init();
  
  function init(){
   self.props.items=opts.items?self.props.container.find(opts.items):self.props.container.children();
   self.trigger('init',[{items:self.props.items}]);
   self.prepare();
   self.change('forward');
  }
 }
 //-----------------
 mgr.extend(Rotator);
 //-----------------
 $.extend(Rotator.prototype,{
  prepare:function(){
   var self=this;

   self.props.length=self.props.items.length;
   if(self.props.length<=self.options.amount)
   {
    self.props.prev.addClass(self.options.disabledClass);
    self.props.next.addClass(self.options.disabledClass);
    self.options.auto=0;
   }
   self.props.items.detach();

   self.props.prev.on('click',function(e){
    clearTimeout(self.props.t);
    self.prevClick();

    e.preventDefault();
   });

   self.props.next.on('click',function(e){
    clearTimeout(self.props.t);
    self.nextClick();

    e.preventDefault();
   });

   self.props.container.on('mouseenter',function(){
    if(self.options.hover)
    {
     clearTimeout(self.props.t);
     self.props.hover=true;
    }
   }).on('mouseleave',function(){
     if(self.options.hover)
     {
      self.props.hover=false;
      self.auto();
     }
    });
  },
  prevClick:function(){
   var self=this;

   if(self.props.direction=='forward')
   {
    self.props.index=self.props.index-(2*self.options.amount)%self.props.length;
    if(self.props.index<0)
     self.props.index=self.props.length+self.props.index;
   }

   self.props.direction='back';
   self.change('back');
  },
  nextClick:function(){
   var self=this;

   if(self.props.direction=='back')
    self.props.index=(self.props.index+2*self.options.amount)%self.props.length;
   self.props.direction='forward';
   self.change('forward');
  },
  change:function(dir){
   var self=this;

   self.show(dir);
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
     self.change('forward');
    },self.options.auto);
  },
  show:function(dir){
   var self=this,
       j=0,
       inds=[],
       obj;

   if(self.props.active)
   {
    self.props.active.remove();
    self.props.active=null;
   }

   for(var i=0;i<self.props.length;i++)
   {
    if(j<self.options.amount)
    {
     inds[i]=(self.props.index+i>=self.props.length)?
      self.props.index-self.props.length+i:
      self.props.index+i;
     j++;
     obj=self.props.items.eq(inds[i]).clone(true);
     self.props.active=self.props.active?self.props.active.add(obj):obj;
    }
   }

   self.props.container[self.options.what](self.props.active.addClass(self.options.activeClass));

   self.trigger('show',{
    items:self.props.items,
    active:self.props.active,
    index:self.props.index,
    indices:inds
   });
   
   if(dir=='forward')
   {
    self.props.index=(self.props.index+self.options.amount)%self.props.length;
   }else
   {
    self.props.index=(self.props.index-self.options.amount)%self.props.length;
    if(self.props.index<0)
     self.props.index=self.props.length+self.props.index;
   }

   if(self.options.auto)
    self.auto();
  }
 });
  
 return Rotator;
}));