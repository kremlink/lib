<div class="overlay"></div>
<div class="vid-pop">
    <a class="close" href=""></a>
    <iframe width="640" height="480" data-src="http://www.youtube.com/embed/HwFpEmH4nKI?wmode=transparent" frameborder="0"></iframe>
</div>

.overlay{
 @include abs($l:0,$r:0,$t:0,$b:0,$p:fixed);
 background:rgba(#000, 0.5);
 visibility:hidden;
 opacity:0;
 @include trs(all .5s ease-in-out);
 z-index:1;
 &.active{
 opacity:1;
 visibility:visible;
 }
}

.vid-pop{
 @include center($p:fixed);
 background:#fff;
 display:none;
 z-index:1;
 &.active{
   display:block;
 }
 .close{
   @include abs($t:-60px,$r:-60px);
   @include close-cross($d:40px,$w:40px,$h:4px,$c:#fff);
 }
}

video:{
 callers:'.goods-item-block .vid',
 pops:'.vid-pop',
 closers:'.vid-pop .close',
 esc:true,
 overlay:'.overlay',
 extra_:{
  $vid:'.vid-pop iframe',
  data:'src'
 }
}

var video={
 show:function(e,opts){
  var u=this.getInner('extra');

  u.$vid.attr('src',u.$vid.data(u.data));
 },
 hide:function(e,opts){
  var u=this.getInner('extra');

  u.$vid.attr('src','');
 }
};

mgr.set({data:'goods-item.video',object:'Toggle',on:video});