/*
 advs:{
 caller:'.advantages .next',
 insert:'.advantages .content',
 ajax:{url:'php.php'},
 action:'html'
 }

 var loader={
 init:function(){
 var u=this.userObject,
 self=this,
 inside=function(){
 if(self.method('getData').ready&&mgr.helpers.doc.height()-mgr.helpers.win.scrollTop()-mgr.helpers.win.height()<u.shift)
 self.method('next');
 };

 setTimeout(inside,u.time);
 mgr.get('lib.utils.winResizeScroll')({
 time:u.time,
 events:'resize scroll',
 inside:inside
 });
 },
 added:function(){
 var u=this.userObject,
 self=this;

 if(self.method('getData').ready&&mgr.helpers.doc.height()-mgr.helpers.win.scrollTop()-mgr.helpers.win.height()<u.shift)
 self.method('next');
 }
 };
*/
(function (factory) {
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
   SiteManager.set({data:'lib.Loader',object:factory(jQuery,SiteManager),lib:false});
  }
 }
}(function($,mgr){
 mgr.extend(Loader);

 function Loader(opts){
  "use strict";
  
  this.options={
   loadingClass:'loading',
   endClass:'end',
   auto:0,
   what:'insert',
   action:'append',
   immediate:false,
   end:'.end',
   ajax:{
    param:'next',
    url:'fake.php',
    type:'GET',
    json:false,
    data:{},
    threshold:200
   }
  };
  
  this.props={
   caller:null,//init
   insert:null,//init
   template:null,//init
   loader:null,
   index:0,
   ready:true,
   ajax:{
    ajax:null,
    t:null
   },
   t:null,
   stop:false
  };
 }
 //-----------------
 $.extend(Loader.prototype,{
  init:function(opts){
   var self=this;

   self.options=$.extend(true,self.options,opts);

   self.props=$.extend(true,self.props,{
    caller:$(opts.caller),
    insert:$(opts.insert),
    template:$(opts.template)
   });

   self.prepare();
  },
  prepare:function(){
   var self=this;

   self.trigger('init');
   if(!self.options.loader)
    self.props.loader=self.props.insert;

   if(self.options.immediate)
   {
    self.next();
   }else
   {
    if(self.options.auto)
     self.auto();
   }

   self.setControls();
  },
  destroy:function(){
   var self=this;
   
   if(self.props.ajax.ajax&&self.props.ajax.ajax.readyState!=4)
    self.props.ajax.ajax.abort();
   clearTimeout(self.props.ajax.t);
   self.props.caller.off('click');
   self.props.loader.removeClass(self.options.loadingClass);
  },
  next:function(){
   var self=this;

   if(self.props.stop)
    return;

   self.trigger('add',[{
    caller:self.props.caller,
    insert:self.props.insert
   }]);
   self.ajax();
  },
  end:function(){
   var self=this;

   self.props.stop=true;
   self.props.caller.addClass(self.options.endClass);
   self.trigger('end',[{
    caller:self.props.caller,
    insert:self.props.insert
   }]);
  },
  setContent:function(opts){
   var self=this;

   self.props[self.options.what][self.options.action](opts.items);
   
   self.trigger('added',[{
    index:self.props.index,
    items:opts.items,
    r:opts.r,
    insert:self.props.insert,
    caller:self.props.caller
   }]);
   
   self.props.index+=1;
   
   if(self.options.auto)
    self.auto();
  },
  auto:function(){
   var self=this;

   self.props.t=setTimeout(function(){
    clearTimeout(self.props.t);
    self.next();
   },self.options.auto);
  },
  getData:function(){
   var self=this;

   return {
    ready:self.props.ready
   };
  },
  ajax:function(){
   var self=this,
       d={};

   self.props.ready=false;
   d[self.options.ajax.param]=self.props.index;
   self.props.loader.addClass(self.options.loadingClass);
   clearTimeout(self.props.ajax.t);
   self.props.ajax.t=setTimeout(function(){
    self.props.ajax.ajax=$.ajax({
     type:self.options.ajax.type||'GET',
     url:self.options.ajax.url,
     data:$.extend(d,self.options.ajax.data),
     success:function(r){
      var $r=$(self.options.ajax.json?Mustache.render(self.props.template.html(),r):r);

      if($r.filter(self.options.end).length||$r.find(self.options.end).length)
      {
       self.props.ready=false;
       self.end();
      }else
      {
       self.props.ready=true;
      }

      self.setContent({items:$r,r:r});

      self.props.loader.removeClass(self.options.loadingClass);
     },
     error:function(){
      self.props.loader.removeClass(self.options.loadingClass);
      self.props.ready=true;
      alert('Проблемы на сервере. Попробуйте позже');
     }
    });
   },self.options.ajax.threshold);
  },
  setControls:function(){
   var self=this;
   
   self.props.caller.on('click',function(e){
    if(!self.props.stop)
    {
     clearTimeout(self.props.t);
     self.next();
    }
    
    e.preventDefault();
   });
  }
 });
  
 return Loader;
}));