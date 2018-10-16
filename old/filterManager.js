(function (factory) {
 'use strict';
 
  if(typeof define==='function'&&define.amd){
   define(['jquery','base','lib/toggle'],factory);
  }else
  {
   factory(jQuery,SiteManager,Mustache);
  }
}(function($,mgr,mustache){
 mgr.lib['FilterManager']=function(opts){
  "use strict";
  
  var self=this;
  
  mgr.Base.apply(this,arguments);
  
  self.props={
   blocks:$(opts.blocks),
   refs:$(opts.refs),
   insert:null,
   template:$(opts.ajax.template),
   toggles:[],
   params:null,
   page:null,
   iniFlag:true,
   dat:{},
   ajax:null
  };
  
  self.setParams=function(opts_){
   self.props.params=opts_.params;
   self.props.page=opts_.page;
   self.props.insert=$(opts.ajax.insert[self.props.page]);
   self.props.url=opts.ajax.url[self.props.page];
  };
  
  self.hide=function(opts_){
   self.trigger('done',[{page:self.props.page,show:opts_.show,index:opts_.index,req:opts_.req}]);
  };
  
  var show=function(e,opts_){
   var u=this.options.userObject;
   
   self.props.dat[self.props.params[u.index]]=opts_.caller.data(opts.data);
   
   if(self.props.iniFlag&&u.index<self.props.refs.length-1)
    return;
   
   self.props.iniFlag=false;
   
   self.props.insert.addClass('loading');
      
   if(opts_.activeClick)
   {
    self.hide({show:false,index:u.index});
    self.props.insert.removeClass('loading');
   }else
   {
    if(self.props.ajax&&self.props.ajax.readyState!=4)
     self.props.ajax.abort();
    self.props.ajax=$.ajax({
     url:self.props.url,
     data:self.props.dat,
     dataType:'json',
     success:function(r){
      self.hide({show:true,index:u.index,req:r});
      self.props.refs.eq(u.index).text(opts_.caller.text());
      self.props.insert.removeClass('loading');
     },
     error:function(){
      self.props.insert.removeClass('loading');
     }
    });
   }
  };
  
  init();
  
  function init(){
   self.trigger('init');
   
   self.props.blocks.each(function(i){
    var obj=$(this);
    
    self.props.toggles.push(new mgr.lib['Toggle']({
     callers:obj.find(opts.callers),
     activeClick:opts.activeClick,
     alone:opts.alone,
     userObject:{
      index:i
     },
     on:{'show':show}
    }));
   });
  }
 };
 //-----------------
 mgr.extend(mgr.lib['FilterManager']);
 //-----------------
  
 return mgr.lib['FilterManager'];
}));