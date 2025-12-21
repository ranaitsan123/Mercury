from django.urls import path
from graphene_subscriptions.consumers import GraphqlSubscriptionConsumer

websocket_urlpatterns = [
    path(
        "graphql/",
        GraphqlSubscriptionConsumer.as_asgi(),
    ),
]
