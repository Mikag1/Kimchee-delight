<?php
require 'config/database.php'; require 'includes/calc.php'; require 'includes/layout.php';
$latest = null; $error = '';
try {
  $row = db()->query('SELECT * FROM daily_consumption WHERE is_sample = 0 ORDER BY business_date DESC LIMIT 1')->fetch();
  if (!$row) $row = db()->query('SELECT * FROM daily_consumption WHERE is_sample = 1 ORDER BY business_date DESC LIMIT 1')->fetch();
  $latest = $row ? metrics($row) : null;
}
catch (PDOException $e) { $error = 'Cannot connect to the database. Import database/samgyutrack.sql and check config/database.php.'; }
page_start('Dashboard', 'dashboard'); ?>
<section class="dashboard">
  <header class="dashboard-heading">
    <div>
      <p class="eyebrow">Kimchee Delight · Operations</p>
      <h2 class="dashboard-title">Daily overview</h2>
      <p class="dashboard-subtitle">A clear look at your latest restaurant performance.</p>
    </div>
    <a class="btn btn-primary" href="consumption.php">Add daily record <span aria-hidden="true">→</span></a>
  </header>

  <?php if ($error): ?>
    <div class="dashboard-message err" role="alert"><?= esc($error) ?></div>
  <?php elseif (!$latest): ?>
    <div class="dashboard-empty card">
      <span class="dashboard-empty-mark" aria-hidden="true">+</span>
      <h3>No daily records yet</h3>
      <p>Start tracking customers, revenue, and meat usage to see your restaurant's performance here.</p>
      <a class="btn btn-primary" href="consumption.php">Add your first record</a>
    </div>
  <?php else:
    $cards = [
      ['Total customers', number_format($latest['customers']), 'Guests served', 'zone-kimchi'],
      ['Buffet revenue', '₱' . number_format($latest['revenue'], 2), 'Gross sales', 'zone-perilla'],
      ['Total meat consumed', number_format($latest['total_meat_kg'], 2) . ' kg', 'Across all meat types', 'zone-honey'],
      ['Avg meat / customer', $latest['avg_meat_kg'] === null ? '—' : number_format($latest['avg_meat_kg'] * 1000) . ' g', 'Meat per guest', 'zone-steel'],
      ['Est. food cost / customer', $latest['avg_cost'] === null ? '—' : '₱' . number_format($latest['avg_cost'], 2), 'Meat cost per guest', 'zone-steel'],
      ['Estimated profit', '₱' . number_format($latest['net_profit'], 2), 'Revenue less costs', 'zone-perilla'],
    ];
    $sample = (int)$latest['is_sample'] === 1;
    $isToday = $latest['business_date'] === date('Y-m-d');
  ?>
    <div class="dashboard-record">
      <div>
        <span class="dashboard-record-label"><?= $isToday ? 'Today’s record' : 'Latest business date' ?></span>
        <strong><?= esc($latest['business_date']) ?></strong>
        <?php if (!$isToday): ?><span class="dashboard-record-hint">No record saved for today</span><?php endif; ?>
      </div>
      <span class="badge <?= $sample ? 'badge-honey' : 'badge-perilla' ?>">
        <span class="dashboard-status-dot" aria-hidden="true"></span>
        <?= $sample ? 'Sample data' : 'Recorded data' ?>
      </span>
    </div>

    <section class="stat-grid dashboard-stats" aria-label="Performance for <?= esc($latest['business_date']) ?>">
      <?php foreach ($cards as [$label, $value, $detail, $zone]): ?>
        <article class="stat-card <?= esc($zone) ?>">
          <div class="stat-label"><?= esc($label) ?></div>
          <div class="stat-value"><?= esc($value) ?></div>
          <div class="dashboard-stat-detail"><?= esc($detail) ?></div>
        </article>
      <?php endforeach; ?>
    </section>

    <section class="card dashboard-trend" aria-labelledby="trend-title">
      <div class="dashboard-trend-heading">
        <div>
          <p class="eyebrow">Consumption trend</p>
          <h3 id="trend-title">Average meat per customer</h3>
          <p class="dashboard-trend-copy">Last 7 recorded days</p>
        </div>
        <div class="dashboard-legend" aria-label="Chart legend">
          <span><i class="legend-sample"></i>Sample data</span>
          <span><i class="legend-recorded"></i>Recorded by staff</span>
        </div>
      </div>
      <div class="bars dashboard-bars" id="chart" role="img" aria-label="Average meat consumed per customer by day">
        <p class="dashboard-chart-message">Loading trend…</p>
      </div>
      <noscript><p class="dashboard-chart-message">Enable JavaScript to view the consumption trend.</p></noscript>
    </section>
    <script>
      window.addEventListener('DOMContentLoaded', async () => {
        const chart = document.getElementById('chart');
        try {
          const response = await fetch('api/consumption.php?trend=1');
          if (!response.ok) throw new Error('Trend request failed');
          const data = await response.json();
          if (!Array.isArray(data.trend)) throw new Error('Trend data is unavailable');
          barChart(chart, trendRows(data.trend));
        } catch (error) {
          chart.innerHTML = '<p class="dashboard-chart-message dashboard-chart-error">Unable to load the consumption trend. Please try again later.</p>';
        }
      });
    </script>
  <?php endif; ?>
</section>
<?php page_end(); ?>
