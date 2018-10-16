/*by Alexander Kremlev*/
(function (factory) {
 'use strict';
 
  if(typeof define==='function'&&define.amd)
  {
   define(['jquery','base'],factory);
  }else
  {
   factory(jQuery,SiteManager);
  }
}(function($,mgr){
 if(!mgr.lib.utils)
  mgr.lib.utils={};
 
 $.extend(mgr.lib.utils,{
  IEVer:function(){
   var undef,
       v=3,
       div=document.createElement('div'),
       all=div.getElementsByTagName('i');
   
   while(div.innerHTML='<!--[if gt IE '+(++v)+']><i></i><![endif]-->',all[0]);
   
   return v>4?v:undef;
  },
  findIndexInArray:function(opts){
   for(var i=0;i<opts.array.length;i++)
   {
    if(!opts.is&&!opts.subkey&&!opts.key&&opts.item==opts.array[i])
     return i;
    if(!opts.is&&!opts.subkey&&opts.key&&opts.item==opts.array[i][opts.key])
     return i;
    if(!opts.is&&opts.subkey&&opts.key&&opts.item==opts.array[i][opts.key][opts.subkey])
     return i;
    if(opts.is&&!opts.subkey&&!opts.key&&opts.item.is(opts.array[i]))
     return i;
    if(opts.is&&!opts.subkey&&opts.key&&opts.item.is(opts.array[i][opts.key]))
     return i;
    if(opts.is&&opts.subkey&&opts.key&&opts.item.is(opts.array[i][opts.key][opts.subkey]))
     return i;
   }
   
   return -1;
  },
  form:{
   focus:function(opts){
    var error=opts.error?opts.error:function(obj){obj.removeClass('error');};
    
    opts.form.on('focusin','input[type=text],input[type=password],textarea,select',function(){
     error($(this));
    });
   },
   validate:function(opts){
    var flag=true,
        check=opts.form?opts.form.find('input[type=text],input[type=password],textarea,select'):opts.check,
        test=opts.test?opts.test:function(){return false;},
        error=opts.error?opts.error:function(obj){obj.addClass('error');};
    
    check.each(function(i){
     var obj=$(this),
         reg=obj.data('valid'),
         ph=obj.data('placeholder');
     
     if(obj.is('select'))
     {
      if(obj.find(':selected').is(':disabled'))
      {
       flag=false;
      }
     }else
      if(!test(obj)
       &&(reg&&!(new RegExp(reg)).test($.trim(this.value))
        ||reg&&ph&&ph==$.trim(this.value)
       ))
      {
       flag=false;
       error(obj);
      }
    });
    
    if(flag&&opts.blockFlag)
    {
     alert('Файл все еще в процессе загрузки');
     return false;
    }
    
    return flag;
   }
  },
  loadImgs:function(arr){
   var imgs;
   
   for(var i=0;i<arr.length;i++)
   {
    imgs=!imgs?$('<img />'):imgs.add($('<img />'));
    imgs[i].src=arr[i];
   }
   
   return imgs;
  },
  pack:function(values){
   var chunks = values.match(/.{1,16}/g),
       packed = '';
   
   for(var i=0;i<chunks.length;i++)
    packed+=String.fromCharCode(parseInt(chunks[i],2));
   
   return packed;
  },
  unpack:function(packed){
   var values='';
   
   for(var i=0;i<packed.length;i++)
    values+=packed.charCodeAt(i).toString(2);
   
   return values;
  },
  formatPrice:function(p){
   return p.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g,'$1 ');
  },
  numberEnd:function(n,arr){//e.g. arr=[' день',' дня',' дней']
   return arr[(n%100>4&&n%100<20)?2:[2,0,1,1,1,2][Math.min(n%10,5)]];
  },
  selectText:function(element){
   var text=element.get(0),
       range,
       selection;    

   if(document.body.createTextRange)//ms
   {
    range=document.body.createTextRange();
    range.moveToElementText(text);
    range.select();
   }else
   {
    if(window.getSelection)//other
    {
     selection=window.getSelection();            
     range=document.createRange();
     range.selectNodeContents(text);
     selection.removeAllRanges();
     selection.addRange(range);
    }
   }
  },
  winResizeScroll:function(opts){
   "use strict";
   
   var t,
       outside=opts.outside||function(){},
       inside=opts.inside||function(){};
   
   mgr.helpers.win.on(opts.events,function(){
    clearTimeout(t);
    outside();
    
    t=setTimeout(function(){
     inside();
    },opts.time);
   });
  },
  isTouch:function(){
   return ('ontouchstart' in window)||(navigator.maxTouchPoints>0)||(navigator.msMaxTouchPoints>0);
  },
  scrollDim:function(){
   var div=$('<div style="position:absolute;overflow-y:scroll;"></div>').prependTo('body'),
       dim=div.width()-div.css('overflow-y','auto').width();
   
   div.remove();
   
   return dim;
  },
  fixed:function(flag,wrap){
   "use strict";
   
   var body=$('body');
   
   if(!flag)
   {
    body.removeClass('hidden scroll rerender');
   }else
   {
    body.addClass('hidden');
    if(wrap.height()>mgr.win.height())
     body.addClass('scroll rerender');
   }
  },
  getHashParam:function(name,flag){//flag=true for ? instead of #
   var matches,
       h;
   
   if(location.hash&&!flag||~location.href.indexOf('?')&&flag)
   {
    if(!flag)
     h=location.hash.slice(1);else
     h=location.href.slice(location.href.indexOf('?')+1);
   }else
    return -1;
   
   if(name!=undefined)
    matches=h.match(new RegExp("(?:^|&)"+name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g,'\\$1')+"=([^&]*)"));else
    return -1;
   
   return matches?decodeURIComponent(matches[1]):-1;
  },
  setHashParam:function(opts){
   var matches,
       h,
       name=opts.hash,
       d=opts.index,
       histFlag=window.history&&window.history.pushState;
   
   if(name==undefined)
    return;
   
   if(!location.hash||location.toString().indexOf('#')==location.toString().length-1)
   {
    if(opts.history)
     location=location+(~location.toString().indexOf('#')?"":"#")+name+'='+d;else
     location.replace(location+(~location.toString().indexOf('#')?"":"#")+name+'='+d);
   }else
   {
     h=location.hash.slice(1);
     matches=h.match(new RegExp("(?:^|&)"+name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g,'\\$1')+"=([^&]*)"));
     
     if(matches)
      h=h.replace(new RegExp("(?:^|&)"+name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g,'\\$1')+"=([^&]*)"),~d?'&'+name+'='+d:'').replace(/^&/,'');else
      h=(h+'&'+name+'='+d);
     
     if(opts.history)
     {//as pushState doesn't generate hashchange event we can't get rid of # in 'history' mode
      location=location.toString().slice(0,location.toString().indexOf('#'))+'#'+h;
     }else
     {
      if(histFlag&&!h)
       history.replaceState('','',location.toString().slice(0,location.toString().indexOf('#')));else
       location.replace(location.toString().slice(0,location.toString().indexOf('#'))+'#'+h);
     }
   }
  }
 });
 
 return mgr.lib.utils;
}));