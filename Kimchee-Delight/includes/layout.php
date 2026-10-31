<?php
function esc($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }

// Lucide SVG icons (inline, no CDN)
$icons = [
  'menu' => '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>',
  'chevron-left' => '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>',
  'layout-dashboard' => '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect></svg>',
  'scale' => '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"></path><path d="M3 9h18"></path><path d="M3 15h18"></path></svg>',
  'users' => '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
  'qr-code' => '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',
  'package' => '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>',
  'moon' => '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>',
  'sun' => '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>',
  'x' => '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
  'check' => '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
  'loader' => '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>',
];

function page_start(string $title, string $active): void {
    global $icons;
    $nav = [
      ['dashboard','Dashboard','layout-dashboard'],
      ['consumption','Consumption','scale'],
      ['queue','Queue','users'],
      ['orders','Orders','qr-code'],
      ['inventory','Inventory','package']
    ];
?>
<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= esc($title) ?> · Kimchee Delight Ops</title>
<link rel="stylesheet" href="assets/css/style.css?v=<?= filemtime(dirname(__DIR__) . DIRECTORY_SEPARATOR . 'assets' . DIRECTORY_SEPARATOR . 'css' . DIRECTORY_SEPARATOR . 'style.css') ?>">
</head><body>
<aside class="rail" id="rail" role="navigation" aria-label="Main navigation">
  <div class="rail-brand">
    <span class="rail-logo">火</span>
    <div>
      <span class="rail-title">Kimchee Delight</span>
      <span class="rail-sub">OPS</span>
    </div>
  </div>
  <nav class="rail-nav">
  <?php foreach ($nav as [$file, $label, $icon]): ?>
    <a href="<?= $file ?>.php" class="rail-link <?= $file === $active ? 'active' : '' ?>" data-icon="<?= $icon ?>">
      <?= $icons[$icon] ?>
      <span><?= esc($label) ?></span>
    </a>
  <?php endforeach; ?>
  </nav>
</aside>
<button class="rail-toggle" id="rail-toggle" aria-label="Expand navigation" aria-expanded="false"><?= $icons['chevron-left'] ?></button>
<header class="topbar" role="banner">
  <h1 class="topbar-title"><?= esc($title) ?></h1>
  <div class="topbar-actions">
    <span class="topbar-time" id="topbar-time">--:--</span>
    <button class="theme-toggle" id="theme-toggle" type="button" aria-label="Switch to light theme" aria-pressed="false">
      <span class="theme-icon theme-icon-dark" aria-hidden="true"><?= $icons['moon'] ?></span>
      <span class="theme-icon theme-icon-light" aria-hidden="true"><?= $icons['sun'] ?></span>
    </button>
  </div>
</header>
<main class="main" id="main">
  <div class="content">
<?php }

function page_end(string $script = ''): void {
    global $icons;
?>
  </div>
</main>
<script src="assets/js/app.js?v=<?= filemtime(dirname(__DIR__) . DIRECTORY_SEPARATOR . 'assets' . DIRECTORY_SEPARATOR . 'js' . DIRECTORY_SEPARATOR . 'app.js') ?>"></script>
<?php if ($script): ?><script src="assets/js/<?= esc($script) ?>"></script><?php endif; ?>
</body></html>
<?php }
