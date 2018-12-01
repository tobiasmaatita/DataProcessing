// Tobias Maätita (10730109)
// DataProcessing Fall 2018
// D3 Scatterplot


window.onload = function() {
  var consumers = "https://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.COCONF+UNEMPRATE.A/all?startTime=2007&endTime=2015"
  var request = [d3.json(consumers)]

  Promise.all(request).then(function(response){
    var data = transformResponse(response[0])

    // countries and years set
    var countries = new Set();
    var years = new Set();
    for (var i = 0; i < Object.keys(data).length; i++) {
      countries.add(data[i]['Country']);
      years.add(data[i]['time']);
    }

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
    console.log(info2007);

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

    var svg = d3.select('#leftCol').append('svg')
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

    var colors = ['#c51b7d','#e9a3c9','#fde0ef','#e6f5d0','#a1d76a','#4d9221'];

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
       .attr('r', 5)
       .attr('fill', function(d,i){
         return colors[i];
       })
       .attr('data-legend', function(d,i){
         return countries[i];
       });

    svg.append('g')
        .attr('class', 'xAxis')
        .attr('transform', 'translate(0,' + (svgHeight - xAxisBuffer) + ')')
        .call(xAxis)
        // .selectAll('text')
        //    .style('text-anchor', 'end')
        //    .attr('dx', '-.8em')
        //    .attr('dy', '.15em')
        //    .attr('transform', 'rotate(-65)');

    svg.append('g')
        .attr('class', 'yAxis')
        .attr('transform', 'translate(' + leftBuffer + ',0)')
        .call(yAxis);

    // sampleCategoricalData = ["Something","Something Else", "Another", "This", "That", "Etc"]
    // colorscales = d3.scaleOrdinal(d3.schemeCategory20).domain(sampleCategoricalData);
    //
    // legend = svg.append('g')
    //             .attr('class', 'legend')
    //             .call(d3.legend)


    // d3.select("svg").append("g").attr("transform", "translate(50,140)").attr("class", "legend").call(verticalLegend);

    // // axis labels
    // svg.append('text')
    //     // .text('Team')
    //     .attr('class', 'label')
    //     .attr('x', (svgWidth + leftBuffer - rightBuffer) / 2)
    //     .attr('y', svgHeight - yTextBuffer);





  });
};


function transformResponse(data){

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
