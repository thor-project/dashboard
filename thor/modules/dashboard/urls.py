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


__author__ = 'eamonnmaguire'
from django.conf.urls import patterns, url

urlpatterns = patterns('',
    url(r'^$', 'thor.modules.dashboard.views.dashboard', name='overview'),
    url(r'^data/', 'thor.modules.dashboard.views.data_dashboard', name='data'),
    url(r'^researcher/', 'thor.modules.dashboard.views.researcher_dashboard', name='researcher'),
    url(r'^event/', 'thor.modules.dashboard.views.event_dashboard', name='event'),
    url(r'^crossrefs/', 'thor.modules.dashboard.views.crossrefs_dashboard', name='crossrefs'),
)
