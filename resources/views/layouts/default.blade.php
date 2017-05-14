<!DOCTYPE html>
<html lang="en">
<head>
    @include('includes.head')
</head>

<body {{isset($index) && $index ? "class=index" : ""}}>
@include('includes.header')

<!-- Page Content -->
<div id="wrap">
    <div class="container" id="main">
        <div class="row">
            @yield('content')
        </div>
    </div>
</div>
@if(!isset($index) || !$index)
    @include('includes.footer')
@endif
<!-- /.container -->
@include('includes.scripts')
{{--@include('includes.modals')--}}
</body>

</html>
