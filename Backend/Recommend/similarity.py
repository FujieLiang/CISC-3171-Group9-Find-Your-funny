import math


def cosine_similarity(vector1, vector2):
    keys = set(vector1.keys()) | set(vector2.keys())
    v1 = [vector1.get(k, 0) for k in keys]
    v2 = [vector2.get(k, 0) for k in keys]

    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1))
    norm2 = math.sqrt(sum(b * b for b in v2))

    if norm1 == 0 or norm2 == 0:
        return 0

    return dot / (norm1 * norm2)

def pearson_correlation(vector1, vector2):
    keys = set(vector1.keys()) | set(vector2.keys())
    v1 = [vector1.get(k, 0) for k in keys]
    v2 = [vector2.get(k, 0) for k in keys]

    mean1 = sum(v1) / len(v1)
    mean2 = sum(v2) / len(v2)

    centered1 = [a - mean1 for a in v1]
    centered2 = [b - mean2 for b in v2]

    dot = sum(a * b for a, b in zip(centered1, centered2))
    norm1 = math.sqrt(sum(a * a for a in centered1))
    norm2 = math.sqrt(sum(b * b for b in centered2))

    if norm1 == 0 or norm2 == 0:
        return 0

    return dot / (norm1 * norm2)
