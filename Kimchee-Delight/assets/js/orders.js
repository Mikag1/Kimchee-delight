// Orders page — Kitchen ticket rail
let orders = [];
let activeOrderId = null;
let loadingOrders = false;
let savingOrder = false;

async function orderRequest(method = 'GET', body = null, query = '') {
  const response = await fetch(`api/orders.php${query}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const result = await response.json().catch(() => ({ errors: ['Server returned an unexpected response.'] }));
  if (!response.ok) throw new Error([].concat(result.errors || 'Order request failed.').join(' '));
  return result;
}

function orderItems(order) {
  return String(order.items || '').split(',').map(item => item.trim()).filter(Boolean);
}

function render() {
  const rail = $('#order-rail');
  if (!rail) return;

  if (!orders.length) {
    rail.innerHTML = '<div class="empty" style="flex:1;min-width:300px;"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg><p class="empty-title">No orders yet</p><p class="small">New orders appear here automatically</p></div>';
    return;
  }

  rail.innerHTML = orders.map(order => {
    const statusClass = `status-${order.status.toLowerCase()}`;
    const badgeClass = order.status === 'Pending' ? 'badge-kimchi' : order.status === 'Preparing' ? 'badge-honey' : 'badge-perilla';
    const badgeText = order.status;
    const itemsHtml = orderItems(order).map((item, i) =>
      `<div class="ticket-item">${esc(item)}${order.checkedItems?.includes(i) ? ' <span class="badge badge-perilla">✓</span>' : ''}</div>`
    ).join('') || '<div class="ticket-item small" style="color:var(--soy)">No items listed</div>';

    let actionsHtml = '';
    if (order.status === 'Pending') {
      actionsHtml = `<button class="btn btn-primary btn-sm" data-action="start" data-id="${esc(order.id)}">Start</button>`;
    } else if (order.status === 'Preparing') {
      actionsHtml = `
        <button class="btn btn-ghost btn-sm" data-action="review" data-id="${esc(order.id)}">Review</button>
        <button class="btn btn-success btn-sm" data-action="served" data-id="${esc(order.id)}">Mark Served</button>
      `;
    }

    return `
      <article class="order-ticket ${statusClass}" data-id="${esc(order.id)}">
        <header class="ticket-header">
          <span class="ticket-table">${esc(order.table)}</span>
          <span class="ticket-type ${order.type === 'Refill' ? 'refill' : 'order'}">${esc(order.type)}</span>
        </header>
        <div class="ticket-items">${itemsHtml}</div>
        <div class="ticket-actions">${actionsHtml}</div>
      </article>
    `;
  }).join('');
}

async function loadOrders() {
  if (loadingOrders) return;
  loadingOrders = true;
  try {
    const result = await orderRequest();
    orders = result.orders;
    render();
  } catch (error) {
    toast(error.message, 'error');
  } finally {
    loadingOrders = false;
  }
}

async function updateStatus(order, status) {
  if (savingOrder) return;
  savingOrder = true;
  const btn = document.querySelector(`[data-action="${status === 'Preparing' ? 'start' : 'served'}"][data-id="${order.id}"]`);
  setButtonLoading(btn, true);
  try {
    await orderRequest('PUT', { action: 'status', status }, `?id=${encodeURIComponent(order.id)}`);
    order.status = status;
    render();
    if (status === 'Preparing') openChecklist(order);
    toast(`Order #${order.id} → ${status}`, 'success');
  } catch (error) {
    toast(error.message, 'error');
    await loadOrders();
  } finally {
    setButtonLoading(btn, false);
    savingOrder = false;
  }
}

const dialog = document.getElementById('order-dialog');
function openChecklist(order) {
  activeOrderId = order.id;
  const items = orderItems(order);
  if (!Array.isArray(order.checkedItems)) order.checkedItems = [];

  $('#dialog-table').textContent = order.table;
  $('#dialog-type').textContent = order.type;
  $('#dialog-items').innerHTML = items.map((item, index) =>
    `<label class="checklist-item"><input type="checkbox" data-index="${index}" ${order.checkedItems.includes(index) ? 'checked' : ''}><span>${esc(item)}</span></label>`
  ).join('') || '<p class="empty" style="padding:var(--space-4);margin:0">This order has no listed items.</p>';
  updateProgress();
  if (!dialog.open) dialog.showModal();
}

function updateProgress() {
  const order = orders.find(item => String(item.id) === String(activeOrderId));
  if (!order) return;
  const total = orderItems(order).length;
  const checked = Array.isArray(order.checkedItems) ? order.checkedItems.length : 0;
  $('#dialog-progress').textContent = `${checked} of ${total} checked`;
}

document.addEventListener('click', async e => {
  const btn = e.target.closest('[data-action]');
  if (!btn || savingOrder) return;
  const order = orders.find(item => String(item.id) === btn.dataset.id);
  if (!order) return;

  if (btn.dataset.action === 'start' && order.status === 'Pending') {
    await updateStatus(order, 'Preparing');
  } else if (btn.dataset.action === 'review' && order.status === 'Preparing') {
    openChecklist(order);
  } else if (btn.dataset.action === 'served' && order.status === 'Preparing') {
    await updateStatus(order, 'Served');
  }
});

$('#dialog-items')?.addEventListener('change', async e => {
  if (e.target.type !== 'checkbox') return;
  const order = orders.find(item => String(item.id) === String(activeOrderId));
  if (!order) return;

  const previous = [...(Array.isArray(order.checkedItems) ? order.checkedItems : [])];
  const index = Number(e.target.dataset.index);
  order.checkedItems = e.target.checked
    ? [...new Set([...previous, index])]
    : previous.filter(item => item !== index);
  updateProgress();

  try {
    await orderRequest('PUT', { action: 'checklist', checkedItems: order.checkedItems }, `?id=${encodeURIComponent(order.id)}`);
  } catch (error) {
    order.checkedItems = previous;
    openChecklist(order);
    toast(error.message, 'error');
  }
});

$('#dialog-close')?.addEventListener('click', () => dialog.close());
$('#dialog-done')?.addEventListener('click', () => dialog.close());
dialog?.addEventListener('close', () => { activeOrderId = null; loadOrders(); });

// Quick order link
$('#tn')?.addEventListener('input', e => {
  $('#open')?.setAttribute('href', 'order.php?table=' + encodeURIComponent(parseInt(e.target.value, 10) || 1));
});

loadOrders();
setInterval(loadOrders, 5000);