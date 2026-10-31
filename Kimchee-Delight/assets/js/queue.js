const TABLES = [['T1',2],['T2',2],['T3',4],['T4',4],['T5',4],['T6',6],['T7',6],['T8',8]];
const DINING_LIMIT_MS = 2 * 60 * 60 * 1000;
let q = store.get('st_queue', [
  {n:'A001', name:'Dela Cruz', size:4, table:'T3', status:'Seated'},
  {n:'A002', name:'Santos', size:2, table:'', status:'Waiting'},
  {n:'A003', name:'Lim Group', size:6, table:'', status:'Waiting'}]);
q.forEach(en => {
  if (en.status === 'Seated' && !Number.isFinite(en.seatedAt)) en.seatedAt = Date.now();
});
const busy = () => q.filter(e => e.status === 'Seated').map(e => e.table);
function updateTimers() {
  document.querySelectorAll('.dining-timer').forEach(timer => {
    const elapsed = Date.now() - Number(timer.dataset.start);
    const remaining = Math.max(0, DINING_LIMIT_MS - elapsed);
    const seconds = Math.ceil(remaining / 1000);
    const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const rest = String(seconds % 60).padStart(2, '0');
    timer.textContent = `${hours}:${minutes}:${rest}`;
    timer.classList.toggle('ending', remaining > 0 && remaining <= 15 * 60 * 1000);
    timer.classList.toggle('expired', remaining === 0);
    const note = timer.nextElementSibling;
    if (note) note.textContent = remaining === 0 ? "Time's up" : '2-hour seating';
  });
}
function render() {
  store.set('st_queue', q);
  const occupiedTables = busy();
  const freeTables = TABLES.filter(([id]) => !occupiedTables.includes(id));
  $('#table-count-total').textContent = TABLES.length;
  $('#table-count-free').textContent = freeTables.length;
  $('#table-count-occupied').textContent = occupiedTables.length;
  $('#table-seats-free').textContent = freeTables.reduce((total, [, seats]) => total + seats, 0);
  $('#tables').innerHTML = TABLES.map(([table, seats]) => {
    const occupant = q.find(entry => entry.status === 'Seated' && entry.table === table);
    return `<article class="table-tile ${occupant ? 'is-occupied' : 'is-available'}">
      <div class="table-tile-top">
        <span class="table-tile-number">${table}</span>
        <span class="table-tile-status"><i aria-hidden="true"></i>${occupant ? 'In use' : 'Open'}</span>
      </div>
      <div class="table-tile-center" aria-hidden="true"><span>${table.slice(1)}</span></div>
      <div class="table-tile-bottom">
        <span class="table-capacity"><span aria-hidden="true">•</span> ${seats} seats</span>
        ${occupant ? `<span class="table-guest">${esc(occupant.name)}</span>` : '<span class="table-guest table-guest-open">Ready to seat</span>'}
      </div>
    </article>`;
  }).join('');
  let wait = 0;
  $('#q').innerHTML = q.filter(e => e.status !== 'Done' && e.status !== 'Cancelled').map(e => {
    const w = e.status === 'Waiting' ? (wait += 8) + ' min' : `<span class="dining-timer" data-start="${Number(e.seatedAt)}"></span><small class="timer-note">2-hour seating</small>`;
    const cls = {Waiting:'amber', Seated:'green'}[e.status];
    return `<tr><td>${esc(e.n)}</td><td>${esc(e.name)}</td><td>${e.size}</td><td>${esc(e.table || '—')}</td>
      <td><span class="badge ${cls}">${e.status}</span></td><td>${w}</td><td>${e.status === 'Waiting'
      ? `<button class="btn sm" data-a="seat" data-n="${esc(e.n)}">Seat</button> <button class="btn ghost sm" data-a="cancel" data-n="${esc(e.n)}">Cancel</button>`
      : `<button class="btn ghost sm" data-a="done" data-n="${esc(e.n)}">Mark done</button>`}</td></tr>`;
  }).join('') || '<tr><td colspan="7" class="empty">Queue is empty.</td></tr>';
  updateTimers();
}
$('#qf').onsubmit = e => {
  e.preventDefault();
  const size = parseInt($('#qsize').value, 10), name = $('#qname').value.trim();
  if (!name || !(size >= 1)) return alert('Enter a name and at least 1 person.');
  q.push({n: 'A' + String(q.length + 1).padStart(3, '0'), name, size, table: '', status: 'Waiting'});
  e.target.reset(); $('#qsize').value = 2; render();
};
$('#q').onclick = e => {
  const en = q.find(x => x.n === e.target.dataset.n); if (!en) return;
  const a = e.target.dataset.a;
  if (a === 'seat') {
    const t = TABLES.find(([id, s]) => s >= en.size && !busy().includes(id));
    if (!t) return alert('No free table big enough yet.');
    en.table = t[0]; en.status = 'Seated'; en.seatedAt = Date.now();
  } else en.status = a === 'done' ? 'Done' : 'Cancelled';
  render();
};
render();
setInterval(updateTimers, 1000);
