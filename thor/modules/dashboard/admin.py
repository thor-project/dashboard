from django.contrib import admin

# Register your models here.
from thor.modules.dashboard.models import Event, ParticipantType, Country, EventType, Tutor

admin.site.register(Event)
admin.site.register(EventType)
admin.site.register(ParticipantType)
admin.site.register(Country)
admin.site.register(Tutor)
