/*!by Alexander Kremlev*/

(function (factory) {
 'use strict';
 
 if(typeof define==='function'&&define.amd){
  define(['jquery','base'],factory);
 }else
 {
  if('theApp' in window)
  {
   if(!theApp.lib)
    throw 'theApp.lib doesn\'t exist!';
   theApp.set({data:'lib.Map',object:factory(jQuery,theApp),lib:false});
  }
 }
}(function($,mgr){
 mgr.extend(Map);

 function Map(){
  "use strict";

  this.options={
   notify:true,
   map:{
    zoom:16,
    center:[55.750262,37.621791],
    type:'yandex#map'
   },
   controls:{},
   markers:[]
  };

  this.props={
   container:null,//init
   map:null,
   markers:[],
   qResult:null,
   ready:null//map ready
  };
 }
 //-----------------
 $.extend(Map.prototype,{
  init:function(){
   var self=this;

   self.options=$.extend(true,self.options,self.data.options);

   self.props=$.extend(true,self.props,{
    container:$(self.data.container)
   });

   self.trigger('init');
   self.props.ready=ymaps.ready(function(){
    self.prepare();
   });
  },
  getData:function(){
   var self=this;

   return {
    map:self.props.map,
    zoom:self.options.zoom,
    center:self.options.center,
    markers:self.props.markers,
    qResult:self.props.qResult
   };
  },
  prepare:function(){
   var self=this;

   self.props.map=new ymaps.Map(self.props.container.get(0),self.options.map);

   for(var x in self.options.controls)
   {
    if(self.options.controls.hasOwnProperty(x))
     self.props.map.controls.add(x,self.options.controls[x]);
   }

   for(var i=0;i<self.options.markers.length;i++)
    self.addMarker({marker:self.options.markers[i]});

   self.props.qResult=ymaps.geoQuery(self.props.markers).addToMap(self.props.map);

   self.trigger('ready',[{
    map:self.props.map,
    result:self.props.qResult
   }]);
  },
  moveTo:function(opts){
   var self=this;

   self.props.ready.then(function(){
    self.props.map.panTo(opts.ll||self.props.markers[opts.index].geometry.getCoordinates());
   });
  },
  addMarker:function(opts){
   var self=this,
       m,
       ready,
       dfd;

   if('marker' in opts)
   {
    m=opts.marker;
   }else
   {
    m=$.extend({},self.options.marker);
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
    if(!m.ll||~self.getMarker({ll:m.ll}).index)
    {
     if(self.options.notify)
     {
      if(!m.ll)
       console.log('Geo not found');else
       console.log('Placemarker already exists');
     }

     if(dfd)
      dfd.resolve([m.ll]);

     return;
    }

    self.props.markers.push(new ymaps.Placemark(m.ll,m.props,m.opts));
    if(dfd)
     dfd.resolve([m.ll]);
   });

   return dfd;
  },
  getMarker:function(opts){
   var self=this,
    d;

   if('ll' in opts)
   {
    d=$.grep(self.props.markers,function(obj){
     var c=obj.geometry.getCoordinates();

     return c[0]==opts.ll[0]&&c[1]==opts.ll[1];
    });
   }

   return {obj:d,index:self.props.markers.indexOf(d)};
  },
  removeMarker:function(opts){
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
    d=ll?self.getMarker({ll:ll}):{index:-1};

    if(!~d.index)
    {
     if(self.options.notify)
     {
      if(!ll)
       console.log('Geo not found');else
       console.log('Placemarker not found');
     }

     if(dfd)
      dfd.resolve([ll]);

     return;
    }

    self.props.markers.splice(d.index,1);

    self.props.map.geoObjects.remove(d.obj);
    if(dfd)
     dfd.resolve([ll]);
   });

   return dfd;
  }
 });
  
 return Map;
}));