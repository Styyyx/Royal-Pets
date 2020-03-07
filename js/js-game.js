$(document).ready(function () {
    var namePlayer1 = sessionStorage.getItem("player1");
    var namePlayer2 = sessionStorage.getItem("player2");

    var turn = namePlayer1;

    $("#playerName").text(namePlayer1);

    $(".burger").on("mouseover", function () {
        $(".menu").css("display", "flex");
    });
    $(".menu").on("mouseleave", function () {
        $(".menu").css("display", "none");
    });

    $(".cell").each(function () {
        let piece = $(this).attr("piece"), player = $(this).attr("player");
        $(this).children("img").attr("src","../res/" + player + "Pieces/" + player + "_" + piece + ".png");
    });
});