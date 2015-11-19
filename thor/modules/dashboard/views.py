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
