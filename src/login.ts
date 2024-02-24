import { IAuthToken, ICredentials } from "./types";
import { logger } from "./logger.js";
import { Cookie, CookieJar } from 'tough-cookie';
import { wrapper } from "axios-cookiejar-support";
import axios from "axios";
import { GET_TOKEN_URL, SIGN_IN_URL, SIGN_IN_URL2 } from "./constants.js";
import Serialized = Cookie.Serialized;

export const login = async (credentials: ICredentials): Promise<IAuthToken | null> => {
    logger.log('Logging...')
    try {
        const jar = new CookieJar();
        const client = wrapper(axios.create({jar}));

        const res1 = await client.post(
            SIGN_IN_URL,
            {
                login: credentials.email,
                password: credentials.password
            },
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "origin": "https://account.vkplay.ru",
                    "referer": "https://account.vkplay.ru/",
                },

            }
        );

        const csrf_cookie: Serialized | undefined = res1.config.jar?.toJSON()['cookies'].find(cookie => cookie.key === 'csrftoken');

        if (!csrf_cookie) {
            throw new Error(`CSRF token cookie was not found`)
        }


        await client.post(
            SIGN_IN_URL2,
            {
                csrfmiddlewaretoken: csrf_cookie.value,
                response_type: "code"
            },
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "origin": "https://account.vkplay.ru",
                    "referer": "https://account.vkplay.ru/",
                },

            }
        );

        const token_response = await client.get(
            GET_TOKEN_URL,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "origin": "https://account.vkplay.ru",
                    "referer": "https://account.vkplay.ru/"
                }
            });

        const auth_cookie: Serialized | undefined = token_response.config.jar?.toJSON()['cookies'].find(cookie => cookie.key === 'auth');

        const client_id_cookie: Serialized | undefined = token_response.config.jar?.toJSON()['cookies'].find(cookie => cookie.key === '_clientId');

        if (!auth_cookie) {
            throw new Error(`Auth token cookie was not found`)
        }
        if (!client_id_cookie) {
            throw new Error('Client id cookie was not found')
        }
        const decoded_url_cookie = decodeURIComponent(auth_cookie.value as unknown as string);
        const res = JSON.parse(decoded_url_cookie);

        return {
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            expiresAt: new Date(res.expiresAt),
            clientId: decodeURIComponent(client_id_cookie.value as unknown as string),
        }
    } catch (e) {
        logger.error(`Login error: ${ e }`);
        return null
    }
}