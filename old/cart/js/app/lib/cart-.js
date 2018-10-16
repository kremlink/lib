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
   requestClass:null,
   storage:'cart',
   storageData:{
    data:'data',
    fix:'ie-fix',
    old:'old'
   },
   liveUpdate:false,
   url:'php.php',
   type:'POST',
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
   params:{ids:'ids',what:'what'},
   ajaxOnChange:false,
   added:opts.added||function(obj){
    return obj;
   },
   getAmount:opts.getAmount||function(obj){
    if(obj.length)
     return +obj.val();else
     return 1;
   },
   formatPrice:opts.formatPrice||function(opts){
    if('dest' in opts)
     return opts.dest.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g,'$1 ');
    if('src' in opts)
     return +opts.src;
    if('fix' in opts)
     return +opts.fix;

    throw "Incorrect formatPrice args";
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
   unique:+new Date(),
   goodies:{
    adderContainer:opts.goodies&&opts.goodies.adder?$(opts.goodies.adder.container):null,
    amountContainer:opts.goodies&&opts.goodies.amount?$(opts.goodies.amount.container):null
   },
   cart:{
    container:opts.cart?$(opts.cart.container.selector):null,
    insert:null,
    template:opts.cart?$(opts.cart.template):null
   },
   form:{
    container:opts.form?$(opts.form.container.selector):null,
    insert:null,
    template:opts.form?$(opts.form.template):null
   }
  };

  if(opts.cart)
   self.props.cart.insert=self.props.cart.container.find(opts.cart.container.insert);
  if(opts.form)
   self.props.form.insert=self.props.form.container.find(opts.form.container.insert);

  init();

  function init(){
   self.trigger('init');
   self.prepareStorage();
   self.reconstruct();
   self.setHandlers();
  }
 }
 //-----------------
 mgr.extend(Cart);
 //-----------------
 $.extend(Cart.prototype,{
  prepareStorage:function(){
   var self=this,
       s;

   if(self.options.storage)
   {
    s=JSON.parse(localStorage.getItem(self.options.storage));
    if(!mgr.utils.isO(s)||!s[self.options.storageData.data])
     localStorage.removeItem(self.options.storage);
   }
  },
  setHandlers:function(){
   var self=this;

   if(self.options.goodies)
   {
    self.props.goodies.adderContainer.on('click',self.options.goodies.adder.selector,function(e){
     self.add($(this));

     e.preventDefault();
    });
   }

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
   var self=this,
       fn=function(){
        self.clear({type:'storage'});
        self.reconstruct(true);
       };

   mgr.helpers.win.on('storage',function(e){
    if(e.originalEvent.key!=self.options.storage||e.originalEvent.newValue&&JSON.parse(e.originalEvent.newValue)[self.options.storageData.fix]==self.props.unique)
     return;

    if(mgr.utils.browser.ie)
    {
     setTimeout(function(){
      fn();
     },10);//ie fix
    }else
    {
     fn();
    }
   });
  },
  save:function(opts){
   var self=this,
       fail;

   if(self.options.requestClass)
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
     type:self.options.type,
     data:self.ajaxData(opts.what)
    });
   }

   $.when(self.props.ajax).then(function(){
    opts.success();
    if(self.options.requestClass)
     mgr.helpers.html.removeClass(self.options.requestClass);
    self.props.ajax=null;
   },function(){
    self.failedAjax(opts);
    if(self.options.requestClass)
     mgr.helpers.html.removeClass(self.options.requestClass);
    self.props.ajax=null;
   });
  },
  store:function(){
   var self=this;

   if(self.options.storage)
    localStorage.setItem(self.options.storage,self.storeData(self.props.data));
  },
  emptied:function(f){
   var self=this;

   if(self.options.cart)
    self.props.cart.container[f?'addClass':'removeClass'](self.options.emptyClass);
   if(self.options.form)
    self.props.form.container[f?'addClass':'removeClass'](self.options.emptyClass);
  },
  clear:function(opts){
   var self=this;

   if(opts.type=='clear')
   {
    self.save({data:{},what:{type:'clear'},success:function(){
     for(var x in self.props.data)
      delete self.props.data[x];
     self.store();
     self.props.goodsCount=0;
     self.emptied(true);
     if(self.options.cart)
      self.props.cart.insert.html('');
     if(self.options.form)
      self.props.form.insert.html('');

     self.sum();
     self.trigger('clear');
     self.trigger('empty');
    },fail:function(reqProcessed){
     if(!reqProcessed)
      self.options.ajaxFails('clear');
    }});
   }else
   {
    for(var x in self.props.data)
     delete self.props.data[x];

    if(self.options.cart)
     self.props.cart.insert.html('');
    if(self.options.form)
     self.props.form.insert.html('');

    self.props.goodsCount=0;
   }
  },
  addItem:function(d){
   var self=this;

   return {
    cart:self.options.cart?$(Mustache.render(self.props.cart.template.html(),d)).appendTo(self.props.cart.insert):null,
    form:self.options.form?$(Mustache.render(self.props.form.template.html(),d)).appendTo(self.props.form.insert):null
   };
  },
  setDataElement:function(opts){
   var self=this,
       d=opts.obj?{
        cart:self.options.cart?{
         block:opts.obj.cart,
         amount:opts.obj.cart.find(self.options.cart.container.amount),
         price:opts.obj.cart.find(self.options.cart.container.price)
        }:null,
        form:self.options.form?{
         block:opts.obj.form,
         amount:opts.obj.form.find(self.options.form.container.amount),
         price:opts.obj.form.find(self.options.form.container.price)
        }:null
       }:{cart:{},form:{}};

   d.data=opts.data;
   self.props.data[opts.data.id]=d;

   return d;
  },
  reconstruct:function(storeFlag){
   var self=this,
       s=self.options.storage?localStorage.getItem(self.options.storage):null;

   if(!s&&!(self.options.saved&&self.options.saved.data.length)||s&&!JSON.parse(s)[self.options.storageData.data].length)
   {
    self.emptied(true);
    self.activateGoodies();
    self.sum();
    self.trigger('empty');
    return;
   }

   if(s)
    s=JSON.parse(s)[self.options.storageData.data];else
    s=self.options.saved.data;

   for(var i=0;i<s.length;i++)
   {
    self.props.goodsCount++;
    self.setDataElement({data:s[i],obj:self.addItem(s[i])});
   }

   if(!storeFlag)
   {
    self.store();
    self.trigger('storage');
   }

   self.activateGoodies();
   self.sum();
  },
  activateGoodies:function(){
   var self=this;

   if(!self.options.addedClass||!self.options.goodies)
    return;

   self.props.goodies.adderContainer
    .find(self.options.goodies.adder.selector)
    .removeClass(self.options.addedClass).each(function(){
     var obj=$(this),
         data=obj.data(self.options.goodies.adder.data);

     if(data['id'] in self.props.data)
     {
      self.options.added(obj).addClass(self.options.addedClass);
      if(self.options.goodies.amount)
       self.options.setAmount(self.getAmountObject(data['id']),self.props.data[data['id']].data['amount']);
     }
    });
  },
  changeAmount:function(opts){//external
   var self=this,
       d=self.props.data,
       old=d[opts.id].data['amount'];

   d[opts.id].data['amount']=+opts.amount;

   self.save({data:d,what:{type:'change',id:opts.id},success:function(){
    if(self.options.cart)
     self.options.setAmount(d[opts.id].cart.amount,+opts.amount);
    self.sum();
    self.store();
   },fail:function(reqProcessed){
    d[opts.id].data['amount']=old;
    if(!reqProcessed)
     self.options.ajaxFails('change');
   }});
  },
  getAmountObject:function(id){
   var self=this;

   return self.props.goodies.amountContainer
    .find(self.options.goodies.amount.selector)
    .filter(function(){
     return $(this).data(self.options.goodies.amount.data)==id;
    });
  },
  add:function(caller){
   var self=this,
       cData=caller.data(self.options.goodies.adder.data),
       data,
       am,
       d,
       old;

   if(!cData||!('id' in cData))
    throw 'No id found';

   if(caller.hasClass(self.options.addedClass)&&cData['mode']=='toggle')
   {
    self.remove(cData['id']);
    return;
   }

   data=$.extend(true,{},cData);
   am='amount' in cData?
    cData['amount']:
    self.options.goodies.amount?
     self.options.getAmount(self.getAmountObject(data['id'])):
     1;
   d=self.props.data[data['id']];
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

     self.emptied(false);
     self.props.goodsCount++;
    }

    if(self.options.cart)
     self.options.setAmount(d.cart.amount,d.data['amount']);
    if(self.options.form)
     self.options.setAmount(d.form.amount,d.data['amount']);

    self.sum();
    self.store();

    self.trigger('add',[{data:d.data}]);
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
     self.emptied(true);
     self.trigger('empty');
    }

    if(self.options.addedClass&&self.options.goodies)
    {
     self.options.added(self.props.goodies.adderContainer.find(self.options.goodies.adder.selector).filter(function(){
      return id==$(this).data(self.options.goodies.adder.data)['id'];
     })).removeClass(self.options.addedClass);
    }

    if(self.options.cart)
     d.cart.block.remove();
    if(self.options.form)
     d.form.block.remove();

    self.sum();
    self.store();

    self.trigger('remove',[{
     data:d,
     amountObj:self.options.goodies&&self.options.goodies.amount?self.getAmountObject(id):null
    }]);
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
   var self=this,
       s={},
       st=localStorage.getItem(self.options.storage),
       d=st?JSON.parse(st)[self.options.storageData.data]:[];

   s[self.options.storageData.data]=[];
   for(var x in data)
    s[self.options.storageData.data].push(data[x].data);

   s[self.options.storageData.fix]=self.props.unique;
   s[self.options.storageData.old]=d;

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
    t=self.options.formatPrice({fix:d.data['amount']*self.options.formatPrice({src:d.data['price']})});
    tt=self.options.formatPrice({dest:t});
    if(self.options.cart)
     d.cart.price.text(tt);
    if(self.options.form)
     d.form.price.text(tt);
    m+=d.data['amount'];
    p+=t;
   }

   self.props.amount.text(m);
   self.props.sum.text(self.options.formatPrice({dest:p}));
   self.trigger('sum',[{data:self.props.data}]);
  }
 });

 return Cart;
}));
