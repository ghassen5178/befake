import axios from "axios";
import { serialize } from "cookie";
import { setCookie } from "cookies-next";

const FIREBASE_API_KEY = "AIzaSyDwjfEeparokD7sXPVQli9NsTuhT6fJ6iA";

export default async function handler(req, res) {
    const { otp, requestId } = req.body;

    try {
        let fire_otp_response = await axios.post(
            "https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPhoneNumber?key=" + FIREBASE_API_KEY,
            {
                "code": otp,
                "sessionInfo": requestId,
                "operation": "SIGN_UP_OR_IN"
            },
            {
                "headers": {
                    "content-type": "application/json",
                    "x-firebase-client": "apple-platform/ios apple-sdk/19F64 appstore/true deploy/cocoapods device/iPhone9,1 fire-abt/8.15.0 fire-analytics/8.15.0 fire-auth/8.15.0 fire-db/8.15.0 fire-dl/8.15.0 fire-fcm/8.15.0 fire-fiam/8.15.0 fire-fst/8.15.0 fire-fun/8.15.0 fire-install/8.15.0 fire-ios/8.15.0 fire-perf/8.15.0 fire-rc/8.15.0 fire-str/8.15.0 firebase-crashlytics/8.15.0 os-version/14.7.1 xcode/13F100",
                    "accept": "*/*",
                    "x-client-version": "iOS/FirebaseSDK/8.15.0/FirebaseCore-iOS",
                    "x-firebase-client-log-type": "0",
                    "x-ios-bundle-identifier": "AlexisBarreyat.BeReal",
                    "accept-language": "en",
                    "user-agent": "FirebaseAuth.iOS/8.15.0 AlexisBarreyat.BeReal/0.22.4 iPhone/14.7.1 hw/iPhone9_1",
                    "x-firebase-locale": "en",
                }
            }
        );

        let fire_refresh_token = fire_otp_response.data.refreshToken;
        let is_new_user = fire_otp_response.data.isNewUser;
        let uid = fire_otp_response.data.localId;

        let firebase_refresh_response = await axios.post(
            "https://securetoken.googleapis.com/v1/token?key=" + FIREBASE_API_KEY,
            {
                "grantType": "refresh_token",
                "refreshToken": fire_refresh_token
            },
            {
                "headers": {
                    "Accept": "application/json",
                    "User-Agent": "BeReal/8586 CFNetwork/1240.0.4 Darwin/20.6.0",
                    "x-ios-bundle-identifier": "AlexisBarreyat.BeReal",
                    "Content-Type": "application/json"
                }
            }
        );

        let firebase_token = firebase_refresh_response.data.id_token;
        let firebase_refresh_token = firebase_refresh_response.data.refresh_token;
        let user_id = firebase_refresh_response.data.user_id;
        let firebase_expiration = Date.now() + firebase_refresh_response.data.expires_in * 1000;

        // deepcode ignore HardcodedNonCryptoSecret
        let access_grant_response = await axios.post(
            "https://auth.bereal.team/token?grant_type=firebase",
            {
                "grant_type": "firebase",
                "client_id": "ios",
                "client_secret": "962D357B-B134-4AB6-8F53-BEA2B7255420",
                "token": firebase_token
            },
            {
                "headers": {
                    "Accept": "application/json",
                    "User-Agent": "BeReal/8586 CFNetwork/1240.0.4 Darwin/20.6.0",
                    "x-ios-bundle-identifier": "AlexisBarreyat.BeReal",
                    "Content-Type": "application/json"
                }
            }
        );

        let access_token = access_grant_response.data.access_token;
        let access_refresh_token = access_grant_response.data.refresh_token;
        let access_token_type = access_grant_response.data.token_type;
        let access_expiration = Date.now() + (Number(access_grant_response.data.expires_in) * 1000);

        const setCookieOptions = {
            req,
            res,
            maxAge: 60 * 60 * 24 * 7 * 3600,
            path: "/",
        };

        setCookie("token", access_token, setCookieOptions);
        setCookie("refreshToken", access_refresh_token, setCookieOptions);
        setCookie("tokenType", access_token_type, setCookieOptions);
        setCookie("tokenExpiration", Date.now() + (access_expiration * 1000), setCookieOptions);

        res.status(200).json({
            success: true,
        });
    } catch (e) {
        console.log(e)
        return res.status(500).json({ error: "Internal server error", success: false });
    }
};