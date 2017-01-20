/**
 * Created by Rocky on 1/17/2017.
 */
window.onload = function () {
    document.getElementById("search-form").addEventListener('submit', function (e) {
        e.preventDefault(); // first statement
        var q = document.getElementById("search-query").value;
        window.location.href = "/search/" + q;
    })
}
