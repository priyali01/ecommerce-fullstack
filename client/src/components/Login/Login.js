import React, { useState } from "react";
import axios from "axios";
import "./Login.scss";
import { getBaseURL } from "../apiConfig";
// I've removed TokenRefresher to simplify. 
// Your model sends a refreshToken, so we'll save it.

function Login(props) {
  let [uname, setUname] = useState("");
  let [password, setPass] = useState("");
  let [error, setError] = useState("");

  // Adding click handler
  function handleClick() {
    if (validateInputs()) {
      const userCredentials = {
        email: uname,
        password: password,
      };
      
      let url = `${getBaseURL()}api/users/login`;
      
      axios
        .post(url, userCredentials)
        .then((res) => {
          console.log("Server Response:", res.data); // Helpful for debugging

          // ===== THE FIX: Check for res.data.user and res.data.user.token =====
          if (res.data.user && res.data.user.token) {
            console.log("Logged in successfully");

            // Get data directly from the user object
            const user = res.data.user;
            const token = user.token;
            const refreshToken = user.refreshToken;
            const isAdmin = user.type === 'admin'; // Check 'type' property
            const customerId = user.id; // Check 'id' property

            // Set session storage
            sessionStorage.setItem("isUserAuthenticated", true);
            sessionStorage.setItem("jwt_token", token);
            sessionStorage.setItem("jwt_refresh_token", refreshToken);
            sessionStorage.setItem("user", JSON.stringify(user)); // Store the whole user
            sessionStorage.setItem("isAdmin", isAdmin);
            sessionStorage.setItem("customerId", customerId);

            // Tell the parent component (App.js) that we are logged in
            props.setUserAuthenticatedStatus(isAdmin, customerId);

          } else {
            // This will now catch login failures
            console.log("User not available or login failed");
            setError(res.data.message || "Invalid email or password");
          }
        })
        .catch((err) => {
          console.error("Login Error:", err);
          // Get the error message from the backend's response
          const message = err.response?.data?.message || "Error logging in.";
          setError(message);
        });
    }
  }

  // Function to validate email format
  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // Function to validate password length
  function validatePassword(password) {
    // Your old model had a 6-char limit, so we'll keep that.
    return password.length >= 6;
  }

  // Function to validate inputs
  function validateInputs() {
    if (!validateEmail(uname)) {
      setError("Please provide a valid email address.");
      return false;
    } else if (!validatePassword(password)) {
      setError("Password must be at least 6 characters long.");
      return false;
    }
    setError("");
    return true;
  }

  // Function to handle changes in email input
  function changeName(event) {
    setUname(event.target.value);
  }

  // Function to handle changes in password input
  function changePass(event) {
    setPass(event.target.value);
  }

  return (
    <>
      <div className="login-container">
        <h1>Login</h1>
        <div>
          <label>E-Mail</label>
          <input type="text" value={uname} onChange={changeName}></input>
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={changePass}
          ></input>
        </div>
        {error && <div className="error-message">{error}</div>}
        <button onClick={handleClick}>Login</button>
        <div className="register-link" onClick={() => props.navigateToRegisterPage()}>
          Is New User
        </div>
      </div>
    </>
  );
}

export default Login;