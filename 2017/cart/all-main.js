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
 mgr.setBlock(function(){
  var shared={
   cart:null
  };

  Mustache.tags=["[{", "}]"];
  //------------------------------------------------------
  //------------------------------------------------------
  var cart={
   events:{
    add:function(){
     var u=this.getInner('extra');

     u.$notify.removeClass(u.cls);
     u.$notify[0].offsetHeight;
     u.$notify.addClass(u.cls);
    },
    sum:function(e,opts){
     var u=this.userObject;

     //u.$discount.text(opts.type=='data'?opts.opts.data.shared['sumDiscount']:opts.shared['sumDiscount']);
     
     for(var x in opts.data)
     {
      if(opts.data.hasOwnProperty(x))
      {
       u.$items.filter(function(){
        return $(this).find(d.goodies.adder.selector).data(d.goodies.adder.data)['id']==x;
       }).find(u.am).text(opts.data[x].data.amount);//old strange unoptimal amount setting? what for?
      }
     }
    }
   },
   fromServer:function(data){//ateka as an example
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
   },
   fromSource:function(opts){//sizes object - external
     var fp=this.getOpts().funcs.formatPrice,
         price=function(d){
          var p=0;

          for(var x in d)
           if(d.hasOwnProperty(x))
            p+=d[x].data.amount*d[x].data[sizes.corp.what].data[d[x].data[sizes.corp.what].active].price;

          return p;
         };

     if(shared.t=='corp')
     {
      return opts.type=='partial'?opts.data.data[sizes.corp.what].data[opts.data.data[sizes.corp.what].active].price:price(opts.data);
     }

     if(shared.t=='pack')
      return opts.type=='partial'?fp({src:opts.data.data.price}):opts.info.price+opts.info.amount*sizes.price();
    }
  };

  var remove=function(opts){
   var d=opts.data,
   cart=mgr.get('all.cart.cart');

   d.$container.on('click',d.by,function(e){
    cart.method('remove',$(this).data(d.data));

    e.preventDefault();
   });
  };

  var amount=function(opts){
   var d=opts.data,
   value=mgr.get('lib.utils.value');

   d.$container.on('click',d.plus+','+d.minus,function(e){
    var obj=$(this),
        am=obj.parent().find(d.into),
        v=parseInt(value({obj:am}));

    v=obj.is(d.plus)?v+1:(v>1?v-1:v);
    value({obj:am,value:v});

    if(!obj.closest(d.$product).length)
     shared.cart.method('changeAmount',{id:am.data(d.data),amount:v});

    e.preventDefault();
   });
  };

  var inputs={
   empty:function(e,opts){
    opts.input.val(1);
   },
   change:function(e,opts){
    var u=this.getInner('extra'),
        v=parseInt(opts.input.val());

    if(v==0)
    {
     opts.input.val(1);
     v=1;
    }

    if(!opts.delegateContainer.is(u.product))
     shared.cart.method('changeAmount',{id:opts.input.data(u.data),amount:v});
   }
  };
  
  var sizes=function(opts){
    $(opts.data.container).on('change',opts.data.select,function(){
     var obj=$(this);

     obj.closest(opts.data.parent).find(opts.data.into).text(obj.val());
     shared.cart.method('sum');
    });
   };
  //------------------------------------------------------
  //------------------------------------------------------
  $(function(){
   mgr.set({data:'constr.sizes',object:sizes,call:true});
   shared.cart=mgr.set({data:'all.cart.cart',object:'Cart',on:cart.events,extra:{funcs:{
    added:cart.added,
    fromSource:cart.fromSource
   }}});
   mgr.set({data:'all.cart.remove',object:remove,call:true});
   mgr.set({data:'all.cart.amount',object:amount,call:true});
   mgr.set({data:'all.cart.inputs',object:'Input',on:inputs});
  });
 });
}));