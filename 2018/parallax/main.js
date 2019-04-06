   img{
    @include trs('transform 1s cubic-bezier(0.19, 1, 0.22, 1)');
   }
   //---
   par:{
    what:'.index-vid img',
    options:{
     mouse:true,
     k:-0.01
    },
    extra:{
     thr:100,
     cont:'#wrap'
    }
   }
   //---
   var par=function(opts){
    var d=opts.data,
    ini={},
    p=mgr.set({data:opts.name,object:'Parallax'}),
    th=mgr.get('lib.utils.throttle')(function(opts_){
     p.get('move',opts_);
    },d.extra.thr);

    $(d.extra.cont).one('mousemove',function(e){
     ini.x=e.pageX;
     ini.y=e.pageY;
    }).on('mousemove',function(e){
     th({x:e.pageX-ini.x,y:e.pageY-ini.y});
    });
   };
   
   //----

   mgr.set({data:'index.par',object:par,call:true});
