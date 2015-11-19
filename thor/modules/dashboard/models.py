from django.db import models


class Tutor(models.Model):
    verbose_name_plural = "Tutors"
    name = models.CharField(max_length=256)


class EventType(models.Model):
    verbose_name_plural = "Event Types"
    name = models.CharField(max_length=256)

    def __str__(self):
        return self.name


class Country(models.Model):
    verbose_name_plural = "Countries"

    name = models.CharField(max_length=256)

    def __str__(self):
        return self.name


class ParticipantClassification(models.Model):
    verbose_name_plural = "Participants"

    type_choices = (
        ('S', 'Senior Academics'),
        ('P', 'Post Docs'),
        ('G', 'Grad Student'),
        ('U', 'Undergrads'),
        ('P', 'Public'),
        ('U', 'Unknown'),
    )
    type = models.CharField(max_length=32, choices=type_choices)
    count = models.IntegerField(default=0)
    estimated = models.BooleanField(default=False, help_text="If the number is estimated rather than definite.")


class Event(models.Model):
    verbose_name_plural = "Events"

    name = models.CharField(max_length=256)
    description = models.TextField(blank=True)
    start_date = models.DateField(blank=False)
    end_date = models.DateField(blank=False)
    type = models.ForeignKey(EventType, blank=False)

    country = models.CharField(max_length=256)
    participants = models.ManyToManyRel(ParticipantClassification)

    tutors = models.ManyToManyRel(Tutor)

    def __str__(self):
        return "{0}-{1} {2} ({3})".format(self.start_date, self.end_date, self.name, self.country)
