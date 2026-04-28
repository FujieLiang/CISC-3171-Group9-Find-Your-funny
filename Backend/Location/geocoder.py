import time
import requests


class Geocoder:
    BASE_URL_FORWARD = "https://geocode.maps.co/search"
    BASE_URL_REVERSE = "https://geocode.maps.co/reverse"
    HEADERS = {"User-Agent": "FYFProject/1.0 (geocoding)"}
    MIN_REQUEST_INTERVAL = 1.1

    def __init__(self, api_key: str):
        self.api_key = api_key
        self._last_request_at = 0.0

    def _throttle(self):
        elapsed = time.time() - self._last_request_at
        if elapsed < self.MIN_REQUEST_INTERVAL:
            time.sleep(self.MIN_REQUEST_INTERVAL - elapsed)

    def _request(self, url, params, attempts=3):
        last_err = None
        for _ in range(attempts):
            self._throttle()
            try:
                response = requests.get(url, params=params, headers=self.HEADERS, timeout=15)
            except requests.RequestException as exc:
                last_err = exc
                self._last_request_at = time.time()
                continue
            self._last_request_at = time.time()

            if response.status_code == 200:
                return response
            if response.status_code in (429, 503):
                last_err = Exception(f"Geocoder rate-limited ({response.status_code})")
                continue
            raise Exception(
                f"Geocoder error {response.status_code}: {response.text[:200]}"
            )
        raise last_err if last_err else Exception("Geocoder request failed")

    def geocode(self, address):
        if not address or not str(address).strip():
            raise Exception("Empty address")
        params = {"q": str(address).strip(), "api_key": self.api_key}
        response = self._request(self.BASE_URL_FORWARD, params)
        data = response.json()
        if not data:
            raise Exception(f"No geocoding results for: {address}")
        return float(data[0]["lat"]), float(data[0]["lon"])

    def reverse_geocode(self, latitude, longitude):
        params = {"lat": latitude, "lon": longitude, "api_key": self.api_key}
        response = self._request(self.BASE_URL_REVERSE, params)
        data = response.json() or {}
        addr = data.get("address") or {}
        return {
            "city": addr.get("city") or addr.get("town") or addr.get("village"),
            "state": addr.get("state"),
            "country": addr.get("country"),
            "zipCode": addr.get("postcode"),
            "raw": data,
        }
