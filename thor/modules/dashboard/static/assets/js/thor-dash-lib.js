/**
 * Created by eamonnmaguire on 26/08/15.
 */
var dashboard = (function () {
    // Various formatters.
    var formatNumber = d3.format(",d"),
        formatDate = d3.time.format("%d %b %Y"),
        formatTime = d3.time.format("%I:%M %p");

    // A nest operator, for grouping the flight list.
    var nestByDate = d3.nest()
        .key(function (d) {
            return d3.time.day(d.date);
        });

    var parseDate = function (d) {
        return new Date(d.substring(0, 4),
            d.substring(5, 7) - 1,
            d.substring(8));
    };

    var process_data = function (data) {
        data.forEach(function (d, i) {
            d.index = i;
            d.date = parseDate(d.date);
        });
    };

    var colorScale = d3.scale.ordinal().range(['#14A085', "#26B99A", "#3B97D3", "#955BA5", "#F29C1F", "#D25627", "#C03A2B"]);
    var map_intensity_colours = ["#feedde", "#fdd0a2", "#fdae6b", "#fd8d3c", "#f16913", "#d94801", "#8c2d04"];

    return {
        render_doi_metrics: function (data_url) {
            d3.json(data_url, function (error, result) {

                var data = result.data;
                process_data(data);

                var records = crossfilter(data),

                    date = records.dimension(function (d) {
                        return d.date;
                    }),

                    date_2 = records.dimension(function (d) {
                        return d.date;
                    }),

                    institution = records.dimension(function (d) {
                        return d.institution;
                    }),

                    institution_group = institution.group().reduceSum(function (d) {
                        return d.data_value;
                    }),


                    country = records.dimension(function (d) {
                        return d.country;
                    }),

                    country_2 = records.dimension(function (d) {
                        return d.country;
                    }),

                    country_dois2 = country_2.group().reduceSum(function (d) {
                        return d.data_value;
                    }),

                    country_dois = country.group().reduceSum(function (d) {
                        return d.data_value;
                    }),


                    object = records.dimension(function (d) {
                        return d.data_key;
                    }),

                    object_group = object.group().reduceSum(function (d) {
                        return d.data_value;
                    }),

                    value = records.dimension(function (d) {
                        return d.data_value;
                    }),
                    value_group = value.group(Math.floor),


                    value_date_group = date.group().reduceSum(function (d) {
                        return d.data_value;
                    }),

                    new_id_group = date_2.group().reduceSum(function (d) {
                        return d.new_orcids;
                    });


                var top_value = 0;
                var cumulative_total_group = {
                    all: function () {
                        var cumulate = 0;
                        var g = [];
                        value_date_group.all().forEach(function (d, i) {
                            cumulate += d.value;
                            top_value = cumulate;
                            g.push({key: d.key, value: cumulate, single_value: d.value})
                        });
                        return g;
                    }
                };

                cumulative_total_group.all();

                var minValue = value.bottom(1)[0].data_value;
                var maxValue = value.top(1)[0].data_value;

                var minDate = new Date(date.bottom(1)[0].date);
                var maxDate = new Date(date.top(1)[0].date);
                minDate.setDate(minDate.getDate() - 15);
                maxDate.setDate(maxDate.getDate() + 15);


                var country_details_chart = dc.rowChart("#country-details");

                country_details_chart.width(300)
                    .height(200)
                    .dimension(country_2)
                    .group(country_dois2)
                    .elasticX(true);
                country_details_chart.colors(d3.scale.ordinal().range(map_intensity_colours));
                country_details_chart.xAxis().ticks(5);

                d3.json("/static/assets/geo/world-countries.json", function (worldcountries) {
                    var chart = dc.geoChoroplethChart("#map");
                    chart.dimension(country)
                        .group(country_dois)
                        .projection(d3.geo.mercator()
                            .scale(130)
                            .translate([400, 220]))
                        .width(990)
                        .height(390)

                        .colors(d3.scale.quantize().range(map_intensity_colours).domain([0, country_dois.top(1)[0].value]))

                        .colorCalculator(function (d) {
                            return d ? chart.colors()(d) : '#26B99A';
                        })

                        .overlayGeoJson(worldcountries.features, "country", function (d) {
                            return d.properties.name;
                        })
                        .title(function (d) {
                            return d.key + " : " + d.value;
                        });


                    dc.renderAll();
                });


                var rptLine = dc.compositeChart(document.getElementById("monthly-chart"));

                var cumulative_lc = dc.lineChart(rptLine)
                    .dimension(date)
                    .group(cumulative_total_group)
                    .valueAccessor(function (d) {
                        return d.value
                    })
                    .x(d3.time.scale().domain([minDate, maxDate]))
                    .xUnits(d3.time.months)
                    .dotRadius(5)
                    .title(function (d) {
                        return formatDate(d.data.key) + "\nValue: " + d.data.single_value + "\nCumulative = " + d.data.value;
                    });

                var bar_chart = dc.barChart(rptLine)
                    .dimension(date)
                    .group(cumulative_total_group)
                    .valueAccessor(function (d) {
                        return d.single_value
                    })
                    .x(d3.time.scale().domain([minDate, maxDate]))
                    .xUnits(d3.time.months)
                    .title(function (d) {
                        return d.single_value;
                    });

                rptLine
                    .width(980)
                    .height(200)
                    .margins({top: 10, right: 50, bottom: 30, left: 60})
                    .dimension(date)
                    .x(d3.time.scale().domain([minDate, maxDate]))
                    .xUnits(d3.time.months)
                    .y(d3.scale.sqrt().domain([minValue, top_value]))
                    .renderHorizontalGridLines(true)
                    .renderVerticalGridLines(true)
                    .compose([
                        cumulative_lc, bar_chart
                    ]);

                var doiCentreChart = dc.rowChart('#institution-chart');
                doiCentreChart.width(300)
                    .height(400)
                    .dimension(institution)
                    .group(institution_group);
                doiCentreChart.colors(colorScale);

                doiCentreChart.xAxis().ticks(5);
                doiCentreChart.elasticX(true);

                var objectTypeChart = dc.pieChart('#object-type');
                objectTypeChart.width(300)
                    .height(190)
                    .dimension(object)
                    .group(object_group);
                objectTypeChart.colors(colorScale);

                var detailTable = dc.dataTable('.dc-data-table');
                detailTable.dimension(date)
                    .group(function (d) {
                        return formatDate(d.date);
                    })
                    .columns([
                        function () {
                            return ""
                        },
                        function (d) {
                            return d.institution
                        },
                        function (d) {
                            return d.data_key
                        },
                        function (d) {
                            return d.data_value
                        }
                    ]);

                dc.renderAll();

            });
        },

        render_orcid_metrics: function (data_url) {
            d3.json(data_url, function (error, result) {
                var data = result.data;
                process_data(data);

                var records = crossfilter(data),

                    date_works = records.dimension(function (d) {
                        return d.date;
                    }),

                    date_ids_live = records.dimension(function (d) {
                        return d.date;
                    }),

                    date_worksdois = records.dimension(function (d) {
                        return d.date;
                    }),

                    date_unique_dois = records.dimension(function (d) {
                        return d.date;
                    }),

                    date_ids_verified = records.dimension(function (d) {
                        return d.date;
                    }),

                    works = date_works.group().reduceSum(function (d) {
                        return d.works;
                    }),

                    works_month = date_works.group().reduceSum(function (d) {
                        return d.works_month;
                    }),

                    liveIds = date_ids_live.group().reduceSum(function (d) {
                        return d.liveIds;
                    }),


                    liveIds_month = date_ids_live.group().reduceSum(function (d) {
                        return d.liveIds_month;
                    }),

                    works_with_dois = date_worksdois.group().reduceSum(function (d) {
                        return d.worksWithDois;
                    }),

                    works_with_dois_month = date_worksdois.group().reduceSum(function (d) {
                        return d.worksWithDois_month;
                    }),

                    unique_dois= date_unique_dois.group().reduceSum(function (d) {
                        return d.uniqueDois;
                    }),

                    unique_dois_month = date_unique_dois.group().reduceSum(function (d) {
                        return d.uniqueDois_month;
                    }),

                    ids_verified = date_ids_verified.group().reduceSum(function (d) {
                        return d.idsWithVerifiedEmail;
                    }),

                    ids_verified_month = date_ids_verified.group().reduceSum(function (d) {
                        return d.idsWithVerifiedEmail_month;
                    })
                    ;

                var minDate = new Date(date_works.bottom(1)[0].date);
                var maxDate = new Date(date_works.top(1)[0].date);
                minDate.setDate(minDate.getDate() - 15);
                maxDate.setDate(maxDate.getDate() + 15);


                //composite chart
                var rptLine = dc.compositeChart(document.getElementById("monthly-chart"));

                rptLine
                    .width(980)
                    .height(200)

                    .margins({top: 10, right: 50, bottom: 30, left: 60})
                    .dimension(date_ids_live)
                    .x(d3.time.scale().domain([minDate, maxDate]))
                    .xUnits(d3.time.months)
                    .renderHorizontalGridLines(true)
                    .renderVerticalGridLines(true)
                    .legend(dc.legend().x(60).y(10).itemHeight(13).gap(5))
                    .brushOn(false)
                    .compose([
                        dc.lineChart(rptLine)
                            .dimension(date_works)
                            .colors(['#9b59b6'])
                            .group(works, "Works")
                            .x(d3.time.scale().domain([minDate, maxDate]))
                            .xUnits(d3.time.months),
                        dc.lineChart(rptLine)
                            .dimension(date_ids_live)
                            .group(unique_dois, "Unique DOIs")
                            .colors(['#4aa3df'])
                            .x(d3.time.scale().domain([minDate, maxDate]))
                            .xUnits(d3.time.months),

                        dc.lineChart(rptLine)
                            .dimension(date_ids_live)
                            .group(works_with_dois, "Works with DOIs")
                            .colors(['#2980b9'])
                            .x(d3.time.scale().domain([minDate, maxDate]))
                            .xUnits(d3.time.months),
                        dc.lineChart(rptLine)
                            .dimension(date_ids_live)
                            .group(liveIds, "Live ORCIDs IDs")
                            .colors(['#16a085'])
                            .x(d3.time.scale().domain([minDate, maxDate]))
                            .xUnits(d3.time.months),

                        dc.lineChart(rptLine)
                            .dimension(date_ids_live)
                            .colors(["#2ecc71"])
                            .group(ids_verified, "Verified ORCIDs")
                            .x(d3.time.scale().domain([minDate, maxDate]))
                            .xUnits(d3.time.months)
                            .dotRadius(5)

                    ]);


                dc.barChart("#works-chart").width(300)
                    .height(200)
                    .dimension(date_works)
                    .group(works_month)
                    .x(d3.time.scale().domain([minDate, maxDate]))
                    .renderHorizontalGridLines(true)
                    .xUnits(d3.time.months);

                dc.barChart("#liveids-chart").width(300)
                    .height(200)
                    .dimension(date_ids_live)
                    .group(liveIds_month)
                    .x(d3.time.scale().domain([minDate, maxDate]))
                    .renderHorizontalGridLines(true)
                    .xUnits(d3.time.months);

                dc.barChart("#verified-ids-chart").width(300)
                    .height(200)
                    .dimension(date_ids_verified)
                    .group(ids_verified_month)
                    .x(d3.time.scale().domain([minDate, maxDate]))
                    .renderHorizontalGridLines(true)
                    .xUnits(d3.time.months);


                dc.barChart("#works-dois-chart").width(300)
                    .height(200)
                    .dimension(date_worksdois)
                    .group(works_with_dois_month)
                    .x(d3.time.scale().domain([minDate, maxDate]))
                    .renderHorizontalGridLines(true)
                    .xUnits(d3.time.months);

                dc.barChart("#unique-dois-chart").width(300)
                    .height(200)
                    .dimension(date_unique_dois)
                    .group(unique_dois_month)
                    .x(d3.time.scale().domain([minDate, maxDate]))
                    .renderHorizontalGridLines(true)
                    .xUnits(d3.time.months);

                var detailTable = dc.dataTable('.dc-data-table');
                detailTable.dimension(date_works)
                    .group(function (d) {
                        return formatDate(d.date);
                    }).ordering(function (d) {
                        return d.date
                    })
                    .columns([
                        function () {
                            return ""
                        },
                        function (d) {
                            return d.liveIds_month
                        },

                        function (d) {
                            return d.idsWithVerifiedEmail_month
                        },
                        function (d) {
                            return d.uniqueDois_month
                        },
                        function (d) {
                            return d.works_month
                        },
                        function (d) {
                            return d.worksWithDois_month
                        }
                    ])
                ;

                dc.renderlet(function () {
                    var divs = ["#works-dois-chart", "#liveids-chart", "#unique-dois-chart", "#verified-ids-chart", "#works-chart"];
                    for (var div in divs) {
                        d3.select(divs[div] + " svg g").attr("transform", 'translate(20, 0)');
                    }

                })
                dc.renderAll();
            });
        }
    }
})();