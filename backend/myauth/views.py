import datetime
from base64 import b64decode, b64encode, urlsafe_b64encode
from secrets import token_bytes
from urllib.parse import urlencode
from hashlib import sha256
import logging

import requests
from django.conf import settings
from django.http import HttpRequest
from django.http.response import (
    HttpResponse,
    HttpResponseBadRequest,
    HttpResponseNotAllowed,
    HttpResponseRedirect,
)
from util import response
from myauth import auth_check
from django.utils.http import url_has_allowed_host_and_scheme
from django.views.decorators.csrf import csrf_exempt
import msal

logger = logging.getLogger(__name__)

# Whether the id_token should be stored as a cookie
user_id_token = False


@response.request_get()
def me_view(request):
    if request.user != None:
        return response.success(
            loggedin=True,
            adminrights=auth_check.has_admin_rights(request),
            adminrightscat=auth_check.has_admin_rights_for_any_category(request),
            username=request.user.username,
            displayname=request.user.displayname(),
        )
    else:
        return response.success(
            loggedin=False,
            adminrights=False,
            adminrightscat=False,
            username="",
            displayname="Not Authorized",
        )


def redirect_url_from_host(host: str):
    return ("http://" if settings.DEBUG else "https://") + host + "/api/auth/callback"


# https://gist.github.com/cameronmaske/f520903ade824e4c30ab
def base64url_encode(data: bytes):
    """
    Removes any `=` used as padding from the encoded string.
    """
    encoded = str(urlsafe_b64encode(data), "utf-8")
    return encoded.rstrip("=")


state_delimeter = ":"

# We encode our state params as b64(nonce):rd_url
def encode_state(nonce: bytes, redirect_url: str):
    return str(b64encode(nonce), "utf-8") + state_delimeter + redirect_url


# Decode callback state into nonce and rd_url
def decode_state(state: str):
    parts = state.split(state_delimeter)
    if len(parts) != 2:
        raise ValueError("invalid state format")
    nonce = b64decode(bytes(parts[0], "utf-8"))
    redirect_url = parts[1]
    return nonce, redirect_url


def compute_hash(value: bytes):
    m = sha256()
    m.update(value)
    return base64url_encode(m.digest())


def get_msal_app():
    return msal.ConfidentialClientApplication(
        settings.AZURE_AD_CLIENT_ID,
        authority=settings.AZURE_AD_AUTHORITY,
        client_credential=settings.AZURE_AD_CLIENT_SECRET,
    )


def login(request: HttpRequest):
    msal_app = get_msal_app()
    auth_url = msal_app.get_authorization_request_url(
        scopes=["User.Read"],
        redirect_uri=settings.AZURE_AD_REDIRECT_URI,
    )
    return HttpResponseRedirect(auth_url)


def callback(request: HttpRequest):
    msal_app = get_msal_app()
    code = request.GET.get("code")
    result = msal_app.acquire_token_by_authorization_code(
        code,
        scopes=["User.Read"],
        redirect_uri=settings.AZURE_AD_REDIRECT_URI,
    )
    if "access_token" in result:
        response = HttpResponseRedirect("/")
        set_token_cookies(response, result)
        return response
    else:
        return HttpResponse("Authentication failed", status=401)


def set_token_cookies(response: HttpResponse, token_response):
    access_token = token_response["access_token"]
    response.set_cookie(
        "access_token",
        access_token,
        httponly=True,
        samesite="Strict",
        secure=settings.SECURE,
    )
    if "refresh_token" in token_response:
        refresh_token = token_response["refresh_token"]
        response.set_cookie(
            "refresh_token",
            refresh_token,
            httponly=True,
            samesite="Strict",
            secure=settings.SECURE,
        )


def refresh(request: HttpRequest):
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])

    refresh_token = request.COOKIES.get("refresh_token")
    scope = request.GET.get("scope", "")
    if refresh_token is None:
        return HttpResponseBadRequest("refresh_token not found")

    msal_app = get_msal_app()
    result = msal_app.acquire_token_by_refresh_token(
        refresh_token,
        scopes=["User.Read"],
    )
    if "access_token" in result:
        response = HttpResponse()
        set_token_cookies(response, result)
        return response
    else:
        return HttpResponse("Refresh token failed", status=401)


def logout(request: HttpRequest):
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])

    redirect_url = request.GET.get("rd", "/")
    # Check whether the redirect url is allowed: Only allow redirects to the same application
    if not url_has_allowed_host_and_scheme(
        redirect_url, settings.REAL_ALLOWED_HOSTS, settings.SECURE
    ):
        return HttpResponseBadRequest("invalid redirect url")

    response = HttpResponse()
    response.status_code = 302

    response.delete_cookie("id_token")
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    response.delete_cookie("token_expires")

    # redirect back to the location that was used in login
    response.headers["Location"] = redirect_url

    return response


@csrf_exempt
def local_login(request: HttpRequest):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    username = request.POST.get("username")
    if not username:
        return HttpResponseBadRequest("Username is required")

    # Simulate a user login for localhost development
    user = authenticate(username=username)
    if user is None:
        return HttpResponseBadRequest("Invalid username")

    login(request, user)
    return response.success(loggedin=True, username=user.username, displayname=user.displayname())
