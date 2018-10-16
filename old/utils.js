/*by Alexander Kremlev*/
"use strict";

(function (factory) {
 'use strict';
 
 if(typeof define==='function'&&define.amd)
 {
  define(['jquery','base'],factory);
 }else
 {
  if('SiteManager' in window)
  {
   if(!SiteManager.lib)
    throw 'SiteManager.lib doesn\'t exist!';
    
   if(!SiteManager.lib['utils'])
    SiteManager.lib['utils']={};
   $.extend(SiteManager.lib['utils'],factory(jQuery,SiteManager));
  }
 }
}(function($,mgr){
 function Swipe(opts){
  var self=this;

  self.options=$.extend(true,{
   mouse:false,
   mult:4,
   vertical:false,
   speed:2,
   callback:opts.callback||function(){}
  },opts);

  self.props={
   container:opts.container,
   touch:{
    coords:{pageX:0,pageY:0},
    swipeFn:null,
    mousedownFn:null,
    dragFn:null
   }
  };

  init();

  function init(){
   self.enable();
  }
 }

 $.extend(Swipe.prototype,{
  enable:function(){
   var self=this;

   self.props.touch.swipeFn=function(e,s){
    var v=self.options.vertical,
     t1=v?'pageY':'pageX',
     t2=v?'pageX':'pageY',
     tt1=v?'y':'x',
     tt2=v?'x':'y',
     delta=self.props.touch.coords[t1]-s[tt1];

    if((self.options.mouse||e.touches)&&Math.abs(delta)>self.options.mult*Math.abs(self.props.touch.coords[t2]-s[tt2]))
     self.options.callback(delta);
   };

   self.props.touch.mousedownFn=function(e){
    self.props.touch.coords['pageX']=e.touches?e.touches[0]['pageX']:e['pageX'];
    self.props.touch.coords['pageY']=e.touches?e.touches[0]['pageY']:e['pageY'];
   };

   self.props.touch.dragFn=function(e){
    var v=self.options.vertical,
     t1=v?'pageY':'pageX',
     t2=v?'pageX':'pageY',
     delta=self.props.touch.coords[t1]-(e.touches?e.touches[0][t1]:e[t1]);

    if(Math.abs(delta)>self.options.mult*Math.abs(self.props.touch.coords[t2]-(e.touches?e.touches[0][t2]:e[t2])))
     eventjs.prevent(e);
    eventjs.stop(e);
   };

   eventjs.add(self.props.container[0],'swipe',self.props.touch.swipeFn,{threshold:self.options.speed});
   eventjs.add(self.props.container[0],'mousedown',self.props.touch.mousedownFn);
   eventjs.add(self.props.container[0],'drag',self.props.touch.dragFn);
  },
  disable:function(){
   var self=this;

   eventjs.remove(self.props.container[0],'swipe',self.props.touch.swipeFn);
   eventjs.remove(self.props.container[0],'mousedown',self.props.touch.mousedownFn);
   eventjs.remove(self.props.container[0],'drag',self.props.touch.dragFn);
  }
 });

 function Drag(opts){
  var self=this;

  self.options=$.extend(true,{
   mouse:false,
   mult:4,
   fingers:1,
   horizontal:false,
   both:false,
   ignore:null,
   threshold:5,
   coord:opts.horizontal?'pageX':'pageY',
   downCallback:opts.downCallback||function(){},
   dragCallback:opts.dragCallback||function(){},
   upCallback:opts.upCallback||function(){}
  },opts);

  self.props={
   container:opts.container,
   dragStart:false,
   dragging:false,
   touch:{
    coords:{pageX:0,pageY:0},
    start:{pageX:0,pageY:0},
    mousedownFn:[],
    dragFn:[]
   }
  };

  init();

  function init(){
   self.enable();
  }
 }

 $.extend(Drag.prototype,{
  enable:function(){
   var self=this,
    touch=self.props.touch;

   self.props.container.each(function(i){
    self.props.touch.mousedownFn.push(function(e){
     if(self.options.mouse&&!e.touches||e.touches&&e.touches.length===self.options.fingers)
     {
      self.props.dragStart=true;
      self.options.downCallback({e:(e.touches?e.touches:[e]),index:i,orig:e});
     }

     touch.coords['pageX']=e.touches?e.touches[0]['pageX']:e['pageX'];
     touch.coords['pageY']=e.touches?e.touches[0]['pageY']:e['pageY'];
     touch.start['pageX']=touch.coords['pageX'];
     touch.start['pageY']=touch.coords['pageY'];
     self.props.dragging=false;
    });

    self.props.touch.dragFn.push(function(e){
     var c=self.options.coord,
      c1=self.options.horizontal?'pageY':'pageX',//opposite
      d=e.touches?e.touches[0]:e,
      dx=d['pageX']-touch.start['pageX'],
      dy=d['pageY']-touch.start['pageY'];

     if(Math.sqrt(dx*dx+dy*dy)>self.options.threshold&&self.props.dragStart)
      self.props.dragging=true;

     if(self.props.dragging&&
      (self.options.mouse&&!e.touches||self.options.both||
      Math.abs(touch.coords[c]-d[c])>self.options.mult*Math.abs(touch.coords[c1]-d[c1])))
     {
      touch.coords['pageX']=d['pageX'];
      touch.coords['pageY']=d['pageY'];
      self.options.dragCallback({e:(e.touches?e.touches:[e]),index:i,orig:e});

      dx=d['pageX']-touch.start['pageX'];
      dy=d['pageY']-touch.start['pageY'];

      if(!$(e.target).closest(self.options.ignore).length&&
       Math.sqrt(dx*dx+dy*dy)>3)//disables mobile scroll
       eventjs.prevent(e);
     }
    });

    eventjs.add(this,'mousedown',touch.mousedownFn[i]);
    eventjs.add(this,'drag',touch.dragFn[i]);
   });

   eventjs.add(document,'mouseup',function(){
    if(self.props.dragging)
    {
     self.props.dragging=false;
     self.props.dragStart=false;
     self.options.upCallback();
    }
   });
  },
  disable:function(){
   var self=this;

   self.props.container.each(function(i){
    eventjs.remove(this,'mousedown',self.props.touch.mousedownFn[i]);
    eventjs.remove(this,'drag',self.props.touch.dragFn[i]);
   });
  }
 });

 return {
  swipe:Swipe,
  drag:Drag,
  IEVer:function(){
   var undef,
       v=3,
       div=document.createElement('div'),
       all=div.getElementsByTagName('i');
   
   while(div.innerHTML='<!--[if gt IE '+(++v)+']><i></i><![endif]-->',all[0]);
   
   return v>4?v:undef;
  },
  form:{
   validate:function(opts){
    var flag=true,
        check=opts.form?opts.form.find('input[type=text],input[type=password],textarea,select'):opts.check,
        ignore=opts.ignore?opts.ignore:function(){return false;},
        block=opts.block?opts.block:function(){return false;},
        error=opts.error?opts.error:function(){};

    check.each(function(){
     var obj=$(this),
         reg=obj.data('valid'),
         ph=obj.data('placeholder');
     
     if(obj.is('select'))
     {
      if(obj.find(':selected').is(':disabled')&&reg)
      {
       error(obj);
       flag=false;
      }
     }else
     {
      if(block(obj)||!ignore(obj)
       &&(reg&&!(new RegExp(reg)).test($.trim(this.value))
       ||reg&&ph&&ph==$.trim(this.value)
       ))
      {
       flag=false;
       error(obj);
      }
     }
    });
    
    if(flag&&opts.blockFlag&&opts.blockFlag['file'])
    {
     alert('Файл все еще в процессе загрузки');
     return false;
    }
    
    return flag;
   }
  },
  imgsReady:function(opts){
   var callback=opts.callback||function(){},
       src=$.type(opts.src)=='array'?opts.src:[opts.src],
       img,
       imgs;

   for(var i=0;i<src.length;i++)
   {
    img=$('<img />').attr('src',src[i]);
    imgs=imgs?imgs.add(img):img;
   }

   imgs.imagesLoaded(function(){
    if(opts.elements)
    {
     opts.elements.each(function(i){
      $(this).css('backgroundImage','url('+src[i]+')');
     });
    }
    callback(imgs);
    imgs.remove();
   });
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

   selection=window.getSelection();
   range=document.createRange();
   range.selectNodeContents(text);
   selection.removeAllRanges();
   selection.addRange(range);
  },
  debounce:function(func,wait,immediate){
   var timeout,args,context,timestamp,result;

   var later=function(){
    var last=Date.now()-timestamp;

    if(last<wait&&last>0)
    {
     timeout=setTimeout(later,wait-last);
    }else
    {
     timeout=null;
     if(!immediate)
     {
      result=func.apply(context,args);
      if(!timeout)
       context=args=null;
     }
    }
   };

   return function(){
    context=this;
    args=arguments;
    timestamp=Date.now();
    var callNow=immediate&&!timeout;
    if(!timeout)
     timeout=setTimeout(later,wait);
    if(callNow)
    {
     result=func.apply(context,args);
     context=args=null;
    }

    return result;
   };
  },
  throttle:function(func,wait,options){
   var context,args,result,
       timeout=null,
       previous=0;

   if(!options)
    options={};
   var later=function(){
    previous=options.leading===false?0:Date.now();
    timeout=null;
    result=func.apply(context, args);
    if(!timeout)
     context=args=null;
   };
   return function(){
    var now=Date.now();
    if(!previous&&options.leading===false)
     previous=now;
    var remaining=wait-(now-previous);
    context=this;
    args=arguments;
    if(remaining<=0||remaining>wait)
    {
     clearTimeout(timeout);
     timeout=null;
     previous=now;
     result=func.apply(context,args);
     if(!timeout)
      context=args=null;
    }else
    {
     if(!timeout&&options.trailing!==false)
      timeout=setTimeout(later,remaining);
    }
    return result;
   };
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
  value:function(opts){
   var s=opts.obj.is('input,textarea,select')?'val':'text';

   if(opts.value==undefined)
    return opts.obj[s]();else
    opts.obj[s](opts.value);
  },
  fixed:function(flag){
   var body=$('body');
   
   if(!flag)
   {
    body.removeClass('hidden scroll rerender');
   }else
   {
    body.addClass('hidden');
    if(mgr.helpers.doc.height()>mgr.helpers.win.height())
     body.addClass('scroll rerender');
   }
  },
  clean:function(node,recFlag,comFlag){
   var child;
   
   for(var i=0;i<node.childNodes.length;i++)
   {
    child=node.childNodes[i];
    if(child.nodeType==8&&comFlag||(child.nodeType==3&&!/\S/.test(child.nodeValue)))
    {
     node.removeChild(child);
     i--;
    }else
    {
     if(child.nodeType==1&&recFlag)
      clean(child);
    }
   }
  },
  getParam:function(opts){
   var d=opts.delimiter||'&',
       w=opts.what||'#',
       n=opts.name,
       matches=n!=undefined?location[w=='#'?'hash':'search'].match(new RegExp('(?:[?#'+d+'])'+n+'=*([^'+d+']*)')):null;

   return matches?matches[1]:null;
  },
  setParam:function(opts){
   var d=opts.delimiter||'&',
       w=opts.what||'#',
       n=opts.name,
       v=opts.value,
       p=opts.push,
       path=location.protocol+'//'+location.host+location.pathname,
       matches;

   if(!~location.href.indexOf(w))
   {
    if(w=='?')
     history[p?'pushState':'replaceState'](opts.data,n,path+w+n+'='+v+location.hash);else
     location.replace(path+location.search+w+n+'='+v);
   }else
   {
    matches=location[w=='#'?'hash':'search'].match(new RegExp('(?:[?#'+d+'])('+n+'=*([^'+d+']*))'));
    if(matches)
    {
     if(w=='?')
      history[p?'pushState':'replaceState'](opts.data,n,path+location.search.replace(matches[1],n+'='+v)+location.hash);else
      location.replace(path+location.search+location.hash.replace(matches[1],n+'='+v));
    }else
    {
     if(w=='?')
      history.replaceState(opts.data,n,path+location.search+d+n+'='+v+location.hash);else
      location.replace(path+location.search+location.hash+d+n+'='+v);
    }
   }
  }
 };
}));