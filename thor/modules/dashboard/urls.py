from django.views.generic import RedirectView

__author__ = 'eamonnmaguire'
from django.conf.urls import patterns, url

urlpatterns = patterns('',
    # Examples:

    url(r'^$', RedirectView.as_view(url='/dashboard/data/')),
    url(r'^data/', 'thor.modules.dashboard.views.data_dashboard', name='data'),
    url(r'^researcher/', 'thor.modules.dashboard.views.researcher_dashboard', name='researcher')

)
