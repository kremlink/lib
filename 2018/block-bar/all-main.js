/*
drag:{
    $inside:'.av-window',
    //prevent:'.wrap a',
    block:{
     find:{
      wrap:'.drag',
      block:'.inner'
     },
     options:{
      horizontal:true,
	  wheel:true,
      touch:{mouse:true}
     },
     extra:{
      bar:null,
      dragging:'dragging'
     }
    },
    bar:{
     find:{
      holder:'.track',
      bar:'.track span'
     },
     options:{
      horizontal:true
     },
     extra:{
      block:null,
      time:200,
      dragging:'dragging',
	  cls:'hidden'
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
  //var noClick=false;

  var drag={
    bar:{
     init:function(){
      var u=this.get('data').extra,
       self=this,
       d,t,
       db=mgr.get('lib.utils.debounce')(function(){
        /*d=u.block.get('getData');
        t=d.items.eq(0).width();
        if(t*3+u.margin*2<=d.wrapDim&&t*4+u.margin*3>d.wrapDim)
         u.block.get('setLength',3);
        if(t*4+u.margin*3<=d.wrapDim&&t*5+u.margin*4>d.wrapDim)
         u.block.get('setLength',4);
        if(t*5+u.margin*4<=d.wrapDim&&t*6+u.margin*5>d.wrapDim)
         u.block.get('setLength',5);*/

        if(!u.block.get('getData').stopResize)
          u.block.get('recalc');
         if(!self.get('getData').stopResize)
         {
          d=u.block.get('getData');
          self.get('resize');
          if(!d.hide)
           self.get('setBarDim',[d.wrapDim/d.blockDim*self.get('getData').holderDim]);
          self.get('getData').container[(d.hide?'add':'remove')+'Class'](u.cls);
         }
       },u.time);

      mgr.helpers.win.on('resize',function(){
       db();
      });
	  mgr.on('tools:drag',function(){
       db();
      });
     },
     change:function(e,opts){
      var u=this.get('data').extra;

      if(u.block&&!opts.external&&!opts.resize)
      {
       u.block.get('move',{
        value:-opts.value*u.block.get('getData').dim/opts.bounds[1],
        external:true
       });
      }
     },
     down:function(){
      var u=this.get('data').extra;

      $('body').addClass(u.dragging);
     },
     up:function(){
      var u=this.get('data').extra;

      $('body').removeClass(u.dragging);
     }
    },
    block:{
     hide:function(){
      var u=this.get('data').extra;

      if(u.bar)
      {
       u.bar.get('setPosition',{
        value:[0],
        external:true
       });
      }
     },
     stop:function(){
      var u=this.get('data').extra;

      u.bar.get('stop');
     },
     move:function(e,opts){
      var u=this.get('data').extra;

      if(u.bar&&!opts.external)
      {
       u.bar.get('setPosition',{
        value:opts.hide?[0]:[-opts.value*u.bar.get('getData').bounds[1]/opts.dim],
        external:true,
        select:opts.select,
        duration:opts.duration
       });
      }
     },
     down:function(){
      var u=this.get('data').extra;

      $('body').addClass(u.dragging);
      //shared.noClick=false;
     },
     up:function(){
      var u=this.get('data').extra;

      $('body').removeClass(u.dragging);
     },
     dragend:function(){
      //shared.noClick=true;
     }
    },
    setIt:function(opts_){
     var d=opts_.data,
      find=function(dat,obj){
       var o={};

       for(var x in dat)
        if(dat.hasOwnProperty(x))
         o[x]=obj.find(dat[x]);

       return o;
      },
	  props;

     /*inside.on('click',d.prevent,function(e){
      if(shared.noClick)
       e.preventDefault();
     });

     d.$inside.on('dragstart',d.prevent,function(e){
      e.preventDefault();
     });*/

     d.$inside.each(function(){
      var obj=$(this),
       bar,
       block;

      block=mgr.set({
       data:opts_.name+'.block',
       object:'Block',
       on:drag.block,
       add:$.extend(find(d.block.find,obj),{options:$.extend(d.block.options,{helpers:{drag:mgr.get('lib.utils.drag')}})}),
       collection:true
      });

      bar=mgr.set({
       data:opts_.name+'.bar',
       object:'Bar',
       on:drag.bar,
       add:$.extend(find(d.bar.find,obj),{options:$.extend(d.bar.options,{helpers:{drag:mgr.get('lib.utils.drag')}})}),
       collection:true
      });
	  
	  props=block.get('props');
      new (mgr.get('lib.utils.swipe'))({
       speed:0.5,
       mouse:true,
       container:props.wrap,
       callback:function(delta){
        var d=props.items.eq(0).width();

        if(delta>0)
        {
         block.get('move',{value:
          (props.value-d>=props.wrapDim-props.blockDim?
           props.value-d:
           props.wrapDim-props.blockDim)
         });
        }else
        {
         block.get('move',{value:props.value+d<=0?props.value+d:0});
        }
       }
      });

      bar.get('data').extra.block=block;
      block.get('data').extra.bar=bar;
      mgr.trigger('tools:drag');
     });
    }
   };
  //------------------------------------------------------
  //------------------------------------------------------
  
  //------------------------------------------------------
  //------------------------------------------------------
  $(function(){
   mgr.set({data:'tools.drag',object:drag.setIt,call:true});
  });
 });
}));