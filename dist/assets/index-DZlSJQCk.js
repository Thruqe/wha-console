(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function e(e){try{let t=e.split(`.`)[1],n=t.replace(/-/g,`+`).replace(/_/g,`/`).padEnd(t.length+(4-t.length%4)%4,`=`),r=JSON.parse(atob(n));return typeof r.exp==`number`?r.exp*1e3:null}catch{return null}}var t=`/api`,n=localStorage.getItem(`access_token`),r=n?e(n):null,i=0,a=3e5;function o(t){n=t,t?(localStorage.setItem(`access_token`,t),r=e(t)):(r=null,localStorage.removeItem(`access_token`))}function s(){return!!n&&!!r&&Date.now()<r}async function c(e,r={}){let i={"Content-Type":`application/json`,...r.headers};n&&(i.Authorization=`Bearer ${n}`);let a=await fetch(`${t}${e}`,{...r,headers:i,credentials:`include`}),o=await a.json().catch(()=>({}));if(!a.ok)throw Error(o.error||`Request failed: ${a.status}`);return o}async function l(){try{let e=await fetch(`${t}/auth/refresh`,{method:`POST`,credentials:`include`});return e.ok?(o((await e.json()).access_token),!0):!1}catch{return!1}}async function u(){if(!(Date.now()-i>a)&&s())return!0;if(n)try{return await c(`/auth/me`),i=Date.now(),!0}catch{}return l()}async function d(){try{await c(`/auth/logout`,{method:`POST`})}finally{o(null),i=0}}var f={signup:(e,t,n)=>c(`/auth/signup`,{method:`POST`,body:JSON.stringify({email:e,username:t,password:n})}),login:(e,t)=>c(`/auth/login`,{method:`POST`,body:JSON.stringify({email:e,password:t})}),logout:()=>c(`/auth/logout`,{method:`POST`}),listProcesses:()=>c(`/processes`)};function p(e){let t=e.replace(/-/g,`+`).replace(/_/g,`/`).padEnd(e.length+(4-e.length%4)%4,`=`),n=atob(t),r=new Uint8Array(n.length);for(let e=0;e<n.length;e++)r[e]=n.charCodeAt(e);return r.buffer}function m(e){let t=new Uint8Array(e),n=``;return t.forEach(e=>n+=String.fromCharCode(e)),btoa(n).replace(/\+/g,`-`).replace(/\//g,`_`).replace(/=+$/,``)}async function h(){let e=await fetch(`/api/webauthn/register/begin`,{method:`POST`,credentials:`include`,headers:{Authorization:`Bearer ${localStorage.getItem(`access_token`)}`}});if(!e.ok)throw Error(`Could not start passkey registration`);let t=await e.json(),n={...t.publicKey,challenge:p(t.publicKey.challenge),user:{...t.publicKey.user,id:p(t.publicKey.user.id)},excludeCredentials:t.publicKey.excludeCredentials?.map(e=>({...e,id:p(e.id)}))},r=await navigator.credentials.create({publicKey:n});if(!r)throw Error(`Passkey creation was cancelled`);let i=r.response;if(!(await fetch(`/api/webauthn/register/finish`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${localStorage.getItem(`access_token`)}`},credentials:`include`,body:JSON.stringify({id:r.id,rawId:m(r.rawId),type:r.type,response:{attestationObject:m(i.attestationObject),clientDataJSON:m(i.clientDataJSON)}})})).ok)throw Error(`Failed to save passkey`)}var g={xmlns:`http://www.w3.org/2000/svg`,width:24,height:24,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,"stroke-width":2,"stroke-linecap":`round`,"stroke-linejoin":`round`},_=([e,t,n])=>{let r=document.createElementNS(`http://www.w3.org/2000/svg`,e);return Object.keys(t).forEach(e=>{r.setAttribute(e,String(t[e]))}),n?.length&&n.forEach(e=>{let t=_(e);r.appendChild(t)}),r},v=(e,t={})=>_([`svg`,{...g,...t},e]),y=[[`path`,{d:`m12 19-7-7 7-7`}],[`path`,{d:`M19 12H5`}]],b=[[`path`,{d:`M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49`}],[`path`,{d:`M14.084 14.158a3 3 0 0 1-4.242-4.242`}],[`path`,{d:`M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143`}],[`path`,{d:`m2 2 20 20`}]],x=[[`path`,{d:`M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0`}],[`circle`,{cx:`12`,cy:`12`,r:`3`}]],S=[[`path`,{d:`M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4`}],[`path`,{d:`M14 13.12c0 2.38 0 6.38-1 8.88`}],[`path`,{d:`M17.29 21.02c.12-.6.43-2.3.5-3.02`}],[`path`,{d:`M2 12a10 10 0 0 1 18-6`}],[`path`,{d:`M2 16h.01`}],[`path`,{d:`M21.8 16c.2-2 .131-5.354 0-6`}],[`path`,{d:`M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2`}],[`path`,{d:`M8.65 22c.21-.66.45-1.32.57-2`}],[`path`,{d:`M9 6.8a6 6 0 0 1 9 5.2v2`}]],C=[[`rect`,{width:`18`,height:`11`,x:`3`,y:`11`,rx:`2`,ry:`2`}],[`path`,{d:`M7 11V7a5 5 0 0 1 10 0v4`}]],w=[[`path`,{d:`m16 17 5-5-5-5`}],[`path`,{d:`M21 12H9`}],[`path`,{d:`M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4`}]],T=[[`path`,{d:`m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7`}],[`rect`,{x:`2`,y:`4`,width:`20`,height:`16`,rx:`2`}]],E=[[`path`,{d:`M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z`}]],D=[[`path`,{d:`M5 12h14`}],[`path`,{d:`M12 5v14`}]],O=[[`rect`,{width:`20`,height:`8`,x:`2`,y:`2`,rx:`2`,ry:`2`}],[`rect`,{width:`20`,height:`8`,x:`2`,y:`14`,rx:`2`,ry:`2`}],[`line`,{x1:`6`,x2:`6.01`,y1:`6`,y2:`6`}],[`line`,{x1:`6`,x2:`6.01`,y1:`18`,y2:`18`}]],k=[[`rect`,{width:`18`,height:`18`,x:`3`,y:`3`,rx:`2`}]],A=[[`path`,{d:`M12 19h8`}],[`path`,{d:`m4 17 6-6-6-6`}]],j=[[`path`,{d:`M10 11v6`}],[`path`,{d:`M14 11v6`}],[`path`,{d:`M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6`}],[`path`,{d:`M3 6h18`}],[`path`,{d:`M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2`}]],M=[[`path`,{d:`m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3`}],[`path`,{d:`M12 9v4`}],[`path`,{d:`M12 17h.01`}]];function N(e,t={}){let n=v(e);return n.setAttribute(`width`,String(t.size??20)),n.setAttribute(`height`,String(t.size??20)),t.class&&n.setAttribute(`class`,t.class),n.outerHTML}function P(){let e=document.getElementById(`app`);e.innerHTML=`
    <div class="auth-wrapper">
      <div class="auth-content">
        <div class="auth-logo">${N(S,{size:22})} wha-console</div>
        <h1>Add a <span class="gradient">passkey</span></h1>
        <p class="auth-subtitle">Sign in faster next time, no password needed.</p>
        <button type="button" class="primary" id="add-passkey">Add passkey</button>
        <button type="button" class="secondary" id="skip-passkey" style="margin-top: 12px;">Skip for now</button>
        <p id="passkey-error" class="error"></p>
      </div>
    </div>
  `,document.getElementById(`add-passkey`).addEventListener(`click`,async()=>{let e=document.getElementById(`passkey-error`);e.textContent=``;try{await h(),L(`/dashboard`)}catch(t){e.textContent=t.message}}),document.getElementById(`skip-passkey`).addEventListener(`click`,()=>{L(`/dashboard`)})}var F={};function I(e,t){F[e]=t}I(`/passkey-prompt`,P);function L(e){window.location.hash=e}function R(){let e=window.location.hash.slice(1)||`/login`,t=F[e]||F[`/404`];if(!t)throw Error(`No route handler found for path: ${e} and fallback '/login' is unregistered.`);t()}function z(){window.addEventListener(`hashchange`,R),R()}function B(){let e=document.getElementById(`app`),t=`login`,n=!1;function r(){e.innerHTML=`
      <div class="auth-wrapper">
        <div class="auth-content">
          <div class="auth-logo">${N(A,{size:22})} wha-console</div>
          <h1>${t===`login`?`Welcome <span class="gradient">back</span>`:`Manage your <span class="gradient">processes</span>`}</h1>
          <p class="auth-subtitle">
            ${t===`login`?`Sign in to your console`:`Create an account to get started`}
          </p>

          <button type="button" id="passkey-btn" class="secondary">
            ${N(S,{size:18})} Sign in with a passkey
          </button>

          <div class="divider">or</div>

          <form id="auth-form">
            ${t===`signup`?`<div class="field">
                     <label for="username">Username</label>
                     <input type="text" id="username" placeholder="yourname" required />
                   </div>`:``}
            <div class="field">
              <label for="email">Email</label>
              <span class="icon-left">${N(T,{size:16})}</span>
              <input type="email" id="email" class="has-icon" placeholder="your@email.com" required />
            </div>
            <div class="field">
              <label for="password">Password</label>
              <span class="icon-left">${N(C,{size:16})}</span>
              <input type="${n?`text`:`password`}" id="password" class="has-icon" placeholder="••••••••" required />
              <button type="button" class="icon-toggle" id="toggle-password">
                ${N(n?b:x,{size:16})}
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
    `,document.getElementById(`toggle-mode`).addEventListener(`click`,e=>{e.preventDefault(),t=t===`login`?`signup`:`login`,n=!1,r()}),document.getElementById(`toggle-password`).addEventListener(`click`,()=>{n=!n,r()}),document.getElementById(`passkey-btn`).addEventListener(`click`,async()=>{let e=document.getElementById(`auth-error`);e.textContent=``;let t=prompt(`Enter your username to sign in with a passkey:`);if(t)try{await V(t),L(`/dashboard`)}catch(t){e.textContent=t.message}}),document.getElementById(`auth-form`).addEventListener(`submit`,async e=>{e.preventDefault();let n=document.getElementById(`auth-error`);n.textContent=``;let r=document.getElementById(`email`).value,i=document.getElementById(`password`).value;try{let e;if(t===`signup`){let t=document.getElementById(`username`).value;e=await f.signup(r,t,i),o(e.access_token),L(`/passkey-prompt`);return}e=await f.login(r,i),o(e.access_token),L(`/dashboard`),o(e.access_token),L(`/dashboard`)}catch(e){n.textContent=e.message}})}r()}async function V(e){let t=await fetch(`/api/webauthn/login/begin`,{method:`POST`,headers:{"Content-Type":`application/json`},credentials:`include`,body:JSON.stringify({username:e})});if(!t.ok)throw Error(`No passkey found for this user`);let n=W((await t.json()).publicKey),r=await navigator.credentials.get({publicKey:n}),i=await fetch(`/api/webauthn/login/finish`,{method:`POST`,headers:{"Content-Type":`application/json`},credentials:`include`,body:JSON.stringify(G(r))});if(!i.ok)throw Error(`Passkey authentication failed`);o((await i.json()).access_token)}function H(e){let t=e.replace(/-/g,`+`).replace(/_/g,`/`).padEnd(e.length+(4-e.length%4)%4,`=`),n=atob(t),r=new Uint8Array(n.length);for(let e=0;e<n.length;e++)r[e]=n.charCodeAt(e);return r.buffer}function U(e){let t=new Uint8Array(e),n=``;return t.forEach(e=>n+=String.fromCharCode(e)),btoa(n).replace(/\+/g,`-`).replace(/\//g,`_`).replace(/=+$/,``)}function W(e){return{...e,challenge:H(e.challenge),allowCredentials:e.allowCredentials?.map(e=>({...e,id:H(e.id)}))}}function G(e){let t=e.response;return{id:e.id,rawId:U(e.rawId),type:e.type,response:{authenticatorData:U(t.authenticatorData),clientDataJSON:U(t.clientDataJSON),signature:U(t.signature),userHandle:t.userHandle?U(t.userHandle):null}}}var K=[{id:`1`,name:`worker-main`,status:`running`,uptime:`2h 14m`},{id:`2`,name:`cron-sync`,status:`stopped`,uptime:`—`},{id:`3`,name:`api-gateway`,status:`crashed`,uptime:`—`}];async function q(){if(!await u()){L(`/login`);return}let e=document.getElementById(`app`),t=K;e.innerHTML=`
    <div class="dash-wrapper">
      <div class="dash-header">
        <div class="dash-logo">${N(A,{size:20})} wha-console</div>
        <div class="dash-header-actions">
          <button type="button" class="icon-btn" id="logout-btn" title="Log out">
            ${N(w,{size:16})}
          </button>
        </div>
      </div>

      <div class="dash-main">
        <div class="dash-title-row">
          <div>
            <h2>Processes</h2>
            <p>Manage running processes across your account</p>
          </div>
          <button type="button" class="primary" id="new-process-btn" style="width: auto; display: flex; align-items: center; gap: 8px;">
            ${N(D,{size:16})} New process
          </button>
        </div>

        ${t.length===0?J():Y(t)}
      </div>
    </div>
  `,document.getElementById(`logout-btn`).addEventListener(`click`,async()=>{await d(),L(`/login`)}),document.getElementById(`new-process-btn`).addEventListener(`click`,()=>{alert(`Process creation coming soon`)}),t.forEach(e=>{document.getElementById(`start-${e.id}`)?.addEventListener(`click`,()=>{console.log(`start`,e.id)}),document.getElementById(`stop-${e.id}`)?.addEventListener(`click`,()=>{console.log(`stop`,e.id)}),document.getElementById(`delete-${e.id}`)?.addEventListener(`click`,()=>{console.log(`delete`,e.id)})})}function J(){return`
    <div class="empty-state">
      <div class="icon-wrap">${N(O,{size:28})}</div>
      <h2>No processes yet</h2>
      <p>Start your first process to see it here.</p>
    </div>
  `}function Y(e){return`
    <div class="process-grid">
      ${e.map(X).join(``)}
    </div>
  `}function X(e){return`
    <div class="process-card">
      <div class="process-card-header">
        <div class="process-name">${N(O,{size:16})} ${e.name}</div>
        <span class="status-pill ${e.status}">${e.status}</span>
      </div>
      <div class="process-meta">Uptime: ${e.uptime}</div>
      <div class="process-actions">
        ${e.status===`running`?`<button id="stop-${e.id}">${N(k,{size:14})} Stop</button>`:`<button id="start-${e.id}">${N(E,{size:14})} Start</button>`}
        <button id="delete-${e.id}">${N(j,{size:14})} Delete</button>
      </div>
    </div>
  `}function Z(){let e=document.getElementById(`app`);e.innerHTML=`
    <div class="notfound-wrapper">
      <div class="notfound-content">
        <div class="notfound-code">${N(M,{size:16})} Error 404</div>
        <h1><span class="gradient">404</span></h1>
        <p>This page doesn't exist, or the process you're looking for has already stopped.</p>
        <div class="notfound-actions">
          <button type="button" class="primary" id="go-home">
            ${N(y,{size:16})} Back to console
          </button>
        </div>
      </div>
    </div>
  `,document.getElementById(`go-home`).addEventListener(`click`,()=>{L(`/dashboard`)})}I(`/login`,B),I(`/dashboard`,q),I(`/passkey-prompt`,P),I(`/404`,Z);async function Q(){let e=await u(),t=window.location.hash.slice(1);e&&(t===``||t===`/login`)&&L(`/dashboard`),!e&&t===`/dashboard`&&L(`/login`),z()}Q();