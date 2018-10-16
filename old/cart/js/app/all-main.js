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
 if(mgr.core.override&&!mgr.core.overridden)
 {
  $.extend(true,mgr.data,mgr.core.override);
  mgr.core.overridden=true;
 }
 //---------
 Mustache.tags=["[{", "}]"];

 var remove=function(s){
  var d=mgr.get(s),
      cart=mgr.get('cart');

  $(d.container.selector).on('click',d.container.remove,function(e){
   cart.method('remove',$(this).data('cart'));

   e.preventDefault();
  });
 };

 var change=function(s){
  var d=mgr.get(s),
   cart=mgr.get('cart');

  $(d.container.selector).on('input',d.container.change,function(e){
   cart.method('changeAmount',{id:$(this).data('cart'),amount:this.value});

   e.preventDefault();
  });
 };
 
 var cart={
  events:{
   add:function(){
    
   },
   sum:function(e,opts){
    
   }
  },
  funcs:{
   formatPrice:function(opts){
    if('dest' in opts)
     return opts.dest.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g,'$1 ').replace('.',',')+(parseFloat(opts.dest)!=parseInt(opts.dest)?'':',00');
    if('src' in opts)
     return +opts.src.toString().replace(',','.').replace(/\s+/g,'');
    if('fix' in opts)
     return +opts.fix.toFixed(2);
   },
   fromServer:function(data){
    var t;

    switch(data.type)
    {
     case 'partial-empty':
     case 'partial-reconstruct':
      t=data.data['sumPrice'];
      t=t?t:0;
      return {
       sum:t,
       extend:{sumPrice:t}
      };
     case 'partial':
      t=data.r.data[data.id];
      return {
       sum:t?t['sumPrice']:0,
       extend:data.r.data[data.id]
      };
     case 'all-reconstruct':
      t=data.shared['sumPrice'];
      t=t?t:0;
      return {
       sum:t,
       extend:{sumPrice:t}
      };
     case 'all':
      t=data.r===true;
      return {
       sum:t?0:data.r.shared['sumPrice'],
       extend:t?{}:data.r.shared
      };
    }
   }
  }
 };
 //---------
 mgr.helpers.doc.ready(function(){
  mgr.setObject('cart','Cart',{
   on:cart.events,
   formatPrice:cart.funcs.formatPrice,
   fromServer:cart.funcs.fromServer
  });
  remove('data.remove');
  change('data.change');
 });
}));