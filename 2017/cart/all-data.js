(function (factory) {
 'use strict';
 
  if(typeof define==='function'&&define.amd)
  {
   define(['jquery','base'],factory);
  }else
  {
   factory(jQuery,SiteManager);
  }
}(function($,mgr){
 $.extend(true,mgr.data,{
  all:{
   cart:{
    pop:{
     callers:'.cart-pop .toggle',
     pops:'.cart-pop',
     toggle:true,
     activeClass:'active1'
    },
    cart:{
     objs:{
      sum:'.cart-pop .all,.cart-form .all',
      amount:'.cart-pop .n',
      clear:'#clear',
      save:'#save'
     },
     saved:{
      //data:[{"id":"id1","name":"Goodie1","amount":1,"price":1}]
      //data:[{"id":"id1","amount":3,"name":"Пряник с логотипом «Совет Проректоров» — 7 см","sizes":[{"price":"120","name":"Мини","selected":"true"},{"price":"200","name":"Средний"}],"ref":"1.html","price":"120"}]
      data:[]
     },
     liveUpdate:true,
     url:'cart.php',
     goodies:{
      adder:{data:'cart',container:'.goods-block,.product-block .info',selector:'.add'},
      amount:{data:'cart',container:'.product-block .info',selector:'.amount'}
     },
     cart:{
      container:{selector:'.cart-pop',insert:'.goods',block:'.string',amount:'.amount',price:'.price'},
      template:'#cart-template'
     },
     form:{
      container:{selector:'.cart-form',insert:'.goods',block:'.string',amount:'.amount',price:'.p-price',
       extra:{select:'select'}},
      template:'#form-template'
     },
     extra_:{
      //$notify:'.cart-pop .added',
      //cls:'anim'
      item:'.goods-item',
      $items:'.goods-item',
      am:'.am'
     }
    },
    remove:{
     $container:'.cart-pop,.cart-form',
     by:'.del',
	 data:'cart'
    },
    amount:{
     $container:'.cart-pop,.cart-form,.product-block .info',
     $product:'.product-block .info',
     plus:'.plus',
     minus:'.minus',
     into:'.amount',
     data:'cart'
    },
    inputs:{
     inputs:{container:'.cart-form,.product-block .info',selector:'.amount'},
     extra_:{
      data:'cart',
      product:'.product-block .info'
     }
    },
    sizes:{
     container:'.cart-form',
     parent:'.sizes',
     into:'.s-curr',
     select:'select'
    }
   }
  }
 });
 
 return mgr.data;
}));