<?php require 'includes/layout.php'; page_start('Queue', 'queue'); ?>
<p class="note">Prototype module — uses sample data saved in your browser only (no database). Each group gets two hours at the table, starting when seated.</p>
<div class="two queue-overview">
  <div class="card"><h2>Add to queue</h2>
    <form id="qf"><div class="row"><label>Customer / group name<input id="qname" required maxlength="40"></label>
    <label>People<input id="qsize" type="number" min="1" max="20" value="2" required></label></div>
    <button class="btn">Add to queue</button></form></div>
  <section class="card availability-card" aria-labelledby="availability-title">
    <div class="availability-heading">
      <div>
        <p class="eyebrow">Floor plan</p>
        <h2 id="availability-title">Table availability</h2>
      </div>
      <span class="availability-open"><i aria-hidden="true"></i><span id="table-count-free">0</span> open</span>
    </div>
    <div class="availability-summary" aria-label="Table summary">
      <span><b id="table-count-total">0</b> total tables</span>
      <span><b id="table-count-occupied">0</b> occupied</span>
      <span><b id="table-seats-free">0</b> seats available</span>
    </div>
    <div class="table-board" id="tables" aria-label="Live table status"></div>
    <div class="availability-legend">
      <span><i class="legend-open" aria-hidden="true"></i>Available</span>
      <span><i class="legend-busy" aria-hidden="true"></i>Occupied</span>
    </div>
  </section>
</div>
<div class="card"><h2>Queue</h2><div class="tw"><table><thead><tr><th>No.</th><th>Name</th><th>People</th><th>Table</th><th>Status</th><th>Wait / dining time</th><th></th></tr></thead><tbody id="q"></tbody></table></div></div>
<?php page_end('queue.js?v=3'); ?>
