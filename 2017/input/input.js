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
    SiteManager.set({data:'lib.Input',object:factory(jQuery,SiteManager),lib:false});
   }
  }
}(function($,mgr){
 mgr.extend(Input);
 
 function Input(){
  "use strict";
  
  this.options={
   data:'filter',
   emptyEvent:'empty',
   changeEvent:'change'
  };
  
  this.props={
   delegateInputs:null,//init
   delegateContainer:null,
   inputs:null
  };
 }
 //-----------------
 $.extend(Input.prototype,{
  init:function(opts){
   var self=this;

   self.options=$.extend(true,self.options,opts);

   self.props=$.extend(true,self.props,{
    delegateInputs:$.isPlainObject(opts.inputs)
   });

   self.props.delegateContainer=self.props.delegateInputs?$(self.options.inputs.container):null;
   self.props.inputs=self.props.delegateInputs?null:$(opts.inputs);

   self.prepare();
   self.trigger('init');
  },
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
       ch=e.which,
       regChar=obj.data(self.options.data)?new RegExp(obj.data(self.options.data).charFilter):null,
       f=!regChar||regChar.test(String.fromCharCode(e.which));

   if(ch==0||ch==8||ch==9||ch==13||ch==35||ch==36||ch==37||ch==39)
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