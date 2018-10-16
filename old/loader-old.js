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
   SiteManager.lib['Loader']=factory(jQuery,SiteManager);
  }
 }
}(function($,mgr){
 function Loader(opts){
  "use strict";
  
  var self=this;
  
  mgr.Base.apply(this,arguments);
  
  self.options=$.extend(true,{
   loadingClass:'loading',
   endClass:'end',
   noajax:false,
   auto:0,
   by:1,
   method:'replace',
   what:'insert',
   dest:'append',
   immediate:false,
   end:{find:'.end',data:'end'},
   ajax:{param:'next',url:'fake.php',type:'GET',data:{}}
  },opts);
  
  self.props={
   caller:$(opts.caller),
   insert:$(opts.insert),
   loader:$(opts.loader),
   data:$(opts.data),
   index:0,
   ajax:null,
   t:null,
   clone:null,
   stop:false
  };
  
  self.props.len=self.props.data.length;
  self.props.clone=self.options.method=='replace'&&self.options.noajax?self.props.data.clone():null;
  
  init();
  
  function init(){
   if(self.options.immediate)
   {
    self.next();
   }else
   {
    if(self.options.auto)
     self.auto();
   }
   
   self.setControls();
  }
 }
 //-----------------
 mgr.extend(Loader);
 //-----------------
 $.extend(Loader.prototype,{
  destroy:function(){
   var self=this;
   
   if(self.props.ajax&&self.props.ajax.readyState!=4)
    self.props.ajax.abort();
   self.props.caller.off('click');
   self.props.loader.removeClass(self.options.loadingClass);
  },
  next:function(){
   var self=this;
   
   self.trigger('add',[{insert:self.props.insert}]);
   if(self.options.noajax)
    self.setContent('');else
    self.ajax();
  },
  getElements:function(){
   var self=this;
   
   if(self.options.method=='replace')
   {
    if(self.props.index+self.options.by<=self.props.len)
    {
     return self.props.clone.filter(function(i){
      return i>=self.props.index&&i<self.props.index+self.options.by;
     });
    }
    
    return self.props.clone.filter(function(i){
     return self.props.index+self.options.by>self.props.len&&i>=self.props.index;
    }).add(self.props.clone.filter(function(i){
     return self.props.index+self.options.by>self.props.len&&i<self.props.index+self.options.by-self.props.len;
    }));
   }else
   {
    return self.props.data.filter(function(i){
     return i>=self.props.index&&i<self.props.index+self.options.by;
    });
   }
  },
  end:function(){
   var self=this;

   self.props.stop=true;
   self.props.caller.addClass(self.options.endClass);
   self.trigger('end',[{caller:self.props.caller}]);
  },
  setContent:function(ajaxed){
   var self=this;
   
   if(self.options.noajax)
   {
    if(self.options.method=='replace')
     self.props.insert.html('').append(self.getElements());else
     self.props[self.options.what][self.options.dest](self.getElements());
    
    if(self.options.method!='replace'&&self.props.data.eq(self.props.len-1).closest(self.props.insert).length)
     self.end();
   }else
   {
    if(self.options.method=='replace')
    {
     self.props.insert.html(ajaxed);
    }else
    {
     self.props[self.options.what][self.options.dest](ajaxed);
    }
   }
   
   self.trigger('added',[{index:self.props.index,items:ajaxed||self.getElements(),insert:self.props.insert}]);
   
   if(self.options.noajax)
    self.props.index=(self.props.index+=self.options.by)%self.props.len;else
    self.props.index+=self.options.by;
   
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
  ajax:function(){
   var self=this,
       d={};

   d[self.options.ajax.param]=self.props.index+1;
   if(self.props.ajax&&self.props.ajax.readyState!=4)
    self.props.ajax.abort();
   self.props.loader.addClass(self.options.loadingClass);
   
   self.props.ajax=$.ajax({
    type:self.options.ajax.type||'GET',
    url:self.options.ajax.url,
    data:$.extend(d,self.options.ajax.data),
    success:function(r){
     var $r=$(r);

     self.setContent($r);
     if($r.filter(self.options.end.find).data(self.options.end.data))
      self.end();
     self.props.loader.removeClass(self.options.loadingClass);
    },
    error:function(){
     self.props.loader.removeClass(self.options.loadingClass);
     alert('Проблемы на сервере. Попробуйте позже');
    }
   });
  },
  setControls:function(){
   var self=this;
   
   self.props.caller.on('click',function(e){
    if(!self.props.stop)
    {
     clearTimeout(self.props.t);
     self.trigger('add',[{insert:self.props.insert}]);
     self.next();
    }
    
    e.preventDefault();
   });
  }
 });
  
 return Loader;
}));