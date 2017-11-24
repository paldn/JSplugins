// JavaScript Document
//这是测试数据
var test_data;

var nodes = {};
var stage = new Topoly.Stage("stage").init();
var timer = null;
function calc_rotate(px,py,mx,my)
{
	var x = Math.abs(px-mx);
        var y = Math.abs(py-my);
        var z = Math.sqrt(Math.pow(x,2)+Math.pow(y,2));
        var cos = y/z;
        var radina = Math.acos(cos);//用反三角函数求弧度
        var angle = Math.floor(180/(Math.PI/radina));//将弧度转换成角度

        if(mx>px&&my>py){//鼠标在第四象限
            angle = 180 - angle;
        }

        if(mx==px&&my>py){//鼠标在y轴负方向上
            angle = 180;
        }

        if(mx>px&&my==py){//鼠标在x轴正方向上
            angle = 90;
        }

        if(mx<px&&my>py){//鼠标在第三象限
            angle = 180+angle;
        }

        if(mx<px&&my==py){//鼠标在x轴负方向
            angle = 270;
        }

        if(mx<px&&my<py){//鼠标在第二象限
            angle = 360 - angle;
        }
		if(px > mx)
		{
			angle += 180;
		}
	return angle;
}
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
			test_data = data;
			//创建节点
			for(var i=0;i<data.length;++i)
			{
				nodes[data[i].id] = new Topoly.Node(data[i].id,data[i].name,data[i].width,data[i].height,data[i].left,data[i].top,data[i].image,false);
				nodes[data[i].id].deviceClassName = data[i].deviceClassName;
				nodes[data[i].id].ports = data[i].ports;
				stage.add(nodes[data[i].id]);
				nodes[data[i].id].status = 0;
				nodes[data[i].id].bind("dblclick",function(e)
				{
					alert("OK");
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
			
			stage.flow_box = stage.container.group();
			//初始化流量显示
			for(var k in stage.alllines)
			{
				var arr = stage.alllines[k].node.plot().value;
				var rotate = 0;
				var pos = {};
				if(arr.length == 2)
				{
					rotate = calc_rotate(arr[0][0],arr[0][1],arr[1][0],arr[1][1]);
					pos.x = (arr[0][0]+arr[1][0])/2;
					pos.y = (arr[0][1]+arr[1][1])/2;
				}
				else if(arr.length == 3)
				{
					if((arr[0][0]-arr[1][0])*(arr[0][0]-arr[1][0])+(arr[0][1]-arr[1][1])*(arr[0][1]-arr[1][1])
						>(arr[1][0]-arr[2][0])*(arr[1][0]-arr[2][0])+(arr[1][1]-arr[2][1])*(arr[1][1]-arr[2][1]))
					{
						rotate = calc_rotate(arr[0][0],arr[0][1],arr[1][0],arr[1][1]);
						pos.x = (arr[0][0]+arr[1][0])/2;
						pos.y = (arr[0][1]+arr[1][1])/2;
					}
					else
					{
						rotate = calc_rotate(arr[1][0],arr[1][1],arr[2][0],arr[2][1]);
						pos.x = (arr[1][0]+arr[2][0])/2;
						pos.y = (arr[1][1]+arr[2][1])/2;
					}
				}
				else if(arr.length == 4)
				{
					rotate = calc_rotate(arr[1][0],arr[1][1],arr[2][0],arr[2][1]);
					pos.x = (arr[1][0]+arr[2][0])/2;
					pos.y = (arr[1][1]+arr[2][1])/2;
				}
				var flowParent = stage.flow_box.group().attr({"id":stage.alllines[k].node.attr("id").replace("_","to")}).x(pos.x).y(pos.y);
				var flow_in = flowParent.text("0.0kbps").fill({"color":"#3c6"}).cy(-30).attr({"font-size":"24px","transform":"rotate("+(-90+rotate)+")","text-anchor":"middle"});
				var flow_out = flowParent.text("0.0kbps").fill({"color":"#3c6"}).attr({"font-size":"24px","transform":"rotate("+(-90+rotate)+")","text-anchor":"middle"});
				
				
				
				stage.alllines[k].flow = flowParent;
			}
			
			
			
			
			//模拟测试数据
			for(var i=0;i<test_data.length;++i)
			{
				test_data[i].count = 0;
				test_data.status = 0;
				for(var k in test_data[i].ports)
				{
					if(test_data[i].ports[k].used)
					{
						test_data[i].ports[k].flow_in = "recv 0kbps";
						test_data[i].ports[k].flow_out = "send 0kbps";
					}
				}
			}
			
			setInterval(function()
			{
				for(var i=0;i<test_data.length;++i)
				{
					if(test_data[i].count == 0)
					{
						test_data[i].status = parseInt(Math.random()*5)%5;
					}
					test_data[i].count++;
					test_data[i].count = test_data[i].count%10;
					
					for(var k in test_data[i].ports)
					{
						if(test_data[i].ports[k].used)
						{
							test_data[i].ports[k].flow_in = "recv "+(Math.random()*4096).toFixed(2)+"kbps";
							test_data[i].ports[k].flow_out = "send "+(Math.random()*4096).toFixed(2)+"kbps";
						}
					}
				}
				
				//填充数据
				for(var i=0;i<test_data.length;++i)
				{
					if(test_data[i].status != nodes[test_data[i].id].status)
					{
						nodes[test_data[i].id].alarming(test_data[i].status);
						nodes[test_data[i].id].status = test_data[i].status;
					}
					for(var k in test_data[i].ports)
					{
						if(test_data[i].ports[k].used)
						{
							var line = stage.alllines[test_data[i].ports[k].tagDeviceId+"_"+test_data[i].id]||stage.alllines[test_data[i].id+"_"+test_data[i].ports[k].tagDeviceId];
							
							line.flow.children()[0].text(test_data[i].ports[k].flow_in);
							line.flow.children()[1].text(test_data[i].ports[k].flow_out);
						}
					}
				}
				
			},3000);
			
			
			
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
}