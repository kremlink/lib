box:{
 callers:'.goods-item-block .box',
 pop:'.box-pop',
 overlay:'.box-pop-overlay',
 effect:'sim',
 transition:'box-pop-trs',
 data:'box',
 extra_:{
  $h:'#header',
  cls:'fixed'
 }
}

var box={
 open:function(){
  var u=this.getInner('extra');

  if(u.$h.hasClass(u.cls))
   u.$h.css('right',shared.dim+'px');
 },
 close:function(){
  var u=this.getInner('extra');

  u.$h.css('right',0);
 }
};

mgr.set({data:'goods-item.box',object:'Box',on:box});