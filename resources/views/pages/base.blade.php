@extends('layouts.default')
@section('content')
    <!-- Blog Entries Column -->
    <div id="content-container" class="col-md-8">

        <h1 id="page-title" class="page-header">
            Search Results
            <small id="query-string">Title Goes here</small>
        </h1>

        <div id="content-wrapper">
            <div id="results-loader" class="loader"></div>
        </div>
    </div>

    <!-- Blog Sidebar Widgets Column -->
    <div id="sidebar-container" class="col-md-4">
        @include('includes.sidebar')
    </div>
@stop