import numpy as np


# 추천 시스템
class Recommandation:
    # 자카드 유사도
    def get_jaccard_similarity(user, other_user):
        """
        사용자와 다른 사용자의 리스트를 받아서 자카드 유사도를 리턴한다.
        리스트 길이는 10개의 인덱스로 이루어져 있으며, 중복이 없어야 한다.
        float 형식으로 리턴한다.
        """
        user = set(user)
        other_user = set(other_user)

        return float(len(user.intersection(other_user)) / len(user.union(other_user)))

    # 피어슨 유사도
    # def get_pearson_similarity(item, other_item):
    #     """
    #     두 상품에 대한 평점 리스트를 받아서 피어슨 유사도를 리턴한다.
    #     """
    #     return np.dot((item - np.mean(item)), (other_item - np.mean(other_item))) / (
    #         (np.linalg.norm(item - np.mean(item)))
    #         * (np.linalg.norm(other_item - np.mean(other_item)))
    #     )
