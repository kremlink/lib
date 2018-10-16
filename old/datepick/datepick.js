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
 mgr.lib['Datepick']=function(opts,func){
  "use strict";
  
  var self=this;
  
  mgr.Base.apply(this,arguments);
  
  self.options=$.extend(true,{
   range:false,
   multiSelect:0,
   dateFormat:'dd.mm.yyyy',
   callerFormat:'dd.mm.yyyy',
   minDate:new Date(),
   offset:{left:0,top:0},
   ruMonthsEndings:false
  },opts);
  
  self.props={
   container:$(self.options.container),
   input:$(self.options.input),
   caller:$(self.options.caller),
   ruMonths:['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'],
   ruMonthSpecialEndings:[2,7]
  };
  
  init();
  
  function init(){
   self.trigger('init');
   
   self.props.input.datepick({
    dateFormat:self.options.dateFormat,prevText:'&laquo;',todayText:'M y',
    nextText:'&raquo;',
    rangeSelect:self.options.range,
    multiSelect:self.options.multiSelect||0,
    popupContainer:self.props.container,
    offset:self.options.offset,
    minDate:self.options.minDate,
    changeMonth:false,
    useMouseWheel:false,
    onSelect:function(dates){
     self.onSelect(dates);
    }
   }).datepick('setDate',self.options.minDate);
   
   self.setControls();
  }
 };
 //-----------------
 mgr.extend(mgr.lib['Datepick']);
 //-----------------
 $.extend(mgr.lib['Datepick'].prototype,{
  setControls:function(){
   var self=this;
   
   self.props.caller.on('click',function(e){
    self.props.input.datepick('show');
    
    e.preventDefault();
   });
  },
  ruMonthEndings:function(){
   var self=this,
       t=self.props.caller.text().toLowerCase();
   
   for(var i=0;i<self.props.ruMonths.length;i++)
   {
    if(~t.indexOf(self.props.ruMonths[i]))
    {
     if(i==self.props.ruMonthSpecialEndings[0]||i==self.props.ruMonthSpecialEndings[1])
      self.props.caller.text(t.replace(new RegExp(self.props.ruMonths[i],'g'),self.props.ruMonths[i]+'а'));else
      self.props.caller.text(t.replace(new RegExp(self.props.ruMonths[i],'g'),self.props.ruMonths[i].slice(0,-1)+'я'));
    }
   }
  },
  onSelect:function(dates){
   var self=this,
       d=[];
   
   self.props.caller.text($.datepick.formatDate(self.options.callerFormat,dates[0]));
   if(self.options.ruMonthsEndings)
    self.ruMonthEndings();
   
   for(var i=0;i<dates.length;i++)
    d[i]=dates[i].getTime();
   
   self.trigger('change',[{dates:d}]);
  }
 });
  
 return mgr.lib['Datepick'];
}));