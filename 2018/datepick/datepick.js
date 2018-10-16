/*!by Alexander Kremlev*/

(function (factory) {
 'use strict';

 if(typeof define==='function'&&define.amd)
 {
  define(['jquery','base'],factory);
 }else
 {
  if('theApp' in window)
  {
   if(!theApp.lib)
    throw 'theApp.lib doesn\'t exist!';
   theApp.set({data:'lib.Datepick',object:factory(jQuery,theApp),lib:false});
  }
 }
}(function($,mgr){
 mgr.extend(Datepick);

 function Datepick(){
  "use strict";
  
  this.options={
   range:false,
   multiSelect:0,
   dates:[],
   dateFormat:'dd.mm.yyyy',
   callerFormat:'dd.mm.yyyy',
   minDate:new Date(),
   offset:{left:0,top:0},
   ruMonthsEndings:false,
   template:null,
   pop:true,
   monthsToShow:1,
   monthsToStep:1,
   noClosingOnSelect:false,
   noChooseOnSelect:false,
   onDate:function(){return {};}
  };
  
  this.props={
   container:null,//init
   input:null,//init
   caller:null,//init
   alt:null,//init
   ruMonths:['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'],
   ruMonthSpecialEndings:[2,7],
   external:false,
   inline:false
  };
 }
 //-----------------
 $.extend(Datepick.prototype,{
  init:function(){
   var self=this;

   self.options=$.extend(true,self.options,self.data.options);

   self.props=$.extend(true,self.props,{
    container:self.data.container?$(self.data.container):null,
    input:$(self.data.input),
    alt:self.data.alt?$(self.data.alt):null,
    caller:$(self.data.caller)
   });

   self.trigger('init',[{
    container:self.props.container,
    input:self.props.input,
    caller:self.props.caller
   }]);
   self.prepare();
   self.setControls();
  },
  prepare:function(){
   var self=this;

   if(!self.props.input.is('input'))
    self.props.inline=true;

   self.props.input.datepick({
    dateFormat:self.options.dateFormat,
    prevText:'&laquo;',
    todayText:'M y',
    nextText:'&raquo;',
    altField:self.props.alt,
    rangeSelect:self.options.range,
    multiSelect:self.options.multiSelect||0,
    popupContainer:self.props.container,
    offset:self.options.offset,
    minDate:self.options.minDate,
    changeMonth:false,
    useMouseWheel:false,
    monthsToShow:self.options.monthsToShow,
    monthsToStep:self.options.monthsToStep,
    noClosingOnSelect:self.options.noClosingOnSelect,
    noChooseOnSelect:self.options.noChooseOnSelect,
    renderer:$.extend({},$.datepick.defaultRenderer,{
     picker:$.datepick.defaultRenderer.picker.replace(/\{link:clear\}\{link:close\}/,self.options.template||'')
    }),
    onSelect:function(dates){
     self.onSelect(dates);
    },
    onSelectDate:function(inst){
     self.onSelectDate(inst);
    },
    onDate:function(date){
     return self.options.onDate.call(self,{
      date:date,
      caller:self.props.caller,
      format:self.options.callerFormat,
      input:self.props.input
     });
    },
    onOpen:function(inst){
     self.onOpen(inst);
    },
    onShow:function(dp,inst){
     self.onShow(dp,inst);
    },
    onClose:function(){
     self.onClose();
    }
   });

   self.setDates({
    dates:self.options.dates,
    external:false
   });
  },
  setControls:function(){
   var self=this;

   self.props.caller.on('click',function(e){
    self.props.input.datepick('show');

    e.preventDefault();
   });
  },
  prepareDates:function(dates){
   var self=this,
       arr=[];

   for(var i=0;i<dates.length;i++)
   {
    if($.type(dates[i])==='number')
     arr[i]=new Date(dates[i]);else
     if($.type(dates[i])==='date')
      arr[i]=dates[i];else
      if($.type(dates[i])==='string')
       arr[i]=$.datepick.parseDate(self.options.dateFormat,dates[i]);
   }

   return arr;
  },
  setDates:function(opts){
   var self=this;

   if(opts.dates&&opts.dates.length)
   {
    self.props.external=opts.external;
    self.props.input.datepick('setDate',self.prepareDates(opts.dates));
   }

   if(opts.clear)
    self.props.input.datepick('clear');
  },
  hide:function(){
   var self=this;

   self.props.input.datepick('hide');
  },
  getData:function(){
   var self=this;

   return {
    dates:self.props.input.datepick('getDate'),
    input:self.props.input
   }
  },
  ruMonthEndings:function(){
   var self=this,
       t=self.props.caller.text().toLowerCase();
   
   for(var i=0;i<self.props.ruMonths.length;i++)
   {
    if(~t.indexOf(self.props.ruMonths[i]))
    {
     if(i===self.props.ruMonthSpecialEndings[0]||i===self.props.ruMonthSpecialEndings[1])
      self.props.caller.text(t.replace(new RegExp(self.props.ruMonths[i],'g'),self.props.ruMonths[i]+'а'));else
      self.props.caller.text(t.replace(new RegExp(self.props.ruMonths[i],'g'),self.props.ruMonths[i].slice(0,-1)+'я'));
    }
   }
  },
  onSelect:function(dates){
   var self=this;

   if(self.options.ruMonthsEndings)
    self.ruMonthEndings();

   self.trigger('select',[{
    dates:dates,
    caller:self.props.caller,
    format:self.options.callerFormat,
    input:self.props.input,
    external:self.props.external
   }]);
  },
  onSelectDate:function(inst){
   var self=this;

   self.trigger('selectDate',[{
    inst:inst,
    caller:self.props.caller,
    format:self.options.callerFormat,
    input:self.props.input
   }]);
  },
  onOpen:function(inst){
   var self=this;

   self.trigger('open',[{
    inst:inst,
    caller:self.props.caller,
    format:self.options.callerFormat,
    input:self.props.input
   }]);
  },
  onShow:function(dp,inst){
   var self=this;

   self.trigger('show',[{
    container:dp,
    inst:inst,
    caller:self.props.caller,
    format:self.options.callerFormat,
    input:self.props.input
   }]);
  },
  onClose:function(){
   var self=this;

   self.trigger('close');
  }
 });
  
 return Datepick;
}));