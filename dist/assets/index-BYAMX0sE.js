(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[];function t(t,n){e.push({pattern:t,segments:t.split(`/`).filter(Boolean),handler:n})}function n(e){window.location.hash=e}function r(t){let n=t.split(`/`).filter(Boolean);for(let t of e){if(t.segments.length!==n.length)continue;let e={},r=!0;for(let i=0;i<t.segments.length;i++){let a=t.segments[i];if(a.startsWith(`:`))e[a.slice(1)]=n[i];else if(a!==n[i]){r=!1;break}}if(r)return{handler:t.handler,params:e}}return null}function i(){let t=r(window.location.hash.slice(1)||`/login`);t?t.handler(t.params):e.find(e=>e.pattern===`/404`)?.handler({})}function a(){window.addEventListener(`hashchange`,i),i()}function o(e){try{let t=e.split(`.`)[1],n=t.replace(/-/g,`+`).replace(/_/g,`/`).padEnd(t.length+(4-t.length%4)%4,`=`),r=JSON.parse(atob(n));return typeof r.exp==`number`?r.exp*1e3:null}catch{return null}}var s=`/api`,c=localStorage.getItem(`access_token`),l=c?o(c):null,u=0,d=3e5;function f(e){c=e,e?(localStorage.setItem(`access_token`,e),l=o(e)):(l=null,localStorage.removeItem(`access_token`))}function ee(){return!!c&&!!l&&Date.now()<l}async function p(e,t={}){let n={"Content-Type":`application/json`,...t.headers};c&&(n.Authorization=`Bearer ${c}`);let r=await fetch(`${s}${e}`,{...t,headers:n,credentials:`include`}),i=await r.json().catch(()=>({}));if(!r.ok)throw Error(i.error||`Request failed: ${r.status}`);return i}async function te(){try{let e=await fetch(`${s}/auth/refresh`,{method:`POST`,credentials:`include`});return e.ok?(f((await e.json()).access_token),!0):!1}catch{return!1}}async function m(){if(!(Date.now()-u>d)&&ee())return!0;if(c)try{return await p(`/auth/me`),u=Date.now(),!0}catch{}return te()}async function h(){try{await p(`/auth/logout`,{method:`POST`})}finally{f(null),u=0}}var g={signup:(e,t,n)=>p(`/auth/signup`,{method:`POST`,body:JSON.stringify({email:e,username:t,password:n})}),login:(e,t)=>p(`/auth/login`,{method:`POST`,body:JSON.stringify({email:e,password:t})}),listProcesses:()=>p(`/processes`),getProcess:e=>p(`/processes/${e}`)};function _(e){return p(`/processes`,{method:`POST`,body:JSON.stringify(e)})}function v(e,t){return p(`/processes/${e}/settings`,{method:`PATCH`,body:JSON.stringify(t)})}function ne(e){return p(`/processes/${e}`,{method:`DELETE`})}function re(e){return p(`/processes/${e}/update`,{method:`POST`})}function y(e){return p(`/processes/${e}/run`,{method:`POST`})}function b(e){return p(`/processes/${e}/stop`,{method:`POST`})}function ie(e){return p(`/processes/${e}/logs`)}var x={xmlns:`http://www.w3.org/2000/svg`,width:24,height:24,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,"stroke-width":2,"stroke-linecap":`round`,"stroke-linejoin":`round`},S=([e,t,n])=>{let r=document.createElementNS(`http://www.w3.org/2000/svg`,e);return Object.keys(t).forEach(e=>{r.setAttribute(e,String(t[e]))}),n?.length&&n.forEach(e=>{let t=S(e);r.appendChild(t)}),r},C=(e,t={})=>S([`svg`,{...x,...t},e]),ae=[[`path`,{d:`M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2`}]],w=[[`path`,{d:`m12 19-7-7 7-7`}],[`path`,{d:`M19 12H5`}]],T=[[`ellipse`,{cx:`12`,cy:`5`,rx:`9`,ry:`3`}],[`path`,{d:`M3 5V19A9 3 0 0 0 21 19V5`}],[`path`,{d:`M3 12A9 3 0 0 0 21 12`}]],E=[[`path`,{d:`M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49`}],[`path`,{d:`M14.084 14.158a3 3 0 0 1-4.242-4.242`}],[`path`,{d:`M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143`}],[`path`,{d:`m2 2 20 20`}]],D=[[`path`,{d:`M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0`}],[`circle`,{cx:`12`,cy:`12`,r:`3`}]],O=[[`path`,{d:`M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4`}],[`path`,{d:`M14 13.12c0 2.38 0 6.38-1 8.88`}],[`path`,{d:`M17.29 21.02c.12-.6.43-2.3.5-3.02`}],[`path`,{d:`M2 12a10 10 0 0 1 18-6`}],[`path`,{d:`M2 16h.01`}],[`path`,{d:`M21.8 16c.2-2 .131-5.354 0-6`}],[`path`,{d:`M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2`}],[`path`,{d:`M8.65 22c.21-.66.45-1.32.57-2`}],[`path`,{d:`M9 6.8a6 6 0 0 1 9 5.2v2`}]],k=[[`circle`,{cx:`12`,cy:`12`,r:`10`}],[`path`,{d:`M12 16v-4`}],[`path`,{d:`M12 8h.01`}]],A=[[`rect`,{width:`18`,height:`11`,x:`3`,y:`11`,rx:`2`,ry:`2`}],[`path`,{d:`M7 11V7a5 5 0 0 1 10 0v4`}]],oe=[[`path`,{d:`m16 17 5-5-5-5`}],[`path`,{d:`M21 12H9`}],[`path`,{d:`M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4`}]],se=[[`path`,{d:`m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7`}],[`rect`,{x:`2`,y:`4`,width:`20`,height:`16`,rx:`2`}]],j=[[`path`,{d:`M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z`}]],M=[[`path`,{d:`M5 12h14`}],[`path`,{d:`M12 5v14`}]],N=[[`rect`,{width:`5`,height:`5`,x:`3`,y:`3`,rx:`1`}],[`rect`,{width:`5`,height:`5`,x:`16`,y:`3`,rx:`1`}],[`rect`,{width:`5`,height:`5`,x:`3`,y:`16`,rx:`1`}],[`path`,{d:`M21 16h-3a2 2 0 0 0-2 2v3`}],[`path`,{d:`M21 21v.01`}],[`path`,{d:`M12 7v3a2 2 0 0 1-2 2H7`}],[`path`,{d:`M3 12h.01`}],[`path`,{d:`M12 3h.01`}],[`path`,{d:`M12 16v.01`}],[`path`,{d:`M16 12h1`}],[`path`,{d:`M21 12v.01`}],[`path`,{d:`M12 21v-1`}]],P=[[`path`,{d:`M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8`}],[`path`,{d:`M21 3v5h-5`}],[`path`,{d:`M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16`}],[`path`,{d:`M8 16H3v5`}]],F=[[`rect`,{width:`20`,height:`8`,x:`2`,y:`2`,rx:`2`,ry:`2`}],[`rect`,{width:`20`,height:`8`,x:`2`,y:`14`,rx:`2`,ry:`2`}],[`line`,{x1:`6`,x2:`6.01`,y1:`6`,y2:`6`}],[`line`,{x1:`6`,x2:`6.01`,y1:`18`,y2:`18`}]],I=[[`path`,{d:`M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915`}],[`circle`,{cx:`12`,cy:`12`,r:`3`}]],L=[[`rect`,{width:`14`,height:`20`,x:`5`,y:`2`,rx:`2`,ry:`2`}],[`path`,{d:`M12 18h.01`}]],R=[[`rect`,{width:`18`,height:`18`,x:`3`,y:`3`,rx:`2`}]],z=[[`path`,{d:`M12 19h8`}],[`path`,{d:`m4 17 6-6-6-6`}]],B=[[`path`,{d:`M10 11v6`}],[`path`,{d:`M14 11v6`}],[`path`,{d:`M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6`}],[`path`,{d:`M3 6h18`}],[`path`,{d:`M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2`}]],V=[[`path`,{d:`m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3`}],[`path`,{d:`M12 9v4`}],[`path`,{d:`M12 17h.01`}]],H=[[`path`,{d:`M18 6 6 18`}],[`path`,{d:`m6 6 12 12`}]];function U(e,t={}){let n=C(e);return n.setAttribute(`width`,String(t.size??20)),n.setAttribute(`height`,String(t.size??20)),t.class&&n.setAttribute(`class`,t.class),n.outerHTML}function W(){let e=document.getElementById(`app`),t=`login`,r=!1;function i(){e.innerHTML=`
      <div class="auth-wrapper">
        <div class="auth-content">
          <div class="auth-logo">${U(z,{size:22})} wha-console</div>
          <h1>${t===`login`?`Welcome <span class="gradient">back</span>`:`Manage your <span class="gradient">processes</span>`}</h1>
          <p class="auth-subtitle">
            ${t===`login`?`Sign in to your console`:`Create an account to get started`}
          </p>

          <button type="button" id="passkey-btn" class="secondary">
            ${U(O,{size:18})} Sign in with a passkey
          </button>

          <div class="divider">or</div>

          <form id="auth-form">
            ${t===`signup`?`<div class="field">
                     <label for="username">Username</label>
                     <input type="text" id="username" placeholder="yourname" required />
                   </div>`:``}
           <div class="field">
  <label for="email">Email</label>
  <div class="input-icon-wrap">
    <span class="icon-left">${U(se,{size:16})}</span>
    <input type="email" id="email" class="has-icon" placeholder="your@email.com" required />
  </div>
</div>
<div class="field">
  <label for="password">Password</label>
  <div class="input-icon-wrap">
    <span class="icon-left">${U(A,{size:16})}</span>
    <input type="${r?`text`:`password`}" id="password" class="has-icon" placeholder="••••••••" required />
    <button type="button" class="icon-toggle" id="toggle-password">
      ${U(r?E:D,{size:16})}
    </button>
  </div>
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
    `,document.getElementById(`toggle-mode`).addEventListener(`click`,e=>{e.preventDefault(),t=t===`login`?`signup`:`login`,r=!1,i()}),document.getElementById(`toggle-password`).addEventListener(`click`,()=>{let e=document.getElementById(`password`),t=document.getElementById(`toggle-password`);r=!r,e.type=r?`text`:`password`,t.innerHTML=U(r?E:D,{size:16})}),document.getElementById(`passkey-btn`).addEventListener(`click`,async()=>{let e=document.getElementById(`auth-error`);e.textContent=``;let t=prompt(`Enter your username to sign in with a passkey:`);if(t)try{await G(t),n(`/dashboard`)}catch(t){e.textContent=t.message}}),document.getElementById(`auth-form`).addEventListener(`submit`,async e=>{e.preventDefault();let r=document.getElementById(`auth-error`);r.textContent=``;let i=document.getElementById(`email`).value,a=document.getElementById(`password`).value;try{let e;if(t===`signup`){let t=document.getElementById(`username`).value;e=await g.signup(i,t,a),f(e.access_token),n(`/passkey-prompt`);return}e=await g.login(i,a),f(e.access_token),n(`/dashboard`),f(e.access_token),n(`/dashboard`)}catch(e){r.textContent=e.message}})}i()}async function G(e){let t=await fetch(`/api/webauthn/login/begin`,{method:`POST`,headers:{"Content-Type":`application/json`},credentials:`include`,body:JSON.stringify({username:e})});if(!t.ok)throw Error(`No passkey found for this user`);let n=ce((await t.json()).publicKey),r=await navigator.credentials.get({publicKey:n}),i=await fetch(`/api/webauthn/login/finish`,{method:`POST`,headers:{"Content-Type":`application/json`},credentials:`include`,body:JSON.stringify(le(r))});if(!i.ok)throw Error(`Passkey authentication failed`);f((await i.json()).access_token)}function K(e){let t=e.replace(/-/g,`+`).replace(/_/g,`/`).padEnd(e.length+(4-e.length%4)%4,`=`),n=atob(t),r=new Uint8Array(n.length);for(let e=0;e<n.length;e++)r[e]=n.charCodeAt(e);return r.buffer}function q(e){let t=new Uint8Array(e),n=``;return t.forEach(e=>n+=String.fromCharCode(e)),btoa(n).replace(/\+/g,`-`).replace(/\//g,`_`).replace(/=+$/,``)}function ce(e){return{...e,challenge:K(e.challenge),allowCredentials:e.allowCredentials?.map(e=>({...e,id:K(e.id)}))}}function le(e){let t=e.response;return{id:e.id,rawId:q(e.rawId),type:e.type,response:{authenticatorData:q(t.authenticatorData),clientDataJSON:q(t.clientDataJSON),signature:q(t.signature),userHandle:t.userHandle?q(t.userHandle):null}}}function ue(e,t){let n=document.createElement(`div`);n.className=`modal-overlay`,n.innerHTML=`<div class="modal">${e}</div>`,document.body.appendChild(n);function r(){n.remove(),document.removeEventListener(`keydown`,i),t?.()}function i(e){e.key===`Escape`&&r()}return n.addEventListener(`click`,e=>{e.target===n&&r()}),document.addEventListener(`keydown`,i),n.__close=r,n}function J(e){e.__close?.()}function Y(e){let t=ue(`
    <div class="modal-header">
      <h2>Process Configuration</h2>
      <button type="button" class="modal-close" id="modal-close-btn">${U(H,{size:18})}</button>
    </div>
    <form id="process-form">
      <div class="modal-body">
        <div class="field">
          <label for="proc-name">Process Name</label>
          <input type="text" id="proc-name" placeholder="e.g. sales-support" required />
        </div>

        <div class="field">
          <label for="proc-phone">Phone Number</label>
          <input type="tel" id="proc-phone" placeholder="+1 555 123 4567" required />
          <p class="field-hint">Only the last 4 digits are shown on your dashboard.</p>
        </div>

        <div class="field">
          <label>Auth Type</label>
          <div class="radio-group">
            <div class="radio-option">
              <input type="radio" name="auth-type" id="auth-pair" value="pair" checked />
              <label for="auth-pair">${U(L,{size:15})} Pair Code</label>
            </div>
            <div class="radio-option">
              <input type="radio" name="auth-type" id="auth-qr" value="qr" />
              <label for="auth-qr">${U(N,{size:15})} QR Code</label>
            </div>
          </div>
        </div>

        <div class="field">
          <label>Client</label>
          <div class="radio-group">
            <div class="radio-option">
              <input type="radio" name="client" id="client-chrome" value="chrome" checked />
              <label for="client-chrome">Chrome</label>
            </div>
            <div class="radio-option">
              <input type="radio" name="client" id="client-android" value="android" />
              <label for="client-android">Android</label>
            </div>
            <div class="radio-option">
              <input type="radio" name="client" id="client-ios" value="ios" />
              <label for="client-ios">iOS</label>
            </div>
          </div>
        </div>

        <div class="field">
  <label for="proc-db">Database URL</label>
  <div class="input-icon-wrap">
    <span class="icon-left">${U(T,{size:16})}</span>
    <input type="text" id="proc-db" class="has-icon" placeholder="postgres://user:pass@host:5432/db" required />
  </div>
  <p class="field-hint">Must be a Postgres connection string.</p>
</div>

        <p id="process-form-error" class="error"></p>
      </div>
      <div class="modal-footer">
        <button type="button" class="secondary" id="modal-cancel-btn">Cancel</button>
        <button type="submit" class="primary">Create process</button>
      </div>
    </form>
  `);document.getElementById(`modal-close-btn`).addEventListener(`click`,()=>J(t)),document.getElementById(`modal-cancel-btn`).addEventListener(`click`,()=>J(t)),document.getElementById(`process-form`).addEventListener(`submit`,async n=>{n.preventDefault();let r=document.getElementById(`process-form-error`);r.textContent=``;let i=document.getElementById(`proc-name`).value,a=document.getElementById(`proc-phone`).value,o=document.querySelector(`input[name="auth-type"]:checked`).value,s=document.querySelector(`input[name="client"]:checked`).value,c=document.getElementById(`proc-db`).value;try{await _({name:i,phone_number:a,auth_type:o,client:s,database_url:c}),J(t),e()}catch(e){r.textContent=e.message}})}async function X(){if(!await m()){n(`/login`);return}let e=document.getElementById(`app`);e.innerHTML=`<div class="dash-wrapper"><div class="dash-main"><p>Loading…</p></div></div>`;let t=[];try{t=await g.listProcesses()}catch(t){e.innerHTML=`<div class="dash-wrapper"><div class="dash-main"><p class="error">Failed to load processes: ${t.message}</p></div></div>`;return}e.innerHTML=`
    <div class="dash-wrapper">
      <div class="dash-header">
        <div class="dash-logo">${U(z,{size:20})} wha-console</div>
        <div class="dash-header-actions">
          <button type="button" class="icon-btn" id="logout-btn" title="Log out">
            ${U(oe,{size:16})}
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
            ${U(M,{size:16})} New process
          </button>
        </div>

        ${t.length===0?de():fe(t)}
      </div>
    </div>
  `,document.getElementById(`logout-btn`).addEventListener(`click`,async()=>{await h(),n(`/login`)}),document.getElementById(`new-process-btn`).addEventListener(`click`,()=>{Y(()=>X())}),document.getElementById(`empty-new-process-btn`)?.addEventListener(`click`,()=>{Y(()=>X())}),t.forEach(e=>{document.querySelector(`.process-card[data-id="${e.id}"]`)?.addEventListener(`click`,()=>n(`/processes/${e.id}`)),document.getElementById(`start-${e.id}`)?.addEventListener(`click`,async t=>{t.stopPropagation();let n=t.currentTarget;n.disabled=!0;try{await y(String(e.id)),X()}catch(e){alert(e.message),n.disabled=!1}}),document.getElementById(`stop-${e.id}`)?.addEventListener(`click`,async t=>{t.stopPropagation();let n=t.currentTarget;n.disabled=!0;try{await b(String(e.id)),X()}catch(e){alert(e.message),n.disabled=!1}}),document.getElementById(`delete-${e.id}`)?.addEventListener(`click`,t=>{t.stopPropagation(),console.log(`delete`,e.id)})})}function de(){return`
    <div class="empty-state">
      <div class="icon-wrap">${U(F,{size:28})}</div>
      <h2>No processes yet</h2>
      <p>Start your first process to see it here.</p>
      <button type="button" class="primary" id="empty-new-process-btn" style="width: auto; margin-top: 16px; display: inline-flex; align-items: center; gap: 8px;">
        ${U(M,{size:16})} New process
      </button>
    </div>
  `}function fe(e){return`
    <div class="process-grid">
      ${e.map(pe).join(``)}
    </div>
  `}function pe(e){return`
    <div class="process-card" data-id="${e.id}" style="cursor: pointer;">
      <div class="process-card-header">
        <div class="process-name">${U(F,{size:16})} ${e.name}</div>
        <span class="status-pill ${e.status}">${e.status}</span>
      </div>
      <div class="process-meta">${e.phone_masked} · ${e.client}</div>
      <div class="process-actions">
        ${e.status===`running`?`<button id="stop-${e.id}">${U(R,{size:14})} Stop</button>`:`<button id="start-${e.id}">${U(j,{size:14})} Start</button>`}
        <button id="delete-${e.id}">${U(B,{size:14})} Delete</button>
      </div>
    </div>
  `}function Z(e){let t=e.replace(/-/g,`+`).replace(/_/g,`/`).padEnd(e.length+(4-e.length%4)%4,`=`),n=atob(t),r=new Uint8Array(n.length);for(let e=0;e<n.length;e++)r[e]=n.charCodeAt(e);return r.buffer}function Q(e){let t=new Uint8Array(e),n=``;return t.forEach(e=>n+=String.fromCharCode(e)),btoa(n).replace(/\+/g,`-`).replace(/\//g,`_`).replace(/=+$/,``)}async function me(){let e=await fetch(`/api/webauthn/register/begin`,{method:`POST`,credentials:`include`,headers:{Authorization:`Bearer ${localStorage.getItem(`access_token`)}`}});if(!e.ok)throw Error(`Could not start passkey registration`);let t=await e.json(),n={...t.publicKey,challenge:Z(t.publicKey.challenge),user:{...t.publicKey.user,id:Z(t.publicKey.user.id)},excludeCredentials:t.publicKey.excludeCredentials?.map(e=>({...e,id:Z(e.id)}))},r=await navigator.credentials.create({publicKey:n});if(!r)throw Error(`Passkey creation was cancelled`);let i=r.response;if(!(await fetch(`/api/webauthn/register/finish`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${localStorage.getItem(`access_token`)}`},credentials:`include`,body:JSON.stringify({id:r.id,rawId:Q(r.rawId),type:r.type,response:{attestationObject:Q(i.attestationObject),clientDataJSON:Q(i.clientDataJSON)}})})).ok)throw Error(`Failed to save passkey`)}function he(){let e=document.getElementById(`app`);e.innerHTML=`
    <div class="auth-wrapper">
      <div class="auth-content">
        <div class="auth-logo">${U(O,{size:22})} wha-console</div>
        <h1>Add a <span class="gradient">passkey</span></h1>
        <p class="auth-subtitle">Sign in faster next time, no password needed.</p>
        <button type="button" class="primary" id="add-passkey">Add passkey</button>
        <button type="button" class="secondary" id="skip-passkey" style="margin-top: 12px;">Skip for now</button>
        <p id="passkey-error" class="error"></p>
      </div>
    </div>
  `,document.getElementById(`add-passkey`).addEventListener(`click`,async()=>{let e=document.getElementById(`passkey-error`);e.textContent=``;try{await me(),n(`/dashboard`)}catch(t){e.textContent=t.message}}),document.getElementById(`skip-passkey`).addEventListener(`click`,()=>{n(`/dashboard`)})}function ge(){let e=document.getElementById(`app`);e.innerHTML=`
    <div class="notfound-wrapper">
      <div class="notfound-content">
        <div class="notfound-code">${U(V,{size:16})} Error 404</div>
        <h1><span class="gradient">404</span></h1>
        <p>This page doesn't exist, or the process you're looking for has already stopped.</p>
        <div class="notfound-actions">
          <button type="button" class="primary" id="go-home">
            ${U(w,{size:16})} Back to console
          </button>
        </div>
      </div>
    </div>
  `,document.getElementById(`go-home`).addEventListener(`click`,()=>{n(`/dashboard`)})}async function _e(e){if(!await m()){n(`/login`);return}let t=document.getElementById(`app`);t.innerHTML=`<div class="dash-wrapper"><div class="dash-main"><p>Loading…</p></div></div>`;let r;try{r=await g.getProcess(e.id)}catch(e){t.innerHTML=`<div class="dash-wrapper"><div class="dash-main"><p class="error">${e.message}</p></div></div>`;return}let i=`console`;function a(e=``){t.innerHTML=`
    <div class="dash-wrapper">
      <div class="detail-header">
        <button type="button" class="detail-back" id="back-btn">${U(w,{size:18})}</button>
        <div class="detail-title">${U(F,{size:18})} ${r.name}</div>
        <span class="status-pill ${r.status}">${r.status}</span>
        <div style="margin-left: auto; display: flex; gap: 8px;">
          ${r.status===`running`?`<button type="button" class="outline" id="detail-stop-btn">${U(R,{size:14})} Stop</button>`:`<button type="button" class="outline" id="detail-start-btn">${U(j,{size:14})} Start</button>`}
        </div>
      </div>

      <div class="detail-tabs">
        <button class="detail-tab ${i===`console`?`active`:``}" data-tab="console">
          ${U(z,{size:15})} Console
        </button>
        <button class="detail-tab ${i===`about`?`active`:``}" data-tab="about">
          ${U(k,{size:15})} About
        </button>
        <button class="detail-tab ${i===`settings`?`active`:``}" data-tab="settings">
          ${U(I,{size:15})} Settings
        </button>
      </div>

      <div class="detail-body">
        ${i===`console`?xe(e):i===`about`?ve(r):ye(r)}
      </div>
    </div>
  `,document.getElementById(`back-btn`).addEventListener(`click`,()=>n(`/dashboard`)),document.getElementById(`detail-start-btn`)?.addEventListener(`click`,async()=>{try{await y(String(r.id)),location.reload()}catch(e){alert(e.message)}}),document.getElementById(`detail-stop-btn`)?.addEventListener(`click`,async()=>{try{await b(String(r.id)),location.reload()}catch(e){alert(e.message)}}),document.querySelectorAll(`.detail-tab`).forEach(e=>{e.addEventListener(`click`,async()=>{i=e.dataset.tab,i===`console`?a(await $(r.id)):a()})}),i===`settings`&&be(r,()=>a())}$(r.id).then(e=>a(e)),document.getElementById(`detail-start-btn`)?.addEventListener(`click`,async()=>{try{await y(String(r.id)),location.reload()}catch(e){alert(e.message)}}),document.getElementById(`detail-stop-btn`)?.addEventListener(`click`,async()=>{try{await b(String(r.id)),location.reload()}catch(e){alert(e.message)}}),a()}async function $(e){try{return(await ie(String(e))).logs||``}catch{return``}}function ve(e){return`
    <div class="about-placeholder">
      <div class="icon-wrap">${U(ae,{size:28})}</div>
      <h2>Live session stats coming soon</h2>
      <p>Once the process is running, this tab will show real-time details from the session — connection status, message throughput, and more.</p>
    </div>
  `}function ye(e){return`
    <div class="settings-section">
      <div class="settings-group">
        <div class="settings-group-title">Session info</div>
        <div class="info-row">
          <span class="info-row-label">Phone number</span>
          <span class="info-row-value">${e.phone_number}</span>
        </div>
        <div class="info-row">
          <span class="info-row-label">Client</span>
          <span class="frozen-pill">${e.client}</span>
        </div>
        <div class="info-row">
          <span class="info-row-label">Auth type</span>
          <span class="frozen-pill">${e.auth_type}</span>
        </div>
      </div>

      <div class="settings-group">
        <div class="settings-group-title">Behavior</div>
        <div class="settings-row">
          <div>
            <div class="settings-row-label">Verbose logging</div>
            <div class="settings-row-desc">Include detailed debug output in the console.</div>
          </div>
          <div class="toggle">
            <input type="checkbox" id="verbose-toggle" ${e.verbose?`checked`:``} />
            <label for="verbose-toggle"></label>
          </div>
        </div>

        <div class="settings-row">
          <div>
            <div class="settings-row-label">Process offline messages</div>
            <div class="settings-row-desc">Skip messages sent while the process was offline.</div>
          </div>
          <div class="toggle">
            <input type="checkbox" id="skip-old-toggle" ${e.no_skip_old?``:`checked`} />
            <label for="skip-old-toggle"></label>
          </div>
        </div>
      </div>

      <div class="action-row">
        <button type="button" class="outline" id="update-check-btn">${U(P,{size:14})} Check for update</button>
      </div>

      <div class="settings-danger">
        <h3>Delete this process</h3>
        <p>This will permanently stop and remove this process. This action cannot be undone.</p>
        <button type="button" class="danger" id="delete-process-btn">${U(B,{size:14})} Delete process</button>
      </div>
    </div>
  `}function be(e,t){document.getElementById(`verbose-toggle`)?.addEventListener(`change`,async t=>{let n=t.target.checked,r=t.target;try{await v(String(e.id),{verbose:n}),e.verbose=n}catch(e){r.checked=!n,alert(e.message)}}),document.getElementById(`skip-old-toggle`)?.addEventListener(`change`,async t=>{let n=t.target,r=n.checked,i=!r;try{await v(String(e.id),{no_skip_old:i}),e.no_skip_old=i}catch(e){n.checked=!r,alert(e.message)}}),document.getElementById(`update-check-btn`)?.addEventListener(`click`,async n=>{let r=n.currentTarget;r.disabled=!0,r.textContent=`Checking…`;try{let t=await re(String(e.id));alert(t.message)}catch(e){alert(e.message)}finally{r.disabled=!1,t()}}),document.getElementById(`delete-process-btn`)?.addEventListener(`click`,async()=>{if(confirm(`Delete "${e.name}"? This cannot be undone.`))try{await ne(String(e.id)),n(`/dashboard`)}catch(e){alert(e.message)}})}function xe(e){return e.trim()?`<div class="console-output">${e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}</div>`:`
      <div class="console-output">
        <span class="console-placeholder">No output yet — start the process to see logs here.</span>
      </div>
    `}t(`/login`,W),t(`/dashboard`,X),t(`/passkey-prompt`,he),t(`/processes/:id`,_e),t(`/404`,ge);async function Se(){let e=await m(),t=window.location.hash.slice(1);e&&(t===``||t===`/login`)&&n(`/dashboard`),!e&&t===`/dashboard`&&n(`/login`),a()}Se();