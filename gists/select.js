<span class="t-cont">
    <select data-valid="1" name="term">
        <option selected disabled value="Выберите">Выберите</option>
        <option value="Полгода">Полгода</option>
        <option value="10 лет">10 лет</option>
        <option value="11 лет">11 лет</option>
    </select>
    <span class="t-val"></span>
</span>

.t-cont{
  width:194px;
  height:42px;
  line-height:40px;
  font-weight:400;
  box-shadow:inset 0 0 0 1px getc(gray);
  position:relative;
  margin-top:3px;
  padding-left:16px;
  background:#fff;
  display:block;
  &.error{
    box-shadow:inset 0 0 0 1px getc(red);
  }
  &:before{
    content:'';
    @include abs($r:16px,$t:13px);
    @include trf(rotate(45deg));
    border-right:2px solid getc('bdr.form-bdr');
    border-bottom:2px solid getc('bdr.form-bdr');
    width:9px;
    height:9px;
  }
  select{
    @include abs($l:0);
    opacity:0;
    width:100%;
    height:100%;
    @extend %bxz;
    option{
      padding:4px 0;
    }
  }
}

form:{
 form:'.forms-block',
 sender:'.forms-block .the-btn',
 url:null,
 shown:'.forms-block .init',
 sent:'.forms-block .sent',
 extra_:{
  err:'error',
  closest:'.t-cont'
 }
},
select:{
 city:'.forms-block .term .t-val',
 select:'.forms-block .term select'
}

opts.form.on('focus','input[type=text],input[type=password],textarea,select',function(){
 var obj=$(this);

 if(obj.is('select'))
  obj.closest(u.closest).removeClass(u.err);else
  obj.removeClass(u.err);
});

var select=function(opts){
 var city=$(opts.data.city),
     sel=$(opts.data.select),
     v=sel.val();

 city.text(v?v:sel.children(':disabled').val());
 sel.on('change',function(){
  city.text(sel.val());
 });
};

mgr.set({data:'forms.select',object:select,call:true});