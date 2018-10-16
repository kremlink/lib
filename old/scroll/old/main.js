 //Block with scroll
 
 /*select:{
 input:'#sel',
 template:'#sel-template',
 itemTemplate:'#sel-item-template',
 shown:4
 }*/
 
 block:{
    wrap:'.about-block .wrap',
    block:'.about-block .content',
    wheel:true,
    select:true,
    userObject:{
     bar:null
    }
   },
   bar:{
    holder:'.about-block .scroll',
    bar:'.about-block .scroll span',
    userObject:{
     block:null
    }
   }
 
 var shared={
  barArray:[],
  blockArray:[]
 };

 
 mgr.set('shared.custom-block',{
  bar:{
   change:function(e,opts){
    var u=this.userObject;

    if(u.block&&!opts.external&&!opts.resize)
    {
     u.block.method('move',{
      value:-opts.value*u.block.method('getData').dim/opts.bounds[1],
      external:true
     });
    }
   }
  },
  block:{
   hide:function(){
    var u=this.userObject;

    if(u.bar)
    {
     u.bar.method('setPosition',{
      value:[0],
      external:true
     });
    }
   },
   stop:function(){
    var u=this.userObject;

    u.bar.method('stop');
   },
   move:function(e,opts){
    var u=this.userObject;

    if(u.bar&&!opts.external)
    {
     if(opts.resize&&!opts.hide)
      u.bar.method('setBarDim',[opts.wrapDim/opts.blockDim*u.bar.method('getData').holderDim]);

     u.bar.method('setPosition',{
      value:opts.hide?[0]:[-opts.value*u.bar.method('getData').bounds[1]/opts.dim],
      external:true,
      select:opts.select,
      duration:opts.duration
     });
    }
   }
  },
  setIt:function(opts){
   var barPrefix='.bar',
       blockPrefix='.block',
       barData,
       blockData,
       bar,
       block;

   if('array' in opts)
   {
    barData=mgr.get(opts.string+barPrefix);
    blockData=mgr.get(opts.string+blockPrefix);
    $(blockData.wrap).each(function(i){
     block=new mgr.lib['Block']($.extend({},blockData,{
      wrap:$(blockData.wrap).eq(i),
      block:$(blockData.block).eq(i),
      on:mgr.get('shared.custom-block.block')
     }));
     mgr.setObjects(opts.array+blockPrefix,block);
     bar=new mgr.lib['Bar']($.extend({},barData,{
      holder:$(barData.holder).eq(i),
      bar:$(barData.bar).eq(i),
      on:mgr.get('shared.custom-block.bar')
     }));
     mgr.setObjects(opts.array+barPrefix,bar);

     bar.method('UO',{prop:'block',value:block});
     block.method('UO',{prop:'bar',value:bar});
     block.method('recalc');
    });
   }else
   {
    bar=mgr.setObject(opts.string+barPrefix,'Bar',{
     on:mgr.get('shared.custom-block.bar')
    });
    block=mgr.setObject(opts.string+blockPrefix,'Block',{
     on:mgr.get('shared.custom-block.block')
    });
    bar.method('UO',{prop:'block',value:block});
    block.method('UO',{prop:'bar',value:bar});
    block.method('recalc');
   }
  }
 });
 
 
   mgr.get('shared.custom-block.setIt')({
    array:'about.slides',
    string:'data.about'
   });
   
//Range slider

slider:{
    holder:'.catalog-filter .slider',
    bar:'.catalog-filter .bar',
    horizontal:true,
    resize:true,
    clickable:'.catalog-filter .between',
    userObject:{
     $between:'.catalog-filter .between',
     shift:9,
     $inputs:'.catalog-filter .slider-inputs input',
     bounds:[1,5000],
     iniVal:[500,3000]
    }
   }

 var shared={
  fP:mgr.get('lib.utils.formatPrice'),
  slider:null
 };
   
var bar={
 init:function(e,opts){
 var u=this.userObject,
 ar=[];

 for(var i=0;i<u.iniVal.length;i++)
 ar[i]=(u.iniVal[i]-u.bounds[0])*opts.bounds[1]/(u.bounds[1]-u.bounds[0]);

 this.method('setPosition',{value:ar});
 },
 change:function(e,opts){
 var u=this.userObject,
 i=opts.value[0]<opts.value[1]?0:1;

 u.$between.css({left:opts.value[i]+u.shift,width:opts.value[(i+1)%2]-opts.value[i]});
 u.$inputs.eq(0).val(shared.fP(Math.round(u.bounds[0]+opts.value[i]*(u.bounds[1]-u.bounds[0])/opts.bounds[1])));
 u.$inputs.eq(1).val(shared.fP(Math.round(u.bounds[0]+opts.value[(i+1)%2]*(u.bounds[1]-u.bounds[0])/opts.bounds[1])));
 }
 };

 var inputs={
 empty:function(e,opts){
 opts.input.val(1);
 },
 change:function(e,opts){
 var u=this.userObject,
 v=parseInt(opts.input.val().replace(' ','')),
 d=shared.slider.method('getData'),
 bds=shared.slider.method('UO').bounds,
 value=d.value;

 if(v==0)
 {
 v=1;
 opts.input.val(v);
 }

 opts.input.val(shared.fP(v));
 
 value[opts.inputs.index(opts.input)]=Math.round((v-bds[0])*d.bounds[1]/(bds[1]-bds[0]));

 shared.slider.method('setPosition',{value:value,external:true});
 }
 };
 
 
 
 shared.slider=mgr.setObject('catalog.slider','Bar',{
    on:slider
   });
   mgr.setObject('catalog.inputs','Input',{
    on:inputs
   });