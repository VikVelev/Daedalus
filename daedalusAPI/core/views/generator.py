from django.shortcuts import render

# Create your views here.

from rest_framework import generics, mixins
from ..serializers.generator import GenerateSerializer
from ..models.generator import GeneratedPC
from rest_framework.response import Response

from rest_framework import viewsets
from ..generator.main import Generator

class GenerateView(viewsets.ModelViewSet):

    queryset = GeneratedPC.objects.all().order_by('date_generated')
    serializer_class = GenerateSerializer
    permission_classes = ()

    def create(self, request, *args, **kwargs):
        object_class = request.query_params.get("object_class", None)
        generated_obj = Generator.generate(object_class)
        created = GeneratedPC.objects.create(
            object_class = object_class,
            content = generated_obj,
            num_of_vertices = 2048
        )

        created.save()

        return Response({
            'object_class': object_class,
            'num_of_vertices': 2048,
            'content': generated_obj
        })