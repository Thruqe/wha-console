(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`/api`,t=localStorage.getItem(`access_token`);function n(e){t=e,e?localStorage.setItem(`access_token`,e):localStorage.removeItem(`access_token`)}function r(){return t}async function i(n,r={}){let i={"Content-Type":`application/json`,...r.headers};t&&(i.Authorization=`Bearer ${t}`);let a=await fetch(`${e}${n}`,{...r,headers:i,credentials:`include`}),o=await a.json().catch(()=>({}));if(!a.ok)throw Error(o.error||`Request failed: ${a.status}`);return o}var a={signup:(e,t,n)=>i(`/auth/signup`,{method:`POST`,body:JSON.stringify({email:e,username:t,password:n})}),login:(e,t)=>i(`/auth/login`,{method:`POST`,body:JSON.stringify({email:e,password:t})}),logout:()=>i(`/auth/logout`,{method:`POST`}),listProcesses:()=>i(`/processes`)};function o(e){let t=e.replace(/-/g,`+`).replace(/_/g,`/`).padEnd(e.length+(4-e.length%4)%4,`=`),n=atob(t),r=new Uint8Array(n.length);for(let e=0;e<n.length;e++)r[e]=n.charCodeAt(e);return r.buffer}function s(e){let t=new Uint8Array(e),n=``;return t.forEach(e=>n+=String.fromCharCode(e)),btoa(n).replace(/\+/g,`-`).replace(/\//g,`_`).replace(/=+$/,``)}async function c(){let e=await fetch(`/api/webauthn/register/begin`,{method:`POST`,credentials:`include`,headers:{Authorization:`Bearer ${localStorage.getItem(`access_token`)}`}});if(!e.ok)throw Error(`Could not start passkey registration`);let t=await e.json(),n={...t.publicKey,challenge:o(t.publicKey.challenge),user:{...t.publicKey.user,id:o(t.publicKey.user.id)},excludeCredentials:t.publicKey.excludeCredentials?.map(e=>({...e,id:o(e.id)}))},r=await navigator.credentials.create({publicKey:n});if(!r)throw Error(`Passkey creation was cancelled`);let i=r.response;if(!(await fetch(`/api/webauthn/register/finish`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${localStorage.getItem(`access_token`)}`},credentials:`include`,body:JSON.stringify({id:r.id,rawId:s(r.rawId),type:r.type,response:{attestationObject:s(i.attestationObject),clientDataJSON:s(i.clientDataJSON)}})})).ok)throw Error(`Failed to save passkey`)}var l={xmlns:`http://www.w3.org/2000/svg`,width:24,height:24,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,"stroke-width":2,"stroke-linecap":`round`,"stroke-linejoin":`round`},u=([e,t,n])=>{let r=document.createElementNS(`http://www.w3.org/2000/svg`,e);return Object.keys(t).forEach(e=>{r.setAttribute(e,String(t[e]))}),n?.length&&n.forEach(e=>{let t=u(e);r.appendChild(t)}),r},d=(e,t={})=>u([`svg`,{...l,...t},e]),f=[[`path`,{d:`M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49`}],[`path`,{d:`M14.084 14.158a3 3 0 0 1-4.242-4.242`}],[`path`,{d:`M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143`}],[`path`,{d:`m2 2 20 20`}]],p=[[`path`,{d:`M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0`}],[`circle`,{cx:`12`,cy:`12`,r:`3`}]],m=[[`path`,{d:`M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4`}],[`path`,{d:`M14 13.12c0 2.38 0 6.38-1 8.88`}],[`path`,{d:`M17.29 21.02c.12-.6.43-2.3.5-3.02`}],[`path`,{d:`M2 12a10 10 0 0 1 18-6`}],[`path`,{d:`M2 16h.01`}],[`path`,{d:`M21.8 16c.2-2 .131-5.354 0-6`}],[`path`,{d:`M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2`}],[`path`,{d:`M8.65 22c.21-.66.45-1.32.57-2`}],[`path`,{d:`M9 6.8a6 6 0 0 1 9 5.2v2`}]],h=[[`rect`,{width:`18`,height:`11`,x:`3`,y:`11`,rx:`2`,ry:`2`}],[`path`,{d:`M7 11V7a5 5 0 0 1 10 0v4`}]],g=[[`path`,{d:`m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7`}],[`rect`,{x:`2`,y:`4`,width:`20`,height:`16`,rx:`2`}]],_=[[`path`,{d:`M12 19h8`}],[`path`,{d:`m4 17 6-6-6-6`}]];function v(e,t={}){let n=d(e);return n.setAttribute(`width`,String(t.size??20)),n.setAttribute(`height`,String(t.size??20)),t.class&&n.setAttribute(`class`,t.class),n.outerHTML}function y(){let e=document.getElementById(`app`);e.innerHTML=`
    <div class="auth-wrapper">
      <div class="auth-content">
        <div class="auth-logo">${v(m,{size:22})} wha-console</div>
        <h1>Add a <span class="gradient">passkey</span></h1>
        <p class="auth-subtitle">Sign in faster next time, no password needed.</p>
        <button type="button" class="primary" id="add-passkey">Add passkey</button>
        <button type="button" class="secondary" id="skip-passkey" style="margin-top: 12px;">Skip for now</button>
        <p id="passkey-error" class="error"></p>
      </div>
    </div>
  `,document.getElementById(`add-passkey`).addEventListener(`click`,async()=>{let e=document.getElementById(`passkey-error`);e.textContent=``;try{await c(),S(`/dashboard`)}catch(t){e.textContent=t.message}}),document.getElementById(`skip-passkey`).addEventListener(`click`,()=>{S(`/dashboard`)})}var b={};function x(e,t){b[e]=t}x(`/passkey-prompt`,y);function S(e){window.location.hash=e}function C(){let e=window.location.hash.slice(1)||`/login`,t=b[e]||b[`/login`];if(!t)throw Error(`No route handler found for path: ${e} and fallback '/login' is unregistered.`);t()}function w(){window.addEventListener(`hashchange`,C),C()}function T(){let e=document.getElementById(`app`),t=`login`,r=!1;function i(){e.innerHTML=`
      <div class="auth-wrapper">
        <div class="auth-content">
          <div class="auth-logo">${v(_,{size:22})} wha-console</div>
          <h1>${t===`login`?`Welcome <span class="gradient">back</span>`:`Manage your <span class="gradient">processes</span>`}</h1>
          <p class="auth-subtitle">
            ${t===`login`?`Sign in to your console`:`Create an account to get started`}
          </p>

          <button type="button" id="passkey-btn" class="secondary">
            ${v(m,{size:18})} Sign in with a passkey
          </button>

          <div class="divider">or</div>

          <form id="auth-form">
            ${t===`signup`?`<div class="field">
                     <label for="username">Username</label>
                     <input type="text" id="username" placeholder="yourname" required />
                   </div>`:``}
            <div class="field">
              <label for="email">Email</label>
              <span class="icon-left">${v(g,{size:16})}</span>
              <input type="email" id="email" class="has-icon" placeholder="your@email.com" required />
            </div>
            <div class="field">
              <label for="password">Password</label>
              <span class="icon-left">${v(h,{size:16})}</span>
              <input type="${r?`text`:`password`}" id="password" class="has-icon" placeholder="••••••••" required />
              <button type="button" class="icon-toggle" id="toggle-password">
                ${v(r?f:p,{size:16})}
              </button>
            </div>
            <button type="submit" class="primary">${t===`login`?`Sign in`:`Sign up`}</button>
            <p id="auth-error" class="error"></p>
          </form>
          <p class="auth-footer">
            ${t===`login`?`Need an account?`:`Already have an account?`}
            <a href="#" id="toggle-mode" class="link">${t===`login`?`Sign up`:`Sign in`}</a>
          </p>
        </div>
      </div>
    `,document.getElementById(`toggle-mode`).addEventListener(`click`,e=>{e.preventDefault(),t=t===`login`?`signup`:`login`,r=!1,i()}),document.getElementById(`toggle-password`).addEventListener(`click`,()=>{r=!r,i()}),document.getElementById(`passkey-btn`).addEventListener(`click`,async()=>{let e=document.getElementById(`auth-error`);e.textContent=``;let t=prompt(`Enter your username to sign in with a passkey:`);if(t)try{await E(t),S(`/dashboard`)}catch(t){e.textContent=t.message}}),document.getElementById(`auth-form`).addEventListener(`submit`,async e=>{e.preventDefault();let r=document.getElementById(`auth-error`);r.textContent=``;let i=document.getElementById(`email`).value,o=document.getElementById(`password`).value;try{let e;if(t===`signup`){let t=document.getElementById(`username`).value;e=await a.signup(i,t,o),n(e.access_token),S(`/passkey-prompt`);return}e=await a.login(i,o),n(e.access_token),S(`/dashboard`),n(e.access_token),S(`/dashboard`)}catch(e){r.textContent=e.message}})}i()}async function E(e){let t=await fetch(`/api/webauthn/login/begin`,{method:`POST`,headers:{"Content-Type":`application/json`},credentials:`include`,body:JSON.stringify({username:e})});if(!t.ok)throw Error(`No passkey found for this user`);let r=k((await t.json()).publicKey),i=await navigator.credentials.get({publicKey:r}),a=await fetch(`/api/webauthn/login/finish`,{method:`POST`,headers:{"Content-Type":`application/json`},credentials:`include`,body:JSON.stringify(A(i))});if(!a.ok)throw Error(`Passkey authentication failed`);n((await a.json()).access_token)}function D(e){let t=e.replace(/-/g,`+`).replace(/_/g,`/`).padEnd(e.length+(4-e.length%4)%4,`=`),n=atob(t),r=new Uint8Array(n.length);for(let e=0;e<n.length;e++)r[e]=n.charCodeAt(e);return r.buffer}function O(e){let t=new Uint8Array(e),n=``;return t.forEach(e=>n+=String.fromCharCode(e)),btoa(n).replace(/\+/g,`-`).replace(/\//g,`_`).replace(/=+$/,``)}function k(e){return{...e,challenge:D(e.challenge),allowCredentials:e.allowCredentials?.map(e=>({...e,id:D(e.id)}))}}function A(e){let t=e.response;return{id:e.id,rawId:O(e.rawId),type:e.type,response:{authenticatorData:O(t.authenticatorData),clientDataJSON:O(t.clientDataJSON),signature:O(t.signature),userHandle:t.userHandle?O(t.userHandle):null}}}function j(){if(!r()){S(`/login`);return}let e=document.getElementById(`app`);e.innerHTML=`<h1>Dashboard</h1><p>Logged in. Processes go here.</p>`}x(`/login`,T),x(`/dashboard`,j),w();