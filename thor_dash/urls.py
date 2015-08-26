from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('',
    # Examples:
    url(r'^admin/', include(admin.site.urls)),
    url(r'^accounts/', include('registration.backends.default.urls')),
    url(r'accounts/', include('django.contrib.auth.urls')),
    url(r'^reset/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>.+)/$',
        'django.contrib.auth.views.password_reset_confirm', name='password_reset_confirm'),
    url(r'^$', 'thor_app.views.home', name='home'),
    url(r'^dashboard$', 'thor_app.views.dashboard', name='home'),
    # url(r'^blog/', include('blog.urls')),


)
