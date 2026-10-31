let items = [];
let movements = [];
let dailyUsage = [];
let loading = false;
const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};
const qtyFmt = n => Number(n).toLocaleString('en-PH', {maximumFractionDigits:3});
const stockLabel = item => `${qtyFmt(item.qty)} ${esc(item.unit || 'unit')}`;
const status = item => item.qty <= 0 ? ['Out of stock', 'red'] :
  Number(item.low) > 0 && item.qty <= item.low ? ['Low stock', 'amber'] : ['In stock', 'green'];

async function inventoryRequest(method = 'GET', body = null, query = '') {
  const response = await fetch(`api/inventory.php${query}`, {
    method,
    headers:{'Content-Type':'application/json'},
    body:body ? JSON.stringify(body) : undefined
  });
  const result = await response.json().catch(() => ({errors:['Server returned an unexpected response.']}));
  if (!response.ok) throw new Error([].concat(result.errors || 'Inventory request failed.').join(' '));
  return result;
}

function setInventoryMessage(message, isError = true) {
  $('#warn').innerHTML = message ? `<div class="msg ${isError ? 'err' : 'ok'}">${esc(message)}</div>` : '';
}

function render() {
  const low = items.filter(item => !item.is_sample && item.qty > 0 && Number(item.low) > 0 && item.qty <= item.low).length;
  const out = items.filter(item => !item.is_sample && item.qty <= 0).length;
  const sample = items.filter(item => item.is_sample).length;
  const attention = low + out;
  const warnings = [];
  if (sample) warnings.push(`${sample} sample item balance(s) — set physical counts before relying on them`);
  if (out) warnings.push(`${out} item(s) out of stock`);
  if (low) warnings.push(`${low} item(s) at or below their low-stock level`);
  $('#warn').innerHTML = warnings.length ? `<div class="msg err">${esc(warnings.join('; '))}.</div>` : '';
  $('#stock-summary').innerHTML = `
    <span class="stock-summary-item"><strong>${items.length}</strong><span>ingredients</span></span>
    <span class="stock-summary-item ${attention ? 'needs-attention' : 'all-clear'}"><strong>${attention}</strong><span>need attention</span></span>
    ${sample ? `<span class="stock-summary-item sample-count"><strong>${sample}</strong><span>sample balances</span></span>` : ''}`;

  const dayTotals = new Map(dailyUsage.map(entry => [String(entry.itemId), entry]));
  $('#mi').innerHTML = items.map(item =>
    `<option value="${esc(item.id)}">${esc(item.name)} (${stockLabel(item)})</option>`
  ).join('');
  $('#t').innerHTML = items.map(item => {
    const [label, cls] = status(item);
    const totals = dayTotals.get(String(item.id)) || {added:0, used:0};
    const unit = esc(item.unit || 'unit');
    return `<tr class="stock-row ${cls === 'red' ? 'stock-row-out' : cls === 'amber' ? 'stock-row-low' : ''}">
      <td><div class="stock-ingredient"><strong>${esc(item.name)}</strong>${item.is_sample ? '<span class="stock-sample">Sample</span>' : ''}</div></td>
      <td><span class="stock-category">${esc(item.cat)}</span></td>
      <td><span class="stock-movement">${qtyFmt(totals.added)}<small>${unit}</small></span></td>
      <td><span class="stock-movement ${Number(totals.used) > 0 ? 'movement-used' : ''}">${qtyFmt(totals.used)}<small>${unit}</small></span></td>
      <td><div class="stock-balance"><strong>${qtyFmt(item.qty)}</strong><small>${unit}</small></div></td>
      <td><span class="stock-status stock-status-${cls}"><i aria-hidden="true"></i>${label}</span></td>
      <td><div class="stock-actions"><button class="btn ghost sm" data-a="count" data-id="${esc(item.id)}">Set count</button><button class="btn ghost sm" data-a="details" data-id="${esc(item.id)}">Unit / alert</button></div></td>
    </tr>`;
  }).join('') || '<tr><td colspan="7" class="empty">No inventory items.</td></tr>';
  $('#history').innerHTML = movements.map(move => {
    const adjustment = Number(move.adjustment) || 0;
    const adjustmentText = adjustment ? `${adjustment > 0 ? '+' : ''}${qtyFmt(adjustment)}` : '—';
    return `<tr><td>${esc(move.date)}</td><td>${esc(move.itemName)}</td>
      <td>${Number(move.added) ? qtyFmt(move.added) : '—'}</td><td>${Number(move.used) ? qtyFmt(move.used) : '—'}</td>
      <td>${adjustmentText}</td><td>${qtyFmt(move.balance)}</td><td>${esc(move.note || '')}</td></tr>`;
  }).join('') || '<tr><td colspan="7">No movements recorded yet.</td></tr>';
  renderDailyUsage();
}

function renderDailyUsage() {
  $('#daily-usage').innerHTML = dailyUsage.filter(entry => Number(entry.used) > 0).map(entry =>
    `<tr><td>${esc(entry.itemName)}</td><td>${qtyFmt(entry.used)}</td></tr>`
  ).join('') || '<tr><td colspan="2">No stock usage recorded today.</td></tr>';
}

async function loadInventory() {
  if (loading) return;
  loading = true;
  try {
    const result = await inventoryRequest('GET', null, `?date=${encodeURIComponent(today())}`);
    items = result.items;
    movements = result.movements;
    dailyUsage = result.dailyUsage;
    setInventoryMessage('', false);
    render();
  } catch (error) {
    setInventoryMessage(error.message);
  } finally {
    loading = false;
  }
}

const dailyDialog = $('#daily-dialog');
$('#show-daily').onclick = async () => {
  await loadInventory();
  dailyDialog.showModal();
};
$('#daily-close').onclick = () => dailyDialog.close();

$('#mf').onsubmit = async event => {
  event.preventDefault();
  const itemId = Number($('#mi').value);
  const amount = Number($('#mq').value);
  if (!Number.isInteger(itemId) || !Number.isFinite(amount) || amount <= 0) {
    return setInventoryMessage('Choose an item and enter a quantity greater than 0.');
  }
  try {
    await inventoryRequest('POST', {
      action:'movement', itemId, quantity:amount, type:$('#mt').value,
      note:$('#mn').value.trim(), date:today()
    });
    event.target.reset();
    await loadInventory();
    setInventoryMessage('Stock movement recorded.', false);
  } catch (error) {
    setInventoryMessage(error.message);
  }
};

$('#af').onsubmit = async event => {
  event.preventDefault();
  const name = $('#n').value.trim();
  const opening = Number($('#s').value);
  const low = Number($('#l').value);
  const unit = $('#u').value.trim();
  if (!name || !unit || !Number.isFinite(opening) || opening < 0 || !Number.isFinite(low) || low < 0) {
    return setInventoryMessage('Enter a name, unit, and non-negative stock quantities.');
  }
  try {
    await inventoryRequest('POST', {
      action:'add_item', name, category:$('#c').value, unit,
      quantity:opening, low, date:today()
    });
    event.target.reset();
    $('#u').value = 'unit';
    $('#l').value = 0;
    await loadInventory();
    setInventoryMessage('Inventory item added.', false);
  } catch (error) {
    setInventoryMessage(error.message);
  }
};

$('#t').onclick = async event => {
  const button = event.target.closest('button[data-a]');
  if (!button) return;
  const item = items.find(entry => String(entry.id) === button.dataset.id);
  if (!item) return;
  if (button.dataset.a === 'details') {
    const unit = prompt(`Unit for ${item.name}:`, item.unit || 'unit');
    if (unit === null) return;
    const lowInput = prompt(`Low-stock level for ${item.name} (${unit}):`, item.low || 0);
    if (lowInput === null) return;
    const low = Number(lowInput);
    if (!unit.trim() || !Number.isFinite(low) || low < 0) return alert('Enter a unit and a non-negative low-stock level.');
    try {
      await inventoryRequest('PUT', {action:'details', itemId:item.id, unit:unit.trim(), low});
      await loadInventory();
    } catch (error) {
      setInventoryMessage(error.message);
    }
    return;
  }
  const countInput = prompt(`Physical stock count for ${item.name} (${item.unit || 'unit'}):`, item.qty);
  if (countInput === null) return;
  const count = Number(countInput);
  if (!Number.isFinite(count) || count < 0) return alert('Stock count must be a valid quantity of 0 or higher.');
  try {
    await inventoryRequest('POST', {action:'count', itemId:item.id, quantity:count, date:today()});
    await loadInventory();
  } catch (error) {
    setInventoryMessage(error.message);
  }
};

loadInventory();
setInterval(loadInventory, 15000);
