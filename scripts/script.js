// Parcoords
var parcoords = ParCoords()("#parCoordsContainer");
var mainData;
var parcoordsSelected = [];

var color = d3
  .scaleOrdinal()
  .domain([1, 2, 3, 4, 5, 6])
  .range(["#32CD32", "#FF8C00", "#FF00FF", "#1E90FF", "#FF0000", "#8B4513"]);

var forceStrength = 0.08;

var width = d3
  .select("#mainContainer")
  .node()
  .getBoundingClientRect().width;
var height = d3
  .select("#mainContainer")
  .node()
  .getBoundingClientRect().height;
var parcoordsSelected = [];

function continentToGroup(continent) {
  continents = [
    "Africa",
    "South America",
    "Asia",
    "Oceania",
    "Europe",
    "North America"
  ];

  if (continent == "Africa") {
    return 1;
  } else if (continent == "South America") {
    return 2;
  } else if (continent == "Asia") {
    return 3;
  } else if (continent == "Oceania") {
    return 4;
  } else if (continent == "Europe") {
    return 5;
  } else if (continent == "North America") {
    return 6;
  } else {
    return -99;
  }
}

function groupToContinent(group) {
  if (group == 1) {
    return "Africa";
  } else if (group == 2) {
    return "South America";
  } else if (group == 3) {
    return "Asia";
  } else if (group == 4) {
    return "Oceania";
  } else if (group == 5) {
    return "Europe";
  } else if (group == 6) {
    return "North America";
  } else {
  }
}

function enrichData(data) {
  data.forEach(function(d, i) {
    d.x = width / 2;
    d.y = height / 2;
    d.r = Math.sqrt(d.Gdp) / 7;
    d.ID = i;
    d.Group = continentToGroup(d.Continents);
  });
}

Promise.all([
  d3.csv("data/wave3.csv"),
  d3.csv("data/wave4.csv"),
  d3.csv("data/wave5.csv"),
  d3.csv("data/wave6.csv")
]).then(function(files) {
  var wave3 = files[0];
  var wave4 = files[1];
  var wave5 = files[2];
  var wave6 = files[3];

  enrichData(wave3);
  enrichData(wave4);
  enrichData(wave5);
  enrichData(wave6);

  /**First render */
  if (!mainData) {
    mainData = wave6;
  }

  function renderBubbles(data) {
    /** RESET STUFF */
    resetGroupButtons();
    parcoordsSelected = [];

    var mainContainer = d3.select("#mainContainer");

    var svg = mainContainer
      .append("svg")
      .attr("id", "bubbles")
      .attr("width", width)
      .attr("height", height);

    // Tooltip
    var div = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    var simulation = d3
      .forceSimulation()
      .force(
        "collide",
        d3
          .forceCollide(function(d) {
            return d.r + 8;
          })
          .iterations(16)
      )
      .force("charge", d3.forceManyBody())
      .force("y", d3.forceY().y(height / 2 - height / 10))
      .force("x", d3.forceX().x(width / 2));

    var circles = svg.selectAll("circle").data(data, function(d) {
      return d.ID;
    });

    var circlesEnter = circles
      .enter()
      .append("circle")
      .attr("r", function(d, i) {
        return d.r;
      })
      .attr("cx", function(d, i) {
        return 175 + 25 * i + 2 * i ** 2;
      })
      .attr("cy", function(d, i) {
        return 250;
      })
      .attr("id", function(d) {
        return d.ID;
      })
      .style("fill", function(d, i) {
        return color(d.Group);
      })
      .style("stroke", "black")
      .style("stroke-width", 1)
      .style("pointer-events", "all")
      .on("mouseover", function(d) {
        div
          .transition()
          .duration(200)
          .style("opacity", 0.9);
        div
          .html(d.Country)
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY - 28 + "px");
      })
      .on("mouseout", function(d) {
        div
          .transition()
          .duration(500)
          .style("opacity", 0);
      })
      .on("click", function(d) {
        if (parcoordsSelected.includes(d)) {
          index = parcoordsSelected.indexOf(d);
          parcoordsSelected.splice(index, 1);
        } else {
          parcoordsSelected.push(d);
        }

        if (parcoordsSelected.includes(d)) {
          d3.select(this).style("stroke-width", 4);
        } else {
          d3.select(this).style("stroke-width", 1);
        }

        //Check if there are highlighted nodes
        if (parcoordsSelected.length == 0) {
          parcoords.unhighlight();
        } else {
          parcoords.highlight(parcoordsSelected);
        }
      })
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    circles = circles.merge(circlesEnter);

    function ticked() {
      circles
        .attr("cx", function(d) {
          return d.x;
        })
        .attr("cy", function(d) {
          return d.y;
        });
    }

    simulation.nodes(data).on("tick", ticked);

    simulation.force(
      "x",
      d3
        .forceX()
        .strength(forceStrength)
        .x(width / 2)
    );
    simulation.alpha(1).restart();

    /* FUNCTIONS */

    function dragstarted(d, i) {
      if (!d3.event.active) simulation.alpha(1).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d, i) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d, i) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
      var me = d3.select(this);
      me.classed("selected", !me.classed("selected"));

      d3.selectAll("circle").style("fill", function(d, i) {
        return color(d.Group);
      });
    }

    function splitBubbles(byVar) {
      var centerScale = d3
        .scalePoint()
        .padding(1)
        .range([0, width]);

      centerScale.domain(
        data.map(function(d) {
          return d[byVar];
        })
      );

      if (byVar == "all") {
        hideTitles();
      } else {
        showTitles(byVar, centerScale);
      }

      // @v4 Reset the 'x' force to draw the bubbles to their centers
      simulation.force(
        "x",
        d3
          .forceX()
          .strength(forceStrength)
          .x(function(d) {
            return centerScale(d[byVar]);
          })
      );

      // @v4 We can reset the alpha value and restart the simulation
      simulation.alpha(2).restart();
    }

    function hideTitles() {
      svg.selectAll(".title").remove();
    }

    function showTitles(byVar, scale) {
      // Another way to do this would be to create
      // the year texts once and then just hide them.
      var titles = svg.selectAll(".title").data(scale.domain());

      titles
        .enter()
        .append("text")
        .attr("class", "title")
        .merge(titles)
        .attr("x", function(d) {
          return scale(d);
        })
        .attr("y", 40)
        .attr("text-anchor", "middle")
        .text(function(d) {
          continent = groupToContinent(d);
          return continent;
          //return byVar + ' ' + d;
        });

      titles.exit().remove();
    }

    function resetGroupButtons() {
      d3.selectAll(".button").classed("active", false);
      var button = d3.select("#all");
      button.classed("active", true);
    }

    function setupGroupButtons() {
      d3.selectAll(".button").on("click", function() {
        // Remove active class from all buttons
        d3.selectAll(".button").classed("active", false);
        // Find the button just clicked
        var button = d3.select(this);

        // Set it as the active button
        button.classed("active", true);

        // Get the id of the button
        var buttonId = button.attr("id");
        // Toggle the bubble chart based on
        // the currently clicked button.
        splitBubbles(buttonId);
      });
    }

    function brushInit() {
      parcoords.on("brush", function(items) {
        var selected = items.map(function(d) {
          return d.ID;
        });
        circles.each(function(d) {
          if (selected.indexOf(d.ID) > -1) {
            d3.select(this).style("opacity", 1);
          } else {
            d3.select(this).style("opacity", 0.1);
          }
        });
      });
    }

    brushInit();
    setupGroupButtons();
  }

  /** AFTER BUBBLES */

  function renderParcoords(data) {
    d3.select("#parCoordsContainer")
      .selectAll("canvas")
      .remove();
    d3.select("#parCoordsContainer")
      .selectAll("svg")
      .remove();

    parcoords = ParCoords()("#parCoordsContainer");

    parcoords
      .data(data)
      .hideAxis([
        "Country",
        "Longitude",
        "Latitude",
        "Continents",
        "ID",
        "Group",
        "r",
        "x",
        "y",
        "Gdp",
        "lognGdp",
        "index",
        "vy",
        "vx",
        "index"
      ])
      .composite("darken")
      .commonScale(true)
      .margin({ top: 20, left: 20, bottom: 10, right: 25 })
      .mode("queue")
      .render()
      .reorderable()
      .brushMode("1D-axes");
  }

  function setupWaveButtons() {
    d3.selectAll(".wave-button").on("click", function() {
      // Remove active class from all buttons
      d3.selectAll(".wave-button").classed("active", false);
      // Find the button just clicked
      var button = d3.select(this);

      // Set it as the active button
      button.classed("active", true);

      // Get the id of the button
      var buttonId = button.attr("id");

      changeWave(buttonId);
    });
  }

  function changeWave(wave) {
    d3.select("#bubbles").remove();
    d3.select(".tooltip").remove();

    if (wave == "Wave3") {
      mainData = wave3;
    } else if (wave == "Wave4") {
      mainData = wave4;
    } else if (wave == "Wave5") {
      mainData = wave5;
    } else if (wave == "Wave6") {
      mainData = wave6;
    }
    renderParcoords(mainData);
    renderBubbles(mainData);
  }

  renderParcoords(mainData);
  renderBubbles(mainData);

  setupWaveButtons();
});
