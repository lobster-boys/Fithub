import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../../components/common/Card';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState('description');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  console.log("ProductDetailPage 렌더링 - productId:", productId);

  // 데모 데이터 - 실제로는 API에서 가져올 것입니다
  const demoProducts = [
    {
      id: 1,
      name: '프리미엄 요가 매트',
      category: 'equipment',
      price: 39000,
      discount: 10,
      rating: 4.8,
      reviewCount: 124,
      stock: 50,
      soldCount: 240,
      image: 'https://images.unsplash.com/photo-1599447292461-38fb53fb0fee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      additionalImages: [
        'https://images.unsplash.com/photo-1600881333168-2ef49b341f30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
        'https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
      ],
      isBestseller: true,
      description: `최고급 TPE 소재로 제작된 프리미엄 요가 매트입니다. 미끄럼 방지 표면과 쿠션감이 뛰어나 요가, 필라테스, 그리고 다양한 실내 운동에 적합합니다.
      
      • 두께: 6mm - 충분한 쿠션감 제공
      • 크기: 183cm x 61cm - 대부분의 신체 크기에 적합
      • 미끄럼 방지 표면 - 안정적인 자세 유지
      • 무독성, 친환경 TPE 소재
      • 가벼운 무게, 휴대용 스트랩 포함
      • 손쉬운 세척, 빠른 건조`,
      specifications: [
        { name: '소재', value: 'TPE(열가소성 엘라스토머)' },
        { name: '두께', value: '6mm' },
        { name: '크기', value: '183cm x 61cm' },
        { name: '무게', value: '1.2kg' },
        { name: '색상', value: '퍼플 그라데이션' },
        { name: '포함 액세서리', value: '휴대용 스트랩' },
        { name: '생산국', value: '한국' }
      ],
      nutrition: null,
      reviewDetails: [
        { rating: 5, count: 98 },
        { rating: 4, count: 20 },
        { rating: 3, count: 5 },
        { rating: 2, count: 1 },
        { rating: 1, count: 0 }
      ],
      reviews: [
        {
          id: 1,
          userId: 'user123',
          userName: '요가러버',
          avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
          rating: 5,
          text: '정말 푹신하고 미끄러짐이 없어요! 매일 사용하는데 아직 손상 없이 잘 쓰고 있습니다. 두꺼운 쿠션감이 무릎 보호에 좋아요.',
          date: '2023-04-15',
          helpfulCount: 24
        },
        {
          id: 2,
          userId: 'user456',
          userName: '헬린이',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
          rating: 4,
          text: '품질이 좋고 디자인도 예뻐요. 다만 첫 개봉 시 약간의 냄새가 있었지만 2-3일 환기 후 사라졌어요.',
          date: '2023-03-22',
          helpfulCount: 15
        }
      ],
      relatedProducts: [2, 3, 6],
      externalLink: 'https://www.coupang.com'
    },
    {
      id: 2,
      name: '조절식 덤벨 세트',
      category: 'equipment',
      price: 150000,
      discount: 0,
      rating: 4.9,
      reviewCount: 89,
      stock: 25,
      soldCount: 320,
      image: 'https://images.unsplash.com/photo-1638536532686-d610adba8c7c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
      additionalImages: [
        'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80'
      ],
      isBestseller: true,
      description: `고품질 조절식 덤벨 세트로 다양한 무게 설정이 가능합니다. 한 세트로 여러 무게의 덤벨을 대체하여 공간을 절약하고 효율적인 근력 트레이닝을 가능하게 합니다.
      
      • 무게 범위: 2.5kg ~ 25kg (각 덤벨)
      • 2.5kg 단위로 간편하게 무게 조절
      • 내구성 있는 크롬 도금 스틸 소재
      • 편안한 그립감의 고무 코팅 핸들
      • 컴팩트한 사이즈로 공간 절약
      • 무게 잠금 시스템으로 안전하게 사용 가능`,
      specifications: [
        { name: '소재', value: '크롬 도금 스틸, 고무 코팅 핸들' },
        { name: '무게 범위', value: '2.5kg ~ 25kg (각 덤벨)' },
        { name: '조절 단위', value: '2.5kg' },
        { name: '크기', value: '40cm x 20cm x 20cm (각 덤벨)' },
        { name: '총 무게', value: '50kg (세트)' },
        { name: '포함 품목', value: '덤벨 2개, 보관용 트레이' },
        { name: '생산국', value: '미국' }
      ],
      nutrition: null,
      reviewDetails: [
        { rating: 5, count: 75 },
        { rating: 4, count: 10 },
        { rating: 3, count: 3 },
        { rating: 2, count: 1 },
        { rating: 1, count: 0 }
      ],
      reviews: [
        {
          id: 1,
          userId: 'user789',
          userName: '헬스마니아',
          avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
          rating: 5,
          text: '정말 편리합니다! 이제 여러 덤벨을 구매할 필요가 없어요. 무게 조절도 간단하고 튼튼해 보입니다.',
          date: '2023-05-20',
          helpfulCount: 32
        },
        {
          id: 2,
          userId: 'user012',
          userName: '홈트레이닝러버',
          avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
          rating: 4,
          text: '공간을 많이 차지하지 않으면서 다양한 무게로 운동할 수 있어 좋습니다. 무게 변경이 조금 번거롭지만 전반적으로 만족합니다.',
          date: '2023-04-12',
          helpfulCount: 18
        }
      ],
      relatedProducts: [1, 3, 6],
      externalLink: 'https://www.coupang.com'
    },
    {
      id: 3,
      name: '운동용 저항 밴드 세트',
      category: 'equipment',
      price: 25000,
      discount: 20,
      rating: 4.6,
      reviewCount: 245,
      stock: 100,
      soldCount: 520,
      image: 'https://images.unsplash.com/photo-1598550480917-1c485268a92a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      additionalImages: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        'https://images.unsplash.com/photo-1518310952931-b1932651351c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
      ],
      isBestseller: false,
      description: `다양한 강도의 저항 밴드 5종 세트입니다. 홈트레이닝부터 재활운동까지 활용도가 높으며, 휴대성이 좋아 언제 어디서나 운동이 가능합니다.
      
      • 5가지 강도: 초경량(노랑), 경량(초록), 중간(파랑), 고강도(빨강), 초고강도(검정)
      • 내구성 높은 천연 라텍스 소재
      • 신축성과 복원력이 뛰어남
      • 손잡이와 발걸이 포함
      • 휴대용 메쉬 가방 포함
      • 운동 가이드북 포함`,
      specifications: [
        { name: '소재', value: '천연 라텍스' },
        { name: '밴드 개수', value: '5개' },
        { name: '강도', value: '초경량, 경량, 중간, 고강도, 초고강도' },
        { name: '길이', value: '120cm' },
        { name: '부속품', value: '손잡이, 발걸이, 휴대용 가방, 운동 가이드북' },
        { name: '생산국', value: '태국' }
      ],
      nutrition: null,
      reviewDetails: [
        { rating: 5, count: 180 },
        { rating: 4, count: 45 },
        { rating: 3, count: 15 },
        { rating: 2, count: 3 },
        { rating: 1, count: 2 }
      ],
      reviews: [
        {
          id: 1,
          userId: 'user555',
          userName: '홈트의달인',
          avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
          rating: 5,
          text: '가격 대비 품질이 훌륭합니다. 5가지 강도가 있어 다양한 운동에 활용하고 있어요. 특히 초보자부터 상급자까지 모두 사용할 수 있어 좋습니다.',
          date: '2023-03-15',
          helpfulCount: 42
        },
        {
          id: 2,
          userId: 'user777',
          userName: '피트니스맘',
          avatar: 'https://randomuser.me/api/portraits/women/55.jpg',
          rating: 4,
          text: '아이 키우면서 짬짬이 운동하기 좋아요. 공간도 많이 차지하지 않고 효과도 좋습니다. 초고강도 밴드는 생각보다 강해서 주의해서 사용해야 해요.',
          date: '2023-02-28',
          helpfulCount: 28
        }
      ],
      relatedProducts: [1, 2, 6],
      externalLink: 'https://www.coupang.com'
    },
    {
      id: 4,
      name: '프로틴 쉐이커 보틀',
      category: 'accessories',
      price: 15000,
      discount: 0,
      rating: 4.5,
      reviewCount: 156,
      stock: 200,
      soldCount: 430,
      image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80',
      additionalImages: [
        'https://images.unsplash.com/photo-1514995669114-6081e934b693?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        'https://images.unsplash.com/photo-1550759506-b7e03d1265d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        'https://images.unsplash.com/photo-1579722821273-0f6c1b933c0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
      ],
      isBestseller: false,
      description: `BPA free 재질의 고품질 프로틴 쉐이커입니다. 특수 설계된 믹서볼이 부드럽고 완벽한 혼합을 보장하며, 누수 방지 설계로 안심하고 가방에 넣을 수 있습니다.
      
      • 용량: 700ml
      • BPA free 트라이탄 플라스틱 소재
      • 스테인리스 믹서볼 포함
      • 뚜껑 잠금 장치로 누수 방지
      • 인체공학적 디자인의 손잡이
      • 용량 표시 눈금
      • 식기세척기 사용 가능`,
      specifications: [
        { name: '소재', value: 'BPA free 트라이탄 플라스틱, 스테인리스 스틸' },
        { name: '용량', value: '700ml' },
        { name: '크기', value: '23cm x 9cm (지름)' },
        { name: '무게', value: '180g' },
        { name: '색상', value: '블랙' },
        { name: '부속품', value: '믹서볼, 측정 눈금' },
        { name: '생산국', value: '한국' }
      ],
      nutrition: null,
      reviewDetails: [
        { rating: 5, count: 110 },
        { rating: 4, count: 36 },
        { rating: 3, count: 8 },
        { rating: 2, count: 2 },
        { rating: 1, count: 0 }
      ],
      reviews: [
        {
          id: 1,
          userId: 'user888',
          userName: '헬스장주민',
          avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
          rating: 5,
          text: '매일 사용하는데 정말 만족합니다. 잘 섞이고 세척도 간편해요. 특히 누수가 전혀 없어서 가방에 넣어도 안심이에요.',
          date: '2023-06-10',
          helpfulCount: 19
        },
        {
          id: 2,
          userId: 'user999',
          userName: '프로틴러버',
          avatar: 'https://randomuser.me/api/portraits/women/62.jpg',
          rating: 4,
          text: '디자인도 심플하고 기능도 좋아요. 덩어리 없이 프로틴 파우더가 잘 섞여요. 다만 세척할 때 믹서볼 주변을 꼼꼼히 해야 합니다.',
          date: '2023-05-22',
          helpfulCount: 15
        }
      ],
      relatedProducts: [5, 6],
      externalLink: 'https://www.coupang.com'
    },
    {
      id: 5,
      name: '프리미엄 웨이트 프로틴',
      category: 'nutrition',
      price: 59000,
      discount: 5,
      rating: 4.7,
      reviewCount: 312,
      stock: 150,
      soldCount: 760,
      image: 'https://images.unsplash.com/photo-1579722821273-0f6c1b933c0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      additionalImages: [
        'https://images.unsplash.com/photo-1614243339734-ad2a32350daa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        'https://images.unsplash.com/photo-1505253668822-42074d58a7c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
        'https://images.unsplash.com/photo-1594204072086-b3448d0aa50a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
      ],
      isBestseller: true,
      description: `고품질 분리 유청 단백질(WPI)을 주원료로 한 프리미엄 웨이트 프로틴입니다. 근육 성장과 회복을 위한 필수 영양소를 함유하고 있으며, 맛과 용해도가 뛰어납니다.
      
      • 중량: 2kg (약 66회 제공량)
      • 제공량당 단백질: 27g
      • 저지방, 저당
      • BCAA 및 글루타민 강화
      • 인공 감미료, 색소, 방부제 무첨가
      • 다양한 맛: 초콜릿, 바닐라, 딸기, 바나나
      • 빠른 용해력과 부드러운 맛`,
      specifications: [
        { name: '중량', value: '2kg' },
        { name: '제공량', value: '30g (1스쿱)' },
        { name: '총 제공량', value: '약 66회' },
        { name: '맛', value: '초콜릿' },
        { name: '유통기한', value: '제조일로부터 24개월' },
        { name: '보관방법', value: '직사광선을 피해 서늘하고 건조한 곳에 보관' },
        { name: '생산국', value: '미국' }
      ],
      nutrition: [
        { name: '열량', value: '120kcal' },
        { name: '단백질', value: '27g' },
        { name: '지방', value: '1.5g' },
        { name: '탄수화물', value: '3g' },
        { name: '당류', value: '1g' },
        { name: '나트륨', value: '80mg' },
        { name: 'BCAA', value: '5.5g' },
        { name: '글루타민', value: '4g' }
      ],
      reviewDetails: [
        { rating: 5, count: 255 },
        { rating: 4, count: 42 },
        { rating: 3, count: 10 },
        { rating: 2, count: 3 },
        { rating: 1, count: 2 }
      ],
      reviews: [
        {
          id: 1,
          userId: 'user111',
          userName: '근육맨',
          avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
          rating: 5,
          text: '3년째 애용중인 프로틴입니다. 맛도 좋고 용해도도 뛰어나서 덩어리 없이 잘 섞여요. 운동 후 회복에도 효과가 좋은 것 같습니다.',
          date: '2023-05-05',
          helpfulCount: 45
        },
        {
          id: 2,
          userId: 'user222',
          userName: '헬린이탈출',
          avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
          rating: 4,
          text: '초코맛이 달지 않고 적당해서 좋아요. 거품도 적고 소화도 잘 됩니다. 근손실 방지에 도움이 되는 것 같아요.',
          date: '2023-04-18',
          helpfulCount: 32
        }
      ],
      relatedProducts: [4, 6],
      externalLink: 'https://www.coupang.com'
    },
    {
      id: 6,
      name: '스포츠 손목 밴드',
      category: 'accessories',
      price: 12000,
      discount: 0,
      rating: 4.3,
      reviewCount: 68,
      stock: 300,
      soldCount: 120,
      image: 'https://images.unsplash.com/photo-1531917115039-473db54f8482?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      additionalImages: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
      ],
      isBestseller: false,
      description: `전문 운동선수들도 사용하는 고급 스포츠 손목 밴드입니다. 무거운 웨이트 트레이닝 시 손목을 안정화하고 부상을 방지해 줍니다.
      
      • 강력한 지지력과 압박감
      • 내구성 있는 면 소재와 탄성 섬유 혼방
      • 조절 가능한 벨크로 스트랩
      • 엄지 루프로 편안한 착용감
      • 땀 흡수 기능
      • 한 쌍(2개) 제공`,
      specifications: [
        { name: '소재', value: '면 60%, 폴리에스터 25%, 스판덱스 15%' },
        { name: '길이', value: '50cm' },
        { name: '너비', value: '8cm' },
        { name: '무게', value: '80g (쌍)' },
        { name: '색상', value: '블랙' },
        { name: '포함 수량', value: '2개 (한 쌍)' },
        { name: '세탁 방법', value: '손세탁 권장' },
        { name: '생산국', value: '대한민국' }
      ],
      nutrition: null,
      reviewDetails: [
        { rating: 5, count: 42 },
        { rating: 4, count: 20 },
        { rating: 3, count: 5 },
        { rating: 2, count: 1 },
        { rating: 1, count: 0 }
      ],
      reviews: [
        {
          id: 1,
          userId: 'user333',
          userName: '역도선수',
          avatar: 'https://randomuser.me/api/portraits/men/81.jpg',
          rating: 5,
          text: '데드리프트나 벤치프레스 할 때 손목이 많이 아팠는데, 이 손목 밴드를 사용하고 나서는 훨씬 안정적으로 운동할 수 있게 됐어요. 지지력이 정말 좋습니다.',
          date: '2023-03-30',
          helpfulCount: 12
        },
        {
          id: 2,
          userId: 'user444',
          userName: '크로스핏러',
          avatar: 'https://randomuser.me/api/portraits/women/75.jpg',
          rating: 4,
          text: '손목을 단단히 고정해줘서 좋아요. 다만 처음에는 조금 빡빡할 수 있으니 적응이 필요합니다. 세탁 후에도 탄력이 유지돼요.',
          date: '2023-02-15',
          helpfulCount: 8
        }
      ],
      relatedProducts: [1, 3, 4],
      externalLink: 'https://www.coupang.com'
    }
  ];

  useEffect(() => {
    // 실제로는 API 호출로 대체
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      
      // 디버깅 용도
      console.log("=============== 상품 디버깅 정보 ===============");
      console.log("전체 상품 목록 ID:", demoProducts.map(p => `${p.name} (ID: ${p.id}, 타입: ${typeof p.id})`));
      console.log("현재 URL의 productId:", productId, "타입:", typeof productId);
      
      try {
        // 데모용 API 지연 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 문자열 productId를 숫자로 변환
        const numericId = parseInt(productId);
        console.log("변환된 ID:", numericId, "타입:", typeof numericId);
        
        // ID 비교를 엄격하게 수행
        let foundProduct = demoProducts.find(p => p.id === numericId);
        
        if (!foundProduct) {
          console.log("숫자 ID로 찾지 못함, 문자열로 시도:", productId);
          foundProduct = demoProducts.find(p => String(p.id) === productId);
        }
        
        console.log("찾은 상품:", foundProduct ? `${foundProduct.name} (ID: ${foundProduct.id})` : "없음");
        setProduct(foundProduct || null);
        
        if (!foundProduct) {
          setError(`ID ${productId}에 해당하는 상품을 찾을 수 없습니다.`);
        }
      } catch (error) {
        console.error('상품 정보를 불러오는데 실패했습니다:', error);
        setError('상품 정보를 불러오는데 실패했습니다. 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 10)) {
      setQuantity(newQuantity);
    }
  };

  const calculateDiscountedPrice = (price, discount) => {
    if (!discount) return price;
    return Math.round(price * (1 - discount / 100));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">상품 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">오류가 발생했습니다</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <pre className="bg-gray-100 p-4 mb-6 text-left text-sm overflow-auto max-h-40 rounded">
            {`요청한 ID: ${productId}\n사용 가능한 상품 ID: ${demoProducts.map(p => p.id).join(', ')}`}
          </pre>
          <Link to="/shop" className="bg-primary text-white px-6 py-2 rounded-lg inline-block">
            상품 목록으로 돌아가기
          </Link>
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">상품을 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-6">요청하신 상품이 존재하지 않거나 삭제되었을 수 있습니다.</p>
          <pre className="bg-gray-100 p-4 mb-6 text-left text-sm overflow-auto max-h-40 rounded">
            {`요청한 ID: ${productId}\n사용 가능한 상품 ID: ${demoProducts.map(p => p.id).join(', ')}`}
          </pre>
          <Link to="/shop" className="bg-primary text-white px-6 py-2 rounded-lg inline-block">
            상품 목록으로 돌아가기
          </Link>
        </Card>
      </div>
    );
  }

  const discountedPrice = calculateDiscountedPrice(product.price, product.discount);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 상품 기본 정보 */}
      <div className="flex flex-col lg:flex-row gap-8 mb-8">
        {/* 이미지 갤러리 */}
        <div className="lg:w-1/2">
          <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-4">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-96 object-cover"
            />
          </div>
          
          {/* 추가 이미지 */}
          {product.additionalImages && (
            <div className="grid grid-cols-3 gap-4">
              {product.additionalImages.map((img, index) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm cursor-pointer">
                  <img 
                    src={img} 
                    alt={`${product.name} ${index+1}`} 
                    className="w-full h-24 object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* 상품 정보 */}
        <div className="lg:w-1/2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            {/* 카테고리 및 태그 */}
            <div className="flex gap-2 mb-2">
              <span className="text-sm text-gray-500 capitalize">
                {product.category}
              </span>
              {product.isBestseller && (
                <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                  베스트셀러
                </span>
              )}
            </div>
            
            {/* 상품명 */}
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            
            {/* 별점 */}
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <i 
                    key={i} 
                    className={`fas fa-star ${i < Math.floor(product.rating) ? '' : i < product.rating ? 'fas fa-star-half-alt' : 'far fa-star'}`}
                  ></i>
                ))}
              </div>
              <span className="text-gray-500 ml-2">
                {product.rating} ({product.reviewCount} 리뷰)
              </span>
            </div>
            
            {/* 가격 */}
            <div className="mb-6">
              {product.discount > 0 ? (
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-primary">
                    {discountedPrice.toLocaleString()}원
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    {product.price.toLocaleString()}원
                  </span>
                  <span className="bg-red-500 text-white text-sm px-2 py-1 rounded">
                    {product.discount}% 할인
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-primary">
                  {product.price.toLocaleString()}원
                </span>
              )}
            </div>
            
            {/* 구매 수량 */}
            <div className="mb-6">
              <div className="text-gray-700 mb-2">수량</div>
              <div className="flex items-center">
                <button 
                  onClick={() => handleQuantityChange(-1)}
                  className="px-3 py-1 bg-gray-100 border border-gray-300 text-gray-700 rounded-l-lg"
                  disabled={quantity <= 1}
                >
                  <i className="fas fa-minus"></i>
                </button>
                <div className="w-14 px-3 py-1 border-t border-b border-gray-300 text-center">
                  {quantity}
                </div>
                <button 
                  onClick={() => handleQuantityChange(1)}
                  className="px-3 py-1 bg-gray-100 border border-gray-300 text-gray-700 rounded-r-lg"
                  disabled={quantity >= product.stock}
                >
                  <i className="fas fa-plus"></i>
                </button>
                <div className="ml-4 text-sm text-gray-500">
                  재고: {product.stock}개
                </div>
              </div>
            </div>
            
            {/* 총 가격 */}
            <div className="p-4 bg-gray-50 rounded-lg mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">총 금액:</span>
                <span className="text-xl font-bold text-primary">
                  {(discountedPrice * quantity).toLocaleString()}원
                </span>
              </div>
            </div>
            
            {/* 구매 버튼 */}
            <div className="flex gap-3 mb-6">
              <a 
                href={product.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-orange-600 text-center"
              >
                <i className="fas fa-external-link-alt mr-2"></i>
                구매 사이트로 이동
              </a>
              <button className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100">
                <i className="far fa-heart text-gray-500"></i>
              </button>
            </div>
            
            {/* 판매 현황 */}
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-2">
                {product.soldCount}명이 이 상품을 구매했습니다
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, product.soldCount / 5)}%` }}></div>
              </div>
            </div>
            
            {/* 무료배송 등 정책 */}
            <div className="flex flex-col gap-2 text-sm text-gray-700">
              <div className="flex items-center">
                <i className="fas fa-truck text-primary w-6"></i>
                <span>50,000원 이상 무료배송</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-undo text-primary w-6"></i>
                <span>30일 이내 무료 반품</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-shield-alt text-primary w-6"></i>
                <span>100% 정품 보증</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 상세 정보 탭 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        {/* 탭 메뉴 */}
        <div className="flex border-b">
          <button 
            className={`flex-1 py-4 font-medium ${selectedTab === 'description' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
            onClick={() => setSelectedTab('description')}
          >
            상품 설명
          </button>
          <button 
            className={`flex-1 py-4 font-medium ${selectedTab === 'specs' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
            onClick={() => setSelectedTab('specs')}
          >
            상세 정보
          </button>
          <button 
            className={`flex-1 py-4 font-medium ${selectedTab === 'reviews' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
            onClick={() => setSelectedTab('reviews')}
          >
            리뷰 ({product.reviewCount})
          </button>
        </div>
        
        {/* 탭 내용 */}
        <div className="p-6">
          {/* 상품 설명 */}
          {selectedTab === 'description' && (
            <div className="whitespace-pre-line text-gray-700">
              {product.description}
            </div>
          )}
          
          {/* 상세 정보 */}
          {selectedTab === 'specs' && (
            <div>
              <h3 className="text-lg font-bold mb-4">상품 스펙</h3>
              <table className="w-full border-collapse">
                <tbody>
                  {product.specifications.map((spec, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="py-3 px-4 border-b border-gray-200 font-medium w-1/3">{spec.name}</td>
                      <td className="py-3 px-4 border-b border-gray-200 text-gray-700">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* 영양 정보 (있을 경우에만) */}
              {product.nutrition && (
                <div className="mt-8">
                  <h3 className="text-lg font-bold mb-4">영양 정보</h3>
                  <table className="w-full border-collapse">
                    <tbody>
                      {product.nutrition.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="py-3 px-4 border-b border-gray-200 font-medium w-1/3">{item.name}</td>
                          <td className="py-3 px-4 border-b border-gray-200 text-gray-700">{item.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {/* 리뷰 */}
          {selectedTab === 'reviews' && (
            <div>
              {/* 평점 요약 */}
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                <div className="md:w-1/3 flex flex-col items-center justify-center">
                  <div className="text-5xl font-bold text-primary mb-2">{product.rating}</div>
                  <div className="flex text-yellow-400 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <i 
                        key={i} 
                        className={`fas fa-star ${i < Math.floor(product.rating) ? '' : i < product.rating ? 'fas fa-star-half-alt' : 'far fa-star'}`}
                      ></i>
                    ))}
                  </div>
                  <div className="text-gray-500 text-sm">{product.reviewCount} 리뷰 기준</div>
                </div>
                
                <div className="md:w-2/3">
                  {product.reviewDetails.map((detail) => (
                    <div key={detail.rating} className="flex items-center mb-2">
                      <div className="w-16 text-sm">{detail.rating}점</div>
                      <div className="flex-1 mx-4">
                        <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-400 rounded-full" 
                            style={{ width: `${(detail.count / product.reviewCount) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-12 text-sm text-gray-500 text-right">{detail.count}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 리뷰 목록 */}
              <div>
                <h3 className="text-lg font-bold mb-4">고객 리뷰</h3>
                {product.reviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">아직 리뷰가 없습니다.</p>
                ) : (
                  <div className="space-y-6">
                    {product.reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6">
                        <div className="flex items-center mb-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                            <img src={review.avatar} alt={review.userName} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="font-medium">{review.userName}</div>
                            <div className="flex items-center text-sm">
                              <div className="flex text-yellow-400 mr-2">
                                {[...Array(5)].map((_, i) => (
                                  <i key={i} className={`fas fa-star ${i < review.rating ? '' : 'text-gray-300'}`}></i>
                                ))}
                              </div>
                              <span className="text-gray-500">{review.date}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">{review.text}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <button className="flex items-center mr-4 hover:text-primary">
                            <i className="far fa-thumbs-up mr-1"></i>
                            유용해요 ({review.helpfulCount})
                          </button>
                          <button className="hover:text-primary">
                            <i className="far fa-comment-alt mr-1"></i>
                            댓글 달기
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* 더보기 버튼 */}
                {product.reviews.length > 0 && (
                  <div className="text-center mt-6">
                    <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                      리뷰 더보기
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 추천 상품 */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">함께 구매하면 좋은 상품</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* 여기에 관련 상품 컴포넌트 추가 */}
            {/* 실제로는 ProductCard 컴포넌트를 사용할 것 */}
            {product.relatedProducts.map((id) => (
              <div key={id} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="h-40 bg-gray-200"></div>
                <div className="p-4">
                  <h3 className="font-medium">관련 상품 {id}</h3>
                  <p className="text-primary font-bold">가격 정보</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage; 