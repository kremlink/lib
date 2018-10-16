/*!by Alexander Kremlev*/
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
 mgr.lib['Cart']=Cart;

 function Cart(opts){
  "use strict";

  var self=this;

  mgr.Base.apply(this,arguments);

  self.options=$.extend(true,{
   addedClass:'cart-added',
   emptyClass:'cart-empty',
   requestClass:'cart-request',
   storage:'cart',
   liveUpdate:false,
   url:'php.php',
   ajaxFails:function(s){
    switch(s)
    {
     case 'save':
      alert('Запрос на сохранение не прошел. Попробуйте позже...');
     break;
     case 'clear':
      alert('Запрос на очищение не прошел. Попробуйте позже...');
     break;
     case 'change':
      alert('Запрос на изменение количества не прошел. Попробуйте позже...');
     break;
     case 'add':
      alert('Запрос на добавление не прошел. Попробуйте позже...');
     break;
     case 'remove':
      alert('Запрос на удаление не прошел. Попробуйте позже...');
     break;
     case 'tooFast':
      alert('Предыдущий запрос еще не обработан. Попробуйте позже...');
     break;
    }
   },
   params:{main:'cart',ids:'ids',what:'what'},
   ajaxOnChange:false,
   added:opts.added||function(obj){
    return obj;
   },
   getAmount:opts.getAmount||function(obj){
    if(obj.length)
     return +obj.val();else
     return 1;
   },
   formatPrice:opts.formatPrice||function(v){
    return v.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g,'$1 ');
   },
   setAmount:opts.setAmount||function(obj,value){
    if(!obj.length)
     return;

    if(obj.is('input'))
     obj.val(value);else
    obj.text(value);
   }
  },opts);

  self.props={
   data:{},
   sum:$(opts.sum),
   amount:$(opts.amount),
   clear:$(opts.clear),
   save:$(opts.save),
   goodsCount:0,
   ajax:null,
   goodies:{
    adderContainer:$(opts.goodies.adder.container),
    amountContainer:$(opts.goodies.amount.container)
   },
   cart:{
    container:$(opts.cart.container.selector),
    insert:null,
    template:$(opts.cart.template)
   },
   form:{
    container:$(opts.form.container.selector),
    insert:null,
    template:$(opts.form.template)
   }
  };

  self.props.cart.insert=self.props.cart.container.find(opts.cart.container.insert);
  self.props.form.insert=self.props.form.container.find(opts.form.container.insert);

  init();

  function init(){
   self.trigger('init');
   self.reconstruct();
   self.setHandlers();
  }
 }
 //-----------------
 mgr.extend(Cart);
 //-----------------
 $.extend(Cart.prototype,{
  setHandlers:function(){
   var self=this;

   self.props.goodies.adderContainer.on('click',self.options.goodies.adder.selector,function(e){
    self.add($(this));

    e.preventDefault();
   });

   self.props.clear.on('click',function(e){
    self.clear({type:'clear'});

    e.preventDefault();
   });

   self.props.save.on('click',function(e){
    self.save({data:self.props.data,what:{type:'save'},success:function(){
     self.trigger('saved');
    },fail:function(reqProcessed){
     if(!reqProcessed)
      self.options.ajaxFails('save');
    }});

    e.preventDefault();
   });

   if(self.options.liveUpdate)
    self.onstorage();
  },
  onstorage:function(){
   var self=this;

   mgr.helpers.win.on('storage',function(){
    setTimeout(function(){
     self.clear({type:'storage'});
     self.reconstruct();
    },10);//IE fix
   });
  },
  save:function(opts){
   var self=this,
       fail;

   mgr.helpers.html.addClass(self.options.requestClass);
   if(self.props.ajax&&self.props.ajax.readyState!=4)
   {
    fail=opts.fail;
    opts.fail=function(){
     fail(true);//"true" means alert suppression of this type

     self.options.ajaxFails('tooFast');
    };

    self.failedAjax(opts);
    return;
   }

   if(self.options.ajaxOnChange||opts.what.type=='save')
   {
    self.props.ajax=$.ajax({
     url:self.options.url,
     type:'POST',
     data:self.ajaxData(opts.what)
    });
   }

   $.when(self.props.ajax).then(function(){
    opts.success();
    mgr.helpers.html.removeClass(self.options.requestClass);
    self.props.ajax=null;
   },function(){
    self.failedAjax(opts);
    mgr.helpers.html.removeClass(self.options.requestClass);
    self.props.ajax=null;
   });
  },
  clear:function(opts){
   var self=this;

   if(opts.type=='clear')
   {
    self.save({data:{},what:{type:'clear'},success:function(){
     for(var x in self.props.data)
      delete self.props.data[x];
     localStorage.setItem(self.options.storage,self.storeData(self.props.data));
     self.props.goodsCount=0;
     self.props.cart.insert.html('');
     self.props.form.insert.html('');
     self.trigger('clear');
     self.trigger('empty');
     self.props.cart.container.addClass(self.options.emptyClass);
     self.props.form.container.addClass(self.options.emptyClass);
     self.sum();
    },fail:function(reqProcessed){
     if(!reqProcessed)
      self.options.ajaxFails('clear');
    }});
   }else
   {
    for(var x in self.props.data)
     delete self.props.data[x];
    self.props.cart.insert.html('');
    self.props.form.insert.html('');

    self.props.goodsCount=0;
   }
  },
  addItem:function(d){
   var self=this;

   return {
    cart:$(Mustache.render(self.props.cart.template.html(),d)).appendTo(self.props.cart.insert),
    form:$(Mustache.render(self.props.form.template.html(),d)).appendTo(self.props.form.insert)
   };
  },
  setDataElement:function(opts){
   var self=this,
       d=opts.obj?{
        cart:{
         block:opts.obj.cart,
         amount:opts.obj.cart.find(self.options.cart.container.amount),
         price:opts.obj.cart.find(self.options.cart.container.price)
        },
        form:{
         block:opts.obj.form,
         amount:opts.obj.form.find(self.options.form.container.amount),
         price:opts.obj.form.find(self.options.form.container.price)
        }
       }:{cart:{},form:{}};

   d.data=opts.data;
   self.props.data[opts.data.id]=d;

   return d;
  },
  reconstruct:function(){
   var self=this,
       s=localStorage.getItem(self.options.storage);

   if(!s&&!(self.options.saved&&self.options.saved.length)||s&&s=='[]')
   {
    self.trigger('empty');
    self.props.cart.container.addClass(self.options.emptyClass);
    self.props.form.container.addClass(self.options.emptyClass);
    self.sum();
    return;
   }

   if(s)
   {
    s=JSON.parse(s);
   }else
   {
    s=self.options.saved;
    localStorage.setItem(self.options.storage,JSON.stringify(s));
   }

   for(var i=0;i<s.length;i++)
   {
    self.props.goodsCount++;
    self.setDataElement({data:s[i],obj:self.addItem(s[i])});
   }

   self.activateGoodies();
   self.sum();
  },
  activateGoodies:function(){
   var self=this;

   if(!self.options.addedClass)
    return;

   for(var x in self.props.data)
   {
    self.props.goodies.adderContainer.find(self.options.goodies.adder.selector).each(function(){
     var obj=$(this);

     if(obj.data(self.options.goodies.adder.data)['id']==x)
      self.options.added(obj).addClass(self.options.addedClass);
    });
   }
  },
  changeAmount:function(opts){//external
   var self=this,
       d=self.props.data,
       old=d[opts.id].data['amount'];

   d[opts.id].data['amount']=+opts.amount;

   self.save({data:d,what:{type:'change',id:opts.id},success:function(){
    self.options.setAmount(d[opts.id].cart.amount,+opts.amount);
    self.sum();
    localStorage.setItem(self.options.storage,self.storeData(self.props.data));
   },fail:function(reqProcessed){
    d[opts.id].data['amount']=old;
    if(!reqProcessed)
     self.options.ajaxFails('change');
   }});
  },
  add:function(caller){
   var self=this,
       data=$.extend(true,{},caller.data(self.options.goodies.adder.data)),
       am=self.options.goodies.amount?self.options
        .getAmount(self.props.goodies.amountContainer
         .find(self.options.goodies.amount.selector)
         .filter(function(){
          return $(this).data(self.options.goodies.amount.data)==data['id'];
         })):1,
       d=self.props.data[data['id']],
       old=d?d.data['amount']:-1;

   if(d)
   {
    d.data['amount']=data['mode']=='replace'?am:d.data['amount']+am;
   }else
   {
    data['amount']=am;
    self.setDataElement({data:data});
   }

   self.save({data:self.props.data,what:{type:'add',id:data['id']},success:function(){
    if(!d)
    {
     d=self.setDataElement({data:data,obj:self.addItem(data)});

     if(self.options.addedClass)
      self.options.added(caller).addClass(self.options.addedClass);
     self.props.cart.container.removeClass(self.options.emptyClass);
     self.props.form.container.removeClass(self.options.emptyClass);
     self.props.goodsCount++;
    }

    self.options.setAmount(d.cart.amount,d.data['amount']);
    self.options.setAmount(d.form.amount,d.data['amount']);
    self.trigger('add');
    self.sum();
    localStorage.setItem(self.options.storage,self.storeData(self.props.data));
   },fail:function(reqProcessed){
    if(d)
     d.data['amount']=old;else
     delete self.props.data[data['id']];

    if(!reqProcessed)
     self.options.ajaxFails('add');
   }});
  },
  remove:function(id){
   var self=this,
       d=self.props.data[id];

   delete self.props.data[id];

   self.save({data:self.props.data,what:{type:'remove',id:id},success:function(){
    if(!--self.props.goodsCount)
    {
     self.trigger('empty');
     self.props.cart.container.addClass(self.options.emptyClass);
     self.props.form.container.addClass(self.options.emptyClass);
    }

    if(self.options.addedClass)
    {
     self.options.added(self.props.goodies.adderContainer.find(self.options.goodies.adder.selector).filter(function(){
      return id==$(this).data(self.options.goodies.adder.data)['id'];
     })).removeClass(self.options.addedClass);
    }

    d.cart.block.remove();
    d.form.block.remove();

    self.trigger('remove');
    self.sum();
    localStorage.setItem(self.options.storage,self.storeData(self.props.data));
   },fail:function(reqProcessed){
    self.props.data[id]=d;

    if(!reqProcessed)
     self.options.ajaxFails('remove');
   }});
  },
  failedAjax:function(opts){
   if(opts.fail)
    opts.fail();
  },
  ajaxData:function(data){
   var self=this,
       obj={ids:[]};

   for(var x in self.props.data)
   {
    obj.ids.push({
     id:x,
     amount:self.props.data[x].data['amount']
    });
   }

   obj[self.options.params.what]={
    type:data.type
   };

   if('id' in data)
    obj[self.options.params.what]['id']=data.id;

   return obj;
  },
  storeData:function(data){
   var s=[];

   for(var x in data)
    s.push(data[x].data);
   
   return JSON.stringify(s);
  },
  sum:function(){
   var self=this,
       t,
       tt,
       m=0,
       p=0,
       d;

   for(var x in self.props.data)
   {
    d=self.props.data[x];
    t=d.data['amount']*d.data['price'];
    tt=self.options.formatPrice(t);
    d.cart.price.text(tt);
    d.form.price.text(tt);
    m+=d.data['amount'];
    p+=t;
   }

   self.props.amount.text(m);
   self.props.sum.text(self.options.formatPrice(p));
  }
 });

 return Cart;
}));
