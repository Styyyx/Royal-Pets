$(document).ready(function () {
    //#region Randomize First Player
    var namePlayer1 = sessionStorage.getItem("player1");
    var namePlayer2 = sessionStorage.getItem("player2");
    var turnPlayer = "";

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


    ReloadColors();

    $("[empty]").each(function () {
        let piece = $(this).attr("piece"),
            player = $(this).attr("player");
        if (piece == "" || player == "") {
            $(this).attr("empty", "true").removeAttr("piece").removeAttr("player");
        } else {
            $(this).css("background-image", "url(\"../res/" + player + "Pieces/" +
                player + "_" + piece + ".png\"").css("background-size", "50px 60px");
        }
    });

    $("[empty]").on("click", function () {
        let thisPlayer = $(this).attr("player"),
            thisPiece = $(this).attr("piece"),
            thisRow = $(this).attr("row"),
            thisColumn = $(this).attr("column");

        if (thisPlayer == turnPlayer) {
            //Unselect currently selected piece
            if (data.row == thisRow && data.column == thisColumn) {
                ReloadColors();
                data = { player: "", piece: "", row: "", column: "" };
            }
            //Select piece
            else {
                ReloadColors();
                $(this).css("background-color", "rgba(0, 128, 0, 0.7)");
                data = { player: thisPlayer, piece: thisPiece, row: thisRow, column: thisColumn };
                ShowMoves();
            }
        }
        //When selecting cell other than own pieces
        else if (
            (data.player != "" && data.piece != "") &&
            (data.player != thisPlayer) &&
            (data.row != thisRow || data.column != thisColumn)) {
            //When selecting other player pieces
            if ($(this).attr("empty") == "false") {
                //When trying to eat
                if (CheckEat(thisRow, thisColumn)) {
                    MovePiece(thisRow, thisColumn);
                    Debug("EAT", thisPlayer, thisPiece, thisRow, thisColumn);
                    data = { player: "", piece: "", row: "", column: "" };
                    EndTurn();
                    ReloadColors();
                }
                //When eat fails
                else {
                    ReloadColors();
                    data = { player: "", piece: "", row: "", column: "" };
                }
            }
            //When selecting empty cells
            else {
                //When trying to move
                if (CheckMove(thisRow, thisColumn)) {
                    MovePiece(thisRow, thisColumn);
                    Debug("MOVE", thisPlayer, thisPiece, thisRow, thisColumn);
                    data = { player: "", piece: "", row: "", column: "" };
                    CheckforCheck();
                    EndTurn();
                    ReloadColors();
                }
                //When move fails
                else {
                    ReloadColors();
                    data = { player: "", piece: "", row: "", column: "" };
                }
            }
        }
    });

    function ReloadColors() {
        $("[empty]").each(function () {
            if ($(this).attr("piece") == "king" && $(this).attr("check") == "true") {
                $(this).css("background-color", "violet");
            } else if ($(this).hasClass("cell-gray")) {
                $(this).css("background-color", "#8A8A8A");
            } else {
                $(this).css("background-color", "#ffffff");
            }
            if ($(this).attr("player") == turnPlayer) {
                $(this).css("cursor", "pointer");
            } else {
                $(this).css("cursor", "auto");
            }
        });
    }

    function CheckMove(thisRow, thisColumn) {
        if (data.piece == "pawn") {
            if (data.player == "dog") {
                if (data.column == thisColumn) {
                    if (data.row == 2) {
                        if (thisRow == 3) {
                            return true;
                        } else if (thisRow == 4 &&
                            ($("[row = \'3\'][column = \'" + thisColumn + "\']").attr("empty") == "true")) {
                            return true;
                        } else { return false; }
                    } else if (((parseInt(data.row)) + 1) == thisRow) {
                        return true;
                    } else { return false; }
                } else { return false; }
            } else if (data.player == "cat") {
                if (data.column == thisColumn) {
                    if (data.row == 7) {
                        if (thisRow == 6) {
                            return true;
                        } else if (thisRow == 5 &&
                            ($("[row = \'6\'][column = \'" + thisColumn + "\']").attr("empty") == "true")) {
                            return true;
                        } else { return false; }
                    } else if (((parseInt(data.row)) - 1) == thisRow) {
                        return true;
                    } else { return false; }
                } else { return false; }
            }
        } else if (data.piece == "rook") {
            let xDist = Math.abs(parseInt(data.column) - parseInt(thisColumn));
            let yDist = Math.abs(parseInt(data.row) - parseInt(thisRow));
            //Vertical travel
            if (xDist == 0) {
                return CheckVertical(thisRow, yDist);
            }
            //Horizontal Travel
            if (yDist == 0) {
                return CheckHorizontal(thisColumn, xDist);
            }
        } else if (data.piece == "knight") {
            let slope = ((Math.abs(parseInt(data.row) - parseInt(thisRow))) / (Math.abs(parseInt(data.column) - parseInt(thisColumn))));
            if (slope == 2 || slope == 0.5) {
                return true;
            }
        } else if (data.piece == "bishop") {
            let yDist = Math.abs(parseInt(data.row) - parseInt(thisRow));
            let xDist = Math.abs(parseInt(data.column) - parseInt(thisColumn));
            let slope = yDist / xDist;
            return CheckDiagonal(thisRow, thisColumn, xDist, yDist, slope);
        } else if (data.piece == "queen") {
            let yDist = Math.abs(parseInt(data.row) - parseInt(thisRow));
            let xDist = Math.abs(parseInt(data.column) - parseInt(thisColumn));
            let slope = yDist / xDist;
            if (xDist == 0) {
                return CheckVertical(thisRow, yDist);
            } else if (yDist == 0) {
                return CheckHorizontal(thisColumn, xDist);
            } else if (slope == 1) {
                return CheckDiagonal(thisRow, thisColumn, xDist, yDist, slope);
            }
        } else if (data.piece == "king") {
            let xDist = Math.abs(parseInt(data.column) - parseInt(thisColumn));
            let yDist = Math.abs(parseInt(data.row) - parseInt(thisRow));
            if ((xDist == 1 && yDist == 0) || (xDist == 0 && yDist == 1) || (xDist == 1 && yDist == 1)) {
                return true;
            } else { return false; }
        }
    }

    function CheckEat(thisRow, thisColumn) {
        if (data.piece == "pawn") {
            if (data.player == "dog") {
                if (((parseInt(data.row) + 1) == thisRow) &&
                    (((parseInt(data.column) - 1) == thisColumn) || ((parseInt(data.column) + 1) == thisColumn))) {
                    return true;
                } else { return false; }
            } else if (data.player == "cat") {
                if (((parseInt(data.row) - 1) == thisRow) &&
                    (((parseInt(data.column) - 1) == thisColumn) || ((parseInt(data.column) + 1) == thisColumn))) {
                    return true;
                } else { return false; }
            }
        } else if (data.piece == "rook") {
            let xDist = Math.abs(parseInt(data.column) - parseInt(thisColumn));
            let yDist = Math.abs(parseInt(data.row) - parseInt(thisRow));

            //Vertical travel
            if (xDist == 0) {
                return CheckVertical(thisRow, yDist);
            }
            //Horizontal Travel
            if (yDist == 0) {
                return CheckHorizontal(thisColumn, xDist);
            }
        } else if (data.piece == "knight") {
            let slope = ((Math.abs(parseInt(data.row) - parseInt(thisRow))) / (Math.abs(parseInt(data.column) - parseInt(thisColumn))));
            if (slope == 2 || slope == 0.5) {
                return true;
            }
        } else if (data.piece == "bishop") {
            let yDist = Math.abs(parseInt(data.row) - parseInt(thisRow));
            let xDist = Math.abs(parseInt(data.column) - parseInt(thisColumn));
            let slope = yDist / xDist;
            return CheckDiagonal(thisRow, thisColumn, xDist, yDist, slope);
        } else if (data.piece == "queen") {
            let yDist = Math.abs(parseInt(data.row) - parseInt(thisRow));
            let xDist = Math.abs(parseInt(data.column) - parseInt(thisColumn));
            let slope = yDist / xDist;
            if (xDist == 0) {
                return CheckVertical(thisRow, yDist);
            } else if (yDist == 0) {
                return CheckHorizontal(thisColumn, xDist);
            } else if (slope == 1) {
                return CheckDiagonal(thisRow, thisColumn, xDist, yDist, slope);
            } else {
                return false;
            }
        }
    }

    function ShowMoves() {
        if (data.piece == "pawn") {
            if (data.player == "dog") {
                //Showing possible eats
                if ($("[row = \'" + (parseInt(data.row) + 1) + "\'][column = \'" + (parseInt(data.column) + 1) + "\']").attr("empty") == "false" &&
                    $("[row = \'" + (parseInt(data.row) + 1) + "\'][column = \'" + (parseInt(data.column) + 1) + "\']").attr("player") != turnPlayer) {
                    $("[row = \'" + (parseInt(data.row) + 1) + "\'][column = \'" + (parseInt(data.column) + 1) + "\']").css("background-color", "red");
                }
                if ($("[row = \'" + (parseInt(data.row) + 1) + "\'][column = \'" + (parseInt(data.column) - 1) + "\']").attr("empty") == "false" &&
                    $("[row = \'" + (parseInt(data.row) + 1) + "\'][column = \'" + (parseInt(data.column) - 1) + "\']").attr("player") != turnPlayer) {
                    $("[row = \'" + (parseInt(data.row) + 1) + "\'][column = \'" + (parseInt(data.column) - 1) + "\']").css("background-color", "red");
                }

                //Showing possible moves
                if (data.row == "2") {
                    if ($("[row = \'3\'][column = \'" + data.column + "\']").attr("empty") == "true") {
                        $("[row = \'" + (parseInt(data.row) + 1) + "\'][column = \'" + data.column + "\']").css("background-color", "blue");
                        if ($("[row = \'4\'][column = \'" + data.column + "\']").attr("empty") == "true") {
                            $("[row = \'" + (parseInt(data.row) + 2) + "\'][column = \'" + data.column + "\']").css("background-color", "blue");
                        }
                    }

                } else {
                    if ($("[row = \'" + (parseInt(data.row) + 1) + "\'][column = \'" + data.column + "\']").attr("empty") == "true") {
                        $("[row = \'" + (parseInt(data.row) + 1) + "\'][column = \'" + data.column + "\']").css("background-color", "blue");
                    }
                }
            } else if (data.player == "cat") {
                //Showing possible eats
                if ($("[row = \'" + (parseInt(data.row) - 1) + "\'][column = \'" + (parseInt(data.column) + 1) + "\']").attr("empty") == "false" &&
                    $("[row = \'" + (parseInt(data.row) - 1) + "\'][column = \'" + (parseInt(data.column) + 1) + "\']").attr("player") != turnPlayer) {
                    $("[row = \'" + (parseInt(data.row) - 1) + "\'][column = \'" + (parseInt(data.column) + 1) + "\']").css("background-color", "red");
                }
                if ($("[row = \'" + (parseInt(data.row) - 1) + "\'][column = \'" + (parseInt(data.column) - 1) + "\']").attr("empty") == "false" &&
                    $("[row = \'" + (parseInt(data.row) - 1) + "\'][column = \'" + (parseInt(data.column) - 1) + "\']").attr("player") != turnPlayer) {
                    $("[row = \'" + (parseInt(data.row) - 1) + "\'][column = \'" + (parseInt(data.column) - 1) + "\']").css("background-color", "red");
                }

                //Showing possible moves
                if (data.row == "7") {
                    if ($("[row = \'6\'][column = \'" + data.column + "\']").attr("empty") == "true") {
                        $("[row = \'6\'][column = \'" + data.column + "\']").css("background-color", "blue");
                        if ($("[row = \'5\'][column = \'" + data.column + "\']").attr("empty") == "true") {
                            $("[row = \'5\'][column = \'" + data.column + "\']").css("background-color", "blue");
                        }
                    }

                } else {
                    if ($("[row = \'" + (parseInt(data.row) - 1) + "\'][column = \'" + data.column + "\']").attr("empty") == "true") {
                        $("[row = \'" + (parseInt(data.row) - 1) + "\'][column = \'" + data.column + "\']").css("background-color", "blue");
                    }
                }
            }
        } else if (data.piece == "rook") {
            //Upwards
            for (let i = parseInt(data.row) - 1; i >= 1; i--) {
                if ($("[row = \'" + i + "\'][column = \'" + data.column + "\']").attr("empty") == "false") {
                    if ($("[row = \'" + i + "\'][column = \'" + data.column + "\']").attr("player") != turnPlayer) {
                        $("[row = \'" + i + "\'][column = \'" + data.column + "\']").css("background-color", "red");
                    }
                    break;
                } else {
                    $("[row = \'" + i + "\'][column = \'" + data.column + "\']").css("background", "blue");
                }
            }
            //Downwards
            for (let i = parseInt(data.row) + 1; i <= 8; i++) {
                if ($("[row = \'" + i + "\'][column = \'" + data.column + "\']").attr("empty") == "false") {
                    if ($("[row = \'" + i + "\'][column = \'" + data.column + "\']").attr("player") != turnPlayer) {
                        $("[row = \'" + i + "\'][column = \'" + data.column + "\']").css("background-color", "red");
                    }
                    break;
                } else {
                    $("[row = \'" + i + "\'][column = \'" + data.column + "\']").css("background", "blue");
                }
            }
            //Leftwards
            for (let i = parseInt(data.column) - 1; i >= 1; i--) {
                if ($("[row = \'" + data.row + "\'][column = \'" + i + "\']").attr("empty") == "false") {
                    if ($("[row = \'" + data.row + "\'][column = \'" + i + "\']").attr("player") != turnPlayer) {
                        $("[row = \'" + data.row + "\'][column = \'" + i + "\']").css("background-color", "red");
                    }
                    break;
                } else {
                    $("[row = \'" + data.row + "\'][column = \'" + i + "\']").css("background", "blue");
                }
            }
            //Rightwards
            for (let i = parseInt(data.column) + 1; i <= 8; i++) {
                if ($("[row = \'" + data.row + "\'][column = \'" + i + "\']").attr("empty") == "false") {
                    if ($("[row = \'" + data.row + "\'][column = \'" + i + "\']").attr("player") != turnPlayer) {
                        $("[row = \'" + data.row + "\'][column = \'" + i + "\']").css("background-color", "red");
                    }
                    break;
                } else {
                    $("[row = \'" + data.row + "\'][column = \'" + i + "\']").css("background", "blue");
                }
            }
        } else if (data.piece == "knight") {
            if ($("[row=\'" + (parseInt(data.row) + 2) + "\'][column=\'" + (parseInt(data.column) + 1) + "\']").attr("empty") == "true") {
                $("[row=\'" + (parseInt(data.row) + 2) + "\'][column=\'" + (parseInt(data.column) + 1) + "\']").css("background-color", "blue");
            } else if ($("[row=\'" + (parseInt(data.row) + 2) + "\'][column=\'" + (parseInt(data.column) + 1) + "\']").attr("player") != turnPlayer) {
                $("[row=\'" + (parseInt(data.row) + 2) + "\'][column=\'" + (parseInt(data.column) + 1) + "\']").css("background-color", "red");
            }
            if ($("[row=\'" + (parseInt(data.row) + 2) + "\'][column=\'" + (parseInt(data.column) - 1) + "\']").attr("empty") == "true") {
                $("[row=\'" + (parseInt(data.row) + 2) + "\'][column=\'" + (parseInt(data.column) - 1) + "\']").css("background-color", "blue");
            } else if ($("[row=\'" + (parseInt(data.row) + 2) + "\'][column=\'" + (parseInt(data.column) - 1) + "\']").attr("player") != turnPlayer) {
                $("[row=\'" + (parseInt(data.row) + 2) + "\'][column=\'" + (parseInt(data.column) - 1) + "\']").css("background-color", "red");
            }
            if ($("[row=\'" + (parseInt(data.row) - 2) + "\'][column=\'" + (parseInt(data.column) + 1) + "\']").attr("empty") == "true") {
                $("[row=\'" + (parseInt(data.row) - 2) + "\'][column=\'" + (parseInt(data.column) + 1) + "\']").css("background-color", "blue");
            } else if ($("[row=\'" + (parseInt(data.row) - 2) + "\'][column=\'" + (parseInt(data.column) + 1) + "\']").attr("player") != turnPlayer) {
                $("[row=\'" + (parseInt(data.row) - 2) + "\'][column=\'" + (parseInt(data.column) + 1) + "\']").css("background-color", "red");
            }
            if ($("[row=\'" + (parseInt(data.row) - 2) + "\'][column=\'" + (parseInt(data.column) - 1) + "\']").attr("empty") == "true") {
                $("[row=\'" + (parseInt(data.row) - 2) + "\'][column=\'" + (parseInt(data.column) - 1) + "\']").css("background-color", "blue");
            } else if ($("[row=\'" + (parseInt(data.row) - 2) + "\'][column=\'" + (parseInt(data.column) - 1) + "\']").attr("player") != turnPlayer) {
                $("[row=\'" + (parseInt(data.row) - 2) + "\'][column=\'" + (parseInt(data.column) - 1) + "\']").css("background-color", "red");
            }
            if ($("[row=\'" + (parseInt(data.row) + 1) + "\'][column=\'" + (parseInt(data.column) + 2) + "\']").attr("empty") == "true") {
                $("[row=\'" + (parseInt(data.row) + 1) + "\'][column=\'" + (parseInt(data.column) + 2) + "\']").css("background-color", "blue");
            } else if ($("[row=\'" + (parseInt(data.row) + 1) + "\'][column=\'" + (parseInt(data.column) + 2) + "\']").attr("player") != turnPlayer) {
                $("[row=\'" + (parseInt(data.row) + 1) + "\'][column=\'" + (parseInt(data.column) + 2) + "\']").css("background-color", "red");
            }
            if ($("[row=\'" + (parseInt(data.row) - 1) + "\'][column=\'" + (parseInt(data.column) + 2) + "\']").attr("empty") == "true") {
                $("[row=\'" + (parseInt(data.row) - 1) + "\'][column=\'" + (parseInt(data.column) + 2) + "\']").css("background-color", "blue");
            } else if ($("[row=\'" + (parseInt(data.row) - 1) + "\'][column=\'" + (parseInt(data.column) + 2) + "\']").attr("player") != turnPlayer) {
                $("[row=\'" + (parseInt(data.row) - 1) + "\'][column=\'" + (parseInt(data.column) + 2) + "\']").css("background-color", "red");
            }
            if ($("[row=\'" + (parseInt(data.row) + 1) + "\'][column=\'" + (parseInt(data.column) - 2) + "\']").attr("empty") == "true") {
                $("[row=\'" + (parseInt(data.row) + 1) + "\'][column=\'" + (parseInt(data.column) - 2) + "\']").css("background-color", "blue");
            } else if ($("[row=\'" + (parseInt(data.row) + 1) + "\'][column=\'" + (parseInt(data.column) - 2) + "\']").attr("player") != turnPlayer) {
                $("[row=\'" + (parseInt(data.row) + 1) + "\'][column=\'" + (parseInt(data.column) - 2) + "\']").css("background-color", "red");
            }
            if ($("[row=\'" + (parseInt(data.row) - 1) + "\'][column=\'" + (parseInt(data.column) - 2) + "\']").attr("empty") == "true") {
                $("[row=\'" + (parseInt(data.row) - 1) + "\'][column=\'" + (parseInt(data.column) - 2) + "\']").css("background-color", "blue");
            } else if ($("[row=\'" + (parseInt(data.row) - 1) + "\'][column=\'" + (parseInt(data.column) - 2) + "\']").attr("player") != turnPlayer) {
                $("[row=\'" + (parseInt(data.row) - 1) + "\'][column=\'" + (parseInt(data.column) - 2) + "\']").css("background-color", "red");
            }
        } else if (data.piece == "bishop") {
            //Northeast
            for (let i = 1; i > 0; i++) {
                if ($("[row=\'" + (parseInt(data.row) + i) + "\'][column=\'" + (parseInt(data.column) + i) + "\']").attr("empty") == "true") {
                    $("[row=\'" + (parseInt(data.row) + i) + "\'][column=\'" + (parseInt(data.column) + i) + "\']").css("background-color", "blue");
                } else if ($("[row=\'" + (parseInt(data.row) + i) + "\'][column=\'" + (parseInt(data.column) + i) + "\']").attr("player") != turnPlayer) {
                    $("[row=\'" + (parseInt(data.row) + i) + "\'][column=\'" + (parseInt(data.column) + i) + "\']").css("background-color", "red");
                    break;
                }
                else { break; }
            }
            //Northwest
            for (let i = 1; i > 0; i++) {
                if ($("[row=\'" + (parseInt(data.row) + i) + "\'][column=\'" + (parseInt(data.column) - i) + "\']").attr("empty") == "true") {
                    $("[row=\'" + (parseInt(data.row) + i) + "\'][column=\'" + (parseInt(data.column) - i) + "\']").css("background-color", "blue");
                } else if ($("[row=\'" + (parseInt(data.row) + i) + "\'][column=\'" + (parseInt(data.column) - i) + "\']").attr("player") != turnPlayer) {
                    $("[row=\'" + (parseInt(data.row) + i) + "\'][column=\'" + (parseInt(data.column) - i) + "\']").css("background-color", "red");
                    break;
                } else { break; }
            }
            //Southwest
            for (let i = 1; i > 0; i++) {
                if ($("[row=\'" + (parseInt(data.row) - i) + "\'][column=\'" + (parseInt(data.column) - i) + "\']").attr("empty") == "true") {
                    $("[row=\'" + (parseInt(data.row) - i) + "\'][column=\'" + (parseInt(data.column) - i) + "\']").css("background-color", "blue");
                } else if ($("[row=\'" + (parseInt(data.row) - i) + "\'][column=\'" + (parseInt(data.column) - i) + "\']").attr("player") != turnPlayer) {
                    $("[row=\'" + (parseInt(data.row) - i) + "\'][column=\'" + (parseInt(data.column) - i) + "\']").css("background-color", "red");
                    break;
                } else { break; }
            }
            //Southeast
            for (let i = 1; i > 0; i++) {
                if ($("[row=\'" + (parseInt(data.row) - i) + "\'][column=\'" + (parseInt(data.column) + i) + "\']").attr("empty") == "true") {
                    $("[row=\'" + (parseInt(data.row) - i) + "\'][column=\'" + (parseInt(data.column) + i) + "\']").css("background-color", "blue");
                } else if ($("[row=\'" + (parseInt(data.row) - i) + "\'][column=\'" + (parseInt(data.column) + i) + "\']").attr("player") != turnPlayer) {
                    $("[row=\'" + (parseInt(data.row) - i) + "\'][column=\'" + (parseInt(data.column) + i) + "\']").css("background-color", "red");
                    break;
                } else { break; }
            }

        } else if (data.piece == "queen") {
            //Upwards
            for (let i = parseInt(data.row) - 1; i >= 1; i--) {
                if ($("[row = \'" + i + "\'][column = \'" + data.column + "\']").attr("empty") == "false") {
                    if ($("[row = \'" + i + "\'][column = \'" + data.column + "\']").attr("player") != turnPlayer) {
                        $("[row = \'" + i + "\'][column = \'" + data.column + "\']").css("background-color", "red");
                    }
                    break;
                } else {
                    $("[row = \'" + i + "\'][column = \'" + data.column + "\']").css("background", "blue");
                }
            }
            //Downwards
            for (let i = parseInt(data.row) + 1; i <= 8; i++) {
                if ($("[row = \'" + i + "\'][column = \'" + data.column + "\']").attr("empty") == "false") {
                    if ($("[row = \'" + i + "\'][column = \'" + data.column + "\']").attr("player") != turnPlayer) {
                        $("[row = \'" + i + "\'][column = \'" + data.column + "\']").css("background-color", "red");
                    }
                    break;
                } else {
                    $("[row = \'" + i + "\'][column = \'" + data.column + "\']").css("background", "blue");
                }
            }
            //Leftwards
            for (let i = parseInt(data.column) - 1; i >= 1; i--) {
                if ($("[row = \'" + data.row + "\'][column = \'" + i + "\']").attr("empty") == "false") {
                    if ($("[row = \'" + data.row + "\'][column = \'" + i + "\']").attr("player") != turnPlayer) {
                        $("[row = \'" + data.row + "\'][column = \'" + i + "\']").css("background-color", "red");
                    }
                    break;
                } else {
                    $("[row = \'" + data.row + "\'][column = \'" + i + "\']").css("background", "blue");
                }
            }
            //Rightwards
            for (let i = parseInt(data.column) + 1; i <= 8; i++) {
                if ($("[row = \'" + data.row + "\'][column = \'" + i + "\']").attr("empty") == "false") {
                    if ($("[row = \'" + data.row + "\'][column = \'" + i + "\']").attr("player") != turnPlayer) {
                        $("[row = \'" + data.row + "\'][column = \'" + i + "\']").css("background-color", "red");
                    }
                    break;
                } else {
                    $("[row = \'" + data.row + "\'][column = \'" + i + "\']").css("background", "blue");
                }
            }
            //Northeast
            for (let i = 1; i > 0; i++) {
                if ($("[row=\'" + (parseInt(data.row) + i) + "\'][column=\'" + (parseInt(data.column) + i) + "\']").attr("empty") == "true") {
                    $("[row=\'" + (parseInt(data.row) + i) + "\'][column=\'" + (parseInt(data.column) + i) + "\']").css("background-color", "blue");
                } else if ($("[row=\'" + (parseInt(data.row) + i) + "\'][column=\'" + (parseInt(data.column) + i) + "\']").attr("player") != turnPlayer) {
                    $("[row=\'" + (parseInt(data.row) + i) + "\'][column=\'" + (parseInt(data.column) + i) + "\']").css("background-color", "red");
                    break;
                }
                else { break; }
            }
            //Northwest
            for (let i = 1; i > 0; i++) {
                if ($("[row=\'" + (parseInt(data.row) + i) + "\'][column=\'" + (parseInt(data.column) - i) + "\']").attr("empty") == "true") {
                    $("[row=\'" + (parseInt(data.row) + i) + "\'][column=\'" + (parseInt(data.column) - i) + "\']").css("background-color", "blue");
                } else if ($("[row=\'" + (parseInt(data.row) + i) + "\'][column=\'" + (parseInt(data.column) - i) + "\']").attr("player") != turnPlayer) {
                    $("[row=\'" + (parseInt(data.row) + i) + "\'][column=\'" + (parseInt(data.column) - i) + "\']").css("background-color", "red");
                    break;
                } else { break; }
            }
            //Southwest
            for (let i = 1; i > 0; i++) {
                if ($("[row=\'" + (parseInt(data.row) - i) + "\'][column=\'" + (parseInt(data.column) - i) + "\']").attr("empty") == "true") {
                    $("[row=\'" + (parseInt(data.row) - i) + "\'][column=\'" + (parseInt(data.column) - i) + "\']").css("background-color", "blue");
                } else if ($("[row=\'" + (parseInt(data.row) - i) + "\'][column=\'" + (parseInt(data.column) - i) + "\']").attr("player") != turnPlayer) {
                    $("[row=\'" + (parseInt(data.row) - i) + "\'][column=\'" + (parseInt(data.column) - i) + "\']").css("background-color", "red");
                    break;
                } else { break; }
            }

            //Southeast
            for (let i = 1; i > 0; i++) {
                if ($("[row=\'" + (parseInt(data.row) - i) + "\'][column=\'" + (parseInt(data.column) + i) + "\']").attr("empty") == "true") {
                    $("[row=\'" + (parseInt(data.row) - i) + "\'][column=\'" + (parseInt(data.column) + i) + "\']").css("background-color", "blue");
                } else if ($("[row=\'" + (parseInt(data.row) - i) + "\'][column=\'" + (parseInt(data.column) + i) + "\']").attr("player") != turnPlayer) {
                    $("[row=\'" + (parseInt(data.row) - i) + "\'][column=\'" + (parseInt(data.column) + i) + "\']").css("background-color", "red");
                    break;
                } else { break; }
            }
        } else if (data.piece == "king") {
            //North
            if (($("[row=\'" + (parseInt(data.row) - 1) + "\'][column=\'" + (parseInt(data.column)) + "\']").attr("empty") == "true") &&
                ($("[row=\'" + (parseInt(data.row) - 1) + "\'][column=\'" + (parseInt(data.column)) + "\']").attr("check") != "true")) {
                $("[row=\'" + (parseInt(data.row) - 1) + "\'][column=\'" + (parseInt(data.column)) + "\']").css("background-color", "blue");
            } else if ($("[row=\'" + (parseInt(data.row) - 1) + "\'][column=\'" + (parseInt(data.column)) + "\']").attr("player") != turnPlayer) {
                $("[row=\'" + (parseInt(data.row) - 1) + "\'][column=\'" + (parseInt(data.column)) + "\']").css("background-color", "red");
            }
            //Northeast
            if (($("[row=\'" + (parseInt(data.row) - 1) + "\'][column=\'" + (parseInt(data.column) + 1) + "\']").attr("empty") == "true") &&
                ($("[row=\'" + (parseInt(data.row) - 1) + "\'][column=\'" + (parseInt(data.column) + 1) + "\']").attr("check") != "true")) {
                $("[row=\'" + (parseInt(data.row) - 1) + "\'][column=\'" + (parseInt(data.column) + 1) + "\']").css("background-color", "blue");
            } else if ($("[row=\'" + (parseInt(data.row) - 1) + "\'][column=\'" + (parseInt(data.column) + 1) + "\']").attr("player") != turnPlayer) {
                $("[row=\'" + (parseInt(data.row) - 1) + "\'][column=\'" + (parseInt(data.column) + 1) + "\']").css("background-color", "red");
            }
            //East
            if (($("[row=\'" + (parseInt(data.row)) + "\'][column=\'" + (parseInt(data.column) + 1) + "\']").attr("empty") == "true") &&
                ($("[row=\'" + (parseInt(data.row)) + "\'][column=\'" + (parseInt(data.column) + 1) + "\']").attr("check") != "true")) {
                $("[row=\'" + (parseInt(data.row)) + "\'][column=\'" + (parseInt(data.column) + 1) + "\']").css("background-color", "blue");
            } else if ($("[row=\'" + (parseInt(data.row)) + "\'][column=\'" + (parseInt(data.column) + 1) + "\']").attr("player") != turnPlayer) {
                $("[row=\'" + (parseInt(data.row)) + "\'][column=\'" + (parseInt(data.column) + 1) + "\']").css("background-color", "red");
            }
            //Southeast
            if (($("[row=\'" + (parseInt(data.row) + 1) + "\'][column=\'" + (parseInt(data.column) + 1) + "\']").attr("empty") == "true") &&
                ($("[row=\'" + (parseInt(data.row) + 1) + "\'][column=\'" + (parseInt(data.column) + 1) + "\']").attr("check") != "true")) {
                $("[row=\'" + (parseInt(data.row) + 1) + "\'][column=\'" + (parseInt(data.column) + 1) + "\']").css("background-color", "blue");
            } else if ($("[row=\'" + (parseInt(data.row) + 1) + "\'][column=\'" + (parseInt(data.column) + 1) + "\']").attr("player") != turnPlayer) {
                $("[row=\'" + (parseInt(data.row) + 1) + "\'][column=\'" + (parseInt(data.column) + 1) + "\']").css("background-color", "red");
            }
            //South+1
            if (($("[row=\'" + (parseInt(data.row) + 1) + "\'][column=\'" + (parseInt(data.column)) + "\']").attr("empty") == "true") &&
                ($("[row=\'" + (parseInt(data.row) + 1) + "\'][column=\'" + (parseInt(data.column)) + "\']").attr("check") != "true")) {
                $("[row=\'" + (parseInt(data.row) + 1) + "\'][column=\'" + (parseInt(data.column)) + "\']").css("background-color", "blue");
            } else if ($("[row=\'" + (parseInt(data.row) + 1) + "\'][column=\'" + (parseInt(data.column)) + "\']").attr("player") != turnPlayer) {
                $("[row=\'" + (parseInt(data.row) + 1) + "\'][column=\'" + (parseInt(data.column)) + "\']").css("background-color", "red");
            }
            //Southwest
            if (($("[row=\'" + (parseInt(data.row) + 1) + "\'][column=\'" + (parseInt(data.column) - 1) + "\']").attr("empty") == "true") &&
                ($("[row=\'" + (parseInt(data.row) + 1) + "\'][column=\'" + (parseInt(data.column) - 1) + "\']").attr("check") != "true")) {
                $("[row=\'" + (parseInt(data.row) + 1) + "\'][column=\'" + (parseInt(data.column) - 1) + "\']").css("background-color", "blue");
            } else if ($("[row=\'" + (parseInt(data.row) + 1) + "\'][column=\'" + (parseInt(data.column) - 1) + "\']").attr("player") != turnPlayer) {
                $("[row=\'" + (parseInt(data.row) + 1) + "\'][column=\'" + (parseInt(data.column) - 1) + "\']").css("background-color", "red");
            }
            //West
            if (($("[row=\'" + (parseInt(data.row)) + "\'][column=\'" + (parseInt(data.column) - 1) + "\']").attr("empty") == "true") &&
                ($("[row=\'" + (parseInt(data.row)) + "\'][column=\'" + (parseInt(data.column) - 1) + "\']").attr("check") != "true")) {
                $("[row=\'" + (parseInt(data.row)) + "\'][column=\'" + (parseInt(data.column) - 1) + "\']").css("background-color", "blue");
            } else if ($("[row=\'" + (parseInt(data.row)) + "\'][column=\'" + (parseInt(data.column) - 1) + "\']").attr("player") != turnPlayer) {
                $("[row=\'" + (parseInt(data.row)) + "\'][column=\'" + (parseInt(data.column) - 1) + "\']").css("background-color", "red");
            }
            //Northwest
            if (($("[row=\'" + (parseInt(data.row) - 1) + "\'][column=\'" + (parseInt(data.column) - 1) + "\']").attr("empty") == "true") &&
                ($("[row=\'" + (parseInt(data.row) - 1) + "\'][column=\'" + (parseInt(data.column) - 1) + "\']").attr("check") != "true")) {
                $("[row=\'" + (parseInt(data.row) - 1) + "\'][column=\'" + (parseInt(data.column) - 1) + "\']").css("background-color", "blue");
            } else if ($("[row=\'" + (parseInt(data.row) - 1) + "\'][column=\'" + (parseInt(data.column) - 1) + "\']").attr("player") != turnPlayer) {
                $("[row=\'" + (parseInt(data.row) - 1) + "\'][column=\'" + (parseInt(data.column) - 1) + "\']").css("background-color", "red");
            }
        }
    }

    function MovePiece(thisRow, thisColumn) {
        $("[row = \'" + data.row + "\'][column = \'" + data.column + "\']")
            .attr("empty", "true")
            .removeAttr("piece")
            .removeAttr("player")
            .css("background-image", "")
            .css("background-size", "");
        $("[row = \'" + thisRow + "\'][column = \'" + thisColumn + "\']")
            .attr("empty", "false")
            .attr("piece", data.piece)
            .attr("player", data.player)
            .css("background-image", "url(\"../res/" + data.player + "Pieces/" + data.player + "_" + data.piece + ".png\"")
            .css("background-size", "50px 60px")
            .css("background-repeat", "no-repeat")
            .css("background-position", "center");
    }

    function CheckHorizontal(thisColumn, xDist) {
        //Leftwards
        if (parseInt(data.column) > parseInt(thisColumn)) {
            let allow = true;
            for (let i = 1; i < xDist; i++) {
                if ($("[row = \'" + data.row + "\'][column = \'" + (parseInt(data.column) - i) + "\']").attr("empty") == "false") {
                    allow = false;
                }
            }
            return allow;
        }
        //Rightwards
        else if (parseInt(data.column) < parseInt(thisColumn)) {
            let allow = true;
            for (let i = 1; i < xDist; i++) {
                if ($("[row = \'" + data.row + "\'][column = \'" + (parseInt(data.column) + i) + "\']").attr("empty") == "false") {
                    allow = false;
                }
            }
            return allow;
        }
    }

    function CheckVertical(thisRow, yDist) {
        //Upwards
        if (parseInt(data.row) > parseInt(thisRow)) {
            let allow = true;
            for (let i = 1; i < yDist; i++) {
                if ($("[row = \'" + (parseInt(data.row) - i) + "\'][column = \'" + data.column + "\']").attr("empty") == "false") {
                    allow = false;
                }
            }
            return allow;
        }
        //Downwards
        else if (parseInt(data.row) < parseInt(thisRow)) {
            let allow = true;
            for (let i = 1; i < yDist; i++) {
                if ($("[row = \'" + (parseInt(data.row) + i) + "\'][column = \'" + data.column + "\']").attr("empty") == "false") {
                    allow = false;
                }
            }
            return allow;
        }

    }

    function CheckDiagonal(thisRow, thisColumn, xDist, yDist, slope) {

        if (slope == 1) {
            //Northeast
            if ((parseInt(data.row) > parseInt(thisRow)) && (parseInt(data.column) < parseInt(thisColumn))) {
                let allow = true;
                for (let i = 1; i < yDist; i++) {
                    if ($("[row=\'" + (parseInt(data.row) - i) + "\'][column=\'" + (parseInt(data.column) + i) + "\']").attr("empty") == "false") {
                        allow = false;
                        break;
                    }

                }
                return allow;
            }

            //Northwest
            if ((parseInt(data.row) > parseInt(thisRow)) && (parseInt(data.column) > parseInt(thisColumn))) {
                let allow = true;
                for (let i = 1; i < yDist; i++) {
                    if ($("[row=\'" + (parseInt(data.row) - i) + "\'][column=\'" + (parseInt(data.column) - i) + "\']").attr("empty") == "false") {
                        allow = false;
                        break;
                    }
                }
                return allow;
            }

            //Southwest
            if ((parseInt(data.row) < parseInt(thisRow)) && (parseInt(data.column) > parseInt(thisColumn))) {
                let allow = true;
                for (let i = 1; i < yDist; i++) {
                    if ($("[row=\'" + (parseInt(data.row) + i) + "\'][column=\'" + (parseInt(data.column) - i) + "\']").attr("empty") == "false") {
                        allow = false;
                        break;
                    }
                }
                return allow;
            }

            //Southeast
            if ((parseInt(data.row) < parseInt(thisRow)) && (parseInt(data.column) < parseInt(thisColumn))) {
                let allow = true;
                for (let i = 1; i < yDist; i++) {
                    if ($("[row=\'" + (parseInt(data.row) + i) + "\'][column=\'" + (parseInt(data.column) + i) + "\']").attr("empty") == "false") {
                        allow = false;
                        break;
                    }
                }
                return allow;
            }
        }
    }

    function EndTurn() {
        if (turnPlayer == "dog") {
            turnPlayer = "cat";
            $("#playerName").text(namePlayer2);
        } else {
            turnPlayer = "dog";
            $("#playerName").text(namePlayer1);
        }
        $("#playerImg").attr("src", "../res/" + turnPlayer + "Pieces/" + turnPlayer + "_king.png");
    }

    function Debug(action, thisPlayer, thisPiece, thisRow, thisColumn) {
        console.log(action + " \nFrom row : " + data.row + " || To row : " + thisRow +
            "\n From column : " + data.column + " || To column : " + thisColumn +
            "\n Piece moved : " + data.player + " - " + data.piece +
            "\n Piece eaten : " + thisPlayer + " - " + thisPiece);
    }

    function CheckforCheck() {
        /*
            On move or eat, check this' piece future possible eats.
            If possible eat is enemy king, mark that for check.
        */
        $("[empty=\'false\']").each(function () {
            let thisPlayer = $(this).attr("player"),
                thisPiece = $(this).attr("piece"),
                thisRow = $(this).attr("row"),
                thisColumn = $(this).attr("column");
            // console.log("Player = " + thisPlayer + "\nPiece = " + thisPiece + "\nRow = " + thisRow + "\nColumn = " + thisColumn);
            if (thisPiece == "pawn") {

            } else if (thisPiece == "knight") {

            } else if (thisPiece == "rook") {

            } else if (thisPiece == "bishop") {

            } else if (thisPiece == "queen") {
                //Check North
                for (let i = (parseInt(thisRow) - 1); i > 0; i--) {
                    if ($("[row=\'" + i + "\'][column=\'" + thisColumn + "\']").attr("empty") == "false") {
                        if (($("[row=\'" + i + "\'][column=\'" + thisColumn + "\']").attr("piece") == "king") &&
                            ($("[row=\'" + i + "\'][column=\'" + thisColumn + "\']").attr("player") == thisPlayer)) {
                            // Position of king
                            $("[row=\'" + i + "\'][column=\'" + thisColumn + "\']").attr("check", "true");
                            // One cell south of king
                            $("[row=\'" + (i + 1) + "\'][column=\'" + thisColumn + "\']").attr("check", "true");
                            break;
                        }
                        // If cell is occupied and blocking for a king
                        else if (($("[row=\'" + (i - 1) + "\'][column=\'" + thisColumn + "\']").attr("piece") == "king") &&
                            ($("[row=\'" + (i - 1) + "\'][column=\'" + thisColumn + "\']").attr("player") != thisPlayer)) {
                            $("[row=\'" + i + "\'][column=\'" + thisColumn + "\']").removeAttr("check");
                            $("[row=\'" + (i - 1) + "\'][column=\'" + thisColumn + "\']").removeAttr("check");
                        }
                    } else { continue; }
                }
            }
        });
    }

    function CheckMate() {
        alert("[Checkmate] " + turnPlayer + " has WON!");
        window.location.replace("./home.html");
    }

    function EndangerKing() {
        $("[empty = false]").each(function () {

        });
    }
});