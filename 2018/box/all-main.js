(function (factory){
 factory(jQuery,theApp);
}(function($,mgr){
 'use strict';

 mgr.on('app:ready',function(e,modules){
  if(~modules.indexOf('index'))
  {
   <a class="the-box i1" href="https://upload.wikimedia.org/wikipedia/commons/9/95/Big_Pine_landscape.jpg">standard1</a>
   <a class="the-box i1" href="images/img2.png" title="standard2">standard2</a>
   <a class="the-box i2" href="" data-data='[{"href":"images/img3.png"}]' data-type="1">data</a>
   <a class="the-box i2" href="" data-data='[{"href":"images/img1.png"},{"href":"images/img2.png","custom":"<div class=\"ololo\"></div>","width":300,"height":200}]' data-type="1">dataArr</a>
   <a class="the-box i3" href="" data-data='[{"href":"images/img1.png"},{"href":"images/img2.png","title":"dataArr"}]' data-type="2">dataArr</a>
   <div class="overlay"></div>
   <div class="the-box-pop">
       <div class="the-box-pop-vp"><div class="the-box-pop-content"><div class="the-box-pop-inner"></div><div class="the-box-pop-prev"></div><div class="the-box-pop-next"></div><div class="the-box-pop-close"></div></div><div class="the-box-pop-title"></div></div>
   </div>
   //--------
   box:{
    extra:{
     $overlay:'.overlay'
    }
   }
   //--------
   var box={
    open:function(e,opts){
     var u=this.get('data').extra;

     u.$overlay.addClass(opts.activeClass);
    },
    close:function(e,opts){
     var u=this.get('data').extra;

     u.$overlay.removeClass(opts.activeClass);
    }
   };

   mgr.set({data:'index.box',object:'Box',on:box,extra:{options:{helpers:{debounce:mgr.get('lib.utils.debounce')},touch:{swipe:mgr.get('lib.utils.swipe')}}}});
  }
 });
}));