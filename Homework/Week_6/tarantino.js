// Tobias Maätita (10730109)
// DataProcessing Fall 2018
// D3 Linked Views

function main(){
  // load file
  d3.json('data/tarantino.json').then(function(datasetMain){

    // get all films
    var allFilms = Object.keys(datasetMain);
    var options = allFilms;
    var xAxisLabel = options[0];
    console.log(datasetMain);

    // D3 title
    d3.select('head').append('title').text('Tarantino Linked Views');
    piechart();


    // D3 stuff
    var wrapper = d3.select('.wrapper');
    var ul = wrapper.append('ul').attr('id', 'menu')

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
    .on('click', function(d){
      updateMenu(d);
      // updatePlot(dataset, filmDicts, d)
    });

  function piechart() {

    // load file
    d3.json('data/tarantinoPie.json').then(function(datasetPie){



















    // end promise
    });
  // end piechart function
  };



  function barchart() {

    // load file
    d3.json('data/tarantino.json').then(function(datasetBar){

      // get all films
      var allFilms = Object.keys(dataset);
      var options = allFilms;
      var xAxisLabel = options[0];

      var svgHeight = 500;
      var svgWidth = 1100;

      var leftBuffer = 60;
      var rightBuffer = 30;
      var topBuffer = 30;

      var xAxisBuffer = 80;
      var xTextBuffer = 35;
      var yTextBuffer = 35;
      var titleBuffer = 45;

      wrapper.append('div')
             .attr('class', 'chartOne')
             .attr('id', 'barchart');

      var barplot = d3.select('.chartOne')
                      .append('svg')
                      .attr('class', 'barplot')
                      .attr('height', svgHeight)
                      .attr('width', svgWidth)
                      .attr('fill', 'teal')
                      .attr('stroke', 'black');

      var filmDicts = new Object();

      for (var i = 0; i < Object.keys(dataset).length; i++) {
        var filmName = Object.keys(dataset)[i];
        var filmInfo = getData(dataset, filmName);
        var filmEvents = filmInfo[2];
        var filmMinutes = filmInfo[3];
        filmDicts[filmName] = {events: filmEvents, minutes: filmMinutes};
      };

      updatePlot(dataset, filmDicts, xAxisLabel);

      // function barPlot(data, dict, film) {
      // // make a bar plot
      //
      //   // data max, min etc
      //   var movieInfo = getData(data, film);
      //   var minutesMax = movieInfo[0];
      //   var maxPerMinute = movieInfo[1];
      //   var filmData = dict[film].events;
      //   var minutes = dict[film].minutes;
      //   var allEvents = countEvents(dict, minutes, film)
      //
      //   // scales
      //   var barWidth = 8;
      //   var barPadding = 4;
      //
      //   var scales = getScales(minutesMax, maxPerMinute, barWidth);
      //   var yScale = scales[0];
      //   var xScale = scales[1];
      //   var xTickScale = scales[2];
      //
      //   updateAxes(xScale, yScale, xTickScale, film)
      //
      //   // plot
      //   var bar = barplot.selectAll('rect')
      //                    .data(minutes);
      //
      //   var tip = makeTip(allEvents, film, minutes)
      //   barplot.call(tip)
      //
      //   // add bars
      //   bar.enter()
      //      .append('rect')
      //      .attr('class', 'bar')
      //      .attr('x', function(d, i) {
      //        return xScale(d);
      //      })
      //      .attr('y', function(d, i){
      //        return yScale(filmData[d].length);
      //      })
      //      .attr('width', barWidth)
      //      .attr('height', function(d) {
      //        return svgHeight - yScale(filmData[d].length) - xAxisBuffer
      //      })
      //      .style('z-index', 10)
      //      .on('mouseover', tip.show)
      //      .on('mouseout', tip.hide);
      //
      //   return true;
      // };

    // end promise
    });

  // end barchart function
  };


  function getData(data, film) {
  // get the max and min for scales
    var minutes = data[film].minutes_in;
    var minutesSet = new Set(minutes)
    var minutesArray = Array.from(minutesSet).sort(function(a,b){return a - b})
    var allTimes = new Object();
    var lengths = new Array();

    // make Object with all timeslots
    for (var i = 0; i < minutesArray.length; i++) {
      allTimes[minutesArray[i]] = [];
    }

    // fill Object
    for (var i = 0; i < minutes.length; i++) {
      allTimes[minutes[i]].push(data[film]['type'][i])
    }

    // get lengths
    for (var i = 0; i < Object.keys(allTimes).length; i++) {
      lengths.push(allTimes[minutesArray[i]].length);
    }

    // get maximum values
    var minutesMax = d3.max(minutes);
    var maxPerMinute = d3.max(lengths);


    // return values
    return [minutesMax, maxPerMinute, allTimes, minutesArray];
  };


  function getScales(minutesMax, maxPerMinute, barWidth) {

    // scales and axes
    var yScale = d3.scaleLinear()
                 .domain([0, maxPerMinute + 5])
                 .range([svgHeight- xAxisBuffer, 0 + topBuffer]);

    var xScale = d3.scaleLinear()
                 .domain([0, minutesMax + 5])
                 .range([leftBuffer, svgWidth - barWidth - rightBuffer]);

    var xTickScale = d3.scaleLinear()
                    .domain([0, minutesMax])
                    .range([leftBuffer + 4 + barWidth/2, svgWidth - barWidth/2 - rightBuffer + 4]);

    return [yScale, xScale, xTickScale];
  };


  function updateAxes(xScale, yScale, xTickScale, film) {

    var xAxis = d3.axisBottom()
                .ticks(5)
                .scale(xScale);

    var yAxis = d3.axisLeft()
               .scale(yScale);

    barplot.append('g')
        .attr('class', 'xAxis')
        .attr('transform', 'translate(0,' + (svgHeight - xAxisBuffer) + ')')
        .call(xAxis);

    barplot.append('g')
        .attr('class', 'yAxis')
        .attr('transform', 'translate(' + leftBuffer + ',0)')
        .call(yAxis);

    barplot.append('text')
           .attr('class', 'graphTitle')
           .attr('text-anchor', 'middle')
           .attr('x', xScale((xScale.domain()[1])/2))
           .attr('y', topBuffer - 10)

    barplot.selectAll('.xAxis')
       .transition()
       .duration(750)
        .call(xAxis);

    barplot.selectAll('.yAxis')
       .transition()
       .duration(750)
        .call(yAxis);

    // gridlines in y axis function
    function make_y_gridlines() {
        return d3.axisLeft(yScale)
                 .ticks(10)
    }

    // add the Y gridlines
    barplot.append("g")
        .attr("class", "grid")

    barplot.select('.grid')
        .transition()
        .duration(750)
        .attr('transform', 'translate(' + leftBuffer + ',0)')
        .call(make_y_gridlines()
            .tickSize(-svgWidth + rightBuffer + leftBuffer)
            .tickFormat("")
        )

    // axis labels
    barplot.append('text')
        .text('Moment of occurence (minutes in the film)')
        .attr('text-anchor', 'middle')
        .attr('class', 'label')
        .attr('x',  xScale((xScale.domain()[1])/2))
        .attr('y', svgHeight - yTextBuffer);

    barplot.append('text')
         .text('Events per two minutes')
         .attr('text-anchor', 'middle')
         .attr('class', 'label')
         .attr('x', -yScale((yScale.domain()[1])/2))
         .attr('y', leftBuffer - xTextBuffer)
         .attr('transform', 'rotate(-90)');

    barplot.selectAll('.graphTitle')
       .transition()
       .text(film)

  }


  function updatePlot(data, dict, film) {

    var movieInfo = getData(data, film);
    var minutesMax = movieInfo[0];
    var maxPerMinute = movieInfo[1];
    var filmData = dict[film].events;
    var minutes = dict[film].minutes;
    var allEvents = countEvents(dict, minutes, film)

    // scales
    var barWidth = 8;
    var barPadding = 4;

    var scales = getScales(minutesMax, maxPerMinute, barWidth);
    var yScale = scales[0];
    var xScale = scales[1];
    var xTickScale = scales[2];

    updateAxes(xScale, yScale, xTickScale, film)


    var updateBar = barplot.selectAll('rect')
                           .data(minutes);

    // var tip = d3.tip(film)
    //   .attr('class', 'd3-tip')
    //   .offset([-10, 0])
    //   .html(function(minutes, i) {
    //     console.log(film);
    //       if (allEvents[film][minutes].profanity == 1 && allEvents[film][minutes].deaths != 1) {
    //         return "<strong>" + minutes + " - " + (minutes + 2) + " minutes</strong> <br><span>" +
    //                allEvents[film][minutes].profanity + " curseword" +
    //                "</span><br><span style='color:red'>" + allEvents[film][minutes].deaths + " deaths</span>";
    //       } else if (allEvents[film][minutes].deaths == 1 && allEvents[film][minutes].profanity != 1){
    //         return "<strong>" + minutes + " - " + (minutes + 2) + " minutes</strong> <br><span>" +
    //                allEvents[film][minutes].profanity + " curseword" +
    //                "</span><br><span style='color:red'>" + allEvents[film][minutes].deaths + " death</span>";
    //       } else if (allEvents[film][minutes].profanity == 1 && allEvents[film][minutes].deaths == 1) {
    //         return "<strong>" + minutes + " - " + (minutes + 2) + " minutes</strong> <br><span>" +
    //                allEvents[film][minutes].profanity + " curseword" +
    //                "</span><br><span style='color:red'>" + allEvents[film][minutes].deaths + " death</span>";
    //       } else {
    //         return "<strong>" + minutes + " - " + (minutes + 2) + " minutes</strong> <br><span>" +
    //                allEvents[film][minutes].profanity + " cursewords" +
    //                "</span><br><span style='color:red'>" + allEvents[film][minutes].deaths + " deaths</span>";
    //       };
    //   });
    var tip = barplot.selectAll('.d3-tip')
    tip.remove();

    var tip = makeTip(allEvents[film], minutes);
    barplot.call(tip);

    updateBar.enter()
       .append('rect')
       .on('mouseover', tip.show)
       .on('mouseout', tip.hide)
       .merge(updateBar)
       .transition(d3.easeQuad)
       .duration(500)
       .attr('class', 'bar')
       .attr('x', function(d) {
         return xScale(d);
       })
       .attr('y', function(d){
         return yScale(filmData[d].length);
       })
       .attr('width', barWidth)
       .attr('height', function(d) {
         return svgHeight - yScale(filmData[d].length) - xAxisBuffer
       })
       .style('z-index', 10)

    updateBar.exit()
       .transition()
       .duration(500)
       .attr('height', 0)
       .attr('y', svgHeight - xAxisBuffer);

    return true;
  }


  function updateMenu(film) {
  // set chosen film to bold font
  d3.select('#menu')
    .selectAll('li')
    .classed('selected', function(d) {
      return d === film;
    })

  }


  function countEvents(dict, minutes, film) {
  // count profanity and deaths
    var countedEvents = new Object;
    var data = dict[film].events;

    for (var i = 0; i < Object.keys(dict).length; i++) {
      countedEvents[Object.keys(dict)[i]] = {};
    };
    // console.log(Object.keys(data));

    var n = Object.keys(data).length;

    for (var i = 0; i < n; i++) {
      var rowDeaths = 0;
      var rowProfanity = 0;
      var len = data[minutes[i]].length
      for (var j = 0; j < len; j++) {
        if (data[j] == 'death'){
          rowDeaths += 1;
        } else {
          rowProfanity += 1;
        };
      }
      countedEvents[film][minutes[i]] = {profanity: rowProfanity, deaths: rowDeaths};
    }

    return countedEvents;
  }


  function makeTip(allEvents, minutes) {

    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(minutes, i) {
        console.log(minutes);;
          if (allEvents[minutes].profanity == 1 && allEvents[minutes].deaths != 1) {
            return "<strong>" + minutes + " - " + (minutes + 2) + " minutes</strong> <br><span>" +
                   allEvents[minutes].profanity + " curseword" +
                   "</span><br><span style='color:red'>" + allEvents[minutes].deaths + " deaths</span>";
          } else if (allEvents[minutes].deaths == 1 && allEvents[minutes].profanity != 1){
            return "<strong>" + minutes + " - " + (minutes + 2) + " minutes</strong> <br><span>" +
                   allEvents[minutes].profanity + " cursewords" +
                   "</span><br><span style='color:red'>" + allEvents[minutes].deaths + " death</span>";
          } else if (allEvents[minutes].profanity == 1 && allEvents[minutes].deaths == 1) {
            return "<strong>" + minutes + " - " + (minutes + 2) + " minutes</strong> <br><span>" +
                   allEvents[minutes].profanity + " curseword" +
                   "</span><br><span style='color:red'>" + allEvents[minutes].deaths + " death</span>";
          } else {
            return "<strong>" + minutes + " - " + (minutes + 2) + " minutes</strong> <br><span>" +
                   allEvents[minutes].profanity + " cursewords" +
                   "</span><br><span style='color:red'>" + allEvents[minutes].deaths + " deaths</span>";
          };
      });

    return tip;
  }



  // end promise
  });
// end main
}

window.onload = function(){
  main()
};
