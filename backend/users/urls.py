from django.urls import path
from .views import MeView, SignupAPIView

urlpatterns = [
    path("me/", MeView.as_view()),
    path("signup/", SignupAPIView.as_view()),
]
