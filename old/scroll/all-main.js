/*
timeline:{
 find:'.timeline',
 path:'index.timeline.',
 prevent:'.wrap a',
 block:{
  wrap:'.wrap',
  block:'.wrap1',
  horizontal:true,
  touch:{mouse:true},
  extra_:{
   bar:null,
   cls:'hidden',
   dragging:'dragging'
  }
 },
 bar:{
  holder:'.scroll',
  bar:'.bar',
  horizontal:true,
  touch:{enabled:false},
  extra_:{
   block:null,
   time:200,
   dragging:'dragging'
  }
 }
}
*/

/*
&.dragging{
  @include vendor(user-select,none);
}

.timeline{
  overflow:hidden;
  position:relative;
  .wrap{
    @include flx(display,flex);
  }
  .wrap1{
    @include flx(display,flex);
    position:relative;
  }
  .item{
    width:270px;
    margin-right:20px;
    &:last-child{
      margin-right:0;
    }
  }
  
  .scroll{
    @include abs($l:0,$r:0,$b:7px);
    height:2px;
    background:#eee;
    cursor:pointer;
    &.hidden{
      display:none;
    }
    &:before{
      content:'';
      @include abs($l:0,$r:0,$t:-4px,$b:-4px);
    }
  }
  .bar{
    @include abs($l:0,$t:-9px);
    @include sprite(bar);
  }
}
*/

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
   noClick:false
  };

  mgr.set({data:'shared.custom-block',object:{
   bar:{
    init:function(){
     var u=this.getInner('extra'),
         self=this,
         thr=mgr.get('lib.utils.throttle')(function(){
          if(t*3+20*2<=d.wrapDim&&t*4+20*3>d.wrapDim)
           u.block.method('setLength',3);
          if(t*4+20*3<=d.wrapDim&&t*5+20*4>d.wrapDim)
           u.block.method('setLength',4);
        
          if(!u.block.method('getData').stopResize)
           u.block.method('recalc');
          if(!self.method('getData').stopResize)
           self.method('resize');
         },u.time);

     mgr.helpers.win.on('resize scroll',function(){
      thr();
     });
    },
    change:function(e,opts){
     var u=this.getInner('extra');

     if(u.block&&!opts.external&&!opts.resize)
     {
      u.block.method('move',{
       value:-opts.value*u.block.method('getData').dim/opts.bounds[1],
       external:true
      });
     }
    },
    down:function(){
     var u=this.getInner('extra');

     $('body').addClass(u.dragging);
    },
    up:function(){
     var u=this.getInner('extra');

     $('body').removeClass(u.dragging);
    }
   },
   block:{
    hide:function(){
     var u=this.getInner('extra');

     if(u.bar)
     {
      u.bar.method('setPosition',{
       value:[0],
       external:true
      });
     }
    },
    stop:function(){
     var u=this.getInner('extra');

     u.bar.method('stop');
    },
    move:function(e,opts){
     var u=this.getInner('extra');

     if(u.bar&&!opts.external)
     {
      //if(opts.resize&&!opts.hide)
       //u.bar.method('setBarDim',[opts.wrapDim/opts.blockDim*u.bar.method('getData').holderDim]);
      u.bar.method('getData').container[(opts.hide?'add':'remove')+'Class'](u.cls);

      u.bar.method('setPosition',{
       value:opts.hide?[0]:[-opts.value*u.bar.method('getData').bounds[1]/opts.dim],
       external:true,
       select:opts.select,
       duration:opts.duration
      });
     }
    },
    down:function(){
     var u=this.getInner('extra');

     $('body').addClass(u.dragging);
     shared.noClick=false;
    },
    up:function(){
     var u=this.getInner('extra');

     $('body').removeClass(u.dragging);
    },
    dragend:function(){
     shared.noClick=true;
    }
   },
   setIt:function(opts){
    var find=$(opts.data.find);

    find.on('click',opts.data.prevent,function(e){
     if(shared.noClick)
      e.preventDefault();
    });

    find.on('dragstart',opts.data.prevent,function(e){
     e.preventDefault();
    });

    find.each(function(){
     var obj=$(this),
      bar,
      block;

     block=mgr.set({
      data:opts.data.path+'block',
      object:'Block',
      on:mgr.get('shared.custom-block.block'),
      extra:$.extend({},opts.data.block,{
       wrap:obj.find(opts.data.block.wrap),
       block:obj.find(opts.data.block.block)
      }),
      collection:true
     });

     bar=mgr.set({
      data:opts.data.path+'bar',
      object:'Bar',
      on:mgr.get('shared.custom-block.bar'),
      extra:$.extend({},opts.data.bar,{
       holder:obj.find(opts.data.bar.holder),
       bar:obj.find(opts.data.bar.bar)
      }),
      collection:true
     });

     bar.getInner('extra').block=block;
     block.getInner('extra').bar=bar;
     mgr.helpers.win.trigger('resize');
    });
   }
  },lib:false});
  //------------------------------------------------------
  //------------------------------------------------------
  
  //------------------------------------------------------
  //------------------------------------------------------
  $(function(){
   mgr.set({data:'index.timeline',object:mgr.get('shared.custom-block.setIt'),call:true});
  });
 });
}));