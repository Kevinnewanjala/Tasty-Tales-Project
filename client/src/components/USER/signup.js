import React, { useState, useRef } from 'react';

const Signup = () => {
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);
    const errRef = useRef();

    const SIGNUP_URL = "https://tasty-tales-server.onrender.com/user/signup";

    const handleSignup = async (e) => {
        e.preventDefault();

        console.log("Submitting signup request with the following data:");
        console.log("Username:", userName);
        console.log("Email:", email);
        console.log("Password:", password);

        if (password !== confirmPassword) {
            setErrMsg("Passwords do not match");
            errRef.current.focus();
            return;
        }

        try {
            const response = await fetch(SIGNUP_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userName, email, password }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log("Signup response data:", data);
            setSuccess(true);

            // Clear state and controlled inputs
            setUserName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');

        } catch (err) {
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 409) {
                setErrMsg('Username Taken');
            } else {
                setErrMsg('Registration Failed');
            }
            errRef.current.focus();
        }
    };

    return (
        <div>
            <p ref={errRef} aria-live="assertive">{errMsg}</p>
            {success ? (
                <section>
                    <h1>Success!</h1>
                    <p>
                        <a href="#">Sign In</a>
                    </p>
                </section>
            ) : (
                <section>
                    <h1>Sign Up</h1>
                    <form onSubmit={handleSignup}>
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            onChange={(e) => setUserName(e.target.value)}
                            value={userName}
                            required
                        />

                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            required
                        />

                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            required
                        />

                        <label htmlFor="confirm_password">Confirm Password:</label>
                        <input
                            type="password"
                            id="confirm_password"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            value={confirmPassword}
                            required
                        />

                        <button type="submit">Sign Up</button>
                    </form>
                </section>
            )}
        </div>
    );
};

export default Signup;
