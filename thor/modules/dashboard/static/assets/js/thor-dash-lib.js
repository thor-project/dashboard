/**
 * Created by eamonnmaguire on 26/08/15.
 */
// (It's CSV, but GitHub Pages only gzip's JSON at the moment.)
function load_data(url) {
    d3.json(url, function (error, data) {

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

        // Create the crossfilter for the relevant dimensions and groups.
        var records = crossfilter(data),

            date = records.dimension(function (d) {
                return d.date;
            }),

            institution = records.dimension(function (d) {
                return d.institution;
            }),

            institution_group = institution.group().reduceSum(function (d) {
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
            });


        var cumulative_total_group = {
            all: function () {
                var cumulate = 0;
                var g = [];
                value_date_group.all().forEach(function (d, i) {
                    cumulate += d.value;
                    g.push({key: d.key, value: cumulate, single_value: d.value})
                });
                return g;
            }
        };


        var minDoi = value.bottom(1)[0].data_value;
        var maxDOI = value.top(1)[0].data_value;

        var doiChart = dc.barChart('#breakdown-chart');
        doiChart.width(300)
            .height(200)
            .margins({top: 10, right: 20, bottom: 30, left: 50})
            .dimension(value)
            .group(value_group)
            .x(d3.scale.linear().domain([Math.min(minDoi, 0), (maxDOI + 10)]));

        doiChart.yAxis().ticks(5);


        var minDate = new Date(date.bottom(1)[0].date);
        var maxDate = new Date(date.top(1)[0].date);
        minDate.setDate(minDate.getDate() - 15);
        maxDate.setDate(maxDate.getDate() + 15);

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
            .margins({top: 10, right: 50, bottom: 30, left: 40})
            .dimension(date)
            .x(d3.time.scale().domain([minDate, maxDate]))

            .xUnits(d3.time.months)
            .renderHorizontalGridLines(true)
            .renderVerticalGridLines(true)

            .compose([
                cumulative_lc, bar_chart
            ]);


        //var orcidTimeChart = dc.barChart('#monthly-chart');
        //orcidTimeChart.width(900)
        //    .height(200)
        //    .margins({top: 10, right: 20, bottom: 30, left: 50})
        //    .dimension(date)
        //    .group(value_date_group)
        //    .x(d3.time.scale().domain([minDate, maxDate]));
        //
        //orcidTimeChart.yAxis().ticks(5);


        var colorScale = d3.scale.ordinal().range(['#14A085', "#26B99A", "#3B97D3", "#955BA5", "#F29C1F", "#D25627", "#C03A2B"]);

        var doiCentreChart = dc.rowChart('#institution-chart');
        doiCentreChart.width(300)
            .height(200)
            .dimension(institution)
            .group(institution_group)
        doiCentreChart.colors(colorScale);
        doiCentreChart.xAxis().ticks(5);


        var objectTypeChart = dc.pieChart('#object-type');
        objectTypeChart.width(300)
            .height(190)
            .dimension(object)
            .group(object_group)
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
            ])
        ;


        // Render the total.
        //d3.selectAll("#total")
        //    .text(formatNumber(records.size()));

        dc.renderAll();

    });
}