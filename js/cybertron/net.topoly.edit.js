// JavaScript Document
var side = 160;
var target = null;
var before_port = null;

var nodes = {};
var stage = new Topoly.Stage("stage").init();
var queue = new createjs.LoadQueue();
/**这些SVG资源需要预先加载，否则不能显示**/
queue.loadManifest(
[
     {id: "access_control", src:"images/cybertron/dev_topo/access_control.svg"},
	 {id: "air_condition", src:"images/cybertron/dev_topo/air_condition.svg"},
	 {id: "ats", src:"images/cybertron/dev_topo/ats.svg"},
	 {id: "camera", src:"images/cybertron/dev_topo/camera.svg"},
	 {id: "database", src:"images/cybertron/dev_topo/database.svg"},
	 {id: "electric_quantity", src:"images/cybertron/dev_topo/electric_quantity.svg"},
	 {id: "envir_sensor", src:"images/cybertron/dev_topo/envir_sensor.svg"},
	 {id: "ip_phone", src:"images/cybertron/dev_topo/ip_phone.svg"},
	 {id: "lamp", src:"images/cybertron/dev_topo/lamp.svg"},
	 {id: "meter", src:"images/cybertron/dev_topo/meter.svg"},
	 {id: "middleware", src:"images/cybertron/dev_topo/middleware.svg"},
	 {id: "monitoring_host", src:"images/cybertron/dev_topo/monitoring_host.svg"},
	 {id: "pdu", src:"images/cybertron/dev_topo/pdu.svg"},
	 {id: "printer", src:"images/cybertron/dev_topo/printer.svg"},
	 {id: "projector", src:"images/cybertron/dev_topo/projector.svg"},
	 {id: "router", src:"images/cybertron/dev_topo/router.svg"},
	 {id: "server", src:"images/cybertron/dev_topo/server.svg"},
	 {id: "switch", src:"images/cybertron/dev_topo/switch.svg"},
	 {id: "thsensor", src:"images/cybertron/dev_topo/thsensor.svg"},
	 {id: "ups", src:"images/cybertron/dev_topo/ups.svg"},
	 {id: "video_conference", src:"images/cybertron/dev_topo/video_conference.svg"},
	 {id: "water_sensor", src:"images/cybertron/dev_topo/water_sensor.svg"}
]);
queue.on("complete", handleComplete, this);
function handleComplete() 
{
	//获取上次保存的数据并初始化
	(function()
	{
		var callback = function(result)
		{
			var data = eval(result);
			//创建节点
			for(var i=0;i<data.length;++i)
			{
				nodes[data[i].id] = new Topoly.Node(data[i].id,data[i].name,data[i].width,data[i].height,data[i].left,data[i].top,data[i].image,true);
				nodes[data[i].id].deviceClassName = data[i].deviceClassName;
				nodes[data[i].id].ports = data[i].ports;
				stage.add(nodes[data[i].id]);
				$("#box #"+data[i].id).addClass("droped");
				nodes[data[i].id].bind("contextmenu",function(e)
				{
					target = this;
					$("#ports").children("div[name='network-port']").children("ul").empty();
					$("#ports").children("div[name='non-network-port']").children("ul").empty();
					for(var k in this.context.ports)
					{
						if(this.context.ports[k].clazz == "1")//网络端口
						{
							$("#ports").children("div[name='network-port']").children("ul").append(
								"<li class='"+(this.context.ports[k].used?"disabled":"")+"'><a>"+
								this.context.ports[k].serviceNameCn+
								"</a><input type='hidden' value='"+this.context.ports[k].id+"'/></li>"
							);
						}
						else//非网络端口
						{
							$("#ports").children("div[name='non-network-port']").children("ul").append(
								"<li class='"+(this.context.ports[k].used?"disabled":"")+"'><a>"+
								this.context.ports[k].serviceNameCn+
								"</a><input type='hidden' value='"+this.context.ports[k].id+"'/></li>"
							);
						}
					}
					
					var bound = $("#stage").parent()[0].getBoundingClientRect();
					$("#ports").css({"left":e.clientX-bound.left+"px","top":e.clientY-bound.top+"px"}).removeClass("unactive");
					$(document).one("mousedown",function()
					{
						$("#ports").addClass("unactive");
					});
					e.stopPropagation();
					e.preventDefault();
					return false;
				});	
			}
			//初始化连线
			for(var k in nodes)
			{
				for(var p in nodes[k].ports)
				{
					if(!nodes[k].ports[p].used)continue;
					var nodeA = nodes[k];
					var nodeB = nodes[nodes[k].ports[p].tagDeviceId];
					var lineType = nodes[k].ports[p].lineAttr["type"];
					var lineDirection = nodes[k].ports[p].lineAttr["direction"];
					
					var line = stage.alllines[nodeA.id+"_"+nodeB.id]||stage.alllines[nodeB.id+"_"+nodeA.id];
					if(line)continue;
					if(lineType == "NormalLine")
					{
						line = new Topoly.NormalLine(nodeA,nodeB);
					}
					else if(lineType == "BrokenPolyline")
					{
						line = new Topoly.BrokenPolyline(nodeA,nodeB,lineDirection);
					}
					else if(lineType == "SecondaryPolyline")
					{
						line = new Topoly.SecondaryPolyline(nodeA,nodeB,lineDirection);
					}
					stage.add(line);
				}
			}
		};
		$.ajax(
		{
			type:"POST",
			url:"/netTopo.json",
			async:false,
			data:{"topoId":"1001"},
			success:callback
		});
	})();
	
	window.oncontextmenu = function(e){return false;};
	stage.cancel = function()//放弃连线
	{
		target = null;
		before_port = null;
	};
	$("#box .device_list > .device").each(function()
	{
		$(this).draggable({'helper':'clone','scope':'dev','appendTo':'body'});
	});
	$("#stage").parent().droppable(
	{
		scope:'dev',
		drop:function(e, ui)
		{
			var id = $(ui.draggable).attr("id");
			var bound = $("#stage").parent()[0].getBoundingClientRect();
			var x = e.pageX - bound.left;
			var y = e.pageY - bound.top;
			
			var matrix = stage.container.matrixify();
			var viewbox = stage.stage.viewbox();
			var sctm = stage.stage.screenCTM();
			
			x = x/viewbox.zoom-side/2 - sctm.e/sctm.a - matrix.e;
			y = y/viewbox.zoom + viewbox.y - side/2 - matrix.f;
			
			
			var netError = true;
			var ports = {};
			$.ajax(
			{
				type:"POST",
				url:"/netPort.json",
				async:false,
				data:{"portId":id},
				success:function(result)
				{
					var data = eval(result);
					netError = false;
					for(var i=0;i<data.length;++i)
					{
						data[i].used = false;
						data[i].tagPortId = null;
						data[i].tagDeviceId = null;
						data[i].lineAttr = {};
						ports[data[i].portId] = data[i];
					}
					
					for(var i=0;i<30;++i)
					{
						ports["nonnet"+i] = {"clazz":"0","id":"nonnet"+i,"portId":"nonnet"+i,"serviceNameCn":"非网络端口","serviceNameEn":"非网络端口","used":false,"tagPortId":null,"tagDeviceId":null,"lineAttr":{}};
					}
				}
			});
			
			if(netError)
			{				
				alert("发生网络错误！");
				return false;
			}
			$(ui.draggable).addClass("droped");
			nodes[id] = new Topoly.Node(
				id+"",$(ui.draggable).find("p").text(),
				side,side,x,y,
				$(ui.draggable).find("img").attr("src").split(".")[0].replace("dev_img","dev_topo").substr(0)+".svg",
				true
			);
			stage.add(nodes[id]);
			
			nodes[id].deviceClassName = $(ui.draggable).children("input").val();
			nodes[id].ports = ports;
			
			nodes[id].bind("contextmenu",function(e)
			{
				target = this;
				$("#ports").children("div[name='network-port']").children("ul").empty();
				$("#ports").children("div[name='non-network-port']").children("ul").empty();
				for(var k in this.context.ports)
				{
					if(this.context.ports[k].clazz == "1")//网络端口
					{
						$("#ports").children("div[name='network-port']").children("ul").append(
							"<li class='"+(this.context.ports[k].used?"disabled":"")+"'><a>"+this.context.ports[k].serviceNameCn+"</a><input type='hidden' value='"+this.context.ports[k].id+"'/></li>"
						);
					}
					else//非网络端口
					{
						$("#ports").children("div[name='non-network-port']").children("ul").append(
							"<li class='"+(this.context.ports[k].used?"disabled":"")+"'><a>"+this.context.ports[k].serviceNameCn+"</a><input type='hidden' value='"+this.context.ports[k].id+"'/></li>"
						);
					}
				}
				
				var bound = $("#stage").parent()[0].getBoundingClientRect();
				$("#ports").css({"left":e.clientX-bound.left+"px","top":e.clientY-bound.top+"px"}).removeClass("unactive");
				$(document).one("mousedown",function()
				{
					$("#ports").addClass("unactive");
				});
				e.stopPropagation();
				e.preventDefault();
				return false;
			});	
		}
	});
	document.onkeydown = function(e)
	{
		var code = e.keyCode||e.which;
		if(code == 83&&e.ctrlKey)
		{
			e.stopPropagation();
			e.preventDefault();
			return false;
		}
	};
	window.onkeyup = function(e)
	{
		var code = e.keyCode||e.which;
		if(code == 46&&stage)
		{
			var result = stage.getSelected();
			for(var i=0;i<result.nodes.length;++i)
			{
				stage.remove(result.nodes[i]);
				delete nodes[result.nodes[i].id];
				$("#box #"+result.nodes[i].id).removeClass("droped");
			}
			for(var i=0;i<result.lines.length;++i)
			{
				if(!stage.alllines[result.lines[i].node.attr("id")])continue;
				stage.remove(result.lines[i]);
			}
			
			for(var k in nodes)
			{
				for(var v in nodes[k].ports)
				{
					if(nodes[k].ports[v].used)
					{	
						var line = stage.alllines[nodes[k].ports[v].tagDeviceId+"_"+nodes[k].id]||stage.alllines[nodes[k].id+"_"+nodes[k].ports[v].tagDeviceId];
						if(!line)
						{
							nodes[k].ports[v].used = false;
							nodes[k].ports[v].tagPortId = null;
							nodes[k].ports[v].tagDeviceId = null;
							nodes[k].ports[v].lineAttr = {};
						}
					}
				}
			}
		}
		if(code == 83&&e.ctrlKey)
		{
			var subdata = [];
			for(var k in nodes)
			{
				var obj = {};
				obj.id = nodes[k].id;
				obj.name = nodes[k].name;
				obj.deviceClassName = nodes[k].deviceClassName;
				obj.image = nodes[k].image;
				obj.left = nodes[k].left;
				obj.top = nodes[k].top;
				obj.width = nodes[k].width;
				obj.height = nodes[k].height;
				obj.ports = nodes[k].ports;
				
				subdata.push(obj);
			}
			alert("保存成功！");
		}
	};
	
	$("#ports ul").on("mousedown","li a",function(e)
	{
		if(target != null&&!$(this).parent().hasClass("disabled"))
		{
			var result = target.context.copulation();
			if(result.status == 0)
			{
				before_port = $(this).next().val();
			}
			else if(result.status == 1)
			{
				var nodeA = target.context;
				var nodeB = target.context === result.nodes[0]?result.nodes[1]:result.nodes[0];
				var after_port = $(this).next().val();
				nodeA.ports[after_port].used = true;
				nodeA.ports[after_port].tagDeviceId = nodeB.id;
				nodeA.ports[after_port].tagPortId = before_port;
				nodeA.ports[after_port].lineAttr["type"] = stage.lineType;
				nodeA.ports[after_port].lineAttr["direction"] = stage.lineType=="NormalLine"?"":stage.lineDirection;
				
				nodeB.ports[before_port].used = true;
				nodeB.ports[before_port].tagDeviceId = nodeA.id;
				nodeB.ports[before_port].tagPortId = after_port;
				nodeB.ports[before_port].lineAttr["type"] = stage.lineType;
				nodeB.ports[before_port].lineAttr["direction"] = stage.lineType=="NormalLine"?"":stage.lineDirection;
				
				before_port = null;
				target = null;
			}
			else if(result.status = -1)
			{
				before_port = null;
				target = null;
			}
		}
	});
}

