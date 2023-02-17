var chartSvg, backSvg;
var lineWidth, lineHeight, lineInnerHeight, lineInnerWidth;
var lineMargin = { top: 50, right: 60, bottom: 60, left: 100 };
var global_data, country_data, attributeX, attributeY, attributeS, regionData;
var regionColors, yearLabel;
var xScale, yScale, plot, back;
// var back, plot;
const southasia = []
const northamer = []
const subafrica = []
const eastasia = []
const mideast = []
const europe = []
const latinamer = []
var regions = []
var all_regions = []
var all_region_data = []

// Play/Pause button
function playButton() {
    const currentState = d3.select('#playbutton').attr('value');
    const updatedLabel = currentState == 'Play' ? 'Pause' : 'Play';
    d3.select('#playbutton').attr('value', updatedLabel)

    drawChartAnimation(updatedLabel);
}

function resetButton(value) {
    document.getElementById('year-input').value = 1980;
    document.getElementById('playbutton').value = 'Play';
    drawBackground();
}

// select or deselect all the regions and add them to the regions array
function toggle(source) {
    checkboxes = document.getElementsByName('region');
    for (var i = 0, n = checkboxes.length; i < n; i++) {
        checkboxes[i].checked = source.checked;
    }
    regions = [];
    if (source.checked) {
        regions.push(southasia, northamer, subafrica, eastasia, mideast, europe, latinamer);
    }
    else {
        regions = [];
    }

    // drawBackground();
    drawChart();
}

// region selection and deselection
function box_toggle(source) {
    // add elements to region
    if (source.checked) {
        switch (source.value) {
            case "South Asia":
                regions.push(southasia);
                break;
            case "North America":
                regions.push(northamer);
                break;
            case "Europe & Central Asia":
                regions.push(europe);
                break;
            case "Middle East & North Africa":
                regions.push(mideast);
                break;
            case "Sub-Saharan Africa":
                regions.push(subafrica);
                break;
            case "Latin America & Caribbean":
                regions.push(latinamer);
                break;
            case "East Asia & Pacific":
                regions.push(eastasia);
                break;
        }
    }
    // remove elemenrs from region
    else {
        var index;
        switch (source.value) {
            case "South Asia":
                index = regions.indexOf(southasia);
                removeElement(index);
                break;
            case "North America":
                index = regions.indexOf(northamer);
                removeElement(index);
                break;
            case "Europe & Central Asia":
                index = regions.indexOf(europe);
                removeElement(index);
                break;
            case "Middle East & North Africa":
                index = regions.indexOf(mideast);
                removeElement(index);
                break;
            case "Sub-Saharan Africa":
                index = regions.indexOf(subafrica);
                removeElement(index);
                break;
            case "Latin America & Caribbean":
                index = regions.indexOf(latinamer);
                removeElement(index);
                break;
            case "East Asia & Pacific":
                index = regions.indexOf(eastasia);
                removeElement(index);
                break;
        }

    }
    console.log(`active regions: ${regions}`)
    drawChart();
}

// remove element from list
function removeElement(index) {
    if (index > -1) {
        regions.splice(index, 1);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    backSvg = d3.select('#background');
    chartSvg = d3.select('#chart');


    lineWidth = +backSvg.style('width').replace('px', '');
    lineHeight = +backSvg.style('height').replace('px', '');;
    lineInnerWidth = lineWidth - lineMargin.left - lineMargin.right;
    lineInnerHeight = lineHeight - lineMargin.top - lineMargin.bottom;


    // Load files
    Promise.all([d3.csv('data/countries_regions.csv'), d3.csv('data/global_development.csv')])
        .then(function (values) {
            console.log('loaded countries_regions.csv and golbal_development.csv');
            country_data = values[0];
            global_data = values[1];


            // data wrangling
            global_data.forEach(d => {
                d.year = +d["Year"];
                d.country = d["Country"];
                d.birth = +d["Data.Health.Birth Rate"];
                d.death = +d["Data.Health.Death Rate"];
                d.fertility = +d["Data.Health.Fertility Rate"];
                d.life = +d["Data.Health.Life Expectancy at Birth, Total"];
                d.population = +d["Data.Health.Total Population"];
                d.cellphones = +d["Data.Infrastructure.Mobile Cellular Subscriptions per 100 People"];
                d.telephone = +d["Data.Infrastructure.Telephone Lines"]
                d.urbanpop = +d["Data.Urban Development.Urban Population Percent"];
                d.ruralpop = +d["Data.Rural Development.Rural Population"];
            });
            country_data.forEach(d => {
                d.geo = d['geo']
                d.name = d["name"];
                d.region = d["World bank region"];
            });

            country_data.forEach(d => {
                switch (d.region) {
                    case "South Asia":
                        southasia.push(d.name);
                        break;
                    case "North America":
                        northamer.push(d.name);
                        break;
                    case "Europe & Central Asia":
                        europe.push(d.name);
                        break;
                    case "Middle East & North Africa":
                        mideast.push(d.name);
                        break;
                    case "Sub-Saharan Africa":
                        subafrica.push(d.name);
                        break;
                    case "Latin America & Caribbean":
                        latinamer.push(d.name);
                        break;
                    case "East Asia & Pacific":
                        eastasia.push(d.name);
                        break;
                }
                // add region and geo abbrev to global_data
                global_data.forEach(element => {
                    if (element.country == d.name) {
                        element.region = d.region;
                        element.geo = d.geo;
                    }
                });

            });
            console.log(global_data)
            all_regions.push(southasia, northamer, subafrica, eastasia, mideast, europe, latinamer)


            // get data for all countries that are in countries_regions.csv
            global_data.filter(function (d) {
                var data = []
                all_regions.forEach(element => {

                    if (element.includes(d.country)) {
                        const info = {
                            country: d.country, year: d.year, region: d.region, geo: d.geo,
                            "Data.Health.Birth Rate": d.birth,
                            "Data.Health.Death Rate": d.death,
                            "Data.Health.Fertility Rate": d.fertility,
                            "Data.Health.Life Expectancy at Birth, Total": d.life,
                            "Data.Health.Total Population": d.population,
                            "Data.Infrastructure.Mobile Cellular Subscriptions per 100 People": d.cellphones,
                            "Data.Infrastructure.Telephone Lines": d.telephone,
                            "Data.Rural Development.Rural Population": d.ruralpop,
                            "Data.Urban Development.Urban Population Percent": d.urbanpop
                        }
                        all_region_data.push(info)
                        data.push(info)
                    }
                });
                return data;
            });
            console.log("background() called")
            plot = chartSvg.append('g')
                .attr('transform', 'translate(' + lineMargin.left + ',' + lineMargin.top + ')');;

            drawBackground();

            // drawChart();

        });
});

function drawChart() {

    // Set color for each region
    var regionColor = {
        "North America": 'rgb(255, 99, 71)',
        "Europe & Central Asia": 'rgb(60, 179, 113)',
        "Sub-Saharan Africa": 'rgb(106, 90, 205)',
        "South Asia": 'rgb(210, 4, 45)',
        "East Asia & Pacific": 'rgb(255, 165, 0)',
        "Middle East & North Africa": 'rgb(52, 148, 180)',
        "Latin America & Caribbean": 'rgb(223, 103, 146)'
    };

    // get current year selection
    year = parseInt(d3.select('#year-input').property('value'), 10);
    console.log(year);


    // tooltip
    var hovertip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("background", "white")
        .style("padding", 3 + "px")
        .style("margin", 5 + "px")
        .style("border-radius", 5 + "px")
        .style("border", 1 + "px solid black")
        .style("font-size", 13 + "px")

    // chartSvg.select(plot).remove();


    // Plot points for selected X & Y attributes for the selected Regions

    // Subset data based on selected regions
    regionData = []
    global_data.filter(function (d) {
        regions.forEach(element => {
            if (element.includes(d.country)) {
                const info = {
                    country: d.country, year: d.year, region: d.region, geo: d.geo,
                    "Data.Health.Birth Rate": d.birth,
                    "Data.Health.Death Rate": d.death,
                    "Data.Health.Fertility Rate": d.fertility,
                    "Data.Health.Life Expectancy at Birth, Total": d.life,
                    "Data.Health.Total Population": d.population,
                    "Data.Infrastructure.Mobile Cellular Subscriptions per 100 People": d.cellphones,
                    "Data.Infrastructure.Telephone Lines": d.telephone,
                    "Data.Rural Development.Rural Population": d.ruralpop,
                    "Data.Urban Development.Urban Population Percent": d.urbanpop
                }
                regionData.push(info)
            }
        });
        // console.log(data);
        return;
    });

    // set scale for radius of circles based on Size attribute
    var rScale = d3.scaleLinear()
        .range([13, 70])
        .domain(d3.extent(regionData, d => d[attributeS]));

    // get data for selected year
    var plotData = regionData.filter(function (d) { return d["year"] == year })
    console.log("plotData");
    console.log(plotData)

    // plot the data by year
    plot.selectAll("g")
        .data(plotData, d => d.country)
        .join(
            enter => {
                const g = enter.append('g')
                    .attr('transform', d => `translate(${xScale(d[attributeX])},${yScale(d[attributeY])})`)
                g.append('circle')
                    .attr('r', 0)
                    // .attr('r', d => rScale(d[2]))
                    .style('fill', d => regionColor[d.region])
                    .style('stroke', 'white')
                    .on('mouseover', function (d, i) {
                        hovertip.html(`${d.country} <br> x:${d[attributeX].toFixed(2)} <br> y:${d[attributeY].toFixed(2)} <br> s:${d[attributeS].toFixed(2)}`)
                        hovertip.style("visibility", "visible")
                    })
                    .on('mousemove', function (d, i) {
                        hovertip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
                    })
                    .on('mouseout', function (d, i) {
                        hovertip.style("visibility", "hidden");
                    });
                // console.log('new circ')

                g.append('text')
                    .style('text-anchor', 'middle')
                    .style('alignment-baseline', 'middle')
                    .attr('font-size', 12 + 'px')
                    .attr('fill', 'white')
                    .attr('opacity', 0)
                    .text(d => d.geo);

                g.call(enter => {
                    enter.selectAll('circle')
                        .transition()
                        .duration(800)
                        .attr('r', d => rScale(d[attributeS]))
                    enter.selectAll('text')
                        .transition()
                        .delay(500)
                        .duration(500)
                        .attr('opacity', 100);
                })

            },
            update => {
                update.call(update => {
                    update.transition()
                        .duration(800)
                        .attr('transform', d => `translate(${xScale(d[attributeX])},${yScale(d[attributeY])})`);
                    update.selectAll('circle')
                        .transition()
                        .delay(500)
                        .duration(1000)
                        .attr('r', d => rScale(d[attributeS]));
                });
            },
            exit => {
                exit.call(exit => {
                    exit.transition()
                        .duration(800)
                        .style('opacity', 0)
                        .end()
                        .then(() => {
                            exit.remove();
                        });

                })
                console.log('exit');
            }
        )

    // plot.selectAll(".data-points")
    //     .data(plotData, d => d.geo)
    //     .join(
    //         enter => enterGlyphs(enter),
    //         update => updateGlyphs(update),
    //         exit => exitGLyphs(exit)
    //     )

    // function enterGlyphs(enter) {
    //     enter.append('g')
    //         .attr('transform', d => `translate(${xScale(d[attributeX])},${yScale(d[attributeY])})`)
    //         .call(g => g.select('circle').transition()
    //                     .delay(500)
    //                     .duration(1000)
    //                     .style('opacity', 1)
    //         )
    //         .call( g =>
    //             g.append('circle')
    //             .attr('r', d => rScale(d[attributeS]))
    //             .style('fill', d => regionColor[d.region])
    //             .style('stroke', 'white')
    //             .on('mouseover', function (d, i) {
    //                 hovertip.html(`${d.country} <br> x:${d[attributeX].toFixed(2)} <br> y:${d[attributeY].toFixed(2)} <br> s:${d[attributeS].toFixed(2)}`)
    //                 hovertip.style("visibility", "visible")
    //             })
    //             .on('mousemove', function (d, i) {
    //                 hovertip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
    //             })
    //             .on('mouseout', function (d, i) {
    //                 hovertip.style("visibility", "hidden");
    //             })
    //             .style('opacity', 1)
    //         )
    //         .call( g =>
    //             g.append('text')
    //             .style('text-anchor', 'middle')
    //             .style('alignment-baseline', 'middle')
    //             .attr('font-size', 12 + 'px')
    //             .attr('fill', 'white')
    //             .style('opacity', 1)
    //             .text(d => d.geo)
    //         )
    // }

    // function updateGlyphs(update){
    //     update
    //         .call( g => g
    //             .transition()
    //                 .duration(800)
    //                 .attr('transform', d => `translate(${xScale(d[attributeX])},${yScale(d[attributeY])})`)
    //         )
    //         .call(g => g.selectAll('circle')
    //             .transition()
    //             .duration(800)
    //             .attr('r', d => rScale(d[attributeS]))
    //         )
    // }

    // function exitGlyphs(exit){
    //     exit
    //      .call(g => 
    //         g.transition()
    //             .duration(800)
    //             .style('opacity',0)
    //             .remove()

    //      )
    // }


}

function drawBackground() {

    // get current year selection
    year = parseInt(d3.select('#year-input').property('value'), 10);
    console.log(year)

    // Get the 3 attribute selections
    attributeX = d3.select('#attribute-select-x').property('value');
    attributeY = d3.select('#attribute-select-y').property('value');
    attributeS = d3.select('#attribute-select-s').property('value');

    // set max for axis scales
    let max_x = d3.max(all_region_data, d => d[attributeX])
    let max_y = d3.max(all_region_data, d => d[attributeY])

    // X axis scale
    xScale = d3.scaleLinear()
        .domain([0, max_x])
        .range([0, lineInnerWidth]);
    // Y axis scale
    yScale = d3.scaleLinear()
        .domain([0, max_y])
        .range([lineInnerHeight, 0]);

    // X & Y axis
    const xAxis = d3.axisBottom(xScale)
        .tickSize(-lineInnerHeight);
    const yAxis = d3.axisLeft(yScale)
        .tickSize(-lineInnerWidth)

    backSvg.select('g').remove();
    // chartSvg.select('g').remove();

    const back = backSvg.append('g')
        .attr('transform', 'translate(' + lineMargin.left + ',' + lineMargin.top + ')');;

    // Add background lines to graph
    function customYAxis(back) {
        back.call(yAxis);
        back.select(".domain").remove();
        back.selectAll(".tick:first-of-type line")
            .attr("stroke", "lightgray")
        back.selectAll(".tick:not(:first-of-type) line")
            .attr("stroke", "lightgray")
        back.selectAll(".tick text")
            .attr("x", -10)
            .attr("dy", 3.5)
            .style("font-size", 15 + 'px')
            .style("fill", 'gray');
    }
    function customXAxis(back) {
        back.call(xAxis);
        back.style("font-size", 15 + 'px');
        back.selectAll(".tick text")
            .style('fill', 'gray')
            .attr("y", 10)
        back.selectAll(".tick:first-of-type line")
            .attr("stroke", "gray");
        back.selectAll(".tick:not(:first-of-type) line")
            .attr("stroke", "lightgray")
    }

    back.append('g').call(customYAxis)

    back.append('g').call(customXAxis)
        .attr('transform', `translate(0,${lineInnerHeight})`)

    // Y Axis Title
    back.append('text')
        .attr('class', 'axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('y', '-50px')
        .attr('x', -lineInnerHeight / 2)
        .attr('text-anchor', 'middle')
        .style("fill", 'gray')
        .style('font-size', 15 + 'px')
        .text(attributeY)
    // X Axis Title
    back.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', lineInnerWidth / 2)
        .attr('y', lineInnerHeight + 50)
        .style("fill", 'gray')
        .style('font-size', 15 + 'px')
        .text(attributeX)

    // add year text to bottom right of plot
    yearLabel = back.append('text')
        .attr('x', lineInnerWidth - 90)
        .attr('y', lineInnerHeight - 25)
        .attr('text-anchor', 'middle')
        .attr('font-size', '70px')
        .attr('fill-opacity', '0.4')
        .attr('fill', 'red')
        .text(year);



    drawChart();
}



function drawChartAnimation(updatedLabel) {
    if (updatedLabel == 'Pause') {
        var year = parseInt(d3.select('#year-input').property('value'), 10);
        console.log(year)
        var interval = 10000;
        // var count = 0;
        for (let i = year; i <= 2013; i++) {
            // console.log(i)
            document.getElementById('year-input').value = i;
            yearLabel.text(i);
            drawChart();
            // setTimeout(function () {
            //     console.log("jjjj");
            //   }, i * interval);
            // // count++;
            for(let x = 0; x < 999; x++){
                console.log(x*x*x)
            }
        }


    }

}





