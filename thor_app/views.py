from django.shortcuts import render_to_response

# Create your views here.
from django.template import RequestContext


def home(request):
    return render_to_response("home.html", context_instance=RequestContext(request))


def dashboard(request):
    return render_to_response("dashboard.html", context_instance=RequestContext(request))