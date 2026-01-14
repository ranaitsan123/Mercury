from django.contrib import admin
from django.urls import path, include
from django.views.decorators.csrf import csrf_exempt

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

from graphene_django.views import GraphQLView
from django.conf import settings

from backend.schema import schema


schema_view = get_schema_view(
    openapi.Info(title="Mock Backend API", default_version="v1"),
    public=True,
    permission_classes=(permissions.AllowAny,),
)


urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),

    # JWT Auth (API)
    path("auth/token/", TokenObtainPairView.as_view()),
    path("auth/token/refresh/", TokenRefreshView.as_view()),

    # App APIs
    path("users/", include("users.urls")),
    path("emails/", include("emails.urls")),
    path("scanner/", include("scanner.urls")),

    # API Docs
    path("swagger/", schema_view.with_ui("swagger", cache_timeout=0)),

    # GraphQL
    path(
        "graphql/",
        csrf_exempt(
            GraphQLView.as_view(
                schema=schema,
                graphiql=settings.DEBUG,  # dev only
            )
        ),
    ),
]
