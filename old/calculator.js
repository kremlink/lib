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
 mgr.lib['Calculator']=function(opts){
  "use strict";
  
  var self=this;
  
  mgr.Base.apply(this,arguments);
  
  self.options=$.extend(true,{
   activeClass:'active',
   hash:'calc',
   useHash:true,
   numEnd:[' рубль',' рубля',' рублей']
  },opts);
  
  self.props={
   sum:$(self.options.sum),
   ref:$(self.options.ref),
   social:$(self.options.social),
   baseRef:self.options.baseRef,
   constrRef:self.options.baseRef,
   mult:1,
   prices:[],
   weights:{multWeight:[],sumWeight:[]}
  };
  
  self.props.ref.text(self.props.baseRef);
  
  init();
  
  function init(){
   self.trigger('init',[{ref:self.props.ref}]);
  }
 };
 //-----------------
 mgr.extend(mgr.lib['Calculator']);
 //-----------------
 $.extend(mgr.lib['Calculator'].prototype,{
  sum:function(){
   var self=this,
       s=0,
       w=0,
       ar;
   
   for(var i=0;i<self.props.prices.length;i++)
   {
    s+=self.props.prices[i]!=undefined?self.props.prices[i]*self.props.mult:0;
    w+=self.props.weights.sumWeight[i]!=undefined?self.props.weights.sumWeight[i]:0;
   }
   
   s=Math.round(s);
   self.props.sum.text(mgr.utils['formatPrice'](s)+(self.options.numEnd?mgr.utils['numberEnd'](s,self.options.numEnd):''));
   ar=$.grep(self.props.weights.multWeight,function(obj){
    return obj;
   });
   
   self.trigger('progress',[{weight:w+(ar.length?ar[0]:0),constrRef:self.props.constrRef}]);
  },
  constructRef:function(){
   var self=this,
       n=0,
       ar=$.grep(self.props.weights.multWeight,function(obj){
        return obj;
       });
   
   for(var i=0;i<self.props.prices.length;i++)
    n|=self.props.prices[i]==undefined||!self.props.prices[i]?0:Math.pow(2,i);
   
   if(!n&&!ar.length)
    return self.props.baseRef;
   
   n=n.toString(36);
   
   return self.props.baseRef+(self.options.useHash?'#':'?')+self.options.hash+'='+n+(ar.length?'/'+$.inArray(ar[0],self.props.weights.multWeight):'');
  },
  recalc:function(opts){
   var self=this;
   
   if(opts.add)
   {
    if(opts.mult)
    {
     self.props.mult=opts.mult;
     self.props.weights.multWeight[opts.index]=opts.weight;
    }
    if(opts.price)
    {
     self.props.prices[opts.index]=opts.price;
     self.props.weights.sumWeight[opts.index]=opts.weight;
    }
   }else
   {
    if(opts.mult)
    {
     self.props.mult=1;
     self.props.weights.multWeight[opts.index]=0;
    }
    if(opts.price)
    {
     self.props.prices[opts.index]=0;
     self.props.weights.sumWeight[opts.index]=0;
    }
   }
   
   self.props.constrRef=self.constructRef();
   
   self.props.ref.text(self.props.constrRef);
   
   self.sum();
  }
 });
  
 return mgr.lib['Calculator'];
}));