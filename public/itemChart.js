var ItemChart = (function (d3, $) {
    return function createRowChart(bardata, table) {
//        $("#chart").html('');
        bardata = bardata.map(function(r) {
            r.onHand = Number(r.onHand);
            r.date = new Date(r.date);
            return r;
        });


        var margin = { top: 30, right: 30, bottom: 40, left:50 };

        var height = 300 - margin.top - margin.bottom,
            width = 785 - margin.left - margin.right,
            barWidth = 50,
            barOffset = 5;

        var tempColor;

        var colorScale = d3.scale.linear()
                .domain([0, d3.max(bardata, function(d) {
                    return d.onHand; 
                })])
                .range([
                    '#dc3338',
                    '#88cc37'
                ]);
        var yScale = d3.scale.linear()
                .domain([0, d3.max(bardata, function(d) {
                    return d.onHand;
                })])
                .range([0, height]);



        var xScale = d3.scale.ordinal()
                .domain(d3.range(0, bardata.length))
                .rangeBands([0, width], 0.2);
        $("#chart_tooltip").remove();
        var tooltip = d3.select('body').append('div')
                .attr('id', 'chart_tooltip')
                .style('position', 'absolute')
                .style('padding', '0 10px')
                .style('background', 'white')
                .style('opacity', 0);

        var myChart = d3.select('#supplement_history_graph').append('svg')
            .style('background', '#E7E0CB')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate('+ margin.left +', '+ margin.top +')')
            .selectAll('rect').data(bardata)
            .enter().append('rect')
                .style('fill', function(d,i) {
                    return "#333";
                    //return colorScale(d.onHand);
                })
                .attr('width', xScale.rangeBand())
                .attr('x', function(d,i) {
                    return xScale(i);
                })
                .attr('height', 0)
                .attr('y', height)

            .on('mouseover', function(d) {
                console.log(d3.event.pageX);

                tooltip.transition()
                    .style('opacity', 0.9);
                tooltip.html(d.displayDate)
                    .style('left', (d3.event.pageX - 35) + 'px')
                    .style('top',  (d3.event.pageY - 30) + 'px');


                tempColor = this.style.fill;
                d3.select(this)
                    .style('opacity', 0.5)
                    .style('fill', 'yellow');
            })

            .on('mouseout', function(d) {
                tooltip.transition()
                    .style('opacity', 0);
                d3.select(this)
                    .style('opacity', 1)
                    .style('fill', tempColor);
            })
            .on('click', function (d, i) {
                console.log(d, i);
                table.displayRow(i);
            });

        myChart.attr('height', function(d) {
                var ys = (d.onHand >= 0)? d.onHand: 0;
                return yScale(ys);
            })
            .attr('y', function(d) {
                return height - yScale(d.onHand);
            });

        var vGuideScale = d3.scale.linear()
            .domain([0, d3.max(bardata, function(d) {
                return d.onHand; 
            })])
            .range([height, 0]);

        var vAxis = d3.svg.axis()
            .scale(vGuideScale)
            .orient('left')
            .ticks(10);

        var vGuide = d3.select('svg').append('g');
            vAxis(vGuide);
            vGuide.attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');
            vGuide.selectAll('path')
                .style({ fill: 'none', stroke: "#000"});
            vGuide.selectAll('line')
                .style({ stroke: "#000"});
    var hAxisLabelIndexes = [];
    var hAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        // .tickValues(xScale.domain().filter(function(d, i) {
        //     var space = i % Math.round((bardata.length / 5));
        //     return !space;
        // }))
        .tickFormat(function(d, i){
            var space = i % Math.round((bardata.length / 5));
            if (!space) {
                //hAxisLabelIndexes.push(i);
                return bardata[i].date.toString("MMM-dd-yyyy");
            }
            return "";
        });
    console.log(hAxisLabelIndexes);
    var hGuide = d3.select('svg').append('g');
    hAxis(hGuide);
    hGuide.attr('transform', 'translate(' + margin.left + ', ' + (height + margin.top) + ')');
    hGuide.selectAll('path')
        .style({ fill: 'none', stroke: "#000"});
    hGuide.selectAll('line')
        .style({ stroke: "#000"});
    };
}(d3, window.jQuery));
