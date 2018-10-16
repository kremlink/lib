(function (factory) {
 'use strict';
 
  if(typeof define==='function'&&define.amd){
   define(['jquery','base'],factory);
  }else
  {
   factory(jQuery,SiteManager);
  }
}(function($,mgr){
 mgr.lib['Save']=function(opts){
  "use strict";
  
  var self=this;
  
  mgr.Base.apply(this,arguments);
  
  self.options=$.extend(true,{
   
  },opts);
  
  self.props={
   
  };
  
  init();
  
  function init(){
   self.trigger('init');
  }
 };
 //-----------------
 mgr.extend(mgr.lib['Save']);
 //-----------------
 $.extend(mgr.lib['Save'].prototype,{
  save:function(data){
   for(var x in data)
    if(data._type=='session')
     sessionStorage[x]=data[x];else
     localStorage[x]=data[x];
  }
 });
  
 return mgr.lib['Save'];
}));