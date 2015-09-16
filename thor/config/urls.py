from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.views.generic import RedirectView

urlpatterns = patterns('',
    # Examples:
    url(r'^admin/', include(admin.site.urls)),
    url(r'^accounts/', include('registration.backends.default.urls')),
    url(r'accounts/', include('django.contrib.auth.urls')),
    url(r'^reset/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>.+)/$',
        'django.contrib.auth.views.password_reset_confirm', name='password_reset_confirm'),
    url(r'^$', RedirectView.as_view(url='/dashboard/data/')),
    url(r'^grappelli/', include('grappelli.urls')),
    url(r'^dashboard/', include('thor.modules.dashboard.urls')),

    url(r'api/', include('thor.modules.api.urls')),
)
