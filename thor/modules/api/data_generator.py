import math

__author__ = 'eamonnmaguire'
import json
import random

"""
Simple script to generate some random data for front end testing purposes.
"""

metric_types = {
"orcid": [{"name": "Oxford University", "country": "United Kingdom"}, {"name": "CERN", "country": "Switzerland"},
          {"name": "Imperial College London", "country": "United Kingdom"}, {"name": "Lund University", "country": "Sweden"}, {"name": "KU Leuven", "country": "Belgium"},
          {"name": "Newcastle University", "country": "United Kingdom"}
    , {"name": "MIT", "country": "United States"}],
"doi": [{"name": "BL", "country": "United Kingdom"}, {"name": "CDL.DRYAD", "country": "United States"},
        {"name": "DATACITE", "country": "United Kingdom"}, {"name": "TIB.PANGEA", "country": "Sweden"},
        {"name": "ANDS", "country": "Australia"}, {"name": "CERN", "country": "Switzerland"}]
}

years = {"orcid": ["2013", "2014", "2015"], "doi": ["2011", "2012", "2013", "2014", "2015"]}
data_types = ["publication", "data"]
data_assignments = ["assigned", "unassigned"]

for metric_type in metric_types:
    data = []
    for data_assignment in data_assignments:
        for year in years[metric_type]:
            for month in range(1, 13):
                if month < 10:
                    month = "0" + str(month)
                for data_type in data_types:
                    data_item = {"date": "{}-{}-{}".format(year, month, "01")}
                    institution_idx = random.randint(0, len(metric_types[metric_type]) - 1)
                    data_item["institution"] = metric_types[metric_type][institution_idx]['name']
                    data_item["country"] = metric_types[metric_type][institution_idx]['country']
                    data_item["data_key"] = data_type
                    data_item["assign_status"] = data_assignment
                    data_item["data_value"] = math.floor(random.randint(1, 1000))

                    if (metric_type == 'orcid'):
                        data_item["new_orcids"] = math.floor(random.randint(1, 100))

                    data.append(data_item)

    with open('data/data_generated_' + metric_type + '.json', 'w') as file:
        json.dump(data, file)

