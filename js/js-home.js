$(document).ready(function () {

    var namePlayer1, namePlayer2;

    $(document).on("keydown", function (event) {
        console.log("Key : " + event.key + "\tWhich : " + event.which);
        if (event.key == "Enter" && $("#newGame").css("display") != "none"){
            $("#btn-ok").click();
        }
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
            let initialState = [
                { piece: "rook", player: "dog", row: "1", column: "1" },
                { piece: "bishop", player: "dog", row: "1", column: "2" },
                { piece: "knight", player: "dog", row: "1", column: "3" },
                { piece: "queen", player: "dog", row: "1", column: "4" },
                { piece: "king", player: "dog", row: "1", column: "5" },
                { piece: "knight", player: "dog", row: "1", column: "6" },
                { piece: "bishop", player: "dog", row: "1", column: "7" },
                { piece: "rook", player: "dog", row: "1", column: "8" },

                { piece: "pawn", player: "dog", row: "2", column: "1" },
                { piece: "pawn", player: "dog", row: "2", column: "2" },
                { piece: "pawn", player: "dog", row: "2", column: "3" },
                { piece: "pawn", player: "dog", row: "2", column: "4" },
                { piece: "pawn", player: "dog", row: "2", column: "5" },
                { piece: "pawn", player: "dog", row: "2", column: "6" },
                { piece: "pawn", player: "dog", row: "2", column: "7" },
                { piece: "pawn", player: "dog", row: "2", column: "8" },

                { piece: "pawn", player: "cat", row: "7", column: "1" },
                { piece: "pawn", player: "cat", row: "7", column: "2" },
                { piece: "pawn", player: "cat", row: "7", column: "3" },
                { piece: "pawn", player: "cat", row: "7", column: "4" },
                { piece: "pawn", player: "cat", row: "7", column: "5" },
                { piece: "pawn", player: "cat", row: "7", column: "6" },
                { piece: "pawn", player: "cat", row: "7", column: "7" },
                { piece: "pawn", player: "cat", row: "7", column: "8" },

                { piece: "rook", player: "cat", row: "8", column: "1" },
                { piece: "bishop", player: "cat", row: "8", column: "2" },
                { piece: "knight", player: "cat", row: "8", column: "3" },
                { piece: "queen", player: "cat", row: "8", column: "4" },
                { piece: "king", player: "cat", row: "8", column: "5" },
                { piece: "knight", player: "cat", row: "8", column: "6" },
                { piece: "bishop", player: "cat", row: "8", column: "7" },
                { piece: "rook", player: "cat", row: "8", column: "8" },
            ];
            window.sessionStorage.setItem("previousState", JSON.stringify(initialState));
            window.sessionStorage.setItem("initialState", JSON.stringify(initialState));
            window.sessionStorage.setItem("state","initial");
            window.location.replace("./game.html");
        }
    });

    // $("#btn-exit").click(function () {
    //     $("#input-player1").val("");
    //     $("#input-player2").val("");
    // });
});
