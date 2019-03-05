from django.shortcuts import render

# Create your views here.

from rest_framework import generics, mixins
from ..serializers.generator import GenerateSerializer
from ..models.generator import GeneratedPC
from rest_framework.response import Response
from ..generator.src.utils.io import obj_wrapper
from ..generator.main import Generator
import numpy as np
import random as rd

from rest_framework import viewsets
from ..generator.main import Generator

class GenerateView(viewsets.ModelViewSet):

    queryset = GeneratedPC.objects.all().order_by('date_generated')
    serializer_class = GenerateSerializer
    permission_classes = ()

    def generate(self, object_class):

        self.generator = Generator("single_class_ae", object_class)
        self.generator.restore_ae(70)
        self.generator.init_train_gan()
        self.generator.restore_gan(1000)
        generated_data = self.generator.generate_pointclouds()

        return obj_wrapper(generated_data[rd.randint(0, 11)], object_class, 0), self.generator.interpolate(generated_data[0], generated_data[11], steps=12, write_file=False)


    def create(self, request, *args, **kwargs):
        object_class = request.query_params.get("object_class", None)
        
        generated_obj, interpolations = self.generate(object_class)
        created = GeneratedPC.objects.create(
            object_class = object_class,
            generated = generated_obj,
            interpolations = interpolations,
            num_of_vertices = 2048
        )

        created.save()

        return Response({
            'object_class': object_class,
            'num_of_vertices': 2048,
            'generated': generated_obj,
            'interpolations': interpolations,
        })