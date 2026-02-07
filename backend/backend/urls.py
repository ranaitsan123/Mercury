from django.contrib import admin
from django.urls import path, include
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from rest_framework_simplejwt.authentication import JWTAuthentication

from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

from graphene_django.views import GraphQLView

from backend.schema import schema


schema_view = get_schema_view(
    openapi.Info(title="Mock Backend API", default_version="v1"),
    public=True,
    permission_classes=(permissions.AllowAny,),
)


# =========================
# JWT-AWARE GRAPHQL VIEW
# =========================
class PrivateGraphQLView(GraphQLView):
    def dispatch(self, request, *args, **kwargs):
        """
        Manually authenticate the user using SimpleJWT
        so GraphQL has access to request.user
        """
        jwt_auth = JWTAuthentication()

        try:
            auth_result = jwt_auth.authenticate(request)
        except Exception:
            auth_result = None

        if auth_result is not None:
            request.user, request.auth = auth_result

        return super().dispatch(request, *args, **kwargs)


urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),

    # JWT Auth (API)
    path("auth/token/", TokenObtainPairView.as_view()),
    path("auth/token/refresh/", TokenRefreshView.as_view()),

    # App APIs
    path("users/", include("users.urls")),
    path("emails/", include("emails.urls")),

    # API Docs
    path("swagger/", schema_view.with_ui("swagger", cache_timeout=0)),

    # GraphQL (JWT protected)
    path(
        "graphql/",
        csrf_exempt(
            PrivateGraphQLView.as_view(
                schema=schema,
                graphiql=settings.DEBUG,  # dev only
            )
        ),
    ),
]
