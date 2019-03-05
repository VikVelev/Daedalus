from ..models.generator import GeneratedPC

from rest_framework import serializers

class GenerateSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneratedPC
        fields = (
            'object_class',
            'date_generated',
            'generated',
            'interpolations',
            'num_of_vertices'
        )