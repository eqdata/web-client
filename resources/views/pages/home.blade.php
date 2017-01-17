@extends('layouts.default')
@section('content')
    <!-- Blog Entries Column -->
    <div class="pushdown">
        <div class="col-sm-8 col-sm-offset-2 col-lg-6 col-lg-offset-3">
            <div class="row text-center">
                <h1>
                    EQData
                </h1>
            </div>
            <div class="row">
                <form id="search-form">
                    <div class="input-group col-md-12">
                        <input id="search-query" type="text" class="search-query form-control" placeholder="Search"/>
                    </div>
                </form>
            </div>
        </div>

    </div>
@stop