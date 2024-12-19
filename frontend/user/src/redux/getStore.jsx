import store from './store';

export const getAccessToken = () => store.getState().user.accessToken;
