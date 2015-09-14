import math

__author__ = 'eamonnmaguire'
import json
import random

"""
Simple script to generate some random data for front end testing purposes.
"""

metric_types = {"orcid": ["Oxford University", "CERN", "Imperial College London", "Newcastle University", "EPFL"],
                "doi": ["BL.CCDC", "CDL.DPLANET", "DRYAD", "DK.GBIF", "TIB.R-GATE", "CDL.DIGSCI", "ANDS"]
                }

years = ["2013", "2014", "2015"]
data_types = ["publication", "data"]

for metric_type in metric_types:
    data = []
    for year in years:
        for month in range(1, 13):
            if month < 10:
                month = "0" + str(month)


            for data_type in data_types:
                data_item = {"date": "{}-{}-{}".format(year, month, "01")}
                data_item["institution"] = metric_types[metric_type][random.randint(0, len(metric_types[metric_type]) - 1)]
                data_item["data_key"] = data_type
                data_item["data_value"] = math.floor(random.gammavariate(10, 3))
                data.append(data_item)

with open('data/data_generated_' + metric_type + '.json', 'w') as file:
    json.dump(data, file)

