from django.contrib import admin

from thor.modules.api.models import MonthlyRecord, DataCentre, ResourceType, Statistic, CountInformation


__author__ = 'eamonnmaguire'


admin.site.register(MonthlyRecord)
admin.site.register(DataCentre)
admin.site.register(ResourceType)
admin.site.register(Statistic)
admin.site.register(CountInformation)



