from rest_framework.views import APIView
from rest_framework import viewsets
from rest_framework.response import Response
from ecommerce.recommendation import Recommandation
from ecommerce.models import ClickedItems, Product, BestItems, OrderItem, Review
from api.serializers.ecommerce.product_serializers import ProductSerializer
from api.serializers.recommendation_serializers import BestItemsSerializer

import json
from django.utils import timezone
from django.db.models import Count, Sum
import datetime
import numpy as np
import pandas as pd
import random

# 테스트용 유저 불러오기
from users.models import User


class BestProductsViewSet(viewsets.ModelViewSet):
    """
    베스트 상품 출력
    """

    queryset = BestItems.objects.all()
    serializer_class = BestItemsSerializer


class MostSoldProductsViewSet(viewsets.ViewSet):
    """
    자주 팔린 상품 출력
    """

    def list(self, request):
        start_date = timezone.now()
        month_before_date = start_date - datetime.timedelta(days=30)

        # 한달간의 데이터중 상품들의 갯수를 정렬
        queryset = (
            OrderItem.objects.filter(created_at__range=(month_before_date, start_date))
            .values("product")
            .annotate(total_quantity=Sum("quantity"))
            .order_by("-total_quantity")
        )

        products = []
        for product in queryset:
            products.append(product["product"])

        most_products = Product.objects.filter(id__in=products)
        serializer = ProductSerializer(most_products, many=True)

        return Response(serializer.data)


class ClickRecommandAPI(APIView):
    """
    클릭한 상품 리스트는 product_views.py의 product 함수의 get 방식에서 처리
    """

    def get(self, request):
        """
        클릭 기반 추천 리스트 출력
        """
        user = User.objects.get(id="1")  # request.user로 전환 예정
        user_list = ClickedItems.objects.get(user=user)
        clicked_list = ClickedItems.objects.exclude(user=user)
        jaccard_list = []

        # 자카드 유사도 계산
        for idx, list_items in enumerate(clicked_list):
            jaccard = Recommandation.get_jaccard_similarity(
                json.loads(user_list.clicked_list), json.loads(list_items.clicked_list)
            )

            # 인덱스 번호와 자카드 유사도 리스트를 자카드 리스트에 저장
            jaccard_list.append([idx, jaccard])

        # 자카드 유사도 높은순으로 정렬
        jaccard_list.sort(key=lambda x: x[1], reverse=True)

        # 추천 리스트
        recommand_list = json.loads(clicked_list[jaccard_list[0][0]].clicked_list)

        user_list = json.loads(user_list.clicked_list)

        # 리스트 컴프리헨션으로 중복 제거
        recommand_list = [x for x in recommand_list if x not in user_list]

        key_lists = []

        # 상품 테이블과 비교하여 해당 값이 존재하는지 확인
        for id in recommand_list:
            print(id)
            print(type(id))
            try:
                product = Product.objects.get(id=id)
                key_lists.append(id)
            except:
                print(f"{id}에 해당하는 값이 없습니다")

        product = Product.objects.filter(id__in=key_lists)
        serializer = ProductSerializer(product, many=True)

        return Response(serializer.data)


class ScoreBaseRecommandViewSet(viewsets.ViewSet):

    def list(self, request):
        """
        사용자의 평점을 기준으로 추천 리스트 출력
        아이템 기반 협업 추천. 피어슨 유사도 사용.
        """

        user = User.objects.get(id="1")  # request.user로 전환 예정
        # 사용자의 리뷰 상품과 평점 쿼리
        user_rating_lists = (
            Review.objects.filter(user=user)
            .order_by("-rating")
            .values("product", "rating")
        )

        # 리뷰 테이블 전체 쿼리
        reviews = Review.objects.all().values("user", "product", "rating")

        # 판다스로 전환
        df_reviews = pd.DataFrame(list(reviews))

        # 행은 유저 pk, 열은 상품 pk, 값은 평점으로 이루어진 테이블 생성
        reviews_table = df_reviews.pivot_table(
            index="user", columns="product", values="rating"
        ).fillna(np.nan)

        pearson_similarity = reviews_table.corr(method='pearson', min_periods=3)

        print(pearson_similarity)

        temp_list = []

        recommand_list = []

        # 사용자의 평점중 상위 3개의 상품에 대해서 피어슨 유사도 실행
        if user_rating_lists.exists():
            if len(user_rating_lists) < 3:
                for rating in user_rating_lists:
                    temp_list.append(rating['product'])
                    
            else:
                for i in range(3):
                    temp_list.append(user_rating_lists[i]['product'])

            product = random.choice(temp_list)

            # 0.5 이상, 자신과 동일한 행을 제거 후 열 기준으로 정렬한다.
            sorted_similarity = pearson_similarity[pearson_similarity[product] > 0.5]
            sorted_similarity = sorted_similarity.drop(index=product)
            sorted_similarity = sorted_similarity.sort_values(by=product, ascending=False)

            # 정렬된 인덱스들 기준으로 product 추천 리스트 생성
            recommand_list = sorted_similarity.index.tolist()
            
        else:
            Response("[]")

        product = Product.objects.filter(id__in=recommand_list)
        serializer = ProductSerializer(product, many=True)

        return Response(serializer.data)
