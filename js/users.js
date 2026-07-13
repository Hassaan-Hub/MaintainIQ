import { db } from '/js/firebase-config.js';
import { collection, query, where, onSnapshot, updateDoc, doc, serverTimestamp, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { requireRole } from '/js/middleware.js';
import { setupNav, populateUser, setupMobileMenu, getSidebar } from '/js/middleware.js';
import { showToast, statusBadge, esc, formatDate, openModal, closeModal, setupModals } from '/js/utils.js';

let currentOrgId = null;
let currentUserId = null;
let usersData = {};

const roleColors = {
  admin: 'badge-danger',
  manager: 'badge-warning',
  technician: 'badge-info',
  reporter: 'badge-secondary'
};

requireRole(['admin', 'manager'], async (user, userData) => {
  currentUserId = user.uid;
  document.getElementById('sidebar').innerHTML = getSidebar('users', userData.role);
  setupNav('users');
  populateUser(userData);
  setupMobileMenu();
  setupModals();

  currentOrgId = userData.orgId;

  const q = query(collection(db, 'users'), where('orgId', '==', currentOrgId));
  onSnapshot(q, (snap) => {
    usersData = {};
    snap.forEach(d => { usersData[d.id] = { id: d.id, ...d.data() }; });
    renderUsers();
    updateStats();
  });

  document.getElementById('searchInput').addEventListener('input', renderUsers);
  document.getElementById('roleFilter').addEventListener('change', renderUsers);
  document.getElementById('saveRoleBtn').addEventListener('click', saveRole);
  document.getElementById('cancelRoleBtn').addEventListener('click', () => closeModal('roleModal'));
});

function updateStats() {
  const users = Object.values(usersData);
  document.getElementById('totalUsers').textContent = users.length;
  document.getElementById('adminCount').textContent = users.filter(u => u.role === 'admin').length;
  document.getElementById('techCount').textContent = users.filter(u => u.role === 'technician').length;
  document.getElementById('managerCount').textContent = users.filter(u => u.role === 'manager').length;
}

function renderUsers() {
  const tbody = document.getElementById('users-list');
  const search = document.getElementById('searchInput').value.toLowerCase();
  const role = document.getElementById('roleFilter').value;

  let filtered = Object.values(usersData).filter(u => {
    if (search && !u.name?.toLowerCase().includes(search) && !u.email?.toLowerCase().includes(search)) return false;
    if (role && u.role !== role) return false;
    return true;
  });

  const roleOrder = { admin: 0, manager: 1, technician: 2, reporter: 3 };
  filtered.sort((a, b) => (roleOrder[a.role] ?? 9) - (roleOrder[b.role] ?? 9));

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><h3>No users found</h3><p>Users in your organization will appear here</p></div></td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(u => {
    const initials = (u.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
    const isSelf = u.id === currentUserId;

    return `<tr class="${isSelf ? 'bg-green-50' : ''}">
      <td>
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-semibold text-xs text-slate-600 overflow-hidden">
            ${u.photoUrl ? `<img src="${u.photoUrl}" class="w-full h-full object-cover">` : initials}
          </div>
          <div>
            <div class="font-medium">${esc(u.name || 'Unknown')}${isSelf ? ' <span class="text-xs text-green-600">(You)</span>' : ''}</div>
          </div>
        </div>
      </td>
      <td class="text-slate-500">${esc(u.email || 'N/A')}</td>
      <td><span class="badge ${roleColors[u.role] || 'badge-secondary'}">${esc((u.role || 'unknown').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))}</span></td>
      <td class="text-slate-500 text-xs">${esc(u.phone || 'N/A')}</td>
      <td class="text-slate-500 text-xs">${formatDate(u.createdAt)}</td>
      <td>
        ${!isSelf ? `<button class="btn btn-secondary btn-xs role-action-btn" data-user-id="${u.id}" title="Change Role">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Role
        </button>` : '<span class="text-slate-400 text-xs">—</span>'}
      </td>
    </tr>`;
  }).join('');

  document.querySelectorAll('.role-action-btn').forEach(btn => {
    btn.addEventListener('click', () => openRoleModal(btn.dataset.userId));
  });
}

function openRoleModal(userId) {
  const user = usersData[userId];
  if (!user) return;
  document.getElementById('editUserId').value = userId;
  document.getElementById('editUserName').textContent = user.name || user.email;
  document.getElementById('editUserRole').value = user.role || 'technician';
  openModal('roleModal');
}

async function saveRole() {
  const userId = document.getElementById('editUserId').value;
  const newRole = document.getElementById('editUserRole').value;
  if (!userId || !newRole) return;

  const btn = document.getElementById('saveRoleBtn');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  try {
    await updateDoc(doc(db, 'users', userId), {
      role: newRole,
      updatedAt: serverTimestamp()
    });
    showToast('Role updated successfully', 'success');
    closeModal('roleModal');
  } catch (err) {
    console.error(err);
    showToast('Error updating role: ' + err.message, 'error');
  }

  btn.disabled = false;
  btn.textContent = 'Save Role';
}
