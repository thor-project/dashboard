#
# This file is part of the THOR Dashboard Project.
# Copyright (C) 2016 CERN.
#
# The THOR dashboard is free software; you can redistribute it
# and/or modify it under the terms of the GNU General Public License as
# published by the Free Software Foundation; either version 2 of the
# License, or (at your option) any later version.
#
# HEPData is distributed in the hope that it will be
# useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
# General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with the THOR dashboard; if not, write to the
# Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston,
# MA 02111-1307, USA.
#
# In applying this license, CERN does not
# waive the privileges and immunities granted to it by virtue of its status
# as an Intergovernmental Organization or submit itself to any jurisdiction.

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
        crossref = json.load(open(base_dir + '/data/data_crossrefs.json', 'r'))

        aggregated = {}

        for orcid_item in orcid:
            aggregated[orcid_item['date']] = {'date': orcid_item['date']}
            aggregated[orcid_item['date']]['orcids'] = orcid_item['liveIds']
            aggregated[orcid_item['date']]['month_orcids'] = orcid_item[
                'liveIds_month']
            aggregated[orcid_item['date']]['crossrefs'] = 0

        for doi_item in doi:
            if doi_item['date'] not in aggregated:
                aggregated[doi_item['date']] = {'date': doi_item['date']}
                aggregated[doi_item['date']]['orcids'] = 0
                aggregated[doi_item['date']]['month_orcids'] = 0

            if 'dois' not in aggregated[doi_item['date']]:
                aggregated[doi_item['date']]['dois'] = 0

            aggregated[doi_item['date']]['dois'] += doi_item['data_value']
            aggregated[doi_item['date']]['crossrefs'] = 0

        for cr_item in crossref['crossrefs_by_month']:
            if cr_item['date'] not in aggregated:
                aggregated[cr_item['date']] = {'date': cr_item['date']}
                aggregated[cr_item['date']]['dois'] = 0
                aggregated[cr_item['date']]['orcids'] = 0
                aggregated[cr_item['date']]['month_orcids'] = 0

            aggregated[cr_item['date']]['crossrefs'] = cr_item['total_items']

        print(aggregated)

        json_contents = aggregated.values()

        events = Event.objects.all()
        event_json = []
        for event in events:
            event_json.append(event.to_dict())

        contents = {"type": type, "data": json_contents, "events": event_json}
    else:
        json_contents = json.load(
            open(base_dir + '/data/data_' + type + '.json', 'r'))

        contents = {"type": type, "data": json_contents}

    return HttpResponse(json.dumps(contents), content_type="application/json")


def get_events(request):
    """
    Returns all the events in a particular year
    :param request:
    :return:
    """

    type = request.GET.get('type', 'event_calendar')
    year = request.GET.get('year', None)

    if type == 'event_calendar':

        if year:
            year = int(year)
            events = Event.objects.filter(start_date__year=year).order_by(
                "-start_date")
        else:
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
