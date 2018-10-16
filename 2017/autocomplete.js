where.autocomplete({
         lookup:calc.list[dat['_index']],
         appendTo:where.parent(),
         forceFixPosition:false,
         onSelect:function(what){
          change(str,what);
         }/*,
          lookupFilter:function(suggestion,originalQuery,queryLowerCase){
          return (new RegExp('^'+queryLowerCase+'[^\\s]*|\\s+'+queryLowerCase+'[^\\s]*','gi')).test(suggestion.value.toLowerCase());
          },
          formatResult:function(suggestion,currentValue){
          if (!currentValue)
          return suggestion.value;

          var pattern='('+'^'+currentValue+'|\\s+'+currentValue+')';

          return suggestion.value
          .replace(new RegExp(pattern,'gi'),'<strong>$1<\/strong>')
          .replace(/&/g,'&amp;')
          .replace(/</g,'&lt;')
          .replace(/>/g,'&gt;')
          .replace(/"/g,'&quot;')
          .replace(/&lt;(\/?strong)&gt;/g,'<$1>');
          }*/
        })