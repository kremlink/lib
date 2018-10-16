(function (factory) {
 'use strict';
 
  if(typeof define==='function'&&define.amd){
   define(['jquery','base','jquery.imagesloaded'],factory);
  }else
  {
   factory(jQuery,SiteManager);
  }
}(function($,mgr){
 mgr.lib['Colorize']=function(opts){//fill works only on non-transparent parts
  "use strict";
  
  var self=this;
  
  mgr.Base.apply(this,arguments);
  
  self.options=$.extend(true,{
   width:0,
   height:0,
   loadedClass:'loaded',
   fillStyle:null//grayscale:{quad:false}
  },opts);
  
  self.props={
   inside:$(opts.inside),
   imgs:null,
   canvases:null
  };
  
  self.props.imgs=self.props.inside.find('img');
  
  init();
  
  function init(){
   for(var i=0,c;i<self.props.imgs.length;i++)
   {
    c=$('<canvas />').prependTo(self.props.inside.eq(i)).attr({width:0,height:0});
    self.props.canvases=!self.props.canvases?c:self.props.canvases.add(c);
   }
   
   self.trigger('init');
   
   self.redraw();
  }
 };
 //-----------------
 mgr.extend(mgr.lib['Colorize']);
 //-----------------
 $.extend(mgr.lib['Colorize'].prototype,{
  helper:function(img,i){
   var self=this;
   
   if(!img.complete||!img.width||!img.src)
    return;
   
   self.props.canvases.eq(i).attr({width:self.options.width||img.width,height:self.options.height||img.height});
   self.draw(self.props.canvases.eq(i).get(0).getContext('2d'),img);
  },
  redraw:function(){
   var self=this;
   
   self.props.imgs.each(function(i){
    self.props.canvases.eq(i).attr({width:0,height:0}).parent().removeClass(self.options.loadedClass);
    
    $(this).imagesLoaded(function(){
     var obj=this.get(0);
     
     self.helper(obj,i);
     self.props.canvases.eq(i).parent().addClass(self.options.loadedClass);
    });
   });
  },
  draw:function(ctx,img){
   var self=this,
       pixels,
       data,
       l;
   
   ctx.clearRect(0,0,img.width,img.height);
   ctx.drawImage(img,0,0);
   
   if(self.options.fillStyle)
   {
    ctx.fillStyle=self.options.fillStyle;
    ctx.globalCompositeOperation="source-in";
    ctx.fillRect(0,0,img.width,img.height);
   }
   if(self.options.grayscale)
   {
    pixels=ctx.getImageData(0,0,img.width,img.height);
    data=pixels.data;
    l=data.length;
    
    for(var i=0;i<l;i+=4)
    {
     var avg=0.3*data[i]+0.59*data[i+1]+0.11*data[i+2];
     
     if(self.options.grayscale.quad)
      avg=6.03/100000000*avg*avg*avg*avg;//quadratic "blackifier"
     data[i]=avg; 
     data[i+1]=avg; 
     data[i+2]=avg;
    }
    
    ctx.putImageData(pixels,0,0,0,0,img.width,img.height);
   }
  }
 });
  
 return mgr.lib['Colorize'];
}));