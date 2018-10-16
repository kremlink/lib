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
   changeEvent:'change',
   keypress:false,
   leadingZero:false
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
   self.trigger('init');
   self.prepare();
  }
 }
 //-----------------
 mgr.extend(Input);
 //-----------------
 $.extend(Input.prototype,{
  prepare:function(){
   var self=this,
       evts={
        'keydown':function(e){
         return self.keydown(e,$(this));
        },
        'cut paste':function(){
         self.cutPaste($(this));
        }
       };

   if(self.options.keypress)
   {
    evts['keypress']=function(e){
     return self.keypress(e,$(this));
    };
   }

   if(self.props.delegateInputs)
    self.props.delegateContainer.on(evts,self.options.inputs.selector);else
    self.props.inputs.on('keypress',evts['keypress']).on('keydown',evts['keydown']).on('cut paste',evts['cut paste']);
  },
  keydown:function(e,obj){
   var self=this;
   
   if(e.which==8||e.which==46||!self.options.keypress)
    return self.keypress(e,obj);else
    return true;
  },
  keypress:function(e,obj){
   var self=this,
       val=obj.val(),
       ch=String.fromCharCode(e.which),
       regVal=obj.data(self.options.data)?new RegExp(obj.data(self.options.data).valueFilter):null,
       regChar=obj.data(self.options.data)?new RegExp(obj.data(self.options.data).charFilter):null;
   
   if(e.ctrlKey||(e.which>=112&&e.which<=123)||e.which==36||e.which==9)
   {
    setTimeout(function(){
     if(val==obj.val())
      return;
     if(regVal&&!regVal.test(obj.val()))
      obj.val('');
     if(!obj.val().length)
      self.trigger(self.options.emptyEvent,[{input:obj}]);
     self.trigger(self.options.changeEvent,[{input:obj}]);
    },0);
    return true;
   }

   var r=obj.getSelection();
   
   if(!regChar||(regChar.test(ch)&&self.len(r,obj))||e.which==116||e.which==37||e.which==8||e.which==46)
   {
    if(self.options.leadingZero&&e.which==48&&r.start==0&&r.end<obj.val().length)
     return false;

    val=obj.val();
    
    setTimeout(function(){
     if(val==obj.val())
      return;
     if(!obj.val().length)
      self.trigger(self.options.emptyEvent,[{input:obj}]);
     self.trigger(self.options.changeEvent,[{input:obj}]);
    },10);
    
    return true;
   }else
   {
    return false;
   }
  },
  cutPaste:function(obj){//old - value.charAt(i)
   var self=this,
       //val=obj.val(),
       regVal=obj.data(self.options.data)?new RegExp(obj.data(self.options.data).valueFilter):null;
   
   setTimeout(function(){
    //if(val==obj.val())
     //return;
    if(regVal&&!regVal.test(obj.val()))
     obj.val('');
    if(!obj.val().length)
     self.trigger(self.options.emptyEvent,[{input:obj}]);
    self.trigger(self.options.changeEvent,[{input:obj}]);
   },0);
  },
  test:function(input){//for external use
   var self=this,
       regVal=new RegExp(input.data(self.options.data).valueFilter);
   
   return regVal.test(input.val());
  },
  len:function(r,obj){
   var length=obj.val().length,
       maxlength=obj.attr('maxlength')||-1;
  
   return !~maxlength||length<maxlength||length==maxlength&&r.length>0;
  }
 });
  
 return Input;
}));