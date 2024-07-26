import React, { useEffect, useRef, useState } from 'react';
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import '../form.css'; // Adjusted import path for CSS styling
import NavBar from '../navbar';
import Footer from '../footer';

const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const SIGNUP_URL = '/user/signup';

const SignUp = () => {
    const userRef = useRef();
    const errRef = useRef();

    const [userName, setUserName] = useState('');
    const [validName, setValidName] = useState(false);
    const [userFocus, setUserFocus] = useState(false);

    const [email, setEmail] = useState('');
    const [validEmail, setValidEmail] = useState(false);
    const [emailFocus, setEmailFocus] = useState(false);
    
    const [password, setPassword] = useState('');
    const [validPassword, setValidPassword] = useState(false);
    const [passwordFocus, setPasswordFocus] = useState(false);

    const [confirmPassword, setConfirmPassword] = useState('');
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        userRef.current.focus();
    }, []);

    useEffect(() => {
        setValidName(USER_REGEX.test(userName));
    }, [userName]);

    useEffect(() => {
        setValidEmail(EMAIL_REGEX.test(email));
    }, [email]);

    useEffect(() => {
        setValidPassword(PASSWORD_REGEX.test(password));
        setValidMatch(password === confirmPassword);
    }, [password, confirmPassword]);

    useEffect(() => {
        setErrMsg('');
    }, [userName, password, confirmPassword, email]);

    const handleSignup = async (e) => {
        e.preventDefault();

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
            console.log(data.accessToken);
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
                setErrMsg('Registration Failed')
            }
            errRef.current.focus();
        }
    };

    return (
        <>
        <NavBar />
        <div
            className="d-flex justify-content-center align-items-center"
            style={{
                minHeight: '100vh',
                backgroundImage: 'url("https://images.creativemarket.com/0.1.0/ps/106400/1360/1924/m1/fpnw/wm1/ivphkooyxa5a2riftjbhe9r3zbipqlfc4wvwflk7o0xk0xfqrfb45nywjoukmedn-.jpg?1399222065&s=792b3e1cc37d2bbf9408ae4455aec6c6")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <div className="p-5 rounded shadow"
                 style={{
                     width: '100%',
                     maxWidth: '400px',
                     maxHeight: '1000px',
                     backgroundColor: 'rgba(255, 255, 255, 0.5)', // Semi-transparent background
                     backdropFilter: 'blur(5px)', // Blur effect
                     borderRadius: '10px', // Rounded corners
                     boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' // Subtle shadow
                 }}>
                {success ? (
                    <div className="text-center">
                        <h1>Success!</h1>
                        <p>
                            <a href="/login" className="btn btn-outline-primary mt-2">Sign In</a>
                        </p>
                    </div>
                ) : (
                    <div className="signup-form">
                        <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
                        <h1 className="text-center mb-4">Register</h1>
                        <form onSubmit={handleSignup}>
                            <div className="form-group mb-3">
                                <label htmlFor="username" className="form-label">
                                    Username:
                                    <FontAwesomeIcon icon={faCheck} className={validName ? "valid" : "hide"} />
                                    <FontAwesomeIcon icon={faTimes} className={validName || !userName ? "hide" : "invalid"} />
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    ref={userRef}
                                    className="form-control"
                                    autoComplete="off"
                                    onChange={(e) => setUserName(e.target.value)}
                                    value={userName}
                                    required
                                    aria-invalid={validName ? "false" : "true"}
                                    aria-describedby="uidnote"
                                    onFocus={() => setUserFocus(true)}
                                    onBlur={() => setUserFocus(false)}
                                />
                                <p id="uidnote" className={userFocus && userName && !validName ? "instructions" : "offscreen"}>
                                    <FontAwesomeIcon icon={faInfoCircle} />
                                    4 to 24 characters.<br />
                                    Must begin with a letter.<br />
                                    Letters, numbers, underscores, hyphens allowed.
                                </p>
                            </div>

                            <div className="form-group mb-3">
                                <label htmlFor="email" className="form-label">
                                    Email:
                                    <FontAwesomeIcon icon={faCheck} className={validEmail ? "valid" : "hide"} />
                                    <FontAwesomeIcon icon={faTimes} className={validEmail || !email ? "hide" : "invalid"} />
                                </label>
                                <input
                                    type="text"
                                    id="email"
                                    className="form-control"
                                    autoComplete="off"
                                    onChange={(e) => setEmail(e.target.value)}
                                    value={email}
                                    required
                                    aria-invalid={validEmail ? "false" : "true"}
                                    aria-describedby="emailnote"
                                    onFocus={() => setEmailFocus(true)}
                                    onBlur={() => setEmailFocus(false)}
                                />
                                <p id="emailnote" className={emailFocus && email && !validEmail ? "instructions" : "offscreen"}>
                                    <FontAwesomeIcon icon={faInfoCircle} />
                                    Must be a valid email address.
                                </p>
                            </div>

                            <div className="form-group mb-3">
                                <label htmlFor="password" className="form-label">
                                    Password:
                                    <FontAwesomeIcon icon={faCheck} className={validPassword ? "valid" : "hide"} />
                                    <FontAwesomeIcon icon={faTimes} className={validPassword || !password ? "hide" : "invalid"} />
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    className="form-control"
                                    onChange={(e) => setPassword(e.target.value)}
                                    value={password}
                                    required
                                    aria-invalid={validPassword ? "false" : "true"}
                                    aria-describedby="passwordnote"
                                    onFocus={() => setPasswordFocus(true)}
                                    onBlur={() => setPasswordFocus(false)}
                                />
                                <p id="passwordnote" className={passwordFocus && !validPassword ? "instructions" : "offscreen"}>
                                    <FontAwesomeIcon icon={faInfoCircle} />
                                    8 to 24 characters.<br />
                                    Must include uppercase and lowercase letters, a number and a special character.<br />
                                    Allowed special characters: ! @ # $ %
                                </p>
                            </div>

                            <div className="form-group mb-3">
                                <label htmlFor="confirm_password" className="form-label">
                                    Confirm Password:
                                    <FontAwesomeIcon icon={faCheck} className={validMatch && confirmPassword ? "valid" : "hide"} />
                                    <FontAwesomeIcon icon={faTimes} className={validMatch || !confirmPassword ? "hide" : "invalid"} />
                                </label>
                                <input
                                    type="password"
                                    id="confirm_password"
                                    className="form-control"
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    value={confirmPassword}
                                    required
                                    aria-invalid={validMatch ? "false" : "true"}
                                    aria-describedby="confirmnote"
                                    onFocus={() => setMatchFocus(true)}
                                    onBlur={() => setMatchFocus(false)}
                                />
                                <p id="confirmnote" className={matchFocus && !validMatch ? "instructions" : "offscreen"}>
                                    <FontAwesomeIcon icon={faInfoCircle} />
                                    Must match the first password input field.
                                </p>
                            </div>

                            <div className="text-center">
                                <button className="btn btn-primary text-dark" disabled={!validName || !validEmail || !validPassword || !validMatch}>Sign Up</button>
                            </div>
                        </form>
                        <div className="text-center mt-3">
                            <p>
                                Already registered?<br />
                                <a href="/login" className="btn btn-outline-primary mt-2">Sign In</a>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
        < Footer />
        </>
    );
};

export default SignUp;
