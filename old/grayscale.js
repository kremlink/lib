(function (factory) {
 'use strict';
 
  if(typeof define==='function'&&define.amd){
   define(['jquery','base','jquery.imagesloaded'],factory);
  }else
  {
   factory(jQuery,SiteManager);
  }
}(function($,mgr){
 mgr.lib['Grayscale']=function(opts){
  "use strict";
  
  var self=this;
  
  self.props={
   inside:$(opts.inside),
   imgs:null
  };
  
  self.props.imgs=self.props.inside.find('img');
  
  init();
  
  function init(){
   self.props.imgs.imagesLoaded(function(){
    self.props.imgs.each(function(i){
     var obj=$(this),
         img={img:this,width:obj.width(),height:obj.height()},
         c=$('<canvas />').prependTo(self.props.inside.eq(i)).attr({width:img.width,height:img.height});
     
     self.draw(c.get(0).getContext('2d'),img);
    });
   });
  }
 };
 //-----------------
 $.extend(mgr.lib['Grayscale'].prototype,{
  draw:function(ctx,img){
   var pixels,
       data,
       l;
   
   ctx.drawImage(img.img,0,0);
   pixels=ctx.getImageData(0,0,img.width,img.height)
   data=pixels.data;
   l=data.length;
   
   for(var i=0;i<l;i+=4)
   {
    var avg=0.3*data[i]+0.59*data[i+1]+0.11*data[i+2];
    
    //avg=6.03/100000000*avg*avg*avg*avg;//quadratic "blackifier"
    data[i]=avg; 
    data[i+1]=avg; 
    data[i+2]=avg;
   }
   
   ctx.putImageData(pixels,0,0,0,0,img.width,img.height); 
  }
 });
  
 return mgr.lib['Grayscale'];
}));