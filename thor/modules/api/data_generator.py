import math

__author__ = 'eamonnmaguire'
import json
import random

"""
Simple script to generate some random data for front end testing purposes.
"""

metric_types = {
    "orcid": [{"name": "Oxford University", "country": "United Kingdom", "max": 320, "types": ["publication"]},
              {"name": "CERN", "country": "Switzerland", "max": 250, "types": ["publication", "data"]},
              {"name": "Imperial College London", "country": "United Kingdom", "max": 150, "types": ["publication", "data"]},
              {"name": "Lund University", "country": "Sweden", "max": 100, "types": ["publication", "data"]},
              {"name": "KU Leuven", "country": "Belgium", "max": 120, "types": ["publication", "data"]},
              {"name": "Newcastle University", "country": "United Kingdom", "max": 200, "types": ["publication", "data"]},
              {"name": "MIT", "country": "United States", "max": 200, "types": ["publication", "data"]},
              {"name": "Harvard University", "country": "United States", "max": 300, "types": ["publication", "data"]}
              ],

    "doi": [{"name": "BL", "country": "United Kingdom", "max": 1000, "types": ["publication"]},
            {"name": "CDL.DRYAD", "country": "United States", "max": 1200, "types": ["data"]},
            {"name": "DATACITE", "country": "United Kingdom", "max": 2000, "types": ["data", "publication"]},
            {"name": "TIB.PANGEA", "country": "Sweden", "max": 300, "types": ["data", "publication"]},
            {"name": "ANDS", "country": "Australia", "max": 600, "types": ["publication"]},
            {"name": "CERN", "country": "Switzerland", "max": 200, "types": ["data", "publication"]}]
}

years = {"orcid": ["2013", "2014", "2015"], "doi": ["2011", "2012", "2013", "2014", "2015"]}

data_assignments = ["assigned", "unassigned"]

for metric_type in metric_types:
    data = []
    for data_assignment in data_assignments:
        for year in years[metric_type]:
            for month in range(1, 13):
                if month < 10:
                    month = "0" + str(month)

                institution_idx = random.randint(0, len(metric_types[metric_type]) - 1)
                institution = metric_types[metric_type][institution_idx]

                for data_type in institution['types']:
                    data_item = {"date": "{}-{}-{}".format(year, month, "01")}
                    data_item["institution"] = institution['name']
                    data_item["country"] = institution['country']
                    data_item["data_key"] = data_type
                    data_item["assign_status"] = data_assignment
                    data_item["data_value"] = math.floor(random.randint(1, institution['max']))

                    if (metric_type == 'orcid'):
                        data_item["new_orcids"] = math.floor(random.randint(1, 100))

                    data.append(data_item)

    with open('data/data_generated_' + metric_type + '.json', 'w') as file:
        json.dump(data, file)

