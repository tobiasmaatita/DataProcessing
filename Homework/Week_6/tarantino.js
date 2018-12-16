// Tobias Maätita (10730109)
// DataProcessing Fall 2018
// D3 Linked Views

function main(){
  // load file
  d3.json('data/tarantinoPie.json').then(function(datasetMain){
    d3.json('data/tarantino.json').then(function(datasetBar){

        var stackHeight = 500;
        var stackWidth = 900;

        var summaryHeight = 480,
            summaryWidth = 700;

        var leftBuffer = 60;
        var rightBuffer = 30;
        var topBuffer = 30;

        var xAxisBuffer = 80;
        var xTextBuffer = 35;
        var yTextBuffer = 35;
        var titleBuffer = 45;

        var margin = {
          top: 30,
          left: 60,
          right: 30,
          bottom: 80,
          title: 45,
          axisText: 30
        }

        // get all films
        var allFilms = Object.keys(datasetMain);
        var options = allFilms;
        var xAxisLabel = options[0];

        // D3 title
        d3.select('head').append('title').text('Tarantino Linked Views');

        // D3 stuff
        var wrapper = d3.select('.wrapper');
        // var ul = wrapper.append('ul').attr('id', 'menu')

        wrapper.append('div')
               .attr('class', 'text')
               .attr('id', 'introText')
               .text('In this linked views assignment, I will analyse the first \
                     seven films made by Quentin Tarantino. Tarantino'+"'"+'s films\
                     are well-known for being extremely violent and full of profanity. \
                     For each of the seven movies, the profanities and deaths are \
                     logged. Hover over the bars to get the exact numbers; click \
                     on a bar to get the specifics for that film.')

        wrapper.append('div')
               .attr('class', 'chartOne')
               .attr('id', 'stackedBarchart');

        wrapper.append('div')
               .attr('class', 'pie')
               .attr('id', 'piechart')

        wrapper.append('div')
               .attr('class', 'chartTwo')
               .attr('id', 'summaryBar')

        var stacked = d3.select('.chartOne')
                        .append('svg')
                        .attr('class', 'barplot')
                        .attr('height', stackHeight)
                        .attr('width', stackWidth)
                        .attr('fill', 'teal')
                        .attr('stroke', 'black');

        var summary = d3.select('.chartTwo')
                        .append('svg')
                        .attr('class', 'barplot')
                        .attr('id', 'summary')
                        .attr('height', summaryHeight)
                        .attr('width', summaryWidth)
                        .attr('fill', 'teal')
                        .attr('stroke', 'black');

        stackedBarchart();

        // // add menu
        // d3.select('#menu')
        // .selectAll('li')
        // .data(options)
        // .enter()
        // .append('li')
        // .text(function(d) {return d;})
        // .classed('selected', function(d) {
        //   return d === xAxisLabel;
        // })
        // .on('click', function(d){
        //   updateMenu(d);
        //   updatePlot(datasetBar, filmDicts, d)
        // });

      function piechart(index) {

        var filmsPie = Object.keys(datasetMain);
        var neededFilm = filmsPie[index];
        var words = datasetMain[neededFilm].words;
        var allWords = Object.keys(words);
        var len = allWords.length;
        var filmWords = [];

        for (var i = 0; i < len; i++) {
          var currWord = allWords[i];
          if (words[currWord] > 0) {
            filmWords.push({word: currWord, value: words[currWord]});
          };
        };

        // piechart
        var pieHeight = 600,
        pieWidth = 500,
        r = 240,
        colors = d3.scaleOrdinal(d3.schemePastel1);

        d3.selectAll('.piechartFilm').remove()
        d3.selectAll('#pieTip').remove();

        var pieTip = d3.tip()
          .attr('class', 'd3-tip')
          .attr('id', 'pieTip')
          .offset([-10, 0])
          .html(function(d, i) {
            var currWord = filmWords[i]
            return "<span> " + '"<strong>' + currWord.word + '</strong>"' +
                   ":</span><br><span style='color:red'>" + currWord.value +
                   " times</span>";
          });

        var vis = d3.select('.pie').append('svg')
                    .attr('class', 'piechartFilm')
                    .data([filmWords])
                    .attr('height', pieHeight)
                    .attr('width', pieWidth)
                    .append('svg:g')
                    .attr('transform', 'translate(' + r + ',' + (r + 2 * margin.top) + ')');

        vis.call(pieTip)

        var arc = d3.arc()
                    .innerRadius(0)
                    .outerRadius(r);

        var pie = d3.pie()
                    .value(function(d) {
                      return d.value;
                    });

        var arcs = vis.selectAll('g.slice')
                      .data(pie)
                      .enter()
                      .append('svg:g')
                      .attr('class', 'slice')

        arcs.append('svg:path')
            .on('mouseover', pieTip.show)
            .on('mouseout', pieTip.hide)
            .transition()
            .duration(500)
            .attr('fill', function(d, i) {
              return colors(i)
            })
            .attr('d', arc)

        // arcs.exit()
        //     .transition()
        //     .duration(500)
        //     .attr('fill', function(d, i) {
        //       return colors(i)
        //     })
        //     .attr('d', arc)

        arcs.append('text')
            .attr('text-anchor', 'middle')
            .attr('class', 'graphTitlePie')
            .text('Cursewords in ' + neededFilm)
            .attr('y', - r - margin.axisText)


        // arcs.append('svg:text')
        //     .attr('transform', function(d) {
        //       d.innerRadius = 0;
        //       d.outerRadius = r;
        //       return "translate (" + arc.centeroid(d) + ")";
        //     })
        //     .attr('text-anchor', 'middle')
        //     .text(function(d) {
        //       return d.word
        //     })



      // end piechart function
      };


      function stackedBarchart() {
      // stacked barchart to start with

        var allFilmDict = datasetMain;
        var numberFilms = Object.keys(datasetMain).length;

        var barWidth = 40;

        var stackScales = getStackScales(numberFilms, barWidth);
        var xScaleStack = stackScales[0];
        var yScaleStack = stackScales[1];
        var xTickScaleStack = stackScales[2]

        getStackAxes(xScaleStack, yScaleStack, xTickScaleStack);

        var groups = ['profanity', 'deaths'];
        var colors = ['red', 'blue'];

        var data = preprocessStack(datasetMain);
        var nested = d3.nest()
                       .key(function(d) { return d.film; })
                       .entries(data);

        var filmStack = [];
        var deaths = [];
        var profanity = [];
        var deathsCount = [];
        var profanityCount = []

        nested.forEach(function(d) {
          var totalEvents = d.values[0].deaths + d.values[1].profanity
          var deathsPercentage = d.values[0].deaths / totalEvents * 100;
          var profanityPercentage = 100 - deathsPercentage;
          filmStack.push(d.key);
          deaths.push(deathsPercentage);
          profanity.push(profanityPercentage);
          deathsCount.push(d.values[0].deaths);
          profanityCount.push(d.values[1].profanity);
        })

        // plot
        var deathsBar = stacked.selectAll('rect')
                         .data(deaths);

        var profanityBar = stacked.selectAll('rect')
                          .data(profanity);

        var stackTip = d3.tip()
          .attr('class', 'd3-tip')
          .offset([-10, 0])
          .html(function(d, i) {
            return "<strong>" + filmStack[i] + "</strong> <br><span>" +
                   deathsCount[i]+ " deaths" + "</span><br><span style='color:red'>" +
                   profanityCount[i] + " cursewords</span>";

          });
        stacked.call(stackTip)

        // add bars deaths
        deathsBar.enter()
           .append('rect')
           .attr('class', 'bar')
           .attr('id', 'stackDeaths')
           .attr('fill', 'red')
           .style('z-index', 10)
           .style('fill-opactity', 1)
           .on('click', function(d, i) {
             piechart(i);
             summaryPlot(filmStack[i]);
           })
           .on('mouseover', stackTip.show)
           .on('mouseout', stackTip.hide)
           .attr('x', function(d, i) {
             return xScaleStack(i);
           })
           .attr('y', stackHeight - margin.bottom)
           .merge(deathsBar)
           .transition()
           .duration(800)
           .delay(function(d,i){
             return i * 50
           })
           .attr('y', function(d, i){
             return yScaleStack(d);
           })
           .attr('width', barWidth)
           .attr('height', function(d) {
             return stackHeight - yScaleStack(d) - margin.bottom
           })

        // add bars profanity
        profanityBar.enter()
           .append('rect')
           .attr('class', 'bar')
           .attr('id', 'stackProfanity')
           .style('z-index', 10)
           .on('click', function(d, i) {
             piechart(i);
             summaryPlot(filmStack[i]);
           })
           .on('mouseover', stackTip.show)
           .on('mouseout', stackTip.hide)
           .attr('x', function(d, i) {
             return xScaleStack(i);
           })
           .attr('y', stackHeight - margin.bottom)
           .merge(deathsBar)
           .transition()
           .duration(800)
           .delay(function(d,i){
             return i * 50
           })
           .attr('y', function(d, i){
             return margin.top;
           })
           .attr('width', barWidth)
           .attr('height', function(d, i) {
             return yScaleStack(deaths[i]) - margin.top;
           });



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

      return true;
      // end barchart function
      };


      function getMaxStacked(data, length) {
      // get max to set scales later on

        var events = new Array;

        for (var i = 0; i < length; i++) {
          var film = Object.keys(data)[i];
          var totalEvents = data[film].profanity + data[film].deaths;
          events.push(totalEvents);
        };

        var max = d3.max(events);

        return max;

      };


      function getStackAxes(xScaleStack, yScaleStack, xTickScaleStack) {

        var xAxisStack = d3.axisBottom()
                    .ticks(6)
                    .tickFormat(function(d) {
                      return Object.keys(datasetMain)[d]
                    })
                    .scale(xTickScaleStack);

        var yAxisStack = d3.axisLeft()
                   .scale(yScaleStack);

        stacked.append('g')
            .attr('class', 'xAxis')
            .attr('id', 'xStack')
            .attr('transform', 'translate(0,' + (stackHeight - margin.bottom) + ')')
            .call(xAxisStack);

        stacked.append('g')
            .attr('class', 'yAxis')
            .attr('class', 'yStack')
            .attr('transform', 'translate(' + margin.left + ',0)')
            .call(yAxisStack);

        stacked.append('text')
               .attr('class', 'graphTitle')
               .attr('id', 'graphTitleStack')
               .attr('text-anchor', 'middle')
               .attr('x', xScaleStack((xScaleStack.domain()[1])/2))
               .attr('y', margin.top - 10)

        stacked.selectAll('.xAxis')
           .transition()
           .duration(750)
            .call(xAxisStack);

        stacked.selectAll('.yAxis')
           .transition()
           .duration(750)
            .call(yAxisStack);

        // gridlines in y axis function
        function make_y_gridlines() {
            return d3.axisLeft(yScaleStack)
                     .ticks(10)
        }

        // add the Y gridlines
        stacked.append("g")
            .attr("class", "grid")

        stacked.select('.grid')
            .transition()
            .duration(750)
            .attr('transform', 'translate(' + leftBuffer + ',0)')
            .call(make_y_gridlines()
                .tickSize(-stackWidth + rightBuffer + leftBuffer)
                .tickFormat("")
            )

        // axis labels
        stacked.append('text')
            .text('Film')
            .attr('text-anchor', 'middle')
            .attr('class', 'label')
            .attr('x',  xScaleStack((xScaleStack.domain()[1])/2))
            .attr('y', stackHeight - yTextBuffer);

        stacked.append('text')
             .text('Deaths and profanity (percentage of total events)')
             .attr('text-anchor', 'middle')
             .attr('class', 'label')
             .attr('x', -yScaleStack((yScaleStack.domain()[1])/2))
             .attr('y', leftBuffer - xTextBuffer)
             .attr('transform', 'rotate(-90)');

        stacked.selectAll('.graphTitle')
           .transition()
           .text('All films')

      }


      function getStackScales(numberFilms, barWidth) {

        // scales and axes
        var yScale = d3.scaleLinear()
                     .domain([0, 100])
                     .range([stackHeight - margin.bottom, margin.top]);


        var xScale = d3.scaleLinear()
                     .domain([0, numberFilms - 1])
                     .range([margin.left, stackWidth - barWidth - margin.right]);

        var xTickScale = d3.scaleLinear()
                        .domain([0, numberFilms - 1])
                        .range([margin.left + barWidth/2, stackWidth - barWidth/2 - margin.right]);

        return [xScale, yScale, xTickScale];

      }


      function preprocessStack(datasetMain) {

        var films = Object.keys(datasetMain);
        var filmsEventsStack = []

        for (var i = 0; i < films.length; i++) {
          var film = films[i];
          filmsEventsStack.push({film: film, deaths: datasetMain[film].deaths});
          filmsEventsStack.push({film: film, profanity: datasetMain[film].profanity})
        };

        return filmsEventsStack;


      }


      function summaryPlot(film) {

        var filmInfo = getDataSummary(datasetBar, film)
        var minutesMax = filmInfo[0],
            maxPerMinute = filmInfo[1],
            filmEventsDict = filmInfo[2],
            minutes = filmInfo[3];

        var countedEventsSummary = countEvents(filmEventsDict, minutes, film);
        var totalDeathSummary = datasetMain[film].deaths,
            totalProfanitySummary = datasetMain[film].profanity;

        var barWidthSummary = 8,
            barPaddingSummary = 4;

        var scales = getScalesSummary(minutesMax, maxPerMinute, barWidthSummary);
        var xScaleSummary = scales[0],
            yScaleSummary = scales[1],
            xTickScaleSummary = scales[2];

        updateAxesSummary(xScaleSummary, yScaleSummary, xTickScaleSummary, film)

        var summaryBar = summary.selectAll('rect')
                                .data(minutes)

        summaryBar.enter()
           .append('rect')
           .attr('x', function(d, i) {
             return xScaleSummary(d);
           })
           .attr('y', summaryHeight - margin.bottom)
           .merge(summaryBar)
           .transition(d3.easeQuad)
           .duration(500)
           .attr('class', 'bar')
           .delay(function(d,i){
             return i * 20
           })
           .attr('x', function(d) {
             return xScaleSummary(d);
           })
           .attr('y', function(d){
             return yScaleSummary(filmEventsDict[d].length);
           })
           .attr('width', barWidthSummary)
           .attr('height', function(d) {
             return summaryHeight - yScaleSummary(filmEventsDict[d].length) - margin.bottom
           })
           .style('z-index', 10)

        summaryBar.exit()
           .transition()
           .duration(500)
           .attr('height', 0)
           .attr('y', summaryHeight - margin.bottom);


      // end summaryBar function
      }


      function getDataSummary(data, film) {
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


      function getScalesSummary(minutesMax, maxPerMinute, barWidthSummary) {

        // scales and axes
        var yScale = d3.scaleLinear()
                     .domain([0, maxPerMinute + 5])
                     .range([summaryHeight- xAxisBuffer, 0 + margin.top]);

        var xScale = d3.scaleLinear()
                     .domain([0, minutesMax + 5])
                     .range([margin.left, summaryWidth - barWidthSummary - margin.right]);

        var xTickScale = d3.scaleLinear()
                        .domain([0, minutesMax])
                        .range([margin.left + 4 + barWidthSummary/2, summaryWidth -
                                barWidthSummary/2 - margin.right + 4]);

        return [xScale, yScale, xTickScale];
      };


      function updateAxesSummary(xScale, yScale, xTickScale, film) {

        var xAxis = d3.axisBottom()
                    .ticks(5)
                    .scale(xScale);

        var yAxis = d3.axisLeft()
                   .scale(yScale);

        summary.append('g')
            .attr('class', 'xAxis')
            .attr('id', 'xSummary')
            .attr('transform', 'translate(0,' + (summaryHeight - margin.bottom) + ')')
            .call(xAxis);

        summary.append('g')
            .attr('class', 'yAxis')
            .attr('id', 'ySummary')
            .attr('transform', 'translate(' + margin.left + ',0)')
            .call(yAxis);

        summary.append('text')
               .attr('class', 'graphTitleSummary')
               .attr('text-anchor', 'middle')
               .attr('x', xScale((xScale.domain()[1])/2))
               .attr('y', margin.top - 10)

        summary.selectAll('.xAxis')
           .transition()
           .duration(750)
            .call(xAxis);

        summary.selectAll('.yAxis')
           .transition()
           .duration(750)
            .call(yAxis);

        // gridlines in y axis function
        function make_y_gridlines() {
            return d3.axisLeft(yScale)
                     .ticks(10)
        }

        // add the Y gridlines
        summary.append("g")
            .attr("class", "grid")

        summary.select('.grid')
            .transition()
            .duration(750)
            .attr('transform', 'translate(' + margin.left + ',0)')
            .call(make_y_gridlines()
                .tickSize(-summaryWidth + margin.right + margin.left)
                .tickFormat("")
            )

        // axis labels
        summary.append('text')
            .text('Moment of occurence (minutes in the film)')
            .attr('text-anchor', 'middle')
            .attr('class', 'label')
            .attr('x',  xScale((xScale.domain()[1])/2))
            .attr('y', summaryHeight - margin.axisText);

        summary.append('text')
             .text('Events per two minutes')
             .attr('text-anchor', 'middle')
             .attr('class', 'label')
             .attr('x', -yScale((yScale.domain()[1])/2))
             .attr('y', margin.left - margin.axisText)
             .attr('transform', 'rotate(-90)');

        summary.selectAll('.graphTitleSummary')
           .transition()
           .text(film)
      }


      function updatePlot(dataBar, dataMain, dict, film) {

        var movieInfo = getData(dataBar, film);
        var minutesMax = movieInfo[0];
        var maxPerMinute = movieInfo[1];
        var filmData = dict[film].events;
        var minutes = dict[film].minutes;
        var allEvents = countEvents(dict, minutes, film)

        var totalDeath = dataMain[film].deaths;
        var totalProfanity = dataMain[film].profanity;

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


      function countEvents(filmEventsDict, minutes, film) {
      // count profanity and deaths
        var countedEvents = new Object;
        var data = filmEventsDict;
        var n = Object.keys(data).length;

        for (var i = 0; i < n; i++) {
          countedEvents[Object.keys(data)[i]] = {};
        };

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
          countedEvents[minutes[i]] = {profanity: rowProfanity, deaths: rowDeaths};
        }

        return countedEvents;
      }


      function makeTip(allEvents, minutes) {

        var tip = d3.tip()
          .attr('class', 'd3-tip')
          .offset([-10, 0])
          .html(function(minutes, i) {
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


    // end bar promise from main function
    })
  // end promise pie from main
  });
// end main
}

window.onload = function(){
  main()
};
