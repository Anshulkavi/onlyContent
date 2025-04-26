from django.urls import path
from .views import upload_resume
from . import views

urlpatterns = [
    path('upload_resume/', upload_resume, name='upload_resume'),
]
