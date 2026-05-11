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
