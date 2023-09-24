import {ICredentials} from "./types.ts";
import {logger} from "./logger.ts";
import {GET_TOKEN_URL, LOGIN_URL, SIGN_IN_URL} from "./constants.ts";
import fetch, {Response} from "node-fetch";
import { jar, request } from 'request'


function parseCookies(response: Response) {
    const raw = response.headers.raw()['set-cookie'];
    return raw.map((entry) => {
        const parts = entry.split(';');
        const cookiePart = parts[0];
        return cookiePart;
    }).join(';');
}

export const login = async (credentials: ICredentials) => {
    logger.log('Logging...')
    try {
        const jar = jar();
        const accountResponse = request()

        const accountResponse = await fetch(
            SIGN_IN_URL,
            {
                headers: {
                    'accept': '*/*',
                    "Content-Type": "application/x-www-form-urlencoded",
                    "origin": "https://account.vkplay.ru",
                    "referer": "https://account.vkplay.ru/",
                    "cookie": '',
                },
                method: 'POST',
                body: {
                    login: credentials.email,
                    password: credentials.password
                }
            }
        );

        console.log(accountResponse.headers.forEach(v => console.log(v)))

        // const accountCookies = parseCookies(accountResponse);

        // console.log(accountCookies)

        // const response2 = await client.get(
        //     GET_TOKEN_URL,
        //     {
        //         withCredentials: true,
        //         headers: {
        //             "Content-Type": "application/x-www-form-urlencoded",
        //             "origin": "https://account.vkplay.ru",
        //             "referer": "https://account.vkplay.ru/"
        //         }
        //     });
        //
        // console.log('response2', response2.config.jar?.toJSON())

        // const cookies = await jar.toJSON()
        // console.log('jar', config.jar?.toJSON())
    } catch (e) {
        logger.error(`Login error: ${e}`);
    }
}