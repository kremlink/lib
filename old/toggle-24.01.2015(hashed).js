/*!by Alexander Kremlev*/

 //in delegated mode only a sole popup permitted! (or no popup at all)
 //there should be only one active caller in delegated or sole popup mode! there can be exceptions though

(function (factory) {
 'use strict';
 
 if(typeof define==='function'&&define.amd){
  define(['jquery','base'],factory);
 }else
 {
  if('SiteManager' in window)
  {
   if(!SiteManager.lib)
    throw 'SiteManager.lib doesn\'t exist!';
   SiteManager.lib['Toggle']=factory(jQuery,SiteManager);
  }
 }
}(function($,mgr){
 function Toggle(opts){
  "use strict";
  
  var self=this;
  
  mgr.Base.apply(this,arguments);
  
  self.options=$.extend(true,{
   activeClass:'active',
   activeOverlayClass:'active',
   disabledClass:'disabled',
   initEvent:'init',
   showEvent:'show',
   showOnceEvent:'showOnce',
   hideEvent:'hide',
   hideAllEvent:'hideAll',
   keydown:'keydown.toggle',
   click:'click.toggle',
   get:false,
   data:'',
   esc:false,
   alone:false,
   aloneFlag:false,//make 1 or callers.length fake pop(s) for all callers when no pops provided; true means 1
   toggle:false,
   hideClick:false,
   activeClick:false,
   hash:false,
   getHash:function(){return -1;},
   setHash:function(){}
  },opts);
  
  self.props={
   delegateCallers:$.isPlainObject(opts.callers),
   pops:$(opts.pops),
   overlay:$(opts.overlay),
   shown:[],
   shownOnce:[],
   oldIndex:-1,
   oldCaller:null,
   activeCaller:null,
   activePop:null,
   doc:$(document),
   win:$(window),
   tabIndex:-1,
   delegateContainer:null,
   callers:null,
   closers:null,
   onePop:null,
   delegateNoPop:null//delegate callers + no pop
  };

  init();
  
  function init(){
   self.prepare();
   self.setCallers();
   self.setClosers();
   self.closingWays();
   self.trigger(self.options.initEvent,[{
    pops:self.props.pops,
    callers:self.props.callers,
    overlay:self.props.overlay,
    activeCaller:self.props.activeCaller,
    activeClass:self.options.activeClass,
    tabIndex:self.props.tabIndex
   }]);
   self.setActive();
  }
 }
 //-----------------
 mgr.extend(Toggle);
 //-----------------
 $.extend(Toggle.prototype,{
  prepare:function(){
   var self=this;

   if(self.options.hideClick)
    self.options.hideClick=$(self.options.hideClick);

   self.props.delegateContainer=self.props.delegateCallers?$(self.options.callers.container):null;
   self.props.callers=self.props.delegateCallers?null:$(self.options.callers);
   self.props.closers=$(self.options.closers);
   if(!self.props.pops.length)
   {
    if(self.options.alone&&self.options.aloneFlag)
    {
     self.props.pops=$('<div/>');
    }else
    {
     if(self.props.delegateCallers)
     {
      self.props.delegateNoPop=true;
     }else
     {
      for(var i=0;i<self.props.callers.length;i++)
       self.props.pops=self.props.pops.length?self.props.pops.add($('<div/>')):$('<div/>');
     }
    }
   }

   self.props.onePop=self.props.pops.length==1
    ||!self.props.delegateCallers&&self.props.pops.length>self.props.callers.length;
  },
  destroy:function(){
   var self=this;
   
   if(self.options.hideClick)
    self.options.hideClick.off(self.options.click);
   if(self.options.esc)
    self.props.doc.off(self.options.keydown);
   self.props.overlay.off(self.options.click);
   if(self.props.delegateCallers)
    self.props.delegateContainer.off(self.options.click);else
    self.props.callers.off(self.options.click);
   self.props.closers.off(self.options.click);
   self.off();
  },
  getData:function(){
   var self=this;
   
   return {
    tabIndex:self.props.tabIndex,
    shown:self.props.shown,
    activeCaller:self.props.activeCaller,
    oldCaller:self.props.oldCaller,
    oldIndex:self.props.oldIndex,
    activePop:self.props.activePop,
    callers:self.props.callers,
    pops:self.props.pops,
    activeClass:self.options.activeClass,
    callersSelector:self.props.delegateCallers?self.options.callers.selector:null,
    delegateContainer:self.props.delegateContainer
   }
  },
  getIniHash:function(){
   var self=this;
   
   return self.options.hash?(function(){
    var f=-1;
    
    if(!self.options.alone&&!self.props.onePop)
    {
     self.props.callers.each(function(i){
      if(~self.options.getHash(self.options.hash+i,self.options.get))
      {
       f=1;
       return false;
      }
     });
     
     return f;
    }else
    {
     return self.options.getHash(self.options.hash,self.options.get);
    }
   }()):-1
  },
  closingWays:function(){
   var self=this;
   
   if(self.options.esc)
   {
    self.props.doc.on(self.options.keydown,function(e){
     if(e.which==27)
      self.hideAll();
    });
   }
   
   self.props.overlay.on(self.options.click,function(){
    self.hideAll();
   });
   
   if(self.options.hideClick)
   {
    self.options.hideClick.on(self.options.click,function(e){
     var target=$(e.target);
     
     if(!target.closest(self.props.delegateCallers?self.options.callers.selector:self.props.callers).length&&!target.closest(self.props.pops).length)
      self.hideAll();
    });
   }
  },
  setCallers:function(){
   var self=this;
   
   if(self.props.delegateCallers)
   {
    self.props.delegateContainer.on(self.options.click,self.options.callers.selector,function(e){
     var obj=$(this);

     if(!$(e.target).closest(self.options.callers.ignore).length)
     {
      self.show({
       caller:obj,
       settingActive:false,
       activeClick:obj.hasClass(self.options.activeClass),
       blockedClick:obj.hasClass(self.options.disabledClass)
      });

      e.preventDefault();
     }
    });
   }else
   {
    self.props.callers.each(function(i){
     var obj=$(this);

     self.props.shown[i]=0;
     obj.on(self.options.click,function(e){
      self.show({
       index:i,
       caller:obj,
       settingActive:false,
       activeClick:obj.hasClass(self.options.activeClass),
       blockedClick:obj.hasClass(self.options.disabledClass)
      });
      
      e.preventDefault();
     });
    });
   }
  },
  setClosers:function(){
   var self=this;
   
   self.props.closers.each(function(i){
    $(this).on(self.options.click,function(e){
     self.hide({index:i,hashSetting:true});
     
     e.preventDefault();
    });
   });
  },
  show:function(opts){
   var self=this,
       i=self.props.onePop?0:opts.index,
       h;

   if(i<0||i>self.props.pops.length-1||opts.blockedClick||!self.options.toggle&&!self.options.activeClick&&opts.activeClick)
    return;

   h=(function(){
    if(self.options.data)
    {
     return opts.caller.data(self.options.data);
    }else
    {
     if(self.props.onePop)
     {
      return true;
     }else
     {
      if(self.options.alone)
       return i;else
       return true;
     }
    }
   })();

   if(!opts.settingActive&&self.options.toggle&&opts.activeClick)
   {
    self.props.tabIndex=-1;
    if(self.props.delegateNoPop)
     self.props.activeCaller=opts.caller;
    if(self.props.delegateCallers)
     self.hide({caller:opts.caller,hashSetting:true});else
     self.hide({index:i,hashSetting:true});
    return;
   }
   if(!opts.settingActive&&~self.props.tabIndex&&!self.props.onePop&&self.options.alone)
    self.hide({index:self.props.tabIndex,hashSetting:false});
   if(self.props.onePop&&self.props.activePop)
   {
    self.props.activePop.removeClass(self.options.activeClass);
    self.props.activeCaller.removeClass(self.options.activeClass);
   }

   self.props.shown[i]=1;
   
   self.props.tabIndex=!self.props.delegateCallers?(!self.props.onePop?i:opts.index):-1;
   
   if(self.options.hash)
    self.options.setHash({name:self.options.hash+(self.props.onePop||self.options.alone?'':i),value:h,get:self.options.get});
   
   self.props.pops.eq(i).addClass(self.options.activeClass);
   if(self.options.alone||self.props.onePop)
    self.props.activePop=self.props.pops.eq(i);
   
   if(self.props.delegateCallers)//delegated
   {
    self.props.activeCaller=opts.caller;
    self.props.activeCaller.addClass(self.options.activeClass);
   }else
   {
    if(self.props.onePop)
    {
     self.props.activeCaller=self.props.callers.eq(opts.index);
     self.props.activeCaller.addClass(self.options.activeClass);
    }else
    {
     if(self.options.alone)
      self.props.activeCaller=self.props.callers.eq(i);
     self.props.callers.eq(i).addClass(self.options.activeClass);
    }
   }
   
   setTimeout(function(){
    self.props.overlay.show().addClass(self.options.activeOverlayClass);
   },0);//firefox transition fix
   
   self.trigger(self.options.showEvent,[{
    pop:self.props.pops.eq(i),
    caller:self.props.activeCaller,
    oldCaller:self.props.oldCaller,
    popIndex:i,
    callerIndex:opts.index,
    oldIndex:self.props.oldIndex,
    shown:self.props.shown,
    shownOnce:self.props.shownOnce,
    settingActive:opts.settingActive,
    activeClick:opts.activeClick,
    activeClass:self.options.activeClass,
    callers:self.props.callers,
    callersSelector:self.props.delegateCallers?self.options.callers.selector:null,
    delegateContainer:self.props.delegateContainer,
    overlay:self.props.overlay,
    data:opts.data
   }]);

   self.props.shownOnce[i]=true;
   
   self.props.oldIndex=opts.index;
   self.props.oldCaller=self.props.activeCaller;
  },
  hide:function(opts){
   var self=this,
       callerIndex=self.props.tabIndex,
       caller=opts?(self.props.delegateCallers?opts.caller:self.props.callers.eq(opts.index)):null;
   
   var i=self.props.onePop?0:opts.index;
   
   if(!self.props.delegateNoPop&&(!self.props.shown[i]||i<0||i>self.props.pops.length-1))
    return;
   
   self.props.shown[i]=0;
   
   self.props.pops.eq(i).removeClass(self.options.activeClass);
   if(self.options.hash&&opts.hashSetting)
    self.options.setHash({name:self.options.hash+(self.props.onePop||self.options.alone?'':i),value:-1,get:self.options.get});
   
   if(self.props.onePop||self.props.delegateNoPop)
   {
    (opts.caller?opts.caller:self.props.activeCaller).removeClass(self.options.activeClass);
    self.props.activePop=null;
    self.props.activeCaller=null;
   }else
   {
    if(self.options.alone)
     self.props.activeCaller=null;
    self.props.callers.eq(i).removeClass(self.options.activeClass);
    self.props.tabIndex=-1;
   }
   
   self.props.overlay.removeClass(self.options.activeOverlayClass);

   self.trigger(self.options.hideEvent,[{
    pop:self.props.pops.eq(i),
    caller:caller,
    callerIndex:callerIndex,
    shown:self.props.shown,
    popIndex:i,
    overlay:self.props.overlay,
    activeClass:self.options.activeClass,
    callers:self.props.callers,
    callersSelector:self.props.delegateCallers?self.options.callers.selector:null,
    delegateContainer:self.props.delegateContainer,
    data:opts.data
   }]);
  },
  hideAll:function(opts){
   var self=this;

   self.trigger(self.options.hideAllEvent,[{
    shown:self.props.shown,
    activeClass:self.options.activeClass,
    callers:self.props.callers,
    data:opts
   }]);

   self.props.pops.each(function(i){
    if(self.props.shown[i])
     self.hide({index:i,hashSetting:true,data:{hideAll:true}});
   });
  },
  block:function(opts){
   var self=this;

   if(self.props.delegateCallers)
    opts.caller.addClass(self.options.disabledClass);else
    self.props.callers.eq(opts.index).addClass(self.options.disabledClass);
  },
  unblock:function(opts){
   var self=this;

   if(self.props.delegateCallers)
    opts.caller.removeClass(self.options.disabledClass);else
    self.props.callers.eq(opts.index).removeClass(self.options.disabledClass);
  },
  withHash:function(callers,active){
   var self=this,
       hash=self.getIniHash();

   if(~hash)
   {
    callers.removeClass(self.options.activeClass);
    
    if(!self.options.alone&&!self.props.onePop)
    {
     self.props.callers.each(function(i){
      if(~self.options.getHash(self.options.hash+i))
       $(this).addClass(self.options.activeClass);
     });
    }else
    {
     if(self.props.onePop)
     {
      if(self.options.data)
       active=callers.filter(function(){return hash==$(this).data(self.options.data);});else
       active=callers.eq(0);
     }else
     {
      if(self.options.alone)
      {
       if(self.options.data)
       {
        active=callers.filter(function(){return hash==$(this).data(self.options.data);});
       }else
       {
        hash=hash>callers.length-1?callers.length-1:hash;
        active=callers.eq(hash);
       }
       self.props.tabIndex=hash;
      }
     }
    }
   }
   
   return active;
  },
  setActive:function(){
   var self=this,
       callers=self.props.delegateCallers?self.props.delegateContainer.find(self.options.callers.selector):self.props.callers,
       active=callers.filter(function(){return $(this).hasClass(self.options.activeClass);});
   
   active=self.withHash(callers,active);
   
   if(self.props.delegateCallers)
   {
    if(active.length)
     self.show({caller:active,settingActive:true});
   }else
   {
    if(self.props.onePop||self.options.alone)
    {
     if(active.length)
      self.show({index:self.props.callers.index(active),caller:active,settingActive:true});
    }else
    {
     self.props.callers.each(function(i){
      var obj=$(this);
      
      if(obj.hasClass(self.options.activeClass))
       self.show({index:i,caller:obj,settingActive:true});
     });
    }
   }
  }
 });
  
 return Toggle;
}));