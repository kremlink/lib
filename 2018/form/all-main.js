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
   //----------------------------
  <div class="upload">
    <div class="u-caller">Прикрепить файл</div>
    <input type="file" name="files[]"/>
    <div class="u-name"></div>
    <div class="u-rem">&times;</div>
   </div>

   <label class="p-yes">
    <input type="checkbox" name="yes"/>
    Я ознакомлен(а) с условиями использования моих персональных данных и даю согласие на их обработку
   </label>
    //---------------------------
    .upload{
    width:180px;
    margin:0 auto 0 18px;
    position:relative;
    &.added{
    .u-caller{
      display:none;
     }
    .u-name,.u-rem{
      display:block;
     }
    }
    input{
     display:none;
    }
   }
  .u-caller{
    cursor:pointer;
    display:inline-block;
    position:relative;
    border-bottom:1px dotted #000;
   }
  .u-name{
    display:none;
    text-overflow:ellipsis;
    white-space:nowrap;
    overflow:hidden;
   }
  .u-rem{
    display:none;
    cursor:pointer;
    color:#f00;
    padding:10px 0;
    width:30px;
    text-align:center;
    @include center($l:-30px);
   }
   //---
  &.no .the-btn{
    opacity:0.4;
    pointer-events:none;
   }
   //------------------------
   //------------------------
   'all.theForm':{options:{url:'upload.php'},extra:{$upload:{maxSize:10000000}}}

   var data={
    theForm:{
     form:'.the-form',
     sender:'.f-send',
     shown:'.f-show',
     sent:'.f-sent',
     options:{
      url:null
     },
     extra:{
      err:'error',
      $upload:{
       $agree:'.form-pop .agree input',
       aCls:'nope',
       $cont:'.upload',
       $files:'input:file',
       $callers:'.u-caller',
       $names:'.u-name',
       $del:'.u-rem',
       acceptFileTypes:/(\.|\/)(png|jpg)$/i,
       maxSize:0,
       added:'added'
      },
      $agree:{
       no:'no',
       $yes:'.contacts-block .p-yes input'
      }
     }
    }
   }
   //------------------------
   //------------------------
   mgr.set({data:'shared.form',object:{
     events:{
      init:function(e,opts){
       var u=this.get('data').extra,
        clr;

       opts.form.on('focus','input[type=text],input[type=password],textarea,select',function(){
        $(this).removeClass(u.err);
       });

       if(u.$agree)
       {
        u.$agree.on('change',function(){
         opts.form[(!u.$agree.is(':checked')?'add':'remove')+'Class'](u.aCls);
        }).trigger('change');
       }

       if(u.$upload)
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

       if(u.$agree)
       {
        u.$agree.$yes.on('change',function(){
         opts.form[(u.$agree.$yes.is(':checked')?'remove':'add')+'Class'](u.$agree.no);
        }).trigger('change');
       }
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
     }/*,
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
     }*/
    },lib:false});
   //------------------------------------------------------
   var theForm=function(opts){
    var d=opts.data;

    $(d.form).each(function(){
     var obj=$(this);

     mgr.set({data:opts.name,object:'Form',on:formData.events,extra:{
       form:obj,
       sender:obj.find(d.sender),
       shown:obj.find(d.shown),
       sent:obj.find(d.sent),
       options:{funcs:{validate:formData.validate}},
       extra:{$upload:{
         $cont:obj.find(d.extra.$upload.$cont),
         $files:obj.find(d.extra.$upload.$files),
         $callers:obj.find(d.extra.$upload.$callers),
         $names:obj.find(d.extra.$upload.$names),
         $del:obj.find(d.extra.$upload.$del)
        }
       }
      },
      collection:true
     });
    });
   };
   //------------------------------------------------------
   $(function(){
    var formData=mgr.get('shared.form');
    
    mgr.set({data:'index.form',object:'Form',on:formData.events,add:{options:{funcs:{validate:formData.validate}}}});
    //mgr.get('form').method('show');
    //mgr.set({data:'all.theForm',object:theForm,call:true});
   });
  });
 }
}));