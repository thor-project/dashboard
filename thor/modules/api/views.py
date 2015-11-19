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


def get_events(request):
    """

    :param request:
    :return:
    """
    type = request.GET.get('type', 'event_calendar')

    if type == 'event_calendar':
        json_contents = [{'id': 0, 'date': '2015-05-08', 'type': 'workshop', 'participants': 30},
                         {'id': 1, 'date': '2015-05-10', 'type': 'webinar', 'participants': 30},
                         {'id': 2, 'date': '2015-05-11', 'type': 'conference', 'participants': 2},
                         {'id': 2, 'date': '2015-05-17', 'type': 'webinar', 'participants': 2}]

    elif type == 'event':
        id= request.GET.get('id', 0)
        json_contents = {'id': id, 'participants': 30, 'country': 'United Kingdom', 'name': 'EMBL Teaching', 'description': 'something interesting here.'}

    contents = {"type": type, "data": json_contents}

    return HttpResponse(json.dumps(contents), content_type="application/json")
