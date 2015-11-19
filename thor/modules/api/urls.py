from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('thor.modules.api',
    # Examples:
    url(r'^data', 'views.get_data', name='home'),
    url(r'^events', 'views.get_events', name='events')


)
