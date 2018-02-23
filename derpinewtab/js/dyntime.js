"use strict";var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e};!function(e){var t=function(e){return isNaN(e)||(e=(e=parseInt(e))<10&&e>=0?"0"+e:e<0?"-0"+Math.abs(e):e.toString()),e},r=["January","February","March","April","May","June","July","August","September","October","November","December"],n=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],o="{{wd}}, {{d}} {{mo}}, {{y}}. {{h}}:{{mi}}",a=function(e){var t=e,r=e%10;return t+=11!==e&&1===r?"st":12!==e&&2===r?"nd":13!==e&&3===r?"rd":"th"},i=function(e){return n[parseInt(e)]},u=function(e){return r[parseInt(e)-1]},m=function(e){return e},y={s:"second",mi:"minute",h:"hour",d:"day",w:"week",mo:"month",y:"year"},d=function(e,t){if(void 0!==y[e])return t+" "+y[e]+(t>1?"s":"")},s=function(){e("time").each(function(){var r=e(this).attr("datetime");if("string"!=typeof r)return!0;var n=new Date(r);if(isNaN(n.getTime()))return!0;r={d:a(n.getDate()),y:m(n.getFullYear()),mo:u(n.getMonth()+1),wd:i(n.getDay()),h:t(n.getHours()),mi:t(n.getMinutes()),order:o};var y=Object.keys(r);y.splice(y.indexOf("order"),1);for(var s=0,f=y.length;s<f;s++)r.order=r.order.replace(new RegExp("{{"+y[s]+"}}"),r[y[s]]);e(this).attr("title",r.order);var c=function(t){if("object"!==(void 0===t?"undefined":_typeof(t))||e.isArray(t))return!1;t.time>0&&delete t.time;for(var r=Object.keys(t),n="",o=0,a=r.length;o<a;o++)"second"!==r[o]&&t[r[o]]<1&&delete t[r[o]];t.year>0?n=d("y",t.year):t.month>0?n=d("mo",t.month):t.week>0?n=d("w",t.week):t.day>0?n=d("d",t.day):t.hour>0?n=d("h",t.hour):t.minute>0?n=d("mi",t.minute):t.second>0&&(n=d("s",t.second));return(n+" ago").replace(/^\sago$/,"just now")}(function(e,t){var r={time:e.getTime()-t.getTime()};r.day=Math.floor(r.time/1e3/60/60/24),r.time-=1e3*r.day*60*60*24,r.hour=Math.floor(r.time/1e3/60/60),r.time-=1e3*r.hour*60*60,r.minute=Math.floor(r.time/1e3/60),r.time-=1e3*r.minute*60,r.second=Math.floor(r.time/1e3),r.day>=7&&(r.week=parseInt(r.day/7),r.day-=7*r.week);r.week>=4&&(r.month=parseInt(r.week/4),r.week-=4*r.month);r.month>=12&&(r.year=parseInt(r.month/12),r.month-=12*r.year);return r}(new Date,n));e(this).html(c)})};s(),window.updateTimesF=function(){s.apply(s,arguments)},!0!==window.noAutoUpdateTimes&&(window.updateTimes=setInterval(s,1e4))}(jQuery);
//# sourceMappingURL=dyntime.js.map
