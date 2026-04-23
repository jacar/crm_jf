<?php
$output = shell_exec('php ../artisan migrate --path=database/migrations/2026_04_17_000000_create_fleet_tables.php --force 2>&1');
echo "<pre>Migration output:\n$output</pre>";
