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

    if type == 'aggregate':
        orcid = json.load(open(base_dir + '/data/data_orcid.json', 'r'))
        doi = json.load(open(base_dir + '/data/data_doi.json', 'r'))

        aggregated = {}

        for orcid_item in orcid:
            aggregated[orcid_item['date']] = {'date': orcid_item['date']}
            aggregated[orcid_item['date']]['orcids'] = orcid_item['liveIds']
            aggregated[orcid_item['date']]['month_orcids'] = orcid_item['liveIds_month']

        json_contents = aggregated.values()

        for doi_item in doi:
            if doi_item['date'] not in aggregated:
                aggregated[doi_item['date']] = {'date': doi_item['date']}
                aggregated[doi_item['date']]['orcids'] = 0
                aggregated[doi_item['date']]['month_orcids'] = 0

            if 'dois' not in aggregated[doi_item['date']]:
                aggregated[doi_item['date']]['dois'] = 0

            aggregated[doi_item['date']]['dois'] += doi_item['data_value']


        events = Event.objects.all().order_by("-start_date")
        event_json = []
        for event in events:
            event_json.append(event.to_dict())

        contents = {"type": type, "data": json_contents, "events": event_json}
    else:
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
        id = request.GET.get('id', 0)
        event = Event.objects.get(id=id)
        if event:
            json_contents = event.to_dict()
        else:
            json_contents = {}

    contents = {"type": type, "data": json_contents}

    return HttpResponse(json.dumps(contents), content_type="application/json")
