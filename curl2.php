<?php
$output=file_get_contents("http://localhost:8080/geoserver/topp/ows?service=wfs&request=GetFeature&version=1.0.0&typeNames=topp:tasmania_roads&outputFormat=JSON");
echo $output;
?>
