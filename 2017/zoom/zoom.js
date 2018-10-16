/*!by Alexander Kremlev*/
(function (factory){
 'use strict';

 if(typeof define==='function'&&define.amd){
  define(['jquery','base'],factory);
 }else
 {
  if('theApp' in window)
  {
   if(!theApp.lib)
    throw 'theApp.lib doesn\'t exist!';
   theApp.set({data:'lib.Zoom',object:factory(jQuery,theApp),lib:false});
  }
 }
}(function($,mgr){
 mgr.extend(Zoom);

 function Zoom(){
  "use strict";

  this.options={
   shownClass:'shown',
   loadingClass:'loading',
   data:'data',
   resize:false,
   helpers:{
    imgsReady:null//init
   }
  };

  this.props={
   block:{
    item:null,//init
    width:null,
    height:null
   },
   drag:{
    item:null,//init
    width:null,
    height:null
   },
   view:{
    item:null,//init
    width:null,
    height:null
   },
   srcImg:{
    width:null,
    height:null
   },
   destImg:{
    width:null,
    height:null
   },
   k:{
    viewDrag:null,
    blockDragX:null,
    blockDragY:null,
    destSrc:null,
    viewBlockX:null,
    viewBlockY:null
   },
   loading:true,
   data:null
  };
 }
 //-----------------
 $.extend(Zoom.prototype,{
  init:function(opts){
   var self=this;

   self.options=$.extend(true,self.options,{
    helpers:{imgsReady:function(){throw new Error('No imgsReady function set! ['+self.getInner('PATH')+']');}}
   },opts);

   self.props=$.extend(true,self.props,{
    block:{
     item:$(opts.block)
    },
    drag:{
     item:$(opts.drag)
    },
    view:{
     item:$(opts.view)
    }
   });

   self.trigger('init');
   self.prepare();
   self.setControls();
  },
  prepare:function(){
   var self=this;

   self.props.data=self.props.block.item.data(self.options.data);
   if(self.props.data)
    self.change(self.props.data);
  },
  setImgs:function(imgs){
   var self=this;

   self.props.srcImg.width=imgs[0].width;
   self.props.srcImg.height=imgs[0].height;
   self.props.destImg.width=imgs[1].width;
   self.props.destImg.height=imgs[1].height;

   if(self.props.srcImg.width/self.props.destImg.width!=self.props.srcImg.height/self.props.destImg.height)
    throw 'Disproportional images!';

   self.props.k.destSrc=self.props.destImg.width/self.props.srcImg.width;
  },
  setKoeffs:function(){
   var self=this;

   self.props.k.viewDrag=self.props.view.width/self.props.drag.width;

   if(self.options.resize)
   {
    self.props.k.blockDragX=self.props.block.width/self.props.drag.width;
    self.props.k.blockDragY=self.props.block.height/self.props.drag.height;
    self.props.view.item.css('background-size',100*self.props.k.blockDragX+'%'+100*self.props.k.blockDragY+'%');
   }
  },
  setDims:function(){
   var self=this;

   self.props.block.width=self.props.block.item.width();
   self.props.block.height=self.props.block.item.height();
   self.props.view.width=self.props.view.item.width();
   self.props.view.height=self.props.view.item.height();

   if(self.options.resize)
   {
    self.props.drag.width=self.props.drag.item.outerWidth();
    self.props.drag.height=self.props.drag.item.outerHeight();
    if(self.props.view.width/self.props.drag.width!=self.props.view.height/self.props.drag.height)
     throw 'Disproportional viewport!';
   }else
   {
    self.props.k.viewBlockX=self.props.view.width/self.props.block.width;
    self.props.k.viewBlockY=self.props.view.height/self.props.block.height;
    self.props.drag.width=self.props.block.width/self.props.k.destSrc*self.props.k.viewBlockX;
    self.props.drag.item.css('width',self.props.drag.width);
    self.props.drag.height=self.props.block.height/self.props.k.destSrc*self.props.k.viewBlockY;
    self.props.drag.item.css('height',self.props.drag.height);
   }
  },
  change:function(d){
   var self=this;

   self.props.data=d?d:self.props.block.item.data(self.options.data);

   self.props.view.item.addClass(self.options.loadingClass);

   self.options.helpers.imgsReady({
    src:[self.props.data['src'],self.props.data['view']],
    callback:function(imgs){
     self.props.block.item.css('backgroundImage','url('+imgs[0].src+')');
     self.props.view.item.css('backgroundImage','url('+imgs[1].src+')');
     self.setImgs(imgs);
     self.setDims();
     self.setKoeffs();
     self.props.loading=false;
     self.props.view.item.removeClass(self.options.loadingClass);
    }
   });
  },
  setControls:function(){
   var self=this;

   self.props.block.item.on('mouseenter',function(){
    self.props.block.item.addClass(self.options.shownClass);
    self.props.drag.item.addClass(self.options.shownClass);
    self.props.view.item.addClass(self.options.shownClass);
   }).on('mouseleave',function(){
     self.props.block.item.removeClass(self.options.shownClass);
     self.props.drag.item.removeClass(self.options.shownClass);
     self.props.view.item.removeClass(self.options.shownClass);
    }).on('mousemove',function(e){
     self.onMove(e);
    });
  },
  onMove:function(e){
   var self=this,
       x,y,dw,dh,bw,bh;

   if(!self.props.loading)
   {
    dw=self.props.drag.width;
    dh=self.props.drag.height;
    bw=self.props.block.width;
    bh=self.props.block.height;
    x=e.pageX-self.props.block.item.offset().left-Math.round(dw)/2;
    y=e.pageY-self.props.block.item.offset().top-Math.round(dh)/2;
    x=x<0?0:(x+dw>bw?bw-dw:x);
    y=y<0?0:(y+dh>bh?bh-dh:y);
    self.props.drag.item.css({
     left:x+0.1,
     top:y
    });
    self.props.view.item.css('background-position',-x*self.props.k.viewDrag+'px '+(-y*self.props.k.viewDrag)+'px');
   }
  }
 });

 return Zoom;
}));