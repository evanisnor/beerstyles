var margin = 10,
	viewWidth = $('#content').width(),
	viewHeight = $('#content').height(),
    outerDiameter = viewHeight,
    innerDiameter = outerDiameter - margin - margin;

var x = d3.scale.linear()
    .range([0, innerDiameter]);

var y = d3.scale.linear()
    .range([0, innerDiameter]);

var pack = d3.layout.pack()
	.padding(2)
	.size([innerDiameter, innerDiameter])
	.children(function(d) {
		return d.varieties;
	})
	.value(function(d) {
		if (d.varieties) {
			return x(d.varieties.length);
		}
		return x(0.5);
	});

var svg = d3.select('svg#infographic')
	.attr('width', viewWidth + 'px')
	.attr('height', viewHeight + 'px')
	.append('g')
		.attr('transform', 'translate(' + (viewWidth / 4) + ',' + margin + ')')
		.append('g');

var defs = svg.append("defs");

d3.json('beerstyles.json', function(error, root) {
	var focus = root;
	var nodes = pack.nodes(root);


	var zoom = function(d, i) {
		focus = d;
		console.log('zoom: ', d)

		var k = innerDiameter / d.r / 2;
		x.domain([d.x - d.r, d.x + d.r]);
		y.domain([d.y - d.r, d.y + d.r]);
		d3.event.stopPropagation();


	    d3.selectAll("circle").transition()
		    .duration(d3.event.altKey ? 7500 : 750)
		    .attr("transform", function(d) {
		    	return "translate(" + x(d.x) + "," + y(d.y) + ")";
		    })
	        .attr("r", function(d) {
	        	return k * d.r;
	        })
	        .style("opacity", function(d) {
		        return d === focus.parent || d === focus || d.parent === focus || (focus.parent && d === focus.parent.parent) ? 1 : 0;
	        });

	    d3.selectAll(document.getElementsByTagName("foreignObject")).transition()
		    .duration(d3.event.altKey ? 7500 : 750)
		    .attr('width', function(d) {
				return (d.r * k * 2) + 'px';
			})
			.attr('height', function(d) {
				return (d.r * k * 2) + 'px';
			})
		    .attr("transform", function(d) {
		    	return "translate(" + x(d.x - d.r) + "," + y(d.y - d.r) + ")";
		    })
	        .style("opacity", function(d) {
	        	return d.parent === focus ? '1' : '0';
	        })
	        .selectAll('div')
				.style('width', function(d) {
					return (d.r * k * 2) + 'px';
				})
				.style('height', function(d) {
					return (d.r * k * 2) + 'px';
				});

        d3.selectAll("image").transition()
	    	.duration(d3.event.altKey ? 7500 : 750)
	        .attr("width", function(d) {
	        	return ((k * 2) * d.r) + 'px';
	        })
	        .attr("height", function(d) {
	        	return ((k * 2) * d.r) + 'px';
	        });

	};

	svg.selectAll('circle').data(nodes)
		.enter().append('circle')
		.attr('transform', function(d) {
			return 'translate(' + d.x + ',' + d.y + ')';
		})
		.attr('r', function(d) {
			return d.r;
		})
		.attr('fill', function(d) {
			var http = new XMLHttpRequest();
		    http.open('HEAD', 'images/' + d.id + '.jpg', false);
		    http.send();
		    
			if (http.status!=404) {
				return 'url(#' + d.id + ')';
			}
			return 'url(#unknown)';
		})
        .style("opacity", function(d) {
		    return d === focus.parent || d === focus || d.parent === focus || (focus.parent && d === focus.parent.parent) ? 1 : 0;
        })
		.on('click', function(d) {
			
			var findFocus = function(p) {
				if (p.parent === focus || focus.parent == p || !p.parent) {
					// zoom(p)
				}
				else {
					findFocus(p.parent);
				}
			}

			findFocus(d);
		});


	defs.selectAll('pattern').data(nodes).enter()
		.append('pattern')
		.attr('id', function(d) {
			return d.id;
		})
    	.attr('patternUnits', 'objectBoundingBox')
    	.attr('preserveAspectRatio', 'true') 
	    .attr("width", '1')
	    .attr("height", '1').append('image')
            .attr('xlink:href', function(d) {
            	return 'images/' + d.id + '.jpg';
            })
		    .attr("width", function(d) {
		    	return d.r * 2;
		    })
		    .attr("height", function(d) {
		    	return d.r * 2;
		    });

	svg.selectAll('foreignObject').data(nodes)
		.enter().append('foreignObject')
		.attr('width', function(d) {
			return d.r * 2 + 'px';
		})
		.attr('height', function(d) {
			return d.r * 2 + 'px';
		})
		.attr('transform', function(d) {
			return 'translate(' + (d.x - d.r) + ',' + (d.y - d.r) + ')';
		})
        .style("opacity", function(d) {
	        return d.parent === focus ? '1' : '0';
        })
		.on('click', function(d) {
			
			var findFocus = function(p) {
				if (p.parent === focus || focus.parent == p || !p.parent) {
					zoom(p)
				}
				else {
					findFocus(p.parent);
				}
			}

			findFocus(d);
		})
        .append('xhtml:div')
        	.attr('class', 'labelContainer')
			.style('width', function(d) {
				return (d.r * 2) + 'px';
			})
			.style('height', function(d) {
				return (d.r * 2) + 'px';
			})
	        .append("xhtml:p")
        		.attr('class', 'label')
				.html(function(d) {
					return d.label;
				});

	d3.select(window).on('click', function() {
		console.log('window selected');
		zoom(root);
	});

});