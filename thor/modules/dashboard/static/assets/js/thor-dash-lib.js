/**
 * Created by eamonnmaguire on 26/08/15.
 */

THOR = function () {

    return {
        render_data: function (url) {
            d3.json(url, function (data) {
                var ndx = crossfilter(data.data);

                var total_minted_dim = ndx.dimension(function (d) {
                    return d.data_doi_count;
                });

                console.log(total_minted_dim);

                var total_orcids_dim = ndx.dimension(function (d) {
                    return d.data_orcid_count;
                });

                var data_centre = ndx.dimension(function (d) {
                    return d.data_centre;
                });


                var total_minted_dim_50 = total_minted_dim.filter(30);
                THOR.print_filter(total_minted_dim_50);
            });

        },

        print_filter: function (f) {

            if (typeof(f.length) != "undefined") {
            } else {
            }
            if (typeof(f.top) != "undefined") {
                f = f.top(Infinity);
            } else {
            }
            if (typeof(f.dimension) != "undefined") {
                f = f.dimension(function (d) {
                    return "";
                }).top(Infinity);
            } else {
            }
            console.log(f + "(" + f.length + ") = " + JSON.stringify(f).replace("[", "[\n\t").replace(/}\,/g, "},\n\t").replace("]", "\n]"));
        }
    }
}();

THOR.render_data('/api/get_data');