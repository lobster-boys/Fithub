from django.urls import path
from api.views import hello_world

app_name = "api"

urlpatterns = [
    path("hello-world/", hello_world),
]