(function (factory) {
 'use strict';
 
  if(typeof define==='function'&&define.amd)
  {
   define(['jquery','base','data/index-data','lib/utils','lib/save'],factory);
  }else
  {
   factory(jQuery,SiteManager);
  }
}(function($,mgr){
 if(mgr.shared.page_=='forms')
 {
  mgr.setBlock(function(){
   var shared={

   };

   
   <a class="the-box" data-data='[{"href":"images/news1.jpg"},{"html":"<iframe class=\"box-frame\"></iframe>"},{"html":"<div class=\"box-div\">Chapter 5, Exercise 2: Book Library - Your First RESTful Backbone.js App, walks you through development of a Book Library application which persists its model to a server using a REST API.</div>"}]' href="images/bb1.jpg" title="fgfg">
   ("fixedWidth" - centered and hidden if overflowed:"noResize" - jumps to no-resize mode;
    "width" - width; "height" - height. If both present, no dummy insertion for calculation occurs)
   
   <div class="box-pop-overlay"></div>
 <div class="box-pop">
 <div class="box-pop-viewport">
 <div class="box-pop-center">
 <div class="box-pop-wrap">
 <div class="box-pop-content"></div>
 <a class="box-pop-close" href=""></a>
 <a href="" class="box-pop-prev"></a>
 <a href="" class="box-pop-next"></a>
 <span class="box-pop-loader"></span>
 <span class="box-pop-zoom"></span>
 </div>
 </div>
 </div>
 </div>
 
 
.box-div{
  font-size:14px;
  width:500px;
  background:#ddd;
  .box-pop.box-pop-stretch &{
    width:100%;
    height:100%;
  }
}

.box-frame{
  vertical-align:top;
  width:640px;
  height:480px;
  .box-pop.box-pop-stretch &{
    width:100%;
    height:100%;
  }
}
   
   box:{
    callers:'.the-box',
    data:'type',
    options:{
     effect:'sim',
     transition:'box-pop-trs'
    }
   }
   
   //------------------------------------------------------
   //------------------------------------------------------
   /*
   var box=(function(){
   var data,
   index=0;

   return {
   getData:function(opts){
   if(opts.type=='open')
   index=0;else
   index=opts.dir=='next'?(index<data.length-1?index+1:0):(index>0?index-1:data.length-1);

   return data[index];
   },
   events:{
   init:function(){
   data=[{img:'images/logo.png'},{img:'http://placekitten.com/700/500',title:'ff'}];
   this.toggleCtrls({ctrl:'next',what:'add'});
   },
   open:function(){
   mgr.get('lib.utils.fixed')(true);
   },
   close:function(){
   mgr.get('lib.utils.fixed')(false);
   }
   }
   }
   })();
   */
   
  var box={
    init:function(opts){
     var callers=$(opts.data.callers),
      data=opts.data.options.data,
      arr={},
      p=$(opts.data.pop);

     p.on('mousewheel',function(e,d){//wheel plugin is needed
      var t=this.scrollTop;

      if((t>=(this.scrollHeight-p.height())&&d<0)||(t===0&&d>0))
       e.preventDefault();
     });

     callers.each(function(){
      var obj=$(this),
       d=obj.data(data),
       v=d&&d.toString().length?d:0;

      arr[v]=arr[v]?arr[v].add(obj):obj;
     });

     for(var x in arr)
     {
      if(arr.hasOwnProperty(x))
      {
       mgr.set({
        data:opts.name,
        object:'Box',
        collection:true,
        on:box.events,
        extra:{
         callers:arr[x],
         options:$.extend(true,opts.data.options,{touch:{swipe:mgr.get('lib.utils.swipe')},helpers:{debounce:mgr.get('lib.utils.debounce')}})
        }
       });
      }
     }
    },
	events:{
      init:function(){
       var u=this.get('data').extra;

       u.dim=mgr.get('lib.utils.scrollDim')();
      },
      open:function(){
       var u=this.get('data').extra;

       $('body').addClass(u.hidden).css('padding-right',u.dim);
       //mgr.get('lib.utils.fixed')(true);
      },
      close:function(){
       var u=this.get('data').extra;

       $('body').removeClass(u.hidden).css('padding-right',0);
       //mgr.get('lib.utils.fixed')(false);
      }
     }
   };
   //------------------------------------------------------
   //------------------------------------------------------
   $(function(){
    mgr.set({data:'all.box',object:box.init,call:true});
   });
  });
 }
}));