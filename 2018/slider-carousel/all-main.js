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
 mgr.setBlock(function(){
  var shared={
   
  };

  //------------------------------------------------------
  //------------------------------------------------------
  slider:{
   container:'.vacancies-slider',
    elements:'.item',
    circular:true,
    transition:'trs',
    transitionProp:'padding-left',
    noOldSliderTransition:false,
    firstTransition:true,
    pagContainer:'.pag div',
    pagination:'<a href=""><span class="img"><img src="images/s-icon[num].png" alt=""/></span><span class="txt"></span></a>',
    animData:{
    initialCss:{left:0},
    newCssBefore:{
     back:{left:'-100%'},
     forward:{left:'100%'}
    },
    newCssAfter:{
     back:{left:0},
     forward:{left:0}
    },
    oldCssAfter:{
     back:{left:'100%'},
     forward:{left:'-100%'}
    }
   },
   userObject:{
    $text:'.vacancies-slider article',
     cls:'active'
   }
  }

  slider:{
   container:'.the-slider',
   elements:'.item',
   circular:true,
   prev:'.the-slider .prev',
   next:'.the-slider .next',
   extra_:{
    cls:'loaded'
   }
  }
  
  var slider=function(opts){
   var cont=$(opts.data.container);

   cont.find('img').imagesLoaded(function(){
    var obj=mgr.set({data:opts.name,object:'Slider',extra:{helpers:{swipe:mgr.get('lib.utils.swipe')}}});

    cont.addClass(obj.getInner('extra').cls).height(obj.method('getData').elements.eq(0).height());
   });
  };
  //------------------------
  //------------------------
  .wrap{
    overflow:hidden;
    position:relative;
    margin:8px 30px 0 -22px;
    @include flx(display,flex);
  }
  .inner{
    @include flx(display,flex);
    padding:2px 0;
    position:relative;
    &.trs{
      @include trs('left .5s ease-in-out');
    }
  }
  .item{
   min-width:230px;//ie needs min
   @extend %bxz;
  }
  
  carousel:{
   container:'.the-slider .wrap',
   block:'.the-slider .inner',
   next:'.the-slider .next',
   prev:'.the-slider .prev',
   dim:true,
   circular:true,
   transition:'trs',
   scroll:1,//visible:mgr.helpers.win.width()>1000?6:5
   extra_:{
    time:200,
    between:20
   }
  }
  
  var carousel=function(opts){
   var container=$(opts.data.container),
       block=$(opts.data.block),
       extra=opts.data.extra_,
       db=mgr.get('lib.utils.debounce')(function(){
        var c=mgr.get(opts.name),
            t,w=block.children().eq(0).innerWidth();

        t=Math.floor(container.width()/w);
        if(t>1&&(container.width()-t*w)/(t-1)<extra.between)
         t--;

        if(c)
         c.destroy();

        mgr.set({data:opts.name,object:'Carousel',extra:{visible:t},notify:false});
       },extra.time);

   db();
   mgr.helpers.win.on('resize',function(){
    db();
   });
  };
  
  var carousel={
   init:function(){
    var self=this,
         u=this.getInner('extra');

     u.$next.on('click',function(e){
      var d=self.getData();

      self.setScroll(u.fixVisible);
      self.go({to:d.current+u.fixVisible,dir:'forward'});
      //self.go({to:d.current-u.fixVisible,dir:'back'});//prev
      self.setScroll(u.fixScroll);
      e.preventDefault();
     });
   }
  };
  //------------------------------------------------------
  //------------------------------------------------------
  $(function(){
   mgr.set({data:'all.slider',object:slider,call:true});
   
   mgr.set({data:'index.carousel',object:carousel,call:true});
  });
 });
}));