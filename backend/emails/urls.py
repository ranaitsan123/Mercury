from django.urls import path
from .views import SendEmailMock

urlpatterns = [
    #These remain admin-only.
    path("mock/send/", SendEmailMock.as_view()),
]
