@extends('layouts.default')
@section('content')
    <!-- Blog Entries Column -->
    <div id="content-container" class="col-md-9">
        <div class="pushdown"></div>
        <div class="loader"></div>
    </div>

    <!-- Blog Sidebar Widgets Column -->
    <div id="sidebar-container" class="col-md-3">
        @include('includes.sidebar')
    </div>
@stop