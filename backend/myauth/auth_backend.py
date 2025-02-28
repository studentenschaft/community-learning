import logging
from typing import Union
import urllib.request
import json
import msal

from django.conf import settings
from django.core.exceptions import PermissionDenied
from django.http.request import HttpRequest
from notifications.models import NotificationSetting, NotificationType
from util.func_cache import cache

from myauth.models import MyUser, Profile
from datetime import datetime, timezone
from django.db import transaction

logger = logging.getLogger(__name__)

def get_msal_app():
    return msal.ConfidentialClientApplication(
        settings.AZURE_AD_CLIENT_ID,
        authority=settings.AZURE_AD_AUTHORITY,
        client_credential=settings.AZURE_AD_CLIENT_SECRET,
    )

def add_auth(request: HttpRequest):
    request.user = None
    headers = request.headers

    encoded = headers.get("Authorization")
    if encoded and encoded.startswith("Bearer "):
        encoded = encoded.split(" ")[1]
    else:
        encoded = request.COOKIES.get("access_token")

    if encoded:
        msal_app = get_msal_app()
        result = msal_app.acquire_token_by_authorization_code(encoded, scopes=["User.Read"])
        if "access_token" in result:
            claims = result.get("id_token_claims")
            sub = claims["sub"]
            preferred_username = claims["preferred_username"]
            if preferred_username in settings.BANNED_USERS:
                raise PermissionDenied("User is banned")

            roles = claims.get("roles", [])
            request.roles = roles

            existing_user = MyUser.objects.filter(profile__sub=sub).first()
            if existing_user:
                request.user = existing_user
                changed = False

                if claims["given_name"] != existing_user.first_name:
                    changed = True
                    existing_user.first_name = claims["given_name"]

                if claims["family_name"] != existing_user.last_name:
                    changed = True
                    existing_user.last_name = claims["family_name"]

                if changed:
                    existing_user.save()
            else:
                user = MyUser()
                user.first_name = claims["given_name"]
                user.last_name = claims["family_name"]
                user.username = preferred_username
                user.save()

                Profile.objects.create(user=user, sub=sub)
                request.user = user

def AuthenticationMiddleware(get_response):
    def middleware(request):
        # Allow access to the main page without authentication
        if request.path == "/":
            return get_response(request)
        
        try:
            add_auth(request)
        except Exception as e:
            logger.warning(f"Authentication failed: {e}")

        response = get_response(request)
        return response

    return middleware
