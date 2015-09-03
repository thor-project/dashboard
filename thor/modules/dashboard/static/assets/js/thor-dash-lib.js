/**
 * Created by eamonnmaguire on 26/08/15.
 */
// (It's CSV, but GitHub Pages only gzip's JSON at the moment.)
d3.json("/api/get_data", function (error, data) {

    // Various formatters.
    var formatNumber = d3.format(",d"),
        formatDate = d3.time.format("%b %Y"),
        formatTime = d3.time.format("%I:%M %p");

    // A nest operator, for grouping the flight list.
    var nestByDate = d3.nest()
        .key(function (d) {
            return d3.time.day(d.date);
        });

    // A little coercion, since the CSV is untyped.
    data.data.forEach(function (d, i) {
        d.index = i;
        d.date = parseDate(d.date);
        d.total_doi = (d.data_doi_count + d.publication_doi_count);
        d.total_orcid = (d.data_orcid_count + d.publication_orcid_count);
    });

    function parseDate(d) {
        return new Date(d.substring(0, 4),
            d.substring(5, 7) - 1,
            d.substring(8));
    }

    console.log(data.data);

    // Create the crossfilter for the relevant dimensions and groups.
    var records = crossfilter(data.data),

        date = records.dimension(function (d) {
            return d.date;
        }),
        dois_date = date.group().reduceSum(function (d) {
            return d.total_doi;
        }),

        centre = records.dimension(function(d) {
           return d.data_centre;
        }),

        centre_hits = centre.group().reduceSum(function(d) {
           return d.total_doi;
        }),

        doi = records.dimension(function (d) {
            return d.total_doi;
        }),
        dois = doi.group(Math.floor),
        orcid = records.dimension(function (d) {
            return d.total_orcid;
        }),
        orcids = orcid.group(Math.floor);


    var minDoi = doi.bottom(1)[0].total_doi;
    var maxDOI = doi.top(1)[0].total_doi;

    var doiChart = dc.barChart('#doi-chart');
    doiChart.width(300)
        .height(150)
        .margins({top: 10, right: 20, bottom: 30, left: 30})
        .dimension(doi)
        .group(dois)
        .elasticY(true)
        .x(d3.scale.linear().domain([Math.min(minDoi,0), maxDOI+10]));

    doiChart.yAxis().ticks(5);


    var minORCID = orcid.bottom(1)[0].total_orcid;
    var maxORCID = orcid.top(1)[0].total_orcid;

    var orcidChart = dc.barChart('#orcid-chart');
    orcidChart.width(300)
        .height(150)
        .margins({top: 10, right: 20, bottom: 30, left: 30})
        .dimension(orcid)
        .group(orcids)
        .elasticY(true)
        .x(d3.scale.linear().domain([Math.min(minORCID,0), maxORCID+10]));


    var minDate = new Date(date.bottom(1)[0].date);
    var maxDate = new Date(date.top(1)[0].date);
    minDate.setDate(minDate.getDate()-15);
    maxDate.setDate(maxDate.getDate()+15);

    var doiDateChart = dc.barChart('#monthly-doi-chart');
    doiDateChart.width(400)
        .height(150)
        .margins({top: 10, right: 20, bottom: 30, left: 30})
        .dimension(date)
        .group(dois_date)
        .elasticY(true)
        .x(d3.scale.linear().domain([minDate, maxDate]));

    doiDateChart.xAxis().tickFormat(
        function (v) {
            return formatDate(new Date(v));
        });
    doiDateChart.xAxis().ticks(6);


    var doiCentreChart = dc.pieChart('#doi-centre-chart');
    doiCentreChart.width(150)
        .height(150)
        .dimension(centre)
        .group(centre_hits);


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
                return d.data_centre
            },
            function (d) {
                return d.total_doi
            },
            function (d) {
                return d.data_doi_count
            },
            function (d) {
                return d.publication_doi_count
            },
            function (d) {
                return d.total_orcid
            },
            function (d) {
                return d.data_orcid_count
            },
            function (d) {
                return d.publication_orcid_count
            }
        ])
    ;


    // Render the total.
    //d3.selectAll("#total")
    //    .text(formatNumber(records.size()));

    dc.renderAll();

});