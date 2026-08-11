(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[];function t(t,n){e.push({pattern:t,segments:t.split(`/`).filter(Boolean),handler:n})}function n(e){window.location.hash=e}function r(t){let n=t.split(`/`).filter(Boolean);for(let t of e){if(t.segments.length!==n.length)continue;let e={},r=!0;for(let i=0;i<t.segments.length;i++){let a=t.segments[i];if(a.startsWith(`:`))e[a.slice(1)]=n[i];else if(a!==n[i]){r=!1;break}}if(r)return{handler:t.handler,params:e}}return null}function i(){let t=r(window.location.hash.slice(1)||`/login`);t?t.handler(t.params):e.find(e=>e.pattern===`/404`)?.handler({})}function a(){window.addEventListener(`hashchange`,i),i()}function o(e){try{let t=e.split(`.`)[1],n=t.replace(/-/g,`+`).replace(/_/g,`/`).padEnd(t.length+(4-t.length%4)%4,`=`),r=JSON.parse(atob(n));return typeof r.exp==`number`?r.exp*1e3:null}catch{return null}}var s=`/api`,c=localStorage.getItem(`access_token`),l=c?o(c):null,u=0,ee=3e5;function d(e){c=e,e?(localStorage.setItem(`access_token`,e),l=o(e)):(l=null,localStorage.removeItem(`access_token`))}function te(){return!!c&&!!l&&Date.now()<l}async function f(e,t={}){let n={"Content-Type":`application/json`,...t.headers};c&&(n.Authorization=`Bearer ${c}`);let r=await fetch(`${s}${e}`,{...t,headers:n,credentials:`include`}),i=await r.json().catch(()=>({}));if(!r.ok)throw Error(i.error||`Request failed: ${r.status}`);return i}async function ne(){try{let e=await fetch(`${s}/auth/refresh`,{method:`POST`,credentials:`include`});return e.ok?(d((await e.json()).access_token),!0):!1}catch{return!1}}async function p(){if(!(Date.now()-u>ee)&&te())return!0;if(c)try{return await f(`/auth/me`),u=Date.now(),!0}catch{}return ne()}async function re(){try{await f(`/auth/logout`,{method:`POST`})}finally{d(null),u=0}}var m={signup:(e,t,n)=>f(`/auth/signup`,{method:`POST`,body:JSON.stringify({email:e,username:t,password:n})}),login:(e,t)=>f(`/auth/login`,{method:`POST`,body:JSON.stringify({email:e,password:t})}),listProcesses:()=>f(`/processes`),getProcess:e=>f(`/processes/${e}`)};function h(e){return f(`/processes`,{method:`POST`,body:JSON.stringify(e)})}function g(e,t){return f(`/processes/${e}/settings`,{method:`PATCH`,body:JSON.stringify(t)})}function _(e){return f(`/processes/${e}`,{method:`DELETE`})}function v(e){return f(`/processes/${e}/run`,{method:`POST`})}function y(e){return f(`/processes/${e}/stop`,{method:`POST`})}function ie(e){return f(`/processes/${e}/logs`)}function ae(e){return f(`/processes/${e}/logs/clear`,{method:`POST`})}function oe(e){return f(`/processes/${e}/logout`,{method:`POST`})}var se={xmlns:`http://www.w3.org/2000/svg`,width:24,height:24,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,"stroke-width":2,"stroke-linecap":`round`,"stroke-linejoin":`round`},b=([e,t,n])=>{let r=document.createElementNS(`http://www.w3.org/2000/svg`,e);return Object.keys(t).forEach(e=>{r.setAttribute(e,String(t[e]))}),n?.length&&n.forEach(e=>{let t=b(e);r.appendChild(t)}),r},x=(e,t={})=>b([`svg`,{...se,...t},e]),S=[[`path`,{d:`M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2`}]],C=[[`path`,{d:`M12 5v14`}],[`path`,{d:`m19 12-7 7-7-7`}]],w=[[`path`,{d:`m12 19-7-7 7-7`}],[`path`,{d:`M19 12H5`}]],ce=[[`ellipse`,{cx:`12`,cy:`5`,rx:`9`,ry:`3`}],[`path`,{d:`M3 5V19A9 3 0 0 0 21 19V5`}],[`path`,{d:`M3 12A9 3 0 0 0 21 12`}]],le=[[`path`,{d:`M12 15V3`}],[`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`}],[`path`,{d:`m7 10 5 5 5-5`}]],T=[[`path`,{d:`M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49`}],[`path`,{d:`M14.084 14.158a3 3 0 0 1-4.242-4.242`}],[`path`,{d:`M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143`}],[`path`,{d:`m2 2 20 20`}]],E=[[`path`,{d:`M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0`}],[`circle`,{cx:`12`,cy:`12`,r:`3`}]],D=[[`path`,{d:`M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4`}],[`path`,{d:`M14 13.12c0 2.38 0 6.38-1 8.88`}],[`path`,{d:`M17.29 21.02c.12-.6.43-2.3.5-3.02`}],[`path`,{d:`M2 12a10 10 0 0 1 18-6`}],[`path`,{d:`M2 16h.01`}],[`path`,{d:`M21.8 16c.2-2 .131-5.354 0-6`}],[`path`,{d:`M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2`}],[`path`,{d:`M8.65 22c.21-.66.45-1.32.57-2`}],[`path`,{d:`M9 6.8a6 6 0 0 1 9 5.2v2`}]],ue=[[`circle`,{cx:`12`,cy:`12`,r:`10`}],[`path`,{d:`M12 16v-4`}],[`path`,{d:`M12 8h.01`}]],de=[[`rect`,{width:`18`,height:`11`,x:`3`,y:`11`,rx:`2`,ry:`2`}],[`path`,{d:`M7 11V7a5 5 0 0 1 10 0v4`}]],O=[[`path`,{d:`m16 17 5-5-5-5`}],[`path`,{d:`M21 12H9`}],[`path`,{d:`M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4`}]],fe=[[`path`,{d:`m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7`}],[`rect`,{x:`2`,y:`4`,width:`20`,height:`16`,rx:`2`}]],k=[[`path`,{d:`M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z`}]],A=[[`path`,{d:`M5 12h14`}],[`path`,{d:`M12 5v14`}]],pe=[[`rect`,{width:`5`,height:`5`,x:`3`,y:`3`,rx:`1`}],[`rect`,{width:`5`,height:`5`,x:`16`,y:`3`,rx:`1`}],[`rect`,{width:`5`,height:`5`,x:`3`,y:`16`,rx:`1`}],[`path`,{d:`M21 16h-3a2 2 0 0 0-2 2v3`}],[`path`,{d:`M21 21v.01`}],[`path`,{d:`M12 7v3a2 2 0 0 1-2 2H7`}],[`path`,{d:`M3 12h.01`}],[`path`,{d:`M12 3h.01`}],[`path`,{d:`M12 16v.01`}],[`path`,{d:`M16 12h1`}],[`path`,{d:`M21 12v.01`}],[`path`,{d:`M12 21v-1`}]],j=[[`rect`,{width:`20`,height:`8`,x:`2`,y:`2`,rx:`2`,ry:`2`}],[`rect`,{width:`20`,height:`8`,x:`2`,y:`14`,rx:`2`,ry:`2`}],[`line`,{x1:`6`,x2:`6.01`,y1:`6`,y2:`6`}],[`line`,{x1:`6`,x2:`6.01`,y1:`18`,y2:`18`}]],M=[[`path`,{d:`M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915`}],[`circle`,{cx:`12`,cy:`12`,r:`3`}]],N=[[`rect`,{width:`14`,height:`20`,x:`5`,y:`2`,rx:`2`,ry:`2`}],[`path`,{d:`M12 18h.01`}]],P=[[`rect`,{width:`18`,height:`18`,x:`3`,y:`3`,rx:`2`}]],F=[[`path`,{d:`M12 19h8`}],[`path`,{d:`m4 17 6-6-6-6`}]],I=[[`path`,{d:`m16 16-3 3 3 3`}],[`path`,{d:`M3 12h14.5a1 1 0 0 1 0 7H13`}],[`path`,{d:`M3 19h6`}],[`path`,{d:`M3 5h18`}]],L=[[`path`,{d:`M10 11v6`}],[`path`,{d:`M14 11v6`}],[`path`,{d:`M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6`}],[`path`,{d:`M3 6h18`}],[`path`,{d:`M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2`}]],R=[[`path`,{d:`m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3`}],[`path`,{d:`M12 9v4`}],[`path`,{d:`M12 17h.01`}]],z=[[`path`,{d:`M18 6 6 18`}],[`path`,{d:`m6 6 12 12`}]];function B(e,t={}){let n=x(e);return n.setAttribute(`width`,String(t.size??20)),n.setAttribute(`height`,String(t.size??20)),t.class&&n.setAttribute(`class`,t.class),n.outerHTML}function me(){let e=document.getElementById(`app`),t=`login`,r=!1;function i(){e.innerHTML=`
      <div class="auth-wrapper">
        <div class="auth-content">
          <div class="auth-logo">${B(F,{size:22})} wha-console</div>
          <h1>${t===`login`?`Welcome <span class="gradient">back</span>`:`Manage your <span class="gradient">processes</span>`}</h1>
          <p class="auth-subtitle">
            ${t===`login`?`Sign in to your console`:`Create an account to get started`}
          </p>

          <button type="button" id="passkey-btn" class="secondary">
            ${B(D,{size:18})} Sign in with a passkey
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
    <span class="icon-left">${B(fe,{size:16})}</span>
    <input type="email" id="email" class="has-icon" placeholder="your@email.com" required />
  </div>
</div>
<div class="field">
  <label for="password">Password</label>
  <div class="input-icon-wrap">
    <span class="icon-left">${B(de,{size:16})}</span>
    <input type="${r?`text`:`password`}" id="password" class="has-icon" placeholder="••••••••" required />
    <button type="button" class="icon-toggle" id="toggle-password">
      ${B(r?T:E,{size:16})}
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
    `,document.getElementById(`toggle-mode`).addEventListener(`click`,e=>{e.preventDefault(),t=t===`login`?`signup`:`login`,r=!1,i()}),document.getElementById(`toggle-password`).addEventListener(`click`,()=>{let e=document.getElementById(`password`),t=document.getElementById(`toggle-password`);r=!r,e.type=r?`text`:`password`,t.innerHTML=B(r?T:E,{size:16})}),document.getElementById(`passkey-btn`).addEventListener(`click`,async()=>{let e=document.getElementById(`auth-error`);e.textContent=``;let t=prompt(`Enter your username to sign in with a passkey:`);if(t)try{await he(t),n(`/dashboard`)}catch(t){e.textContent=t.message}}),document.getElementById(`auth-form`).addEventListener(`submit`,async e=>{e.preventDefault();let r=document.getElementById(`auth-error`);r.textContent=``;let i=document.getElementById(`email`).value,a=document.getElementById(`password`).value;try{let e;if(t===`signup`){let t=document.getElementById(`username`).value;e=await m.signup(i,t,a),d(e.access_token),n(`/passkey-prompt`);return}e=await m.login(i,a),d(e.access_token),n(`/dashboard`),d(e.access_token),n(`/dashboard`)}catch(e){r.textContent=e.message}})}i()}async function he(e){let t=await fetch(`/api/webauthn/login/begin`,{method:`POST`,headers:{"Content-Type":`application/json`},credentials:`include`,body:JSON.stringify({username:e})});if(!t.ok)throw Error(`No passkey found for this user`);let n=ge((await t.json()).publicKey),r=await navigator.credentials.get({publicKey:n}),i=await fetch(`/api/webauthn/login/finish`,{method:`POST`,headers:{"Content-Type":`application/json`},credentials:`include`,body:JSON.stringify(_e(r))});if(!i.ok)throw Error(`Passkey authentication failed`);d((await i.json()).access_token)}function V(e){let t=e.replace(/-/g,`+`).replace(/_/g,`/`).padEnd(e.length+(4-e.length%4)%4,`=`),n=atob(t),r=new Uint8Array(n.length);for(let e=0;e<n.length;e++)r[e]=n.charCodeAt(e);return r.buffer}function H(e){let t=new Uint8Array(e),n=``;return t.forEach(e=>n+=String.fromCharCode(e)),btoa(n).replace(/\+/g,`-`).replace(/\//g,`_`).replace(/=+$/,``)}function ge(e){return{...e,challenge:V(e.challenge),allowCredentials:e.allowCredentials?.map(e=>({...e,id:V(e.id)}))}}function _e(e){let t=e.response;return{id:e.id,rawId:H(e.rawId),type:e.type,response:{authenticatorData:H(t.authenticatorData),clientDataJSON:H(t.clientDataJSON),signature:H(t.signature),userHandle:t.userHandle?H(t.userHandle):null}}}function U(e,t){let n=document.createElement(`div`);n.className=`modal-overlay`,n.innerHTML=`<div class="modal">${e}</div>`,document.body.appendChild(n);function r(){n.remove(),document.removeEventListener(`keydown`,i),t?.()}function i(e){e.key===`Escape`&&r()}return n.addEventListener(`click`,e=>{e.target===n&&r()}),document.addEventListener(`keydown`,i),n.__close=r,n}function W(e){e.__close?.()}function G(e){let t=U(`
    <div class="modal-header">
      <h2>Process Configuration</h2>
      <button type="button" class="modal-close" id="modal-close-btn">${B(z,{size:18})}</button>
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
              <label for="auth-pair">${B(N,{size:15})} Pair Code</label>
            </div>
            <div class="radio-option">
              <input type="radio" name="auth-type" id="auth-qr" value="qr" />
              <label for="auth-qr">${B(pe,{size:15})} QR Code</label>
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
    <span class="icon-left">${B(ce,{size:16})}</span>
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
  `);document.getElementById(`modal-close-btn`).addEventListener(`click`,()=>W(t)),document.getElementById(`modal-cancel-btn`).addEventListener(`click`,()=>W(t)),document.getElementById(`process-form`).addEventListener(`submit`,async n=>{n.preventDefault();let r=document.getElementById(`process-form-error`);r.textContent=``;let i=document.getElementById(`proc-name`).value,a=document.getElementById(`proc-phone`).value,o=document.querySelector(`input[name="auth-type"]:checked`).value,s=document.querySelector(`input[name="client"]:checked`).value,c=document.getElementById(`proc-db`).value;try{await h({name:i,phone_number:a,auth_type:o,client:s,database_url:c}),W(t),e()}catch(e){r.textContent=e.message}})}function K(e,t=`error`){let n=document.createElement(`div`);n.className=`toast toast-${t}`,n.textContent=e,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add(`visible`)),setTimeout(()=>{n.classList.remove(`visible`),setTimeout(()=>n.remove(),200)},3500)}function q(e){let t=document.createElement(`div`);return t.className=`loading-overlay`,t.innerHTML=`
    <div class="loading-spinner"></div>
    <p>${e}</p>
  `,document.body.appendChild(t),()=>t.remove()}function J(e){return new Promise(t=>{let n=!1,r=U(`
      <div class="modal-header">
        <h2>${e.title}</h2>
      </div>
      <div class="modal-body">
        <p style="color: var(--text); font-size: 14px;">${e.message}</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="secondary" id="confirm-cancel">Cancel</button>
        <button type="button" class="${e.danger?`danger`:`primary`}" id="confirm-ok">
          ${e.confirmLabel??`Confirm`}
        </button>
      </div>
    `,()=>{n||(n=!0,t(!1))});document.getElementById(`confirm-cancel`).addEventListener(`click`,()=>{n=!0,W(r),t(!1)}),document.getElementById(`confirm-ok`).addEventListener(`click`,()=>{n=!0,W(r),t(!0)})})}async function Y(){if(!await p()){n(`/login`);return}let e=document.getElementById(`app`);e.innerHTML=`<div class="dash-wrapper"><div class="dash-main"><p>Loading…</p></div></div>`;let t=[];try{t=await m.listProcesses()}catch(t){e.innerHTML=`<div class="dash-wrapper"><div class="dash-main"><p class="error">Failed to load processes: ${t.message}</p></div></div>`;return}e.innerHTML=`
    <div class="dash-wrapper">
      <div class="dash-header">
        <div class="dash-logo">${B(F,{size:20})} wha-console</div>
        <div class="dash-header-actions">
          <button type="button" class="icon-btn" id="logout-btn" title="Log out">
            ${B(O,{size:16})}
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
            ${B(A,{size:16})} New process
          </button>
        </div>

        ${t.length===0?ve():ye(t)}
      </div>
    </div>
  `,document.getElementById(`logout-btn`).addEventListener(`click`,async()=>{await re(),n(`/login`)}),document.getElementById(`new-process-btn`).addEventListener(`click`,()=>{G(()=>Y())}),document.getElementById(`empty-new-process-btn`)?.addEventListener(`click`,()=>{G(()=>Y())}),t.forEach(e=>{document.querySelector(`.process-card[data-id="${e.id}"]`)?.addEventListener(`click`,()=>n(`/processes/${e.id}`)),document.getElementById(`start-${e.id}`)?.addEventListener(`click`,async t=>{t.stopPropagation();let n=t.currentTarget;n.disabled=!0;try{await v(String(e.id)),Y()}catch(e){alert(e.message),n.disabled=!1}}),document.getElementById(`stop-${e.id}`)?.addEventListener(`click`,async t=>{t.stopPropagation();let n=t.currentTarget;n.disabled=!0;try{await y(String(e.id)),Y()}catch(e){alert(e.message),n.disabled=!1}}),document.getElementById(`delete-${e.id}`)?.addEventListener(`click`,async t=>{t.stopPropagation();try{if(!await J({title:`Delete process`,message:`Delete "${e.name}"? This cannot be undone.`,confirmLabel:`Delete`,danger:!0}))return;let t=q(`Deleting session…`);try{await _(String(e.id)),t(),Y()}catch(e){t(),K(e.message,`error`)}}catch(e){console.error(`delete flow crashed:`,e)}})})}function ve(){return`
    <div class="empty-state">
      <div class="icon-wrap">${B(j,{size:28})}</div>
      <h2>No processes yet</h2>
      <p>Start your first process to see it here.</p>
      <button type="button" class="primary" id="empty-new-process-btn" style="width: auto; margin-top: 16px; display: inline-flex; align-items: center; gap: 8px;">
        ${B(A,{size:16})} New process
      </button>
    </div>
  `}function ye(e){return`
    <div class="process-grid">
      ${e.map(be).join(``)}
    </div>
  `}function be(e){return`
    <div class="process-card" data-id="${e.id}" style="cursor: pointer;">
      <div class="process-card-header">
        <div class="process-name">${B(j,{size:16})} ${e.name}</div>
        <span class="status-pill ${e.status}">${e.status}</span>
      </div>
      <div class="process-meta">${e.phone_masked} · ${e.client}</div>
      <div class="process-actions">
        ${e.status===`running`?`<button id="stop-${e.id}">${B(P,{size:14})} Stop</button>`:`<button id="start-${e.id}">${B(k,{size:14})} Start</button>`}
        <button id="delete-${e.id}">${B(L,{size:14})} Delete</button>
      </div>
    </div>
  `}function X(e){let t=e.replace(/-/g,`+`).replace(/_/g,`/`).padEnd(e.length+(4-e.length%4)%4,`=`),n=atob(t),r=new Uint8Array(n.length);for(let e=0;e<n.length;e++)r[e]=n.charCodeAt(e);return r.buffer}function Z(e){let t=new Uint8Array(e),n=``;return t.forEach(e=>n+=String.fromCharCode(e)),btoa(n).replace(/\+/g,`-`).replace(/\//g,`_`).replace(/=+$/,``)}async function xe(){let e=await fetch(`/api/webauthn/register/begin`,{method:`POST`,credentials:`include`,headers:{Authorization:`Bearer ${localStorage.getItem(`access_token`)}`}});if(!e.ok)throw Error(`Could not start passkey registration`);let t=await e.json(),n={...t.publicKey,challenge:X(t.publicKey.challenge),user:{...t.publicKey.user,id:X(t.publicKey.user.id)},excludeCredentials:t.publicKey.excludeCredentials?.map(e=>({...e,id:X(e.id)}))},r=await navigator.credentials.create({publicKey:n});if(!r)throw Error(`Passkey creation was cancelled`);let i=r.response;if(!(await fetch(`/api/webauthn/register/finish`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${localStorage.getItem(`access_token`)}`},credentials:`include`,body:JSON.stringify({id:r.id,rawId:Z(r.rawId),type:r.type,response:{attestationObject:Z(i.attestationObject),clientDataJSON:Z(i.clientDataJSON)}})})).ok)throw Error(`Failed to save passkey`)}function Q(){let e=document.getElementById(`app`);e.innerHTML=`
    <div class="auth-wrapper">
      <div class="auth-content">
        <div class="auth-logo">${B(D,{size:22})} wha-console</div>
        <h1>Add a <span class="gradient">passkey</span></h1>
        <p class="auth-subtitle">Sign in faster next time, no password needed.</p>
        <button type="button" class="primary" id="add-passkey">Add passkey</button>
        <button type="button" class="secondary" id="skip-passkey" style="margin-top: 12px;">Skip for now</button>
        <p id="passkey-error" class="error"></p>
      </div>
    </div>
  `,document.getElementById(`add-passkey`).addEventListener(`click`,async()=>{let e=document.getElementById(`passkey-error`);e.textContent=``;try{await xe(),n(`/dashboard`)}catch(t){e.textContent=t.message}}),document.getElementById(`skip-passkey`).addEventListener(`click`,()=>{n(`/dashboard`)})}function Se(){let e=document.getElementById(`app`);e.innerHTML=`
    <div class="notfound-wrapper">
      <div class="notfound-content">
        <div class="notfound-code">${B(R,{size:16})} Error 404</div>
        <h1><span class="gradient">404</span></h1>
        <p>This page doesn't exist, or the process you're looking for has already stopped.</p>
        <div class="notfound-actions">
          <button type="button" class="primary" id="go-home">
            ${B(w,{size:16})} Back to console
          </button>
        </div>
      </div>
    </div>
  `,document.getElementById(`go-home`).addEventListener(`click`,()=>{n(`/dashboard`)})}async function Ce(e){if(!await p()){n(`/login`);return}let t=document.getElementById(`app`);t.innerHTML=`<div class="dash-wrapper"><div class="dash-main"><p>Loading…</p></div></div>`;let r;try{r=await m.getProcess(e.id)}catch(e){t.innerHTML=`<div class="dash-wrapper"><div class="dash-main"><p class="error">${e.message}</p></div></div>`;return}let i=`console`,a=!0;function o(e=``){t.innerHTML=`
      <div class="dash-wrapper">
        <div class="detail-header">
          <button type="button" class="detail-back" id="back-btn">${B(w,{size:18})}</button>
          <div class="detail-title">${B(j,{size:18})} ${r.name}</div>
          <span class="status-pill ${r.status}">${r.status}</span>
          <div style="margin-left: auto; display: flex; gap: 8px;">
            ${r.status===`running`?`<button type="button" class="outline" id="detail-stop-btn">${B(P,{size:14})} Stop</button>`:`<button type="button" class="outline" id="detail-start-btn">${B(k,{size:14})} Start</button>`}
          </div>
        </div>

        <div class="detail-tabs">
          <button class="detail-tab ${i===`console`?`active`:``}" data-tab="console">
            ${B(F,{size:15})} Console
          </button>
          <button class="detail-tab ${i===`about`?`active`:``}" data-tab="about">
            ${B(ue,{size:15})} About
          </button>
          <button class="detail-tab ${i===`settings`?`active`:``}" data-tab="settings">
            ${B(M,{size:15})} Settings
          </button>
        </div>

        <div class="detail-body">
          ${i===`console`?we(e,a):i===`about`?De(r):Oe(r)}
        </div>
      </div>
    `,document.getElementById(`back-btn`).addEventListener(`click`,()=>n(`/dashboard`)),document.getElementById(`detail-start-btn`)?.addEventListener(`click`,async()=>{try{await v(String(r.id)),location.reload()}catch(e){K(e.message,`error`)}}),document.getElementById(`detail-stop-btn`)?.addEventListener(`click`,async()=>{try{await y(String(r.id)),location.reload()}catch(e){K(e.message,`error`)}}),document.querySelectorAll(`.detail-tab`).forEach(e=>{e.addEventListener(`click`,async()=>{i=e.dataset.tab,i===`console`?o(await $(r.id)):o()})}),i===`console`&&(Ee(e,r.name,r.id,async()=>{o(await $(r.id))}),document.getElementById(`wrap-toggle-btn`)?.addEventListener(`click`,()=>{a=!a,o(e)})),i===`settings`&&ke(r,()=>o())}$(r.id).then(e=>o(e))}async function $(e){try{return(await ie(String(e))).logs||``}catch{return``}}function we(e,t){let n=e.trim().length>0;return`
    <div class="console-toolbar">
      <button type="button" class="outline toolbar-toggle-btn ${t?`active`:``}" id="wrap-toggle-btn">
        ${B(I,{size:14})} Word wrap
      </button>
      <button type="button" class="outline" id="clear-logs-btn" ${n?``:`disabled`}>
        ${B(L,{size:14})} Clear logs
      </button>
      <button type="button" class="outline" id="save-logs-btn" ${n?``:`disabled`}>
        ${B(le,{size:14})} Save logs
      </button>
    </div>
    <div class="console-wrapper">
      <div class="console-output ${t?``:`nowrap`}" id="console-output">
        ${n?Te(e):`<span class="console-placeholder">No output yet — start the process to see logs here.</span>`}
      </div>
      <button type="button" class="jump-to-latest" id="jump-to-latest">
        ${B(C,{size:14})} Jump to latest
      </button>
    </div>
  `}function Te(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}function Ee(e,t,n,r){let i=document.getElementById(`console-output`),a=document.getElementById(`jump-to-latest`),o=document.getElementById(`save-logs-btn`);!i||!a||(i.scrollTop=i.scrollHeight,i.addEventListener(`scroll`,()=>{let e=i.scrollHeight-i.scrollTop-i.clientHeight<40;a.classList.toggle(`visible`,!e)}),a.addEventListener(`click`,()=>{i.scrollTo({top:i.scrollHeight,behavior:`smooth`})}),o?.addEventListener(`click`,()=>{let n=new Blob([e],{type:`text/plain`}),r=URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=`${t}-logs.txt`,i.click(),URL.revokeObjectURL(r)}),document.getElementById(`clear-logs-btn`)?.addEventListener(`click`,async()=>{if(await J({title:`Clear logs`,message:`Clear all logs for this process? This cannot be undone.`,confirmLabel:`Clear`,danger:!0}))try{await ae(String(n)),r()}catch(e){K(e.message,`error`)}}))}function De(e){return`
    <div class="about-placeholder">
      <div class="icon-wrap">${B(S,{size:28})}</div>
      <h2>Live session stats coming soon</h2>
      <p>Once the process is running, this tab will show real-time details from the session — connection status, message throughput, and more.</p>
    </div>
  `}function Oe(e){let t=!(e.has_run_before&&e.status!==`logged_out`);return`
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

      ${e.has_run_before?`
      <div class="settings-danger">
        <h3>Log out session</h3>
        <p>Stops the process (if running) and logs the session out of WhatsApp. Required before deleting.</p>
        <button type="button" class="outline" id="logout-session-btn" ${e.status===`logged_out`?`disabled`:``}>
          ${B(O,{size:14})} ${e.status===`logged_out`?`Logged out`:`Log out session`}
        </button>
      </div>`:``}

      <div class="settings-danger">
        <h3>Delete this process</h3>
        <p>${t?`This will permanently remove this process. This action cannot be undone.`:`Log out this session before it can be deleted.`}</p>
        <button type="button" class="danger" id="delete-process-btn" ${t?``:`disabled`}>
          ${B(L,{size:14})} Delete process
        </button>
      </div>
    </div>
  `}function ke(e,t){document.getElementById(`verbose-toggle`)?.addEventListener(`change`,async t=>{let n=t.target,r=n.checked;try{await g(String(e.id),{verbose:r}),e.verbose=r}catch(e){n.checked=!r,K(e.message,`error`)}}),document.getElementById(`skip-old-toggle`)?.addEventListener(`change`,async t=>{let n=t.target,r=n.checked,i=!r;try{await g(String(e.id),{no_skip_old:i}),e.no_skip_old=i}catch(e){n.checked=!r,K(e.message,`error`)}}),document.getElementById(`logout-session-btn`)?.addEventListener(`click`,async()=>{if(!await J({title:`Log out session`,message:`This will stop "${e.name}" if running, and log it out of WhatsApp. Continue?`,confirmLabel:`Log out`,danger:!0}))return;let n=q(`Logging out session…`);try{await oe(String(e.id)),n(),e.status=`logged_out`,t()}catch(e){n(),K(e.message,`error`)}}),document.getElementById(`delete-process-btn`)?.addEventListener(`click`,async()=>{if(!await J({title:`Delete process`,message:`Delete "${e.name}"? This cannot be undone.`,confirmLabel:`Delete`,danger:!0}))return;let t=q(`Deleting session…`);try{await _(String(e.id)),t(),n(`/dashboard`)}catch(e){t(),K(e.message,`error`)}}),document.getElementById(`verbose-toggle`)?.addEventListener(`change`,async t=>{let n=t.target,r=n.checked;try{let t=await g(String(e.id),{verbose:r});e.verbose=r,t.restarted?K(`Setting saved — process restarted`,`success`):t.warning&&K(t.warning,`error`)}catch(e){n.checked=!r,K(e.message,`error`)}}),document.getElementById(`skip-old-toggle`)?.addEventListener(`change`,async t=>{let n=t.target,r=n.checked,i=!r;try{let t=await g(String(e.id),{no_skip_old:i});e.no_skip_old=i,t.restarted?K(`Setting saved — process restarted`,`success`):t.warning&&K(t.warning,`error`)}catch(e){n.checked=!r,K(e.message,`error`)}})}t(`/login`,me),t(`/dashboard`,Y),t(`/passkey-prompt`,Q),t(`/processes/:id`,Ce),t(`/404`,Se);async function Ae(){let e=await p(),t=window.location.hash.slice(1);e&&(t===``||t===`/login`)&&n(`/dashboard`),!e&&t===`/dashboard`&&n(`/login`),a()}Ae();