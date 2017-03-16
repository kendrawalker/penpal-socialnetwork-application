import axios from 'axios';

var instance = axios.create({
    xsrfCookieName: 'ChocChip',
    xsrfHeaderName: 'csrf-token'
});

export default instance;
