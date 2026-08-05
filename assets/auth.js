import {
  AuthError,
  MissingIdentityError,
  getSettings,
  getUser,
  handleAuthCallback,
  login,
  logout,
  oauthLogin,
  requestPasswordRecovery,
  signup,
  updateUser,
} from "./vendor/netlify-identity.js";
import { configureMemberTools } from "./member-tools.js";

if (!document.querySelector('link[rel="icon"]')) {
  const icon = document.createElement("link");
  icon.rel = "icon";
  icon.type = "image/svg+xml";
  icon.href = "/favicon.svg";
  document.head.append(icon);
}

if (!document.querySelector('link[rel="manifest"]')) {
  const manifest = document.createElement("link");
  manifest.rel = "manifest";
  manifest.href = "/site.webmanifest";
  document.head.append(manifest);
}

const accountPath = "/account/";
const body = document.body;
const isAccountPage = body?.classList.contains("auth-page");

// Netlify Identity sends the OAuth round-trip back to the site root, not to the page
// that started it. These keys carry the intended destination and any provider error
// across that redirect so the user does not silently land on the homepage.
const OAUTH_RETURN_KEY = "lsio:oauth-return";
const OAUTH_ERROR_KEY = "lsio:oauth-error";

const readStash = (key) => {
  try {
    const value = window.sessionStorage.getItem(key);
    window.sessionStorage.removeItem(key);
    return value;
  } catch {
    return null;
  }
};

const writeStash = (key, value) => {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    /* private browsing — the flow still works, just without the hand-off */
  }
};

const isSafePath = (value) => Boolean(value) && value.startsWith("/") && !value.startsWith("//");

const safeNextPath = () => {
  const next = new URLSearchParams(window.location.search).get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith(accountPath)) {
    return "/free-tools/";
  }
  return next;
};

const accountUrl = (mode = "login") => {
  const url = new URL(accountPath, window.location.origin);
  url.searchParams.set("mode", mode);
  if (!isAccountPage) url.searchParams.set("next", `${window.location.pathname}${window.location.search}`);
  return `${url.pathname}${url.search}`;
};

const showNotice = (message) => {
  const notice = document.createElement("div");
  notice.className = "auth-notice";
  notice.setAttribute("role", "status");
  notice.textContent = message;
  document.body.append(notice);
  window.setTimeout(() => notice.remove(), 6500);
};

const errorMessage = (error) => {
  if (error instanceof MissingIdentityError) return "Account access is not available yet. Please try again shortly.";
  if (!(error instanceof AuthError)) return "Something went wrong. Please try again.";
  if (error.status === 401) return "That email or password does not match.";
  if (error.status === 403) return "Registrations are currently closed.";
  if (error.status === 422) return "Please check the details and try again. Passwords must be at least six characters.";
  return error.message || "Something went wrong. Please try again.";
};

// A failed or cancelled provider login comes back as #error=...&error_description=...
// with no access_token, which the callback handler ignores. Read it ourselves so the
// user gets told what happened instead of quietly appearing logged out.
const readProviderFailure = () => {
  const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
  const hashParams = new URLSearchParams(hash);
  const search = new URLSearchParams(window.location.search);
  // The hash is where Identity puts provider errors. Only trust the query string when
  // it carries a description too, so ordinary ?error= links are not mistaken for one.
  const source = hashParams.get("error")
    ? hashParams
    : search.get("error") && search.get("error_description")
      ? search
      : null;
  if (!source) return null;
  return {
    code: source.get("error") || "",
    description: (source.get("error_description") || "").replace(/\+/g, " ").trim(),
  };
};

const providerFailureMessage = ({ code, description }) => {
  // The same #error= shape covers expired confirmation, invite and recovery links, so
  // only reach for the Google wording when it is actually a provider problem.
  if (/confirmation|invite|recovery|token/i.test(description)) {
    return description
      ? `That link did not work: ${description}`
      : "That link has expired. Please request a new one.";
  }
  if (code === "access_denied") return "Google login was cancelled. Try again, or use your email and password.";
  if (/provider is not enabled|not enabled|unsupported provider/i.test(description)) {
    return "Google login is not switched on for this site yet. Please use your email and password.";
  }
  return description
    ? `Google login did not work: ${description}`
    : "Google login did not work. Try again, or use your email and password.";
};

const clearAuthHash = () => {
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
};

const addAccountControls = (user) => {
  if (isAccountPage) return;

  const controls = document.createElement("div");
  controls.className = "auth-controls";

  if (user) {
    const account = document.createElement("a");
    account.className = "auth-user";
    account.href = accountPath;
    account.textContent = user.name || user.email || "My account";

    const logoutButton = document.createElement("button");
    logoutButton.type = "button";
    logoutButton.textContent = "Log out";
    logoutButton.addEventListener("click", async () => {
      logoutButton.disabled = true;
      try {
        await logout();
        window.location.assign("/");
      } catch (error) {
        logoutButton.disabled = false;
        showNotice(errorMessage(error));
      }
    });
    controls.append(account, logoutButton);
  } else {
    const loginLink = document.createElement("a");
    loginLink.href = accountUrl("login");
    loginLink.textContent = "Log in";

    const registerLink = document.createElement("a");
    registerLink.className = "auth-register";
    registerLink.href = accountUrl("register");
    registerLink.textContent = "Register";
    controls.append(loginLink, registerLink);
  }

  const target = document.querySelector("header nav, nav.site-nav, nav.nav, .jj-tool-nav__links");
  if (target) {
    target.append(controls);
  } else if (document.querySelector(".app-header")) {
    return;
  } else {
    controls.classList.add("auth-floating");
    document.body.append(controls);
  }
};

const setMessage = (message, state = "") => {
  const output = document.querySelector("[data-auth-message]");
  if (!output) return;
  output.textContent = message;
  output.dataset.state = state;
};

const setBusy = (form, busy) => {
  form.querySelectorAll("button, input, select").forEach((control) => {
    control.disabled = busy;
  });
};

const selectPanel = (name) => {
  document.querySelectorAll("[data-auth-tab]").forEach((tab) => {
    const selected = tab.dataset.authTab === name;
    tab.setAttribute("aria-selected", String(selected));
  });
  document.querySelectorAll("[data-auth-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.authPanel !== name;
  });
  setMessage("");
};

const setupAccountPage = (user, callback) => {
  const signedOutView = document.querySelector("[data-signed-out]");
  const signedInView = document.querySelector("[data-signed-in]");

  if (callback?.type === "recovery") {
    body.classList.remove("account-signed-in");
    signedOutView.hidden = false;
    signedInView.hidden = true;
    selectPanel("reset");
  } else if (user) {
    body.classList.add("account-signed-in");
    signedOutView.hidden = true;
    signedInView.hidden = false;
    document.querySelector("[data-account-email]").textContent = user.email || "Signed in";
    const profileForm = document.querySelector("[data-profile-form]");
    if (profileForm) {
      profileForm.querySelector("#profile-business").value = user.userMetadata?.business_name || "";
      profileForm.querySelector("#profile-industry").value = user.userMetadata?.industry || "";
    }
  } else {
    body.classList.remove("account-signed-in");
    signedOutView.hidden = false;
    signedInView.hidden = true;
    const requestedMode = new URLSearchParams(window.location.search).get("mode");
    selectPanel(requestedMode === "register" ? "register" : "login");
  }

  document.querySelectorAll("[data-auth-tab]").forEach((tab) => {
    tab.addEventListener("click", () => selectPanel(tab.dataset.authTab));
  });

  document.querySelector("[data-show-recovery]")?.addEventListener("click", () => selectPanel("recovery"));
  document.querySelectorAll("[data-show-login]").forEach((button) => {
    button.addEventListener("click", () => selectPanel("login"));
  });

  document.querySelector("[data-login-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(form, true);
    setMessage("Signing you in…");
    try {
      await login(String(data.get("email")), String(data.get("password")));
      window.location.assign(safeNextPath());
    } catch (error) {
      setBusy(form, false);
      setMessage(errorMessage(error), "error");
    }
  });

  document.querySelector("[data-register-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const password = String(data.get("password"));
    if (password !== String(data.get("confirm-password"))) {
      setMessage("The passwords do not match.", "error");
      return;
    }
    setBusy(form, true);
    setMessage("Creating your account…");
    try {
      const newUser = await signup(String(data.get("email")), password, {
        full_name: String(data.get("name")),
        business_name: String(data.get("business-name") || ""),
        industry: String(data.get("industry") || ""),
      });
      if (newUser.confirmedAt) {
        window.location.assign(safeNextPath());
      } else {
        setMessage("Account created. Check your email to confirm it, then log in.", "success");
        form.reset();
        setBusy(form, false);
      }
    } catch (error) {
      setBusy(form, false);
      setMessage(errorMessage(error), "error");
    }
  });

  document.querySelector("[data-recovery-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(form, true);
    setMessage("Sending the reset link…");
    try {
      await requestPasswordRecovery(String(data.get("email")));
      setMessage("Check your email for a password reset link.", "success");
      form.reset();
    } catch (error) {
      setMessage(errorMessage(error), "error");
    } finally {
      setBusy(form, false);
    }
  });

  document.querySelector("[data-reset-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const password = String(data.get("password"));
    if (password !== String(data.get("confirm-password"))) {
      setMessage("The passwords do not match.", "error");
      return;
    }
    setBusy(form, true);
    setMessage("Updating your password…");
    try {
      await updateUser({ password });
      setMessage("Password updated. Taking you back to your tools…", "success");
      window.setTimeout(() => window.location.assign(safeNextPath()), 900);
    } catch (error) {
      setBusy(form, false);
      setMessage(errorMessage(error), "error");
    }
  });

  document.querySelector("[data-profile-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(form, true);
    try {
      await updateUser({
        data: {
          business_name: String(data.get("business-name") || ""),
          industry: String(data.get("industry") || ""),
        },
      });
      showNotice("Profile saved.");
    } catch (error) {
      showNotice(errorMessage(error));
    } finally {
      setBusy(form, false);
    }
  });

  document.querySelector("[data-account-continue]")?.addEventListener("click", () => {
    window.location.assign(safeNextPath());
  });

  document.querySelector("[data-account-logout]")?.addEventListener("click", async (event) => {
    event.currentTarget.disabled = true;
    try {
      await logout();
      window.location.assign("/");
    } catch (error) {
      event.currentTarget.disabled = false;
      setMessage(errorMessage(error), "error");
    }
  });
};

const setupGoogleLogin = async () => {
  const buttons = document.querySelectorAll("[data-google-login]");
  if (!buttons.length) return;

  let settings;
  try {
    settings = await getSettings();
  } catch (error) {
    buttons.forEach((button) => {
      button.hidden = true;
    });
    console.warn("Identity settings unavailable, hiding Google login.", error);
    return;
  }

  buttons.forEach((button) => {
    button.hidden = !settings.providers.google;
    button.addEventListener("click", () => {
      button.disabled = true;
      setMessage("Opening Google securely…");
      // Remember where to land once Google sends the browser back to the site root.
      writeStash(OAUTH_RETURN_KEY, safeNextPath());
      let redirecting = false;
      try {
        oauthLogin("google");
        redirecting = true;
      } catch (error) {
        // oauthLogin navigates away and then throws a sentinel; a genuine failure
        // means the redirect never started.
        redirecting = String(error?.message || "").includes("Redirecting to OAuth provider");
        if (!redirecting) {
          readStash(OAUTH_RETURN_KEY);
          button.disabled = false;
          setMessage(errorMessage(error), "error");
        }
      }
    });
  });
};

const initialiseAuth = async () => {
  const providerFailure = readProviderFailure();
  let callback = null;

  if (providerFailure) {
    // Clear the error out of the URL, then get it in front of the user. Only hand them
    // back to the login form when this tab actually started a provider login, so an
    // unrelated ?error= on some other page cannot bounce someone off it.
    clearAuthHash();
    const startedHere = Boolean(readStash(OAUTH_RETURN_KEY));
    const message = providerFailureMessage(providerFailure);
    if (isAccountPage) {
      writeStash(OAUTH_ERROR_KEY, message);
    } else if (startedHere) {
      writeStash(OAUTH_ERROR_KEY, message);
      window.location.assign(`${accountPath}?mode=login`);
      return;
    } else {
      showNotice(message);
    }
  } else {
    try {
      callback = await handleAuthCallback();
    } catch (error) {
      if (isAccountPage) setMessage(errorMessage(error), "error");
      else showNotice(errorMessage(error));
    }
  }

  const user = callback?.user || (await getUser());

  document.documentElement.classList.remove("auth-pending");
  document.documentElement.classList.add("auth-ready");
  configureMemberTools(user);

  // A completed Google login lands on the site root. Send the user on to wherever
  // they were headed when they started, instead of stranding them on the homepage.
  if (callback?.type === "oauth" && user) {
    const target = readStash(OAUTH_RETURN_KEY);
    if (isSafePath(target) && target !== `${window.location.pathname}${window.location.search}`) {
      window.location.assign(target);
      return;
    }
  }

  if (isAccountPage) {
    setupAccountPage(user, callback);
    setupGoogleLogin();
    const stashedError = readStash(OAUTH_ERROR_KEY);
    if (stashedError) setMessage(stashedError, "error");
    if (callback?.type === "confirmation") setMessage("Email confirmed. Your account is ready.", "success");
    if (callback?.type === "oauth") setMessage("Google login sorted. Your dashboard is ready.", "success");
  } else {
    addAccountControls(user);
    if (callback?.type === "confirmation") showNotice("Email confirmed. You are now logged in.");
    if (callback?.type === "oauth") showNotice(`Logged in with Google as ${user?.email || "your account"}.`);
  }

  document.dispatchEvent(new CustomEvent("lsio:auth-ready", { detail: { user, callback } }));
};

initialiseAuth();
