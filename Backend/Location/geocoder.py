import requests
from models import *

class Geocoder:
    BASE_URL_FORWARD = "https://geocode.maps.co/search"
    BASE_URL_REVERSE = "https://geocode.maps.co/reverse"

    def __init__(self,api_key: str):
        self.api_key = api_key

    def geocode(self, address):
        params ={
            "q": address,
            "api_key": self.api_key
        }

        response = requests.get(self.BASE_URL_FORWARD, params= params)

        if response.status_code != 200:
            raise Exception("Geocoding Failed")
        
        data = response.json()

        if not data:
            raise Exception("No results found!")
        
        latitude = float(data[0]["lat"])
        longitude = float(data[0]["lon"])
    
        return latitude,longitude
    
    def reverse_geocode(self,latitude,longitude):
        params ={
            "lat": latitude,
            "lon": longitude,
            "api_key": self.api_key
        }

        response = requests.get(self.BASE_URL_REVERSE, params= params)

        if response.status_code != 200:
            raise Exception("Geocoding Failed")
        
        data = response.json()

        if not data:
            raise Exception("No results found!")
        
        address = str(data[0]["address"])

        return address


    
    
