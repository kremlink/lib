/*
 form:{
 form:'.overlay-pop.special',
 sender:'.overlay-pop.special .send',
 url:null,
 shown:'.overlay-pop.special .shown',
 sent:'.overlay-pop.special .sent',
 extra_:{
 err:'error'
 }
 }

 mgr.get('form').method('show');

 var form={
 events:{
 init:function(e,opts){
 var u=this.getInner('extra');

 opts.form.on('focus','input[type=text],input[type=password],textarea,select',function(){
 $(this).removeClass(u.err);
 });
 }
 },
 validate:function(opts){
 var u=this.getInner('extra');

 opts.error=function(obj){
 obj.addClass(u.err);
 };

 return mgr.get('lib.utils.form.validate')(opts);
 }
 };

 mgr.set({data:'all.form',object:'Form',on:form.events,extra:{validate:form.validate}});
 */

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
   SiteManager.lib['Form']=factory(jQuery,SiteManager);
  }
 }
}(function($,mgr){
 function Form(opts){
  "use strict";
  
  var self=this;
  
  mgr.Base.apply(this,arguments);
  
  self.options=$.extend(true,{
   sendingClass:'sending',
   shownClass:'shown',
   hiddenClass:'hidden',
   initEvent:'init',
   sendingEvent:'sending',
   sentEvent:'sent',
   ajax:true,
   url:null,//if undef -> opts.form has to be <form action="url">
   type:'GET',
   captcha:{
    url:null,
    sendingClass:'captcha-sending',
    sentEvent:'captcha-sent'
   },
   captchaUrl:null,
   error:opts.error||function(type){
    switch(type){
     case 'sending':alert('В процессе отправки...');break;
     case 'captcha':alert('Неверная каптча!');break;
     case 'fail':alert('Запрос не прошел. Попробуйте позже.');break;
    }
   }
  },opts);
  
  self.props={
   form:$(opts.form),
   loader:null,
   sender:$(opts.sender),
   shown:$(opts.shown),
   sent:$(opts.sent),
   sending:false,
   captcha:{
    input:opts.captchaUrl?$(opts.captcha.input):null,
    img:opts.captchaUrl?$(opts.captcha.img):null,
    ajax:null,
    correct:false
   },
   blockFlag:{},
   validate:opts.validate||function(){return true;},
   ajax:null
  };



  init();

  function init(){
   self.prepare();
  }
 }
 //-----------------
 mgr.extend(Form);
 //-----------------
 $.extend(Form.prototype,{
  prepare:function(){
   var self=this;

   if(!self.options.url)
    self.options.url=self.props.form.attr('action');

   if(!self.options.loader)
    self.props.loader=self.props.form;

   self.trigger(self.options.initEvent,[{
    form:self.props.form,
    sender:self.props.sender
   }]);

   if(!self.options.ajax)
   {
    self.whenForm();
   }else
   {
    if(self.props.form.is('form'))
    {
     self.whenForm();
    }else
    {
     self.props.sender.on('click',function(e){
      self.send();

      e.preventDefault();
     });
    }
   }
  },
  whenForm:function(){
   var self=this;

   self.props.form.on('submit',function(){
    return self.send();
   });

   self.props.sender.on('click',function(e){
    self.props.form.submit();

    e.preventDefault();
   });
  },
  show:function(){
   var self=this;

   self.props.shown.removeClass(self.options.hiddenClass);
   self.props.sent.removeClass(self.options.shownClass);
  },
  blockSending:function(value){
   var self=this;

   self.props.blockFlag[value]=true;
  },
  unblockSending:function(value){
   var self=this;

   delete self.props.blockFlag[value];
  },
  send:function(){
   var self=this,
       f=false;

   if(self.props.sending)
   {
    self.options.error('sending');

    return false;
   }

   if(self.props.validate.apply(self,[{
    form:self.props.form,
    sender:self.props.sender,
    blockFlag:self.props.blockFlag
   }])&&$.isEmptyObject(self.props.blockFlag))
   {
    if(self.options.captcha.url&&!self.props.captcha.correct)
    {
     self.props.sending=true;
     self.captchaAjax();
    }else
    {
     if(!self.options.ajax)
     {
      self.trigger(self.options.sendingEvent,[{form:self.props.form}]);
      f=true;
     }else
     {
      self.props.sending=true;
      self.trigger(self.options.sendingEvent,[{form:self.props.form}]);
      self.formAjax();
     }
    }
   }

   return f;
  },
  captchaAjax:function(){
   var self=this;

   self.props.loader.addClass(self.options.captcha.sendingClass);
   self.props.captcha.ajax=$.ajax({
    url:self.options.captcha.url,
    data:self.props.captcha.input.serialize(),
    dataType:'json',
    success:function(r){
     self.props.sending=false;
     self.props.loader.addClass(self.options.captcha.sendingClass);
     if(r.correct)
     {
      self.props.captcha.correct=true;
      self.trigger(self.options.captcha.sentEvent);
      self.send();
     }else
     {
      self.props.captcha.img.attr('src',r.src);
      self.options.error('captcha');
     }
    },
    error:function(){
     self.props.sending=false;
     self.props.loader.addClass(self.options.captcha.sendingClass);
     self.options.error('fail');
    }
   });
  },
  formAjax:function(){
   var self=this,
       inps;

   self.props.loader.addClass(self.options.sendingClass);
   inps=self.props.form.find(':input');
   self.props.ajax=$.ajax({
    url:self.options.url,
    type:self.options.type,
    data:inps.serialize(),
    success:function(r){
     self.props.shown.addClass(self.options.hiddenClass);
     self.props.sent.addClass(self.options.shownClass);
     self.trigger(self.options.sentEvent,[{
      req:r,
      sender:self.props.sender,
      sent:self.props.sent,
      inputs:inps
     }]);
     self.props.sending=false;
     self.props.loader.removeClass(self.options.sendingClass);
    },
    error:function(){
     self.props.sending=false;
     self.props.loader.removeClass(self.options.sendingClass);
     self.options.error('fail');
    }
   });
  }
 });
  
 return Form;
}));