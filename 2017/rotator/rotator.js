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
   SiteManager.set({data:'lib.Rotator',object:factory(jQuery,SiteManager),lib:false});
  }
 }
}(function($,mgr){
 mgr.extend(Rotator);

 function Rotator(){
  "use strict";
  
  this.options={
   amount:1,
   disabledClass:'hidden',
   activeClass:'active',
   auto:0,
   hover:false
  };

  this.props={
   prev:null,//init
   next:null,//init
   items:null,//init
   container:null,//init
   index:0,
   active:null,
   length:null,
   changeable:null,
   direction:'forward',
   t:null,
   pause:false,
   hover:false
  };
 }
 //-----------------
 $.extend(Rotator.prototype,{
  init:function(opts){
   var self=this;

   self.options=$.extend(true,self.options,opts);

   self.props=$.extend(true,self.props,{
    prev:$(opts.prev),
    next:$(opts.next),
    items:$(opts.items),
    container:$(opts.container)
   });

   self.prepare();
   self.change('forward');
  },
  prepare:function(){
   var self=this;

   self.props.items=self.options.items?self.props.container.find(self.options.items):self.props.container.children();
   self.trigger('init',[{items:self.props.items}]);
   
   self.props.length=self.props.items.length;
   if(self.props.length<=self.options.amount)
   {
    self.props.prev.addClass(self.options.disabledClass);
    self.props.next.addClass(self.options.disabledClass);
    self.options.auto=0;
   }

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
    self.props.active=null;

   for(var i=0;i<self.props.length;i++)
   {
    if(j<self.options.amount)
    {
     inds[i]=(self.props.index+i>=self.props.length)?
      self.props.index-self.props.length+i:
      self.props.index+i;
     j++;
     obj=self.props.items.eq(inds[i]);
     self.props.active=self.props.active?self.props.active.add(obj):obj;
    }
   }

   self.props.items.removeClass(self.options.activeClass);
   self.props.active.addClass(self.options.activeClass);

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