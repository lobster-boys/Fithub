from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ecommerce.models import Product, ClickedItems
from api.serializers.product_serializers import ProductSerializer
from api.serializers.recommendation_serializers import ClickedItemsSerializer
from django.shortcuts import get_object_or_404
import json

# 테스트용 유저 불러오기
from users.models import User

# Create your views here.
@api_view(["GET", "POST"])
def products(request):
    if request.method == "GET":
        product = Product.objects.all()
        serializer = ProductSerializer(product, many=True)
        return Response(serializer.data)
    
    if request.method == "POST":
        serializer = ProductSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
@api_view(["GET", "PUT", "DELETE"])
def product(request, id):
    product = get_object_or_404(Product, id=id)

    if request.method == "GET":
        serializer = ProductSerializer(product)

        # 클릭 상품 목록 지정
        # 인덱스 숫자가 높을수록 최근 클릭 데이터
        user = User.objects.get(id="1")  # request.user로 전환 예정

        if user is not None:
            clicked_items, created = ClickedItems.objects.get_or_create(user=user)
            clicked_list = json.loads(clicked_items.clicked_list)

            list_set = True

            # 중복 목록 확인 및 순서 변경
            for idx, product in enumerate(clicked_list):
                if product == id:
                    clicked_list.pop(idx)
                    clicked_list.append(id)
                    list_set = False
                    break
                else:
                    list_set = True

            # 중복 없을 경우에 값 저장
            if list_set and len(clicked_list) == 10:
                clicked_list.pop(0)
                clicked_list.append(id)
            elif list_set:
                clicked_list.append(id)

            clicked_items.clicked_list = json.dumps(clicked_list)
            clicked_items.save()


        return Response(serializer.data)
    
    elif request.method == "PUT":
        serializer = ProductSerializer(product, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    elif request.method == "DELETE":
        product.delete()

        return Response(
            "SUCCESS", status=status.HTTP_204_NO_CONTENT
        )