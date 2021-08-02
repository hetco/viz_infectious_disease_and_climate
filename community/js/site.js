function loadData(){

	var nodesCall = $.ajax({ 
	    type: 'GET', 
	    url: 'data/nodes.json', 
	    dataType: 'json',
	});

	var linksCall = $.ajax({ 
	    type: 'GET', 
	    url: 'data/links.json', 
	    dataType: 'json',
	});

	$.when(nodesCall,linksCall).then(function(nodesArgs,linksArgs){
		initDash(nodesArgs[0],linksArgs[0]);
	});
}

function nodeSizeCalc(links,nodes){
	nodeSize = []
	i = 0
	for(node in nodes){
		nodeSize[i] = 0;
		i++
	}

	links.forEach(function(link){
		nodeSize[link.source]++
		nodeSize[link.target]++
	});
	console.log(nodeSize);
	return nodeSize
}


function initDash(nodes,links){

var nodeSize = nodeSizeCalc(links,nodes);

var width = $(window).width(),
	    height = $(window).height()

var zoom = d3.behavior.zoom()
    .scaleExtent([0.1, 10])
    .on("zoom", zoomed);

var drag = d3.behavior.drag()
    .origin(function(d) { return d; })
    .on("dragstart", dragstarted)
    .on("drag", dragged)
    .on("dragend", dragended);

	var svg = d3.select("#map").append("svg")
	    .attr("width", width)
	    .attr("height", height)
	    .call(zoom);

	var force = d3.layout.force()
	    .gravity(0.05)
	    .distance(100)
	    .charge(-200)
	    .size([width, height]);

	force
	    .nodes(nodes)
	    .links(links)
	    .start();

	var container = svg.append("g");

	var link = container.selectAll(".link")
	    .data(links)
	    .enter().append("line")
	    .attr("class", "link")
	    .style("stroke",'black')
	    .style("stroke-width",function(d){
	    	return d['strength']/5;
	    });

	var node = container.selectAll(".node")
	    .data(nodes)
	    .enter().append("circle")
	    .attr("r", function(d,i) {
	    	if(nodeSize[i]>0){
	    		return nodeSize[i]+4;
	    	} else {
	    		return 0
	    	}
	    	
	    })
	    .attr("fill",function(d){
	        return colours[d.continent]
	    })
	    .style("stroke",'black')
	    .style("stroke-width",1)
	    .call(force.drag);

    node.on('mouseover',function(d){
        setInfo('<p>' + d.institute_name + '</p><p>' + d.score + '</p>');
    });

    node.on('mouseout',function(d){
      setInfo('');
    });
    

	force.on("tick", function() {
		link.attr("x1", function(d) { return d.source.x; })
		    .attr("y1", function(d) { return d.source.y; })
		    .attr("x2", function(d) { return d.target.x; })
		    .attr("y2", function(d) { return d.target.y; });

		node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	});

	function zoomed() {
		console.log(dragging);
		if(!dragging){
			container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
		}
	  
	}

	function dragstarted(d) {
	  d3.event.sourceEvent.stopPropagation();
	  d3.select(this).classed("dragging", true);
	  dragging = true;
	  console.log('here');
	}

	function dragged(d) {
	  d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
	  console.log('here');
	}

	function dragended(d) {
	  d3.select(this).classed("dragging", false);
	  dragging = false;
	}
}

function setInfo(text){
	if(text==''){
	    $('#info_overlay').html('Hover a node for more information');
	} else {
	    $('#info_overlay').html(text);
	}
}

let colours = {
	"Arab States":'#6200EA',
	"Asia & Pacific":'#2962FF',
	"South/Latin America":'#FFAB00',
	"North America":'#5D4037',
	"Africa":'#DD2C00',
	"Europe":'#00C853',
	"":'#777777'
}

let dragging = false;

loadData()