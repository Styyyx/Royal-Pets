$(document).ready(function () {
    //#region Randomize First Player
    var namePlayer1 = sessionStorage.getItem("player1");
    var namePlayer2 = sessionStorage.getItem("player2");
    var turnPlayer;

    if (Math.round(Math.random()) == 0) {
        turnPlayer = "dog";
        $("#playerName").text(namePlayer1);
    } else {
        turnPlayer = "cat";
        $("#playerName").text(namePlayer2);
    }
    $("#playerImg").attr("src", "../res/" + turnPlayer + "Pieces/" + turnPlayer + "_king.png");
    //#endregion

    //#region Global Variables
    var usernames = { dog: namePlayer1, cat: namePlayer2 };
    var data = { player: "", piece: "", row: "", column: "" };
    var columnIndicator = ["a", "b", "c", "d", "e", "f", "g", "h"];
    //#endregion

    //#region Slide Menu
    $(".burger").on("mouseover", function () {
        $(".menu").css("display", "flex");
    });
    $(".menu").on("mouseleave", function () {
        $(".menu").css("display", "none");
    });

    $("#btnHome").on("click", function () {
        window.location.replace("./home.html");
    });
    // #endregion

    $("[empty]").each(function () {
        let piece = $(this).attr("piece"),
            player = $(this).attr("player");
        if (piece == "" || player == "") {
            $(this).attr("empty", "true").removeAttr("piece").removeAttr("player");
        } else {
            $(this).css("background-image", "url(\"../res/" + player + "Pieces/" +
                player + "_" + piece + ".png\"").css("background-size", "60px 60px");
        }
    });

    $("[empty]").on("click", function () {
        let thisPlayer = $(this).attr("player"),
            thisPiece = $(this).attr("piece"),
            thisRow = $(this).attr("row"),
            thisColumn = $(this).attr("column");

        if (thisPlayer == turnPlayer) {
            $("[empty=false]").each(function () {
                if ($(this).hasClass("cell-gray")) {
                    $(this).css("background-color", "#8A8A8A");
                } else {
                    $(this).css("background-color", "#ffffff");
                }
            });
            $(this).css("background-color", "rgba(0, 128, 0, 0.7)");
            data = { player: thisPlayer, piece: thisPiece, row: thisRow, column: thisColumn };
        } else if (
            (data.player != "" && data.piece != "") &&
            (data.player != thisPlayer && data.piece != thisPiece) &&
            (data.row != thisRow || data.column != thisColumn)) {
            $("[row = \'" + data.row + "\'][column = \'" + data.column + "\']").attr("empty", "true")
                .removeAttr("piece").removeAttr("player").css("background-image", "");
            $(this).attr("empty", "false")
                .attr("piece", data.piece).attr("player", data.player);
            $(this).css("background-image", "url(\"../res/" + data.player + "Pieces/" +
                data.player + "_" + data.piece + ".png\"").css("background-size", "60px 60px");
            $("[empty]").each(function () {
                if ($(this).hasClass("cell-gray")) {
                    $(this).css("background-color", "#8A8A8A");
                } else {
                    $(this).css("background-color", "#ffffff");
                }
            });
        } else {
            $("[empty]").each(function () {
                if ($(this).hasClass("cell-gray")) {
                    $(this).css("background-color", "#8A8A8A");
                } else {
                    $(this).css("background-color", "#ffffff");
                }
            });
        }
    });

    $("[empty=false]").on("mouseover", function () {
        if ($(this).attr("player") == turnPlayer) {
            $(this).css("cursor", "pointer");
        }
    });

    function CheckMove(){

    }
});