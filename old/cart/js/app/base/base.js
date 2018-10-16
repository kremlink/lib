/*!
 * Basic FW v2.4
 *
 * Copyright 2014, Aleksander Kremlev
 * http://www.joint-group.ru
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
*/
(function(factory,mgr_){
 'use strict';

  if(typeof define==='function'&&define.amd)
  {
   define(['jquery'],function($){
    var mgr=factory($);
    
    if(mgr_)
    {
     $.extend(true,mgr,mgr_,{core:{override:mgr_.data}});
     mgr.data={};
    }
    
    return mgr;
   });
  }else
  {
   if(!mgr_)
   {
    window.SiteManager=factory(jQuery);
   }else
   {
    window.SiteManager=$.extend(true,factory(jQuery),mgr_,{core:{override:mgr_.data}});
    window.SiteManager.data={};
   }
  }
}(function($){
 var Manager={
  imgPath:'images/',
  splitBy:'.',
  helpers:{
   win:$(window),
   doc:$(document),
   html:$('html')
  },
  shared:{},//for different user data
  objects:{},//newly created objects go here
  lib:{},//modules
  utils:{},//defined below
  data:{},//initial data for objects
  core:{
   notify:{
    noData:true,//no data provided
    overrideData:true//override with set and setObject(s)
   },
   override:null,//data copy if overridden
   overridden:false,//true if SiteManager is defined beforehand
   what:function(st){
    var sp=Manager.splitBy,
        reg='(^objects\\'+sp+')|(^data\\'+sp+')|(^lib\\'+sp+')|(^shared\\'+sp+')|(^utils\\'+sp+')';

    return (st.match(new RegExp(reg))?st:'objects'+sp+st).split(sp);
   },
   _getDestination:function(opts){
    var arr=opts.s.split(Manager.splitBy),
        l=arr.length,
        tmp=Manager,
        name=l>1?arr[l-1]:opts.s;

    if(l>1)
    {
     for(var i=0;i<l-1;i++)
     {
      if(!tmp[arr[i]])
       tmp[arr[i]]={};

      tmp=tmp[arr[i]];
     }
    }

    if(this.notify.overrideData&&tmp[name]&&!opts.array)
     console.log('Overridden: '+opts.s);

    return {tmp:tmp,name:name};
   }
  },
  toggleNotifications:function(obj){
   $.extend(this.core.notify,obj);
  },
  get:function(st){
   var arr=this.core.what(st),
       l=arr.length,
	      tmp=this;

   for(var i=0;i<l;i++)
   {
    if(tmp[arr[i]])
    {
     tmp=tmp[arr[i]];
    }else
    {
     if(arr[0]=='lib')
      throw 'Lib function not found:'+st;else
      return false;
    }
   }
   
   return tmp;
  },
  set:function(s,obj){
   var dest=this.core._getDestination({s:s});

   return dest.tmp[dest.name]=obj;
  },
  overrideData:function(){
   if(this.core.override&&!this.core.overridden)
   {
    for(var x in this.core.override)
     $.extend(true,this.get('data'+this.splitBy+x),this.core.override[x]);
    this.core.overridden=true;
   }
  },
  setObject:function(s,Obj,extend){
   var sp=this.splitBy,
       d=this.get('data'+sp+s),
       dest,
       realObj;

   if(this.utils.isS(Obj))
    realObj=this.get('lib.'+Obj);else
    realObj=Obj;

   if(!realObj)
    throw 'No function found ('+Obj+')';

   if(!d)
   {
    if(this.core.notify.noData)
     console.log('No data provided for '+s);
    return false;
   }
   
   dest=this.core._getDestination({s:'objects'+sp+s});

   dest.tmp[dest.name]=new realObj($.extend(true,{},d,extend));
   dest.tmp[dest.name].NAME=s;
   
   return dest.tmp[dest.name];
  },
  setObjects:function(s,obj){
   var dest;
   
   dest=this.core._getDestination({s:'objects'+this.splitBy+s,array:true});
   
   if(!this.get(s))
    dest.tmp[dest.name]=[obj];else
    dest.tmp[dest.name].push(obj);

   return dest.tmp[dest.name];
  },
  extend:function(Child,Parent){
   var F=function(){},
       Parent=Parent||this.Base;
   
   F.prototype=Parent.prototype;
   Child.prototype=new F();
   Child.prototype.constructor=Child;
   Child.parent=Parent.prototype;
  },
  Base:function(opts){
   var self=this;
   
   self.userObject=$.extend(true,{},opts.userObject);
   
   if(opts.on)
    for(var x in opts.on)
     self.on(x,opts.on[x]);
   
   Manager.utils.jq(self.userObject);
  }
 };
 
 $.extend(Manager.utils,{
  jq:function(obj){
   var utils=Manager.utils;
   
   if(utils.isO(obj))
   {
    for(var x in obj)
     if(utils.is$(x))
      utils.jqTypes(obj,x);
   }
   
   if(utils.isA(obj))
   {
    for(var i=0;i<obj.length;i++)
     utils.jqTypes(obj,i);
   }
  },
  jqTypes:function(obj,s){
   var utils=Manager.utils;
   
   if(utils.isS(obj[s]))
    obj[s]=$(obj[s]);
   if(utils.isA(obj[s])||utils.isO(obj[s]))
    utils.jq(obj[s]);
  },
  is$:function(obj){
   return /^\$/.test(obj);
  },
  isS:function(obj){
   return typeof obj==='string';
  },
  isO:function(obj){
   return Object.prototype.toString.call(obj)==='[object Object]';
  },
  isA:function(obj){
   return Object.prototype.toString.call(obj)==='[object Array]';
  },
  isF:function(obj){
   return Object.prototype.toString.call(obj)==='[object Function]';
  },
  isN:function(obj){
   return Object.prototype.toString.call(obj)==='[object Number]';
  },
  isU:function(obj){
    return obj===void 0;
  },
  browser:(function(){
   var ua=navigator.userAgent;

   return {
    ancient:!window.addEventListener,
    old:!window.File,
    modern:window.addEventListener&&window.File,
    apple:!!ua.match(/Version\/[\d\.]+.*Safari/)||ua.match(/(iPad|iPhone|iPod)/g),
    ie:!!~navigator.userAgent.indexOf("MSIE ")||!!navigator.userAgent.match(/Trident.*rv\:11\./)
   };
  })()
 });
 
 $.extend(Manager.Base.prototype,{
  on:function(s,f){
   if(!this['_events'])
    this['_events']={};
   if(!this['_events'][s])
    this['_events'][s]=[];
   this['_events'][s].push(f);
   //$(this).on(s,f);
  },
  off:function(s,f){
   if(this['_events']&&this['_events'][s])
   {
    if(!f)
    {
     delete this['_events'][s];
    }else
    {
     for(var i=0,j=-1;i<this['_events'][s].length;i++)
     {
      if(''+this['_events'][s][i]==''+f)
      {
       j=i;
       break;
      }
     }
     
     if(~j)
      this['_events'][s].splice(j,1);
    }
   }
   //$(this).off(s,f);
  },
  trigger:function(s,p){
   if(this['_events']&&this['_events'][s])
   {
    for(var i=0;i<this['_events'][s].length;i++)
     this['_events'][s][i].call(this,null,p!=undefined?(Manager.utils.isA(p)?p[0]:p):null);
   }
   //$(this).triggerHandler(s,p);
  },
  method:function(s,p){
   if(!this[s])
    throw 'No such method ('+s+') of '+this.NAME;
   return this[s](p);
  },
  UO:function(opts){
   if(!opts||opts.prop==undefined)
    return this.userObject;else
    return this.userObject[opts.prop]=opts.value;
  },
  delegate:function(events,element){
   var self=this;

   for(var event in events)
   {
    (function(event){
     if(typeof events[event]==='object')
     {
      element.on(event,events[event].selector,function(e){
       if(!events[event].listener.apply(self,[e,$(this)]))
        e.preventDefault();
      });
     }else
     {
      element.on(event,function(e){
       if(!events[event].apply(self,[e,$(this)]))
        e.preventDefault();
      });
     }
    })(event);
   }
  }
 });
 
 return Manager;
},window.SiteManager));