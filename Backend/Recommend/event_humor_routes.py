from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import Events
from Recommend.event_humor_service import match_scores_for_user

event_humor_bp = Blueprint("event_humor", __name__)

@event_humor_bp.route("/recommendations/me", methods=["GET"])
@jwt_required()
def my_event_recommendations():
    user_id = int(get_jwt_identity())
    return jsonify({"scores": match_scores_for_user(user_id)})
