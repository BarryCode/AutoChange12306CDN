﻿/*
 *  12306 Auto Query => A javascript snippet to help you book tickets online.
 *  12306 Booking Assistant
 *  Copyright (C) 2011 Hidden
 *
 *  12306 Auto Query => A javascript snippet to help you book tickets online.
 *  Copyright (C) 2011 Jingqin Lynn
 *
 *  12306 Auto Login => A javascript snippet to help you auto login 12306.com.
 *  Copyright (C) 2011 Kevintop
 *
 *  Includes jQuery
 *  Copyright 2011, John Resig
 *  Dual licensed under the MIT or GPL Version 2 licenses.
 *  http://jquery.org/license
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

// ==UserScript==
// @name         12306 果果秒票助手 V3
// @version		 3.0
// @author       guozili@163.com
// @namespace    http://www.guozili.25u.com
// @description  帮您秒票的小助手 by guozili@163.com
// @include      *://kyfw.12306.cn/otn/*
// @require	https://ajax.aspnetcdn.com/ajax/jquery/jquery-1.7.1.min.js
// ==/UserScript==

function withjQuery(callback, safe) {

	if (typeof(jQuery) == "undefined") {

		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = "https://ajax.aspnetcdn.com/ajax/jquery/jquery-1.7.1.min.js";

		if (safe) {
			var cb = document.createElement("script");
			cb.type = "text/javascript";
			cb.textContent = "jQuery.noConflict();(" + callback.toString() + ")(jQuery, window);";

			script.addEventListener('load', function() {

				document.head.appendChild(cb);

			});
		} else {
			var dollar = undefined;
			if (typeof($) != "undefined") dollar = $;
			script.addEventListener('load', function() {
				jQuery.noConflict();
				$ = dollar;
				callback(jQuery, window);
			});
		}
		document.head.appendChild(script);
	} else {

		setTimeout(function() {
			//Firefox supports
			callback(jQuery, typeof unsafeWindow === "undefined" ? window : unsafeWindow);
		}, 30);
	}
}

withjQuery(function($, window) {

	$(document).click(function() {
		if (window.webkitNotifications && window.webkitNotifications.checkPermission() != 0) {
			window.webkitNotifications.requestPermission();
		}
	});

	function notify(str, timeout, skipAlert) {
		if (window.webkitNotifications && window.webkitNotifications.checkPermission() == 0) {
			var notification = webkitNotifications.createNotification(
				"http://www.12306.cn/mormhweb/images/favicon.ico", // icon url - can be relative
				'订票', // notification title
				str
			);
			notification.show();
			if (timeout) {
				setTimeout(function() {
					notification.cancel();
				}, timeout);
			}
			return true;
		} else {
			if (!skipAlert) {
				//alert(str);
			}
			return false;
		}
	}

	function route(match, fn) {
		if (window.location.href.indexOf(match) != -1) {
			fn();
		};
	}

	var clickevent = document.createEvent('MouseEvents');
	clickevent.initEvent('click', false, true);

	// --- 设置cookie
	var setCookie = function(sName, sValue, expireHours) {
		var cookieString = sName + "=" + escape(sValue);
		//;判断是否设置过期时间
		if (expireHours > 0) {
			var date = new Date();
			date.setTime(date.getTime() + expireHours * 3600 * 1000);
			cookieString = cookieString + "; expires=" + date.toGMTString();


		}
		document.cookie = cookieString + "; path=/";

	}
	var crack = function() {
		setTimeout(function() {
			window.autoSearchTime = 900;
			$("#randCode2").unbind('keyup');

			function bO() {
				if ($("#sf2").is(":checked")) {
					return "0X00"
				} else {
					return "ADULT"
				}
			};
			$("#randCode2").on("click",
				function(bR) {
					$.ajax({
						url: ctx + "passcodeNew/checkRandCodeAnsyn",
						type: "post",
						data: {
							randCode: $("#randCode2").val(),
							rand: "sjrand"
						},
						async: false,
						success: function(bS) {
							bb = $("#randCode2").val();
							$("#back_edit").trigger("click");
							$.ajax({
								url: ctx + "confirmPassenger/confirmSingle",
								type: "post",
								data: {
									passengerTicketStr: getpassengerTicketsForAutoSubmit(),
									oldPassengerStr: getOldPassengersForAutoSubmit(),
									tour_flag: "dc",
									randCode: $("#randCode").val(),
									purpose_codes: bO(),
									key_check_isChange: md5Str,
									train_location: location_code
								},
								dataType: "json",
								async: true,
								success: function(bR) {
									otsRedirect("post", ctx + "payOrder/init?random=" + new Date().getTime(), {})
								},
								error: function(bR, bT, bS) {
									return
								}
							})
							$("#randCode2").removeClass("inptxt w100 error").addClass("inptxt w100");
							$("#i-ok2").css("display", "block");
							$("#c_error2").html("");
							$("#c_error2").removeClass("error");
							return
						}
					})

					bb = $("#randCode2").val()
				});
			setInterval(function() {
				if ($('#autosubmitcheckticketinfo').css('display') != 'none') {
					$("#randCode2").val('xxoo');
					$("#randCode2").trigger('click');
				}
			}, 400);
		}, 6000);
	}
	//--- 获取cookie
	var getCookie = function(sName) {
		var aCookie = document.cookie.split("; ");
		for (var j = 0; j < aCookie.length; j++) {
			var aCrumb = aCookie[j].split("=");
			if (escape(sName) == aCrumb[0]) {
				if (aCrumb[1])
					return unescape(aCrumb[1]);
			}
		}
		return "";
	}

		function refreshStation() {
			var stationobj = {};
			var stationnames = window.station_names.split("@");
			for (var i in stationnames) {
				var stationname = stationnames[i];
				if (stationname == "")
					continue;

				try {
					var stationfields = stationname.split("|");
					stationobj[stationfields[1]] = stationfields[2];
				} catch (e) {

				}
			}

			var stationGroups = {
				"北京": ["北京北", "北京东", "北京南", "北京", "北京西"],
				"长沙": ["长沙", "长沙南"],
				"衡阳": ["衡阳", "衡阳东"],
				"深圳": ["深圳", "深圳北", "深圳西"],
				"岳阳": ["岳阳", "岳阳东"],
				"重庆": ["重庆", "重庆北"],
				"武汉": ["武汉", "武昌", "汉口"],
				"武昌": ["武汉", "武昌", "汉口"],
				"汉口": ["武汉", "武昌", "汉口"],
				"桂林": ["桂林", "桂林北"],
				"广州": ["广州", "广州东", "广州南"]
			};

			var queryTimes = 1;

			var resetStation = function(station) {

				for (var i in stationGroups) {
					var stations = stationGroups[i];
					if ($(station + "Text").val().indexOf(i) == 0) {
						var stationText = stations[Math.round(Math.random() * (stations.length - 1))];
						$(station + "Text").val(stationText);
						$(station).val(stationobj[stationText]);
						break;
					}
				}
			}

			setInterval(function() {
				if ($("#query_ticket").text() == "停止查询") {
					resetStation("#fromStation");
					resetStation("#toStation");
					queryTimes++;
				}
			}, 2000);
		}


		function query() {
			refreshStation();

			setTimeout(function() {
				window.autoSearchTime = 2000;
				crack();
			}, 2000);

			setInterval(function() {
				if ($("#autosubmitcheckticketinfo").css("display") == "none" && $("#query_ticket").text() == "停止查询") {
					document.getElementById("query_ticket").dispatchEvent(clickevent);

					setTimeout(function() {
						document.getElementById("query_ticket").dispatchEvent(clickevent);
					}, 2000);
				}
			}, 6000);

		}


	route("init", query);


}, true);