var principles=function(opts){
 var what=$(opts.data.what),
     top=what.offset().top,
     th=mgr.get('lib.utils.throttle')(function(){
      var t=mgr.helpers.win.scrollTop(),
          h=mgr.helpers.win.height();

      if(top-t+opts.data.start<h)
       what.addClass(opts.data.cls);else
       what.removeClass(opts.data.cls);
     },opts.data.time);

 th();
 mgr.helpers.win.on('resize scroll',function(){
  th();
 });
};
         