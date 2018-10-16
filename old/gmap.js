/*
 mgr.shared.map=function(){
 mgr.setObject('contacts.map','Map');
 };

 map:{
 container:'.map',
 center:[55.752622,37.623653],
 zoom:16,
 opts:{
 panControl:false,
 zoomControl:false,
 mapTypeControl:false,
 scaleControl:false,
 streetViewControl:false
 },
 marks:[
 {url:'images/b-mark.png',anchor:[20,46],ll:[55.701388,37.577305],title:'',html:''}
 ]
 }

 $.getScript('http://maps.google.com/maps/api/js?sensor=false&language=ru&callback=SiteManager.shared.map');
*/

(function (factory) {
 'use strict';

 if(typeof define==='function'&&define.amd){
  define(['jquery','base'],factory);
 }else
 {
  if('SiteManager' in window)
  {
   if(!SiteManager.lib)
    throw 'SiteManager.lib doesn\'t exist!';
   SiteManager.lib['Map']=factory(jQuery,SiteManager);
  }
 }
}(function($,mgr){
 function Map(opts){
  "use strict";

  var self=this;

  mgr.Base.apply(this,arguments);

  self.options=$.extend(true,{
   zoom:16,
   center:[55.750262,37.621791],
   opts:{
    panControl:true,
    zoomControl:true,
    mapTypeControl:true,
    scaleControl:true,
    streetViewControl:true,
    styles:null
   },
   type:google.maps.MapTypeId.ROADMAP,
   data:''
  },opts);

  self.props={
   container:$(self.options.container),
   map:null,
   marks:[]
  };

  init();

  function init(){
   if(self.options.data)
    $.extend(self.options,self.props.container.data(self.options.data));

   self.prepare();
   self.addMarks();
  }
 }
 //-----------------
 mgr.extend(Map);
 //-----------------
 $.extend(Map.prototype,{
  prepare:function(){
   var self=this;

   self.props.map=new google.maps.Map(self.props.container.get(0),$.extend({
    zoom:self.options.zoom,
    mapTypeId:self.options.type,
    center:new google.maps.LatLng(self.options.center[0],self.options.center[1])
   },self.options.opts));
  },
  addMarks:function(){
   var self=this,
       mData=self.options.marks,
       l=self.options.marks?self.options.marks.length:0,
       marker,
       image,
       infoWindow=new google.maps.InfoWindow({
        content:'Loading...'
       });

   for(var i=0;i<l;i++)
   {
    image=new google.maps.MarkerImage(
     mData[i].url,
     null,
     null,
     mData[i].anchor?new google.maps.Point(mData[i].anchor[0],mData[i].anchor[1]):null
    );

    marker=new google.maps.Marker({
     position:new google.maps.LatLng(mData[i].ll[0],mData[i].ll[1]),
     map:self.props.map,
     title:mData[i].title,
     html:mData[i].html,
     icon:mData[i].url?image:null
    });

    google.maps.event.addListener(marker,"click",function(){
     infoWindow.setContent(this.html);
     infoWindow.open(self.props.map,this);
    });
   }
  }
 });

 return Map;
}));