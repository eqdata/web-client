<!DOCTYPE html>
<html lang="en">
<head>
    @include('includes.head')
</head>

<body>
@include('includes.header')

<!-- Page Content -->
<div id="wrap">
    <div class="container" id="main">
        <div class="row">
            @yield('content')
        </div>
    </div>
</div>
@include('includes.footer')
<!-- /.container -->
<!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"
        integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa"
        crossorigin="anonymous"></script>
<script src="/js/app.js"></script>
@stack('bottom-scripts')
</body>

</html>
