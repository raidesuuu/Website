import {
  getAuth,
  getMultiFactorResolver,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

const auth = getAuth();

const verificationCode = document.getElementById("verify_code");
let tfa_verificationId = "";
let tfa_resolver = "";
const tfa_submit = document.getElementById("verify_submit");
const verificationGet = document.getElementById("verify_get");
onAuthStateChanged(auth, (user) => {
  const recaptchaVerifier = new RecaptchaVerifier(
    "verify_get",
    {
        size: "invisible",
        callback: function(response) {
            verificationGet.setAttribute("disabled", true);
        }
    },
    auth
  );

  verificationGet.addEventListener("click", () => {
    signInWithEmailAndPassword(
      auth,
      window.sessionStorage.getItem("email"),
      window.sessionStorage.getItem("password")
    ).catch(function (error) {
      if (error.code == "auth/multi-factor-auth-required") {
        const resolver = getMultiFactorResolver(auth, error);
        // Ask user which second factor to use.
        if (
          resolver.hints[0].factorId === PhoneMultiFactorGenerator.FACTOR_ID
        ) {
          const phoneInfoOptions = {
            multiFactorHint: resolver.hints[0],
            session: resolver.session,
          };
          const phoneAuthProvider = new PhoneAuthProvider(auth);
          // Send SMS verification code
          return phoneAuthProvider
            .verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier)
            .then(function (verificationId) {
              tfa_verificationId = verificationId;
              tfa_resolver = resolver;
              verificationGet.setAttribute("disabled", true)
              tfa_submit.removeAttribute("disabled")
            });
        } else if (
          resolver.hints[selectedIndex].factorId ===
          TotpMultiFactorGenerator.FACTOR_ID
        ) {
          // Handle TOTP MFA.
          // ...
        } else {
          // Unsupported second factor.
        }
      } else if (error.code == "auth/wrong-password") {
        window.location.href = "/auth/index.html";
      }
    });
  });

  tfa_submit.addEventListener("click", () => {
    // Ask user for the SMS verification code. Then:
    const cred = PhoneAuthProvider.credential(tfa_verificationId, verificationCode.value);
    const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
    // Complete sign-in.
    tfa_resolver.resolveSignIn(multiFactorAssertion).then((userCredentials) => {
        document.querySelector("article").style.display = "";
        window.sessionStorage.clear();
        window.localStorage.setItem("tfa_enabled", true)
        window.location.href = "/auth/panel.html"
    });
  });
});