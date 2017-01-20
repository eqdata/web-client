<?php

namespace App\Http\Controllers;

use Carbon\Carbon;

class TooltipController extends Controller {

    /**
     * Creates tooltip with item average prices (week, month, all time)
     * @param $name
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function getAuctionStats($name) {
        $auctions = json_decode(file_get_contents("http://52.205.204.206:8085/items/auctions/". rawurlencode($name)), true);
        if(!$auctions)
            return view("tooltips.notFound");

        $weekTotal = $monthTotal = $allTotal = 0;
        $weekCount = $monthCount = $allCount = 0;
        // loop through all records and extract stats
        foreach ($auctions['Auctions'] as $auction) {
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

        $data['name'] = $auction['Item'];
        $data['weekAvg'] = ($weekCount ? $weekTotal/$weekCount : 0);
        $data['monthAvg'] = ($monthCount ? $monthTotal/$monthCount : 0);
        $data['allAvg'] = ($allCount ? $allTotal/$allCount : 0);
        return view("tooltips.auctionStats", $data);
    }
}
