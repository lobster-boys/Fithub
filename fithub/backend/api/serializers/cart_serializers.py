from rest_framework import serializers
from ecommerce.models import Cart

class cartSerializers(serializers.ModelSerializer):
    """
    {
        "id": 1,
        "quantity": 1,
    }
    """
    class Meta:
        model = Cart
        fields = ["cart_items"]