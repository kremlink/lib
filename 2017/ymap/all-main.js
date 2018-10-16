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
   'contacts.map':{
    container:'.the-map',
     map:{
     center:[55.832095,37.237800],
      zoom:14,
      //controls:['smallMapDefaultSet'],
      //type:'yandex#map',
      controls:[],
      behaviors:[]
    },
    controls:{
     zoomControl:{size:'small',float:'none',position:{top:10,left:10}},
     fullscreenControl:{}
    },
    markers:[{
     ll:[55.832095,37.237800],
     props:{
      //iconContent:'Test',
      //hintContent:'Hint',
      //balloonContent:'Baloon data'
     },
     opts:{
      preset:'islands#icon',
      iconColor:'#f00'
      //iconLayout:'default#imageWithContent',
      //iconImageHref:'images/marker.png',
      //iconImageSize:[50,68],
      //iconImageOffset:[-25,-68],
      //iconContentSize:[36,0]
     }}].map(function(o){
      $.extend(o.opts,{

      });

      return o;
     })
   }
   //-----
   var map={
    ready:function(e,opts){
     var u=this.getInner('extra'),
         sz=this.getOpts().markers[0].opts.iconImageSize;

     //ymaps.geoQuery(opts.marks).applyBoundsToMap(opts.map,{checkZoomRange:true,...//same thing
     opts.map.setBounds(opts.result.getBounds(),{checkZoomRange:true,zoomMargin:[sz[1],sz[0]/2,0,sz[0]/2]}).then(function(){
      if(opts.result.getLength()==1)
       opts.map.setZoom(u.alone);
     });
     
     /*
     opts.result.then(function(){
      opts.result.search('properties.ref_ rlike ".*"').addEvents('click',function(e){
       location.href=e.originalEvent.target.properties.get('ref_');
       //chosen.activate({index:opts.result.indexOf(e.get('target')),from:'marker'});
      });
     });
     */
    }
   };
   
   /*calling somewhere
    shared.map.method('getData').qResult.get(opts.index).set({iconContent:'<div class="marker-mult">3</div>'});
   */
   //------------------------------------------------------
   //------------------------------------------------------
   $(function(){
    $.getScript('https://api-maps.yandex.ru/2.1/?lang=ru-RU',function(){
     mgr.set({data:'contacts.map',object:'Map'});
    });
   });
  });
 }
}));