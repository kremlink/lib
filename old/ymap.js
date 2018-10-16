/*$.getScript('http://api-maps.yandex.ru/2.0/?load=package.full&lang=ru-RU',function(){
 mgr.setObject('map','Map');
});*/

/*
 map:{
 container:'#contacts .map',
 center:[45.052351,38.986028],
 controls:{
 zoom:{small:true,position:{top:10,right:10}}
 },
 marks:[{src:mgr.img+'mark.png',ll:[45.052351,38.986028],size:[50,46],offset:[-10,-46],html:'Техцентр «АвтоТек», Краснодар, Коммунаров 278/1'}]
 }
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
   notify:true,
   zoom:16,
   center:[55.750262,37.621791],
   type:'yandex#map',
   mark:{preset:'twirl#violetIcon',ll:[55.750262,37.621791]},
   marks:[],
   controls:{
    //zoom:{small:true,position:{left:10,top:10}},
    //type:{position:{right:10,top:10}}
   },
   data:''
  },opts);
  
  self.props={
   container:$(self.options.container),
   map:null,
   marks:[]
   //{src:'images/mark.png',ll:[51.482893,46.095454],size:[50,52],offset:[-16,-50],baloonOffset:[-10,0],shadow:{src:'images/mark.png',size:[50,52],offset:[-16,-50]}}
  };
  
  init();
  
  function init(){
   self.trigger('init');
   ymaps.ready(function(){
    self.prepare();
    self.addMarks();
    self.trigger('ready');
   });
  }
 }
 //-----------------
 mgr.extend(Map);
 //-----------------
 $.extend(Map.prototype,{
  getData:function(){
   var self=this;

   return {
    map:self.props.map,
    zoom:self.options.zoom,
    center:self.options.center
   };
  },
  prepare:function(){
   var self=this;

   if(self.options.data)
    $.extend(self.options,self.props.container.data(self.options.data));

   self.props.map=new ymaps.Map(self.props.container.get(0),{
    center:self.options.center,
    zoom:self.options.zoom,
    type:self.options.type
   });
   
   if(self.options.controls)
   {
    if(self.options.controls.zoom)
    {
     if(self.options.controls.zoom.small)
      self.props.map.controls.add("smallZoomControl",self.options.controls.zoom.position);else
      self.props.map.controls.add("zoomControl",self.options.controls.zoom.position);
    }
    if(self.options.controls.type)
     self.props.map.controls.add(new ymaps.control.TypeSelector(["yandex#map", "yandex#satellite", "yandex#hybrid", "yandex#publicMap"]),self.options.controls.type.position);
   }
  },
  getMark:function(opts){
   var self=this,
       d;

   if('ll' in opts)
   {
    d=mgr.get('lib.utils.item')(self.props.marks,function(obj){
     var c=obj.geometry.getCoordinates();

     return c[0]==opts.ll[0]&&c[1]==opts.ll[1];
    });
   }

   return d;
  },
  addMark:function(opts){
   var self=this,
       ready,
       dfd;

   if('mark' in opts)
   {
    m=opts.mark;
   }else
   {
    m=$.extend({},self.options.mark);
    if('ll' in opts)
     m.ll=opts.ll;
   }

   if(opts.address)
   {
    dfd=$.Deferred();
    ready=$.Deferred();
    ymaps.geocode(opts.address,{
     result:1
    }).then(function(res){
      var r=res.geoObjects.get(0);

      m.ll=r?r.geometry.getCoordinates():null;
      ready.resolve();
    });
   }

   $.when(ready).done(function(){
    if(!m.ll||~self.getMark({ll:m.ll}).index)
    {
     if(self.options.notify)
     {
      if(!m.ll)
       console.log('Geo not found');else
       console.log('Placemark already exists');
     }

     if(dfd)
      dfd.resolve([m.ll]);

     return;
    }

    self.props.marks.push(new ymaps.Placemark(m.ll,{
     balloonContent:m.html,
     hintContent:m.hint
    },opts.mark));

    self.props.map.geoObjects.add(self.props.marks[self.props.marks.length-1]);
    if(dfd)
     dfd.resolve([m.ll]);
   });

   return dfd;
  },
  removeMark:function(opts){
   var self=this,
       ll,
       ready,
       d,
       dfd;

   if(opts.address)
   {
    dfd=$.Deferred();
    ready=$.Deferred();
    ymaps.geocode(opts.address,{
     result:1
    }).then(function(res){
      var r=res.geoObjects.get(0);

      ll=r?r.geometry.getCoordinates():null;
      ready.resolve();
     });
   }

   $.when(ready).done(function(){
    d=ll?self.getMark({ll:ll}):{index:-1};

    if(!~d.index)
    {
     if(self.options.notify)
     {
      if(!ll)
       console.log('Geo not found');else
       console.log('Placemark not found');
     }

     if(dfd)
      dfd.resolve([ll]);

     return;
    }

    self.props.marks.splice(d.index,1);

    self.props.map.geoObjects.remove(d.obj);
    if(dfd)
     dfd.resolve([ll]);
   });

   return dfd;
  },
  addMarks:function(){
   var self=this,
       m,
       mData;

   for(var i=0;i<self.options.marks.length;i++)
   {
    mData={};
    m=self.options.marks[i];
    mData['ll']=m.ll;
    mData['html']=m.html;
    mData['hint']=m.hint;
    mData['iconImageHref']=m.src;
    mData['preset']=m.preset;
    mData['iconImageSize']=m.size;
    mData['iconImageOffset']=m.offset;
    if(m.shadow)
    {
     mData['iconShadow']=true;
     mData['iconShadowImageHref']=m.shadow.src;
     mData['iconShadowImageSize']=m.shadow.size;
     mData['iconShadowImageOffset']=m.shadow.offset;
    }
    mData['balloonOffset']=m.balloonOffset;

    self.addMark({mark:mData});
   }
  }
 });
  
 return Map;
}));