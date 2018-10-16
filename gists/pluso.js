<div class="pluso" data-background="transparent" data-options="small,square,line,horizontal,nocounter,theme=01" data-services="vkontakte,odnoklassniki,facebook,twitter,moimir"></div>

pluso:{
 enabled:true
}

var pluso=function(opts){
 if(opts.data.enabled&&!window.ifpluso&&!(window.pluso&&typeof window.pluso.start=="function"))
 {
  window.ifpluso=1;
  $.getScript(('https:'==location.protocol?'https':'http')+'://share.pluso.ru/pluso-like.js');
 }
};

mgr.set({data:'contacts.pluso',object:pluso,call:true});