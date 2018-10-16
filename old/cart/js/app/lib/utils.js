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
   focus:function(e,opts){
    var error=opts.error?opts.error:function(obj){obj.removeClass('error');};
    
    opts.form.on('focusin','input[type=text],input[type=password],textarea,select',function(){
     error($(this));
    });
   },
   validate:function(opts){
    var flag=true,
        check=opts.form?opts.form.find('input[type=text],input[type=password],textarea,select'):opts.check,
        test=opts.test?opts.test:function(){return false;},
        error=opts.error?opts.error:function(obj){};

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
  loadBgs:function(opts){
   var callback=opts.callback||function(){},
       src=mgr.utils.isA(opts.src)?opts.src:[opts.src],
       imgs;

   for(var i=0;i<src.length;i++)
    imgs=imgs?imgs.add($('<img />').attr('src',src[i])):$('<img />').attr('src',src[i]);

   imgs.imagesLoaded(function(){
    if(opts.elements)
    {
     opts.elements.each(function(i){
      $(this).css('backgroundImage','url('+src[i]+')');
     });
    }
    imgs.remove();
    callback();
   });
  },
  srcToTags:function(arr){
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

   return t;
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
    if(wrap.height()>mgr.helpers.win.height())
     body.addClass('scroll rerender');
   }
  },
  getHashParam:function(name,flag){
   var matches,
       h,
       s=flag?'?':'#';
   
   if(~location.href.indexOf(s))
    h=location.href.slice(location.href.indexOf(s)+1);else
    return -1;
   
   if(name!=undefined)
    matches=h.match(new RegExp("(?:^|&)"+name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g,'\\$1')+"=([^&]*)"));else
    return -1;
   
   return matches?decodeURIComponent(matches[1]):-1;
  },
  setHashParam:function(opts){
   var matches,
    params,
    page,
    name=opts.name,
    value=opts.value,
    get=opts.get,
    s=get?'?':'#',
    href=location.toString().replace(/&+$/,''),
    reg=new RegExp("(?:^|&)"+name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g,'\\$1')+"=([^&]*)");

   if(name==undefined)
    return;

   if(opts.history)
   {
    page=location.pathname.substr(location.pathname.lastIndexOf("/")+1);

    if(value=='')
     value=location.href.replace(page,'');
    if(opts.replace)
     history.replaceState({page:value},opts.name,value);else
     history.pushState({page:value},opts.name,value);
   }else
   {
    if(!~href.indexOf(s)||href.indexOf(s)==href.length-1)
    {
     if(value=='')
      return;
     if(get)
      history.replaceState(opts.data,opts.name,href+(~href.indexOf(s)?"":s)+name+'='+value);else
      location.replace(href+(~href.indexOf(s)?"":s)+name+'='+value);
    }else
    {
     params=href.slice(href.indexOf(s)+1);
     matches=params.match(reg);

     if(matches)
      params=params.replace(reg,value!=''?'&'+name+'='+value:'').replace(/^&/,'');else
      params=(value!=''?params+'&'+name+'='+value:params);

     if(get)
      history.replaceState(opts.data,opts.name,href.slice(0,href.indexOf(s))+(params!=''?s+params:''));else
      location.replace(href.slice(0,href.indexOf(s))+s+params);
    }
   }
  }
 });
 
 return mgr.lib.utils;
}));