from config import database
from datetime import datetime, time

class User(database.Model):
    __tablename__ = 'user'
    id = database.Column(database.Integer, primary_key=True)
    firstName = database.Column(database.String, nullable = False)
    lastName = database.Column(database.String, nullable = False)
    email = database.Column(database.String, unique = True, nullable = False)
    passwordHash = database.Column(database.Integer, nullable = False)
    streetAddress = database.Column(database.String, nullable = False)
    city = database.Column(database.String, nullable = False)
    state = database.Column(database.String, nullable = False)
    country = database.Column(database.String, nullable = False)
    zipCode = database.Column(database.Integer, nullable = False)
    latitude = database.Column(database.Double, nullable = False)
    longitude = database.Column(database.Double, nullable = False)
    
    def to_json(self):
        return{
            "id":self.id,
            "firstName": self.firstName,
            "lastName": self.lastName,
            "email": self.email,
            "passwordHash": self.passwordHash,
            "streetAddress": self.streetAddress,
            "city": self.city,
            "state": self.state,
            "country": self.country,
            "zipCode": self.zipCode,
            "latitude": self.latitude,
            "longitude": self.longitude
        }
    
class Venue(database.Model):
    __tablename__ = 'venue'
    id = database.Column(database.Integer, primary_key=True)
    streetAddress = database.Column(database.String, nullable = False)
    city = database.Column(database.String, nullable = False)
    state = database.Column(database.String, nullable = False)
    country = database.Column(database.String, nullable = False)
    zipCode = database.Column(database.Integer, nullable = False)
    latitude = database.Column(database.Double, nullable = False)
    longitude = database.Column(database.Double, nullable = False)
    events = database.relationship('Events',backref = 'listings', lazy= 'dynamic')

    def to_json(self):
        return{
            "id":self.id,
            "streetAddress": self.streetAddress,
            "city": self.city,
            "state": self.state,
            "country": self.country,
            "zipCode": self.zipCode,
            "latitude": self.latitude,
            "longitude": self.longitude
        }

class Events(database.Model):
    __tablename__ = 'events'
    id = database.Column(database.Integer, primary_key=True)
    name = database.Column(database.String, nullable = False)
    description = database.Column(database.String, nullable = False)
    category = database.Column(database.String, nullable = False)
    location = database.Column(database.String, database.ForeignKey('user.id'), nullable = False)
    organizer = database.Column(database.String, database.ForeignKey(''))
    startTime = database.Column(database.String(20), default = lambda: datetime.strftime("%H:%M"), nullable = False)
    endTime = database.Column(database.String(20), default = lambda: datetime.strftime("%H:%M"), nullable = False)
    createdAt = database.Column(database.DateTime, default=datetime.estnow)
    
    def to_json(self):
        return{
            "id":self.id,
            "name": self.name,
            "description": self.description,
            "category": self.category,
            "location": self.location,
            "organizer": self.organizer,
            "startTime": self.startTime,
            "endTime": self.endTime
        }
    
class Role(database.Model):
    __tablename__ = 'role'
    id = database.Column(database.Integer(), primary_key= True)
    name = database.Column(database.String(50), unique = True, nullable = False)