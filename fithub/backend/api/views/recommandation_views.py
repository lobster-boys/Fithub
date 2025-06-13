from rest_framework.views import APIView
from rest_framework.response import Response
from ecommerce.recommendation import Recommandation
from ecommerce.models import ClickedItems, Product
from api.serializers.product_serializers import ProductSerializer
import json

# 테스트용 유저 불러오기
from users.models import User

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
                json.loads(user_list.clicked_list),
                json.loads(list_items.clicked_list)
                )
            
            # 인덱스 번호와 자카드 유사도 리스트를 자카드 리스트에 저장
            jaccard_list.append([idx, jaccard])

        # 자카드 유사도 높은순으로 정렬
        jaccard_list.sort(key=lambda x : x[1], reverse=True)

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
                print(f'{id}에 해당하는 값이 없습니다')

        product = Product.objects.filter(id__in=key_lists)
        serializer = ProductSerializer(product, many=True)

        return Response(serializer.data)