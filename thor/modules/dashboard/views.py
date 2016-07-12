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

from django.shortcuts import render_to_response

# Create your views here.
from django.template import RequestContext
from thor.modules.dashboard.models import Event


def home(request):
    return render_to_response("home.html", context_instance=RequestContext(request))


def dashboard(request):
    return render_to_response("dashboard.html", context_instance=RequestContext(request))


def data_dashboard(request):
    return render_to_response("data-dashboard.html", context_instance=RequestContext(request))


def researcher_dashboard(request):
    return render_to_response("research-identifier-dashboard.html", context_instance=RequestContext(request))


def event_dashboard(request):
    events = Event.objects.all()
    return render_to_response("event-dashboard.html", {'events': events}, context_instance=RequestContext(request))
