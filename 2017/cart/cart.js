/*!by Alexander Kremlev*/
//apteka folder - server variation
(function (factory) {
 'use strict';

 if(typeof define==='function'&&define.amd)
 {
  define(['jquery','base'],factory);
 }else
 {
  if('SiteManager' in window)
  {
   if(!SiteManager.lib)
    throw 'SiteManager.lib doesn\'t exist!';
   SiteManager.set({data:'lib.Cart',object:factory(jQuery,SiteManager),lib:false});
  }
 }
}(function($,mgr){
 mgr.extend(Cart);

 function Cart(){
  "use strict";

  this.options={
   objs:{
    sum:null,
    amount:null,
    clear:null,
    save:null
   },
   cart:{container:{}},
   form:{container:{}},
   goodies:null,
   saved:null,
   addedClass:'cart-added',
   emptyClass:'cart-empty',
   requestClassPrefix:'cart-request',
   formClass:'cart-form-page',
   storage:'cart-dev',
   storageData:{
    iniTime:'iniTime',
    old:'',//flag; if not empty it'll save previous state with the given key
    time:'time',
    expire:1000*3600*24
   },
   serverPrice:false,
   mode:'mode_',
   excludePostfix:'_',
   liveUpdate:false,
   url:'',
   type:'POST',
   params:{ids:'ids',what:'what',extra:'extra'},
   ajaxOnChange:false,
   flush:false,
   savedData:{
    data:'data',
    shared:'shared'
   },
   funcs:{
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
    expired:function(){},
    added:function(obj){
     return obj;
    },
    getData:function(opts){
     return opts.obj.data(opts.data);
    },
    getAmount:function(obj){
     if(obj.length)
      return +obj.val();else
      return 1;
    },
    setAmount:function(obj,value){
     if(!obj.length)
      return;

     if(obj.is('input'))
      obj.val(value);else
      obj.text(value);
    },
    formatPrice:function(opts){
     if('dest' in opts&&opts.hasOwnProperty('dest'))//from number to formatted string
      return opts.dest.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g,'$1 ');
     if('src' in opts&&opts.hasOwnProperty('src'))//form string to number
     {
      opts.src=opts.src?opts.src:0;
      return $.type(opts.src)=='number'?opts.src:+opts.src.replace(/\s+/g,'');
     }
     if('fix' in opts&&opts.hasOwnProperty('fix'))//do something with number
      return +opts.fix;

     throw "Incorrect formatPrice args";
    },
    fromServer:function(data){//sets some data
     throw new Error('Data from server not set!');
    },
    fromSource:function(data){
     return data.type=='partial'?data.data.data['price']:data.info.price;
    }
   }
  };

  this.props={
   data:{},
   extra:{},//extra data in ajax
   sum:null,//init
   amount:null,//init
   clear:null,//init
   save:null,//init
   goodsCount:0,
   ajax:null,
   unique:Date.now(),
   shared:{},//saved
   info:{
    price:-1,
    amount:-1
   },
   goodies:{
    adderContainer:null,//init
    amountContainer:null//init
   },
   cart:{
    container:null,//init
    insert:null,//init
    template:null//init
   },
   form:{
    container:null,//init
    insert:null,//init
    template:null//init
   },
   flushed:false,
   helpers:{
    win:$(window),
    html:$('html'),
    doc:$(document)
   }
  };
 }
 //-----------------
 $.extend(Cart.prototype,{
  init:function(opts){
   var self=this;

   self.options=$.extend(true,self.options,opts);

   self.props=$.extend(true,self.props,{
    sum:$(opts.objs.sum),
    amount:$(opts.objs.amount),
    clear:$(opts.objs.clear),
    save:$(opts.objs.save),
    goodies:{
     adderContainer:$(opts.goodies.adder.container),
     amountContainer:opts.goodies.amount?$(opts.goodies.amount.container):null
    }
   });

   self.prepare();

   self.trigger('init',[{
    storage:self.options.storage,
    storageData:self.options.storageData,
    format:self.options.formatPrice,
    sum:self.props.sum
   }]);

   self.prepareStorage();
   self.reconstruct(false);
   self.setHandlers();
  },
  prepare:function(){
   var self=this;

   self.props.cart.container=$(self.options.cart.container.selector);
   self.props.form.container=$(self.options.form.container.selector);

   self.props.cart.template=$(self.options.cart.template);
   self.props.form.template=$(self.options.form.template);

   self.both(function(s){
    self.props[s].insert=self.props[s].container.find(self.options[s].container.insert);
   });

   if(self.props.form.container.length)
    self.props.helpers.html.addClass(self.options.formClass);

   if(self.options.storage&&self.options.storage!='cart-dev')
    localStorage.removeItem('cart-dev');
  },
  prepareStorage:function(){
   var self=this,
       s;

   if(self.options.storage)
   {
    s=JSON.parse(localStorage.getItem(self.options.storage));
    if(!$.isPlainObject(s)||!s[self.options.savedData.data])
    {
     localStorage.removeItem(self.options.storage);
    }else
    {
     if(Date.now()-s[self.options.storageData.iniTime]>self.options.storageData.expire)
     {
      localStorage.removeItem(self.options.storage);
      self.options.funcs.expired();
     }
    }
   }
  },
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
     self.trigger('save');
    },fail:function(reqProcessed){
     if(!reqProcessed)
      self.options.funcs.ajaxFails('save');
    }});

    e.preventDefault();
   });

   if(self.options.liveUpdate)
    self.onstorage();
  },
  reconstruct:function(storeFlag){
   var self=this,
       ops=self.options,
       s=ops.storage?localStorage.getItem(ops.storage):null,
       d;

   if(ops.flush&&!self.props.flushed)
   {
    self.clear({
     type:'clear',
     flush:true
    });

    self.props.flushed=true;
    s=null;
   }

   if(!s&&!(ops.saved&&ops.saved.data&&ops.saved.data.length)||s&&!JSON.parse(s)[ops.savedData.data].length)
   {
    self.emptied(true);
    self.activateGoodies();
    self.sum({type:'empty'});
    self.trigger('empty',[{type:'reconstruct'}]);
    return;
   }

   self.emptied(false);

   s=s?JSON.parse(s):ops.saved;
   d=s[ops.savedData.data];

   self.props.shared=s[ops.savedData.shared];

   for(var i=0;i<d.length;i++)
   {
    self.props.goodsCount++;
    self.setDataElement({data:d[i],obj:self.addItem(d[i])});
   }

   if(!storeFlag)
   {
    self.store({what:{type:'init'}});
    self.trigger('storage');
   }

   self.activateGoodies();
   self.sum({type:'reconstruct'});
  },
  onstorage:function(){
   var self=this,
       fn=function(){
        self.clear({type:'reconstruct'});
        self.reconstruct(true);
       };

   self.props.helpers.win.on('storage',function(e){
    if(e.originalEvent.newValue&&JSON.parse(e.originalEvent.newValue)[self.options.storageData.iniTime]==self.props.unique)
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

   self.props.helpers.html.addClass(self.options.requestClassPrefix+'-'+opts.what.type);
   if(!opts.flush)
   {
    if(self.props.ajax&&self.props.ajax.readyState!=4)
    {
     fail=opts.fail;
     opts.fail=function(){
      fail(true);//"true" means alert suppression of this type

      self.options.funcs.ajaxFails('tooFast');
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
   
   $.when(opts.flush||self.props.ajax).then(function(r){//r=(opts.flush=true)?opts.flush:r
    opts.success();
    if(opts.what.type!='save')
    {
     self.sum({type:'data',r:r});
     self.store(opts);
    }
    self.props.helpers.html.removeClass(self.options.requestClassPrefix+'-'+opts.what.type);
    self.props.ajax=null;
   },function(){
    self.failedAjax(opts);
    self.props.helpers.html.removeClass(self.options.requestClassPrefix+'-'+opts.what.type);
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

   self.props.helpers.html[f?'addClass':'removeClass'](self.options.emptyClass);
  },
  clear:function(opts){
   var self=this,
       x;

   if(opts.type=='clear')
   {
    self.save({data:{},flush:opts.flush,what:{type:opts.type},success:function(){
     for(x in self.props.data)
      if(self.props.data.hasOwnProperty(x))
       delete self.props.data[x];

     self.props.goodsCount=0;
     self.emptied(true);
     self.both(function(s){
      self.props[s].insert.html('');
     });

     localStorage.removeItem(self.options.storage);

     self.trigger('clear',[{type:opts.flush?'flush':'call'}]);
     self.trigger('empty',[{type:opts.flush?'flush':'call'}]);
    },fail:function(reqProcessed){
     if(!reqProcessed)
      self.options.funcs.ajaxFails('clear');
    }});
   }

   if(opts.type=='reconstruct')
   {
    for(x in self.props.data)
     if(self.props.data.hasOwnProperty(x))
      delete self.props.data[x];

    self.both(function(s){
     self.props[s].insert.html('');
    });

    self.props.goodsCount=0;
   }
  },
  addItem:function(d){
   var self=this,
       html=function(s){
        var p=self.props;

        return p[s].container.length?$(Mustache.render(p[s].template.html(),d)).appendTo(p[s].insert):null
       };

   return {
    cart:html('cart'),
    form:html('form')
   };
  },
  setDataElement:function(opts){
   var self=this,
       d={cart:{},form:{}};


   if(opts.obj)
   {
    self.both(function(s){
     d[s]={
      block:opts.obj[s],
      amount:opts.obj[s].find(self.options[s].container.amount),
      price:opts.obj[s].find(self.options[s].container.price),
      extra:{}
     };

     for(var x in self.options[s].container.extra)
      if(self.options[s].container.extra.hasOwnProperty(x))
       d[s].extra[x]=opts.obj[s].find(self.options[s].container.extra[x]);
    });
   }

   d.data=opts.data;
   self.props.data[opts.data.id]=d;

   return d;
  },
  activateGoodies:function(){
   var self=this;

   if(!self.options.addedClass||!self.props.goodies.adderContainer.length)
    return;

   self.props.goodies.adderContainer.find(self.options.goodies.adder.selector).each(function(){
     var obj=$(this),
         data=self.options.funcs.getData({obj:obj,data:self.options.goodies.adder.data});

     self.options.funcs.added.call(self,obj).removeClass(self.options.addedClass);

     if(data&&data['id'] in self.props.data&&self.props.data.hasOwnProperty(data['id']))
     {
      self.options.funcs.added.call(self,obj).addClass(self.options.addedClass);
      if(self.options.goodies.amount&&data[self.options.mode]=='replace')
       self.options.funcs.setAmount(self.getAmountObject(data['id']),self.props.data[data['id']].data['amount']);
     }
    });
  },
  both:function(fn){
   var self=this;

   if(self.props.cart.container.length)
    fn('cart');
   if(self.props.form.container.length)
    fn('form');
  },
  changeAmount:function(opts){//external
   var self=this,
       d=self.props.data,
       old=d[opts.id].data['amount'];

   d[opts.id].data['amount']=+opts.amount;

   self.save({data:d,what:{type:'change',id:opts.id},success:function(){
    self.both(function(s){
     self.options.funcs.setAmount(d[opts.id][s].amount,+opts.amount);
    });
   },fail:function(reqProcessed){
    d[opts.id].data['amount']=old;
    if(!reqProcessed)
     self.options.funcs.ajaxFails('change');
   }});
  },
  getAmountObject:function(id){
   var self=this;

   return self.props.goodies.amountContainer
    .find(self.options.goodies.amount.selector)
    .filter(function(){
     return self.options.funcs.getData({obj:$(this),data:self.options.goodies.amount.data})==id;
    });
  },
  add:function(caller){
   var self=this,
       cData=self.options.funcs.getData({obj:caller,data:self.options.goodies.adder.data}),
       data,
       am,
       d,
       old;

   if(!cData||!('id' in cData)&&cData.hasOwnProperty('id'))
    return;

   if(self.options.funcs.added.call(self,caller).hasClass(self.options.addedClass)&&cData[self.options.mode]=='toggle')
   {
    self.remove(cData['id']);
    return;
   }

   data=$.extend(true,{},cData);
   am='amount' in cData&&cData.hasOwnProperty('amount')?
    cData['amount']:
    self.options.goodies.amount?
     self.options.funcs.getAmount(self.getAmountObject(data['id'])):
     1;
   d=self.props.data[data['id']];
   old=d?d.data['amount']:-1;

   if(d)
   {
    d.data['amount']=data[self.options.mode]=='replace'?am:d.data['amount']+am;
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
      self.options.funcs.added.call(self,caller).addClass(self.options.addedClass);

     self.emptied(false);
     self.props.goodsCount++;
    }

    self.both(function(s){
     self.options.funcs.setAmount(d[s].amount,d.data['amount']);
    });

    self.trigger('add',[{data:d.data}]);
   },fail:function(reqProcessed){
    if(d)
     d.data['amount']=old;else
     delete self.props.data[data['id']];

    if(!reqProcessed)
     self.options.funcs.ajaxFails('add');
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
     self.trigger('empty',[{type:'remove'}]);
    }

    if(self.options.addedClass)
    {
     self.options.funcs.added.call(self,self.props.goodies.adderContainer.find(self.options.goodies.adder.selector).filter(function(){
      var obj=$(this),
          dat=self.options.funcs.getData({obj:obj,data:self.options.goodies.adder.data});

      return dat?id==dat['id']:false;
     })).removeClass(self.options.addedClass);
    }

    self.both(function(s){
     d[s].block.remove();
    });

    self.trigger('remove',[{
     data:d,
     amountObj:self.options.goodies.amount?self.getAmountObject(id):null
    }]);
   },fail:function(reqProcessed){
    self.props.data[id]=d;

    if(!reqProcessed)
     self.options.funcs.ajaxFails('remove');
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
    if(self.props.data.hasOwnProperty(x))
    {
     obj[self.options.params.ids].push({
      id:x,
      amount:self.props.data[x].data['amount']
     });
    }
   }

   obj[self.options.params.what]={
    type:data.type
   };

   if('id' in data&&data.hasOwnProperty('id'))
    obj[self.options.params.what]['id']=data.id;

   obj[self.options.params.extra]=self.props.extra;

   return obj;
  },
  setExtra:function(d){
   var self=this;

   self.props.extra=d;
  },
  excludeData:function(d){
   var self=this;

   for(var x in d)
    if(d.hasOwnProperty(x)&&x.substring(x.length-self.options.excludePostfix.length)==self.options.excludePostfix)
     delete d[x];

   return d;
  },
  storeData:function(opts){
   var self=this,
       x,
       s={},
       std=self.options.storageData,
       svd=self.options.savedData,
       st=localStorage.getItem(self.options.storage),
       d=st?JSON.parse(st)[svd.data]:[];

   s[svd.data]=[];
   s[svd.shared]=self.excludeData($.extend(true,{},self.props.shared));

   for(x in self.props.data)
    if(self.props.data.hasOwnProperty(x))
     s[svd.data].push(self.excludeData($.extend(true,{},self.props.data[x].data)));

   s[std.iniTime]=self.props.unique;
   if(std.old)
   {
    if(opts.what.type=='clear'||opts.what.type=='init')
     s[std.old]=[];else
     s[std.old]=d;
   }
   s[std.time]=Date.now();

   return JSON.stringify(s);
  },
  getData:function(){
   var self=this;

   return self.props.info;
  },
  extendData:function(opts){
   var self=this;

   if(opts.shared)
    $.extend(true,self.props.shared,opts.shared);
   if(opts.data)//beware: it can overwrite something unexpected
    $.extend(true,self.props.data[opts.data.id].data,opts.data.data);
   if(opts.store)
    self.store({what:{type:'extend'}});
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
    if(self.props.data.hasOwnProperty(x))
    {
     d=self.props.data[x];
     if(self.options.serverPrice)
     {
      tt=self.options.funcs.fromServer.apply(self,[{
       type:opts.type=='data'?'partial':'partial-'+opts.type,
       data:d.data,
       id:x,
       r:opts.r
      }]);

      $.extend(d.data,tt.extend);
      tt=tt.sum;
     }else
     {
      tt=self.options.funcs.fromSource.apply(self,[{
       data:d,
       type:'partial'
      }]);

      tt=self.options.funcs.formatPrice({dest:self.options.funcs.formatPrice({fix:d.data['amount']*self.options.funcs.formatPrice({src:tt})})});
      t=self.options.funcs.formatPrice({fix:d.data['amount']*self.options.funcs.formatPrice({src:d.data['price']})});
     }

     self.both(function(s){
      d[s].price.text(tt);
     });
     m+=d.data['amount'];
     if(!self.options.serverPrice)
      p+=t;
    }
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
    tt=self.options.funcs.fromServer.apply(self,[{
     type:opts.type=='data'?'all':'all-reconstruct',
     r:opts.r,
     shared:$.extend({},self.props.shared)
    }]);

    self.props.sum.text(tt.sum);
    $.extend(self.props.shared,tt.extend);
   }else
   {
    tt=self.options.funcs.fromSource.apply(self,[{
     data:self.props.data,
     info:self.props.info,
     type:'all'
    }]);
    self.props.sum.text(self.options.funcs.formatPrice({dest:tt}));
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
