from django.contrib import admin

# Register your models here.
from thor.modules.dashboard.models import Event, ParticipantClassification, Country, EventType

admin.site.register(Event)
admin.site.register(EventType)
admin.site.register(ParticipantClassification)
admin.site.register(Country)
