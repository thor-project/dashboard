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
    type = request.GET.get('type', 'orcid')
    base_dir = os.path.dirname(os.path.realpath(__file__))
    json_contents = json.load(open(base_dir + '/data/data_' + type + '.json', 'r'))

    contents = {"type": type, "data": json_contents}

    return HttpResponse(json.dumps(contents), content_type="application/json")