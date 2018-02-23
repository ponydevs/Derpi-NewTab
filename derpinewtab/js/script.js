"use strict";$(function(){$.getJSON("manifest.json",function(e){e&&$("#disp-version").text(" v"+e.version)});var e={allowedTags:[],metadata:{},crop:void 0,filterID:void 0},t=56027,a=$("#settingsWrap"),n=$("#settings"),i=$("#tag-settings"),o=$("body"),s=$("#metadata-settings"),r=$("#crop-settings"),l=$("#image"),d=$("#image-ghost"),c=$("#fade-layer"),g=$("#data"),p=$("#style"),h=$("#filter-id"),u=$("#filter-id-select"),f=$("#signin-filter"),v=i.find(".usefilter input"),m=$("#show-settings-button"),w=void 0;function b(t){if("string"==typeof t)w=t;else if("string"!=typeof w)return;var a=w.replace(/"/g,"%22"),n='#image{background-image:url("'+a+'");background-size:'+e.crop+"}";"contain"===e.crop&&(d.css("opacity",""),n+='#image-ghost{display:block;background-image:url("'+a+'")}'),p.html(n)}function y(n){function s(e,t){var a=e.tags.split(", "),n=[];$.each(a,function(e,t){0===t.indexOf("artist:")&&n.push(t.substring(7))});var i=n.length?"By "+function(e,t,a){void 0===t&&(t="and");void 0===a&&(a=",");var n=void 0;"string"==typeof e&&(e=e.split(a));if(e.length>1){var i=(n=e).length,o=i-3,s=0;for(n.splice(i-1,0,t);s<=o;)s!==i-1&&(n[s]+=",",s++);n=n.join(" ")}else n=e[0];return n}(n):"Artist unknown";g.empty().append('<h1><a href="https://derpibooru.org/'+e.id+'">'+i+"</a></h1>"),g.children("h1").simplemarquee({speed:25,cycles:1/0,space:25,handleHover:!1,delayBetweenCycles:0});var o="",s=e.comment_count;e.upvotes+e.downvotes===0?o="no votes":e.upvotes>0?(o+=e.upvotes+" upvote",e.upvotes>1&&(o+="s"),e.downvotes>0&&(o+=" and "+e.downvotes+" downvote",e.downvotes>1&&(o+="s"))):e.downvotes>0&&(o+=e.downvotes+" downvote"+(e.downvotes>1?"s":"")),g.append('<p>\n\t\t\t\t\t<span class="uploadtime visible">uploaded <time datetime="'+e.created_at+'"></time> by '+e.uploader+'</span>\n\t\t\t\t\t<span class="votes">'+o+'</span>\n\t\t\t\t\t<span class="comments">'+(s>0?s:"no")+" comment"+(1!==s?"s":"")+"</span>\n\t\t\t\t</p>"),updateMetadataSettings(),window.updateTimesF(),b(t),p(),h()}o.removeClass("notloading"),i.find(".re-request:visible").slideUp(),$.ajax({url:"https://trixiebooru.org/search.json?filter_id="+(e.filterID||t)+"&q=wallpaper+%26%26+("+e.allowedTags.join("+%7C%7C+")+")+%26%26+-equestria+girls"+("number"==typeof n?"&page="+n:""),success:function(t){var a=void 0,i=new Image,r=-1;if(0===(t=t.search).length)return p(),o.addClass("notloading"),void g.html("<h1>Search returned no results.</h1>"+(-1===e.allowedTags.indexOf("safe")?"<p>Try enabling the safe system tag.</p>":""));for(;++r<t.length-1;)if(t[r].width>=1280&&t[r].height>=720&&t[r].width<=4096&&t[r].height<=4096){a=t[r];break}if(o.addClass("notloading"),void 0===a)return y("number"==typeof n?n+1:2);LStorage.has("image_hash")&&LStorage.get("image_hash")===a.orig_sha512_hash?s(a,LStorage.get("image_data")):(void 0===n&&g.html("<h1>Searching for new image...</h1>").css("opacity","1"),i.src="https:"+a.pretty_url,$(i).on("load",function(){LStorage.set("image_data",i.src),LStorage.set("image_hash",a.sha512_hash),s(a,i.src)}).on("error",function(){return a.is_rendered?g.html("<h1>Image failed to load</h1><p>Either the image is no longer available or the extension is broken</p>"):g.html("<h1>Image has not been rendered yet</h1><p>Try reloading in a minute or so</p>"),p(),y("number"==typeof n?n+1:2)}))},error:function(){o.addClass("notloading"),g.html("<h1>There was an error while fetching the image data</h1><p>"+(navigator.onLine?"Derpibooru may be down for maintenance, try again later.":"You are not conected to the Internet.")+"</p>")}});var r=!1,d=function e(){c.children(".hover").length?r=setTimeout(e,2e3):c.css("opacity",0)};function p(){l.css("opacity",1),o.on("mousemove",$.throttle(100,function(){if(document.getElementById("dialog"))return!0;c.css("opacity","1"),c.on("mouseenter","> *",function(){$(this).addClass("hover")}).on("mouseleave","> *",function(){$(this).removeClass("hover")}),h()})),o.triggerHandler("mousemove"),m.attr("disabled",!1).on("click",function(e){e.preventDefault(),a.toggleClass("open"),o.triggerHandler("mousemove")})}function h(){!1!==r&&(clearTimeout(r),r=!1),a.hasClass("open")||(r=setTimeout(d,2e3))}}$.get("https://derpibooru.org/filters",function(a){var n=$(a.replace(/src="[^"]+?"/g,"")),i={your:$(document.createElement("optgroup")).attr("label","My Filters"),global:$(document.createElement("optgroup")).attr("label","Global Filters")},o=n.find(".header__link.header__link-user").attr("href");o||f.addClass("nope").attr("title","You must be signed in on Derpibooru.org to see your own filters."),n.find(".filter").each(function(){var e=$(this),a=e.children("h3").text(),n=parseInt(e.children(".filter-options").find('a[href^="/filters/"]').attr("href").replace(/\D/g,""),10);n!==t&&i[e.find('a[href="'+o+'"]').length?"your":"global"].append($(document.createElement("option")).attr("value",n).text(a))}),i.your.children().length&&u.append(i.your),u.append(i.global),e.filterID?u.find('option[value="'+e.filterID+'"]').length?u.val(e.filterID):u.val("???"):u.val("")}),function(){var t=["safe","suggestive","questionable","explicit"],s=void 0,r=void 0;if(LStorage.has("setting_allowed_tags")){var c=LStorage.get("setting_allowed_tags").split(",");$.each(c,function(a,n){t.indexOf(n)>-1&&e.allowedTags.push(n)}),e.allowedTags.length>0&&LStorage.set("setting_allowed_tags",e.allowedTags.join(","))}0===e.allowedTags.length&&(LStorage.set("setting_allowed_tags","safe"),e.allowedTags=["safe"]);var g=n.find(".systags");function p(){"number"==typeof s&&(clearInterval(s),s=void 0),"number"==typeof r&&(clearInterval(r),r=void 0);var t=6,n=function(){if(0==--t)return clearInterval(r);var e=i.find(".re-request span").text(t+" second"+(1!==t?"s":"")).parent();e.is(":visible")||e.stop().hide().slideDown()},c=[];r=setInterval(n,1e3),n(),s=setTimeout(function(){g.children().each(function(e,t){var a=$(t).find("input"),n=a.attr("name");a.prop("checked")&&c.push(n)});var t=c.length>0,n=parseInt(h.val(),10),i=!isNaN(n);t&&(e.allowedTags=c,LStorage.set("setting_allowed_tags",c.join(","))),i?(e.filterID=n,LStorage.set("setting_filterid",e.filterID)):(v.prop("checked",!1),e.filterID=void 0,LStorage.del("setting_filterid")),(t||i)&&(l.css("opacity","0"),d.css("opacity","0"),o.off("mousemove"),m.off("click").attr("disabled",!0),a.removeClass("open"),setTimeout(y,300))},5e3)}if($.each(t,function(t,a){g.append($(document.createElement("label")).append($(document.createElement("input")).attr({type:"checkbox",name:a,checked:e.allowedTags.indexOf(a)>-1}),"<span>"+a+"</span>"))}),n.find(".systags label span").on("click",function(e){e.preventDefault();var t=$(this).prev();t.prop("checked",!t.prop("checked")),p()}),LStorage.has("setting_filterid")){var f=parseInt(LStorage.get("setting_filterid"),10);isNaN(f)?LStorage.del("setting_filterid"):(e.filterID=f,v.prop("checked",!0),h.val(e.filterID).trigger("change"))}0===e.allowedTags.length&&(LStorage.set("setting_allowed_tags","safe"),e.allowedTags=["safe"]),v.on("click",function(){$(this).prop("checked")||h.val("").trigger("change")}),u.on("change keyup",function(){var e=u.val();e&&/^\d+$/.test(e)&&(!0!==v.prop("checked")&&v.prop("checked",!0),h.val(e).trigger("change"))}),h.on("change keyup",function(){if(u.find('option[value="'+h.val()+'"]').length?u.val(h.val()):u.val("???"),h.is(":valid")){var t=e.filterID?e.filterID:"";h.val()!==t&&p()}})}(),function(){var t=s.find(".switch input"),a=void 0;function n(e){!0!==e&&LStorage.set("setting_metadata",a.join(",")),t.each(function(){$("#data ."+this.name.substring(4))[a.indexOf(this.name)>-1?"show":"hide"]()}),g.find("p span").filter(":visible").addClass("visible").last().removeClass("visible")}t.each(function(){e.metadata[this.name]=!1}),LStorage.has("setting_metadata")?a=0===(a=LStorage.get("setting_metadata")).length?[]:a.split(","):(a=Object.keys(e.metadata),LStorage.set("setting_metadata",a.join(","))),$.each(a,function(t,n){void 0!==e.metadata[n]?e.metadata[n]=!0:delete a[t]}),window.updateMetadataSettings=function(){n()},n(),t.each(function(){this.checked=!!e.metadata[this.name],$(this).prop("checked",this.checked)}),s.find(".switch input").on("click",function(e){e.stopPropagation();var t=this.name,i=a.indexOf(t);-1===i?a.push(t):a.splice(i,1),n()})}(),function(){var t=r.find(".input-field select");function a(){var a=e.crop;-1===["contain","cover","100% 100%"].indexOf(a)&&(a="cover"),LStorage.set("setting_crop",a),e.crop=a,t.val(a),b()}LStorage.has("setting_crop")?e.crop=LStorage.get("setting_crop"):(e.crop="contain",LStorage.set("setting_crop",e.crop)),window.updateCroppingSettings=function(){a()},a(),t.on("change",function(){e.crop=t.val(),a()})}(),LStorage.has("image_data")&&LStorage.has("image_hash")&&(b(LStorage.get("image_data")),l.css("opacity","1").attr("data-hash",LStorage.get("image_hash"))),y(),g.html("<h1>Requesting metadata...</h1>").css("opacity",1),LStorage.has("firstrun")||$(document.createElement("div")).attr("id","dialog").html('<div id="dialog-inner"><h1>Welcome to Derpi-New Tab</h1><p>To access the settings click the <i class="material-icons">menu</i> icon in the bottom left of the browser window.<br><span style="color:rgba(255,255,255,.5)">(this message is only displayed once)</span></p></div>').children().append($(document.createElement("button")).text("Got it").on("click",function(e){e.preventDefault(),LStorage.set("firstrun",1);var t=$("#dialog").addClass("gtfo");setTimeout(function(){t.remove()},550)})).end().prependTo(o),r.find("select").material_select()});
//# sourceMappingURL=script.js.map
