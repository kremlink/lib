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
    url:null,
    shown:'.overlay-pop.special .shown',
    sent:'.overlay-pop.special .sent',
    inputs:'',
    extra_:{
     err:'error'
    }
   }
   */
   
   /*
   extra_:{
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
      var u=this.getInner('extra'),
       files=opts.form.find(':file');

      opts.form.on('focus','input[type=text],input[type=password],textarea,select',function(){
       $(this).removeClass(u.err);
      });

      files.each(function(i){
       var obj=$(this);

       obj.on('change',function(){
        var f=mgr.get('misc.validateUpload')({data:u.upload,file:this.files[0]});

        if(f)
        {
         u.$fName.eq(i).text(obj.val().match(/[^\\]*\.(\w+)$/)[0]);
         u.fileWrap(obj).removeClass(u.err);
        }else
        {
         obj.val('');
        }
       });
      });

      u.$fCaller.each(function(i){
       $(this).on('click',function(e){
        files.eq(i)[0].click();

        e.preventDefault();
       });
      });
     }
    },
    validate:function(opts){
     var u=this.getInner('extra'),
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
       u.fileWrap(obj).addClass(u.err);
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
      var u=this.getInner('extra');
      
	  opts.form.on('focus','input[type=text],input[type=password],textarea,select',function(){
	   $(this).removeClass(u.err);
	  });
	 },
	 sending:function(e,opts){
	  var u=this.getInner('extra'),
	   props=this.getProps();
	  
	  if(u.type==='shrink')
	  {
	   opts.form.height(props.shown.innerHeight());
	   u.h=props.sent.innerHeight();
	  }
	 },
     sent:function(e,opts){
      var u=this.getInner('extra'),
       m=mgr.shared.metrika?window[mgr.shared.metrika.name]:null;//yaCounterXXXXXX

      if(m&&m.reachGoal)
       m.reachGoal(mgr.shared.metrika.goal);

      if(u.type=='shrink')
       opts.form.height(u.h);
     }
    },
    validate:function(opts){
     var u=this.getInner('extra');

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
    
    mgr.set({data:'forms.ad',object:'Form',on:formData.events,extra:{funcs:{validate:formData.validate}}});
    //mgr.get('form').method('show');
   });
  });
 }
}));