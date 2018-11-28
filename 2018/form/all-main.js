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
   
   
   extra:{
    err:'error',
    $upload:{
      $cont:'.order-form .upload',
      $files:'.order-form .upload input',
      $callers:'.order-form .att',
      $names:'.order-form .name',
      $del:'.order-form .rem',
      acceptFileTypes:/.*/i,
      maxSize:10000000,
      added:'added'
     }
   }
  
   <div class="upload">
		Ваш логотип
		<div class="add">
			<div class="att">Прикрепить</div>
			<div class="name"></div>
			<div class="rem">&times;</div>
		</div>
		<input type="file" name="files[]"/>
	</div>
   //------------------------------------------------------
   //------------------------------------------------------
  var formData={
    events:{
     init:function(e,opts){
      var u=this.get('data').extra,
       clr;

     if(u.$upload)//see example markup and data above
     {
      clr=function(i){
       u.$upload.$files.eq(i).wrap('<form>').closest('form').get(0).reset();
       u.$upload.$files.eq(i).unwrap();
      };

      u.$upload.$files.each(function(i){
       var obj=$(this);

       obj.on('change',function(){
        var f=obj[0].files[0],
         err=mgr.get('lib.utils.fValid')({file:f,type:u.$upload.acceptFileTypes,max:u.$upload.maxSize});

        if(err.max)
        {
         alert('Превышен максимально допустимый размер файла');
         clr(i);
        }else
        {
         if(err.type)
         {
          alert('Неподходящий тип файла');
          clr(i);
         }else
         {
          if(f)
          {
           u.$upload.$names.eq(i).text(f.name.match(/[^\\]*\.(\w+)$/)[0]);
           u.$upload.$cont.eq(i).addClass(u.$upload.added);
          }
         }
        }
       });
      });

      u.$upload.$callers.each(function(i){
       $(this).on('click',function(e){
        u.$upload.$files.eq(i)[0].click();

        e.preventDefault();
       });
      });

      u.$upload.$del.each(function(i){
       $(this).on('click',function(e){
        u.$upload.$cont.eq(i).removeClass(u.$upload.added);
        u.$upload.$names.eq(i).text('');
        clr(i);

        e.preventDefault();
       });
      });
     }
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