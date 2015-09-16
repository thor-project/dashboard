import unittest
from thor.modules.harvester.harvester import ORCIDHarvester, DATACiteHarvester

__author__ = 'eamonnmaguire'


class ORCIDHarvestTest(unittest.TestCase):
    def setUp(self):
        self.harvester = ORCIDHarvester()


    def test_harvest_stats(self):
        _dict = self.harvester.harvest()

        for statistic in self.harvester.get_available_statistics():
            self.assertTrue(len(_dict['stats'][statistic]) > 0, msg="{} should have returned results".format(statistic))
        print _dict['stats']


class DataCiteHarvestTest(unittest.TestCase):
    def setUp(self):
        self.harvester = DATACiteHarvester()

    def test_harvest_publishers(self):
        _dict = self.harvester.get_publishers()
        self.assertTrue(len(_dict)['publishers'] > 0)

    def test_harvest_work_types(self):
        _dict = self.harvester.get_work_types()
        self.assertTrue(len(_dict)['work_types'] > 0)

    def test_harvest_works(self):
        test_publisher_id = "340"  # for PLOS
        test_work_type = "article"

        _dict = self.harvester.get_works()
        self.assertTrue(len(_dict)['publishers'] > 0)