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
   select:{
    input:'.catalog-filter .multi',
    template:'#sel-template',
    itemTemplate:'#sel-item-template',
    shown:4
   }
   
   <input class="multi" data-data='[{"value":-1,"item":"Choose23232","disabled":true},{"value":0,"item":"aaabbb","selected":true},{"value":1,"item":"aaabbbccc"}]' type="text"/>
   
   <script id="sel-template" type="text/html">
       <div tabIndex="1" class="custom-select">
           <div class="custom-select-chosen">
               <div class="custom-select-chosen-html"></div>
           </div>
           <div class="custom-select-list-wrap">
               <div class="custom-select-list">[{& items}]</div>
               <!--<span class="custom-scroll"><span></span></span>-->
           </div>
       </div>
   </script>
   <script id="sel-item-template" type="text/html">
       <div class="custom-select-item">[{& item}]</div>
   </script>
   //------------------------------------------------------
   //------------------------------------------------------
   $(function(){
    mgr.set({data:'catalog.select',object:'Select'});
   });
  });
 }
}));