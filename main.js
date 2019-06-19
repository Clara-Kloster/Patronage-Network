d3.json("../assets/centrality_graph.json").then(function(data) {

        
        var width = 1000, height = 750;
        var r = 2.5;
        
        //assign node and edge data to variables
        var nodes = data["nodes"];
        var links = data["links"];
        
        // find avg degree score for nodes in graph
        var degAvg = nodes.map(function(d) {return d.degree}).reduce(function(a,b) {return a+b}) / nodes.length;

        // force simulation for visualizing the graph
        var simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(function(d) {return d.id;}))
            .force("charge", d3.forceManyBody().strength(function(d){return (degAvg - d["degree"])/9;}))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide(2.5))
            .on("tick", ticked);
        
        var graph = d3.select("#graph")
                      .append("svg")
                      .attr("width", width)
                      .attr("height", height);

        var edge = graph.selectAll(".link")
                        .data(links)
                        .enter()
                        .append("line")
                        .attr("id", function(d){return d.id});

        var node = graph.selectAll(".node")
                         .data(nodes)
                         .enter()
                         .append("g")
                         .attr("id", function(d){return d.id})
                         .on("click", function(d){
                            focusCluster(d, d3.select(this))
                         });

        var circle = node.append("circle")
                           .attr("r", r);
        

        /*
        var names = node.append("text")
                        .attr("dy", "0.2em")
                        .text(function(d){return d.name;});
        */


        function focusCluster(c, focusNode) {

            // Unhover all previosuly selected edges and nodes
            focusEdge = d3.selectAll(".hovered");
            focusEdge.lower()
            focusEdge.attr("class", "")
            
            // Hover edge
            var focusEdge = edge.filter(function(d) {return d.target.id==c.id || d.source.id==c.id})
            focusEdge.attr("class", "hovered")
            focusEdge.raise()

            // Hover node
            focusNode.select("circle").attr("class", "hovered");
            focusNode.raise()
        }        
                
        // function for the simulation, appends all nodes
        function ticked() {
            edge.attr("x1", function(d) {return d.source.x;})
                .attr("y1", function(d) {return d.source.y;})
                .attr("x2", function(d) {return d.target.x;})
                .attr("y2", function(d) {return d.target.y;});
            

            circle.attr("cx", function(d) {return d.x = Math.max(r, Math.min(width - r, d.x));})
                  .attr("cy", function(d) {return d.y = Math.max(r, Math.min(height - r, d.y));})
                  .on("click", function(d){console.log(d.name)});
                

            /*
            names.attr("x", function(d) {return d.x;})
                 .attr("y", function(d) {return d.y;})
            */
        };
        
        // state the number of nodes in a new <p>
        d3.select("#graph")
            .append("p")
                .text(function() { 
                    return "There are " + Object.keys(data["nodes"]).length + " nodes." 
                });
        
        // state the number of edges in a new <p>
        d3.select("#graph")
            .append("p")
                .text(function() { 
                    return "There are " + Object.keys(data["links"]).length + " edges." 
                });
        
        // style the <p> elements
        d3.select("#graph")
            .selectAll("p")
                .style('font-size', '20px');
    });