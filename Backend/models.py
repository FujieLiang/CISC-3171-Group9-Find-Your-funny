from config import database
from datetime import datetime, time
from flask_login import UserMixin
import enum

class User(database.Model, UserMixin):
    __tablename__ = 'users'
    id = database.Column(database.Integer, primary_key=True)
    username = database.Column(database.String(50),nullable = False,unique = True)
    passwordHash = database.Column(database.String(256), nullable = False)
    firstName = database.Column(database.String(50), nullable = False)
    lastName = database.Column(database.String(50), nullable = False)
    email = database.Column(database.String(50), unique = True, nullable = False)
    streetAddress = database.Column(database.String(100), nullable = False)
    city = database.Column(database.String(50), nullable = False)
    state = database.Column(database.String(50), nullable = False)
    country = database.Column(database.String(50), nullable = False)
    zipCode = database.Column(database.Integer, nullable = False)
    latitude = database.Column(database.Float, nullable = False)
    longitude = database.Column(database.Float, nullable = False)
    
    def to_json(self):
        return{
            "username": self.username,
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
    __tablename__ = 'venues'
    id = database.Column(database.Integer, primary_key=True)
    streetAddress = database.Column(database.String(100), nullable = False)
    city = database.Column(database.String(50), nullable = False)
    state = database.Column(database.String(50), nullable = False)
    country = database.Column(database.String(50), nullable = False)
    zipCode = database.Column(database.Integer, nullable = False)
    latitude = database.Column(database.Float, nullable = False)
    longitude = database.Column(database.Float, nullable = False)
    events = database.relationship('Events',backref = 'listings', lazy= 'dynamic')

    def to_json(self):
        return{
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
    name = database.Column(database.String(50), nullable = False)
    description = database.Column(database.String(50), nullable = False)
    category = database.Column(database.String(50), nullable = False)
    streetAddress = database.Column(database.String(100), nullable = False)
    city = database.Column(database.String(50), nullable = False)
    state = database.Column(database.String(50), nullable = False)
    country = database.Column(database.String(50), nullable = False)
    zipCode = database.Column(database.Integer, nullable = False)
    latitude = database.Column(database.Float, nullable = False)
    longitude = database.Column(database.Float, nullable = False)
    organizer = database.Column(database.Integer, database.ForeignKey('users.id'), nullable = False)
    startTime = database.Column(database.String(20), default = lambda: datetime.strftime("%H:%M"), nullable = False)
    endTime = database.Column(database.String(20), default = lambda: datetime.strftime("%H:%M"), nullable = False)
    createdAt = database.Column(database.DateTime, default=datetime.utcnow)
    
    def to_json(self):
        return{
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
    id = database.Column(database.Integer, primary_key= True)
    name = database.Column(database.String(50), unique = True, nullable = False)

class Event_Signup_List(database.Model):
    __tablename__ = 'event_signup_list'
    id = database.Column(database.Integer, primary_key= True)
    name = database.Column(database.Integer,database.ForeignKey('users.id'),nullable = False)
    event = database.Column(database.Integer,database.ForeignKey('events.id'),nullable =False)
