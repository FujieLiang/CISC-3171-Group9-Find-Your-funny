from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import User
from Recommend.humor_profile_service import save_quiz_vector, recompute_final_vector
from Recommend.recommendation_service import recommend_users_for

recommend_bp = Blueprint("recommend", __name__)


@recommend_bp.route("/users", methods=["GET"])
@jwt_required()
def recommend_users():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    try:
        limit = int(request.args.get("limit", 6))
    except (TypeError, ValueError):
        limit = 6

    recommendations = recommend_users_for(user_id, limit=limit)

    return jsonify({
        "user_id": user_id,
        "count": len(recommendations),
        "recommendations": recommendations,
    })


@recommend_bp.route("/profile/quiz", methods=["POST"])
@jwt_required()
def create_quiz_profile():
    data = request.get_json() or {}
    user_id = int(get_jwt_identity())
    quiz_vector = data.get("quiz_vector")

    if not quiz_vector:
        return jsonify({"error": "quiz_vector is required"}), 400

    save_quiz_vector(user_id, quiz_vector)

    return jsonify({
        "message": "Quiz vector saved",
        "user_id": user_id,
    })


@recommend_bp.route("/profile/recompute", methods=["POST"])
@jwt_required()
def recompute_profile():
    user_id = int(get_jwt_identity())
    final_vector = recompute_final_vector(user_id)

    if final_vector is None:
        return jsonify({"error": "Humor profile not found"}), 404

    return jsonify({
        "message": "Final humor vector updated",
        "user_id": user_id,
        "final_vector": final_vector,
    })
