/*!by Alexander Kremlev*/
/*
 .printer-iframe{
 @include abs($t:0,$l:0);
 width:0;
 height:0;
 }

 print:{
 callers:{container:'.my-orders-all',selector:'.block.i4'},
 iframe:'<iframe frameborder="0" class="printer-iframe"></iframe>',
 css:null,
 userObject:{
 closest:'.item',
 shown:'shown'
 }
 }

 var print=function(opts){
 var u=this.userObject,
 c;

 opts.caller.closest(u.closest).addClass(u.shown);
 c=opts.container.clone();
 opts.caller.closest(u.closest).removeClass(u.shown);

 return c;
 };

 mgr.setObject('my-orders.table.print','Print',{
 what:print
 });
 */
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
   SiteManager.lib['Print']=factory(jQuery,SiteManager);
  }
 }
}(function($,mgr){
 function Print(opts){
  "use strict";

  var self=this;

  mgr.Base.apply(this,arguments);

  self.options=$.extend(true,{
   css:'',
   activeClass:'active',
   printClass:'print-frame',
   what:function(_opts){return _opts.container;}
  },opts);

  self.props={
   callers:null,
   container:null,
   iframe:$(opts.iframe).appendTo('body'),
   t:null
  };

  init();

  function init(){
   self.prepare();
  }
 }
 //-----------------
 mgr.extend(Print);
 //-----------------
 $.extend(Print.prototype,{
  prepare:function(){
   var self=this;

   if($.isPlainObject(self.options.callers))
    self.props.container=$(self.options.callers.container);else
    self.props.callers=$(self.options.callers);

   self.props.iframe.contents().find('html').addClass(self.options.printClass).end()
    .find('head').append('<link rel="stylesheet" href="'+self.options.css+'" />');
   if(self.props.container)
   {
    self.props.container.on('click',self.options.callers.selector,function(e){
     var obj=$(this);

     self.print({
      caller:obj,
      what:self.options.what.apply(self,[{caller:obj,container:self.props.container}])
     });

     e.preventDefault();
    });
   }else
   {
    self.props.callers.on('click',function(e){
     var obj=$(this);

     self.print({caller:obj,what:self.options.what.apply(self,[obj])});

     e.preventDefault();
    });
   }
  },
  print:function(opts){
   var self=this;

   if(!opts.what)
    throw 'Nothing to print';

   if(!opts.caller.hasClass(self.options.activeClass))
   {
    self.props.iframe.contents().find('body').html('').append(opts.what.clone());
    opts.caller.addClass(self.options.activeClass);
    clearTimeout(self.props.t);
    self.props.t=setTimeout(function(){
     opts.caller.removeClass(self.options.activeClass);
     self.props.iframe.get(0).contentWindow.focus();
     self.props.iframe.get(0).contentWindow.print();
    },1000);
   }
  }
 });

 return Print;
}));