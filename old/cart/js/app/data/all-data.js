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
  cart:{
   saved:{
    data:[{"id":"id1","name":"Goodie1","amount":1,"price":1}]
   },
   sum:'#sum',
   amount:'#amount',
   clear:'#clear',
   save:'#save',
   //ajaxOnChange:true,
   url:'cart.php',
   goodies:{
    adder:{data:'cart',container:'#goods',selector:'.adder'},
    amount:{data:'cart',container:'#goods',selector:'.amount'}
   },
   cart:{
    container:{selector:'#cart',insert:'.contents',block:'.cart-goodie',amount:'.amount',price:'.price span'},
    template:'#cart-template'
   },
   form:{
    container:{selector:'#form',insert:'.contents',block:'.form-goodie',amount:'.amount',price:'.price span'},
    template:'#form-template'
   }
  },
  //
  remove:{
   container:{selector:'#cart,#form',remove:'.remove'}
  },
  change:{
   container:{selector:'#form',change:'.amount'}
  }
 });
 
 return mgr.data;
}));