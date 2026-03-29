from flask import request, jsonify
from config import app, database
from models import *

@app.route("/venues", methods=["GET"])
def get_venues():
    venues = Venue.query.all()
    jsonVenues = list(map(lambda x: x.to_json(), venues))
    return jsonify({"Venues":jsonVenues})

@app.route("/create-account", methods=["POST"])
def create_account():
    id = request.json.get("id")
    firstName = request.json.get("firstName")
    lastName = request.json.get("lastName")
    email = request.json.get("email")
    password = request.json.get("password")
    streetAddress = request.json.get("streetAddress")
    city = request.json.get("city")
    state = request.json.get("state")
    country = request.json.get("country")
    zipCode = request.json.get("zipCode")

    passwordHash = hash(password)

    if not id or not firstName or not lastName or not email or not passwordHash or not streetAddress or not city or not state or not country or not zipCode:
        return(jsonify({"message":"Incorrect value in submission. Please resubmit."}), 400)
    
    newUser = User(id=id, firstName=firstName, lastName=lastName, email=email, passwordHash=passwordHash,streetAddress=streetAddress,city=city,state=state,country=country,zipCode=zipCode)
    try:
        database.session.add(newUser)
        database.session.commit()
    except Exception as e:
        return jsonify({"message": str(e)}), 400
    
    return jsonify({"message": "New user created"}), 201
    
@app.route("/events", methods=["GET"])
def get_venues():
    events = Events.query.all()
    jsonVenues = list(map(lambda x: x.to_json(), events))
    return jsonify({"Events":jsonVenues})
    

if __name__ == "__main__":
    with app.app_context():
        database.create_all()

    app.run(debug=True)

