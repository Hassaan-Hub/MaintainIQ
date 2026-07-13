import { db } from '/js/firebase-config.js';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { showToast, statusBadge, esc, formatDate, formatDateTime, uploadFile } from '/js/utils.js';

let assetId = null;
const params = new URLSearchParams(window.location.search);
assetId = params.get('id');

if (!assetId) {
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts.length >= 2 && pathParts[0] === 'asset') {
    assetId = pathParts[1];
  }
}

if (!assetId) {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('notFoundState').style.display = 'block';
} else {
  loadAsset(assetId);
}

async function loadAsset(id) {
  try {
    const assetDoc = await getDoc(doc(db, 'assets', id));
    if (!assetDoc.exists()) {
      document.getElementById('loadingState').style.display = 'none';
      document.getElementById('notFoundState').style.display = 'block';
      return;
    }

    const asset = assetDoc.data();
    document.getElementById('assetName').textContent = asset.name;
    document.getElementById('assetLocation').textContent = asset.location || '';
    document.title = `${asset.name} — MaintainIQ`;

    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('assetContent').style.display = 'block';

    document.getElementById('assetTitle').textContent = asset.name;
    const statusEl = document.getElementById('assetStatus');
    statusEl.textContent = (asset.status || 'operational').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    statusEl.className = `asset-status-indicator ${asset.status || 'operational'}`;

    document.getElementById('assetCategory').textContent = asset.category || 'N/A';
    document.getElementById('assetLocationInfo').textContent = asset.location || 'N/A';
    document.getElementById('assetInstall').textContent = asset.installDate || 'N/A';
    document.getElementById('assetWarranty').textContent = asset.warrantyExpiry || 'N/A';

    if (asset.photoUrl) {
      document.getElementById('assetPhotoSection').style.display = 'block';
      document.getElementById('assetPhoto').src = asset.photoUrl;
      document.getElementById('assetPhoto').alt = asset.name;
    }

    document.querySelectorAll('.tab-btns button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btns button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-report').style.display = btn.dataset.tab === 'report' ? 'block' : 'none';
        document.getElementById('tab-history').style.display = btn.dataset.tab === 'history' ? 'block' : 'none';
        document.getElementById('tab-issues').style.display = btn.dataset.tab === 'issues' ? 'block' : 'none';

        if (btn.dataset.tab === 'history') loadHistory(id);
        if (btn.dataset.tab === 'issues') loadOpenIssues(id);
      });
    });

    document.getElementById('reportForm').addEventListener('submit', (e) => {
      e.preventDefault();
      submitIssueReport(id, asset.orgId);
    });

    document.getElementById('reportPhotos').addEventListener('change', (e) => {
      const preview = document.getElementById('reportPhotoPreview');
      preview.innerHTML = '';
      Array.from(e.target.files).forEach(file => {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        preview.appendChild(img);
      });
    });

    if (window.location.hash === '#report') {
      document.getElementById('reportBtn').scrollIntoView({ behavior: 'smooth' });
    }

  } catch (err) {
    console.error('Error loading asset:', err);
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('notFoundState').style.display = 'block';
  }
}

async function submitIssueReport(assetId, orgId) {
  const btn = document.getElementById('submitReport');
  btn.disabled = true;
  btn.textContent = 'Submitting...';

  try {
    const description = document.getElementById('reportDesc').value.trim();
    const urgency = document.getElementById('reportUrgency').value;
    const name = document.getElementById('reportName').value.trim() || 'Anonymous';
    const contact = document.getElementById('reportContact').value.trim();
    const files = document.getElementById('reportPhotos').files;

    const photoUrls = [];
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const url = await uploadFile(files[i], `reports/${assetId}/${Date.now()}-${i}`);
        photoUrls.push(url);
      }
    }

    const assetDoc = await getDoc(doc(db, 'assets', assetId));
    const assetData = assetDoc.data();

    await addDoc(collection(db, 'issues'), {
      assetId,
      orgId,
      description,
      category: assetData?.category || '',
      urgency,
      status: 'reported',
      reportedBy: contact || name,
      reporterName: name,
      reporterContact: contact,
      photos: photoUrls,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await addDoc(collection(db, 'serviceHistory'), {
      assetId,
      orgId,
      action: 'reported',
      performedBy: name,
      notes: `Issue reported: ${description.substring(0, 100)}`,
      timestamp: serverTimestamp()
    });

    showToast('Issue reported successfully! Thank you for your report.', 'success');
    document.getElementById('reportForm').reset();
    document.getElementById('reportPhotoPreview').innerHTML = '';

  } catch (err) {
    console.error(err);
    showToast('Error submitting report. Please try again.', 'error');
  }

  btn.disabled = false;
  btn.textContent = 'Submit Report';
}

async function loadHistory(assetId) {
  const container = document.getElementById('historyList');
  try {
    const q = query(collection(db, 'serviceHistory'), where('assetId', '==', assetId));
    const snap = await getDocs(q);

    if (snap.empty) {
      container.innerHTML = '<div class="card"><div class="empty-state"><p>No service history yet</p></div></div>';
      return;
    }

    const sortedDocs = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.timestamp?.toMillis?.() || 0) - (a.timestamp?.toMillis?.() || 0));

    container.innerHTML = sortedDocs.map(log => {
      const actionColors = {
        reported: '#dc2626',
        triaged: '#f59e0b',
        assigned: '#2563eb',
        status_change: '#0891b2',
        resolved: '#16a34a',
        closed: '#64748b'
      };

      return `
        <div class="timeline-item">
          <div class="time">${formatDateTime(log.timestamp)}</div>
          <div class="content">
            <span class="inline-flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full" style="background:${actionColors[log.action] || '#64748b'};"></span>
              <strong class="capitalize">${log.action.replace(/_/g, ' ')}</strong>
            </span>
            ${log.notes ? `<p class="text-slate-500 text-xs mt-1">${esc(log.notes)}</p>` : ''}
            <p class="text-slate-400 text-xs mt-1">by ${esc(log.performedBy || 'System')}</p>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = '<p class="text-slate-500 text-center p-4">Error loading history</p>';
  }
}

async function loadOpenIssues(assetId) {
  const container = document.getElementById('openIssuesList');
  try {
    const q = query(collection(db, 'issues'), where('assetId', '==', assetId));
    const snap = await getDocs(q);

    const openIssues = snap.docs.filter(d => {
      const status = d.data().status;
      return ['reported', 'triaged', 'assigned', 'in_progress'].includes(status);
    });

    if (openIssues.length === 0) {
      container.innerHTML = '<div class="card"><div class="empty-state"><p>No open issues for this asset</p></div></div>';
      return;
    }

    container.innerHTML = openIssues.map(d => {
      const issue = d.data();
      return `
        <div class="card mb-3">
          <div class="card-body">
            <div class="flex gap-2 mb-2">
              ${statusBadge(issue.urgency || 'low')}
              ${statusBadge(issue.status)}
            </div>
            <p class="text-sm">${esc(issue.description || 'No description')}</p>
            <p class="text-xs text-slate-400 mt-2">Reported ${formatDateTime(issue.createdAt)}</p>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = '<p class="text-slate-500 text-center p-4">Error loading issues</p>';
  }
}
