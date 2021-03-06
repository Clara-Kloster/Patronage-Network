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
        
        var info = d3.select("#info");
        rinfo = info.append("div")
                    .append("p");
        
        linfo = info.append("div");
            
        var table = d3.select("#table")
                    .append("table");

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
        
        // Draw table
        var trow = table.selectAll("tr")
                .data(nodes)
                .enter()
                .append("tr")
                .on("click", function(d){focusCluster(d,  node.filter(function(p){return d.id==p.id}))});
        
        trow.append("td")
            .text(function(d){return d.id});
                        
        trow.append("td")
            .text(function(d){return d.name});

        trow.append("td")
            .text(function(d){return d.documents});

        trow.append("td")
            .text(function(d){return d.date_range});

        trow.append("td")
            .text(function(d){return d.betweenness});
            
        trow.append("td")
            .text(function(d){return d.degree});
            
            
        function focusCluster(c, focusNode, updateInfo=true) {

            // Unhover all previosuly selected edges and nodes
            focusEdge = d3.selectAll(".hovered");
            focusEdge.lower()
            focusEdge.attr("class", "")
            
            // Array over connected nodes
            var lnodes = [];

            // Hover edge
            var focusEdge = edge.filter(function(d) {
                if (d.target.id==c.id){
                    lnodes.push(d.source)
                    return true
                }
                else if (d.source.id==c.id){
                    lnodes.push(d.target)
                    return true
                }})
            
            focusEdge.attr("class", "hovered")
            focusEdge.raise()
            
            // Hover node
            focusNode.select("circle").attr("class", "hovered");
            focusNode.raise()

            // Selection over connected nodes
            var lnodes = node.filter(function(d){return lnodes.map(function(p){return p.id}).includes(d.id)});
            lnodes.select("circle").attr("class", "hovered secondary")
            lnodes.raise()

            // Update info box
            if (updateInfo) {
                rinfo.text(c.name)

                var lnodes_p = linfo.selectAll("div")
                    .data(lnodes.data(), function(d){return d.id});
                
                lnodes_p.exit()
                    .remove();
                
                lnodes_p.enter()
                    .append("div")
                    .text(function(d){return d.name})
                    .on("click", function(d){
                        focusCluster(d, node.filter(function(p){return d.id==p.id}), updateInfo=false);
                    });
            }
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