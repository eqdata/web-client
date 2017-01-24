<?php

namespace App\Http\Controllers;

use Carbon\Carbon;

class TooltipController extends Controller {
//http://www.javascriptkit.com/script/script2/ajaxtooltip.shtml

    /**
     * Creates tooltip with item average prices (week, month, all time)
     * @param $name
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function getAuctionStats($name) {
        $auctions = json_decode(file_get_contents("http://52.205.204.206:8085/items/auctions/" . rawurlencode($name)), true);
        if (!$auctions["Auctions"])
            return view("tooltips.notFound");

        $auctions = self::sanitizeAuctions($auctions["Auctions"]);

        $weekTotal = $monthTotal = $allTotal = 0;
        $weekCount = $monthCount = $allCount = 0;

        // loop through all records and extract stats
        foreach ($auctions as $auction) {
            $date = Carbon::parse($auction['Updated_at']);
            if (Carbon::now()->subWeek() <= $date) { // within last week
                $weekTotal += $auction['Price'];
                $weekCount++;
            }
            if (Carbon::now()->subMonth() <= $date) { // within last month
                $monthTotal += $auction['Price'];
                $monthCount++;
            }
            $allTotal += $auction['Price'];
            $allCount++;
        }

        $data['name'] = ($auctions[0] ? str_replace("_", " ", rawurldecode($auctions[0]["Item"])) : $name);
        $data['weekAvg'] = ($weekCount ? $weekTotal / $weekCount : 0);
        $data['monthAvg'] = ($monthCount ? $monthTotal / $monthCount : 0);
        $data['allAvg'] = ($allCount ? $allTotal / $allCount : 0);
        return view("tooltips.auctionStats", $data);
    }

    /**
    i* Removes auctions from the same seller within 24 hour periods
     * NOTE: assumes descending order by date. Only newest auctions are kept.
     * @param $auctions
     * @return array
     */
    private static function sanitizeAuctions($auctions) {
        $currentMonth = "";
        $currentDay = "";
        $currentYear = "";
        $date = null;
        $daysSellers = [];
        $sanitizedAuctions = [];

        foreach ($auctions as $auction) {
            $duplicate = false;
            $date = Carbon::parse($auction['Updated_at']);
            // if current day
            if($date->day == $currentDay && $date->month == $currentMonth && $date->year == $currentYear){
                // check if duplicate
                foreach($daysSellers as $daySeller){
                    if($daySeller['Seller'] == $auction['Seller']) {
                        $duplicate = true;
                        break;
                    }
                }
                // if not, push it
                if (!$duplicate) {
                    array_push($daysSellers, $auction);
                }
            } else {
                // next day
                $currentDay = $date->day;
                $currentMonth = $date->month;
                $currentYear = $date->year;
                $sanitizedAuctions = $sanitizedAuctions + $daysSellers;
                $daysSellers[0] = $auction;
            }
        }
        return $sanitizedAuctions = $sanitizedAuctions + $daysSellers;
    }
}
