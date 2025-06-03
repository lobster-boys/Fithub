from rest_framework import serializers
from ecommerce.models import Order

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = "__all__"

class OrderCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        exclude = ["user"]