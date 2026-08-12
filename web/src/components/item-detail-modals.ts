// web/src/components/item-detail-modals.ts
import { openModal, closeModal } from "./modal";
import { icon, Users, User, Layers, Info, X, Copy } from "../icons";
import { showToast } from "./toast";

interface GroupItem {
  name: string;
  jid: string;
  membersCount: number;
  isAdmin: boolean;
  createdAt: string;
  description: string;
}

interface ContactItem {
  pushName: string;
  phoneNumber: string;
  jid: string;
  status: string;
}

interface CommunityItem {
  name: string;
  jid: string;
  subGroupsCount: number;
  totalMembers: number;
  description: string;
}

// Open Joined Groups List Modal
export function openGroupsListModal(groupsList: GroupItem[] = []) {
  const hasItems = groupsList.length > 0;
  const overlay = openModal(`
    <div class="modal-header">
      <div style="display: flex; align-items: center; gap: 10px;">
        ${icon(Users, { size: 20 })}
        <div>
          <h2>Joined Groups</h2>
          <p style="font-size: 12px; color: var(--text); font-weight: normal; margin-top: 2px;">
            Current WhatsApp groups this bot has joined
          </p>
        </div>
      </div>
      <button type="button" class="modal-close" id="groups-modal-close">${icon(X, { size: 18 })}</button>
    </div>

    <div class="modal-body">
      ${hasItems ? `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${groupsList.map((g, idx) => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg);">
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <strong style="color: var(--text-h); font-size: 14px;">${g.name}</strong>
                <span style="font-size: 12px; color: var(--text);">${g.membersCount} members ${g.isAdmin ? "· Admin" : ""}</span>
              </div>
              <button type="button" class="icon-btn" id="group-info-btn-${idx}" title="View Group Details">
                ${icon(Info, { size: 16 })}
              </button>
            </div>
          `).join("")}
        </div>
      ` : `
        <p style="text-align: center; color: var(--text); padding: 24px 0; margin: 0; font-style: italic;">
          No joined groups found for this session.
        </p>
      `}
    </div>

    <div class="modal-footer">
      <button type="button" class="primary" id="groups-modal-ok">Close</button>
    </div>
  `);

  document.getElementById("groups-modal-close")?.addEventListener("click", () => closeModal(overlay));
  document.getElementById("groups-modal-ok")?.addEventListener("click", () => closeModal(overlay));

  groupsList.forEach((g, idx) => {
    document.getElementById(`group-info-btn-${idx}`)?.addEventListener("click", () => {
      openGroupDetailModal(g);
    });
  });
}

// Open Specific Group Detail Modal
function openGroupDetailModal(g: GroupItem) {
  const overlay = openModal(`
    <div class="modal-header">
      <div style="display: flex; align-items: center; gap: 10px;">
        ${icon(Users, { size: 20 })}
        <div>
          <h2>Group Details</h2>
          <p style="font-size: 12px; color: var(--text); font-weight: normal; margin-top: 2px;">
            ${g.name}
          </p>
        </div>
      </div>
      <button type="button" class="modal-close" id="group-detail-close">${icon(X, { size: 18 })}</button>
    </div>

    <div class="modal-body">
      <div class="info-rows-list">
        <div class="info-row">
          <span class="info-row-label">Group Name</span>
          <span class="info-row-value">${g.name}</span>
        </div>
        <div class="info-row">
          <span class="info-row-label">Group JID</span>
          <span class="info-row-value" style="font-family: var(--mono); font-size: 12px; display: flex; align-items: center; gap: 6px;">
            ${g.jid}
            <button type="button" class="icon-btn-sm" id="copy-group-jid" title="Copy JID">${icon(Copy, { size: 12 })}</button>
          </span>
        </div>
        <div class="info-row">
          <span class="info-row-label">Total Members</span>
          <span class="info-row-value">${g.membersCount} participants</span>
        </div>
        <div class="info-row">
          <span class="info-row-label">Bot Admin Status</span>
          <span class="frozen-pill">${g.isAdmin ? "Admin" : "Member"}</span>
        </div>
        <div class="info-row">
          <span class="info-row-label">Created Date</span>
          <span class="info-row-value">${g.createdAt}</span>
        </div>
      </div>

      <div style="background: var(--code-bg); border: 1px solid var(--border); border-radius: 6px; padding: 12px; margin-top: 10px;">
        <strong style="font-size: 12px; color: var(--text-h); display: block; margin-bottom: 4px;">Description</strong>
        <p style="font-size: 13px; color: var(--text); margin: 0;">${g.description}</p>
      </div>
    </div>

    <div class="modal-footer">
      <button type="button" class="primary" id="group-detail-ok">Close</button>
    </div>
  `);

  document.getElementById("group-detail-close")?.addEventListener("click", () => closeModal(overlay));
  document.getElementById("group-detail-ok")?.addEventListener("click", () => closeModal(overlay));

  document.getElementById("copy-group-jid")?.addEventListener("click", () => {
    navigator.clipboard.writeText(g.jid).then(() => {
      showToast("Group JID copied to clipboard", "success");
    });
  });
}

// Open Contacts List Modal
export function openContactsListModal(contactsList: ContactItem[] = []) {
  const hasItems = contactsList.length > 0;
  const overlay = openModal(`
    <div class="modal-header">
      <div style="display: flex; align-items: center; gap: 10px;">
        ${icon(User, { size: 20 })}
        <div>
          <h2>Saved Contacts</h2>
          <p style="font-size: 12px; color: var(--text); font-weight: normal; margin-top: 2px;">
            Synced WhatsApp contacts
          </p>
        </div>
      </div>
      <button type="button" class="modal-close" id="contacts-modal-close">${icon(X, { size: 18 })}</button>
    </div>

    <div class="modal-body">
      ${hasItems ? `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${contactsList.map((c, idx) => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg);">
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <strong style="color: var(--text-h); font-size: 14px;">${c.pushName}</strong>
                <span style="font-size: 12px; color: var(--text); font-family: var(--mono);">${c.phoneNumber}</span>
              </div>
              <button type="button" class="icon-btn" id="contact-info-btn-${idx}" title="View Contact Details">
                ${icon(Info, { size: 16 })}
              </button>
            </div>
          `).join("")}
        </div>
      ` : `
        <p style="text-align: center; color: var(--text); padding: 24px 0; margin: 0; font-style: italic;">
          No saved contacts found for this session.
        </p>
      `}
    </div>

    <div class="modal-footer">
      <button type="button" class="primary" id="contacts-modal-ok">Close</button>
    </div>
  `);

  document.getElementById("contacts-modal-close")?.addEventListener("click", () => closeModal(overlay));
  document.getElementById("contacts-modal-ok")?.addEventListener("click", () => closeModal(overlay));

  contactsList.forEach((c, idx) => {
    document.getElementById(`contact-info-btn-${idx}`)?.addEventListener("click", () => {
      openContactDetailModal(c);
    });
  });
}

function openContactDetailModal(c: ContactItem) {
  const overlay = openModal(`
    <div class="modal-header">
      <div style="display: flex; align-items: center; gap: 10px;">
        ${icon(User, { size: 20 })}
        <div>
          <h2>Contact Details</h2>
          <p style="font-size: 12px; color: var(--text); font-weight: normal; margin-top: 2px;">
            ${c.pushName}
          </p>
        </div>
      </div>
      <button type="button" class="modal-close" id="contact-detail-close">${icon(X, { size: 18 })}</button>
    </div>

    <div class="modal-body">
      <div class="info-rows-list">
        <div class="info-row">
          <span class="info-row-label">Push Name</span>
          <span class="info-row-value">${c.pushName}</span>
        </div>
        <div class="info-row">
          <span class="info-row-label">Phone Number</span>
          <span class="info-row-value">${c.phoneNumber}</span>
        </div>
        <div class="info-row">
          <span class="info-row-label">JID</span>
          <span class="info-row-value" style="font-family: var(--mono); font-size: 12px; display: flex; align-items: center; gap: 6px;">
            ${c.jid}
            <button type="button" class="icon-btn-sm" id="copy-contact-jid" title="Copy JID">${icon(Copy, { size: 12 })}</button>
          </span>
        </div>
        <div class="info-row">
          <span class="info-row-label">Status</span>
          <span class="frozen-pill">${c.status}</span>
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <button type="button" class="primary" id="contact-detail-ok">Close</button>
    </div>
  `);

  document.getElementById("contact-detail-close")?.addEventListener("click", () => closeModal(overlay));
  document.getElementById("contact-detail-ok")?.addEventListener("click", () => closeModal(overlay));

  document.getElementById("copy-contact-jid")?.addEventListener("click", () => {
    navigator.clipboard.writeText(c.jid).then(() => {
      showToast("Contact JID copied to clipboard", "success");
    });
  });
}

// Open Communities List Modal
export function openCommunitiesListModal(communitiesList: CommunityItem[] = []) {
  const hasItems = communitiesList.length > 0;
  const overlay = openModal(`
    <div class="modal-header">
      <div style="display: flex; align-items: center; gap: 10px;">
        ${icon(Layers, { size: 20 })}
        <div>
          <h2>Joined Communities</h2>
          <p style="font-size: 12px; color: var(--text); font-weight: normal; margin-top: 2px;">
            WhatsApp Community umbrellas
          </p>
        </div>
      </div>
      <button type="button" class="modal-close" id="communities-modal-close">${icon(X, { size: 18 })}</button>
    </div>

    <div class="modal-body">
      ${hasItems ? `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${communitiesList.map((c, idx) => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg);">
              <div style="display: flex; flex-direction: column; gap: 2px;">
                <strong style="color: var(--text-h); font-size: 14px;">${c.name}</strong>
                <span style="font-size: 12px; color: var(--text);">${c.subGroupsCount} linked groups · ${c.totalMembers} members</span>
              </div>
              <button type="button" class="icon-btn" id="community-info-btn-${idx}" title="View Community Details">
                ${icon(Info, { size: 16 })}
              </button>
            </div>
          `).join("")}
        </div>
      ` : `
        <p style="text-align: center; color: var(--text); padding: 24px 0; margin: 0; font-style: italic;">
          No communities found for this session.
        </p>
      `}
    </div>

    <div class="modal-footer">
      <button type="button" class="primary" id="communities-modal-ok">Close</button>
    </div>
  `);

  document.getElementById("communities-modal-close")?.addEventListener("click", () => closeModal(overlay));
  document.getElementById("communities-modal-ok")?.addEventListener("click", () => closeModal(overlay));

  communitiesList.forEach((c, idx) => {
    document.getElementById(`community-info-btn-${idx}`)?.addEventListener("click", () => {
      openCommunityDetailModal(c);
    });
  });
}

function openCommunityDetailModal(c: CommunityItem) {
  const overlay = openModal(`
    <div class="modal-header">
      <div style="display: flex; align-items: center; gap: 10px;">
        ${icon(Layers, { size: 20 })}
        <div>
          <h2>Community Details</h2>
          <p style="font-size: 12px; color: var(--text); font-weight: normal; margin-top: 2px;">
            ${c.name}
          </p>
        </div>
      </div>
      <button type="button" class="modal-close" id="community-detail-close">${icon(X, { size: 18 })}</button>
    </div>

    <div class="modal-body">
      <div class="info-rows-list">
        <div class="info-row">
          <span class="info-row-label">Community Name</span>
          <span class="info-row-value">${c.name}</span>
        </div>
        <div class="info-row">
          <span class="info-row-label">Community JID</span>
          <span class="info-row-value" style="font-family: var(--mono); font-size: 12px; display: flex; align-items: center; gap: 6px;">
            ${c.jid}
            <button type="button" class="icon-btn-sm" id="copy-community-jid" title="Copy JID">${icon(Copy, { size: 12 })}</button>
          </span>
        </div>
        <div class="info-row">
          <span class="info-row-label">Sub-Groups Count</span>
          <span class="info-row-value">${c.subGroupsCount} groups</span>
        </div>
        <div class="info-row">
          <span class="info-row-label">Total Members</span>
          <span class="info-row-value">${c.totalMembers} members</span>
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <button type="button" class="primary" id="community-detail-ok">Close</button>
    </div>
  `);

  document.getElementById("community-detail-close")?.addEventListener("click", () => closeModal(overlay));
  document.getElementById("community-detail-ok")?.addEventListener("click", () => closeModal(overlay));

  document.getElementById("copy-community-jid")?.addEventListener("click", () => {
    navigator.clipboard.writeText(c.jid).then(() => {
      showToast("Community JID copied to clipboard", "success");
    });
  });
}
