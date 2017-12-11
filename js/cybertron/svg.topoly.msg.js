// JavaScript Document
(function(Topoly)
{
	Topoly.Stage.prototype.view_detail = function(node,msg)
	{
		if(!this.msg_box)
		{
			this.msg_box = this.stage.group().x(node.left+node.width/2-300).y(node.top+node.height/2-300).attr({"pointer-events":"none"});

			var health = this.msg_box.group();
			var backs = this.msg_box.group();
			
			backs.circle(600).attr({"fill":"none","stroke":"#3c6","stroke-width":"3"});
			backs.circle(500).attr({"fill":"none","stroke":"#3c6","stroke-width":"3"}).x(50).y(50);
			backs.circle(400).attr({"fill":"none","stroke":"#3c6","stroke-width":"3"}).x(100).y(100);
			backs.circle(300).attr({"fill":"none","stroke":"#3c6","stroke-width":"3"}).x(150).y(150);
			backs.circle(200).attr({"fill":"none","stroke":"#3c6","stroke-width":"3"}).x(200).y(200);
			backs.line([0,300,200,300]).attr({"fill":"none","stroke":"#3c6","stroke-width":"3"});
			backs.line([400,300,600,300]).attr({"fill":"none","stroke":"#3c6","stroke-width":"3"});
			backs.line([300,0,300,200]).attr({"fill":"none","stroke":"#3c6","stroke-width":"3"});
			backs.line([300,400,300,600]).attr({"fill":"none","stroke":"#3c6","stroke-width":"3"});
			health.circle(600).attr({"fill":"rgba(255,255,255,0.7)","stroke":"none"});
			health.image("images/cybertron/radar.png",600,600);
			var fieldbox = backs.group().x(300).y(300);
			fieldbox.text(msg.health+"").attr({"text-anchor":"middle","font-size":"96px","fill":"#0d0"}).cy(0);
			
			health.animate(3000).rotate(360).loop();
			var base_msg = this.msg_box.group();
			base_msg.path("M513 510 A 302 300 0 0 0 513 90 L1213 90 L1233 110 L1233 490 L1213 510 L511 510 z").attr({"stroke":"#3c6","stroke-width":"3","fill":"rgba(255,255,255,0.7)"});
			
			var name = base_msg.text("设备名称："+msg.name).attr({"font-size":"24px","fill":"#0d0"}).x(630).y(160);
			var business = base_msg.text("业务类型："+msg.busi_type).attr({"font-size":"24px","fill":"#0d0"}).x(645).y(210);
			var ip_addr = base_msg.text("IP地址："+msg.ip_addr).attr({"font-size":"24px","fill":"#0d0"}).x(660).y(260);
			var dev_level = base_msg.text("设备级别："+msg.dev_level).attr({"font-size":"24px","fill":"#0d0"}).x(660).y(310);
			var geography = base_msg.text("地理位置："+msg.geo_addr).attr({"font-size":"24px","fill":"#0d0"}).x(645).y(360);
			var alarmCount = base_msg.text("告警数量/监控项："+msg.alarm_count+" / "+msg.monitor_count).attr({"font-size":"24px","fill":"#0d0"}).x(630).y(410);
			this.msg_box.on("mousedown",function(e)
			{
				e.stopPropagation();
			});
		}
		else
		{
			this.msg_box.children()[1].children()[9].children()[0].text(msg.health+"");
			this.msg_box.children()[2].children()[1].text("设备名称："+msg.name);
			this.msg_box.children()[2].children()[2].text("业务类型："+msg.busi_type);
			this.msg_box.children()[2].children()[3].text("IP地址："+msg.ip_addr);
			this.msg_box.children()[2].children()[4].text("设备级别："+msg.dev_level);
			this.msg_box.children()[2].children()[5].text("地理位置："+msg.geo_addr);
			this.msg_box.children()[2].children()[6].text("告警数量/监控项："+msg.alarm_count+" / "+msg.monitor_count);
			
			this.msg_box.attr({"opacity":"1"}).x(node.left+node.width/2-300).y(node.top+node.height/2-300);
		}
		$(document).one("mousedown",function()
		{
			if(stage)
			{
				stage.msg_box.attr({"opacity":"0"}).x(-9000).y(-9000);
			}
		});
	};
})(Topoly);