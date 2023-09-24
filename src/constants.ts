/* eslint-disable @typescript-eslint/naming-convention */
export const MAIN_PAGE = 'https://vkplay.live/';
export const SIGN_IN_URL = "https://auth-ac.vkplay.ru/sign_in"
export const SIGN_IN_URL2 = 'https://account.vkplay.ru/oauth2/'
export const GET_TOKEN_URL = "https://account.vkplay.ru/oauth2/?redirect_uri=" +
    "https%3A%2F%2Fvkplay.live%2Fapp%2Foauth_redirect_vkplay&client_id=vkplay.live&response_type=code&skip_grants=1"
export const GET_WS_TOKEN_URL = "https://api.vkplay.live/v1/ws/connect"
export const WS_URL = "wss://pubsub.vkplay.live/connection/websocket"
export const RESCAN_STREAMS_INTERVAL = 1000 * 45;
