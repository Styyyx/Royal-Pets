/** 
 *  Created by Patrick Alcantara on March 2020
 *  Email: pema.alcantara@gmail.com
 * 
 *  Graphics by : Reanne Bernardo
 *  Email: reannemaebernardo@gmail.com
 * 
 *  [Got some help from these sources]
 *  1) On the idea that you can make custom attributes to html elements:
 *      https://www.youtube.com/watch?v=_GC3epPiAvI
 *  2) On how to change webpage using javascript/jquery:
 *      https://stackoverflow.com/questions/846954/change-url-and-redirect-using-jquery
 *  3) On how to transfer data between pages:
 *      https://stackoverflow.com/questions/27765666/passing-variable-through-javascript-from-one-html-page-to-another-page
 *  4) On how to disable selection while dragging:
 *      https://stackoverflow.com/questions/4975222/jquery-disable-select-when-dragging
 *  
 *  "Credit where credit is due."
 * 
 */

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

    $("*").bind()

    ReloadColors();

    //Load pieces
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
                    CheckforCheck();
                    // EndTurn();
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
                    // EndTurn();
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
            //Vertical travel
            if (data.column == thisColumn) {
                return CheckVertical(thisRow);
            }
            //Horizontal Travel
            else if (data.row == thisRow) {
                return CheckHorizontal(thisColumn);
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
            if (slope == 1) {
                //Northeast
                if ((data.row > thisRow) && (data.column < thisColumn)) {
                    return CheckDiagonalNorthEast(yDist);
                }

                //Southeast
                else if ((data.row < thisRow) && (data.column < thisColumn)) {
                    return CheckDiagonalSouthEast(yDist);
                }

                //Southwest
                else if ((data.row < thisRow) && (data.column > thisColumn)) {
                    return CheckDiagonalSouthWest(yDist);
                }

                //Northwest
                else if ((data.row > thisRow) && (data.column > thisColumn)) {
                    return CheckDiagonalNorthWest(yDist);
                }
            } else { return false; }
        } else if (data.piece == "queen") {
            let yDist = Math.abs(parseInt(data.row) - parseInt(thisRow));
            let xDist = Math.abs(parseInt(data.column) - parseInt(thisColumn));
            let slope = yDist / xDist;
            if (xDist == 0) {
                return CheckVertical(thisRow);
            } else if (yDist == 0) {
                return CheckHorizontal(thisColumn);
            } else if (slope == 1) {
                //Northeast
                if ((data.row > thisRow) && (data.column < thisColumn)) {
                    return CheckDiagonalNorthEast(yDist);
                }

                //Southeast
                else if ((data.row < thisRow) && (data.column < thisColumn)) {
                    return CheckDiagonalSouthEast(yDist);
                }

                //Southwest
                else if ((data.row < thisRow) && (data.column > thisColumn)) {
                    return CheckDiagonalSouthWest(yDist);
                }

                //Northwest
                else if ((data.row > thisRow) && (data.column > thisColumn)) {
                    return CheckDiagonalNorthWest(yDist);
                }
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
            //Vertical travel
            if (data.column == thisColumn) {
                return CheckVertical(thisRow);
            }
            //Horizontal Travel
            else if (data.row == thisRow) {
                return CheckHorizontal(thisColumn);
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
            if (slope == 1) {
                //Northeast
                if ((data.row > thisRow) && (data.column < thisColumn)) {
                    return CheckDiagonalNorthEast(yDist);
                }

                //Southeast
                else if ((data.row < thisRow) && (data.column < thisColumn)) {
                    return CheckDiagonalSouthEast(yDist);
                }

                //Southwest
                else if ((data.row < thisRow) && (data.column > thisColumn)) {
                    return CheckDiagonalSouthWest(yDist);
                }

                //Northwest
                else if ((data.row > thisRow) && (data.column > thisColumn)) {
                    return CheckDiagonalNorthWest(yDist);
                }
            } else { return false; }
        } else if (data.piece == "queen") {
            let yDist = Math.abs(parseInt(data.row) - parseInt(thisRow));
            let xDist = Math.abs(parseInt(data.column) - parseInt(thisColumn));
            let slope = yDist / xDist;
            if (xDist == 0) {
                return CheckVertical(thisRow);
            } else if (yDist == 0) {
                return CheckHorizontal(thisColumn);
            } else if (slope == 1) {
                //Northeast
                if ((data.row > thisRow) && (data.column < thisColumn)) {
                    return CheckDiagonalNorthEast(yDist);
                }

                //Southeast
                else if ((data.row < thisRow) && (data.column < thisColumn)) {
                    return CheckDiagonalSouthEast(yDist);
                }

                //Southwest
                else if ((data.row < thisRow) && (data.column > thisColumn)) {
                    return CheckDiagonalSouthWest(yDist);
                }

                //Northwest
                else if ((data.row > thisRow) && (data.column > thisColumn)) {
                    return CheckDiagonalNorthWest(yDist);
                }
            } else {
                return false;
            }
        } else if (data.piece == "king") {

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

    /** Checks for blockage along path of piece assuming path is straight horizontal.
     * 
     * @param {*} targetColumn The column of target position
     * @param {*} thisColumn [optional] Current column of the piece, Default to data.column
     * @returns {boolean} true if path is clear, else false.
     */
    function CheckHorizontal(targetColumn, thisColumn = data.column) {
        //Leftwards
        if (thisColumn > targetColumn) {
            for (let i = parseInt(thisColumn) - 1; i > targetColumn; i--) {
                if ($("[row = \'" + data.row + "\'][column = \'" + i + "\']").attr("empty") == "false") {
                    return false;
                }
            }
            return true;
        }
        //Rightwards
        else if (thisColumn < targetColumn) {
            for (let i = parseInt(thisColumn) + 1; i < targetColumn; i++) {
                if ($("[row = \'" + data.row + "\'][column = \'" + i + "\']").attr("empty") == "false") {
                    return false;
                }
            }
            return true;
        }
    }

    /** Checks for blockage along path of piece assuming path is straight vertical.
     * 
     * @param {*} targetRow The row of target position
     * @param {*} thisRow [optional] Current row of the piece. Default to data.row
     * @returns {boolean} true if path is clear, else false.
     */
    function CheckVertical(targetRow, thisRow = data.row) {
        //Upwards
        if (thisRow > targetRow) {
            for (let i = parseInt(thisRow) - 1; i > targetRow; i--) {
                if ($("[row = \'" + i + "\'][column = \'" + data.column + "\']").attr("empty") == "false") {
                    return false;
                }
            }
            return true;
        }
        //Downwards
        else if (thisRow < targetRow) {
            for (let i = parseInt(thisRow) + 1; i < targetRow; i++) {
                if ($("[row = \'" + i + "\'][column = \'" + data.column + "\']").attr("empty") == "false") {
                    return false;
                }
            }
            return true;
        }
    }

    /** Checks for blockage along path if target location is NORTH-WEST of current location
     * 
     * @param {*} distance Distance of piece from target location. Can either be X or Y distance
     * @param {*} thisRow [optional] Current row of piece, default to data.row.
     * @param {*} thisColumn [optional] Current column of piece, default to data.column.
     */
    function CheckDiagonalNorthWest(distance, thisRow = data.row, thisColumn = data.column) {
        for (let i = 1; i < distance; i++) {
            if ($("[row=\'" + (parseInt(thisRow) - i) + "\'][column=\'" + (parseInt(thisColumn) - i) + "\']").attr("empty") == "false") {
                return false;
            }
        }
        return true;
    }
    /** Checks for blockage along path if target location is NORTH-EAST of current location
     * 
     * @param {*} distance Distance of piece from target location. Can either be X or Y distance
     * @param {*} thisRow [optional] Current row of piece, default to data.row.
     * @param {*} thisColumn [optional] Current column of piece, default to data.column.
     */
    function CheckDiagonalNorthEast(distance, thisRow = data.row, thisColumn = data.column) {
        for (let i = 1; i < distance; i++) {
            if ($("[row=\'" + (parseInt(thisRow) - i) + "\'][column=\'" + (parseInt(thisColumn) + i) + "\']").attr("empty") == "false") {
                return false;
            }
        }
        return true;
    }

    /** Checks for blockage along path if target location is SOUTH-EAST of current location
     * 
     * @param {*} distance Distance of piece from target location. Can either be X or Y distance
     * @param {*} thisRow [optional] Current row of piece, default to data.row.
     * @param {*} thisColumn [optional] Current column of piece, default to data.column.
     */
    function CheckDiagonalSouthEast(distance, thisRow = data.row, thisColumn = data.column) {
        for (let i = 1; i < distance; i++) {
            if ($("[row=\'" + (parseInt(thisRow) + i) + "\'][column=\'" + (parseInt(thisColumn) + i) + "\']").attr("empty") == "false") {
                return false;
            }
        }
        return true;
    }

    /** Checks for blockage along path if target location is SOUTH-WEST of current location
     * 
     * @param {*} distance Distance of piece from target location. Can either be X or Y distance
     * @param {*} thisRow [optional] Current row of piece, default to data.row.
     * @param {*} thisColumn [optional] Current column of piece, default to data.column.
     */
    function CheckDiagonalSouthWest(distance, thisRow = data.row, thisColumn = data.column) {
        for (let i = 1; i < distance; i++) {
            if ($("[row=\'" + (parseInt(thisRow) + i) + "\'][column=\'" + (parseInt(thisColumn) - i) + "\']").attr("empty") == "false") {
                return false;
            }
        }
        return true;
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
                thisRow = parseInt($(this).attr("row")),
                thisColumn = parseInt($(this).attr("column"));

            // Ternary operator para cool hehe B)
            let enemyKing = $("[player=\'" + (thisPlayer == "dog" ? "cat" : "dog") + "\'][piece=\'king\']");
            let enemyKingRow = parseInt(enemyKing.attr("row")),
                enemyKingColumn = parseInt(enemyKing.attr("column")),
                slope = (Math.abs(thisRow - enemyKingRow) / Math.abs(thisColumn - enemyKingColumn));

            if (thisPiece == "pawn") {

            } else if (thisPiece == "knight") {

            } else if (thisPiece == "rook") {

            } else if (thisPiece == "bishop") {

            } else if (thisPiece == "queen") {
                // If queen perfectly aligns vertically with enemy king
                if (thisColumn == enemyKingColumn) {
                    if (CheckVertical(enemyKingRow, thisRow)) {
                        enemyKing.attr("check", "true");
                        $("[row=\'" + (enemyKingRow - 1) + "\'][column=\'" + thisColumn + "\']").attr("check", "true");
                        $("[row=\'" + (enemyKingRow + 1) + "\'][column=\'" + thisColumn + "\']").attr("check", "true");
                    }
                }
                // If queen perfectly aligns horizontally with enemy king
                else if (thisRow == enemyKingRow) {
                    if (CheckHorizontal(enemyKingColumn, thisColumn)) {
                        enemyKing.attr("check", "true");
                        $("[row=\'" + thisRow + "\'][column=\'" + (enemyKingColumn - 1) + "\']").attr("check", "true");
                        $("[row=\'" + thisRow + "\'][column=\'" + (enemyKingColumn + 1) + "\']").attr("check", "true");
                    }
                }
                // If queen check king diagonally
                else if (slope == 1) {

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