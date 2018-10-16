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
 mgr.lib['Input']=Input;
 
 function Input(opts,func){
  "use strict";
  
  var self=this;
  
  mgr.Base.apply(this,arguments);
  
  self.options=$.extend(true,{
   data:'filter',
   emptyEvent:'empty',
   changeEvent:'change'
  },opts);
  
  self.props={
   delegateInputs:$.isPlainObject(opts.inputs),
   delegateContainer:null,
   inputs:null
  };

  self.props.delegateContainer=self.props.delegateInputs?$(self.options.inputs.container):null;
  self.props.inputs=self.props.delegateInputs?null:$(opts.inputs);

  init();
  
  function init(){
   self.prepare();
   self.trigger('init');
  }
 }
 //-----------------
 mgr.extend(Input);
 //-----------------
 $.extend(Input.prototype,{
  prepare:function(){
   var self=this,
       evts={
        'keyup':function(e){
         self.keyup(e,$(this));
        },
        'keypress':function(e){
         return self.keypress(e,$(this));
        },
        'cut paste':function(){
         self.cutPaste($(this));
        }
       };

   if(self.props.delegateInputs)
    self.props.delegateContainer.on(evts,self.options.inputs.selector);else
    self.props.inputs.on(evts);
  },
  evts:function(obj){
   var self=this;

   if(!obj.val().length)
   {
    self.trigger(self.options.emptyEvent,[{
     input:obj,
     delegateContainer:self.props.delegateContainer,
     inputs:self.props.inputs
    }]);
   }

   self.trigger(self.options.changeEvent,[{
    input:obj,
    delegateContainer:self.props.delegateContainer,
    inputs:self.props.inputs
   }]);
  },
  keypress:function(e,obj){
   var self=this,
       ch=String.fromCharCode(e.which),
       regChar=obj.data(self.options.data)?new RegExp(obj.data(self.options.data).charFilter):null,
       f=!regChar||regChar.test(ch);

   if(ch==8||ch==9||ch==13||ch==35||ch==36||ch==37||ch==39||ch==46)
    return true;

   return f;
  },
  keyup:function(e,obj){
   var self=this;

   self.evts(obj);
  },
  cutPaste:function(obj){
   var self=this,
       regVal=obj.data(self.options.data)?new RegExp(obj.data(self.options.data).valueFilter):null;
   
   setTimeout(function(){
    if(regVal&&!regVal.test(obj.val()))
     obj.val('');

    self.evts(obj);
   },0);
  },
  test:function(input){//for external use
   var self=this,
       regVal=new RegExp(input.data(self.options.data).valueFilter);
   
   return regVal.test(input.val());
  }
 });
  
 return Input;
}));