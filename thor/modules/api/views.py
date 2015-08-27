import json
import os
from django.http import HttpResponse

__author__ = 'eamonnmaguire'

def get_data(request):
    """
    Returns a flatted JSON dump of the citation information
    :param request:
    :return:
    """
    base_dir = os.path.dirname(os.path.realpath(__file__))
    json_contents = json.load(open(base_dir + '/data/data_flat.json', 'r'))

    return HttpResponse(json.dumps(json_contents), content_type="application/json")