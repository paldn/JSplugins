# JSplugins
JavaScript插件
描述说明：该插件是基于SVGJS插件的二次开发，更多细节请见http://svgjs.com/
使用实例及功能介绍：

<script>
var stage = new Topoly.Stage("stage").init();//创建舞台,如果想使用节点连线的操作需要调用init函数

stage.setLineType("SecondaryPolyline");//默认连线类型为直连，在这里设置为二次折线，共有三种连线类型：NormalLine直连、BrokenPolyline一次折线、SecondaryPolyline二次折线
stage.setLineDirection("vertical");//默认为horizontal水平，在这里设置为vertical垂直

//参数一：节点ID、参数二：节点名称、参数三：节点宽、参数四：节点高、参数五：节点横坐标、参数六：节点纵坐标、参数七：节点背景图像、参数八：节点是否可以拖拽
var nodeA = new Topoly.Node("100","服务器",160,160,300,400,"images/cybertron/dev_topo/server.svg",true);
stage.add(nodeA);

var nodeB = new Topoly.Node("101","路由器",160,160,700,900,"images/cybertron/dev_topo/router.svg",true);
stage.add(nodeB);

var nodeC = new Topoly.Node("103","服务器",160,160,1000,1200,"images/cybertron/dev_topo/server.svg",true);
stage.add(nodeC);

var nodeD = new Topoly.Node("104","服务器",160,160,700,1600,"images/cybertron/dev_topo/server.svg",true);
stage.add(nodeD);

var nodeE = new Topoly.Node("105","路由器",160,160,500,1300,"images/cybertron/dev_topo/router.svg",true);
stage.add(nodeE);

var nodeF = new Topoly.Node("106","服务器",160,160,200,1000,"images/cybertron/dev_topo/server.svg",true);
stage.add(nodeF);


var line = new Topoly.SecondaryPolyline(nodeA,nodeB,"horizontal");//根据节点连线，颜色大小我设为默认固定，还没有提供方法设置他们
stage.add(line);

var line2 = new Topoly.BrokenPolyline(nodeB,nodeC,"horizontal");
stage.add(line2);

var line3 = new Topoly.BrokenPolyline(nodeC,nodeD,"vertical");
stage.add(line3);

var line4 = new Topoly.NormalLine(nodeD,nodeE);
stage.add(line4);

var line5 = new Topoly.SecondaryPolyline(nodeE,nodeF,"vertical");
stage.add(line5);

var nodeG = new Topoly.Node("107","服务器",160,160,1300,1200,"images/cybertron/dev_topo/server.svg",true);
stage.add(nodeG);
var nodeH = new Topoly.Node("108","服务器",160,160,1600,1700,"images/cybertron/dev_topo/server.svg",true);
stage.add(nodeH);


nodeA.bind("dblclick",function(e)
{
	this.context.copulation();//你只需要调用此方法就可以进行连线操作，具体里面如何实现，懒得废话
});

nodeB.bind("dblclick",function(e)
{
	this.context.copulation();
});

nodeC.bind("dblclick",function(e)
{
	this.context.copulation();
});

nodeD.bind("dblclick",function(e)
{
	this.context.copulation();
});

nodeE.bind("dblclick",function(e)
{
	this.context.copulation();
});

nodeF.bind("dblclick",function(e)
{
	this.context.copulation();
});

nodeG.bind("dblclick",function(e)
{
	this.context.copulation();
});

nodeH.bind("dblclick",function(e)
{
	this.context.copulation();
});

nodeA.alarming(1);//这里设置节点告警动画，1为预警，2为告警，3为危急，4为恢复，0为正常
nodeB.alarming(2);
nodeC.alarming(3);
nodeD.alarming(4);
/*
	我只实现了Topo关键部分功能，更多扩展暂不想开发，若有需求来求我呀！
*/

</script>
