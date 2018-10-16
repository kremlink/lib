/*!by Alexander Kremlev*/
(function (factory) {
 'use strict';

 if(typeof define==='function'&&define.amd){
  define(['jquery','base'],factory);
 }else
 {
  if('theApp' in window)
  {
   if(!theApp.lib)
    throw 'theApp.lib doesn\'t exist!';
   theApp.set({data:'lib.Upload',object:factory(jQuery,theApp),lib:false});
  }
 }
}(function($,mgr){
 mgr.extend(Upload);

 function Upload(){
  "use strict";

  this.options={
   fileName:'file-name[]',
   template:'<div class="upload-file-block"><span class="upload-file-name"></span><a href="" class="upload-file-delete">&times;</a><div class="upload-file-loader"></div><input class="upload-file-helper" type="hidden" name="[name]" /></div>',
   objects:{name:'.upload-file-name',remove:'.upload-file-delete',loading:'.upload-file-loader',input:'.upload-file-helper'},
   url:'upload.php',
   acceptFileTypes:/(\.|\/)(png|jpg)$/i,
   maxFileSize:4000000,
   max:100,
   maxClass:'max',
   loadingClass:'loading',
   loadingText:'Ждем ответа сервера...',
   files:'files[]',
   funcs:{
    error:function(opts){
     switch (opts.what)
     {
      case 'type':
       alert(opts.file.name+': неподходящий тип файла');
       break;
      case 'size':
       alert(opts.file.name+': файл слишком большой');
     }
    },
    beforeSend:function(){return true;},
    addData:function(){
     return [];
    }
   }
  };
  
  this.props={
   append:null,//init
   data:{},
   readyToRemove:true,
   length:0,
   id:0//unique id for every request
  };
 }
 //-----------------
 $.extend(Upload.prototype,{
  init:function(opts){
   var self=this;

   self.options=$.extend(true,self.options,opts);

   self.props=$.extend(true,self.props,{
    append:$(opts.append)
   });

   self.options.template=self.options.template.replace('[name]',self.options.fileName);
   self.trigger('init',[{append:self.props.append}]);
   self.setHandlers();
  },
  validate:function(file){
   var self=this,
       f=true;

   if(!(self.options.acceptFileTypes.test(file.type)||self.options.acceptFileTypes.test(file.name)))
   {
    self.options.funcs.error({what:'type',file:file});
    f=false;
   }
   if(self.options.maxFileSize<file.size)
   {
    self.options.funcs.error({what:'size',file:file});
    f=false;
   }

   return f;
  },
  clear:function(fromServer){
   var self=this;
   
   for(var x in self.props.data)
   {
    if(self.props.data.hasOwnProperty(x))
    {
     if(self.props.data[x].jqXHR.readyState!=4)
      self.props.data[x].jqXHR.abort();
     self.props.data[x].block.remove();
     delete self.props.data[x];
    }
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
    if(!self.validate(files[i]))
     continue;

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

    self.trigger('add');
   }
  },
  ajax:function(id,file){
   var self=this,
       fd,
       add=self.options.funcs.addData.apply(self);
   
   fd=new FormData();
   fd.append(self.options.files,file);

   for(var i=0;i<add.length;i++)
    fd.append(add[i].name,add[i].value);
   
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
     return self.options.funcs.beforeSend({id:id});
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
   self.trigger('added',[{r:r}]);
   if(self.allDone())
    self.trigger('addedAll');
  },
  allDone:function(){
   var self=this,
       f=true;
   
   for(var x in self.props.data)
    if(self.props.data.hasOwnProperty(x)&&self.props.data[x].jqXHR.readyState!=4)
     f=false;
   
   return f;
  },
  progress:function(e,id){
   var self=this,
       p=parseInt(e.loaded/e.total*100,10)+'%',
       text=self.options.loadingText;
   
   self.props.data[id].loading.css('width',p);
   if(text)
    self.props.data[id].loading.text(p);
   if(p=='100%')
   {
    self.props.readyToRemove=false;
    self.props.data[id].loading.text(text);
   }

   self.trigger('progress',[{
    persentage:p,
    data:self.props.data[id]
   }]);
  },
  removeClick:function(obj){
   var self=this,
       id,
       d;
   
   if(self.props.readyToRemove)
   {
    for(var x in self.props.data)
    {
     if(self.props.data.hasOwnProperty(x)&&self.props.data[x].remove.is(obj))
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