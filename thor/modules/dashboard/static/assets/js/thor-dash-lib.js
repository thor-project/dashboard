/**
 * Created by eamonnmaguire on 26/08/15.
 */
// (It's CSV, but GitHub Pages only gzip's JSON at the moment.)
function load_data(url) {
    d3.json(url, function (error, result) {

        var data = result.data;
        var type = result.type;
        // Various formatters.
        var formatNumber = d3.format(",d"),
            formatDate = d3.time.format("%d %b %Y"),
            formatTime = d3.time.format("%I:%M %p");

        // A nest operator, for grouping the flight list.
        var nestByDate = d3.nest()
            .key(function (d) {
                return d3.time.day(d.date);
            });

        // Store the number of DOIs minted per month

        data.forEach(function (d, i) {
            d.index = i;
            d.date = parseDate(d.date);
        });

        function parseDate(d) {
            return new Date(d.substring(0, 4),
                d.substring(5, 7) - 1,
                d.substring(8));
        }

        var top_value = 0;


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

            assignment = records.dimension(function (d) {
                return d.assign_status;
            }),

            country = records.dimension(function (d) {
                return d.country;
            }),

            country_orcids = country.group().reduceSum(function (d) {
                return d.new_orcids;
            }),

            assignment_group = assignment.group().reduceSum(function (d) {
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

        var colorScale = d3.scale.ordinal().range(['#14A085', "#26B99A", "#3B97D3", "#955BA5", "#F29C1F", "#D25627", "#C03A2B"]);
        var map_intensity_colours = ["#feedde", "#fdd0a2", "#fdae6b", "#fd8d3c", "#f16913", "#d94801", "#8c2d04"];
        if (type == 'orcid') {

            var breakdown_chart = dc.barChart('#breakdown-chart').width(300)
                .height(200)
                .margins({top: 10, right: 20, bottom: 30, left: 40})
                .dimension(date)
                .group(new_id_group)
                .xUnits(d3.time.months)
                .x(d3.time.scale().domain([minDate, maxDate]));

            var country_details_chart = dc.rowChart("#country-details");

            country_details_chart.width(300)
                .height(300)
                .dimension(country)
                .group(country_orcids);
            country_details_chart.colors(d3.scale.ordinal().range(map_intensity_colours));
            country_details_chart.xAxis().ticks(5);


            d3.json("/static/assets/geo/world-countries.json", function (worldcountries) {
                var chart = dc.geoChoroplethChart("#orcid-map");
                chart.dimension(country)
                    .group(country_orcids)
                    .projection(d3.geo.mercator()
                        .scale(130)
                        .translate([400, 220]))
                    .width(990)
                    .height(390)

                    .colors(d3.scale.quantize().range(map_intensity_colours).domain([0, 5000]))

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
        } else {
            var breakdown_chart = dc.barChart('#breakdown-chart').width(300)
                .height(200)
                .margins({top: 10, right: 20, bottom: 30, left: 60})
                .dimension(value)
                .group(value_group)
                .x(d3.scale.linear().domain([Math.min(minValue, 0), (maxValue + 10)]))
                .yAxis().ticks(5);
        }


        //console.log(cumulative_doi_group);
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
            .height(200)
            .dimension(institution)
            .group(institution_group);
        doiCentreChart.colors(colorScale);
        doiCentreChart.xAxis().ticks(5);

        var objectTypeChart = dc.pieChart('#object-type');
        objectTypeChart.width(300)
            .height(190)
            .dimension(object)
            .group(object_group);
        objectTypeChart.colors(colorScale);

        var assignmentChart = dc.pieChart('#assignment');
        assignmentChart.width(300)
            .height(190)
            .dimension(assignment)
            .group(assignment_group);
        assignmentChart.colors(colorScale);

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
                },

                function (d) {
                    if (type == 'orcid') {
                        return d.new_orcids;
                    }
                }
            ])
        ;

        dc.renderAll();

    });
}