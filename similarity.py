from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from config import database
from models import Comedian, HUMOR_CATEGORIES, UserHumorProfile
from Recommend.humor_profile_service import *
from Recommend.comedian_service import comedian_raw_vector

onboarding_bp = Blueprint("onboarding", __name__)

SWIPE_SET_SIZE = 10
PASS_WEIGHT = 0.3


def _comedian_payload(comedian):
    raw = comedian_raw_vector(comedian)
    top_traits = sorted(raw.items(), key=lambda kv: kv[1], reverse=True)[:3]
    return {
        "id": comedian.id,
        "name": comedian.name,
        "vector": raw,
        "topTraits": [k for k, _ in top_traits],
    }


@onboarding_bp.route("/status", methods=["GET"])
@jwt_required()
def onboarding_status():
    user_id = int(get_jwt_identity())
    profile = UserHumorProfile.query.filter_by(user_id=user_id).first()
    return jsonify({
        "hasProfile": profile is not None,
        "skipped": bool(profile.skipped_onboarding) if profile else False,
    })


@onboarding_bp.route("/swipe-set", methods=["GET"])
@jwt_required()
def swipe_set():
    rows = (
        Comedian.query
        .order_by(database.func.random())
        .limit(SWIPE_SET_SIZE)
        .all()
    )
    return jsonify({"comedians": [_comedian_payload(c) for c in rows]})


@onboarding_bp.route("/submit", methods=["POST"])
@jwt_required()
def submit_onboarding():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    skipped = bool(data.get("skipped"))
    likes = data.get("likes") or []
    passes = data.get("passes") or []

    if skipped or (not likes and not passes):
        quiz_vector = default_vector(5.0)
        skipped_flag = True
    else:
        liked = Comedian.query.filter(Comedian.id.in_(likes)).all() if likes else []
        passed = Comedian.query.filter(Comedian.id.in_(passes)).all() if passes else []

        liked_vectors = [comedian_raw_vector(c) for c in liked]
        passed_vectors = [comedian_raw_vector(c) for c in passed]

        liked_avg = average_vectors(liked_vectors) if liked_vectors else default_vector(0.0)
        passed_avg = average_vectors(passed_vectors) if passed_vectors else default_vector(0.0)

        quiz_vector = {
            k: max(0.0, liked_avg.get(k, 0.0) - PASS_WEIGHT * passed_avg.get(k, 0.0))
            for k in HUMOR_CATEGORIES
        }

        if not any(v > 0 for v in quiz_vector.values()):
            quiz_vector = default_vector(5.0)

        skipped_flag = False

    save_quiz_vector(user_id, quiz_vector, skipped=skipped_flag)
    final_vector = recompute_final_vector(user_id)

    return jsonify({
        "skipped": skipped_flag,
        "quiz_vector": quiz_vector,
        "final_vector": final_vector,
    })
