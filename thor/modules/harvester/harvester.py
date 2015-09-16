import json

__author__ = 'eamonnmaguire'


class Harvester(object):
    def __init__(self):
        pass

    def get_url(self, url):
        import urllib2

        response = urllib2.urlopen(url)
        contents = response.read()
        # save to tmp file

        return json.loads(contents)

    def harvest(self):
        pass

    def write_as_json(self, dict, file_path):
        with open(file_path, 'w') as file:
            file.write(json.dumps(dict))

    def get_statistic(self, base_url, *args):
        try:
            return self.get_url(base_url.format(*args))
        except Exception as e:
            print e
            return []


class ORCIDHarvester(Harvester):

    _base_url = 'https://pub.orcid.org/v2.0_rc1/statistics/{}'
    _statistics_to_retrieve = ['liveIds', 'idsWithWorks', 'idsWithVerifiedEmail', 'uniqueDois', 'works']
    def harvest(self):
        # need to merge the stats into a coherent structure suitable for the front end.
        result = {"stats": {}}

        for statistic in self.get_available_statistics():
            result['stats'][statistic] = self.get_statistic(self._base_url, statistic)

        return result

    def get_available_statistics(self):
        return self._statistics_to_retrieve


class DATACiteHarvester(Harvester):
    _base_url = 'http://dlm.labs.datacite.org:80/api/{}'

    def harvest(self):
        pass

    def get_work_types(self):
        return self.get_statistic(self._base_url, 'work_types')

    def get_publishers(self):
        return self.get_statistic(self._base_url, 'publishers')

    def get_works(self, publisher_id, work_type_id):
        return self.get_statistic(self._base_url + '/{pubisher_id}/works?publisher_id={}', 'publisher', publisher_id, work_type_id)

