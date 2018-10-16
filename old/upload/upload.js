/*
 <div class="upload">
 Ваша конструкция:<br/>
 <div class="upload-file-wrap">
 <a href="" class="upload-caller">Приложить файл</a>
 <div class="upload-file-inner-wrap"><input type="file" name="files[]" title=" " /></div>
 </div>
 </div>

 upload:{
  append:'#somewhere .upload',
  acceptFileTypes:/(\.|\/)(png|jpg|bmp|gif)$/i,
  url:'',
  //max:1,
  userObject:{
   $file:'#somewhere .upload input:file'
  }
 }
 //------------------------
 mgr.get('upload').method('clear');

 var upload={
 remove:function(e,opts){
 if(opts.aborted)
 {
 opts.success();
 return;
 }

 shared.uploadForm.method('blockSending','file');
 $.ajax({
 url:opts.url+'?file='+(opts.input?opts.input.val():true),
 type:'DELETE',
 success:function(){
 opts.success();
 shared.uploadForm.method('unblockSending','file');
 },
 error:function(){
 shared.uploadForm.method('unblockSending','file');
 }
 });
 },
 add:function(){
 shared.uploadForm.method('blockSending','file');
 },
 failed:function(){
 shared.uploadForm.method('blockSending','file');
 alert('Возникли проблемы при загрузке файла. Попробуйте удалить его и снова добавить...');
 },
 addedAll:function(){
 shared.uploadForm.method('unblockSending','file');
 },
 init:function(){
 var self=this,
 u=self.userObject,
 t=$(document.createTextNode('')).insertBefore(u.$file),
 f=$('<form></form>');

 shared.uploadForm=mgr.get('all.order.special.form');

 u.$caller.on('click',function(){
 u.$file[0].click();
 });

 u.$file.on('change',function(){
 self.method('add',this.files);
 f.append(u.$file)[0].reset();
 u.$file.insertAfter(t);
 });
 }
 };
 //------------------------
 mgr.setObject('upload','Upload',{
 on:upload
 });
*/
/*!by Alexander Kremlev*/
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
   SiteManager.lib['Upload']=factory(jQuery,SiteManager);
  }
 }
}(function($,mgr){
 function Upload(opts){
  "use strict";
  
  var self=this;
  
  mgr.Base.apply(this,arguments);
  
  self.options=$.extend(true,{
   fileName:'file-name[]',
   template:'<div class="upload-file-block"><span class="upload-file-name"></span><a href="" class="upload-file-delete">&times;</a><div class="upload-file-loader"></div><input class="upload-file-helper" type="hidden" name="[name]" /></div>',
   objects:{name:'.upload-file-name',remove:'.upload-file-delete',loading:'.upload-file-loader',input:'.upload-file-helper'},
   url:'upload.php',
   acceptFileTypes:/(\.|\/)(png|jpg)$/i,
   maxFileSize:4000000,
   max:100,
   maxClass:'max',
   loadingClass:'loading',
   loadStatus:true,
   beforeSend:function(){return true;},
   files:'files[]'
  },opts);
  
  self.props={
   append:$(opts.append),
   data:{},
   readyToRemove:true,
   length:0,
   id:0//unique id for every request
  };

  self.options.template=self.options.template.replace('[name]',self.options.fileName);
  
  init();
  
  function init(){
   self.trigger('init',[{append:self.props.append}]);
   
   self.setHandlers();
  }
 };
 //-----------------
 mgr.extend(Upload);
 //-----------------
 $.extend(Upload.prototype,{
  clear:function(fromServer){
   var self=this;
   
   for(var x in self.props.data)
   {
    if(self.props.data[x].jqXHR.readyState!=4)
     self.props.data[x].jqXHR.abort();
    self.props.data[x].block.remove();
    delete self.props.data[x];
   }
   
   self.props.append.removeClass(self.options.maxClass);
   if(fromServer)
   {
    self.trigger('remove',[{url:self.options.url,success:function(){
     self.props.length=0;
    }}]);
   }else
   {
    self.props.length=0;
   }
  },
  setHandlers:function(){
   var self=this;
   
   self.props.append.on('click',self.options.objects.remove,function(e){
    self.removeClick($(this));
    
    e.preventDefault();
   });
  },
  add:function(files){
   var self=this,
       ajax,
       t;
   
   if(!files.length)
    return;
   
   for(var i=0;i<files.length;i++)
   {
    if(!(self.options.acceptFileTypes.test(files[i].type)||self.options.acceptFileTypes.test(files[i].name)))
    {
     alert('Неподходящий тип файла');
     continue;
    }
    if(self.options.maxFileSize<files[i].size)
    {
     alert('Файл слишком большой');
     continue;
    }
    if(self.props.length>=self.options.max-1)
    {
     self.props.append.addClass(self.options.maxClass);
     if(self.props.length>self.options.max-1)
      return;
    }
    
    ajax=self.ajax(self.props.id,files[i]);
    
    t=$(self.options.template).appendTo(self.props.append);
    
    self.props.data[self.props.id]={
     block:t,
     name:t.find(self.options.objects.name).text(files[i].name),
     remove:t.find(self.options.objects.remove),
     loading:t.find(self.options.objects.loading),
     input:t.find(self.options.objects.input),
     jqXHR:ajax,
     aborted:false
    };
    
    self.props.data[self.props.id].loading.addClass(self.options.loadingClass);
    self.props.append.addClass(self.options.loadingClass);

    self.props.id++;
    self.props.length++;
   }
   
   self.trigger('add');
  },
  ajax:function(id,file){
   var self=this,
       fd;
   
   fd=new FormData();
   fd.append(self.options.files,file);
   
   return $.ajax({
    url:self.options.url,
    type:'POST',
    dataType:'json',
    xhr:function(){
     var myXhr=$.ajaxSettings.xhr();
     
     myXhr.upload.addEventListener('progress',function(e){
      self.progress(e,id);
     },false);
     
     return myXhr;
    },
    beforeSend:function(){
     return self.options.beforeSend({id:id});
    },
    success:function(r){
     self.done(r,id);
    },
    error:function(){
     if(!self.props.data[id].aborted)
      self.trigger('failed');
     self.removeSuccess(id);
    },
    data:fd,
    cache:false,
    contentType:false,
    processData:false
   });
  },
  done:function(r,id){
   var self=this,
       d=self.props.data[id];
   
   d.loading.removeClass(self.options.loadingClass);
   self.props.append.removeClass(self.options.loadingClass);
   d.name.text(r[0].name);
   d.input.val(r[0].name);
   self.props.readyToRemove=true;
   self.trigger('added',[{thSrc:r[0].thumbnail_url}]);
   if(self.allDone())
    self.trigger('addedAll');
  },
  allDone:function(){
   var self=this,
       f=true;
   
   for(var x in self.props.data)
    if(self.props.data[x].jqXHR.readyState!=4)
     f=false;
   
   return f;
  },
  progress:function(e,id){
   var self=this,
       p=parseInt(e.loaded/e.total*100,10)+'%';
   
   self.props.data[id].loading.css('width',p);
   if(self.options.loadStatus)
    self.props.data[id].loading.text(p);
   if(p=='100%')
   {
    self.props.readyToRemove=false;
    if(self.options.loadStatus)
     self.props.data[id].loading.text('Ждем ответа сервера...');
   }
  },
  removeClick:function(obj){
   var self=this,
       id,
       d;
   
   if(self.props.readyToRemove)
   {
    for(var x in self.props.data)
    {
     if(self.props.data[x].remove.is(obj))
      {
       id=x;
       break;
      }
    }
    
    d=self.props.data[id];
    
    if(d.jqXHR.readyState!=4)
    {
     d.aborted=true;
     d.jqXHR.abort();
    }else
    {
     self.trigger('remove',[{aborted:d.aborted,url:self.options.url,input:d.input,success:function(){
      self.removeSuccess(id);
     }}]);
    }
   }
  },
  removeSuccess:function(id){
   var self=this,
       d=self.props.data[id];

   d.block.remove();
   self.props.append.removeClass(self.options.maxClass);
   self.props.append.removeClass(self.options.loadingClass);
   self.props.length--;
   delete self.props.data[id];
  }
 });
  
 return Upload;
}));