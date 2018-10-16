gPops:{
    $inside:'.st-calc-three',
    find:{
     callers:'.st-c-item',
     pops:'.st-g-pop',
     closers:'.st-g-close'
    },
    options:{
     overlay:'.pop-overlay',
     esc:true
    },
	extra:{
	 inp:'input',
	 $inp:null
	}
   }

gPops=function(opts){
     var d=opts.data,
	 find=function(dat,obj){
       var o={};

       for(var x in dat)
        if(dat.hasOwnProperty(x))
         o[x]=obj.find(dat[x]);

       return o;
      };

     d.$inside.each(function(){
      var obj=$(this),
      dat=find(d.find,obj);

      dat.options=d.options;
      dat.extra=d.extra;
      dat.extra.$inp=obj.find(dat.extra.inp);
      mgr.set({data:opts.name,object:'Toggle',extra:dat,collection:true});
     });
    }
	
	mgr.set({data:'calc.gPops',object:gPops,call:true});