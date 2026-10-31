const FIELDS = ['customers','pork_kg','beef_kg','chicken_kg','other_kg','revenue','meat_cost','other_expenses'];
const form = $('#f'); let editingId = null;
const localDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

async function call(method, qs = '', body) {
  const r = await fetch('api/consumption.php' + qs, {method, headers: {'Content-Type': 'application/json'}, body: body ? JSON.stringify(body) : undefined});
  const j = await r.json().catch(() => ({errors: ['Server returned an unexpected response.']}));
  if (!r.ok) throw j.errors || ['Something went wrong.'];
  return j;
}
const num = id => parseFloat(form[id].value) || 0;
function showMsg(text, ok) { $('#msg').innerHTML = text ? `<div class="msg ${ok ? 'ok' : 'err'}">${text}</div>` : ''; }

function preview() {   // live calculation (same formulas as PHP)
  const c = Math.floor(num('customers')), meat = num('pork_kg') + num('beef_kg') + num('chicken_kg') + num('other_kg');
  const rev = num('revenue'), profit = rev - num('meat_cost') - num('other_expenses');
  $('#pv').innerHTML = [['Total meat', fmt(meat) + ' kg'], ['Avg meat / customer', c > 0 ? fmt(meat / c * 1000, 0) + ' g' : '—'],
    ['Avg cost / customer', c > 0 ? peso(num('meat_cost') / c) : '—'], ['Avg revenue / customer', c > 0 ? peso(rev / c) : '—'],
    ['Net profit', peso(profit)], ['Margin', rev > 0 ? fmt(profit / rev * 100, 1) + '%' : '—']].map(([a, b]) => `<div><small>${a}</small><b>${b}</b></div>`).join('');
}

async function load() {
  try {
    const qs = new URLSearchParams({from: $('#from').value, to: $('#to').value});
    const d = await call('GET', '?' + qs);
    const s = d.summary;
    $('#hist').innerHTML = s.records ? `<div class="preview">
      <div><small>Records</small><b>${s.records}</b></div><div><small>Total customers</small><b>${s.customers}</b></div>
      <div><small>Avg meat / customer</small><b>${fmt(s.avg_meat_kg * 1000, 0)} g</b></div>
      <div><small>Avg cost / customer</small><b>${peso(s.avg_cost)}</b></div>
      <div><small>Avg revenue / customer</small><b>${peso(s.avg_revenue)}</b></div>
      <div><small>Margin</small><b>${s.margin == null ? '—' : fmt(s.margin, 1) + '%'}</b></div></div>` : '';
    if (!s.records) $('#hist').innerHTML = '<p class="note">Summary averages include recorded entries only. Sample rows below are excluded.</p>';
    $('#rows').innerHTML = d.records.length ? d.records.map(r => `<tr>
      <td>${esc(r.business_date)} <span class="badge ${+r.is_sample ? 'sample' : 'real'}">${+r.is_sample ? 'Sample' : 'Recorded'}</span></td>
      <td>${r.customers}</td><td>${fmt(r.total_meat_kg)} kg</td><td>${r.avg_meat_kg == null ? '—' : fmt(r.avg_meat_kg, 3) + ' kg'}</td>
      <td>${peso(r.revenue)}</td><td>${peso(r.meat_cost)}</td><td>${peso(r.net_profit)}</td>
      <td>${r.margin == null ? '—' : fmt(r.margin, 1) + '%'}</td>
      <td><button class="btn ghost sm" data-edit="${r.id}">Edit</button> <button class="btn sm" data-del="${r.id}">Delete</button></td></tr>`).join('')
      : '<tr><td colspan="9" class="empty">No records found.</td></tr>';
    window._records = d.records;
    const t = await call('GET', '?trend=1'); barChart($('#chart'), trendRows(t.trend));
  } catch (e) { showMsg(esc([].concat(e).join(' ')), false); }
}

form.onsubmit = async e => {
  e.preventDefault();
  const data = {business_date: form.business_date.value};
  for (const f of FIELDS) {
    const v = form[f].value === '' ? 0 : Number(form[f].value);
    if (isNaN(v) || v < 0) return showMsg('Values cannot be negative or non-numeric.', false);
    data[f] = v;
  }
  if (!Number.isInteger(data.customers)) return showMsg('Customers must be a whole number.', false);
  try {
    await call(editingId ? 'PUT' : 'POST', editingId ? '?id=' + editingId : '', data);
    showMsg(editingId ? 'Record updated.' : 'Record saved.', true); resetForm(); load();
  } catch (err) { showMsg(esc([].concat(err).join(' ')), false); }
};
function resetForm() { editingId = null; form.reset(); form.business_date.value = localDate(); $('#save').textContent = 'Save record'; $('#cancel').hidden = true; preview(); }

$('#rows').onclick = async e => {
  const ed = e.target.dataset.edit, del = e.target.dataset.del;
  if (ed) {
    const r = window._records.find(x => x.id == ed); editingId = r.id;
    form.business_date.value = r.business_date; FIELDS.forEach(f => form[f].value = r[f]);
    $('#save').textContent = 'Update record'; $('#cancel').hidden = false; preview(); form.scrollIntoView({behavior: 'smooth'});
  }
  if (del && confirm('Delete this record? This cannot be undone.')) {
    try { await call('DELETE', '?id=' + del); showMsg('Record deleted.', true); load(); } catch (err) { showMsg(esc([].concat(err).join(' ')), false); }
  }
};
form.oninput = preview; $('#cancel').onclick = resetForm;
$('#apply').onclick = load; $('#clear').onclick = () => { $('#from').value = $('#to').value = ''; load(); };
form.business_date.max = localDate();
resetForm(); load();
