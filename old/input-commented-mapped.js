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
 mgr.lib['Input']=function(opts,func){
  "use strict";
  
  var self=this;
  
  mgr.Base.apply(this,arguments);
  
  self.options=$.extend(true,{
   data:'filter',
   emptyEvent:'empty',
   changeEvent:'change',
   simple:false,
   ru:false
  },opts);
  
  self.props={
   inputs:$(opts.inputs)/*,
   characterMap:{},
   sCharacterMap:{}*/
  };
  
  init();
  
  function init(){
   //if(!self.options.simple)
    //self.setChars();
   self.prepare();
  }
 };
 //-----------------
 mgr.extend(mgr.lib['Input']);
 //-----------------
 $.extend(mgr.lib['Input'].prototype,{
  prepare:function(){
   var self=this;
   
   if(self.options.simple)
   {
    self.props.inputs.on((mgr.utils['IEVer']()<=9?'keyup cut paste ':'')+'input',function(){
     self.cutPaste($(this));
    });
   }else{
    self.props.inputs.on('keypress',function(e){
     return self.keydown(e,$(this));
    }).on('cut paste',function(){
     self.cutPaste($(this));
    });
   }
  },
  keydown:function(e,obj){
   var self=this,
       val=obj.val(),
       //ch=self.getChar(e.shiftKey,e.which>=96&&e.which<=105?e.which-48:e.which),
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
   
   if(!regChar||(regChar.test(ch)&&self.length(r,obj))||e.which==116||e.which==37||e.which==39||e.which==8||e.which==46)
   {
    if((e.which==48||e.which==96)&&r.start==0&&r.end<obj.val().length)
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
       val=obj.val(),
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
  length:function(r,obj){
   var length=obj.val().length,
       maxlength=obj.attr('maxlength')||-1;
  
   if(!~maxlength||length<maxlength||length==maxlength&&r.length>0)
    return true;else
    return false;
  }/*,
  setChars:function(){
   var self=this;
   
   self.props.characterMap={
    '188':'44',
    '109':'45',
    '190':'46',
    '191':'47',
    '192':'96',
    '220':'92',
    '222':'39',
    '221':'93',
    '219':'91',
    '173':'45',
    '187':'61', //IE Key codes
    '186':'59', //IE Key codes
    '189':'45'  //IE Key codes
   };
   
   if(self.options.ru)
    $.extend(self.props.characterMap,{
     '188':'1073',
     '190':'1102',
     '191':'46',
     '192':'235',
     '219':'1093',
     '221':'1098',
     '222':'1101',
     '186':'1078'
    });
   
   self.props.sCharacterMap={
    '96':'~',
    '49':'!',
    '50':'@',
    '51':'#',
    '52':'$',
    '53':'%',
    '54':'^',
    '55':'&',
    '56':'*',
    '57':'(',
    '48':')',
    '45':'_',
    '61':'+',
    '91':'{',
    '93':'}',
    '92':'|',
    '59':':',
    '39':'\'',
    '44':'<',
    '46':'>',
    '47':'?'
   };
   
   if(self.options.ru)
    $.extend(self.props.sCharacterMap,{
     '46':',',
     '1073':'Б',
     '1102':'Ю',
     '1093':'Х',
     '1098':'Ъ',
     '1101':'Э',
     '1078':'Ж',
     '235':'Ё'
    });
  },
  getChar:function(shift,ch){
   var self=this;
   
   if(ch==27||ch==8||ch==9||ch==20||ch==16||ch==17||ch==91||ch==13||ch==92||ch==18)
    return false;
   
   if(typeof shift!='boolean'||typeof ch!='number')
    return false;
   
   if(self.props.characterMap.hasOwnProperty(ch))//normalize
    ch=self.props.characterMap[ch];
   
   if(!shift&&(ch>=65&&ch<=90))
   {
    ch=String.fromCharCode(ch+32);
   }else
   {
    if(shift&&self.props.sCharacterMap.hasOwnProperty(ch))
     ch=self.props.sCharacterMap[ch];else
     ch=String.fromCharCode(ch);
   }
   
   return ch;
  }*/
 });
  
 return mgr.lib['Input'];
}));