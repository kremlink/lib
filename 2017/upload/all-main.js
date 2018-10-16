(function (factory) {
 'use strict';
 
  if(typeof define==='function'&&define.amd)
  {
   define(['jquery','base','data/index-data','lib/utils','lib/save'],factory);
  }else
  {
   factory(jQuery,SiteManager);
  }
}(function($,mgr){
 if(mgr.shared.page_=='forms')
 {
  mgr.setBlock(function(){
   var shared={

   };
   //------------------------------------------------------
   //------------------------------------------------------
   <div class="upload">
   Ваша конструкция:<br/>
   <div class="upload-file-wrap">
   <a href="" class="upload-caller">Приложить файл</a>
   <div class="upload-file-inner-wrap"><input type="file" name="files[]" title=" " /></div>
   </div>
   </div>
   //--------
   upload:{
    append:'#somewhere .upload',
    acceptFileTypes:/(\.|\/)(png|jpg|bmp|gif)$/i,
    url:'',
    //max:1,
    userObject:{
     $file:'#somewhere .upload input:file'
    }
   }
   //--------
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
     shared.uploadForm.method('unblockSending','file');
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
   
   var addData=function(){
    var u=this.getInner('extra');
    
    return $(u.inputs).serializeArray();
   };
   //------------------------------------------------------
   //------------------------------------------------------
   $(function(){
    mgr.set({data:'constr.upload',object:'Upload',on:upload,
      extra:{funcs:{addData:addData}}});
   });
  });
 }
}));