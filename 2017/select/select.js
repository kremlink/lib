/*!
Aleksander Kremlev
*/
(function (factory) {
 'use strict';
 
  if(typeof define==='function'&&define.amd){
   define(['jquery','base'],factory);
  }else
  {
   if('SiteManager' in window)
   {
    if(!SiteManager.lib)
     throw 'SiteManager.lib doesn\'t exist!';
    SiteManager.set({data:'lib.Select',object:factory(jQuery,SiteManager),lib:false});
   }
  }
}(function($,mgr){
 mgr.extend(Select);

 function Select(){
  'use strict';

  this.options={
   selectedClass:'selected',
   openedClass:'opened',
   disabledClass:'disabled',
   focusedClass:'focused',
   errorClass:'error',
   data:'data',
   insert:'items',
   shown:null,
   selectors:{select:'.custom-select',chosen:'.custom-select-chosen',chosenHTML:'.custom-select-chosen-html',list:'.custom-select-list-wrap',item:'.custom-select-item'}
  };

  this.props={
   input:null,//init
   options:null,
   template:null,//init
   itemTemplate:null,//init
   length:null,
   select:null,
   chosenHTML:null,
   list:null,
   items:null,
   index:-1,
   disabled:false
  };
 }
 //-----------------
 $.extend(Select.prototype,{
  init:function(opts){
   var self=this;

   self.options=$.extend(true,self.options,opts);

   self.props=$.extend(true,self.props,{
    input:$(opts.input),
    template:$(opts.template),
    itemTemplate:$(opts.itemTemplate)
   });

   self.prepare();
  },
  destroy:function(){
   var self=this;

   self.off('init');
   self.off('choose');
   self.off('heightSet');
   self.off('toggle');
   self.props.input.remove();
   self.props.select.remove();
  },
  prepare:function(){
   var self=this,
       insert={};

   if(!self.props.input.data||!self.props.input.data(self.options.data).length)
   {
    self.trigger('init',[{
     empty:true,
     input:self.props.input
    }]);
    return;
   }

   self.trigger('init',[{
    empty:false,
    input:self.props.input
   }]);

   self.props.options=self.props.input.data(self.options.data);
   self.props.length=self.props.options.length;

   insert[self.options.insert]=self.itemsHTML();
   self.props.select=$('<div />')
    .html(Mustache.render(self.props.template.html(),insert))
    .children(0)
    .unwrap();

   self.props.input.hide().after(self.props.select);
   self.props.chosenHTML=self.props.select.find(self.options.selectors.chosenHTML);
   self.props.list=self.props.select.find(self.options.selectors.list);
   self.props.items=self.props.select.find(self.options.selectors.item);

   self.dataInit();

   self.setHeight();

   self.choose(self.props.index);

   self.setEventHolders();
  },
  setEventHolders:function(){
   var self=this;

   self.props.select.on('mousedown',self.options.selectors.chosen,function(e){
    self.chosenActivate(e);
   });
   self.props.select.on('click',self.options.selectors.item,function(e){
    self.itemClick(e,$(this));
   });
   self.props.select.on('focusin',function(e){
    self.focusBlur(e);
   });
   self.props.select.on('focusout',function(e){
    self.focusBlur(e);
   });
   self.props.select.on('keydown',function(e){
    return self.keydown(e);
   });
   self.props.select.on('keypress',function(e){
    self.keypress(e);
   });
  },
  setHeight:function(){
   var self=this;

   if(self.options.shown)
   {
    if($.type(self.options.shown)=='string')
    {
     self.props.list.height(self.options.shown);
    }else
    {
     if(self.props.length>self.options.shown)
     {
      self.props.list.height((function(){
       var h=0;

       for(var i=0;i<self.options.shown;i++)
        h+=self.props.items.eq(i).outerHeight();

       return h;
      })());
     }
    }
   }

   self.trigger('heightSet');
  },
  findNext:function(f){
   var self=this,
       j=-1;

   for(var i=(f?0:self.props.index+1);i<(f?self.props.index:self.props.length);i++)
   {
    if(f&&!self.props.options[i].disabled)
     j=i;
    if(!f&&!self.props.options[i].disabled)
    {
     j=i;
     break;
    }
   }

   return j;
  },
  keypress:function(e){
   var self=this;

   return !(self.props.select.closest('form').length&&e.which==13);
  },
  keydown:function(e){
   var self=this,
       i=self.props.index,
       j;

   if(e.which!=38&&e.which!=40&&e.which!=13||e.which==38&&i==0||e.which==40&&i==self.props.length-1)
    return true;

   if(e.which==38)
   {
    j=self.findNext(true);
    if(~j)
     self.props.index=j;else
     return true;
   }

   if(e.which==40)
   {
    j=self.findNext(false);
    if(~j)
     self.props.index=j;else
     return true;
   }

   if(e.which==13)
    self.chosenActivate();else
    self.choose(self.props.index);

   return !(e.which==38||e.which==40);
  },
  focusBlur:function(e){
   var self=this,
       f=e.type=='focusin';

   if(!self.props.disabled)
   {
    self.props.select[f?'addClass':'removeClass'](self.options.focusedClass);
    if(f)
     self.props.select.removeClass(self.options.errorClass);
    self.toggleList(f);
   }
  },
  toggleState:function(f){
   var self=this;

   self.props.disabled=!f;
   self.props.select[self.props.disabled?'addClass':'removeClass'](self.options.disabledClass);
  },
  itemClick:function(e,obj){
   var self=this,
       i=self.props.items.index(obj);

   if(self.props.options[i]['disabled'])
    return false;

   self.props.index=i;
   self.choose(self.props.index);

   self.toggleList(false);
   return true;
  },
  choose:function(index){
   var self=this;

   if(!~index)
    return;

   self.props.chosenHTML.html(self.props.items.removeClass(self.options.selectedClass)
    .eq(index)
    .addClass(self.options.selectedClass).html());
   self.props.input.val(self.props.options[index]['value']);
   self.trigger('choose',[{
    index:self.props.index,
    options:self.props.options,
    items:self.props.items,
    input:self.props.input,
    select:self.props.select
   }]);
  },
  chosenActivate:function(){
   var self=this;

   if(!self.props.disabled)
    self.toggleList(!self.props.select.hasClass(self.options.openedClass));

   return true;
  },
  toggleList:function(f){
   var self=this;

   self.props.select[f?'addClass':'removeClass'](self.options.openedClass);
   self.trigger('toggle',[{
    open:f,
    select:self.props.select
   }]);
  },
  dataInit:function(){
   var self=this,
       item,
       opt;

   for(var i=0;i<self.props.length;i++)
   {
    item=self.props.items.eq(i);
    opt=self.props.options[i];
    if(opt['disabled'])
     item.addClass(self.options.disabledClass);
    if(opt['selected'])
    {
     item.addClass(self.options.selectedClass);
     self.props.index=i;
    }
   }
  },
  itemsHTML:function(){
   var self=this;

   var s='';

   for(var i=0;i<self.props.length;i++)
    s+=Mustache.render(self.props.itemTemplate.html(),self.props.options[i]);

   return s;
  },
  getData:function(){
   var self=this;

   return {
    index:self.props.index,
    options:self.props.options,
    items:self.props.items
   };
  },
  select:function(opts){
   var self=this;

   if(opts)
   {
    self.props.index='index' in opts?opts.index:(function(){
     for(var i=0;i<self.props.length;i++)
     {
      if(self.props.options[i]['value']==opts.value)
       break;
     }

     return i;
    })();
   }

   self.choose(self.props.index);
  }
 });
  
 return Select;
}));