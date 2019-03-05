from django.db import models
from django.utils import timezone

# Create your models here.
class GeneratedPC(models.Model):
    object_class = models.CharField(max_length=64, null=True)
    date_generated = models.DateTimeField(auto_now_add = True)
    num_of_vertices = models.IntegerField(blank=True, null=True)
    generated = models.TextField(null=True)
    interpolations = models.TextField(null=True)