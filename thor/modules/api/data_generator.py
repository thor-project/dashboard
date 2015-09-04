__author__ = 'eamonnmaguire'
import json
import random

"""
Simple script to generate some random data for front end testing purposes.
"""

data_centres = ["BL.CCDC", "CDL.DPLANET", "DRYAD", "DK.GBIF", "TIB.R-GATE", "CDL.DIGSCI"]

years = ["2011", "2012", "2013", "2014", "2015"]
data_types = ["publication", "data"]
metric_types = ["doi", "orcid"]

data = []

for data_centre in data_centres:
    for year in years:
        for month in range(1, 13):
            if month < 10:
                month = "0" + str(month)

            data_item = {"date": "{}-{}-{}".format(year, month, "01"),
                         "data_centre": data_centre}

            for data_type in data_types:
                for metric_type in metric_types:
                    metric = "{}_{}_count".format(data_type, metric_type)
                    data_item[metric] = random.randint(0, 200)

            data.append(data_item)

with open('data/data_generated.json', 'w') as file:
    json.dump(data, file)

