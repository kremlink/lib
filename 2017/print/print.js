/*!by Alexander Kremlev*/
(function (factory){
 'use strict';

 if(typeof define==='function'&&define.amd){
  define(['jquery','base'],factory);
 }else
 {
  if('theApp' in window)
  {
   if(!theApp.lib)
    throw 'theApp.lib doesn\'t exist!';
   theApp.set({data:'lib.Print',object:factory(jQuery,theApp),lib:false});
  }
 }
}(function($,mgr){
 mgr.extend(Print);

 function Print(){
  "use strict";

  this.options={
   css:{base:'',type:''},
   activeClass:'active',
   printClass:'print-frame',
   iframeClass:'printer-iframe',
   what:function(opts){return opts.container;}
  };

  self.props={
   callers:null,
   container:null,
   iframe:null,//init
   t:0,
   cssType:null//init
  };
 }
 //-----------------
 $.extend(Print.prototype,{
  init:function(opts){
   var self=this;

   self.options=$.extend(true,self.options,opts);

   self.props=$.extend(true,self.props,{
    iframe:$('<iframe frameborder="0" class="'+self.options.iframeClass+'"></iframe>').appendTo('body'),
    cssType:self.options.css.type
   });

   self.prepare();
  },
  prepare:function(){
   var self=this;

   if($.isPlainObject(self.options.callers))
    self.props.container=$(self.options.callers.container);else
    self.props.callers=$(self.options.callers);

   self.props.iframe.contents().find('html').addClass(self.options.printClass);
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
  setObject:function(obj){
   var self=this;
   self.options.what=function(){
    return obj;
   };
  },
  setCss:function(css){
   var self=this;

   self.props.cssType=css;
  },
  print:function(opts){
   var self=this,
    cts=self.props.iframe.contents();

   if(!opts.what)
    throw 'Nothing to print';

   if(!opts.caller.hasClass(self.options.activeClass))
   {
    cts.find('head').html('').append('<link rel="stylesheet" href="'+self.options.css.base+'" />');
    if(self.props.cssType)
     cts.find('head').append('<link rel="stylesheet" href="'+self.props.cssType+'" />')
    cts.find('body').html('').append(opts.what.clone());
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