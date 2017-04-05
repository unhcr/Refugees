"use strict";

var d3 = require('d3'),
  Utils = require('../utils.js')
;

module.exports = class DataPanelView extends Backbone.View {

  _draw(data){

    let parent = this.$el.parent();
    this.$el.html(`<svg width="${parent.width()}" height="${parent.height()}"></svg>`);


    let svg = d3.select(this.$('svg')[0]),
      maxLabel = d3.max(data, function(d) { return d.total; }),
      maxWidth = '50'
    ;

    // svg.append("text").text(maxLabel).each(function() { maxWidth = Math.ceil(this.getBBox().width) + 10; }).remove()

    let margin = {top: 20, right: maxWidth, bottom: 30, left: maxWidth},
      minDate,
      maxDate,
      width = Math.floor(parent.width()) - margin.left - margin.right,
      height = Math.floor(parent.height()) - margin.top - margin.bottom,
      g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
      x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
      y = d3.scaleLinear().rangeRound([0,height])
    ;

    x.domain(data.map(function(d) { return d.name; }));
    y.domain([0, d3.max(data, function(d) { return d.total; })]);

    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y).ticks(5).tickSize(-width+20).tickFormat(''))
      .select(".domain")
      .remove();

    g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .append("text")
      .attr("fill", "#000")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      ;

    g.append("g")
      .call(d3.axisLeft(y).ticks(5).tickSize(0))
      .select(".domain")
      .remove();

    g.selectAll(".bar")
      .data(data)
      .enter().append("rect")
        .attr("class", "barPath")
        .attr("x", function(d) { return x(d.name); })
        .attr("y", function(d) { return height; })
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .attr("total", function(d) { return d.total; })
        .attr("name", function(d) { return d.name; })
        .transition()
  			.duration(200)
  			.delay(function (d, i) {return i * 50;})
        .attr("y", function (d, i) {return height - y(d.total);})
        .attr("height", function(d) { return y(d.total); })
    ;

    let popup = g.append('rect')
      .attr('x',0)
      .attr('y',0)
      .attr('rx',2)
      .attr('ry',2)
      .attr('height', 20)
      .attr("class","popup")
    ;

    let popupText = g.append("text")
      .attr('class', 'popupText')
      .attr("x", 0)
      .attr("y", 0)
    ;

    svg.selectAll(".barPath").on('mousemove',function() {

      svg.attr("class", "active");

      let circle,
        x = d3.mouse(this)[0],
        y = d3.mouse(this)[1],
        textLength
      ;
      popupText.html('<tspan class="first">' + $(this).attr('name')  + ':</tspan> <tspan> ' + Utils.formatNumber(parseFloat($(this).attr("total"))) + "%</tspan>");
      popupText.attr("y", y + 2);
      textLength = popupText.node().getComputedTextLength() + 20;
      popup.attr("y", y - 12);
      popup.attr("width", textLength);

      if(x + textLength > width){
        popupText.attr("x", x - textLength);
        popup.attr("x", x - textLength - 10);
      }else{
        popupText.attr("x", x+15);
        popup.attr("x", x+5);
      }

    });

    svg.selectAll(".barPath").on('mouseout',function() {
      svg.attr("class", null);
    });

  }

}
