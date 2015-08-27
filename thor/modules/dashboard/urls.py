__author__ = 'eamonnmaguire'
from django.conf.urls import patterns, url

urlpatterns = patterns('',
    # Examples:
    url(r'^', 'thor.modules.dashboard.views.dashboard', name='home')

)
