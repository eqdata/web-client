@extends('layouts.default')
@section('content')
    <!-- Blog Entries Column -->
    <div class="pushdown">
        <div class="col-sm-8 col-sm-offset-2 col-lg-6 col-lg-offset-3">
            <div class="row text-center">
                <h1>
                   P99Tunnel
                </h1>
            </div>
            <div class="row">
                <form id="search-form">
                    <div class="input-group col-xs-offset-2 col-xs-8 col-sm-offset-0 col-sm-12 col-md-12">
                        <input id="search-query" autocomplete="off" type="text" class="search-query form-control" placeholder="Search for items here (e.g., 'Flowing Black Silk Sash')"/>
                    </div>
                </form>
            </div>
        </div>

    </div>
@stop