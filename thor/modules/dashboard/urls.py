__author__ = 'eamonnmaguire'
from django.conf.urls import patterns, url

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'thor.modules.dashboard.views.dashboard', name='home'),
    url(r'^data/', 'thor.modules.dashboard.views.data_dashboard', name='data'),
    url(r'^researcher/', 'thor.modules.dashboard.views.researcher_dashboard', name='researcher')

)
