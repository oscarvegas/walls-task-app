import { useEffect, useState } from "react";

export const Login = (props) => 
{
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showNotif, setShowNotif] = useState(false);
    const [messageNotif, setMessageNotif] = useState('');
    // const [token, setToken] = useState('');
    const [message, setMessage] = useState('');

    const updateUsername = (event) => 
    {
        setUsername(event.target.value);
    };

    const updatePassword = (event) => 
    {
        setPassword(event.target.value);
    };

    const loginUser = async () => 
    {
        setIsLoading(true);
        
        const response = await fetch('http://localhost:3001/login',
            {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                }),
            }
        );

        if (response.status == 401) {
            let responseData = await response.text();
            setMessageNotif(responseData);
            setShowNotif(true);
            setTimeout(() => {
                setShowNotif(false);
            }, 3000);
        } else {
            let responseData = await response.json();   
            props.setToken(responseData.token);
            localStorage.setItem('token', responseData.token);
            localStorage.setItem('username', username);
        }

        setIsLoading(false);
    };

    return (
        <div className="column is-4">
            {
                showNotif && 
                    <div className="notification is-danger" style={{position:'fixed', top: '2rem', right: '40%'}}>
                        {/* <button className="delete"></button> */}
                        <strong>Error: </strong>
                        <span>{ messageNotif }</span>.
                    </div>        
            }

            <h3 className="title is-3 has-text-info">Login</h3>

            <div className="field is-horizontal">
                <div className="field-label is-required">
                    <label className="label">Username</label>
                </div>
                <div className="field-body">
                    <div className="field">
                        <p className="control">
                            <input 
                                className="input is-required" 
                                type="text"
                                required={true} 
                                onChange={updateUsername}
                            />
                        </p>
                    </div>
                </div>
            </div>

            <div className="field is-horizontal">
                <div className="field-label is-required">
                    <label className="label">Password</label>
                </div>
                <div className="field-body">
                    <div className="field">
                        <p className="control">
                            <input 
                                className="input is-required" 
                                type="password"
                                required={true} 
                                onChange={updatePassword}
                            />
                        </p>
                    </div>
                </div>
            </div>

            <button className={`button is-success ${isLoading?'is-loading':''}`} onClick={loginUser}>
                Enter
            </button>
        
        </div>
    );

};
