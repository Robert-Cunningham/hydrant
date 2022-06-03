import requests
import requests_cache

requests_cache.install_cache('http_cache', backend='filesystem', serializer='json')