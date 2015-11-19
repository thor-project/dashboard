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

    /**
     * Creates a composition chart given
     * @param placement - id of the div to insert the plot
     * @param dimension - e.g. the date dimension.
     * @param domain - array defining the range [min_date, max_date]
     * @param groups - array of dictionaries defining [{'group': group_object, 'type': 'bar' or 'line', 'colors': ['red']}]
     * @param options - dictionary defining {'width': X, 'height': Y}
     */
    var create_composite_chart = function (placement, dimension, domain, groups, options) {
        var rptLine = dc.compositeChart(document.getElementById(placement));
        var composition = [];

        for (var group in groups) {
            if (groups[group]['type'] === 'line') {
                composition.push(dc.lineChart(rptLine)
                        .dimension(dimension)
                        .group(groups[group]['group'], groups[group]['label'])
                        .colors(groups[group]['colors'])
                        .x(d3.time.scale().domain(domain))
                        .xUnits(d3.time.months)
                );
            } else if (groups[group]['type'] === 'bar') {
                composition.push(dc.barChart(rptLine)
                        .dimension(dimension)
                        .group(groups[group]['group'], groups[group]['label'])
                        .colors(groups[group]['colors'])
                        .x(d3.time.scale().domain(domain))
                        .xUnits(d3.time.months)
                );
            }
        }

        rptLine
            .width(options.width)
            .height(options.height)
            .margins({top: 10, right: 20, bottom: 30, left: 20})
            .dimension(dimension)
            .x(d3.time.scale().domain(domain))
            .xUnits(d3.time.months)
            .renderHorizontalGridLines(true)
            .renderVerticalGridLines(true)
            .compose(composition)

        if (options.legend) {
            rptLine.legend(dc.legend().x(60).y(20).itemHeight(13).gap(5))
                .brushOn(false);
        }
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
                            .scale(120)
                            .translate([350, 220]))
                        .width(700)
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

                // we don't use the create_composite_chart method since we need to access custom values for the
                // cumulative total group.
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
                doiCentreChart.width(700)
                    .height(300)
                    .dimension(institution)
                    .group(institution_group);
                doiCentreChart.colors(['#2980BA']);

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

                    unique_dois = date_unique_dois.group().reduceSum(function (d) {
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


                var domain = [minDate, maxDate];

                create_composite_chart('monthly-chart', date_ids_live, domain,
                    [{'group': works, 'label': 'Works', 'type': 'line', 'colors': ['#9b59b6']},
                        {'group': unique_dois, 'label': 'Unique DOIs', 'type': 'line', 'colors': ['#4aa3df']},
                        {'group': works_with_dois, 'label': 'Works with DOIs', 'type': 'line', 'colors': ['#2980b9']},
                        {'group': liveIds, 'label': 'Live ORCIDs IDs', 'type': 'line', 'colors': ['#16a085']},
                        {'group': ids_verified, 'label': 'Verified ORCIDs', 'type': 'line', 'colors': ['#2ecc71']}
                    ],
                    {'width': 980, 'height': 200, 'legend': true});

                var options = {'width': 280, 'height': 200};
                create_composite_chart('works-chart', date_works, domain,
                    [{'group': works_month, 'type': 'bar', 'colors': ['#9b59b6']}, {
                        'group': works,
                        'type': 'line',
                        'colors': ['#9b59b6']
                    }],
                    options);

                create_composite_chart('liveids-chart', date_ids_live, domain,
                    [{'group': liveIds_month, 'type': 'bar', 'colors': ['#16a085']}, {
                        'group': liveIds,
                        'type': 'line',
                        'colors': ['#16a085']
                    }],
                    options);


                create_composite_chart('verified-ids-chart', date_ids_verified, domain,
                    [{'group': ids_verified_month, 'type': 'bar', 'colors': ['#2ecc71']}, {
                        'group': ids_verified,
                        'type': 'line',
                        'colors': ['#2ecc71']
                    }],
                    options);

                create_composite_chart('works-dois-chart', date_worksdois, domain,
                    [{'group': works_with_dois_month, 'type': 'bar', 'colors': ['#2980b9']}, {
                        'group': works_with_dois,
                        'type': 'line',
                        'colors': ['#2980b9']
                    }],
                    options);

                create_composite_chart('unique-dois-chart', date_unique_dois, domain,
                    [{'group': unique_dois_month, 'type': 'bar', 'colors': ['#4aa3df']}, {
                        'group': unique_dois,
                        'type': 'line',
                        'colors': ['#4aa3df']
                    }],
                    options);


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