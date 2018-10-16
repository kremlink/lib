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
   theApp.set({data:'lib.Parallax',object:factory(jQuery,theApp),lib:false});
  }
 }
}(function($,mgr){
 mgr.extend(Parallax);

 function Parallax(){//TODO: start:{x:,y:},prop:'top/left/both'
  "use strict";

  this.options={
   k:1,
   start:0,
   min:0,
   max:100000,
   type:'scrollTop',
   prop:'top',
   pos:'center',
   mouse:false
  };

  this.props={
   what:null,//init
   win:$(window)
  };
 }
 //-----------------
 $.extend(Parallax.prototype,{
  init:function(opts){
   var self=this;

   self.options=$.extend(true,self.options,opts);

   self.props=$.extend(true,self.props,{
    what:$(opts.what)
   });

   if(self.options.mouse)
   {
    self.options.prop='transform';
    self.options.bg=false;
   }

   self.trigger('init');
  },
  getValue:function(v){
   var self=this;

   return v*self.options.k+self.options.start;
  },
  move:function(opts){
   var self=this,
    v,
    t=self.props.win[self.options.type](),
    obj={};

   if(opts&&opts.bg)
   {
    self.props.what.css('backgroundPosition',self.pos(self.getValue(t)));
   }else
   {
    v=t>=self.options.min&&t<=self.options.max?t:(t<self.options.min?self.options.min:self.options.max);

    obj[self.options.prop]=self.options.mouse?
    'translate('+self.getValue(opts.x)+'px,'+self.getValue(opts.y)+'px)':
     self.getValue(v);

    self.props.what.css(obj);
   }
  },
  pos:function(v){
   var self=this;

   if(self.options.prop=='top')
    return self.options.pos+' '+v+'px';else
    return v+'px '+self.options.pos;
  }
 });

 return Parallax;
}));