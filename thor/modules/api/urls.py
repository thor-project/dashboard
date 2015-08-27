from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('thor.modules.api',
    # Examples:
    url(r'^get_data', 'views.get_data', name='home')

)
