// Tobias Maätita (10730109)
// DataProcessing Fall 2018
// D3 Scatterplot


window.onload = function() {
  var consumers = "https://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR+ITA+ESP+DNK+BEL+SWE+JPN.COCONF+UNEMPRATE.A/all?startTime=2007&endTime=2015"
  var request = [d3.json(consumers)]

  Promise.all(request).then(function(response){
    var data = transformResponse(response[0]);
    var parsed = parseData(data);
    var allInfo = parsed[0];
    var countries = parsed[1];

    var options = ['2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015'];
    var firstYear = options[0]
    var xAxisLabel = '2007'
    // var right = d3.select('#right');
    var wrapper = d3.select('.wrapper');
    var ul = wrapper.append('ul').attr('id', 'menu')

    // svg element
    var svgWidth = 1000;
    var svgHeight = 575;

    var leftBuffer = 80;
    var rightBuffer = 50;
    var topBuffer = 30;

    var xAxisBuffer = 100;
    var xTextBuffer = 35;
    var yTextBuffer = 35;
    var titleBuffer = 45;

    var svg = d3.select('.wrapper').append('svg')
                .attr('width', svgWidth)
                .attr('height', svgHeight)
                .attr('class', 'scatter')
                .attr('id', 'chart');

    // add menu
    d3.select('#menu')
    .selectAll('li')
    .data(options)
    .enter()
    .append('li')
    .text(function(d) {return d;})
    .classed('selected', function(d) {
      return d === xAxisLabel;
    })
    .on('click', function(d) {
      updateChart(d);
      updateMenus(d);
    });

    wrapper.append('div').attr('id', 'menuTitle').text('Pick a year:');
    wrapper.append('div').attr('id', 'text');
    wrapper.append('div').attr('id', 'title');
    d3.select('#text').append('p').append('strong').attr('id', 'textTitle').text("D3 Scatterplot");
    d3.selectAll('#text').append('p').attr('id', 'about').text("This scatterplot shows the relation \
    between the consumer confidence index and the unemployment rate in twelve different countries. \
    The consumer confidence index measures the degree of optimism expressed through the spending and \
    saving activities of a country's customers. The unemployment rate shows the unemployed percentage \
    of a country's population. From the menu above, you can pick a year to further inspect. \
    Hover over one of the dots to find out which country it represents.");

    d3.select('#title').append('h1').text('Correlation between unemployment rate and consumer confidence\
    , 2007-2017');

    firstScatter(allInfo)


    function parseData(data) {
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
      return [allInfo, countries];
    }


    function firstData(allInfo) {
      var info = allInfo[0];
      var unemp = [];
      var conf = [];
      for (var i = 0; i < info.length; i++){
        unemp.push(info[i][0]);
        conf.push(info[i][1]);
      }
      var maxUnemp = d3.max(unemp);
      var maxConf = d3.max(conf);
      var minConf = d3.min(conf);

      return [info, maxUnemp, maxConf, minConf];
    }


    function firstScatter(allInfo){

      var info = firstData(allInfo);
      var infoYear = info[0]
      var maxUnemp = info[1];
      var maxConf = info[2];
      var minConf = info[3];

      // scales and axes
      var yScale = d3.scaleLinear()
                   .domain([0, maxUnemp + 3])
                   .range([svgHeight - xAxisBuffer, topBuffer]);

      var xScale = d3.scaleLinear()
                   .domain([minConf - 1, maxConf + 1])
                   .range([leftBuffer, svgWidth-rightBuffer]);

      var xTickScale = d3.scaleLinear()
                      .domain([minConf - 1, maxConf + 1])
                      .range([leftBuffer, svgWidth - rightBuffer]);

      var xAxis = d3.axisBottom()
                  .ticks(5)
                  .scale(xTickScale);

      var yAxis = d3.axisLeft()
                 .scale(yScale);

      // function make svg
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
          .text('Consumer confidence index')
          .attr('text-anchor', 'middle')
          .attr('class', 'label')
          .attr('x',  (svgWidth + leftBuffer - rightBuffer)/2)
          .attr('y', svgHeight - yTextBuffer);

      svg.append('text')
           .text('Unemployment rate (%)')
           .attr('text-anchor', 'middle')
           .attr('class', 'label')
           .attr('x', -(svgHeight)/2 + leftBuffer - rightBuffer)
           .attr('y', leftBuffer - xTextBuffer)
           .attr('transform', 'rotate(-90)');

      svg.append('text')
           .text('2007')
           .attr('text-anchor', 'middle')
           .attr('class', 'graphTitle')
           .attr('id', 'sub')
           .attr('x', (svgWidth + leftBuffer - rightBuffer)/2)
           .attr('y', topBuffer)

      svg.append('text')
           .attr('id', 'country')
           .attr('x', leftBuffer + yTextBuffer)
           .attr('y', topBuffer + 100)
           .attr('font-size', '100px')
           .attr('fill', '#dddd')


      var colors = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928']


      // mouseover and mouseout from www.charts.animateddata.co.uk/whatmakesushappy/
      svg.selectAll('circle')
         .data(infoYear)
         .enter()
         .append('circle')
         .attr('cx', function(d){
           return xScale(d[1]);
         })
         .attr('cy', function(d){
           return yScale(d[0]);
         })
         .attr('r', 7)
         .attr('fill', function(d,i){
           return colors[i];
         })
         .attr('data-legend', function(d,i){
           return countries[i];
         })
         .attr('cursor', 'pointer')
         .on('mouseover', function(d, i) {
            d3.select('#country')
              .text(countries[i])
              .transition()
              .style('opacity', 1);
         })
         .on('mouseout', function(d, i){
           d3.select('#country')
             .transition()
             .duration(1000)
             .style('opacity', 0);
         });
    }


    function updateAxes(year, maxUnemp, maxConf, minConf){

      // scales and axes
      var yScale = d3.scaleLinear()
                   .domain([0, maxUnemp + 3])
                   .range([svgHeight - xAxisBuffer,topBuffer]);

      var xScale = d3.scaleLinear()
                   .domain([minConf - 1, maxConf + 1])
                   .range([leftBuffer, svgWidth-rightBuffer]);

      var xTickScale = d3.scaleLinear()
                      .domain([minConf - 1, maxConf + 1])
                      .range([leftBuffer, svgWidth - rightBuffer]);

      var xAxis = d3.axisBottom()
                  .ticks(5)
                  .scale(xTickScale);

      var yAxis = d3.axisLeft()
                 .scale(yScale);

      // function make svg
      svg.append('g')
          .attr('class', 'xAxis')
          .attr('transform', 'translate(0,' + (svgHeight - xAxisBuffer) + ')')
          .call(xAxis);

      svg.append('g')
          .attr('class', 'yAxis')
          .attr('transform', 'translate(' + leftBuffer + ',0)')
          .call(yAxis);

      svg.selectAll('.xAxis')
         .transition()
          .call(xAxis);

      svg.selectAll('.yAxis')
         .transition()
          .call(yAxis);

      svg.selectAll('.graphTitle')
         .transition()
         .text(year)

       return [yScale, xScale, xAxis, yAxis];
    }


    function updateChart(d) {
    // based on https://charts.animateddata.co.uk/whatmakesushappy/
        // updateScales();

        // make chart
        var info = allInfo[d-firstYear];
        var unemp = [];
        var conf = [];
        for (var i = 0; i < info.length; i++){
          unemp.push(info[i][0])
          conf.push(info[i][1])
        }
        var maxUnemp = d3.max(unemp);
        var maxConf = d3.max(conf);
        var minConf = d3.min(conf);
        console.log(d);

        var scales = updateAxes(d, maxUnemp, maxConf, minConf);
        var yScale = scales[0];
        var xScale = scales[1];
        var xAxis = scales[2];
        var yAxis = scales[3];
        var colorscheme = d3.scaleOrdinal(d3.schemeCategory20).domain(countries.length)

        makeScatter(info, yScale, xScale)

      }


    function makeScatter(info, yScale, xScale){

      var colors = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928']

      d3.select('svg')
        .selectAll('circle')
        .data(info)
        .transition(d3.easeQuad)
        .duration(500)
        .attr('cx', function(d) {
          console.log(d[1]);
          return xScale(d[1]);
        })
        .attr('cy', function(d) {
          return yScale(d[0]);
        })
        .attr('r', 7)
        .attr('fill', function(d, i){
          return colors[i];
        });
    }


    function updateMenus(year) {
      d3.select('#menu')
        .selectAll('li')
        .classed('selected', function(e) {
          return e === year;
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
