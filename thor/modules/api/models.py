__author__ = 'eamonnmaguire'

from django.db import models


class DataCentre(models.Model):
    identifier = models.CharField(max_length=256)
    full_name = models.CharField(max_length=256)
    country = models.CharField(max_length=256)

    def __str__(self):
        return self.identifier


class ResourceType(models.Model):
    name = models.CharField(max_length=256)

    def __str__(self):
        return self.name


class Statistic(models.Model):
    name = models.CharField(max_length=256)
    value = models.FloatField(default=0)


class CountInformation(models.Model):
    resource_type = models.ForeignKey(ResourceType)
    stats = models.ManyToManyField(Statistic)


class MonthlyRecord(models.Model):
    data_centre = models.ForeignKey(DataCentre)
    date = models.DateTimeField(auto_now_add=True)

    counts = models.ManyToManyField(CountInformation)

    def __str__(self):
        return self.data_centre + " - " + self.date
