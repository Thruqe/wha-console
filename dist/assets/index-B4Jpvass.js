(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[];function t(t,n){e.push({pattern:t,segments:t.split(`/`).filter(Boolean),handler:n})}function n(e){window.location.hash=e}function r(t){let n=t.split(`/`).filter(Boolean);for(let t of e){if(t.segments.length!==n.length)continue;let e={},r=!0;for(let i=0;i<t.segments.length;i++){let a=t.segments[i];if(a.startsWith(`:`))e[a.slice(1)]=n[i];else if(a!==n[i]){r=!1;break}}if(r)return{handler:t.handler,params:e}}return null}function i(){let t=r(window.location.hash.slice(1)||`/login`);t?t.handler(t.params):e.find(e=>e.pattern===`/404`)?.handler({})}function a(){window.addEventListener(`hashchange`,i),i()}function o(e){try{let t=e.split(`.`)[1],n=t.replace(/-/g,`+`).replace(/_/g,`/`).padEnd(t.length+(4-t.length%4)%4,`=`),r=JSON.parse(atob(n));return typeof r.exp==`number`?r.exp*1e3:null}catch{return null}}var s=`/api`,c=localStorage.getItem(`access_token`),l=c?o(c):null,u=0,d=3e5;function f(e){c=e,e?(localStorage.setItem(`access_token`,e),l=o(e)):(l=null,localStorage.removeItem(`access_token`))}function p(){return!!c&&!!l&&Date.now()<l}async function m(e,t={}){let n={"Content-Type":`application/json`,...t.headers};c&&(n.Authorization=`Bearer ${c}`);let r=await fetch(`${s}${e}`,{...t,headers:n,credentials:`include`}),i=await r.json().catch(()=>({}));if(!r.ok)throw Error(i.error||`Request failed: ${r.status}`);return i}async function ee(){try{let e=await fetch(`${s}/auth/refresh`,{method:`POST`,credentials:`include`});return e.ok?(f((await e.json()).access_token),!0):!1}catch{return!1}}async function h(){if(!(Date.now()-u>d)&&p())return!0;if(c)try{return await m(`/auth/me`),u=Date.now(),!0}catch{}return ee()}async function te(){try{await m(`/auth/logout`,{method:`POST`})}finally{f(null),u=0}}var g={signup:(e,t,n)=>m(`/auth/signup`,{method:`POST`,body:JSON.stringify({email:e,username:t,password:n})}),login:(e,t)=>m(`/auth/login`,{method:`POST`,body:JSON.stringify({email:e,username:e,password:t})}),listProcesses:()=>m(`/processes`),getProcess:e=>m(`/processes/${e}`)};function ne(e){return m(`/processes`,{method:`POST`,body:JSON.stringify(e)})}function _(e,t){return m(`/processes/${e}/settings`,{method:`PATCH`,body:JSON.stringify(t)})}function v(e){return m(`/processes/${e}`,{method:`DELETE`})}function re(e){return m(`/processes/${e}/run`,{method:`POST`})}function ie(e){return m(`/processes/${e}/stop`,{method:`POST`})}function ae(e){return m(`/processes/${e}/logs/clear`,{method:`POST`})}function oe(e){return m(`/processes/${e}/logout`,{method:`POST`})}function se(){return m(`/limits`)}function ce(e){return m(`/processes/${e}/waitlist`,{method:`DELETE`})}var le={xmlns:`http://www.w3.org/2000/svg`,width:24,height:24,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,"stroke-width":2,"stroke-linecap":`round`,"stroke-linejoin":`round`},ue=([e,t,n])=>{let r=document.createElementNS(`http://www.w3.org/2000/svg`,e);return Object.keys(t).forEach(e=>{r.setAttribute(e,String(t[e]))}),n?.length&&n.forEach(e=>{let t=ue(e);r.appendChild(t)}),r},de=(e,t={})=>ue([`svg`,{...le,...t},e]),fe=[[`path`,{d:`M12 5v14`}],[`path`,{d:`m19 12-7 7-7-7`}]],y=[[`path`,{d:`m12 19-7-7 7-7`}],[`path`,{d:`M19 12H5`}]],pe=[[`path`,{d:`M12 5v16`}],[`path`,{d:`M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z`}]],me=[[`path`,{d:`M5 21v-6`}],[`path`,{d:`M12 21V3`}],[`path`,{d:`M19 21V9`}]],he=[[`path`,{d:`M20 6 9 17l-5-5`}]],b=[[`circle`,{cx:`12`,cy:`12`,r:`10`}],[`path`,{d:`M12 6v6l4 2`}]],x=[[`path`,{d:`m16 18 6-6-6-6`}],[`path`,{d:`m8 6-6 6 6 6`}]],S=[[`rect`,{width:`14`,height:`14`,x:`8`,y:`8`,rx:`2`,ry:`2`}],[`path`,{d:`M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2`}]],ge=[[`ellipse`,{cx:`12`,cy:`5`,rx:`9`,ry:`3`}],[`path`,{d:`M3 5V19A9 3 0 0 0 21 19V5`}],[`path`,{d:`M3 12A9 3 0 0 0 21 12`}]],_e=[[`path`,{d:`M12 15V3`}],[`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`}],[`path`,{d:`m7 10 5 5 5-5`}]],ve=[[`path`,{d:`M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49`}],[`path`,{d:`M14.084 14.158a3 3 0 0 1-4.242-4.242`}],[`path`,{d:`M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143`}],[`path`,{d:`m2 2 20 20`}]],ye=[[`path`,{d:`M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0`}],[`circle`,{cx:`12`,cy:`12`,r:`3`}]],be=[[`path`,{d:`M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4`}],[`path`,{d:`M14 13.12c0 2.38 0 6.38-1 8.88`}],[`path`,{d:`M17.29 21.02c.12-.6.43-2.3.5-3.02`}],[`path`,{d:`M2 12a10 10 0 0 1 18-6`}],[`path`,{d:`M2 16h.01`}],[`path`,{d:`M21.8 16c.2-2 .131-5.354 0-6`}],[`path`,{d:`M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2`}],[`path`,{d:`M8.65 22c.21-.66.45-1.32.57-2`}],[`path`,{d:`M9 6.8a6 6 0 0 1 9 5.2v2`}]],C=[[`circle`,{cx:`12`,cy:`12`,r:`10`}],[`path`,{d:`M12 16v-4`}],[`path`,{d:`M12 8h.01`}]],xe=[[`path`,{d:`m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4`}],[`path`,{d:`m21 2-9.6 9.6`}],[`circle`,{cx:`7.5`,cy:`15.5`,r:`5.5`}]],w=[[`path`,{d:`M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z`}],[`path`,{d:`M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12`}],[`path`,{d:`M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17`}]],Se=[[`rect`,{width:`18`,height:`11`,x:`3`,y:`11`,rx:`2`,ry:`2`}],[`path`,{d:`M7 11V7a5 5 0 0 1 10 0v4`}]],T=[[`path`,{d:`m16 17 5-5-5-5`}],[`path`,{d:`M21 12H9`}],[`path`,{d:`M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4`}]],E=[[`path`,{d:`m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7`}],[`rect`,{x:`2`,y:`4`,width:`20`,height:`16`,rx:`2`}]],Ce=[[`path`,{d:`M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z`}]],we=[[`path`,{d:`M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384`}]],D=[[`path`,{d:`M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z`}]],O=[[`path`,{d:`M5 12h14`}],[`path`,{d:`M12 5v14`}]],Te=[[`rect`,{width:`5`,height:`5`,x:`3`,y:`3`,rx:`1`}],[`rect`,{width:`5`,height:`5`,x:`16`,y:`3`,rx:`1`}],[`rect`,{width:`5`,height:`5`,x:`3`,y:`16`,rx:`1`}],[`path`,{d:`M21 16h-3a2 2 0 0 0-2 2v3`}],[`path`,{d:`M21 21v.01`}],[`path`,{d:`M12 7v3a2 2 0 0 1-2 2H7`}],[`path`,{d:`M3 12h.01`}],[`path`,{d:`M12 3h.01`}],[`path`,{d:`M12 16v.01`}],[`path`,{d:`M16 12h1`}],[`path`,{d:`M21 12v.01`}],[`path`,{d:`M12 21v-1`}]],Ee=[[`path`,{d:`M16.247 7.761a6 6 0 0 1 0 8.478`}],[`path`,{d:`M19.075 4.933a10 10 0 0 1 0 14.134`}],[`path`,{d:`M4.925 19.067a10 10 0 0 1 0-14.134`}],[`path`,{d:`M7.753 16.239a6 6 0 0 1 0-8.478`}],[`circle`,{cx:`12`,cy:`12`,r:`2`}]],De=[[`path`,{d:`M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z`}],[`path`,{d:`m21.854 2.147-10.94 10.939`}]],k=[[`rect`,{width:`20`,height:`8`,x:`2`,y:`2`,rx:`2`,ry:`2`}],[`rect`,{width:`20`,height:`8`,x:`2`,y:`14`,rx:`2`,ry:`2`}],[`line`,{x1:`6`,x2:`6.01`,y1:`6`,y2:`6`}],[`line`,{x1:`6`,x2:`6.01`,y1:`18`,y2:`18`}]],Oe=[[`path`,{d:`M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915`}],[`circle`,{cx:`12`,cy:`12`,r:`3`}]],A=[[`path`,{d:`M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z`}],[`path`,{d:`m9 12 2 2 4-4`}]],ke=[[`path`,{d:`M10 8h4`}],[`path`,{d:`M12 21v-9`}],[`path`,{d:`M12 8V3`}],[`path`,{d:`M17 16h4`}],[`path`,{d:`M19 12V3`}],[`path`,{d:`M19 21v-5`}],[`path`,{d:`M3 14h4`}],[`path`,{d:`M5 10V3`}],[`path`,{d:`M5 21v-7`}]],Ae=[[`rect`,{width:`14`,height:`20`,x:`5`,y:`2`,rx:`2`,ry:`2`}],[`path`,{d:`M12 18h.01`}]],je=[[`rect`,{width:`18`,height:`18`,x:`3`,y:`3`,rx:`2`}]],j=[[`path`,{d:`M12 19h8`}],[`path`,{d:`m4 17 6-6-6-6`}]],Me=[[`path`,{d:`m16 16-3 3 3 3`}],[`path`,{d:`M3 12h14.5a1 1 0 0 1 0 7H13`}],[`path`,{d:`M3 19h6`}],[`path`,{d:`M3 5h18`}]],M=[[`path`,{d:`M10 11v6`}],[`path`,{d:`M14 11v6`}],[`path`,{d:`M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6`}],[`path`,{d:`M3 6h18`}],[`path`,{d:`M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2`}]],Ne=[[`path`,{d:`m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3`}],[`path`,{d:`M12 9v4`}],[`path`,{d:`M12 17h.01`}]],N=[[`path`,{d:`M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2`}],[`circle`,{cx:`12`,cy:`7`,r:`4`}]],P=[[`path`,{d:`M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2`}],[`path`,{d:`M16 3.128a4 4 0 0 1 0 7.744`}],[`path`,{d:`M22 21v-2a4 4 0 0 0-3-3.87`}],[`circle`,{cx:`9`,cy:`7`,r:`4`}]],F=[[`path`,{d:`M18 6 6 18`}],[`path`,{d:`m6 6 12 12`}]];function I(e,t={}){let n=de(e);return n.setAttribute(`width`,String(t.size??20)),n.setAttribute(`height`,String(t.size??20)),t.class&&n.setAttribute(`class`,t.class),n.outerHTML}function Pe(){let e=document.getElementById(`app`),t=`login`,r=!1;function i(){e.innerHTML=`
      <div class="auth-wrapper">
        <div class="auth-content">
          <div class="auth-logo">${I(j,{size:22})} wha-console</div>
          <h1>${t===`login`?`Welcome <span class="gradient">back</span>`:`Manage your <span class="gradient">processes</span>`}</h1>
          <p class="auth-subtitle">
            ${t===`login`?`Sign in to your console`:`Create an account to get started`}
          </p>

          <button type="button" id="passkey-btn" class="secondary">
            ${I(be,{size:18})} Sign in with a passkey
          </button>

          <div class="divider">or</div>

          <form id="auth-form">
            ${t===`signup`?`<div class="field">
                     <label for="username">Username</label>
                     <input type="text" id="username" placeholder="yourname" required />
                   </div>`:``}
           <div class="field">
  <label for="email">${t===`login`?`Email or Username`:`Email`}</label>
  <div class="input-icon-wrap">
    <span class="icon-left">${I(E,{size:16})}</span>
    <input type="${t===`login`?`text`:`email`}" id="email" class="has-icon" placeholder="${t===`login`?`your@email.com or username`:`your@email.com`}" required />
  </div>
</div>
<div class="field">
  <label for="password">Password</label>
  <div class="input-icon-wrap">
    <span class="icon-left">${I(Se,{size:16})}</span>
    <input type="${r?`text`:`password`}" id="password" class="has-icon" placeholder="••••••••" required />
    <button type="button" class="icon-toggle" id="toggle-password">
      ${I(r?ve:ye,{size:16})}
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
    `,document.getElementById(`toggle-mode`).addEventListener(`click`,e=>{e.preventDefault(),t=t===`login`?`signup`:`login`,r=!1,i()}),document.getElementById(`toggle-password`).addEventListener(`click`,()=>{let e=document.getElementById(`password`),t=document.getElementById(`toggle-password`);r=!r,e.type=r?`text`:`password`,t.innerHTML=I(r?ve:ye,{size:16})}),document.getElementById(`passkey-btn`).addEventListener(`click`,async()=>{let e=document.getElementById(`auth-error`);e.textContent=``;let t=prompt(`Enter your username to sign in with a passkey:`);if(t)try{await Fe(t),n(`/dashboard`)}catch(t){e.textContent=t.message}}),document.getElementById(`auth-form`).addEventListener(`submit`,async e=>{e.preventDefault();let r=document.getElementById(`auth-error`);r.textContent=``;let i=document.getElementById(`email`).value,a=document.getElementById(`password`).value;try{let e;if(t===`signup`){let t=document.getElementById(`username`).value;e=await g.signup(i,t,a),f(e.access_token),n(`/passkey-prompt`);return}e=await g.login(i,a),f(e.access_token),n(`/dashboard`),f(e.access_token),n(`/dashboard`)}catch(e){r.textContent=e.message}})}i()}async function Fe(e){let t=await fetch(`/api/webauthn/login/begin`,{method:`POST`,headers:{"Content-Type":`application/json`},credentials:`include`,body:JSON.stringify({username:e})});if(!t.ok)throw Error(`No passkey found for this user`);let n=Le((await t.json()).publicKey),r=await navigator.credentials.get({publicKey:n}),i=await fetch(`/api/webauthn/login/finish`,{method:`POST`,headers:{"Content-Type":`application/json`},credentials:`include`,body:JSON.stringify(Re(r))});if(!i.ok)throw Error(`Passkey authentication failed`);f((await i.json()).access_token)}function Ie(e){let t=e.replace(/-/g,`+`).replace(/_/g,`/`).padEnd(e.length+(4-e.length%4)%4,`=`),n=atob(t),r=new Uint8Array(n.length);for(let e=0;e<n.length;e++)r[e]=n.charCodeAt(e);return r.buffer}function L(e){let t=new Uint8Array(e),n=``;return t.forEach(e=>n+=String.fromCharCode(e)),btoa(n).replace(/\+/g,`-`).replace(/\//g,`_`).replace(/=+$/,``)}function Le(e){return{...e,challenge:Ie(e.challenge),allowCredentials:e.allowCredentials?.map(e=>({...e,id:Ie(e.id)}))}}function Re(e){let t=e.response;return{id:e.id,rawId:L(e.rawId),type:e.type,response:{authenticatorData:L(t.authenticatorData),clientDataJSON:L(t.clientDataJSON),signature:L(t.signature),userHandle:t.userHandle?L(t.userHandle):null}}}function R(e,t){let n=document.createElement(`div`);n.className=`modal-overlay`,n.innerHTML=`<div class="modal">${e}</div>`,document.body.appendChild(n);function r(){n.remove(),document.removeEventListener(`keydown`,i),t?.()}function i(e){e.key===`Escape`&&r()}return n.addEventListener(`click`,e=>{e.target===n&&r()}),document.addEventListener(`keydown`,i),n.__close=r,n}function z(e){e.__close?.()}function B(e,t=`error`){let n=document.createElement(`div`);n.className=`toast toast-${t}`,n.textContent=e,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add(`visible`)),setTimeout(()=>{n.classList.remove(`visible`),setTimeout(()=>n.remove(),200)},3500)}function V(e){let t=R(`
    <div class="modal-header">
      <h2>Create New Process</h2>
      <button type="button" class="modal-close" id="modal-close-btn">${I(F,{size:18})}</button>
    </div>
    <form id="process-form">
      <div class="modal-body">
        <div class="field">
          <label for="proc-name">Process Name</label>
          <input type="text" id="proc-name" placeholder="e.g. sales-bot" required />
        </div>

        <div class="field">
          <label for="proc-phone">Phone Number</label>
          <input type="tel" id="proc-phone" placeholder="e.g. 15550192834" required />
          <p class="field-hint">Enter session phone number in international format.</p>
        </div>

        <div class="field">
          <label>Auth Type</label>
          <div class="radio-group">
            <div class="radio-option">
              <input type="radio" name="auth-type" id="auth-pair" value="pair" checked />
              <label for="auth-pair">${I(Ae,{size:15})} Pair Code</label>
            </div>
            <div class="radio-option">
              <input type="radio" name="auth-type" id="auth-qr" value="qr" />
              <label for="auth-qr">${I(Te,{size:15})} QR Code</label>
            </div>
          </div>
        </div>

        <div class="field">
          <label>Client Engine</label>
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
          <label for="proc-db">Database DSN Connection</label>
          <div class="input-icon-wrap">
            <span class="icon-left">${I(ge,{size:16})}</span>
            <input type="text" id="proc-db" class="has-icon" placeholder="postgres://postgres:postgres@host:" required />
          </div>
          <p class="field-hint">PostgreSQL session database DSN.</p>
        </div>

        <p id="process-form-error" class="error"></p>
      </div>
      <div class="modal-footer">
        <button type="button" class="secondary" id="modal-cancel-btn">Cancel</button>
        <button type="submit" class="primary" id="proc-submit-btn" style="display: inline-flex; align-items: center; gap: 8px;">
          ${I(he,{size:16})} Done — Create Process
        </button>
      </div>
    </form>
  `);document.getElementById(`modal-close-btn`).addEventListener(`click`,()=>z(t)),document.getElementById(`modal-cancel-btn`).addEventListener(`click`,()=>z(t)),document.getElementById(`process-form`).addEventListener(`submit`,async n=>{n.preventDefault();let r=document.getElementById(`process-form-error`),i=document.getElementById(`proc-submit-btn`);r.textContent=``,i.disabled=!0;let a=document.getElementById(`proc-name`).value,o=document.getElementById(`proc-phone`).value,s=document.querySelector(`input[name="auth-type"]:checked`).value,c=document.querySelector(`input[name="client"]:checked`).value,l=document.getElementById(`proc-db`).value;try{await ne({name:a,phone_number:o,auth_type:s,client:c,database_url:l}),z(t),B(`Process "${a}" created successfully`,`success`),e()}catch(e){r.textContent=e.message,i.disabled=!1}})}function ze(){let e=R(`
    <div class="modal-header">
      <div style="display: flex; align-items: center; gap: 10px;">
        ${I(C,{size:20})}
        <div>
          <h2>About Console</h2>
          <p style="font-size: 12px; color: var(--text); font-weight: normal; margin-top: 2px;">
            High-Performance WhatsApp Session Management Console & API Engine
          </p>
        </div>
      </div>
      <button type="button" class="modal-close" id="about-modal-close-btn">${I(F,{size:18})}</button>
    </div>
    
    <div class="modal-body about-modal-body">
      <!-- Section 1: Engine Overview -->
      <div class="about-card">
        <div class="about-card-title">${I(j,{size:16})} Engine Overview</div>
        <p class="about-card-text">
          <code>wha-console</code> is a web session management system built with Go, Echo, WebAuthn passkeys, and PostgreSQL / Redis backends. It controls and monitors WhatsApp bot process workers operating over Protobuf binary WebSocket streams.
        </p>
        <div class="about-badge-grid">
          <span class="tech-badge">${I(x,{size:12})} Go 1.22+ & Echo</span>
          <span class="tech-badge">${I(Ee,{size:12})} Binary Protobuf WS</span>
          <span class="tech-badge">${I(ge,{size:12})} PostgreSQL & Redis</span>
          <span class="tech-badge">${I(A,{size:12})} WebAuthn / Passkeys</span>
        </div>
      </div>

      <!-- Section 2: Architecture & Capabilities -->
      <div class="about-card">
        <div class="about-card-title">${I(A,{size:16})} Console Capabilities</div>
        <div class="about-grid-2col">
          <div class="about-subbox">
            <h4>Process Management</h4>
            <ul>
              <li>Process group isolation with Pdeathsig cleanup</li>
              <li>Pairing Code & QR Code auth flows</li>
              <li>Real-time log streaming & clear/export</li>
            </ul>
          </div>
          <div class="about-subbox">
            <h4>Security & Privacy</h4>
            <ul>
              <li>JWT access tokens & HTTP-only refresh cookies</li>
              <li>FIDO2 WebAuthn Passkey integration</li>
              <li>Cookie consent controls & telemetry opting</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <button type="button" class="primary" id="about-modal-ok-btn">Got it</button>
    </div>
  `);document.getElementById(`about-modal-close-btn`)?.addEventListener(`click`,()=>z(e)),document.getElementById(`about-modal-ok-btn`)?.addEventListener(`click`,()=>z(e))}var Be=`wha_cookie_preferences`;function H(){try{let e=localStorage.getItem(Be);if(e){let t=JSON.parse(e);return{essential:!0,analytics:!!t.analytics,functional:!!t.functional,consentId:t.consentId||W(),hasChoice:!0}}}catch{}return{essential:!0,analytics:!1,functional:!1,consentId:W(),hasChoice:!1}}async function U(e,t){let n=W(),r={essential:!0,analytics:e,functional:t,consentId:n,hasChoice:!0};try{localStorage.setItem(Be,JSON.stringify(r))}catch{}try{await fetch(`/api/cookies/preference`,{method:`POST`,headers:{"Content-Type":`application/json`},credentials:`include`,body:JSON.stringify({consent_id:n,essential:!0,analytics:e,functional:t,marketing:!1})})}catch(e){console.warn(`Failed to sync cookie preferences with server:`,e)}return r}function W(){let e=``;try{e=localStorage.getItem(`wha_consent_id`)||``}catch{}if(!e){e=`c_`+Math.random().toString(36).substring(2,11)+Date.now().toString(36);try{localStorage.setItem(`wha_consent_id`,e)}catch{}}return e}async function G(e,t,n={}){let r=H();if(r.analytics)try{await fetch(`/api/telemetry/event`,{method:`POST`,headers:{"Content-Type":`application/json`},credentials:`include`,body:JSON.stringify({consent_id:r.consentId,event_type:e,event_name:t,page_url:window.location.href,metadata:n})})}catch{}}function Ve(){if(H().hasChoice)return;let e=document.createElement(`div`);e.className=`cookie-banner`,e.id=`cookie-banner-wrap`,e.innerHTML=`
    <div class="cookie-banner-content">
      <div class="cookie-banner-icon">${I(A,{size:24})}</div>
      <div class="cookie-banner-text">
        <h4>Cookie & Privacy Preferences</h4>
        <p>
          We use essential cookies to keep your session secure. With your consent, we also collect anonymized telemetry metrics to study and improve process control features.
        </p>
      </div>
      <div class="cookie-banner-actions">
        <button type="button" class="secondary" id="cookie-customize-btn">Customize</button>
        <button type="button" class="outline" id="cookie-essential-btn">Essential Only</button>
        <button type="button" class="primary" id="cookie-accept-all-btn">Accept All</button>
      </div>
    </div>
  `,document.body.appendChild(e),document.getElementById(`cookie-accept-all-btn`)?.addEventListener(`click`,async()=>{await U(!0,!0),e.remove(),B(`Preferences saved: Analytics & Telemetry enabled`,`success`),G(`consent_given`,`accept_all`)}),document.getElementById(`cookie-essential-btn`)?.addEventListener(`click`,async()=>{await U(!1,!1),e.remove(),B(`Preferences saved: Essential cookies only`,`success`)}),document.getElementById(`cookie-customize-btn`)?.addEventListener(`click`,()=>{e.remove(),K()})}function K(){let e=H(),t=R(`
    <div class="modal-header">
      <div style="display: flex; align-items: center; gap: 10px;">
        ${I(A,{size:20})}
        <div>
          <h2>Cookie & Telemetry Settings</h2>
          <p style="font-size: 12px; color: var(--text); font-weight: normal; margin-top: 2px;">
            Control data storage and usage tracking preferences
          </p>
        </div>
      </div>
      <button type="button" class="modal-close" id="cookie-modal-close">${I(F,{size:18})}</button>
    </div>

    <div class="modal-body">
      <div class="cookie-modal-row">
        <div class="cookie-row-info">
          <div class="cookie-row-title">
            <strong>Essential Cookies</strong>
            <span class="frozen-pill" style="font-size: 11px;">Required</span>
          </div>
          <p class="cookie-row-desc">
            Necessary for site authentication, passkeys, JWT sessions, and security protection. Cannot be turned off.
          </p>
        </div>
        <div class="toggle">
          <input type="checkbox" id="pref-essential" checked disabled />
          <label for="pref-essential"></label>
        </div>
      </div>

      <div class="cookie-modal-row">
        <div class="cookie-row-info">
          <div class="cookie-row-title">
            <strong>Usage Metrics & Telemetry</strong>
          </div>
          <p class="cookie-row-desc">
            Allows us to collect anonymized usage telemetry (page views, process actions) to study feature usage and improve system reliability.
          </p>
        </div>
        <div class="toggle">
          <input type="checkbox" id="pref-analytics" ${e.analytics?`checked`:``} />
          <label for="pref-analytics"></label>
        </div>
      </div>

      <div class="cookie-modal-row">
        <div class="cookie-row-info">
          <div class="cookie-row-title">
            <strong>Functional Preferences</strong>
          </div>
          <p class="cookie-row-desc">
            Remembers UI preference settings (such as console word-wrap and filter states) across visits.
          </p>
        </div>
        <div class="toggle">
          <input type="checkbox" id="pref-functional" ${e.functional?`checked`:``} />
          <label for="pref-functional"></label>
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <button type="button" class="secondary" id="cookie-modal-cancel">Cancel</button>
      <button type="button" class="primary" id="cookie-modal-save">Save Preferences</button>
    </div>
  `);document.getElementById(`cookie-modal-close`)?.addEventListener(`click`,()=>z(t)),document.getElementById(`cookie-modal-cancel`)?.addEventListener(`click`,()=>z(t)),document.getElementById(`cookie-modal-save`)?.addEventListener(`click`,async()=>{let e=document.getElementById(`pref-analytics`).checked,n=document.getElementById(`pref-functional`).checked;await U(e,n),z(t),B(`Cookie preferences updated`,`success`),e&&G(`consent_updated`,`analytics_enabled`)})}async function He(){let e={username:``,email:``,user_id:``};try{let t=await fetch(`/api/auth/me`,{headers:{Authorization:`Bearer ${localStorage.getItem(`access_token`)}`}});t.ok&&(e=await t.json())}catch{}let t=R(`
    <div class="modal-header">
      <div style="display: flex; align-items: center; gap: 10px;">
        ${I(N,{size:20})}
        <div>
          <h2>Account Settings</h2>
          <p style="font-size: 12px; color: var(--text); font-weight: normal; margin-top: 2px;">
            Manage your console user profile & credentials
          </p>
        </div>
      </div>
      <button type="button" class="modal-close" id="user-modal-close">${I(F,{size:18})}</button>
    </div>

    <form id="user-profile-form">
      <div class="modal-body">
        <div class="field">
          <label for="profile-username">Username</label>
          <div class="input-icon-wrap">
            <span class="icon-left">${I(N,{size:16})}</span>
            <input type="text" id="profile-username" class="has-icon" value="${e.username||``}" required />
          </div>
        </div>

        <div class="field">
          <label for="profile-email">Email Address</label>
          <div class="input-icon-wrap">
            <span class="icon-left">${I(E,{size:16})}</span>
            <input type="email" id="profile-email" class="has-icon" value="${e.email||``}" required />
          </div>
        </div>

        <div class="field">
          <label for="profile-password">New Password (leave blank to keep current)</label>
          <div class="input-icon-wrap">
            <span class="icon-left">${I(Se,{size:16})}</span>
            <input type="password" id="profile-password" class="has-icon" placeholder="••••••••" />
          </div>
        </div>

        <p id="user-profile-error" class="error"></p>
      </div>

      <div class="modal-footer" style="justify-content: space-between;">
        <button type="button" class="outline" id="user-modal-logout-btn" style="color: #e5484d; border-color: rgba(229,72,77,0.4);">
          ${I(T,{size:14})} Sign Out
        </button>
        <div style="display: flex; gap: 10px;">
          <button type="button" class="secondary" id="user-modal-cancel">Cancel</button>
          <button type="submit" class="primary">Save Changes</button>
        </div>
      </div>
    </form>
  `);document.getElementById(`user-modal-close`)?.addEventListener(`click`,()=>z(t)),document.getElementById(`user-modal-cancel`)?.addEventListener(`click`,()=>z(t)),document.getElementById(`user-modal-logout-btn`)?.addEventListener(`click`,async()=>{z(t),await te(),n(`/login`)}),document.getElementById(`user-profile-form`)?.addEventListener(`submit`,async e=>{e.preventDefault();let n=document.getElementById(`user-profile-error`);n.textContent=``;let r=document.getElementById(`profile-username`).value,i=document.getElementById(`profile-email`).value,a=document.getElementById(`profile-password`).value;try{let e=await fetch(`/api/auth/profile`,{method:`PATCH`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${localStorage.getItem(`access_token`)}`},body:JSON.stringify({username:r,email:i,new_password:a})});if(!e.ok){let t=await e.json();throw Error(t.error||`Failed to update profile`)}z(t),B(`Account settings updated successfully`,`success`)}catch(e){n.textContent=e.message}})}function q(e=`Loading...`){return`
    <div class="inline-spinner-container">
      <div class="loading-spinner"></div>
      <p class="inline-spinner-text">${e}</p>
    </div>
  `}function J(e){let t=document.createElement(`div`);return t.className=`loading-overlay`,t.innerHTML=`
    <div class="loading-spinner"></div>
    <p>${e}</p>
  `,document.body.appendChild(t),()=>t.remove()}function Y(e){return new Promise(t=>{let n=!1,r=R(`
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
    `,()=>{n||(n=!0,t(!1))});document.getElementById(`confirm-cancel`).addEventListener(`click`,()=>{n=!0,z(r),t(!1)}),document.getElementById(`confirm-ok`).addEventListener(`click`,()=>{n=!0,z(r),t(!0)})})}async function X(){if(!await h()){n(`/login`);return}G(`page_view`,`dashboard`);let e=document.getElementById(`app`);e.innerHTML=`<div class="dash-wrapper"><div class="dash-main">${q(`Loading processes & system metrics...`)}</div></div>`;let t=[],r=null;try{let[e,n]=await Promise.all([g.listProcesses(),se().catch(()=>null)]);t=e,r=n}catch(t){e.innerHTML=`<div class="dash-wrapper"><div class="dash-main"><p class="error">Failed to load dashboard: ${t.message}</p></div></div>`;return}e.innerHTML=`
    <div class="dash-wrapper">
      <div class="dash-header">
        <div class="dash-logo">${I(j,{size:20})} wha-console</div>
        <div class="dash-header-actions">
          <button type="button" class="icon-btn" id="api-docs-btn" title="API Keys & Developer Docs">
            ${I(x,{size:16})}
          </button>
          <button type="button" class="icon-btn" id="user-settings-btn" title="User Account Settings">
            ${I(N,{size:16})}
          </button>
          <button type="button" class="icon-btn" id="cookie-pref-btn" title="Cookie & Privacy Settings">
            ${I(A,{size:16})}
          </button>
          <button type="button" class="icon-btn" id="about-btn" title="About Console">
            ${I(C,{size:16})}
          </button>
          <button type="button" class="icon-btn" id="logout-btn" title="Log out of Console">
            ${I(T,{size:16})}
          </button>
        </div>
      </div>

      <div class="dash-main">
        ${r?Ue(r):``}

        <div class="dash-title-row">
          <div>
            <h2>Processes</h2>
            <p>Manage running processes across your account</p>
          </div>
          <button type="button" class="primary" id="new-process-btn" style="width: auto; display: flex; align-items: center; gap: 8px;">
            ${I(O,{size:16})} New process
          </button>
        </div>

        ${t.length===0?We():Ge(t)}
      </div>
    </div>
  `,document.getElementById(`api-docs-btn`).addEventListener(`click`,()=>{n(`/api-docs`)}),document.getElementById(`user-settings-btn`).addEventListener(`click`,()=>{He()}),document.getElementById(`cookie-pref-btn`).addEventListener(`click`,()=>{K()}),document.getElementById(`about-btn`).addEventListener(`click`,()=>{ze()}),document.getElementById(`logout-btn`).addEventListener(`click`,async()=>{await te(),n(`/login`)}),document.getElementById(`new-process-btn`).addEventListener(`click`,()=>{V(()=>X())}),document.getElementById(`empty-new-process-btn`)?.addEventListener(`click`,()=>{V(()=>X())}),t.forEach(e=>{document.querySelector(`.process-card[data-id="${e.id}"]`)?.addEventListener(`click`,()=>n(`/processes/${e.id}`)),document.getElementById(`start-${e.id}`)?.addEventListener(`click`,async t=>{t.stopPropagation();let n=t.currentTarget;n.disabled=!0;try{await re(String(e.id)),B(`Process started`,`success`),X()}catch(e){let t=e.message;B(t,`error`),n.disabled=!1,X()}}),document.getElementById(`cancel-waitlist-${e.id}`)?.addEventListener(`click`,async t=>{t.stopPropagation();let n=t.currentTarget;n.disabled=!0;try{await ce(String(e.id)),B(`Removed from waitlist`,`info`),X()}catch(e){B(e.message,`error`),n.disabled=!1}}),document.getElementById(`stop-${e.id}`)?.addEventListener(`click`,async t=>{t.stopPropagation();let n=t.currentTarget;n.disabled=!0;try{await ie(String(e.id)),X()}catch(e){B(e.message,`error`),n.disabled=!1}}),document.getElementById(`delete-${e.id}`)?.addEventListener(`click`,async t=>{t.stopPropagation();try{if(!await Y({title:`Delete process`,message:`Delete "${e.name}"? This cannot be undone.`,confirmLabel:`Delete`,danger:!0}))return;let t=J(`Deleting session…`);try{await v(String(e.id)),t(),X()}catch(e){t(),B(e.message,`error`)}}catch(e){console.error(`delete flow crashed:`,e)}})})}function Ue(e){let t=(e.used_ram_mb/1024).toFixed(1),n=(e.total_ram_mb/1024).toFixed(1),r=e.available_ram_mb;return`
    <div class="limits-card ${e.limit_reached?`limit-active`:``}">
      <div class="limits-header">
        <div class="limits-title">
          ${I(k,{size:18})}
          <span>System Memory & Process Limits</span>
          ${e.limit_reached?`<span class="limit-badge-alert">Limit Reached</span>`:`<span class="limit-badge-ok">Optimal</span>`}
        </div>
        <div class="limits-meta">
          <span>Allocation: <strong>${e.ram_per_process_mb} MB</strong> / whatsrook</span>
        </div>
      </div>
      
      <div class="limits-grid">
        <div class="limits-stat-item">
          <span class="stat-label">RAM Usage</span>
          <div class="stat-value-row">
            <strong>${t} GB / ${n} GB</strong>
            <small>(${r} MB Free)</small>
          </div>
          <div class="ram-bar-track">
            <div class="ram-bar-fill" style="width: ${Math.min(100,e.used_ram_percent)}%;"></div>
          </div>
        </div>

        <div class="limits-stat-item">
          <span class="stat-label">Active Processes</span>
          <div class="stat-value-row">
            <strong>${e.running_processes} / ${e.max_allowed_processes}</strong>
            <small>Max Allowed</small>
          </div>
          <div class="ram-bar-track">
            <div class="ram-bar-fill processes-fill" style="width: ${Math.min(100,e.running_processes/e.max_allowed_processes*100)}%;"></div>
          </div>
        </div>

        <div class="limits-stat-item">
          <span class="stat-label">Waitlist Queue</span>
          <div class="stat-value-row">
            <strong>${e.waitlist_count}</strong>
            <small>In Queue</small>
          </div>
        </div>
      </div>

      ${e.limit_reached?`
        <div class="limits-notice">
          ${e.message||`server limit reached, please we aren't able to provide enough services to run your session, we are working to increase usage limits for everyone`}
        </div>
      `:``}
    </div>
  `}function We(){return`
    <div class="empty-state">
      <div class="icon-wrap">${I(k,{size:28})}</div>
      <h2>No processes yet</h2>
      <p>Start your first process to see it here.</p>
      <button type="button" class="primary" id="empty-new-process-btn" style="width: auto; margin-top: 16px; display: inline-flex; align-items: center; gap: 8px;">
        ${I(O,{size:16})} New process
      </button>
    </div>
  `}function Ge(e){return`
    <div class="process-grid">
      ${e.map(Ke).join(``)}
    </div>
  `}function Ke(e){let t=e.status===`queued`,n=t&&e.waitlist_position?`Queued #${e.waitlist_position}`:e.status;return`
    <div class="process-card ${t?`card-queued`:``}" data-id="${e.id}" style="cursor: pointer;">
      <div class="process-card-header">
        <div class="process-name">${I(k,{size:16})} ${e.name}</div>
        <span class="status-pill ${e.status}">${n}</span>
      </div>
      <div class="process-meta">${e.phone_masked} · ${e.client}</div>
      <div class="process-actions">
        ${e.status===`running`?`<button id="stop-${e.id}">${I(je,{size:14})} Stop</button>`:t?`<button id="cancel-waitlist-${e.id}" class="btn-warning">${I(b,{size:14})} Leave Queue</button>`:`<button id="start-${e.id}">${I(D,{size:14})} Start</button>`}
        <button id="delete-${e.id}">${I(M,{size:14})} Delete</button>
      </div>
    </div>
  `}function Z(e){let t=e.replace(/-/g,`+`).replace(/_/g,`/`).padEnd(e.length+(4-e.length%4)%4,`=`),n=atob(t),r=new Uint8Array(n.length);for(let e=0;e<n.length;e++)r[e]=n.charCodeAt(e);return r.buffer}function Q(e){let t=new Uint8Array(e),n=``;return t.forEach(e=>n+=String.fromCharCode(e)),btoa(n).replace(/\+/g,`-`).replace(/\//g,`_`).replace(/=+$/,``)}async function qe(){let e=await fetch(`/api/webauthn/register/begin`,{method:`POST`,credentials:`include`,headers:{Authorization:`Bearer ${localStorage.getItem(`access_token`)}`}});if(!e.ok)throw Error(`Could not start passkey registration`);let t=await e.json(),n={...t.publicKey,challenge:Z(t.publicKey.challenge),user:{...t.publicKey.user,id:Z(t.publicKey.user.id)},excludeCredentials:t.publicKey.excludeCredentials?.map(e=>({...e,id:Z(e.id)}))},r=await navigator.credentials.create({publicKey:n});if(!r)throw Error(`Passkey creation was cancelled`);let i=r.response;if(!(await fetch(`/api/webauthn/register/finish`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${localStorage.getItem(`access_token`)}`},credentials:`include`,body:JSON.stringify({id:r.id,rawId:Q(r.rawId),type:r.type,response:{attestationObject:Q(i.attestationObject),clientDataJSON:Q(i.clientDataJSON)}})})).ok)throw Error(`Failed to save passkey`)}function Je(){let e=document.getElementById(`app`);e.innerHTML=`
    <div class="auth-wrapper">
      <div class="auth-content">
        <div class="auth-logo">${I(be,{size:22})} wha-console</div>
        <h1>Add a <span class="gradient">passkey</span></h1>
        <p class="auth-subtitle">Sign in faster next time, no password needed.</p>
        <button type="button" class="primary" id="add-passkey">Add passkey</button>
        <button type="button" class="secondary" id="skip-passkey" style="margin-top: 12px;">Skip for now</button>
        <p id="passkey-error" class="error"></p>
      </div>
    </div>
  `,document.getElementById(`add-passkey`).addEventListener(`click`,async()=>{let e=document.getElementById(`passkey-error`);e.textContent=``;try{await qe(),n(`/dashboard`)}catch(t){e.textContent=t.message}}),document.getElementById(`skip-passkey`).addEventListener(`click`,()=>{n(`/dashboard`)})}function Ye(){let e=document.getElementById(`app`);e.innerHTML=`
    <div class="notfound-wrapper">
      <div class="notfound-content">
        <div class="notfound-code">${I(Ne,{size:16})} Error 404</div>
        <h1><span class="gradient">404</span></h1>
        <p>This page doesn't exist, or the process you're looking for has already stopped.</p>
        <div class="notfound-actions">
          <button type="button" class="primary" id="go-home">
            ${I(y,{size:16})} Back to console
          </button>
        </div>
      </div>
    </div>
  `,document.getElementById(`go-home`).addEventListener(`click`,()=>{n(`/dashboard`)})}function Xe(e=[]){let t=e.length>0,n=R(`
    <div class="modal-header">
      <div style="display: flex; align-items: center; gap: 10px;">
        ${I(P,{size:20})}
        <div>
          <h2>Joined Groups</h2>
          <p style="font-size: 12px; color: var(--text); font-weight: normal; margin-top: 2px;">
            Current WhatsApp groups this bot has joined
          </p>
        </div>
      </div>
      <button type="button" class="modal-close" id="groups-modal-close">${I(F,{size:18})}</button>
    </div>

    <div class="modal-body">
      ${t?`
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${e.map((e,t)=>`
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg);">
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <strong style="color: var(--text-h); font-size: 14px;">${e.name}</strong>
                <span style="font-size: 12px; color: var(--text);">${e.membersCount} members · ${e.isSuperAdmin?`Super Admin`:e.isAdmin?`Admin`:`Member`}${e.isLocked?` · 🔒 Locked`:``}</span>
              </div>
              <button type="button" class="icon-btn" id="group-info-btn-${t}" title="View Group Details">
                ${I(C,{size:16})}
              </button>
            </div>
          `).join(``)}
        </div>
      `:`
        <p style="text-align: center; color: var(--text); padding: 24px 0; margin: 0; font-style: italic;">
          No joined groups found for this session.
        </p>
      `}
    </div>

    <div class="modal-footer">
      <button type="button" class="primary" id="groups-modal-ok">Close</button>
    </div>
  `);document.getElementById(`groups-modal-close`)?.addEventListener(`click`,()=>z(n)),document.getElementById(`groups-modal-ok`)?.addEventListener(`click`,()=>z(n)),e.forEach((e,t)=>{document.getElementById(`group-info-btn-${t}`)?.addEventListener(`click`,()=>{Ze(e)})})}function Ze(e){let t=R(`
    <div class="modal-header">
      <div style="display: flex; align-items: center; gap: 10px;">
        ${I(P,{size:20})}
        <div>
          <h2>Group Details</h2>
          <p style="font-size: 12px; color: var(--text); font-weight: normal; margin-top: 2px;">
            ${e.name}
          </p>
        </div>
      </div>
      <button type="button" class="modal-close" id="group-detail-close">${I(F,{size:18})}</button>
    </div>

    <div class="modal-body">
      <div class="info-rows-list">
        <div class="info-row">
          <span class="info-row-label">Group Name</span>
          <span class="info-row-value">${e.name}</span>
        </div>
        <div class="info-row">
          <span class="info-row-label">Group JID</span>
          <span class="info-row-value" style="font-family: var(--mono); font-size: 12px; display: flex; align-items: center; gap: 6px;">
            ${e.jid}
            <button type="button" class="icon-btn-sm" id="copy-group-jid" title="Copy JID">${I(S,{size:12})}</button>
          </span>
        </div>
        <div class="info-row">
          <span class="info-row-label">Total Members</span>
          <span class="info-row-value">${e.membersCount} participants</span>
        </div>
        <div class="info-row">
          <span class="info-row-label">Bot Role</span>
          <span class="frozen-pill">${e.isSuperAdmin?`Super Admin`:e.isAdmin?`Admin`:`Member`}</span>
        </div>
        <div class="info-row">
          <span class="info-row-label">Send Messages</span>
          <span class="frozen-pill">${e.isLocked?`Admins only 🔒`:`All members`}</span>
        </div>
        ${e.ownerJid?`
        <div class="info-row">
          <span class="info-row-label">Owner JID</span>
          <span class="info-row-value" style="font-family: var(--mono); font-size: 12px;">${e.ownerJid}</span>
        </div>`:``}
        <div class="info-row">
          <span class="info-row-label">Created Date</span>
          <span class="info-row-value">${e.createdAt}</span>
        </div>
      </div>

      ${e.description?`
      <div style="background: var(--code-bg); border: 1px solid var(--border); border-radius: 6px; padding: 12px; margin-top: 10px;">
        <strong style="font-size: 12px; color: var(--text-h); display: block; margin-bottom: 4px;">Description</strong>
        <p style="font-size: 13px; color: var(--text); margin: 0; white-space: pre-wrap;">${e.description}</p>
      </div>`:``}
    </div>

    <div class="modal-footer">
      <button type="button" class="primary" id="group-detail-ok">Close</button>
    </div>
  `);document.getElementById(`group-detail-close`)?.addEventListener(`click`,()=>z(t)),document.getElementById(`group-detail-ok`)?.addEventListener(`click`,()=>z(t)),document.getElementById(`copy-group-jid`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(e.jid).then(()=>{B(`Group JID copied to clipboard`,`success`)})})}function Qe(e=[]){let t=e.length>0,n=R(`
    <div class="modal-header">
      <div style="display: flex; align-items: center; gap: 10px;">
        ${I(N,{size:20})}
        <div>
          <h2>Saved Contacts</h2>
          <p style="font-size: 12px; color: var(--text); font-weight: normal; margin-top: 2px;">
            Synced WhatsApp contacts
          </p>
        </div>
      </div>
      <button type="button" class="modal-close" id="contacts-modal-close">${I(F,{size:18})}</button>
    </div>

    <div class="modal-body">
      ${t?`
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${e.map((e,t)=>`
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg);">
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <strong style="color: var(--text-h); font-size: 14px;">${e.pushName}</strong>
                <span style="font-size: 12px; color: var(--text); font-family: var(--mono);">${e.phoneNumber}</span>
              </div>
              <button type="button" class="icon-btn" id="contact-info-btn-${t}" title="View Contact Details">
                ${I(C,{size:16})}
              </button>
            </div>
          `).join(``)}
        </div>
      `:`
        <p style="text-align: center; color: var(--text); padding: 24px 0; margin: 0; font-style: italic;">
          No saved contacts found for this session.
        </p>
      `}
    </div>

    <div class="modal-footer">
      <button type="button" class="primary" id="contacts-modal-ok">Close</button>
    </div>
  `);document.getElementById(`contacts-modal-close`)?.addEventListener(`click`,()=>z(n)),document.getElementById(`contacts-modal-ok`)?.addEventListener(`click`,()=>z(n)),e.forEach((e,t)=>{document.getElementById(`contact-info-btn-${t}`)?.addEventListener(`click`,()=>{$e(e)})})}function $e(e){let t=R(`
    <div class="modal-header">
      <div style="display: flex; align-items: center; gap: 10px;">
        ${I(N,{size:20})}
        <div>
          <h2>Contact Details</h2>
          <p style="font-size: 12px; color: var(--text); font-weight: normal; margin-top: 2px;">
            ${e.pushName}
          </p>
        </div>
      </div>
      <button type="button" class="modal-close" id="contact-detail-close">${I(F,{size:18})}</button>
    </div>

    <div class="modal-body">
      <div class="info-rows-list">
        <div class="info-row">
          <span class="info-row-label">Push Name</span>
          <span class="info-row-value">${e.pushName}</span>
        </div>
        <div class="info-row">
          <span class="info-row-label">Phone Number</span>
          <span class="info-row-value">${e.phoneNumber}</span>
        </div>
        <div class="info-row">
          <span class="info-row-label">JID</span>
          <span class="info-row-value" style="font-family: var(--mono); font-size: 12px; display: flex; align-items: center; gap: 6px;">
            ${e.jid}
            <button type="button" class="icon-btn-sm" id="copy-contact-jid" title="Copy JID">${I(S,{size:12})}</button>
          </span>
        </div>
        <div class="info-row">
          <span class="info-row-label">Status</span>
          <span class="frozen-pill">${e.status}</span>
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <button type="button" class="primary" id="contact-detail-ok">Close</button>
    </div>
  `);document.getElementById(`contact-detail-close`)?.addEventListener(`click`,()=>z(t)),document.getElementById(`contact-detail-ok`)?.addEventListener(`click`,()=>z(t)),document.getElementById(`copy-contact-jid`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(e.jid).then(()=>{B(`Contact JID copied to clipboard`,`success`)})})}function et(e=[]){let t=e.length>0,n=R(`
    <div class="modal-header">
      <div style="display: flex; align-items: center; gap: 10px;">
        ${I(w,{size:20})}
        <div>
          <h2>Joined Communities</h2>
          <p style="font-size: 12px; color: var(--text); font-weight: normal; margin-top: 2px;">
            WhatsApp Community umbrellas
          </p>
        </div>
      </div>
      <button type="button" class="modal-close" id="communities-modal-close">${I(F,{size:18})}</button>
    </div>

    <div class="modal-body">
      ${t?`
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${e.map((e,t)=>`
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg);">
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <strong style="color: var(--text-h); font-size: 14px;">${e.name}</strong>
                <span style="font-size: 12px; color: var(--text);">${e.subGroupsCount} linked groups · ${e.totalMembers} members</span>
              </div>
              <button type="button" class="icon-btn" id="community-info-btn-${t}" title="View Community Details">
                ${I(C,{size:16})}
              </button>
            </div>
          `).join(``)}
        </div>
      `:`
        <p style="text-align: center; color: var(--text); padding: 24px 0; margin: 0; font-style: italic;">
          No communities found for this session.
        </p>
      `}
    </div>

    <div class="modal-footer">
      <button type="button" class="primary" id="communities-modal-ok">Close</button>
    </div>
  `);document.getElementById(`communities-modal-close`)?.addEventListener(`click`,()=>z(n)),document.getElementById(`communities-modal-ok`)?.addEventListener(`click`,()=>z(n)),e.forEach((e,t)=>{document.getElementById(`community-info-btn-${t}`)?.addEventListener(`click`,()=>{tt(e)})})}function tt(e){let t=R(`
    <div class="modal-header">
      <div style="display: flex; align-items: center; gap: 10px;">
        ${I(w,{size:20})}
        <div>
          <h2>Community Details</h2>
          <p style="font-size: 12px; color: var(--text); font-weight: normal; margin-top: 2px;">
            ${e.name}
          </p>
        </div>
      </div>
      <button type="button" class="modal-close" id="community-detail-close">${I(F,{size:18})}</button>
    </div>

    <div class="modal-body">
      <div class="info-rows-list">
        <div class="info-row">
          <span class="info-row-label">Community Name</span>
          <span class="info-row-value">${e.name}</span>
        </div>
        <div class="info-row">
          <span class="info-row-label">Community JID</span>
          <span class="info-row-value" style="font-family: var(--mono); font-size: 12px; display: flex; align-items: center; gap: 6px;">
            ${e.jid}
            <button type="button" class="icon-btn-sm" id="copy-community-jid" title="Copy JID">${I(S,{size:12})}</button>
          </span>
        </div>
        <div class="info-row">
          <span class="info-row-label">Linked Sub-Groups</span>
          <span class="info-row-value">${e.subGroupsCount} group${e.subGroupsCount===1?``:`s`}</span>
        </div>
        <div class="info-row">
          <span class="info-row-label">Total Members</span>
          <span class="info-row-value">${e.totalMembers} members</span>
        </div>
      </div>

      ${e.description?`
      <div style="background: var(--code-bg); border: 1px solid var(--border); border-radius: 6px; padding: 12px; margin-top: 10px;">
        <strong style="font-size: 12px; color: var(--text-h); display: block; margin-bottom: 4px;">Description</strong>
        <p style="font-size: 13px; color: var(--text); margin: 0; white-space: pre-wrap;">${e.description}</p>
      </div>`:``}
    </div>

    <div class="modal-footer">
      <button type="button" class="primary" id="community-detail-ok">Close</button>
    </div>
  `);document.getElementById(`community-detail-close`)?.addEventListener(`click`,()=>z(t)),document.getElementById(`community-detail-ok`)?.addEventListener(`click`,()=>z(t)),document.getElementById(`copy-community-jid`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(e.jid).then(()=>{B(`Community JID copied to clipboard`,`success`)})})}async function nt(e){if(!await h()){n(`/login`);return}let t=document.getElementById(`app`);t.innerHTML=`<div class="dash-wrapper"><div class="dash-main">${q(`Loading session details...`)}</div></div>`;let r;try{r=await g.getProcess(e.id)}catch(e){t.innerHTML=`<div class="dash-wrapper"><div class="dash-main"><p class="error">${e.message}</p></div></div>`;return}let i=`console`,a=!0,o=null,s=null;function c(){s&&=(s.abort(),null)}let l=()=>{c(),window.removeEventListener(`hashchange`,l)};window.addEventListener(`hashchange`,l);function u(){c(),s=new AbortController;let e=localStorage.getItem(`access_token`);e&&fetch(`/api/processes/${r.id}/logs/stream`,{headers:{Authorization:`Bearer ${e}`},signal:s.signal}).then(async e=>{if(!e.ok||!e.body)return;let t=e.body.getReader(),n=new TextDecoder,r=``;try{for(;;){let{done:e,value:i}=await t.read();if(e)break;r+=n.decode(i,{stream:!0});let a=r.split(`

`);r=a.pop()||``;for(let e of a)if(e.trim()){if(e.includes(`event: clear`)){let e=document.getElementById(`console-output`);e&&(e.innerHTML=`<span class="console-placeholder">No output yet — start the process to see logs here.</span>`);continue}for(let t of e.split(`
`))if(t.startsWith(`data: `))try{let e=JSON.parse(t.slice(6));e.text&&rt(e.text)}catch{rt(t.slice(6))}}}}catch(e){e.name!==`AbortError`&&console.error(`Log stream error:`,e)}}).catch(()=>{})}async function d(){try{let e=await fetch(`/api/processes/${r.id}/stats`,{headers:{Authorization:`Bearer ${localStorage.getItem(`access_token`)}`}});e.ok&&(o=await e.json())}catch{}}async function f(){t.innerHTML=`
      <div class="dash-wrapper">
        <div class="detail-header">
          <button type="button" class="detail-back" id="back-btn" title="Back to processes">${I(y,{size:18})}</button>
          <div class="detail-title">${I(k,{size:18})} ${r.name}</div>
          <span class="status-pill ${r.status}">
            ${r.status===`queued`&&r.waitlist_position?`Queued #${r.waitlist_position}`:r.status}
          </span>
          <div style="margin-left: auto; display: flex; gap: 8px;">
            ${r.status===`running`?`<button type="button" class="outline" id="detail-stop-btn">${I(je,{size:14})} Stop</button>`:r.status===`queued`?`<button type="button" class="outline btn-warning" id="detail-cancel-waitlist-btn">${I(b,{size:14})} Leave Queue</button>`:`<button type="button" class="outline" id="detail-start-btn">${I(D,{size:14})} Start</button>`}
          </div>
        </div>

        <div class="detail-tabs">
          <button class="detail-tab ${i===`console`?`active`:``}" data-tab="console">
            ${I(j,{size:15})} Console
          </button>
          <button class="detail-tab ${i===`about`?`active`:``}" data-tab="about">
            ${I(N,{size:15})} About Bot
          </button>
          <button class="detail-tab ${i===`settings`?`active`:``}" data-tab="settings">
            ${I(Oe,{size:15})} Settings
          </button>
        </div>

        <div class="detail-body">
          ${i===`console`?it(``,a):i===`about`?st(r,o):lt(r)}
        </div>
      </div>
    `,document.getElementById(`back-btn`).addEventListener(`click`,()=>{c(),n(`/dashboard`)}),document.getElementById(`detail-start-btn`)?.addEventListener(`click`,async()=>{try{await re(String(r.id)),B(`Process started`,`success`),location.reload()}catch(e){B(e.message,`error`),location.reload()}}),document.getElementById(`detail-cancel-waitlist-btn`)?.addEventListener(`click`,async()=>{try{await ce(String(r.id)),B(`Removed from waitlist`,`info`),location.reload()}catch(e){B(e.message,`error`)}}),document.getElementById(`detail-stop-btn`)?.addEventListener(`click`,async()=>{try{await ie(String(r.id)),location.reload()}catch(e){B(e.message,`error`)}}),document.querySelectorAll(`.detail-tab`).forEach(e=>{e.addEventListener(`click`,async()=>{c(),i=e.dataset.tab,i===`console`||i===`about`&&(o||await d()),f()})}),i===`console`?(ot(``,r.name,r.id,async()=>{let e=document.getElementById(`console-output`);e&&(e.innerHTML=`<span class="console-placeholder">No output yet — start the process to see logs here.</span>`)}),document.getElementById(`wrap-toggle-btn`)?.addEventListener(`click`,()=>{a=!a,f()}),u()):c(),i===`about`&&ct(r,o?.jid||`${r.phone_number}@s.whatsapp.net`,o?.lid||`1${r.phone_number}@lid`),i===`settings`&&ut(r,()=>f())}f()}function rt(e){let t=document.getElementById(`console-output`),n=document.getElementById(`jump-to-latest`),r=document.getElementById(`clear-logs-btn`),i=document.getElementById(`save-logs-btn`);if(!t)return;t.querySelector(`.console-placeholder`)&&(t.innerHTML=``);let a=t.scrollHeight-t.scrollTop-t.clientHeight<50;if(t.appendChild(document.createTextNode(e)),r&&(r.disabled=!1),i&&(i.disabled=!1),a&&(t.scrollTop=t.scrollHeight),n){let e=t.scrollHeight-t.scrollTop-t.clientHeight;n.classList.toggle(`visible`,e>=50)}}function it(e,t){let n=e.trim().length>0;return`
    <div class="console-toolbar">
      <button type="button" class="outline toolbar-toggle-btn ${t?`active`:``}" id="wrap-toggle-btn">
        ${I(Me,{size:14})} Word wrap
      </button>
      <button type="button" class="outline" id="clear-logs-btn" ${n?``:`disabled`}>
        ${I(M,{size:14})} Clear logs
      </button>
      <button type="button" class="outline" id="save-logs-btn" ${n?``:`disabled`}>
        ${I(_e,{size:14})} Save logs
      </button>
    </div>
    <div class="console-wrapper">
      <div class="console-output ${t?``:`nowrap`}" id="console-output">
        ${n?at(e):`<span class="console-placeholder">No output yet — start the process to see logs here.</span>`}
      </div>
      <button type="button" class="jump-to-latest" id="jump-to-latest">
        ${I(fe,{size:14})} Jump to latest
      </button>
    </div>
  `}function at(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}function ot(e,t,n,r){let i=document.getElementById(`console-output`),a=document.getElementById(`jump-to-latest`),o=document.getElementById(`save-logs-btn`);!i||!a||(i.scrollTop=i.scrollHeight,i.addEventListener(`scroll`,()=>{let e=i.scrollHeight-i.scrollTop-i.clientHeight<40;a.classList.toggle(`visible`,!e)}),a.addEventListener(`click`,()=>{i.scrollTo({top:i.scrollHeight,behavior:`smooth`})}),o?.addEventListener(`click`,()=>{let n=i.textContent||e,r=new Blob([n],{type:`text/plain`}),a=URL.createObjectURL(r),o=document.createElement(`a`);o.href=a,o.download=`${t}-logs.txt`,o.click(),URL.revokeObjectURL(a)}),document.getElementById(`clear-logs-btn`)?.addEventListener(`click`,async()=>{if(await Y({title:`Clear logs`,message:`Clear all logs for this process? This cannot be undone.`,confirmLabel:`Clear`,danger:!0}))try{await ae(String(n)),r()}catch(e){B(e.message,`error`)}}))}function st(e,t){let n=t?.push_name||e.name,r=n?n.charAt(0).toUpperCase():`W`,i=t?.profile_photo_url||``,a=t?.jid||`${e.phone_number}@s.whatsapp.net`,o=t?.lid||`1${e.phone_number}@lid`,s=t?.messages_sent??0,c=t?.messages_received??0,l=t?.groups_count??0,u=t?.communities_count??0,d=t?.contacts_count??0,f=t?.activity_graph||[],p=f.length>0?Math.max(...f.flatMap(e=>[e.sent,e.recv]),10):10;return`
    <div class="about-bot-container">
      <!-- Top Card: Profile Avatar & Identity -->
      <div class="bot-profile-card">
        <div class="bot-avatar-wrap">
          ${i?`<img src="${i}" alt="${n}" class="bot-avatar-img" />`:`<div class="bot-avatar-fallback">${r}</div>`}
        </div>
        <div class="bot-profile-info">
          <div class="bot-profile-name-row">
            <h2>${n}</h2>
            <span class="status-pill ${e.status}">${e.status}</span>
          </div>
          <div class="bot-identity-pills">
            <span class="id-pill">
              ${I(we,{size:13})} ${e.phone_number}
              <button type="button" class="icon-btn-sm" id="copy-pn-btn" title="Copy Phone Number">${I(S,{size:12})}</button>
            </span>
            <span class="id-pill">
              <strong>JID:</strong> ${a}
              <button type="button" class="icon-btn-sm" id="copy-jid-btn" title="Copy JID">${I(S,{size:12})}</button>
            </span>
            <span class="id-pill">
              <strong>LID:</strong> ${o}
              <button type="button" class="icon-btn-sm" id="copy-lid-btn" title="Copy LID">${I(S,{size:12})}</button>
            </span>
          </div>
        </div>
      </div>

      <!-- Stats Metric Cards -->
      <div class="bot-stats-grid">
        <div class="stat-card">
          <div class="stat-card-icon" style="background: rgba(22, 163, 74, 0.1); color: #16a34a;">
            ${I(De,{size:18})}
          </div>
          <div class="stat-card-data">
            <span class="stat-val">${s.toLocaleString()}</span>
            <span class="stat-lbl">Messages Sent</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-icon" style="background: rgba(59, 130, 246, 0.1); color: #3b82f6;">
            ${I(Ce,{size:18})}
          </div>
          <div class="stat-card-data">
            <span class="stat-val">${c.toLocaleString()}</span>
            <span class="stat-lbl">Messages Received</span>
          </div>
        </div>

        <div class="stat-card clickable-stat" id="stat-card-groups" style="cursor: pointer;" title="Click to view joined groups">
          <div class="stat-card-icon" style="background: rgba(168, 85, 247, 0.1); color: #a855f7;">
            ${I(P,{size:18})}
          </div>
          <div class="stat-card-data" style="flex: 1;">
            <span class="stat-val">${l.toLocaleString()}</span>
            <span class="stat-lbl">Groups</span>
          </div>
          ${I(C,{size:14,class:`stat-info-icon`})}
        </div>

        <div class="stat-card clickable-stat" id="stat-card-communities" style="cursor: pointer;" title="Click to view communities">
          <div class="stat-card-icon" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;">
            ${I(w,{size:18})}
          </div>
          <div class="stat-card-data" style="flex: 1;">
            <span class="stat-val">${u.toLocaleString()}</span>
            <span class="stat-lbl">Communities</span>
          </div>
          ${I(C,{size:14,class:`stat-info-icon`})}
        </div>

        <div class="stat-card clickable-stat" id="stat-card-contacts" style="cursor: pointer;" title="Click to view saved contacts">
          <div class="stat-card-icon" style="background: rgba(236, 72, 153, 0.1); color: #ec4899;">
            ${I(N,{size:18})}
          </div>
          <div class="stat-card-data" style="flex: 1;">
            <span class="stat-val">${d.toLocaleString()}</span>
            <span class="stat-lbl">Contacts</span>
          </div>
          ${I(C,{size:14,class:`stat-info-icon`})}
        </div>
      </div>

      <!-- Messaging Activity Graph -->
      <div class="bot-graph-card">
        <div class="graph-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${I(me,{size:18})}
            <h3>Messaging Activity Graph</h3>
          </div>
          <div class="graph-legend">
            <span class="legend-item"><span class="dot sent-dot"></span> Sent</span>
            <span class="legend-item"><span class="dot recv-dot"></span> Received</span>
          </div>
        </div>

        <div class="activity-bar-chart">
          ${f.length>0?f.map(e=>{let t=Math.round(e.sent/p*120),n=Math.round(e.recv/p*120);return`
              <div class="bar-group">
                <div class="bars-pair">
                  <div class="bar sent-bar" style="height: ${Math.max(t,4)}px;" title="Sent: ${e.sent}"></div>
                  <div class="bar recv-bar" style="height: ${Math.max(n,4)}px;" title="Received: ${e.recv}"></div>
                </div>
                <span class="bar-label">${e.hour}</span>
              </div>
            `}).join(``):`<div class="console-placeholder" style="text-align: center; width: 100%; padding: 30px 0;">No messaging activity recorded yet.</div>`}
        </div>
      </div>
    </div>
  `}function ct(e,t,n){document.getElementById(`copy-pn-btn`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(e.phone_number).then(()=>{B(`Phone number copied to clipboard`,`success`)})}),document.getElementById(`copy-jid-btn`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(t).then(()=>{B(`JID copied to clipboard`,`success`)})}),document.getElementById(`copy-lid-btn`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(n).then(()=>{B(`LID copied to clipboard`,`success`)})}),document.getElementById(`stat-card-groups`)?.addEventListener(`click`,async()=>{try{let t=await fetch(`/api/processes/${e.id}/groups`,{headers:{Authorization:`Bearer ${localStorage.getItem(`access_token`)}`}});Xe(t.ok?await t.json():[])}catch{Xe([])}}),document.getElementById(`stat-card-communities`)?.addEventListener(`click`,async()=>{try{let t=await fetch(`/api/processes/${e.id}/communities`,{headers:{Authorization:`Bearer ${localStorage.getItem(`access_token`)}`}});et(t.ok?await t.json():[])}catch{et([])}}),document.getElementById(`stat-card-contacts`)?.addEventListener(`click`,async()=>{try{let t=await fetch(`/api/processes/${e.id}/contacts`,{headers:{Authorization:`Bearer ${localStorage.getItem(`access_token`)}`}});Qe(t.ok?await t.json():[])}catch{Qe([])}})}function lt(e){let t=!(e.has_run_before&&e.status!==`logged_out`);return`
    <div class="settings-grid-layout">
      <!-- Left Column / Main Panel: Configuration & Behavior -->
      <div class="settings-col">
        <div class="settings-card">
          <div class="settings-card-header">
            ${I(ke,{size:18})}
            <div>
              <h3>Process Behavior</h3>
              <p>Configure runtime execution flags and message handling</p>
            </div>
          </div>

          <div class="settings-rows-list">
            <div class="settings-row">
              <div>
                <div class="settings-row-label">Verbose Logging</div>
                <div class="settings-row-desc">Include detailed debug output and packet traces in console logs.</div>
              </div>
              <div class="toggle">
                <input type="checkbox" id="verbose-toggle" ${e.verbose?`checked`:``} />
                <label for="verbose-toggle"></label>
              </div>
            </div>

            <div class="settings-row">
              <div>
                <div class="settings-row-label">Process Offline Messages</div>
                <div class="settings-row-desc">Process messages sent to WhatsApp while this bot process was offline.</div>
              </div>
              <div class="toggle">
                <input type="checkbox" id="skip-old-toggle" ${e.no_skip_old?``:`checked`} />
                <label for="skip-old-toggle"></label>
              </div>
            </div>

            <div class="settings-row">
              <div>
                <div class="settings-row-label">Auto Restart on Boot</div>
                <div class="settings-row-desc">Automatically restore and restart this process when the server reboots.</div>
              </div>
              <div class="toggle">
                <input type="checkbox" id="auto-restart-toggle" ${e.auto_restart===!1?``:`checked`} />
                <label for="auto-restart-toggle"></label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column / Side Panel: Specs & Danger Zone -->
      <div class="settings-col">
        <div class="settings-card">
          <div class="settings-card-header">
            ${I(C,{size:18})}
            <div>
              <h3>Session Specifications</h3>
              <p>Core session metadata and engine flags</p>
            </div>
          </div>

          <div class="info-rows-list">
            <div class="info-row">
              <span class="info-row-label">Phone Number</span>
              <span class="info-row-value">${e.phone_number}</span>
            </div>
            <div class="info-row">
              <span class="info-row-label">Client Engine</span>
              <span class="frozen-pill">${e.client}</span>
            </div>
            <div class="info-row">
              <span class="info-row-label">Auth Method</span>
              <span class="frozen-pill">${e.auth_type}</span>
            </div>
            <div class="info-row">
              <span class="info-row-label">Current Status</span>
              <span class="status-pill ${e.status}">${e.status}</span>
            </div>
            <div class="info-row">
              <span class="info-row-label">Created At</span>
              <span class="info-row-value">${new Date(e.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div class="settings-card danger-card">
          <div class="settings-card-header">
            ${I(M,{size:18})}
            <div>
              <h3 style="color: #e5484d;">Danger Zone</h3>
              <p>High-privilege lifecycle actions</p>
            </div>
          </div>

          ${e.has_run_before?`
            <div class="danger-block">
              <div>
                <strong>Log out WhatsApp Session</strong>
                <p>Stops the process (if running) and revokes WhatsApp session keys using -l flag. Required before deletion.</p>
              </div>
              <button type="button" class="outline" id="logout-session-btn" ${e.status===`logged_out`?`disabled`:``}>
                ${I(T,{size:14})} ${e.status===`logged_out`?`Logged out`:`Log out session`}
              </button>
            </div>`:``}

          <div class="danger-block" style="border-top: 1px solid var(--border); margin-top: 16px; padding-top: 16px;">
            <div>
              <strong>Delete Process</strong>
              <p>${t?`Permanently remove this process configuration and logs.`:`Log out session before deleting.`}</p>
            </div>
            <button type="button" class="danger" id="delete-process-btn" ${t?``:`disabled`}>
              ${I(M,{size:14})} Delete process
            </button>
          </div>
        </div>
      </div>
    </div>
  `}function ut(e,t){document.getElementById(`verbose-toggle`)?.addEventListener(`change`,async n=>{let r=n.target,i=r.checked;try{let n=await _(String(e.id),{verbose:i});e.verbose=i,n.restarted?B(`Setting saved — process restarted`,`success`):n.warning?B(n.warning,`error`):B(`Verbose setting updated`,`success`),t()}catch(e){r.checked=!i,B(e.message,`error`)}}),document.getElementById(`skip-old-toggle`)?.addEventListener(`change`,async n=>{let r=n.target,i=r.checked,a=!i;try{let n=await _(String(e.id),{no_skip_old:a});e.no_skip_old=a,n.restarted?B(`Setting saved — process restarted`,`success`):n.warning?B(n.warning,`error`):B(`Offline messages setting updated`,`success`),t()}catch(e){r.checked=!i,B(e.message,`error`)}}),document.getElementById(`auto-restart-toggle`)?.addEventListener(`change`,async n=>{let r=n.target,i=r.checked;try{await _(String(e.id),{auto_restart:i}),e.auto_restart=i,B(`Auto-restart setting updated`,`success`),t()}catch(e){r.checked=!i,B(e.message,`error`)}}),document.getElementById(`logout-session-btn`)?.addEventListener(`click`,async()=>{if(!await Y({title:`Log out session`,message:`This will stop "${e.name}" if running, and execute whatsrook -l to log out of WhatsApp. Continue?`,confirmLabel:`Log out`,danger:!0}))return;let n=J(`Logging out session…`);try{await oe(String(e.id)),n(),e.status=`logged_out`,t()}catch(e){n(),B(e.message,`error`)}}),document.getElementById(`delete-process-btn`)?.addEventListener(`click`,async()=>{if(!await Y({title:`Delete process`,message:`Delete "${e.name}"? This cannot be undone.`,confirmLabel:`Delete`,danger:!0}))return;let t=J(`Deleting session…`);try{await v(String(e.id)),t(),n(`/dashboard`)}catch(e){t(),B(e.message,`error`)}})}async function $(){if(!await h()){n(`/login`);return}let e=document.getElementById(`app`);e.innerHTML=`<div class="dash-wrapper"><div class="dash-main">${q(`Loading API key manager...`)}</div></div>`;let t=[];try{let e=await fetch(`/api/keys`,{headers:{Authorization:`Bearer ${localStorage.getItem(`access_token`)}`}});e.ok&&(t=await e.json())}catch{}e.innerHTML=`
    <div class="dash-wrapper">
      <div class="dash-header">
        <button type="button" class="detail-back" id="api-back-btn" title="Back to Dashboard">
          ${I(y,{size:18})}
        </button>
        <div class="dash-logo">${I(x,{size:20})} API Keys & Integration Docs</div>
      </div>

      <div class="dash-main" style="max-width: 1100px; margin: 0 auto;">
        <!-- Header Banner -->
        <div class="about-hero-card" style="margin-bottom: 24px;">
          <div class="about-hero-header">
            <div class="about-hero-icon">${I(xe,{size:24})}</div>
            <div>
              <h3>API Authentication & Keys</h3>
              <p>Generate API keys for external scripts, CLI automation, and backend integrations. API key routes are uninhibited (not rate-limited).</p>
            </div>
          </div>
        </div>

        <div class="settings-grid-layout">
          <!-- Left Column: API Key Generator & List -->
          <div class="settings-col">
            <div class="settings-card">
              <div class="settings-card-header">
                ${I(xe,{size:18})}
                <div>
                  <h3>Create New API Key</h3>
                  <p>Issue an uninhibited API key for automation</p>
                </div>
              </div>

              <form id="create-key-form" style="display: flex; gap: 10px; align-items: flex-end;">
                <div class="field" style="flex: 1;">
                  <label for="key-name">Key Identifier / Name</label>
                  <input type="text" id="key-name" placeholder="e.g. CLI Bot Worker" required />
                </div>
                <button type="submit" class="primary" style="margin-top: 0; width: auto; display: flex; align-items: center; gap: 6px;">
                  ${I(O,{size:16})} Generate Key
                </button>
              </form>
            </div>

            <div class="settings-card">
              <div class="settings-card-header">
                ${I(A,{size:18})}
                <div>
                  <h3>Your Active API Keys</h3>
                  <p>Manage existing keys and credentials</p>
                </div>
              </div>

              <div id="api-keys-list">
                ${t.length===0?`<p style="color: var(--text); font-size: 14px; font-style: italic;">No API keys generated yet. Create one above to begin.</p>`:t.map(dt).join(``)}
              </div>
            </div>
          </div>

          <!-- Right Column: API Code Use Cases -->
          <div class="settings-col">
            <div class="settings-card">
              <div class="settings-card-header">
                ${I(pe,{size:18})}
                <div>
                  <h3>Integration Use Cases</h3>
                  <p>Authentication header & code examples</p>
                </div>
              </div>

              <div style="font-size: 13px; color: var(--text); line-height: 150%;">
                <p style="margin-bottom: 12px;">Pass your API Key in requests via header:</p>
                <div class="cli-cmd-box" style="margin-bottom: 16px;">
                  <code>X-API-Key: wha_live_...</code>
                </div>

                <h4 style="color: var(--text-h); font-size: 14px; margin: 16px 0 6px;">1. List Processes (cURL)</h4>
                <div class="cli-cmd-box">
                  <code>curl -H "X-API-Key: YOUR_API_KEY" http://localhost:8080/api/processes</code>
                </div>

                <h4 style="color: var(--text-h); font-size: 14px; margin: 16px 0 6px;">2. Start Process (Python)</h4>
                <div class="cli-cmd-box" style="white-space: pre-wrap;">
                  <code>import requests
requests.post('http://localhost:8080/api/processes/1/run',
              headers={'X-API-Key': 'YOUR_API_KEY'})</code>
                </div>

                <h4 style="color: var(--text-h); font-size: 14px; margin: 16px 0 6px;">3. Read Live Logs (Node.js / Bun)</h4>
                <div class="cli-cmd-box" style="white-space: pre-wrap;">
                  <code>const res = await fetch('http://localhost:8080/api/processes/1/logs', {
  headers: { 'X-API-Key': 'YOUR_API_KEY' }
});
const { logs } = await res.json();</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,document.getElementById(`api-back-btn`).addEventListener(`click`,()=>n(`/dashboard`)),document.getElementById(`create-key-form`)?.addEventListener(`submit`,async e=>{e.preventDefault();let t=document.getElementById(`key-name`).value;try{let e=await fetch(`/api/keys`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${localStorage.getItem(`access_token`)}`},body:JSON.stringify({name:t})});if(!e.ok)throw Error(`Failed to generate API key`);B(`API Key "${(await e.json()).name}" generated!`,`success`),$()}catch(e){B(e.message,`error`)}}),t.forEach(e=>{document.getElementById(`copy-key-${e.id}`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(e.key).then(()=>{B(`API Key copied to clipboard`,`success`)})}),document.getElementById(`revoke-key-${e.id}`)?.addEventListener(`click`,async()=>{if(confirm(`Revoke API key "${e.name}"?`))try{if(!(await fetch(`/api/keys/${e.id}`,{method:`DELETE`,headers:{Authorization:`Bearer ${localStorage.getItem(`access_token`)}`}})).ok)throw Error(`Failed to revoke key`);B(`API key revoked`,`success`),$()}catch(e){B(e.message,`error`)}})})}function dt(e){let t=e.key.substring(0,12)+`...`+e.key.substring(e.key.length-4),n=e.last_used_at?new Date(e.last_used_at).toLocaleString():`Never`;return`
    <div style="border-bottom: 1px solid var(--border); padding: 14px 0;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <strong style="color: var(--text-h); font-size: 14px;">${e.name}</strong>
        <span style="font-size: 12px; color: var(--text);">Used: ${n}</span>
      </div>
      <div class="cli-cmd-box" style="margin-bottom: 8px;">
        <code>${t}</code>
        <button type="button" class="icon-btn-sm" id="copy-key-${e.id}" title="Copy API Key">
          ${I(S,{size:14})}
        </button>
      </div>
      <button type="button" class="danger" id="revoke-key-${e.id}" style="padding: 5px 10px; font-size: 12px;">
        ${I(M,{size:12})} Revoke Key
      </button>
    </div>
  `}t(`/login`,Pe),t(`/dashboard`,X),t(`/passkey-prompt`,Je),t(`/processes/:id`,nt),t(`/api-docs`,$),t(`/404`,Ye);async function ft(){Ve();let e=await h(),t=window.location.hash.slice(1);e&&(t===``||t===`/login`)&&n(`/dashboard`),!e&&t===`/dashboard`&&n(`/login`),a(),G(`page_view`,t||`login`)}ft();