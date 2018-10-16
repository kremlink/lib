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
   requestClassPrefix:'cart-request',
   formClass:'cart-form',
   serverPrice:false,
   storage:'cart-dev',
   flush:false,
   savedData:{
    data:'data',
    shared:'shared'
   },
   storageData:{
    fix:'ie-fix',
    old:'old-data',
    time:'time'
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
   params:{ids:'ids',what:'what',extra:'extra'},
   ajaxOnChange:false,
   added:opts.added||function(obj){
    return obj;
   },
   getAmount:opts.getAmount||function(obj){
    if(obj.length)
     return +obj.val();else
     return 1;
   },
   setAmount:opts.setAmount||function(obj,value){
    if(!obj.length)
     return;

    if(obj.is('input'))
     obj.val(value);else
     obj.text(value);
   },
   formatPrice:opts.formatPrice||function(opts){
    if('dest' in opts)//from number to formatted string
     return opts.dest.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g,'$1 ');
    if('src' in opts)//form string to number
     return typeof opts.src=='number'?opts.src:+opts.src.replace(/\s+/g,'');
    if('fix' in opts)//do something with number
     return +opts.fix;

    throw "Incorrect formatPrice args";
   },
   fromServer:function(data){//sets some data
    throw 'Data from server was not set!';
   }
  },opts);

  self.props={
   data:{},
   extra:{},//extra data in ajax
   sum:$(opts.sum),
   amount:$(opts.amount),
   clear:$(opts.clear),
   save:$(opts.save),
   goodsCount:0,
   ajax:null,
   unique:+new Date(),
   shared:{},//saved
   info:{
    price:null,
    amount:null
   },
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
   },
   flushed:false
  };

  init();

  function init(){
   self.prepare();
   self.trigger('init',[{
    storage:self.options.storage,
    storageData:self.options.storageData,
    format:self.options.formatPrice,
    sum:self.props.sum
   }]);
   self.prepareStorage();
   self.reconstruct();
   self.setHandlers();
  }
 }
 //-----------------
 mgr.extend(Cart);
 //-----------------
 $.extend(Cart.prototype,{
  prepare:function(){
   var self=this;

   if(self.options.storage&&self.options.storage!='cart-dev')
    localStorage.removeItem('cart-dev');
   if(self.options.cart)
    self.props.cart.insert=self.props.cart.container.find(self.options.cart.container.insert);
   if(self.options.form)
   {
    self.props.form.insert=self.props.form.container.find(self.options.form.container.insert);
    mgr.helpers.html.addClass(self.options.formClass);
   }
  },
  prepareStorage:function(){
   var self=this,
       s;

   if(self.options.storage)
   {
    s=JSON.parse(localStorage.getItem(self.options.storage));
    if(!$.isPlainObject(s)||!s[self.options.savedData.data])
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
     self.trigger('save');
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
        self.clear({type:'reconstruct'});
        self.reconstruct(true);
       };

   mgr.helpers.win.on('storage',function(e){
    if(e.originalEvent.newValue&&JSON.parse(e.originalEvent.newValue)[self.options.storageData.fix]==self.props.unique)
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

   mgr.helpers.html.addClass(self.options.requestClassPrefix+'-'+opts.what.type);
   if(!opts.noAjax)
   {
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
      data:self.ajaxData(opts.what),
      dataType:'json'
     });
    }
   }
   
   $.when(opts.noAjax||self.props.ajax).then(function(r){//r=opts.noAjax=true?opts.noAjax:r
    opts.success();
    if(opts.what.type!='save')
    {
     self.sum({type:'data',r:r});
     self.store(opts);
    }
    mgr.helpers.html.removeClass(self.options.requestClassPrefix+'-'+opts.what.type);
    self.props.ajax=null;
   },function(){
    self.failedAjax(opts);
    mgr.helpers.html.removeClass(self.options.requestClassPrefix+'-'+opts.what.type);
    self.props.ajax=null;
   });
  },
  store:function(opts){
   var self=this;

   if(self.options.storage)
    localStorage.setItem(self.options.storage,self.storeData(opts));
  },
  emptied:function(f){
   var self=this;

   mgr.helpers.html[f?'addClass':'removeClass'](self.options.emptyClass);
  },
  clear:function(opts){
   var self=this;

   if(opts.type=='clear')
   {
    self.save({data:{},noAjax:opts.noAjax,what:{type:'clear'},success:function(){
     for(var x in self.props.data)
      delete self.props.data[x];

     self.props.goodsCount=0;
     self.emptied(true);
     if(self.options.cart)
      self.props.cart.insert.html('');
     if(self.options.form)
      self.props.form.insert.html('');

     self.trigger('clear');
     self.trigger('empty');
    },fail:function(reqProcessed){
     if(!reqProcessed)
      self.options.ajaxFails('clear');
    }});
   }
   if(opts.type=='reconstruct')
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
       s=self.options.storage?localStorage.getItem(self.options.storage):null,
       d,
       addit;


   if(self.options.flush&&!self.props.flushed)
   {
    self.clear({
     type:'clear',
     noAjax:true,
     clear:'all'
    });
    self.props.flushed=true;
    return;
   }

   if(!s&&!(self.options.saved&&self.options.saved.data.length)||s&&!JSON.parse(s)[self.options.savedData.data].length)
   {
    self.emptied(true);
    self.activateGoodies();
    self.sum({type:'empty'});
    self.trigger('empty');
    return;
   }

   self.emptied(false);

   s=s?JSON.parse(s):self.options.saved;
   d=s[self.options.savedData.data];
   addit=s[self.options.savedData.shared];
   
   for(var x in addit)
    self.props.shared[x]=addit[x];

   for(var i=0;i<d.length;i++)
   {
    self.props.goodsCount++;
    self.setDataElement({data:d[i],obj:self.addItem(d[i])});
   }

   if(!storeFlag)
   {
    self.store({});
    self.trigger('storage');
   }

   self.activateGoodies();
   self.sum({type:'reconstruct'});
  },
  activateGoodies:function(){
   var self=this;

   if(!self.options.addedClass||!self.options.goodies)
    return;

   self.props.goodies.adderContainer.find(self.options.goodies.adder.selector).each(function(){
     var obj=$(this),
         data=obj.data(self.options.goodies.adder.data);

     self.options.added(obj).removeClass(self.options.addedClass);

     if(data&&data['id'] in self.props.data)
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
    if(self.options.form)
     self.options.setAmount(d[opts.id].form.amount,+opts.amount);
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
    return;

   if(self.options.added(caller).hasClass(self.options.addedClass)&&cData['mode']=='toggle')
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
      var obj=$(this),
          dat=obj.data(self.options.goodies.adder.data);

      return dat?id==obj.data(self.options.goodies.adder.data)['id']:false;
     })).removeClass(self.options.addedClass);
    }

    if(self.options.cart)
     d.cart.block.remove();
    if(self.options.form)
     d.form.block.remove();

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
       obj={};

   obj[self.options.params.ids]=[];
   for(var x in self.props.data)
   {
    obj[self.options.params.ids].push({
     id:x,
     amount:self.props.data[x].data['amount']
    });
   }

   obj[self.options.params.what]={
    type:data.type
   };

   if('id' in data)
    obj[self.options.params.what]['id']=data.id;

   obj[self.options.params.extra]=self.props.extra;

   return obj;
  },
  setExtra:function(d){
   var self=this;

   self.props.extra=d;
  },
  storeData:function(opts){
   var self=this,
       s={},
       std=self.options.storageData,
       svd=self.options.savedData,
       st=localStorage.getItem(self.options.storage),
       d=st?JSON.parse(st)[svd.data]:[];

   s[svd.data]=[];
   s[svd.shared]={};

   for(var x in self.props.data)
    s[svd.data].push(self.props.data[x].data);

   for(var x in self.props.shared)
    s[svd.shared][x]=self.props.shared[x];

   s[std.fix]=self.props.unique;
   if(opts.what&&opts.what.type=='clear')
    s[std.old]=[];else
    s[std.old]=d;
   s[std.time]=+new Date();

   return JSON.stringify(s);
  },
  getData:function(){
   var self=this;

   return self.props.info;
  },
  sumPartial:function(opts){
   var self=this,
       t,
       tt,
       m=0,
       p=0,
       d;

   for(var x in self.props.data)
   {
    d=self.props.data[x];
    if(self.options.serverPrice)
    {
     switch(opts.type)
     {
      case 'empty':
       tt=self.options.fromServer.apply(self,[{
        type:'partial-empty',
        data:d.data,
        id:x
       }]);
       break;
      case 'reconstruct':
       tt=self.options.fromServer.apply(self,[{
        type:'partial-reconstruct',
        data:d.data,
        id:x
       }]);
       break;
      default:
       tt=self.options.fromServer.apply(self,[{
        type:'partial',
        data:d.data,
        r:opts.r,
        id:x
       }]);
     }

     $.extend(d.data,tt.extend);
     tt=tt.sum;
    }else
    {
     t=self.options.formatPrice({fix:d.data['amount']*self.options.formatPrice({src:d.data['price']})});
     tt=self.options.formatPrice({dest:t});
    }
    if(self.options.cart)
     d.cart.price.text(tt);
    if(self.options.form)
     d.form.price.text(tt);
    m+=d.data['amount'];
    if(!self.options.serverPrice)
     p+=t;
   }

   self.props.info.amount=m;
   self.props.info.price=p;
  },
  sumAll:function(opts){
   var self=this,
       tt;

   self.props.amount.text(self.props.info.amount);
   if(self.options.serverPrice)
   {
    switch(opts.type)
    {
     case 'empty':
     case 'reconstruct':
      tt=self.options.fromServer.apply(self,[{
       type:'all-reconstruct',
       shared:$.extend({},self.props.shared)
      }]);
      break;
     default:
      tt=self.options.fromServer.apply(self,[{
       type:'all',
       r:opts.r,
       shared:$.extend({},self.props.shared)
      }]);
    }

    self.props.sum.text(tt.sum);
    $.extend(self.props.shared,tt.extend);
   }else
   {
    self.props.sum.text(self.options.formatPrice({dest:self.props.info.price}));
   }
  },
  sum:function(opts){
   var self=this;

   self.sumPartial(opts);
   self.sumAll(opts);

   self.trigger('sum',[{
    info:self.props.info,
    sum:self.props.sum,
    data:self.props.data,
    shared:self.props.shared,
    opts:opts,
    format:self.options.formatPrice
   }]);
  }
 });

 return Cart;
}));
