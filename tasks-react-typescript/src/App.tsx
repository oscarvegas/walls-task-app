import { useEffect, useState } from "react";
import logo from './logo.svg';
import './App.css';
import _ from 'lodash';
import { connect } from "http2";

import { Login } from './Login';

import { TasksCrud } from './TasksCrud'

export const App = () => 
{
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('username');
    const [token, setToken] = useState(storedToken);
    
    const logoutUser = () =>
    {
        setToken('');
        localStorage.setItem('token', '');
        localStorage.setItem('username', '');
    };
    
    return (
        <>
            <link
                rel="stylesheet"
                href="https://cdn.jsdelivr.net/npm/bulma@1.0.2/css/bulma.min.css"
            />

            <div className="container is-max-desktop">
                <header style={{ height: '80px'}}>
                    <img src={logo} className="App-logo mt-1" alt="logo"  style={{maxHeight: '32px'}} />
                    <span className="has-text-info">
                        Tasks App Wallsteam
                    </span>

                    {
                        token != '' &&
                        <button className="button is-small is-danger is-pulled-right mt-3" onClick={logoutUser}>
                            Logout {storedUser}
                        </button>
                    }
                </header>
                

                <div className="columns is-multiline">

                   { token == '' ? <Login setToken={setToken} /> : <TasksCrud />}                 
                    
                </div>
            </div>
            
        </>
    );
};
