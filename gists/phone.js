<label class="item">
    Номер телефона<input class="phone-mask" placeholder="+7 (___) ___-__-__" type="text" name="phone"/>
</label>

masked:{
$fields:'.phone-mask',
mask:'+7 (495) xxx-xx-xx',
settings:{
 
}
}

var masked=function(opts){
 opts.data.$fields.mask(opts.data.mask,opts.data.settings);
};

delete $.mask.definitions['9'];
$.mask.definitions['x']='[0-9]';
mgr.set({data:'all.masked',object:masked,call:true});