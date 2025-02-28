import axios from "axios";
import { getCookie, hasCookie, deleteCookie, setCookie } from "cookies-next";

export default async function handler(req, res) {
    const requiredCookies = [
        "token",
        "refreshToken",
        "tokenType",
        "tokenExpiration"
    ];
    const data = [];

    if (requiredCookies.map(n => hasCookie(n, { req, res })).includes(false)) {
        return res.status(401).json({
            error: "Unauthorized",
            success: false
        });
    }

    requiredCookies.forEach(n => data[n] = getCookie(n, { req, res }));

    if (data.tokenExpiration < Date.now()) {
        // deepcode ignore HardcodedNonCryptoSecret
        const refreshData = await axios.post(
            "https://auth.bereal.team/token?grant_type=refresh_token",
            {
                "grant_type": "refresh_token",
                "client_id": "ios",
                "client_secret": "962D357B-B134-4AB6-8F53-BEA2B7255420",
                "refresh_token": data.refreshToken
            },
            {
                headers: {
                    "Accept": "*/*",
                    "User-Agent": "BeReal/8586 CFNetwork/1240.0.4 Darwin/20.6.0",
                    "x-ios-bundle-identifier": "AlexisBarreyat.BeReal",
                    "Content-Type": "application/json"
                }
            }
        );

        const setCookieOptions = {
            req,
            res,
            maxAge: 60 * 60 * 24 * 7 * 3600,
            path: "/",
        };

        setCookie("token", refreshData.data.access_token, setCookieOptions);
        setCookie("refreshToken", refreshData.data.refresh_token, setCookieOptions);
        setCookie("tokenExpiration", Date.now() + (refreshData.data.expires_in * 1000), setCookieOptions);

        data.token = refreshData.data.access_token;
        data.refreshToken = refreshData.data.refresh_token;
    }

    const feedResponse = await axios.get(
        "https://mobile.bereal.com/api/feeds/discovery?limit=100",
        {
            "headers": {
                "Authorization": `Bearer ${data.token}`,
            }
        }
    );

    return res.status(200).json({
        data: feedResponse.data.posts,
        success: true
    });
};