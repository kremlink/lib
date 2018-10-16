/*
 upload:{
  append:'#somewhere .upload',
  acceptFileTypes:/(\.|\/)(png|jpg|bmp|gif)$/i,
  //max:1
 }
 //------------------------
 var upload={
  removeFile:function(e,opts){
   var u=this.userObject;
   
   if(opts.aborted)
   {
    opts.success();
    return;
   }
   
   mgr.get('spares.form').method('blockSending');
   $.ajax({
    url:opts.url+'?file='+(opts.input?opts.input.val():true),
    type:'DELETE',
    success:function(){
     opts.success();
     mgr.get('spares.form').method('unblockSending');
    },
    error:function(){
     mgr.get('spares.form').method('unblockSending');
    }
   });
  },
  add:function(){
   mgr.get('spares.form').method('blockSending');
  },
  addedAll:function(){
   mgr.get('spares.form').method('unblockSending');
  }
 };
 //------------------------
  mgr.setObject('upload',mgr.lib['Upload'],{
   on:{'remove':upload.removeFile,'add':upload.add,'addedAll':upload.addedAll,'failed':upload.add}
  });
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
   SiteManager.lib['Upload']=factory(jQuery,SiteManager);
  }
 }
}(function($,mgr){
 function Upload(opts){
  "use strict";
  
  var self=this;
  
  mgr.Base.apply(this,arguments);
  
  self.options=$.extend(true,{
   template:'<div class="file-block"><span class="file-name"></span><a href="" class="file-delete">x</a><div class="file-loader"></div><input class="file-helper" type="hidden" name="file-name[]" /></div>',
   objects:{name:'.file-name',remove:'.file-delete',loading:'.file-loader',input:'.file-helper'},
   url:'upload.php',
   acceptFileTypes:/(\.|\/)(png|jpg)$/i,
   maxFileSize:4000000,
   max:100,
   maxClass:'max'
  },opts);
  
  self.props={
   file:$(opts.file),
   append:$(opts.append),
   data:[],
   notify:true,
   readyToRemove:true,
   param:{file:'file',files:'files'},
   safariWin:~navigator.userAgent.indexOf('Windows')&&~navigator.userAgent.indexOf('Safari')&&!~navigator.userAgent.indexOf('Chrome')
  };
  
  init();
  
  function init(){
   self.props.file.fileupload({
    dataType:'json',
    url:self.options.url,
    add:function(e,data){
     self.addFile(e,data);
    },
    progress:function(e,data){
     self.progress(e,data);
    },
    done:function(e,data){
     self.done(e,data);
    },
    stop:function(){
     self.trigger('addedAll');
    },
    fail:function(){
     //see html5-ver. Wonder how to do the same here
     self.trigger('failed');
    }
   });
   
   self.setHandlers();
  }
 };
 //-----------------
 mgr.extend(Upload);
 //-----------------
 $.extend(Upload.prototype,{
  clear:function(){
   var self=this;
   
   for(var i=0;i<self.props.data.length;i++)
   {
    if(self.props.data[i].jqXHR.readyState!=4)
     self.props.data[i].jqXHR.abort();
    self.props.data[i].block.remove();
   }
   
   self.props.data=[];
   self.props.append.removeClass(self.options.maxClass);
  },
  destroy:function(){
   var self=this;
   
   self.props.file.fileupload('destroy');
  },
  setHandlers:function(){
   var self=this;
   
   self.props.append.on('click',self.options.objects.remove,function(e){
    self.removeClick($(this));
    
    e.preventDefault();
   });
   
   self.props.file.on('change',function(){
    self.props.notify=true;
   });
  },
  done:function(e,data){
   var self=this;
   
   data.context.loading.hide();
   data.context.name.text(data.result[0].name);
   data.context.input.val(data.result[0].name);
   self.props.readyToRemove=true;
   self.trigger('added',[{thSrc:data.result[0].thumbnail_url}]);
  },
  progress:function(e,data){
   var self=this,
       p=parseInt(data.loaded/data.total*100,10)+'%';
   
   data.context.loading.css('width',p).text(p);
   if(p=='100%')
    self.props.readyToRemove=false;
  },
  addFile:function(e,data){
   var self=this,
       t;
   
   if(!(self.options.acceptFileTypes.test(data.files[0].type)||self.options.acceptFileTypes.test(data.files[0].name)))
   {
    alert('Неподходящий тип файла');
    return;
   }
   if(self.options.maxFileSize<data.files[0].size)
   {
    alert('Файл слишком большой');
    return;
   }
   if(self.props.data.length>=self.options.max-1)
   {
    self.props.append.addClass(self.options.maxClass);
    if(self.props.data.length>self.options.max-1)
     return;
   }
   
   if(!data.files[0].size&&self.props.safariWin)
   {
    if(self.props.notify)
     alert('Вы пытаетесь загрузить несколько файлов в браузере, который это не поддерживает');
    self.props.notify=false;
    return;
   }
   
   self.trigger('add');
   t=$(self.options.template).appendTo(self.props.append);
   data.context={
    block:t,
    name:t.find(self.options.objects.name).text(data.files[0].name),
    remove:t.find(self.options.objects.remove),
    loading:t.find(self.options.objects.loading),
    input:t.find(self.options.objects.input)
   };
   
   data.context.jqXHR=data.submit();
   data.context.loading.show();
   
   self.props.data.push(data.context);
   
   if(mgr.utils['IEVer']())
    data.context.loading.css('width','100%').text('Грузим...');
  },
  removeClick:function(obj){
   var self=this,
       i,d,
       aborted=false;
   
   if(self.props.readyToRemove)
   {
    i=mgr.utils['findIndexInArray']({array:self.props.data,item:obj,key:'remove',is:true});
    d=self.props.data[i];
    if(d.jqXHR.readyState!=4)
    {
     d.jqXHR.abort();
     aborted=true;
    }else
    {
     self.trigger('remove',[{aborted:aborted,url:self.options.url,param:self.props.param.file,input:d.input,success:function(){
      self.removeSuccess(i);
     }}]);
    }
   }
  },
  removeSuccess:function(i){
   var self=this,
       d=self.props.data[i];
   
   d.block.remove();
   self.props.data.splice(i,1);
   self.props.append.removeClass(self.options.maxClass);
  }
 });
  
 return Upload;
}));