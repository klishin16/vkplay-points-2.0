import * as NodeFetch from 'node-fetch'

declare module 'node-fetch-cookies' {
    export const CookieJar;
    export const fetch ;
}