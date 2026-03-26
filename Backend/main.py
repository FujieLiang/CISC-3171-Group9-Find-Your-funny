from flask import request, jsonify
from config import app, database
from models import Venue

@app.route("/venues", methods=["GET"])
def get_venues():
    venues = Venue.query.all()
    jsonVenues = list(map(lambda x: x.to_json(), venues))
    return jsonify({"Venues":jsonVenues})

if __name__ == "__main__":
    with app.app_context():
        database.create_all()

    app.run(debug=True)

