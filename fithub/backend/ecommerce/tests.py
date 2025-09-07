from django.test import TestCase
# from ecommerce.models import TestModel, TestProduct
# from django.utils import timezone
# from django.db.models import Sum
# import datetime


# Create your tests here.
# class QueryTest(TestCase):
#     def setUp(self):
#         test_product = []
#         for i in range(1, 10):
#             test_product.append(TestProduct.objects.create(name=i))

#         for i in range(4):
#             TestModel.objects.create(product=test_product[0])

#         for i in range(8):
#             TestModel.objects.create(product=test_product[1])

#         for i in range(12):
#             TestModel.objects.create(product=test_product[2])

#         for i in range(1):
#             TestModel.objects.create(product=test_product[3])

#         for i in range(3):
#             TestModel.objects.create(product=test_product[4])

#         for i in range(5):
#             TestModel.objects.create(product=test_product[5])

#         for i in range(2):
#             TestModel.objects.create(product=test_product[6])

#         for i in range(7):
#             TestModel.objects.create(product=test_product[7])

#         for i in range(9):
#             TestModel.objects.create(product=test_product[8])

#     def test_query(self):
#         start_date = timezone.now()
#         month_before_date = start_date - datetime.timedelta(days=30)

#         queryset = (
#             TestModel.objects.filter(created_at__range=(month_before_date, start_date))
#             .values("product")
#             .annotate(total_quantity=Sum("quantity"))
#             .order_by("-total_quantity")
#         )

#         print(queryset)
