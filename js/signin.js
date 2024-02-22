import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";

var signin = document.getElementById("signin");
var errormessage = document.getElementById("errorMessage");

var email = document.getElementById("email");
var password = document.getElementById("password");

const firebaseConfig = {
  apiKey: "AIzaSyDD_ASZ-ShngYPtumrVKM3YH67rEI6bbRc",
  authDomain: "auth.uplauncher.xyz",
  projectId: "e-mediator-401323",
  storageBucket: "e-mediator-401323.appspot.com",
  messagingSenderId: "237760903684",
};

var app = initializeApp(firebaseConfig);

const auth = getAuth(app);
onAuthStateChanged(auth, (user) => {
  if (user !== null) {
    location.href = "/auth/panel.html";
  }
});

window.onloadTurnstileCallback = function () {
  turnstile.render("#turnstile", {
    sitekey: "0x4AAAAAAACYWAGYl5B5l4E9",
    callback: function (token) {
      signin.removeAttribute("disabled");
    },
  });
};

turnstile.ready(onloadTurnstileCallback);

signin.onclick = () => {
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then((userCredential) => {
      window.localStorage.remove("tfa_enabled")
      window.location.href = "/auth/panel.html";
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorContent = error.message;

      if (errorCode == "auth/user-not-found") {
        errormessage.textContent = "ユーザーが見つかりませんでした。";
      } else if (errorCode == "auth/wrong-password") {
        errormessage.textContent = "パスワードが間違っています。";
      } else if (errorCode == "auth/multi-factor-auth-required") {
        window.sessionStorage.setItem("email", email.value);
        window.sessionStorage.setItem("password", password.value);
        window.location.href = "/auth/tfa-auth.html"
      } else {
        console.log(errorCode)
        errormessage.textContent = `エラー: ${errorContent}`;
      }
    });
};
