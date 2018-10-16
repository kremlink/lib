 <div class="overlay"></div>
 
 <div class="form">
 <a class="close" href=""></a>
 <div class="init">
 <label class="item">
 Ваше имя<br/>
 <input type="text" name="name" />
 </label>
 <label class="item">
 Ваш e-mail<br/>
 <input data-valid="^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$" type="text" name="phone" />
 </label>
 <a class="send" href=""></a>
 </div>
 <div class="sent"></div>
 </div>

 .overlay{
 @include abs($l:0,$r:0,$t:0,$b:0,$p:fixed);
 background:rgba(#000, 0.5);
 visibility:hidden;
 opacity:0;
 @include trs(all .5s ease-in-out);
 z-index:1;
 &.active{
 opacity:1;
 visibility:visible;
 }
 }
 .form{
  @include center();
 padding:20px;
 background:#fff;
 display:none;
 z-index:1;
 &.active{
 display:block;
 }
 .close{
 @include close-cross($d:18px,$w:22px,$c:#000,$h:2px);
 top:5px;
 right:5px;
 }
 .init.hidden{
 display:none;
 }
 .sent{
 display:none;
 &.shown{
 display:block;
 }
 }
 .item{
 display:block;
 margin-top:20px;
 }
 input{

 }
 .send{
 
 }
 }
 
 ----------------------
 
 pop:{
  callers:'.mailto',
  pops:'.pop-form',
  closers:'.pop-form .close',
  overlay:'.overlay',
  options:{
	esc:true,
  },
  extra:{
   form:null,
   shift:100
  }
 },
 form:{
    form:'.the-form',
    sender:'.the-form .the-btn',
    shown:'.the-form .shown',
    sent:'.the-form .sent',
    inputs:'',
    options:{
     url:null
    },
    extra:{
     err:'error'
    }
   }
 
 mgr.set({data:'shared.formPop',object:{
    pop:{
     show:function(e,opts){
      var u=this.get('data').extra;

      u.form.get('show');
      opts.pop.css('top',mgr.helpers.win.scrollTop()+u.shift);
     }
    },
    form:{
     events:{
      init:function(e,opts){
       var u=this.get('data').extra;

       opts.form.on('focus','input[type=text],input[type=password],textarea,select',function(){
        $(this).removeClass(u.err);
       });
      }
     },
     validate:function(opts){
      var u=this.get('data').extra;

      opts.error=function(obj){
       obj.addClass(u.err);
      };

      return mgr.get('lib.utils.form.validate')(opts);
     }
    }
   },lib:false});
 //---------------------
 var formPop=mgr.get('shared.formPop');
 
 mgr.set({data:'index.pop',object:'Toggle',on:formPop.pop,extra:{
    extra:{form:mgr.set({data:'index.form',object:'Form',on:formPop.form.events,extra:{options:{funcs:{validate:formPop.form.validate}}}})}
   }});