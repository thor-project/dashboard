import json
from django.http import HttpResponse

__author__ = 'eamonnmaguire'

def get_data(request):
    """
    Returns a flatted JSON dump of the citation information
    :param request:
    :return:
    """

    json_contents = json.load(open('data/data_flat.json', 'r'))

    return HttpResponse(json_contents, content_type="application/json")