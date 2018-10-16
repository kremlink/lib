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
   SiteManager.lib['Map']=factory(jQuery,SiteManager);
  }
 }
}(function($,mgr){
 function Constructor(opts){
  "use strict";

  var self=this;

  mgr.Base.apply(this,arguments);

  self.options=$.extend(true,{

  },opts);

  self.props={

  };

  init();

  function init(){

  }
 }
 //-----------------
 mgr.extend(Constructor);
 //-----------------
 $.extend(Constructor.prototype,{

 });

 return Constructor;
}));