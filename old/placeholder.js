(function (factory) {
 'use strict';
 
  if(typeof define==='function'&&define.amd){
   define(['jquery','base'],factory);
  }else
  {
   factory(jQuery,SiteManager);
  }
}(function($,mgr){
 mgr.lib['Placeholder']=function(opts,func){
  "use strict";
  
  var self=this;
  
  mgr.Base.apply(this,arguments);
  
  self.options=$.extend(true,{
   pClass:'placeholder',
   data:'placeholder'
  },opts);
  
  self.props={
   inputs:$(opts.fields)
  };
  
  init();
  
  function init(){
   self.props.inputs.each(function(){
    var obj=$(this),
        ph=obj.data(self.options.data);
    
    if(ph)
    {
     obj.addClass(self.options.pClass);
     if(!$.trim(obj.val()).length)
      obj.val(ph);
     obj.on('blur',function(){
      if(!$.trim(obj.val()).length)
       obj.val(ph).addClass(self.options.pClass);
     }).on('focus',function(){
      if(ph==$.trim(obj.val()))
       obj.val('').removeClass(self.options.pClass);
     });
    }
   });
  }
 };
 //-----------------
 mgr.extend(mgr.lib['Placeholder']);
 //-----------------
 $.extend(mgr.lib['Placeholder'].prototype,{
   set:function(){
    var self=this;
    
    self.props.inputs.each(function(){
     var obj=$(this),
         ph=obj.data(self.options.data);
     
     if(ph)
     {
      obj.addClass(self.options.pClass);
      obj.val(ph);
     }else
      obj.val('');
    });
   }
  });
  
 return mgr.lib['Placeholder'];
}));