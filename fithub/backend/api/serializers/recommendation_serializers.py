from rest_framework import serializers
from ecommerce.models import BestItems, ClickedItems

class BestItemsSerializer(serializers.ModelSerializer):
    class Meta:
        model = BestItems
        fields = "__all__"

class ClickedItemsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClickedItems
        fields = "__all__"