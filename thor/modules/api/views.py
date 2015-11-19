import json
import os
from django.http import HttpResponse
from thor.modules.dashboard.models import Event

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

        events = Event.objects.all().order_by("-start_date")
        json_contents = []
        for event in events:
            json_contents.append(event.to_dict())

    elif type == 'event':
        id= request.GET.get('id', 0)
        event = Event.objects.get(id=id)
        if event:
            json_contents = event.to_dict()
        else:
            json_contents = {}

    contents = {"type": type, "data": json_contents}

    return HttpResponse(json.dumps(contents), content_type="application/json")
