Item: {{isset($name) ? $name : "ERROR"}}<br />
Avg (week): {{isset($weekAvg) && $weekAvg ? $weekAvg : "no data"}}<br />
Avg (month): {{isset($monthAvg) && $monthAvg ? $monthAvg : "no data"}}<br />
Avg (all time): {{isset($allAvg) && $allAvg ? $allAvg : "no data"}}