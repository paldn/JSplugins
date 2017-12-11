/**
	本插件是基于SVG.js插件基础之上开发的，本插件是开源的，之所以开源只是方便各位大佬技术交流。
	本插件是工作需求匆忙开发的，诸多地方尚待优化，本插件依赖于svg.min.js,svg.draggable.min.js,
	svg.panzoom.js。如果使用网上在新版本或与本插件不兼容；在尽量使用本人提供的版本。本插件专针对
	网络拓扑，内置关于拓扑图的连线，拖拽，跟踪等功能。本人习性疏懒，没有提供详细文档。如有疑惑可联系
	本人，联系方式：QQ1129171930，若不在线可先留言。
**/

;(function(SVG)
{
	Topoly = function(){};
	Topoly.Stage = function(id)
	{
		this.id = id;
		var bound = document.getElementById(id).getBoundingClientRect();
		var width = bound.width;
		var height = bound.height;
		this.stage = SVG(id).size("100%","100%").viewbox({ x: 0, y: 0, width: width*2, height: height*2 }).panZoom({zoomMin: 0.1, zoomMax: 20});
		
		
		this.stage.gradient('radial',function(stop)
		{
			stop.at({ offset: 0.5, color: '#fff', opacity: 0 });
			stop.at({ offset: 1, color: '#ef3', opacity: 1 });
		}).attr({"id":"warning"}).from("50%","50%").to("50%","50%").radius("50%");
		this.stage.gradient('radial',function(stop)
		{
			stop.at({ offset: 0.5, color: '#fff', opacity: 0 });
			stop.at({ offset: 1, color: '#f00', opacity: 1 });
		}).attr({"id":"alarming"}).from("50%","50%").to("50%","50%").radius("50%");
		this.stage.gradient('radial',function(stop)
		{
			stop.at({ offset: 0.5, color: '#fff', opacity: 0 });
			stop.at({ offset: 1, color: '#00f', opacity: 1 });
		}).attr({"id":"critical"}).from("50%","50%").to("50%","50%").radius("50%");
		this.stage.gradient('radial',function(stop)
		{
			stop.at({ offset: 0.5, color: '#fff', opacity: 0 });
			stop.at({ offset: 1, color: '#2e4', opacity: 1 });
		}).attr({"id":"restore"}).from("50%","50%").to("50%","50%").radius("50%");
		
		
		this.stage.element = this;
		this.container = this.stage.group().draggable();
		this.lines = this.container.group();
		this.scene = this.container.group();
		this.stage.events = {};
		
		this.allnodes = {};
		this.alllines = {};
	};
	Topoly.Stage.prototype.init = function()
	{
		this.line = null;
		this.lineType = "NormalLine";
		this.lineDirection = "horizontal";
		this.lineWidth = 5;
		this.lineColor = "#3c6";
		
		this.node = new Topoly.Node("QWWERRDDFGGHJGUUGHJHFDGHJUUIGHGJJGHFHJGYTSDDT","",160,160,0,0,"",true);
		this.node.element = this;
		this.node.bind("dblclick",function(e)
		{
			var pLine = this.context.element.line;
			
			if(pLine!=null)
			{
				pLine.node.remove();
				delete this.context.element.alllines[pLine.node.attr("id")];
				var tagNode = pLine.nodeA==this.element?pLine.nodeB:pLine.nodeA;
				for(var i=0;i<tagNode.lines.length;++i)
				{
					if(tagNode.lines[i] === pLine)
					{
						tagNode.lines.splice(i,1);
						break;
					}
				}
				this.context.element.node.lines = [];
				this.context.element.line = null;
			}
			if(this.context.element.cancel)
			{
				this.context.element.cancel.call(this.context.element);
			}
		});
		this.add(this.node);
		this.node.attr({"opacity":"0"});
		this.bind("mousemove",function(e)
		{
			var bound = document.getElementById(this.element.id).getBoundingClientRect();
			var matrix = this.element.container.matrixify();
			var viewbox = this.viewbox();
			var pLine = this.element.line;
			var pNode = this.element.node;
			var sctm = this.screenCTM();
			if(pLine != null)
			{
				pNode.node.x(e.clientX/viewbox.zoom-pNode.width/2 - sctm.e/sctm.a - matrix.e).y((e.clientY-bound.top)/viewbox.zoom + viewbox.y - pNode.height/2 - matrix.f);
				var matrixA = pLine.nodeA.node.matrixify();
				var ax = matrixA.e;
				var ay = matrixA.f;
				
				var matrixB = pLine.nodeB.node.matrixify();
				var bx = matrixB.e;
				var by = matrixB.f;
				pLine.node.attr({"opacity":"1"});
				if(pLine.lineType == 1)
				{
					pLine.node.plot(
						[
							[ax+pLine.nodeA.width/2,ay+pLine.nodeA.height/2],
							[bx+pLine.nodeB.width/2,by+pLine.nodeB.height/2]
						]
					);
				}
				if(pLine.lineType == 2)
				{
					var ids = pLine.node.attr("id").split("_");
					if(ids[0] == this.id)
					{
						pLine.node.plot(
							[
								[ax+pLine.nodeA.width/2,ay+pLine.nodeA.height/2],
								[bx+pLine.nodeB.width/2,ay+pLine.nodeA.height/2],
								[bx+pLine.nodeB.width/2,by+pLine.nodeB.height/2]
							]
						);
					}
					else
					{
						pLine.node.plot(
							[
								[bx+pLine.nodeB.width/2,by+pLine.nodeB.height/2],
								[ax+pLine.nodeA.width/2,by+pLine.nodeB.height/2],
								[ax+pLine.nodeA.width/2,ay+pLine.nodeA.height/2]
							]
						);
					}
				}
				if(pLine.lineType == 3)
				{
					var ids = pLine.node.attr("id").split("_");
					if(ids[0] == this.id)
					{
						pLine.node.plot(
							[
								[ax+pLine.nodeA.width/2,ay+pLine.nodeA.height/2],
								[ax+pLine.nodeA.width/2,by+pLine.nodeB.height/2],
								[bx+pLine.nodeB.width/2,by+pLine.nodeB.height/2]
							]
						);
					}
					else
					{
						pLine.node.plot(
							[
								[bx+pLine.nodeB.width/2,by+pLine.nodeB.height/2],
								[bx+pLine.nodeB.width/2,ay+pLine.nodeA.height/2],
								[ax+pLine.nodeA.width/2,ay+pLine.nodeA.height/2]
							]
						);
					}
				}
				if(pLine.lineType == 4)
				{
					if(bx>ax)
					{
						pLine.node.plot(
							[
								[ax+pLine.nodeA.width/2,ay+pLine.nodeA.height/2],
								[ax+pLine.nodeA.width*3/2,ay+pLine.nodeA.height/2],
								[bx-pLine.nodeB.width/2,by+pLine.nodeB.height/2],
								[bx+pLine.nodeB.width/2,by+pLine.nodeB.height/2]
							]
						);
					}
					else
					{
						pLine.node.plot(
							[
								[bx+pLine.nodeB.width/2,by+pLine.nodeB.height/2],
								[bx+pLine.nodeB.width*3/2,by+pLine.nodeB.height/2],
								[ax-pLine.nodeA.width/2,ay+pLine.nodeA.height/2],
								[ax+pLine.nodeA.width/2,ay+pLine.nodeA.height/2]
							]
						);
					}
				}
				if(pLine.lineType == 5)
				{
					if(by>ay)
					{
						pLine.node.plot(
							[
								[ax+pLine.nodeA.width/2,ay+pLine.nodeA.height/2],
								[ax+pLine.nodeA.width/2,ay+pLine.nodeA.height*3/2],
								[bx+pLine.nodeB.width/2,by-pLine.nodeB.height/2],
								[bx+pLine.nodeB.width/2,by+pLine.nodeB.height/2]
							]
						);
					}
					else
					{
						pLine.node.plot(
							[
								[bx+pLine.nodeB.width/2,by+pLine.nodeB.height/2],
								[bx+pLine.nodeB.width/2,by+pLine.nodeB.height*3/2],
								[ax+pLine.nodeA.width/2,ay-pLine.nodeA.height/2],
								[ax+pLine.nodeA.width/2,ay+pLine.nodeA.height/2]
							]
						);
					}
				}
			}
		});
		this.stage.on("mousedown",function(e)
		{
			for(var v=0;v<this.element.lines.children().length;++v)
			{
				this.element.lines.children()[v].context.selected = false;
				this.element.lines.children()[v].attr({"stroke":"#3c6"});
			}
			for(var v=0;v<this.element.scene.children().length;++v)
			{
				this.element.scene.children()[v].context.selected = false;
				this.element.scene.children()[v].children()[2].children()[0].attr({"opacity":"0"});
			}
		});
		return this;
	};
	Topoly.Stage.prototype.getSelected = function()
	{
		var obj = {nodes:[],lines:[]};
		for(var v in this.alllines)
		{
			if(this.alllines[v].selected)
			{
				obj.lines.push(this.alllines[v]);
			}
		}
		for(var v in this.allnodes)
		{
			if(this.allnodes[v].selected)
			{
				obj.nodes.push(this.allnodes[v]);
			}
		}
		return obj;
	};
	Topoly.Stage.prototype.setLineType = function(typeName)
	{
		var typeNames = {"NormalLine":true,"BrokenPolyline":true,"SecondaryPolyline":true};
		
		if(!typeNames[typeName])
		{
			alert("错误的线条类型！");
		}
		else
		{
			this.lineType = typeName;
		}
	};
	Topoly.Stage.prototype.setLineDirection = function(direction)
	{
		var directionNames = {"horizontal":true,"vertical":true};
		if(!directionNames[direction])
		{
			alert("错误的方向！");
		}
		else
		{
			this.lineDirection = direction;
		}
	};
	Topoly.Stage.prototype.setLineWidth = function(lineWidth)
	{
		if(typeof lineWidth != "number")
		{
			alert("无效的宽度值");
		}
		else
		{
			this.lineWidth = lineWidth;
		}
	};
	Topoly.Stage.prototype.setLineColor = function(lineColor)
	{
		this.lineColor = lineColor;
	};
	Topoly.Stage.prototype.bind = function(eventName,callback)
	{
		if(typeof eventName != "string"||typeof callback != "function")
		{
			alert("错误的参数!");
			return;
		}
		this.stage.events[eventName] = callback;
		this.stage.on(eventName,function(e)
		{
			this.events[eventName].call(this,e);
		});
	};
	Topoly.Stage.prototype.add = function(element)
	{
		if(element.type == "node")
		{
			if(this.allnodes[element.id])
			{
				alert("ID冲突！");
				return -1;
			}
			var box = this.scene.group().attr({"id":element.id}).x(element.left).y(element.top);
			var background = box.group();
			var image = background.image(element.image,element.width,element.height);
			var foreground = box.group().x(element.width/2).y(element.height/2);
			var select_box = box.group();
			var select_rect = select_box.rect(element.width+20,element.height+20).x(-10).y(-10).attr({"fill":"#396","opacity":"0"});
			var status_1 = foreground.circle().radius(0).fill("none");
			var status_2 = foreground.circle().radius(0).fill("none");
			var fieldbox = box.group().x(element.width/2).y(element.height);
			var text = fieldbox.text(element.name).attr({"text-anchor":"middle","font-size":"24px"});
			if(element.draggable)
			{
				box.draggable().on("dragmove",function(e)
				{
					var matrix = this.matrixify();
					this.context.left = matrix.e;
					this.context.top = matrix.f;
					var ax = matrix.e;
					var ay = matrix.f;
					for(var i=0;i<this.context.lines.length;++i)
					{
						var element = this.context.lines[i];
						var node = this.context === element.nodeA?element.nodeB.node:element.nodeA.node;
						var local_matrix = node.matrixify();
						var bx = local_matrix.e;
						var by = local_matrix.f;
						if(element.lineType == 1)
						{
							element.node.plot(
								[
									[ax+element.nodeA.width/2,ay+element.nodeA.height/2],
									[bx+element.nodeB.width/2,by+element.nodeB.height/2]
								]
							);
						}
						if(element.lineType == 2)
						{
							var ids = element.node.attr("id").split("_");
							if(ids[0] == this.context.id)
							{
								element.node.plot(
									[
										[ax+element.nodeA.width/2,ay+element.nodeA.height/2],
										[bx+element.nodeB.width/2,ay+element.nodeA.height/2],
										[bx+element.nodeB.width/2,by+element.nodeB.height/2]
									]
								);
							}
							else
							{
								element.node.plot(
									[
										[bx+element.nodeB.width/2,by+element.nodeB.height/2],
										[ax+element.nodeA.width/2,by+element.nodeB.height/2],
										[ax+element.nodeA.width/2,ay+element.nodeA.height/2]
									]
								);
							}
						}
						if(element.lineType == 3)
						{
							var ids = element.node.attr("id").split("_");
							if(ids[0] == this.context.id)
							{
								element.node.plot(
									[
										[ax+element.nodeA.width/2,ay+element.nodeA.height/2],
										[ax+element.nodeA.width/2,by+element.nodeB.height/2],
										[bx+element.nodeB.width/2,by+element.nodeB.height/2]
									]
								);
							}
							else
							{
								element.node.plot(
									[
										[bx+element.nodeB.width/2,by+element.nodeB.height/2],
										[bx+element.nodeB.width/2,ay+element.nodeA.height/2],
										[ax+element.nodeA.width/2,ay+element.nodeA.height/2]
									]
								);
							}
						}
						if(element.lineType == 4)
						{
							if(bx>ax)
							{
								element.node.plot(
									[
										[ax+element.nodeA.width/2,ay+element.nodeA.height/2],
										[ax+element.nodeA.width*3/2,ay+element.nodeA.height/2],
										[bx-element.nodeB.width/2,by+element.nodeB.height/2],
										[bx+element.nodeB.width/2,by+element.nodeB.height/2]
									]
								);
							}
							else
							{
								element.node.plot(
									[
										[bx+element.nodeB.width/2,by+element.nodeB.height/2],
										[bx+element.nodeB.width*3/2,by+element.nodeB.height/2],
										[ax-element.nodeA.width/2,ay+element.nodeA.height/2],
										[ax+element.nodeA.width/2,ay+element.nodeA.height/2]
									]
								);
							}
						}
						if(element.lineType == 5)
						{
							if(by>ay)
							{
								element.node.plot(
									[
										[ax+element.nodeA.width/2,ay+element.nodeA.height/2],
										[ax+element.nodeA.width/2,ay+element.nodeA.height*3/2],
										[bx+element.nodeB.width/2,by-element.nodeB.height/2],
										[bx+element.nodeB.width/2,by+element.nodeB.height/2]
									]
								);
							}
							else
							{
								element.node.plot(
									[
										[bx+element.nodeB.width/2,by+element.nodeB.height/2],
										[bx+element.nodeB.width/2,by+element.nodeB.height*3/2],
										[ax+element.nodeA.width/2,ay-element.nodeA.height/2],
										[ax+element.nodeA.width/2,ay+element.nodeA.height/2]
									]
								);
							}
						}
					}
				});
			}
			box.on("dblclick",function(e)
			{
				if(this.context.events["dblclick"])
				{
					this.context.events["dblclick"].call(this,e);
				}
			}).on("mouseover",function(e)
			{
				if(this.context.events["mouseover"])
				{
					this.context.events["mouseover"].call(this,e);
				}
			}).on("contextmenu",function(e)
			{
				if(this.context.events["contextmenu"])
				{
					this.context.events["contextmenu"].call(this,e);
				}
			}).on("mousedown",function(e)
			{
				if(this.context.id == "QWWERRDDFGGHJGUUGHJHFDGHJUUIGHGJJGHFHJGYTSDDT")return false;
				if(!e.ctrlKey)
				{
					var nodes = this.siblings();
					for(var v=0;v<nodes.length;++v)
					{
						nodes[v].context.selected = false;
						nodes[v].children()[2].children()[0].attr({"opacity":"0"});
					}
					
					var lines = this.parent().previous().children();
					for(var v=0;v<lines.length;++v)
					{
						lines[v].context.selected = false;
						lines[v].attr({"stroke":"#3c6"});
					}
				}
				this.context.selected = true;
				this.children()[2].children()[0].attr({"opacity":"0.3"});
				e.stopPropagation();
			});
			box.context = element;
			element.node = box;
			this.allnodes[element.id] = element;
			return 1;
		}
		if(element.type == "line")
		{
			var existLine = this.alllines[element.nodeA.id+"_"+element.nodeB.id]||this.alllines[element.nodeB.id+"_"+element.nodeA.id];
			if(existLine)
			{
				alert("该连接已存在！");
				return -1;
			}
			var matrixA = element.nodeA.node.matrixify();
			var ax = matrixA.e;
			var ay = matrixA.f;
			
			var matrixB = element.nodeB.node.matrixify();
			var bx = matrixB.e;
			var by = matrixB.f;
			
			var line;
			if(element.lineType == 1)
			{
				line = this.lines.polyline(
					[
						ax+element.nodeA.width/2,ay+element.nodeA.height/2,
						bx+element.nodeB.width/2,by+element.nodeB.height/2
					]
				).fill("none").stroke({ width: 5 ,color:'#3c6'});
			}
			if(element.lineType == 2)
			{
				line = this.lines.polyline(
					[
						ax+element.nodeA.width/2,ay+element.nodeA.height/2,
						bx+element.nodeB.width/2,ay+element.nodeA.height/2,
						bx+element.nodeB.width/2,by+element.nodeB.height/2
					]
				).fill("none").stroke({ width: 5 ,color:'#3c6'});
			}
			if(element.lineType == 3)
			{
				line = this.lines.polyline(
					[
						ax+element.nodeA.width/2,ay+element.nodeA.height/2,
						ax+element.nodeA.width/2,by+element.nodeB.height/2,
						bx+element.nodeB.width/2,by+element.nodeB.height/2
					]
				).fill("none").stroke({ width: 5 ,color:'#3c6'});
			}
			if(element.lineType == 4)
			{
				if(bx>ax)
				{
					line = this.lines.polyline(
						[
							ax+element.nodeA.width/2,ay+element.nodeA.height/2,
							ax+element.nodeA.width*3/2,ay+element.nodeA.height/2,
							bx-element.nodeB.width/2,by+element.nodeB.height/2,
							bx+element.nodeB.width/2,by+element.nodeB.height/2
						]
					).fill("none").stroke({ width: 5 ,color:'#3c6'});
				}
				else
				{
					line = this.lines.polyline(
						[
							bx+element.nodeB.width/2,by+element.nodeB.height/2,
							bx+element.nodeB.width*3/2,by+element.nodeB.height/2,
							ax-element.nodeA.width/2,ay+element.nodeA.height/2,
							ax+element.nodeA.width/2,ay+element.nodeA.height/2
						]
					).fill("none").stroke({ width: 5 ,color:'#3c6'});
				}
			}
			if(element.lineType == 5)
			{
				if(by>ay)
				{
					line = this.lines.polyline(
						[
							ax+element.nodeA.width/2,ay+element.nodeA.height/2,
							ax+element.nodeA.width/2,ay+element.nodeA.height*3/2,
							bx+element.nodeB.width/2,by-element.nodeB.height/2,
							bx+element.nodeB.width/2,by+element.nodeB.height/2
						]
					).fill("none").stroke({ width: 5 ,color:'#3c6'});
				}
				else
				{
					line = this.lines.polyline(
						[
							bx+element.nodeB.width/2,by+element.nodeB.height/2,
							bx+element.nodeB.width/2,by+element.nodeB.height*3/2,
							ax+element.nodeA.width/2,ay-element.nodeA.height/2,
							ax+element.nodeA.width/2,ay+element.nodeA.height/2
						]
					).fill("none").stroke({ width: 5 ,color:'#3c6'});
				}
			}
			line.attr({"cursor":"pointer"});
			line.on("mousedown",function(e)
			{
				if(!e.ctrlKey)
				{
					var lines = this.siblings();
					for(var v=0;v<lines.length;++v)
					{
						lines[v].context.selected = false;
						lines[v].attr({"stroke":"#3c6"});
					}
					
					var nodes = this.parent().next().children();
					for(var v=0;v<nodes.length;++v)
					{
						nodes[v].context.selected = false;
						nodes[v].children()[2].children()[0].attr({"opacity":"0"});
					}
				}
				this.context.selected = true;
				this.attr({"stroke":"#666"});
				e.stopPropagation();
			});
			
			line.attr({"id":element.nodeA.id+"_"+element.nodeB.id});
			this.alllines[element.nodeA.id+"_"+element.nodeB.id] = element;
			line.context = element;
			element.node = line;
			line.context.nodeA.lines.push(element);
			line.context.nodeB.lines.push(element);
			return 1;
		}
	};
	Topoly.Stage.prototype.remove = function(element)
	{
		if(element.type == "node")
		{
			if(element.id == "QWWERRDDFGGHJGUUGHJHFDGHJUUIGHGJJGHFHJGYTSDDT")return true;
			for(var i=0;i<element.lines.length;++i)
			{
				var tagNode = element===element.lines[i].nodeA?element.lines[i].nodeB:element.lines[i].nodeA;
				for(var j=0;j<tagNode.lines.length;++j)
				{
					if(element.lines[i] === tagNode.lines[j])
					{
						tagNode.lines.splice(j,1);
						break;
					}
				}
				element.lines[i].node.remove();
				delete this.alllines[element.lines[i].node.attr("id")];
			}
			delete this.allnodes[element.id+""];
		}
		else
		{
			var nodeA = element.nodeA;
			var nodeB = element.nodeB;
			for(var i=0;i<nodeA.lines.length;++i)
			{
				if(nodeA.lines[i] === element)
				{
					nodeA.lines.splice(i,1);
					break;
				}
			}
			for(var i=0;i<nodeB.lines.length;++i)
			{
				if(nodeB.lines[i] === element)
				{
					nodeB.lines.splice(i,1);
					break;
				}
			}
			delete this.alllines[element.node.attr("id")];
		}
		element.node.remove();
	};
	Topoly.Node = function(id,name,width,height,left,top,image,draggable)
	{
		this.id = id;
		this.name = name;
		this.width = width;
		this.height = height;
		this.left = left;
		this.top = top;
		this.image = image;
		this.draggable = draggable;
		this.type = "node";
		this.lines = [];
		this.events = {};
		this.selected = false;
	};
	Topoly.Node.prototype.copulation = function()
	{
		var stage = this.node.parent("svg").element;
		if(stage.line == null)
		{
			if(stage.lineType == "NormalLine")
			{
				stage.line = new Topoly.NormalLine(stage.node,this);
			}
			else if(stage.lineType == "BrokenPolyline")
			{
				stage.line = new Topoly.BrokenPolyline(stage.node,this,stage.lineDirection);
			}
			else if(stage.lineType == "SecondaryPolyline")
			{
				stage.line = new Topoly.SecondaryPolyline(stage.node,this,stage.lineDirection);
			}
			
			stage.add(stage.line,false);
			stage.line.node.attr({"opacity":"0"});
			return {status:0};
		}
		else
		{
			if(stage.line.nodeA !== this&&stage.line.nodeB !== this)
			{
				var lineType = stage.line.lineType;
				stage.line.node.remove();
				delete stage.alllines[stage.line.node.attr("id")];
				var nodeA = stage.line.nodeA===stage.node?stage.line.nodeB:stage.line.nodeA;
				var nodeB = this;
				for(var i=0;i<nodeA.lines.length;++i)
				{
					if(nodeA.lines[i] === stage.line)
					{
						nodeA.lines.splice(i,1);
						break;
					}
				}
				stage.node.lines = [];
				stage.line = null;
				
				var line;
				if(lineType == 1)
				{
					line = new Topoly.NormalLine(nodeA,nodeB);
				}
				if(lineType == 2)
				{
					line = new Topoly.BrokenPolyline(nodeA,nodeB,"horizontal");
				}
				if(lineType == 3)
				{
					line = new Topoly.BrokenPolyline(nodeA,nodeB,"vertical");
				}
				if(lineType == 4)
				{
					line = new Topoly.SecondaryPolyline(nodeA,nodeB,"horizontal");
				}
				if(lineType == 5)
				{
					line = new Topoly.SecondaryPolyline(nodeA,nodeB,"vertical");
				}
				if(stage.add(line) == -1)
				{
					return {status:-1};
				}
				return {status:1,nodes:[nodeA,nodeB]};
			}
		}
		return {status:-1};
	};
	Topoly.Node.prototype.alarming = function(level)
	{
		this.node.get(1).get(0).stop().radius(0).attr({"fill-opacity":"1"});
		this.node.get(1).get(1).stop().radius(0).attr({"fill-opacity":"1"});
		if(level == 0)
		{
			this.node.get(1).get(0).fill("none");
			this.node.get(1).get(1).fill("none");
		}
		else if(level == 1)
		{
			this.node.get(1).get(0).fill("url(#warning)").animate(1500).radius(this.width*2).attr({"fill-opacity":"0"}).loop();
			this.node.get(1).get(1).fill("url(#warning)").delay(750).animate(1500).radius(this.width*2).attr({"fill-opacity":"0"}).loop();
		}
		else if(level == 2)
		{
			this.node.get(1).get(0).fill("url(#alarming)").animate(1500).radius(this.width*2).attr({"fill-opacity":"0"}).loop();
			this.node.get(1).get(1).fill("url(#alarming)").delay(750).animate(1500).radius(this.width*2).attr({"fill-opacity":"0"}).loop();
		}
		else if(level == 3)
		{
			this.node.get(1).get(0).fill("url(#critical)").animate(1500).radius(this.width*2).attr({"fill-opacity":"0"}).loop();
			this.node.get(1).get(1).fill("url(#critical)").delay(750).animate(1500).radius(this.width*2).attr({"fill-opacity":"0"}).loop();
		}
		else
		{
			this.node.get(1).get(0).fill("url(#restore)").animate(1500).radius(this.width*2).attr({"fill-opacity":"0"}).loop();
			this.node.get(1).get(1).fill("url(#restore)").delay(750).animate(1500).radius(this.width*2).attr({"fill-opacity":"0"}).loop();
		}
	};
	Topoly.Node.prototype.bind = function(eventName,callback)
	{
		if(typeof eventName != "string"||typeof callback != "function")
		{
			alert("错误的参数!");
			return;
		}
		this.events[eventName] = callback;
	};
	Topoly.Node.prototype.attr = function(object)
	{
		if(this.node)
		{
			this.node.attr(object);
		}
	};
	Topoly.NormalLine = function(nodeA,nodeB)
	{
		this.nodeA = nodeA;
		this.nodeB = nodeB;
		this.type = "line";
		this.lineType = 1;
		this.events = {};
	};
	Topoly.NormalLine.prototype.bind = function(eventName,callback)
	{
		if(typeof eventName != "string"||typeof callback != "function")
		{
			alert("错误的参数!");
			return;
		}
		this.events[eventName] = callback;
	};
	Topoly.BrokenPolyline = function(nodeA,nodeB,direction)
	{
		this.nodeA = nodeA;
		this.nodeB = nodeB;
		this.type = "line";
		this.direction = direction;
		if(direction == "horizontal")
		{
			this.lineType = 2;
		}
		if(direction == "vertical")
		{
			this.lineType = 3;
		}
		this.events = {};
	};
	Topoly.BrokenPolyline.prototype.bind = function(eventName,callback)
	{
		if(typeof eventName != "string"||typeof callback != "function")
		{
			alert("错误的参数!");
			return;
		}
		this.events[eventName] = callback;
	};
	Topoly.SecondaryPolyline = function(nodeA,nodeB,direction)
	{
		this.nodeA = nodeA;
		this.nodeB = nodeB;
		this.type = "line";
		this.direction = direction;
		if(direction == "horizontal")
		{
			this.lineType = 4;
		}
		if(direction == "vertical")
		{
			this.lineType = 5;
		}
		this.events = {};
	};
	Topoly.SecondaryPolyline.prototype.bind = function(eventName,callback)
	{
		if(typeof eventName != "string"||typeof callback != "function")
		{
			alert("错误的参数!");
			return;
		}
		this.events[eventName] = callback;
	};
	
})(SVG);
