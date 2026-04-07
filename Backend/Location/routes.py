from flask import Blueprint, request, jsonify
from .geocoder import Geocoder
from .distance_service import DistanceService
from .matching_service import MatchingService

location_bp = Blueprint("location", __name__)

geocoder = Geocoder(api_key= "69cc5ed34ef27252477349axzad0499")
distance_service = DistanceService()
matcher = MatchingService(distance_service)

@location_bp.route("/geocode", methods=["POST"])
def geocode():
    body = request.get_json()
    address = body.get("address")

    latitude, longitude = geocoder.geocode(address)
    return jsonify({"latitude": latitude, "longitude": longitude})

@location_bp.route("/rev_geocode", methods=["POST"])
def reverse_geocode():
    body = request.get_json()
    latitude = body.get("latitude")
    longitude = body.get("longitude")

    address = geocoder.reverse_geocode(latitude,longitude)
    return jsonify({"address": address})

@location_bp.route("/distance", methods=["POST"])
def distance():
    body = request.get_json()
    lat1, lon1 = body["point1"]
    lat2, lon2 = body["point2"]

    dist = distance_service.haversine(lat1, lon1, lat2, lon2)
    return jsonify({"distance_km": dist})

@location_bp.route("/events/nearby", methods=["POST"])
def nearby_events():
    body = request.get_json()
    user_lat = body["user_lat"]
    user_lon = body["user_lon"]
    events = body["events"]

    matches = matcher.find_nearby_events(user_lat, user_lon, events)
    return jsonify(matches)

