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
   //------------------------------------------------------
   //------------------------------------------------------
	<div class="wrap">
		<a data-scroll='{"where":".the-carousel:not(.carousel)","shift":-30,"name":"a"}' href="">ONE</a>
		<a data-scroll='{"where":".special-block:not(.people)","shift":-30,"name":"b"}' href="">TWO</a>
		<a data-scroll='{"where":".the-carousel.carousel","shift":-30,"name":"c"}' href="">Abcdefghj</a>
		<a data-scroll='{"where":".partners-block","shift":-30,"name":"d"}' href="">FOUR</a>
		<a data-scroll='{"where":".special-block.people","shift":-30,"name":"e"}' href="">Sdgdfgf</a>
	</div>
	
	data:{
	 callers:'.submenu a',
	 data:'scroll',
	 hash:'section',
	 topHash:'top',
	 dbTime:50
	}
   //------------------------------------------------------
   //------------------------------------------------------
   $(function(){
    mgr.set({
     data:'subnav',
     object:'ScrollTo',
     extra:{
      helpers:{
       debounce:mgr.get('lib.utils.debounce'),
       getParam:mgr.get('lib.utils.getParam'),
       setParam:mgr.get('lib.utils.setParam')
      }
     }
    });
   });
  });
 }
}));