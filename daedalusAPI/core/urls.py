from django.conf.urls import url
from django.urls import path, re_path, include
from rest_framework import routers

from .views.generator import GenerateView

router = routers.DefaultRouter()
router.register(r'generate', GenerateView)

urlpatterns = [
    # Main URIs
    path('', include(router.urls)),
]