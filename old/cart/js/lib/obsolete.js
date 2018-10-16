document.onreadystatechange=function(){
 var t=document.createElement('div');
 
 t.id='obsolete-notification';
 t.innerHTML='<div><p>К сожалению, ваш браузер безнадежно устарел и не в состоянии продемонстрировать всю мощь современных веб-решений. Но не все потеряно: вы можете бесплатно и без смс(!) скачать и установить себе любой понравившийся современный браузер из списка ниже. Если вы используете Windows XP и предпочитаете предустановленный браузер (Internet Explorer), то у нас для вас плохие новости - данная операционная система не поддерживает современные версии этого браузера, так что лучшим вариантом будет выбрать любой другой, кроме последнего.</p><a href="https://www.google.com/intl/ru/chrome/browser/">Скачать Google Chrome</a><br /><a href="http://www.mozilla.org/ru/firefox/new/">Скачать Firefox</a><br /><a href="http://www.opera.com/ru/computer/windows">Скачать Opera</a><br /><a href="http://windows.microsoft.com/ru-ru/internet-explorer/downloads/ie">Скачать Internet Explorer</a></div>';
 document.body.appendChild(t);
};