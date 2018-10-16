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

   /*
   form:{
    form:'.overlay-pop.special',
    sender:'.overlay-pop.special .send',
    shown:'.overlay-pop.special .shown',
    sent:'.overlay-pop.special .sent',
    inputs:'',
    options:{
     url:null
    },
    extra:{
     err:'error'
    }
   }
   */
   
   /*
   extra:{
    err:'error',
    data:'what',
    fileWrap:function(obj){
     return obj.closest('.upload');
    },
    $fCaller:'.add-user-block .btn-red',
    $fName:'.add-user-block .u-name',
    upload:{
        acceptFileTypes:/(\.|\/)(png|jpg)$/i,
        maxFileSize:100000
    }
   }
   */
   //------------------------------------------------------
   //------------------------------------------------------
  var formData={
    events:{
     init:function(e,opts){
      var u=this.get('data').extra;

      opts.form.on('focus','input[type=text],input[type=password],textarea,select',function(){
       $(this).removeClass(u.err);
      });
	  
	  if(u.$upload)
       {
        u.$upload.$file.on('change',function(){
         var f=u.$upload.$file[0].files[0],
         err=mgr.get('lib.utils.fValid')({file:f,type:u.$upload.acceptFileTypes,max:u.$upload.maxSize});

         if(err.max)
         {
          alert('Превышен максимально допустимый размер файла');
         }else
         {
          if(err.type)
          {
           alert('Неподходящий тип файла');
          }else
          {
           if(f)
           {
            u.$upload.$caller.text(f.name);//$fInput.val().match(/[^\\]*\.(\w+)$/)[0]
            u.$upload.$cont.removeClass(u.err);
           }
          }
         }
        });
       }

      /*u.$fCaller.each(function(i){
       $(this).on('click',function(e){
        files.eq(i)[0].click();

        e.preventDefault();
       });
      });*/
     }
    },
    validate:function(opts){
     var u=this.get('data').extra,
      f=true;

     opts.error=function(obj){
      var d=obj.data(u.data);

      u.fileWrap(obj).addClass(u.err);
      if(d)
       view.invalid(d);else
       obj.addClass(u.err);
     };

     opts.form.find(':file').each(function(){
      var obj=$(this);

      if(!obj.val())
      {
       f=false;
       u.$upload.$cont.addClass(u.err);
      }
     });

     return mgr.get('lib.utils.form.validate')(opts)&&f;
    },
    addData:function(){
     return [{name:'from',value:data.from}];
    }
   };
   //------------------------
   //------------------------
   mgr.set({data:'shared.form',object:{
    events:{
     init:function(e,opts){
      var u=this.get('data').extra;
      
	  opts.form.on('focus','input[type=text],input[type=password],textarea,select',function(){
	   $(this).removeClass(u.err);
	  });
	 },
	 sending:function(e,opts){
	  var u=this.get('data').extra,
	   props=this.get('props');
	  
	  if(u.type==='shrink')
	  {
	   opts.form.height(props.shown.innerHeight());
	   u.h=props.sent.innerHeight();
	  }
	 },
     sent:function(e,opts){
      var u=this.get('data').extra,
       m=mgr.shared.metrika?window[mgr.shared.metrika.name]:null;//yaCounterXXXXXX

      if(m&&m.reachGoal)
       m.reachGoal(mgr.shared.metrika.goal);

      if(u.type==='shrink')
       opts.form.height(u.h);
     }
    },
    validate:function(opts){
     var u=this.get('data').extra;

     opts.error=function(obj){
      obj.addClass(u.err);
     };

     return mgr.get('lib.utils.form.validate')(opts);
    }
   },lib:false});
   //------------------------------------------------------
   //------------------------------------------------------
   $(function(){
    var formData=mgr.get('shared.form');
    
    mgr.set({data:'index.form',object:'Form',on:formData.events,extra:{options:{funcs:{validate:formData.validate}}}});
    //mgr.get('form').method('show');
   });
  });
 }
}));