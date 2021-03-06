import decode from 'jwt-decode';
export default class AuthService {
    constructor(domain) {
        this.domain = domain || 'http://localhost:8000'
        this.fetch = this.fetch.bind(this)
        this.localSignUp = this.localSignUp.bind(this);
        this.getProfile = this.getProfile.bind(this)
    }



    signup(userData){

        return this.fetch(`${this.domain}/local`, {
            method: 'POST',
            body: JSON.stringify(userData)
            }).then(function (response) {
                return response.json()
            }).then(res => {
                console.log("return from server");
                console.log(res);
                this.setToken(res.token)
                return Promise.resolve(res);
                // return resolve(res);
            }).catch(err => {
                console.log(err);
            })
    }

    localSignUp(username, password,  provider, email, firstname, lastname) {
    // Get a token
        return this.fetch(`${this.domain}/auth/local-signup`, {
            method: 'POST',
            body: JSON.stringify({ username, password,  provider, email, firstname, lastname })
        }).then(res => {
            console.log(JSON.stringify(res));
            if(res.token !== null){
                this.setToken(res)
            }
            return Promise.resolve(res);
        })
    }

    localLogin(username, password){
        return this.fetch(`${this.domain}/auth/local-login`, {
            method: 'POST',
            body: JSON.stringify({ username, password })
        }).then(res => {
            console.log(JSON.stringify(res));
            if(res.token !== null){
                this.setToken(res)
            }
            return Promise.resolve(res);
        })
    }

    loggedIn() {
        // Checks if there is a saved token and it's still valid
        const token = this.getToken()
        return !!token && !this.isTokenExpired(token) // handwaiving here
    }

    isTokenExpired(token) {
        try {
            const decoded = decode(token);
            if (decoded.exp < Date.now() / 1000) {
                return true;
            }
            else
                return false;
        }
        catch (err) {
            return false;
        }
    }

    setToken(res) {
        // Saves user token to localStorage
        localStorage.setItem('id_token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
    }

    getToken() {
        // Retrieves the user token from localStorage
        return localStorage.getItem('id_token')
    }

    logout() {
        // Clear user token and profile data from localStorage
        localStorage.removeItem('id_token');
        localStorage.removeItem('user');
    }

    getProfile() {
        return decode(this.getToken());
    }


    fetch(url, options) {
        // performs api calls sending the required authentication headers
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }

        if (this.loggedIn()) {
            headers['Authorization'] = 'Bearer ' + this.getToken()
        }
        //
        return fetch(url, {
            headers,
            // ...options
        })
            .then(this._checkStatus)
            .then(response => response.json())
    }

    _checkStatus(response) {
        // raises an error in case response status is not a success
        if (response.status >= 200 && response.status < 300) {
            return response
        } else {
            var error = new Error(response.statusText)
            error.response = response
            throw error
        }
    }
}
