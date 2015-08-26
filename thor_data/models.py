__author__ = 'eamonnmaguire'

from django.db import models

class DataCentre(models.Model):
    name = models.CharField(max_length=256)
    country = models.CharField(max_length=256)


class MonthlyRecord(models.Model):

    data_centre = models.ForeignKey(DataCentre)

    dois_minted = models.IntegerField(default=0)
    dois_minted_with_orcids = models.IntegerField(default=0)

    date = models.DateTimeField(auto_now_add=True)