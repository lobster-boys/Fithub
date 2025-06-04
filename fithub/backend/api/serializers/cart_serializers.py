from rest_framework import serializers
from ecommerce.models import Cart

class CartSerializers(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source="user.username")

    class Meta:
        model = Cart
        fields = "__all__"