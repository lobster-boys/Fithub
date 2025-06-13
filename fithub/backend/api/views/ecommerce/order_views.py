from rest_framework.views import APIView
from api.serializers.ecommerce.order_serializers import OrderSerializer, OrderCreateSerializer
from ecommerce.models import Order
from rest_framework.response import Response

# 테스트용 유저 불러오기
from users.models import User

class OrdersAPI(APIView):
    """
    전체 주문내역
    """
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        주문내역 조회
        """
        try:
            orders = Order.objects.all()
            serializer = OrderSerializer(orders, many=True)

            return Response(serializer.data)
        except:
            return Response("주문내역 조회 실패")
        
    def post(self, request):
        """
        주문내역 생성
        """
        try:
            user = User.objects.get(id="1")
            serializer = OrderCreateSerializer(data=request.data)
            serializer.is_valid()
            serializer.save(user=user)

            return Response("POST 성공")
        except:
            return Response("POST 실패")
            
        

class OrderAPI(APIView):
    """
    단일 주문내역
    """
    # permission_classes = [IsAuthenticated]
    def get(self, request, pk):
        """
        단일 주문내역 조회
        """
        try:
            order =  Order.objects.get(id=id)
            serializer = OrderSerializer(order)

            return Response(serializer.data)
        except:
            return Response("주문내역 조회 실패")

