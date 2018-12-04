// Tobias Maätita (10730109)
// DataProcessing Fall 2018
// D3 Scatterplot


window.onload = function() {
  var consumers = "https://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR+ITA+ESP+DNK+BEL+SWE+JPN.COCONF+UNEMPRATE.A/all?startTime=2007&endTime=2015"
  var request = [d3.json(consumers)]

  Promise.all(request).then(function(response){
    var data = transformResponse(response[0]);

    var options = ['2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015'];
    var xAxislabel = '2007'
    var rightCol = d3.select('#rightCol');
    var leftCol = d3.select('#leftCol');

    var ul = leftCol.append('ul').attr('id', 'menu')

    // countries and years set
    var countries = new Set();
    var years = new Set();
    for (var i = 0; i < Object.keys(data).length; i++) {
      countries.add(data[i]['Country']);
      years.add(data[i]['time']);
    }

    d3.select('#menu')
    .selectAll('li')
    .data(options)
    .enter()
    .append('li')
    .text(function(d) {return d;})
    .classed('selected', function(d) {
      return d === xAxislabel;
    })
    .on('click', function(d) {
      xAxis = d;
      updateChart();
      updateMenus();
    });

    // arrays for iteration
    countries = Array.from(countries);
    years = Array.from(years);

    allData = [];

    // keys are years
    for (var k = 0; k < years.length; k++)
    {

      var key = years[k]
      allData.push({key: key, value: []})

      for (var i = 0; i < Object.keys(data).length; i++)
      {
        // unemployment rate
        if (data[i]['time'] == key && data[i]['Indicator'] == 'Unemployment rate')
        {
          for (var j = 0; j < Object.keys(data).length; j++)
          {
            // consumer confidence
            if (data[j]['Country'] == data[i]['Country'] && data[j]['time'] == key && data[j]['Indicator'] == 'Consumer confidence')
            {
              allData[k].value.push({name: data[i]['Country'], unemp: data[i]['datapoint'], conf: data[j]['datapoint']});
            };
          };
        };
      };
    };

    var allInfo = [];

    for (var i = 0; i < years.length; i++)
    {
      var yearInfo = [];
      var year = years[i];

      for (var j = 0; j < countries.length; j++)
      {
        var country = countries[j];
        var countryInfo = []
        countryInfo.push(allData[i].value[j].unemp)
        countryInfo.push(allData[i].value[j].conf)
        yearInfo.push(countryInfo)
      }
      allInfo.push(yearInfo)
    }

    var info2007 = allInfo[0];
    console.log(allInfo);

    var unemp = [];
    var conf = [];
    for (var i = 0; i < info2007.length; i++){
      unemp.push(info2007[i][0])
      conf.push(info2007[i][1])
    }
    var maxUnemp = d3.max(unemp);
    var maxConf = d3.max(conf);
    var minConf = d3.min(conf);

    // svg element
    var svgWidth = 800;
    var svgHeight = 500;

    var leftBuffer = 80;
    var rightBuffer = 50;
    var topBuffer = 50;

    var xAxisBuffer = 100;
    var xTextBuffer = 45;
    var yTextBuffer = 15;

    var svg = d3.select('#rightCol').append('svg')
                .attr('width', svgWidth)
                .attr('height', svgHeight)
                .attr('class', 'scatter');

    // scales and axes
    var yScale = d3.scaleLinear()
                 .domain([0, 20])
                 .range([svgHeight - xAxisBuffer,topBuffer]);

    var xScale = d3.scaleLinear()
                 .domain([minConf - 1, maxConf + 1])
                 .range([leftBuffer, svgWidth-rightBuffer]);

    var xTickScale = d3.scaleLinear()
                    .domain([minConf - 1, maxConf + 1])
                    .range([leftBuffer, svgWidth - rightBuffer]);

    var xAxis = d3.axisBottom()
                .ticks(4)
                .scale(xTickScale);

    var yAxis = d3.axisLeft()
               .scale(yScale);

    var colors = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928']
    var colorscheme = d3.scaleOrdinal(d3.schemeCategory20).domain(countries.length)
    console.log(colorscheme);

    svg.selectAll('circle')
       .data(info2007)
       .enter()
       .append('circle')
       .attr('cx', function(d){
         console.log(xScale(d[1]))
         return xScale(d[1]);
       })
       .attr('cy', function(d){
         return yScale(d[0]);
       })
       .attr('r', 7)
       .attr('fill', function(d,i){
         return colorscheme[i];
       })
       .attr('data-legend', function(d,i){
         return countries[i];
       });

    svg.append('g')
        .attr('class', 'xAxis')
        .attr('transform', 'translate(0,' + (svgHeight - xAxisBuffer) + ')')
        .call(xAxis)

    svg.append('g')
        .attr('class', 'yAxis')
        .attr('transform', 'translate(' + leftBuffer + ',0)')
        .call(yAxis);

    // axis labels
    svg.append('text')
        .text('Consumer confidence rate')
        .attr('text-anchor', 'middle')
        .attr('class', 'label')
        .attr('x',  (svgWidth + leftBuffer - rightBuffer)/2)
        .attr('y', svgHeight - yTextBuffer);

    svg.append('text')
         .text('Unemployment rate')
         .attr('text-anchor', 'middle')
         .attr('class', 'label')
         .attr('x', -(svgHeight-topBuffer)/2)
         .attr('y', leftBuffer - xTextBuffer)
         .attr('transform', 'rotate(-90)');


    // sampleCategoricalData = ["Something","Something Else", "Another", "This", "That", "Etc"]
    // colorscales = d3.scaleOrdinal(d3.schemeCategory20).domain(sampleCategoricalData);
    //
    // legend = svg.append('g')
    //             .attr('class', 'legend')
    //             .call(d3.legend)


    // d3.select("svg").append("g").attr("transform", "translate(50,140)").attr("class", "legend").call(verticalLegend);




    function updateChart(init) {
    // based on https://charts.animateddata.co.uk/whatmakesushappy/
        // updateScales();

        d3.select('svg g.chart')
          .selectAll('circle')
          .transition()
          .duration(500)
          .ease('quad-out')
          .attr('cx', function(d) { // d is het jaartal, get allinfo[d-firstyear][1]
            return isNaN(d[xAxis]) ? d3.select(this).attr('cx') : xScale(d[xAxis]);
          })
          .attr('cy', function(d) { // d is het jaartal, get allinfo[d-firstyear][0]
            return isNaN(d[yAxis]) ? d3.select(this).attr('cy') : yScale(d[yAxis]);
          })
          .attr('r', function(d) { // r is 5
            return isNaN(d[xAxis]) || isNaN(d[yAxis]) ? 0 : 12;
          });

        // Also update the axes
        d3.select('#xAxis')
          .transition()
          .call(makeXAxis);

        d3.select('#yAxis')
          .transition()
          .call(makeYAxis);

        // Update axis labels
        d3.select('#xLabel')
          .text(descriptions[xAxis]);

        // Update correlation
        var xArray = _.map(data, function(d) {return d[xAxis];});
        var yArray = _.map(data, function(d) {return d[yAxis];});
        var c = getCorrelation(xArray, yArray);
        var x1 = xScale.domain()[0], y1 = c.m * x1 + c.b;
        var x2 = xScale.domain()[1], y2 = c.m * x2 + c.b;

        // Fade in
        d3.select('#bestfit')
          .style('opacity', 0)
          .attr({'x1': xScale(x1), 'y1': yScale(y1), 'x2': xScale(x2), 'y2': yScale(y2)})
          .transition()
          .duration(1500)
          .style('opacity', 1);
      }

      function updateScales() {
        xScale = d3.scale.linear()
                        .domain([bounds[xAxis].min, bounds[xAxis].max])
                        .range([20, 780]);

        yScale = d3.scale.linear()
                        .domain([bounds[yAxis].min, bounds[yAxis].max])
                        .range([600, 100]);
      }

      // function makeXAxis(s) {
      //   s.call(d3.svg.axis()
      //     .scale(xScale)
      //     .orient("bottom"));
      // }
      //
      // function makeYAxis(s) {
      //   s.call(d3.svg.axis()
      //     .scale(yScale)
      //     .orient("left"));
      // }

      function updateMenus() {
        d3.select('#x-axis-menu')
          .selectAll('li')
          .classed('selected', function(d) {
            return d === xAxis;
          });
        d3.select('#y-axis-menu')
          .selectAll('li')
          .classed('selected', function(d) {
            return d === yAxis;
        });
      }

  });
};


function transformResponse(data){
// Transform data from site to usable array. From https://data.mprog.nl/course/10%20Homework/100%20D3%20Scatterplot/scripts/transformResponseV1.js


    // access data property of the response
    let dataHere = data.dataSets[0].series;

    // access variables in the response and save length for later
    let series = data.structure.dimensions.series;
    let seriesLength = series.length;

    // set up array of variables and array of lengths
    let varArray = [];
    let lenArray = [];

    series.forEach(function(serie){
        varArray.push(serie);
        lenArray.push(serie.values.length);
    });

    // get the time periods in the dataset
    let observation = data.structure.dimensions.observation[0];

    // add time periods to the variables, but since it's not included in the
    // 0:0:0 format it's not included in the array of lengths
    varArray.push(observation);

    // create array with all possible combinations of the 0:0:0 format
    let strings = Object.keys(dataHere);

    // set up output array, an array of objects, each containing a single datapoint
    // and the descriptors for that datapoint
    let dataArray = [];

    // for each string that we created
    strings.forEach(function(string){
        // for each observation and its index
        observation.values.forEach(function(obs, index){
            let data = dataHere[string].observations[index];
            if (data != undefined){

                // set up temporary object
                let tempObj = {};

                let tempString = string.split(":").slice(0, -1);
                tempString.forEach(function(s, indexi){
                    tempObj[varArray[indexi].name] = varArray[indexi].values[s].name;
                });

                // every datapoint has a time and ofcourse a datapoint
                tempObj["time"] = obs.name;
                tempObj["datapoint"] = data[0];
                dataArray.push(tempObj);
            }
        });
    });

    // return the finished product!
    return dataArray;
}
