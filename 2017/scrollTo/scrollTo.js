(function (factory) {
 'use strict';
 
 if(typeof define==='function'&&define.amd){
  define(['jquery','base'],factory);
 }else
 {
  if('theApp' in window)
  {
   if(!theApp.lib)
    throw 'theApp.lib doesn\'t exist!';
   theApp.set({data:'lib.ScrollTo',object:factory(jQuery,theApp),lib:false});
  }
 }
}(function($,mgr){
 mgr.extend(ScrollTo);

 function ScrollTo(){
  "use strict";
  
  this.options={
   speed:500,
   easing:'swing',
   activeClass:'active',
   hash:'nav',
   topHash:'top',
   dbTime:200,
   data:'scroll',
   namespace:'.scrollTo',
   helpers:{
    debounce:null,
    getParam:null,
    setParam:null
   }
  };

  this.props={
   callers:null,//init
   names:[],
   shifts:[],
   blocks:null,
   scroll:$('body,html'),
   active:-1,
   len:null,
   helpers:{
    win:$(window),
    doc:$(document)
   }
  };
 }
 //-----------------
 $.extend(ScrollTo.prototype,{
  init:function(opts){
   var self=this;

   self.options=$.extend(true,self.options,opts);

   self.props=$.extend(true,self.props,{
    callers:$(opts.callers)
   });

   self.trigger('init');
   self.prepare();
  },
  setControls:function(){
   var self=this;

   self.props.callers.on('click',function(e){
    var obj=$(this);

    self.go(obj,'click');

    e.preventDefault();
   }).each(function(){
    var obj=$(this),
     dat=obj.data(self.options.data);

    dat.where=$(dat.where);
    self.props.blocks=self.props.blocks?self.props.blocks.add(dat.where):dat.where;
    if(!~self.props.names.indexOf(dat.name))
    {
     self.props.names.push(dat.name);
     self.props.shifts.push(dat.shift);
    }
   });

   self.props.len=self.props.blocks.length;
  },
  prepare:function(){
   var self=this,
    db=$.type(self.options.helpers.debounce)==='function'?self.options.helpers.debounce(function(){
     self.setActiveOnResizeAndScroll();
    },self.options.dbTime):(function(){throw new Error('No debounce function set! ['+self.getInner('PATH')+']')})(),
    hash;

   if($.type(self.options.helpers.getParam)!=='function')
    (function(){throw new Error('No getParam function set! ['+self.getInner('PATH')+']')})();
   if($.type(self.options.helpers.setParam)!=='function')
    (function(){throw new Error('No setParam function set! ['+self.getInner('PATH')+']')})();

   hash=self.options.helpers.getParam({name:self.options.hash});

   self.setControls();

   if(hash)
    self.go(self.props.callers.eq(self.props.names.indexOf(hash)),'ini');

   db();

   self.props.helpers.win.on('scroll'+self.options.namespace+' resize'+self.options.namespace,function(){
    db();
   });
  },
  setActiveOnResizeAndScroll:function(){
   var self=this,
    top=self.props.helpers.win.scrollTop(),
    last=self.props.blocks.last().offset().top+self.props.shifts[self.props.len-1],
    wh=mgr.helpers.win.height(),
    dh=mgr.helpers.doc.height();

   self.props.callers.filter('.'+self.options.active).removeClass(self.options.active);

   if(top<last&&(top+wh===dh||top+wh===dh-1)||top>=last)
   {
    self.props.active=self.props.len-1;
   }else
   {
    if(top<self.props.blocks.eq(0).offset().top+self.props.shifts[0])
    {
     self.props.active=-1;
    }else
    {
     self.props.blocks.each(function(i){
      if(top<self.props.blocks.eq(i).offset().top+self.props.shifts[i])
      {
       self.props.active=i-1;
       return false;
      }
     });
    }
   }

   if(~self.props.active)
   {
    self.props.callers.filter(function(){
     return $(this).data(self.options.data).where.is(self.props.blocks.eq(self.props.active));
    }).addClass(self.options.active);

    self.go(self.props.callers.eq(self.props.active),'activate');
   }else
   {
    self.options.helpers.setParam({name:self.options.hash,value:self.options.topHash});
   }
  },
  go:function(obj,t){
   var self=this;

   var dat=obj.data(self.options.data);

   if(t==='ini'||t==='click')
   {
    self.props.scroll.stop(true,true).animate({scrollTop:dat.where.offset().top+dat.shift},
     self.options.speed,
     self.options.easing
    );
    self.trigger('go',[{active:self.props.active,by:t}]);
   }
   if(t==='activate')
    self.options.helpers.setParam({name:self.options.hash,value:dat.name});
  },
  getData:function(){
   return {index:this.props.active};
  }
 });
  
 return ScrollTo;
}));