// Tobias Maätita (10730109)
// DataProcessing Fall 2018
// D3 Scatterplot


window.onload = function() {
  var consumers = "https://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR+ITA+ESP+DNK+BEL+SWE+JPN.COCONF+UNEMPRATE.A/all?startTime=2007&endTime=2015"
  var request = [d3.json(consumers)]

  Promise.all(request).then(function(response){

    // transform received data, from data.mprog
    var data = transformResponse(response[0]);

    // parse data
    var parsed = parseData(data);
    var allInfo = parsed[0];
    var countries = parsed[1];

    // years
    var options = ['2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015'];
    var firstYear = options[0]
    var xAxisLabel = '2007'

    var wrapper = d3.select('.wrapper');
    var ul = wrapper.append('ul').attr('id', 'menu')

    // svg element
    var svgWidth = 1000;
    var svgHeight = 575;

    var leftBuffer = 80;
    var rightBuffer = 50;
    var topBuffer = 30;

    var xAxisBuffer = 100;
    var xTextBuffer = 45;
    var yTextBuffer = 35;
    var titleBuffer = 45;

    // add svg to page
    wrapper.append('div').attr('id', 'chartdiv')
    var svg = d3.select('#chartdiv').append('svg')
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


    // text on page
    wrapper.append('div').attr('id', 'menuTitle').text('Pick a year:');
    wrapper.append('div').attr('id', 'text');
    wrapper.append('div').attr('id', 'title');
    wrapper.append('div').attr('id', 'values');
    wrapper.append('div').attr('class', 'values').attr('id', 'countName');
    wrapper.append('div').attr('class', 'values').attr('id', 'unemp');
    wrapper.append('div').attr('class', 'values').attr('id', 'conf');

    d3.select('#text').append('p').append('strong').attr('id', 'textTitle').text("D3 Scatterplot");
    d3.selectAll('#text').append('p').attr('id', 'about').text("This scatterplot shows the relation \
    between the consumer confidence index and the unemployment rate in twelve different countries. \
    The consumer confidence index measures the degree of optimism expressed through the spending and \
    saving activities of a country's customers. The unemployment rate shows the unemployed percentage \
    of a country's population. From the menu above, you can pick a year to further inspect. \
    Hover over one of the dots to find out which country it represents. Through the dots, \
    a trendline is fitted to show the correlation between consumer confidence and unemployment \
    rate. The correlation coefficient is shown atop the line. The correlation appears negative and varies \
    in strength. However, in 2015, the correlation seems positive. This is a strange occurence and \
    begs the question whether these two factors are directly related.");

    d3.select('#title').append('h1').text('Correlation between unemployment rate and consumer confidence\
    , 2007-2017');

    // initial scatter
    firstScatter(allInfo)


    function parseData(data) {
      // preprocess data to use in scatterplots

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

        // keys in dictionary
        var key = years[k]
        allData.push({key: key, value: []})

        // loop through data
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

      // allInfo includes info per year
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

      // return allInfo and countries
      return [allInfo, countries];
    }


    function firstData(allInfo) {
      // get data for initial scatterplot

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
      // make initial scatterplot

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

      // fit line
      svg.append('line')
         .attr('id', 'fitline');

      svg.append('text')
         .attr('id', 'coefficient');

      var fit = fitline(infoYear, xScale);
      setLine(xScale, yScale, fit);

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
           .attr('text-anchor', 'end')
           .attr('x', svgWidth - rightBuffer)
           .attr('y', svgHeight - xAxisBuffer - yTextBuffer)
           .attr('font-size', '100px')
           .attr('fill', 'darkgrey')


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
            d3.select('#countName')
              .text(countries[i])
              .transition()
              .style('opacity', 1);
            d3.select('#unemp')
              .text("Unemployment: " + infoYear[i][0] + "%")
              .transition()
              .style('opacity', 1);
            d3.select('#conf')
              .text("Confidence: " + infoYear[i][1])
              .transition()
              .style('opacity', 1);
         })
         .on('mouseout', function(d, i){
           d3.select('#country')
             .transition()
             .duration(1000)
             .style('opacity', 0)
           d3.select('#countName')
             .transition()
             .duration(2000)
             .style('opacity', 0)
           d3.select('#unemp')
             .transition()
             .duration(2000)
             .style('opacity', 0)
           d3.select('#conf')
             .transition()
             .duration(2000)
             .style('opacity', 0)
         });
    }


    function updateAxes(year, maxUnemp, maxConf, minConf){
      // update scales and axes

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

      // make svg
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
         .duration(750)
          .call(xAxis);

      svg.selectAll('.yAxis')
         .transition()
         .duration(750)
          .call(yAxis);

      svg.selectAll('.graphTitle')
         .transition()
         .text(year)

       return [yScale, xScale, xAxis, yAxis];
    }


    function updateChart(d) {
    // based on https://charts.animateddata.co.uk/whatmakesushappy/
        // updateScales();

        // get needed info
        var info = allInfo[d-firstYear];

        // separate unemployment and consumer confidence
        var unemp = [];
        var conf = [];
        for (var i = 0; i < info.length; i++){
          unemp.push(info[i][0])
          conf.push(info[i][1])
        }
        var maxUnemp = d3.max(unemp);
        var maxConf = d3.max(conf);
        var minConf = d3.min(conf);

        // update scales and axes
        var scales = updateAxes(d, maxUnemp, maxConf, minConf);
        var yScale = scales[0];
        var xScale = scales[1];
        var xAxis = scales[2];
        var yAxis = scales[3];

        // make scatterplot
        makeScatter(info, yScale, xScale);

        // make fitline
        var fit = fitline(info, xScale);
        setLine(xScale, yScale, fit);

      }


    function makeScatter(info, yScale, xScale){
      // Add dots to the svg

      // colors to use, from http://colorbrewer2.org
      var colors = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928']

      // add dots
      d3.select('svg')
        .selectAll('circle')
        .data(info)
        .transition(d3.easeQuad)
        .duration(500)
        .attr('cx', function(d) {
          return xScale(d[1]);
        })
        .attr('cy', function(d) {
          return yScale(d[0]);
        })
        .attr('r', 7)
        .attr('fill', function(d, i){
          return colors[i];
        })
        .on('mouseover', function(d, i) {
           d3.select('#country')
             .text(countries[i])
             .transition()
             .style('opacity', 1);
           d3.select('#countName')
             .transition()
             .style('opacity', 1)
             .text(countries[i])
           d3.select('#unemp')
             .text("Unemployment: " + infoYear[i][0])
             .transition()
             .style('opacity', 1)
           d3.select('#conf')
             .text("Confidence: " + infoYear[i][0])
             .transition()
             .style('opacity', 1);
        })
        .on('mouseout', function(d, i){
          d3.select('#country')
            .transition()
            .duration(1000)
            .style('opacity', 0)
          d3.select('#countName')
            .transition()
            .duration(2000)
            .style('opacity', 0)
          d3.select('#unemp')
            .transition()
            .duration(2000)
            .style('opacity', 0)
          d3.select('#conf')
            .transition()
            .duration(2000)
            .style('opacity', 0)
        });
    }


    function updateMenus(year){
      // update the menu with years

      d3.select('#menu')
        .selectAll('li')
        .classed('selected', function(e) {
          return e === year;
        });
    }


    function getCorrelation(infoYear){
      // calculate correlation coefficient using Pearson.
      // Formula found here: https://www.statisticshowto.datasciencecentral.com/probability-and-statistics/correlation-coefficient-formula/

      // all needed variables
      var xy = new Array;
      var allX = new Array;
      var allY = new Array;
      var sumX = 0;
      var sumY = 0;
      var sumXY = 0;
      var sumx_2 = 0;
      var sumy_2 = 0;
      var n = infoYear.length

      // calculate sums and get all values to calculate stdev
      for (var i = 0; i < n; i++) {
        var x = infoYear[i][1];
        sumX += x;
        allX.push(x);

        var y = infoYear[i][0];
        sumY += y;
        allY.push(y);

        sumXY += (x*y);
        sumx_2 += (x*x);
        sumy_2 += (y*y);
      };

      // get stdevs
      var devX = getStdev(allX);
      var stdevX = devX[0];
      var meanX = devX[1];

      var devY = getStdev(allY);
      var stdevY = devY[0];
      var meanY = devY[1];

      // calculate correlation
      var numerator = n * (sumXY) - (sumX * sumY);
      var denominatorFirst = n * sumx_2 - (sumX * sumX);
      var denominatorSecond = n * sumy_2 - (sumY * sumY);
      var denomProd = denominatorFirst * denominatorSecond;
      var denominator = Math.sqrt(denomProd);
      var corrCoef = numerator / denominator;

      // y = b0 + b1x
      var b1 = corrCoef * (stdevY / stdevX);
      var b0 = meanY - (b1 * meanX);

      return {b0:b0, b1:b1, corrCoef:corrCoef};

    }


    function getStdev(values){
      // calculate the standard deviation of observed values

      var n = values.length;
      var sum = 0;

      // calculate mean
      for (var i = 0; i < n; i++) {
        sum += values[i];
      }
      var mean = sum/n;

      // calculate sum of squared variance
      var ssVariance = 0;
      for (var i = 0; i < n; i++) {
        ssVariance += ((values[i] - mean) * (values[i] - mean));
      }

      // calculate stdev
      var stdev = Math.sqrt(ssVariance / n);

      return [stdev, mean];
    }


    function fitline(info, xScale){
      // calculate x1, y1, x2, y2 to plot fitline

      // get x1, x2, y1, y2 for fitline
      var regression = getCorrelation(info);
      var fitX1 = xScale.domain()[0];
      var fitX2 = xScale.domain()[1];

      // y = b0 + b1x
      var fitY1 = regression.b0 + regression.b1 * fitX1;
      var fitY2 = regression.b0 + regression.b1 * fitX2;

      return {x1:fitX1, x2:fitX2, y1:fitY1, y2:fitY2, r:regression.corrCoef};
    }


    function setLine(xScale, yScale, fit){
      // plot fitline onto svg

      // plot line
      d3.select('#fitline')
        .style('opacity', 0)
        .attr('x1', xScale(fit.x1))
        .attr('y1', yScale(fit.y1))
        .attr('x2', xScale(fit.x2))
        .attr('y2', yScale(fit.y2))
        .transition()
        .duration(800)
        .style('opacity', 0.5);

      // add slope
      d3.select('#coefficient')
        .style('opacity', 0)
        .text(function(d) {
          return 'r =' + Math.round(fit.r * 100)/100;
        })
        .attr('x', xScale(fit.x1) + 10)
        .attr('y', yScale(fit.y1) - 15)
        .transition()
        .duration(800)
        .style('opacity', 1);

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
