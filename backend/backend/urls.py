from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

from django.views.generic import TemplateView
from django.contrib.auth import views as auth_views

from users.views import signup

from graphene_django.views import GraphQLView
from django.views.decorators.csrf import csrf_exempt

from middleware.graphql_middleware import GraphQLMiddleware

schema_view = get_schema_view(
    openapi.Info(title="Mock Backend API", default_version="v1"),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("auth/token/", TokenObtainPairView.as_view()),
    path("auth/token/refresh/", TokenRefreshView.as_view()),
    path("users/", include("users.urls")),
    path("emails/", include("emails.urls")),
    path("swagger/", schema_view.with_ui("swagger", cache_timeout=0)),
    path("scanner/", include("scanner.urls")),

    # Login page
    path('login/', auth_views.LoginView.as_view(template_name='registration/login.html'), name='login'),

    # Logout page
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),

    # Password change/reset can also be added later

    path('signup/', signup, name='signup'),

    path(
        "graphql/",
        csrf_exempt(
            GraphQLView.as_view(
                graphiql=True,
                schema=schema,  # your root schema with Query/Mutation
                middleware=[GraphQLMiddleware(query_limit=50)]
            )
        ),
    ),
]
