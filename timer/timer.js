/*!
by Alexander Krevlev
*/
(function(factory){
 'use strict';
 
  if(typeof define==='function'&&define.amd){
   define(['jquery','base'],factory);
  }else
  {
   factory(jQuery,SiteManager);
  }
}(function($,mgr){
 mgr.lib['Timer']=Timer;
 
 function Timer(opts){
  "use strict";
  
  var self=this;
  
  self.options=$.extend(true,{
   store:'__timer',
   data:'name',
   time:1000,
   format:opts.format||function(n){return Math.round(n/1000);}
  },opts);
  
  self.props={
   add:{
    caller:$(opts.add.caller),
    name:$(opts.add.name)
   },
   container:$(opts.container),
   template:$(opts.template.selector),
   timers:{}//e.g. timers[name]={time:...,t:...,block:...,timeObj:...,startPauseObj:...,paused:...,old:...}
  };
  
  init();
  
  function init(){
   if(!localStorage.getItem(self.options.store))
    localStorage.setItem(self.options.store,'[]');
   
   self.setControls();
   self.reconstruct();
  }
 }
 
 $.extend(Timer.prototype,{
  setControls:function(){
   var self=this;
   
   self.props.add.caller.on('click',function(e){
    self.add();
    
    e.preventDefault();
   });
   
   self.props.container.on('click',self.options.template.remove,function(e){
    self.remove($(this).data(self.options.data));
    
    e.preventDefault();
   });
   
   self.props.container.on('click',self.options.template.startPause.selector,function(e){
    var name=$(this).data(self.options.data),
        t=self.props.timers[name];
    
    if(t.paused)
    {
     t.old=new Date();
     self.go(name);
     t.paused=false;
     t.startPauseObj.text(self.options.template.startPause.text[1]);
    }else
    {
     clearTimeout(t.t);
     t.paused=true;
     t.startPauseObj.text(self.options.template.startPause.text[0]);
    }
    
    e.preventDefault();
   });
  },
  reconstruct:function(){
   var self=this,
       data=JSON.parse(localStorage.getItem(self.options.store));
   
   for(var i=0;i<data.length;i++)
    self.add({name:data[i].name,time:data[i].time});
  },
  remove:function(name){
   var self=this,
       t=self.props.timers[name];
   
   clearTimeout(t.t);
   t.block.remove();
   delete self.props.timers[name];
   localStorage.setItem(self.options.store,self.prepareData());
  },
  add:function(opts){//opts defined when constructing
   var self=this,
       data,
       t;
   
   if(!$.trim(self.props.add.name.val())&&!opts)
   {
    alert('Empty name not allowed');
    return;
   }
   
   if($.trim(self.props.add.name.val()) in self.props.timers&&!opts)
   {
    alert('This timer already exists. Remove it and add again if you need to restart');
    return;
   }
   
   data=opts?opts:{name:$.trim(self.props.add.name.val()),time:0};
   t=self.props.timers;
   
   t[data.name]={time:data.time,old:new Date()};
   t[data.name].block=$(Mustache.render(self.props.template.html(),{name:data.name,timeMs:data.time,time:function(){
    return self.options.format(this.timeMs);
   }}));
   t[data.name].timeObj=t[data.name].block.find(self.options.template.time);
   t[data.name].startPauseObj=t[data.name].block.find(self.options.template.startPause.selector)
    .text(opts?self.options.template.startPause.text[0]:self.options.template.startPause.text[1]);
   
   self.props.container.append(t[data.name].block);
   
   localStorage.setItem(self.options.store,self.prepareData());
   
   if(!opts)
   {
    t[data.name].paused=false;
    
    self.go(data.name);
   }else
   {
    t[data.name].paused=true;
   }
  },
  go:function(name){
   var self=this;
    
   self.props.timers[name].t=setInterval(function(){
    self.refresh(name);
   },self.options.time);
  },
  refresh:function(name){
   var self=this,
       t=self.props.timers[name],
       n=new Date();
   
   t.time+=n-t.old;
   t.old=n;
   t.timeObj.text(self.options.format(t.time));
   localStorage.setItem(self.options.store,self.prepareData());
  },
  prepareData:function(){
   var self=this,
       s=[];

   for(var x in self.props.timers)
    s.push({name:x,time:self.props.timers[x].time});
   
   return JSON.stringify(s);
  }
 });
 
   
 return Timer;
}));