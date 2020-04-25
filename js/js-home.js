$(document).ready(function () {

    var namePlayer1, namePlayer2;

    $(document).on("keydown", function (event) {
        console.log("Key : " + event.key + "\tWhich : " + event.which);
        if (event.key == "Escape" && $("#newGame").css("display") != "none") {
            $("#btn-cancel").click();
        }
        if (event.key == "Escape" && $("#howToPlay").css("display") != "none") {
            $("#btn-exit").click();
        }
    });

    $(".form input").on("click", function () {
        $(this).select();
    });

    // Prevents highlighting/selecting elements on drag
    $("*").attr('unselectable', 'on')
        .css('user-select', 'none')
        .bind('selectstart', function () { return false; });

    $("#btn-ok").on("click", function () {
        var btn1 = $("#input-player1");
        var btn2 = $("#input-player2");
        if (btn1.val() == "" || btn2.val() == "") {
            if (btn1.val() == "") {
                btn1.addClass("error");
                setTimeout(function () { btn1.removeClass("error"); }, 300);

            }
            if (btn2.val() == "") {
                btn2.addClass("error");
                setTimeout(function () { btn2.removeClass("error"); }, 300);
            }
        }
        else {
            namePlayer1 = $("#input-player1").val();
            namePlayer2 = $("#input-player2").val();

            window.sessionStorage.setItem("player1", namePlayer1);
            window.sessionStorage.setItem("player2", namePlayer2);
            window.location.replace("./game.html");
        }
    });

    // $("#btn-exit").click(function () {
    //     $("#input-player1").val("");
    //     $("#input-player2").val("");
    // });
});
