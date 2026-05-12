from models import Comedian, HUMOR_CATEGORIES


def comedian_raw_vector(comedian):
    return {k: getattr(comedian, k) for k in HUMOR_CATEGORIES}


def normalize_comedian_vector(comedian):
    raw = comedian_raw_vector(comedian)
    total = sum(raw.values()) or 1
    return {k: v / total for k, v in raw.items()}
