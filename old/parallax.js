/*!by Alexander Kremlev*/
(function (factory){
 'use strict';

 if(typeof define==='function'&&define.amd){
  define(['jquery','base'],factory);
 }else
 {
  if('SiteManager' in window)
  {
   if(!SiteManager.lib)
    throw 'SiteManager.lib doesn\'t exist!';
   SiteManager.lib['Parallax']=factory(jQuery,SiteManager);
  }
 }
}(function($,mgr){
 function Parallax(opts){
  "use strict";

  var self=this;

  mgr.Base.apply(this,arguments);

  self.options=$.extend(true,{
   k:1,
   start:0,
   min:0,
   max:100000,
   type:'scrollTop',
   prop:'top',
   pos:'center',
   bg:true
  },opts);

  self.props={
   what:$(opts.what)
  };

  init();

  function init(){
   self.trigger('init');
   self.prepare();
  }
 }
 //-----------------
 mgr.extend(Parallax);
 //-----------------
 $.extend(Parallax.prototype,{
  setData:function(obj){
   var self=this;

   $.extend(self.options,obj);
  },
  prepare:function(){
   var self=this;

   mgr.helpers.win.on('resize scroll',function(){
    var v,
        t=mgr.helpers.win[self.options.type](),
        obj={};

    v=t>=self.options.min&&t<=self.options.max?t:(t<self.options.min?self.options.min:self.options.max);

    if(self.options.bg)
    {
     self.props.what.css('backgroundPosition',self.pos());
    }else
    {
     obj[self.options.prop]=v*self.options.k+self.options.start;
     self.props.what.css(obj);
    }
   });
  },
  pos:function(){
   var self=this,
       v=mgr.helpers.win[self.options.type]()*self.options.k+self.options.start;

   if(self.options.prop=='top')
    return self.options.pos+' '+v+'px';else
    return v+'px '+self.options.pos;
  }
 });

 return Parallax;
}));