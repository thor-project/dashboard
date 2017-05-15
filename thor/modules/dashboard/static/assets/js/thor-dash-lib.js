/**
 * Created by eamonnmaguire on 26/08/15.
 */
var dashboard = (function () {
    var date_format = "%d %b %Y";

    var formatNumber = d3.format(",d"),
        formatDate = d3.time.format(date_format),
        formatTime = d3.time.format("%I:%M %p"),
        normalised_number_format = d3.format("s");

    var event_type_color_scale = d3.scale.ordinal().range(['#d25627', '#3b97d3', '#26b99a', '#7f8c8d']);

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
            if (d.institution) {
                d.institution = d.institution.replace(/\+/g, " ");
            }
        });
    };

    var sortByDateAscending = function (a, b) {

        if (typeof a === 'string') {
            var a = d3.time.format(date_format).parse(a);
            var b = d3.time.format(date_format).parse(b);
            return b - a;
        } else {
            return b.date - a.date;
        }

    };

    var htmlEncode = function (value) {
        return $('<div/>').text(value).html();
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
            .margins({top: 10, right: 30, bottom: 30, left: 30})
            .dimension(dimension)
            .x(d3.time.scale().domain(domain))
            .xUnits(d3.time.months)
            .renderHorizontalGridLines(true)
            .renderVerticalGridLines(true)
            .compose(composition);

        rptLine.yAxis().tickFormat(normalised_number_format);

        if (options.legend) {
            rptLine.legend(dc.legend().x(60).y(20).itemHeight(13).gap(5))
                .brushOn(true);
        }
    };

    var draw_events = function (placement, events, options) {
        var svg = d3.selectAll(placement + " svg");

        var d3tip = d3.tip()
            .attr('class', 'd3-tip')
            .html(function (d) {
                return '<p style="font-weight:bolder">' + d.name + ' </p>' +
                    '<p>' + d.date + '</p>' +
                    '<p style="color:' + event_type_color_scale(d.type) + '">'
                    + d.type + '</p><p>' + d.participant_count + ' participants.</p>';
            });

        svg.append('text').text('Events').attr({
            'x': 20,
            'y': options.height - 1
        }).style({
            'font-size': '10px',
            'fill': 'white'
        });

        svg.append('rect').attr({
            x: 60,
            y: options.height - 7,
            width: options.width - 40,
            height: 1
        }).style('fill', 'white');

        var participant_scale = d3.scale.linear().domain(d3.extent(events, function (d) {
            return d.participant_count;
        })).range([4, 7]);

        var event = svg.selectAll("g.event").data(events)
            .enter().append("g").attr('class', 'event');

        event.append('circle').attr('cx', function (d) {
            return 60 + options.xScale(new Date(d.date));
        }).attr('cy', options.height - 7).attr('r', function (d) {
            return participant_scale(d.participant_count);
        }).style('fill', function (d) {
            return event_type_color_scale(d.type);
        }).style('cursor', 'pointer');

        event.on('mouseover', d3tip.show)
            .on('mouseout', d3tip.hide);

        svg.call(d3tip);

    };

    var load_event_details = function (id) {
        d3.json('/api/events?type=event&id=' + id, function (error, event_data) {

            var data = event_data.data;

            var div = d3.select('body').append("div").attr('id', 'event-detail-modal').attr("class", "modal").style({
                'width': '500px',
                'height': '500px',
                'margin': '100px auto',
                'z-index': 1000,
                'position': 'absolute',
                'background-color': 'white'
            });
            div.append("h4").text(data.name);
            div.append("p").text(data.description);
            // show modal
            mui.overlay('on', document.getElementById('event-detail-modal'));
        })
    };

    var calculate_window_width = function () {
        return $(window).width();
    };

    var calculate_vis_width = function (window_width, normal_width_ratio) {
        if (window_width <= 900) {
            return window_width * .63;
        } else {
            return window_width * normal_width_ratio;
        }
    };

    var colorScale = d3.scale.ordinal().range(['#14A085', "#26B99A", "#3B97D3", "#955BA5", "#F29C1F", "#D25627", "#C03A2B"]);
    var typeColorScale = d3.scale.ordinal().range(['#1abc9c', '#3498db']);
    var map_intensity_colours = ["#feedde", "#fdd0a2", "#fdae6b", "#fd8d3c", "#f16913", "#d94801", "#8c2d04"];

    return {

        toggle_detail_view: function (e) {

            if ($("#table-view").hasClass("toggle-hidden")) {

                $("#table-view").animate({
                    bottom: "+=330"
                }, 400);

                $("#table-button").animate({
                    bottom: "+=300"
                }, 400);

                $("#table-button #button-txt").html("Hide Detailed List");
            } else {
                $("#table-view").animate({
                    bottom: "-=330"
                }, 400);

                $("#table-button").animate({
                    bottom: "-=300"
                }, 400);

                $("#table-button #button-txt").html("View Detailed List");
            }

            $("#table-view").toggleClass("toggle-hidden");
            $("#table-button").toggleClass("toggle-hidden");
        },

        render_general_metrics: function (data_url) {
            d3.json(data_url, function (error, result) {

                var doi_data = result.data;

                process_data(doi_data);
                
                var records = crossfilter(doi_data),
                    date = records.dimension(function (d) {
                        return d.date;
                    }),

                    value = records.dimension(function (d) {
                        return d.dois;
                    }),

                    orcids = records.dimension(function (d) {
                        return d.orcids;
                    }),

                    value_group = date.group().reduceSum(function (d) {
                        return d.dois;
                    }),

                    orcid_month = date.group().reduceSum(function (d) {
                        return d.month_orcids;
                    }),
                    orcid = date.group().reduceSum(function (d) {
                        return d.orcids;
                    }),
                    crossrefs = date.group().reduceSum(function (d) {
                        return d.crossrefs;
                    });

                // we don't use the create_composite_chart method since we need to access custom values for the
                // cumulative total group.
                var rptLine = dc.compositeChart(document.getElementById("overview-chart"));
                var minValue = value.bottom(1)[0].dois;

                var minDate = new Date(date.bottom(1)[0].date);
                var maxDate = new Date(date.top(1)[0].date);
                minDate.setDate(minDate.getDate() - 15);
                maxDate.setDate(maxDate.getDate() + 15);

                var top_value = 0;
                var cumulative_total_group = {
                    all: function () {
                        var cumulate = 0;
                        var g = [];
                        value_group.all().forEach(function (d, i) {
                            cumulate += d.value;
                            top_value = cumulate;
                            g.push({
                                key: d.key,
                                value: cumulate,
                                single_value: d.value
                            })
                        });
                        return g;
                    }
                };

                cumulative_total_group.all();

                var cumulative_crossrefs_total_group = {
                    all: function () {
                        var cumulate = 0;
                        var g = [];
                        crossrefs.all().forEach(function (d, i) {
                            cumulate += d.value;
                            top_value = cumulate;
                            g.push({
                                key: d.key,
                                value: cumulate,
                                single_value: d.value
                            })
                        });
                        return g;
                    }
                };

                cumulative_crossrefs_total_group.all();

                var max_value = Math.max(orcids.top(1)[0].orcids, top_value);
                var gap = 15, translate = 2;

                var window_width = calculate_window_width();
                var xScale = d3.time.scale().domain([minDate, maxDate]);
                rptLine
                    .width(calculate_vis_width(window_width, 0.85))
                    .height(300)
                    .margins({top: 10, right: 40, bottom: 30, left: 60})
                    .dimension(date)
                    .x(xScale)
                    .y(d3.scale.sqrt().domain([minValue, max_value]))

                    .xUnits(function () {
                        return 55;
                    })
                    .renderHorizontalGridLines(true)
                    .renderVerticalGridLines(true)
                    .compose([
                        dc.barChart(rptLine).gap(gap)
                            .group(crossrefs, 'Crossrefs per month').colors('#8a4fa2'),

                        dc.lineChart(rptLine)
                            .dimension(date)
                            .group(cumulative_crossrefs_total_group, 'Cumulative Crossrefs')
                            .colors('#8a4fa2')
                            .valueAccessor(function (d) {
                                return d.value
                            }).dotRadius(5)
                            .dashStyle([5, 5]),
                            
                        dc.barChart(rptLine).gap(gap)
                            .group(cumulative_total_group, 'DOIs per month').colors('#2980b9')
                            .valueAccessor(function (d) {
                                return d.single_value;
                            }),

                        dc.lineChart(rptLine)
                            .dimension(date)
                            .group(cumulative_total_group, 'Cumulative DOIs')
                            .colors('#3b97d3')
                            .valueAccessor(function (d) {
                                return d.value
                            }).dotRadius(5)
                            .dashStyle([5, 5]),

                        dc.barChart(rptLine).gap(gap).colors('#16a085')
                            .group(orcid_month, 'ORCID iDs per month'),

                        dc.lineChart(rptLine)
                            .dimension(date)
                            .group(orcid, 'Cumulative ORCID iDs')
                            .colors('#16a085')
                            .xUnits(d3.time.months)
                            .dashStyle([5, 5]),
                    ]);

                rptLine.yAxis().tickFormat(normalised_number_format);

                rptLine.legend(dc.legend().x(60).y(20).itemHeight(13).gap(5))
                    .brushOn(false);

                dc.renderAll();
            });
        },

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

                    restrictions = records.dimension(function (d) {
                        return d.restriction;
                    }),

                    country_dois2 = country_2.group().reduceSum(function (d) {
                        return d.data_value;
                    }),

                    country_dois = country.group().reduceSum(function (d) {
                        return d.data_value;
                    }),

                    restrictions_orcids = restrictions.group().reduceSum(function (d) {
                        return d.data_value;
                    }),

                    restrictions_date_orcids = date.group().reduceSum(function (d) {
                        if (d.restriction === 'with_orcids') {
                            return d.data_value;
                        } else {
                            return 0;
                        }
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
                            g.push({
                                key: d.key,
                                value: cumulate,
                                single_value: d.value
                            })
                        });
                        return g;
                    }
                };

                cumulative_total_group.all();

                var cumulative_orcid_group = {
                    all: function () {
                        var cumulate = 0;
                        var g = [];
                        restrictions_date_orcids.all().forEach(function (d, i) {
                            cumulate += d.value;
                            g.push({
                                key: d.key,
                                value: cumulate,
                                single_value: d.value
                            })
                        });
                        return g;
                    }
                };

                cumulative_orcid_group.all();

                var minValue = value.bottom(1)[0].data_value;

                var minDate = new Date(date.bottom(1)[0].date);
                var maxDate = new Date(date.top(1)[0].date);
                minDate.setDate(minDate.getDate() - 15);
                maxDate.setDate(maxDate.getDate() + 15);


                var window_width = calculate_window_width();
                var country_details_chart = dc.rowChart("#country-details");

                country_details_chart.width(calculate_vis_width(window_width, 0.24))
                    .height(350)
                    .dimension(country_2)
                    .group(country_dois2)
                    .elasticX(true);
                country_details_chart.colors(d3.scale.ordinal().range(map_intensity_colours));
                country_details_chart.xAxis().ticks(5);
                country_details_chart.xAxis().tickFormat(normalised_number_format);

                d3.json("/static/assets/geo/world-countries.json", function (worldcountries) {
                    var chart = dc.geoChoroplethChart("#map");
                    chart.dimension(country)
                        .group(country_dois)
                        .projection(d3.geo.mercator()
                            .scale(120)
                            .translate([350, 220]))
                        .width(calculate_vis_width(window_width, 0.48))
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

                rptLine
                    .width(calculate_vis_width(window_width, 0.85))
                    .height(300)
                    .margins({top: 10, right: 50, bottom: 30, left: 60})
                    .dimension(date)
                    .x(d3.time.scale().domain([minDate, maxDate]))
                    .xUnits(d3.time.months)
                    .y(d3.scale.sqrt().domain([minValue, top_value]))
                    .renderHorizontalGridLines(true)

                    .renderVerticalGridLines(true)
                    .compose([
                        dc.lineChart(rptLine)
                            .dimension(date)
                            .group(cumulative_total_group, 'Cumulative DOIs Minted')
                            .valueAccessor(function (d) {
                                return d.value
                            })
                            .x(d3.time.scale().domain([minDate, maxDate]))
                            .xUnits(d3.time.months)
                            .dotRadius(5),

                        dc.lineChart(rptLine)
                            .dimension(date)
                            .group(cumulative_orcid_group, 'DOIs with ORCID iDs')
                            .colors('#8a4fa2')
                            .valueAccessor(function (d) {

                                return d.value
                            })
                            .x(d3.time.scale().domain([minDate, maxDate]))
                            .xUnits(d3.time.months),

                        dc.barChart(rptLine)
                            .dimension(date)
                            .group(cumulative_total_group, 'Monthly DOIs Minted')
                            .valueAccessor(function (d) {
                                return d.single_value
                            })
                            .colors('#3498db')
                            .x(d3.time.scale().domain([minDate, maxDate]))
                            .xUnits(d3.time.months)
                    ]);
                rptLine.legend(dc.legend().x(60).y(20).itemHeight(13).gap(5));


                rptLine.yAxis().tickFormat(normalised_number_format);

                var doiCentreChart = dc.rowChart('#institution-chart');
                doiCentreChart.width(calculate_vis_width(window_width, 0.31))
                    .height(400)
                    .dimension(institution)
                    .group(institution_group);
                doiCentreChart.colors('#2980BA');
                doiCentreChart.xAxis().ticks(5);
                doiCentreChart.xAxis().tickFormat(normalised_number_format);
                doiCentreChart.elasticX(true);

                var orcidChart = dc.rowChart('#orcid-chart');
                orcidChart.width(calculate_vis_width(window_width, 0.25))
                    .height(230)
                    .dimension(restrictions)
                    .group(restrictions_orcids);
                orcidChart.xAxis().tickFormat(normalised_number_format);
                orcidChart.xAxis().ticks(5);
                orcidChart.colors(typeColorScale);
                orcidChart.elasticX(true);


                var objectTypeChart = dc.rowChart('#object-type');
                objectTypeChart.width(calculate_vis_width(window_width, 0.25))
                    .height(290)
                    .dimension(object)
                    .group(object_group);
                objectTypeChart.colors(colorScale);
                objectTypeChart.xAxis().ticks(5);
                objectTypeChart.xAxis().tickFormat(normalised_number_format);
                objectTypeChart.elasticX(true);

                var detailTable = dc.dataTable('.dc-data-table');
                detailTable.dimension(date)

                    .group(function (d) {
                        return formatDate(d.date);
                    })
                    .size(100)
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
                            return d.data_value;
                        }
                    ])
                    .sortBy(function (d) {
                        return d.date;
                    })
                    .order(sortByDateAscending);

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

                    date_funding = records.dimension(function (d) {
                        return d.date;
                    }),

                    date_employment = records.dimension(function (d) {
                        return d.date;
                    }),

                    date_ids_live = records.dimension(function (d) {
                        return d.date;
                    }),

                    date_ids_works = records.dimension(function (d) {
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

                    ids_with_works = date_ids_works.group().reduceSum(function (d) {
                        return d.idsWithWorks;
                    }),

                    ids_with_works_month = date_ids_works.group().reduceSum(function (d) {
                        return d.idsWithWorks_month;
                    }),

                    funding = date_funding.group().reduceSum(function (d) {
                        return d.funding;
                    }),

                    funding_month = date_ids_works.group().reduceSum(function (d) {
                        return d.funding_month;
                    }),

                    employment = date_employment.group().reduceSum(function (d) {
                        return d.employment;
                    }),

                    employment_month = date_employment.group().reduceSum(function (d) {
                        return d.employment_month;
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

                var window_width = calculate_window_width();


                create_composite_chart('monthly-chart', date_ids_live, domain,
                    [{
                        'group': works,
                        'label': 'Works',
                        'type': 'line',
                        'colors': '#8a4fa2'
                    },
                        {
                            'group': unique_dois,
                            'label': 'Unique DOIs',
                            'type': 'line',
                            'colors': '#4aa3df'
                        },
                        {
                            'group': liveIds,
                            'label': 'Live ORCID iDs',
                            'type': 'line',
                            'colors': '#16a085'
                        },
                        {
                            'group': ids_verified,
                            'label': 'Verified ORCID iDs',
                            'type': 'line',
                            'colors': '#2ecc71'
                        },
                        {
                            'group': ids_with_works,
                            'label': 'ORCID iDs with Works',
                            'type': 'line',
                            'colors': '#8a4fa2'
                        },
                        {
                            'group': funding,
                            'label': 'ORCID iDs with Funding Info',
                            'type': 'line',
                            'colors': '#bdc3c7'
                        },
                        {
                            'group': employment,
                            'label': 'ORCID iDs with Employment Info',
                            'type': 'line',
                            'colors': '#e74c3c'
                        }
                    ], {
                        'width': calculate_vis_width(window_width, 0.9),
                        'height': 200,
                        'legend': true
                    }
                );

                var options = {
                    'width': calculate_vis_width(window_width, 0.35),
                    'height': 200
                };
                var options_sml = {
                    'width': calculate_vis_width(window_width, 0.24),
                    'height': 200
                };

                create_composite_chart('works-chart', date_works, domain,
                    [{
                        'group': works_month,
                        'type': 'bar',
                        'colors': ['#8a4fa2']
                    }, {
                        'group': works,
                        'type': 'line',
                        'colors': ['#8a4fa2']
                    }],
                    options);

                create_composite_chart('liveids-chart', date_ids_live, domain,
                    [{
                        'group': liveIds_month,
                        'type': 'bar',
                        'colors': ['#16a085']
                    }, {
                        'group': liveIds,
                        'type': 'line',
                        'colors': ['#16a085']
                    }],
                    options);


                create_composite_chart('verified-ids-chart', date_ids_verified, domain,
                    [{
                        'group': ids_verified_month,
                        'type': 'bar',
                        'colors': ['#2ecc71']
                    }, {
                        'group': ids_verified,
                        'type': 'line',
                        'colors': ['#2ecc71']
                    }],
                    options);


                create_composite_chart('unique-dois-chart', date_unique_dois, domain,
                    [{
                        'group': unique_dois_month,
                        'type': 'bar',
                        'colors': ['#4aa3df']
                    }, {
                        'group': unique_dois,
                        'type': 'line',
                        'colors': ['#4aa3df']
                    }],
                    options);


                create_composite_chart('ids-works-chart', date_ids_works, domain,
                    [{
                        'group': ids_with_works_month,
                        'type': 'bar',
                        'colors': '#8a4fa2'
                    }, {
                        'group': ids_with_works,
                        'type': 'line',
                        'colors': '#8a4fa2'
                    }],
                    options_sml);

                create_composite_chart('funding-chart', date_funding, domain,
                    [{
                        'group': funding_month,
                        'type': 'bar',
                        'colors': ['#bdc3c7']
                    }, {
                        'group': funding,
                        'type': 'line',
                        'colors': '#bdc3c7'
                    }],
                    options_sml);

                create_composite_chart('employment-chart', date_funding, domain,
                    [{
                        'group': employment_month,
                        'type': 'bar',
                        'colors': '#e74c3c'
                    }, {
                        'group': employment,
                        'type': 'line',
                        'colors': '#e74c3c'
                    }],
                    options_sml);


                var detailTable = dc.dataTable('.dc-data-table');
                detailTable.dimension(date_works)
                    .group(function (d) {
                        return formatDate(d.date);
                    })
                    .size(100)
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
                        },

                        function (d) {
                            return d.ids_with_works_month
                        },

                        function (d) {
                            return d.funding_month
                        },

                        function (d) {
                            return d.employment_month
                        }
                    ]).sortBy(function (d) {
                        return d.date;
                    })
                    .order(sortByDateAscending);

                dc.renderAll();
            });
        },

        render_crossrefs_metrics: function (data_url) {
            d3.json(data_url, function (error, result) {

                var crossref_data = result.data.crossrefs_by_month;
                //var crossref_orcids = result.data.test;

                process_data(crossref_data);
                
                var records = crossfilter(crossref_data),
                    date = records.dimension(function (d) {
                        return d.date;
                    }),

                    value = records.dimension(function (d) {
                        return d.total_items;
                    }),

                    crossrefs = date.group().reduceSum(function (d) {
                        return d.total_items;
                    }),

                    restriction = records.dimension(function (d) {
                        return d.restriction;
                    }),

                    restriction_crossrefs = restriction.group().reduceSum(function (d) {
                        return d.total_items;
                    });

                    

                // we don't use the create_composite_chart method since we need to access custom values for the
                // cumulative total group.
                var rptLine = dc.compositeChart(document.getElementById("crossref-chart"));
                var minValue = value.bottom(1)[0].total_items;

                var minDate = new Date(date.bottom(1)[0].date);
                var maxDate = new Date(date.top(1)[0].date);
                minDate.setDate(minDate.getDate() - 15);
                maxDate.setDate(maxDate.getDate() + 15);

                var top_value = 0;

                var cumulative_crossrefs_total_group = {
                    all: function () {
                        var cumulate = 0;
                        var g = [];
                        crossrefs.all().forEach(function (d, i) {
                            cumulate += d.value;
                            top_value = cumulate;
                            g.push({
                                key: d.key,
                                value: cumulate,
                                single_value: d.value
                            })
                        });
                        return g;
                    }
                };

                cumulative_crossrefs_total_group.all();
                var max_value = Math.max(crossrefs.top(1)[0].value, top_value);
                var gap = 15, translate = 2;

                var window_width = calculate_window_width();
                var xScale = d3.time.scale().domain([minDate, maxDate]);
                rptLine
                    .width(calculate_vis_width(window_width, 0.85))
                    .height(300)
                    .margins({top: 10, right: 40, bottom: 30, left: 60})
                    .dimension(date)
                    .x(xScale)
                    .y(d3.scale.sqrt().domain([minValue, max_value]))

                    .xUnits(function () {
                        return 55;
                    })
                    .renderHorizontalGridLines(true)
                    .renderVerticalGridLines(true)
                    .compose([
                        dc.lineChart(rptLine)
                            .dimension(date)
                            .group(cumulative_crossrefs_total_group, 'Cumulative Crossrefs')
                            .colors('#8a4fa2')
                            .valueAccessor(function (d) {
                                return d.value
                            }).dotRadius(5)
                            .dashStyle([5, 5]),

                        dc.barChart(rptLine).gap(gap)
                            .group(crossrefs, 'Crossrefs per month').colors('#8a4fa2'),
                    ]);

                rptLine.yAxis().tickFormat(normalised_number_format);

                rptLine.legend(dc.legend().x(60).y(20).itemHeight(13).gap(5))
                    .brushOn(true);

                var orcidChart = dc.rowChart('#orcid-chart');
                orcidChart.width(calculate_vis_width(window_width, 0.85))
                    .height(230)
                    .dimension(restriction)
                    .group(restriction_crossrefs);
                orcidChart.xAxis().tickFormat(normalised_number_format);
                orcidChart.xAxis().ticks(5);
                orcidChart.colors(typeColorScale);
                orcidChart.elasticX(true);

                dc.renderAll();
            });
        },

        register_resize_listener: function (type, url) {

            var rtime;
            var timeout = false;
            var delta = 200;
            $(window).resize(function () {
                rtime = new Date();
                if (timeout === false) {
                    timeout = true;
                    setTimeout(resizeend, delta);
                }
            });

            function resizeend() {
                if (new Date() - rtime < delta) {
                    setTimeout(resizeend, delta);
                } else {
                    timeout = false;
                    if (type === "doi") {
                        dashboard.render_doi_metrics(url);
                    } else if (type == "orcid") {
                        dashboard.render_orcid_metrics(url);
                    } else if (type == "crossrefs") {
                        dashboard.render_crossrefs_metrics(url);
                    } else {
                        dashboard.render_general_metrics(url);
                    }
                }
            }
        },

        render_event_calendar: function (placement, data_url, options) {


            var cellSize = options.cellSize;

            var format = d3.time.format("%Y-%m-%d"),
                format_month = d3.time.format("%b");

            var svg = d3.select(placement).selectAll("svg")
                .data([2015, 2016])
                .enter().append("svg")
                .attr("width", options.width)
                .attr("height", options.height)
                .attr("class", "RdYlGn")
                .append("g")
                .attr("transform", "translate(50,20)");

            svg.append('text').text(function (d, i) {
                return d;
            }).attr('y', function (d, i) {
                return (options.height / 2);
            }).attr('transform', 'translate(-50, -10)');

            var rect = svg.selectAll(".day")
                .data(function (d) {
                    return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1));
                })
                .enter().append("rect")
                .attr("id", function (d) {
                    return "d" + format(d)
                })
                .attr("class", "day")
                .attr("width", cellSize)
                .attr("height", cellSize)
                .attr("x", function (d) {
                    return d3.time.weekOfYear(d) * cellSize;
                })
                .attr("y", function (d) {
                    return d.getDay() * cellSize;
                })
                .datum(format);

            svg.selectAll(".month")
                .data(function (d) {
                    return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1));
                })
                .enter().append("path")
                .attr("class", "month")
                .attr("d", monthPath);

            svg.selectAll("text.month-text").data(function (d) {
                return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1));
            }).enter().append("text").attr("class", "month-text").text(function (d) {
                return format_month(d)
            }).attr('x', function (d) {
                var w0 = d3.time.weekOfYear(d);
                return w0 * (cellSize);
            }).attr('y', -5);

            var opacity_color_scale = d3.scale.quantile().range([0.2, 0.4, 0.8, 1]);

            d3.json(data_url, function (error, data) {
                var event_data = data.data;

                opacity_color_scale.domain(d3.extent(event_data, function (d) {
                    return d.participants;
                }));

                var event_types = {};

                for (var idx in event_data) {
                    var event = event_data[idx];
                    event.class_name = event.type.replace(/\s+/, "");

                    d3.select("#d" + format(new Date(event.date))).datum(event)
                        .style("fill", function (d) {
                            return event_type_color_scale(d.type)
                        }).attr('class', function (d) {
                            return d.class_name + ' cal-event';
                        })
                        .style("opacity", function (d) {
                            return opacity_color_scale(+d.participants)
                        })
                        .style("cursor", 'pointer')
                        .on("click", function (d) {
                            load_event_details(d.id);
                        }).on("mouseover", function (d) {
                        d3.select("#l" + format(new Date(d.date))).classed("hover", true)
                    }).on("mouseout", function (d) {
                        d3.select("#l" + format(new Date(d.date))).classed("hover", false)
                    });

                    var tr = d3.select("#event_list").append("tr").attr('id', "l" + format(new Date(event.date))).attr("class", function (d) {
                        return event.class_name + " cal-event";
                    });
                    tr.append("td").text(event.date);
                    tr.append("td").text(event.name);
                    tr.append("td").append("span").text(event.type).attr("class", "chip").style({
                        'background-color': event_type_color_scale(event.type),
                        'color': 'white'
                    });
                    tr.append("td").text(event.country);
                    tr.append("td").text(event.participant_count);

                    tr.append("td").selectAll("span")
                        .data(event.participant_type).enter().append("span")
                        .attr("class", "chip")
                        .text(function (d) {
                        return d;
                    });

                    if (!(event.type in event_types)) {
                        event_types[event.type] = {
                            "name": event.type,
                            "value": 0
                        }
                    }
                    event_types[event.type]["value"] += 1;
                }

                var values = $.map(event_types, function (value, key) {
                    return value
                });


                var div = d3.select("#events-legend").append("div").style("margin-top", "60px");

                var type_div = div.selectAll("div").data(values).enter().append("div").style("margin-bottom", "2px");

                type_div.append("span").text(function (d) {
                    return d.value + " " + d.name;
                }).attr("class", "chip").style("background-color", function (d) {
                    return event_type_color_scale(d.name);
                }).style({'cursor': 'pointer', "color": "white"})

                    .on("mouseover", function (d) {

                        d3.selectAll(".cal-event").classed("hidden", true);
                        d3.selectAll("." + d.name.replace(/\s+/, "")).classed("hidden", false);
                    })
                    .on("mouseout", function (d) {
                        d3.selectAll(".cal-event").classed("hidden", false);
                    });


            });

            function monthPath(t0) {
                var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
                    d0 = t0.getDay(), w0 = d3.time.weekOfYear(t0),
                    d1 = t1.getDay(), w1 = d3.time.weekOfYear(t1);
                return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
                    + "H" + w0 * cellSize + "V" + 7 * cellSize
                    + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
                    + "H" + (w1 + 1) * cellSize + "V" + 0
                    + "H" + (w0 + 1) * cellSize + "Z";
            }

        }
    }
})();
