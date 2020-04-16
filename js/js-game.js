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
 *      https://stackoverflow.com/questions/2700000/how-to-disable-text-selection-using-jquery
 * 
 */


//This prevents loss of data upon reloading.
//Save previous state into session storage
$(window).bind("beforeunload", function () {
    let previousState = [];
    $("[empty]").each(function () {
        let cell = {
            piece: "",
            player: "",
            row: "",
            column: ""
        };

        if ($(this).attr("empty") == "false") {
            cell.piece = $(this).attr("piece");
            cell.player = $(this).attr("player");
            cell.row = $(this).attr("row");
            cell.column = $(this).attr("column");
            previousState.push(cell);
        }

    });
    this.sessionStorage.setItem("state", "reloaded");
    this.sessionStorage.setItem("turnPlayer", this.turnPlayer);
    this.sessionStorage.setItem("previousState", this.JSON.stringify(previousState));
});

//Load previous state
$(window).bind("load", function () {
    if (this.sessionStorage.getItem("previousState") != null) {

        let previousState = this.JSON.parse(this.sessionStorage.getItem("previousState"));
        for (let i = 0; i < previousState.length; i++) {
            let cell = previousState[i];
            $("[row=\'" + cell.row + "\'][column=\'" + cell.column + "\']").attr("empty", "false");
            $("[row=\'" + cell.row + "\'][column=\'" + cell.column + "\']").attr("player", cell.player);
            $("[row=\'" + cell.row + "\'][column=\'" + cell.column + "\']").attr("piece", cell.piece);
        }
    }


    //Load Pieces
    $("[empty]").each(function () {
        let piece = $(this).attr("piece"),
            player = $(this).attr("player");
        if (piece == "" || player == "") {
            $(this).attr("empty", "true").removeAttr("piece").removeAttr("player");
        } else {
            $(this).css("background-image", "url(\"../res/" + player + "Pieces/" +
                player + "_" + piece + ".png\"").css("background-size", "80% 90%");
        }
    });
    this.console.log("state:" + this.sessionStorage.getItem("state"));
    this.ReloadColors();

});

//#region Randomize First Player
var namePlayer1 = (sessionStorage.getItem("player1") == null) ? "Player 1" : sessionStorage.getItem("player1");
var namePlayer2 = (sessionStorage.getItem("player1") == null) ? "Player 1" : sessionStorage.getItem("player2");
var turnPlayer = "";
var moves, turnCounter = 0;

if (sessionStorage.getItem("turnPlayer") == null) {
    if (Math.round(Math.random()) == 0) {
        turnPlayer = "dog";
        $("#playerName").text(namePlayer1);
    } else {
        turnPlayer = "cat";
        $("#playerName").text(namePlayer2);
    }
} else {
    turnPlayer = sessionStorage.getItem("turnPlayer");
    if (turnPlayer == "dog") {
        $("#playerName").text(namePlayer1);
    } else {
        $("#playerName").text(namePlayer2);
    }
}

$("#playerImg").attr("src", "../res/" + turnPlayer + "Pieces/" + turnPlayer + "_king.png");
//#endregion

//#region Global Variables
var usernames = { dog: namePlayer1, cat: namePlayer2 };
var data = { player: "", piece: "", row: "", column: "" };
//#endregion

//#region Slide Menu
$(".burger").on("mouseover", function () {
    $(".menu").css("display", "flex");
});
$(".menu").on("mouseleave", function () {
    $(".menu").css("display", "none");
});

//Home Button Click Event
$("#btnHome").on("click", function () {
    window.location.replace("./home.html");
    window.sessionStorage.removeItem("turnPlayer");
});

//New Game Button Click Event
$("#btnNewGame").on("click", function () {
    $("[empty]").each(function () {
        $(this).attr("empty", "true").removeAttr("piece").removeAttr("player");
    });

    let state = JSON.parse(sessionStorage.getItem("initialState"));
    for (let i = 0; i < state.length; i++) {
        let cell = state[i];
        $("[row=\'" + cell.row + "\'][column=\'" + cell.column + "\']").attr("empty", "false");
        $("[row=\'" + cell.row + "\'][column=\'" + cell.column + "\']").attr("player", cell.player);
        $("[row=\'" + cell.row + "\'][column=\'" + cell.column + "\']").attr("piece", cell.piece);
    }
    location.reload();
    sessionStorage.setItem("state", "newGame");
});
//#endregion

// Prevents highlighting/selecting elements on drag
$("*").attr('unselectable', 'on')
    .css('user-select', 'none')
    .bind('selectstart', function () { return false; });

$("[empty]").on("click", function () {
    let thisPlayer = $(this).attr("player"),
        thisPiece = $(this).attr("piece"),
        thisRow = $(this).attr("row"),
        thisColumn = $(this).attr("column");

    if (thisPlayer == turnPlayer) {
        //Unselect currently selected piece
        if (thisRow == thisRow && data.column == thisColumn) {
            ReloadColors();
            data = { player: "", piece: "", row: "", column: "" };
        }
        //Select (other) piece
        else {
            if ($("[piece = 'king'][player =\'" + turnPlayer + "\']").attr("check") == "true") {
                if ($(this).attr("possible") == "true") {
                    ReloadColors();
                    $(this).css("background-color", "rgba(0, 128, 0, 0.7)");
                    data = { player: thisPlayer, piece: thisPiece, row: thisRow, column: thisColumn };
                    ShowMoves();
                }
            } else {
                ReloadColors();
                $(this).css("background-color", "rgba(0, 128, 0, 0.7)");
                data = { player: thisPlayer, piece: thisPiece, row: thisRow, column: thisColumn };
                ShowMoves();
            }

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

/**
 * Checks when the player is trying to move one of their own pieces
 * 
 * @param {*} targetRow Row of target position
 * @param {*} targetColumn Column of target position
 * @param {*} thisPlayer [optional] Whose player is selected piece, default to data.player
 * @param {*} thisPiece [optional] Type of piece selected, default to data.piece
 * @param {*} thisRow [optional] Current row of selected piece, default to data.row
 * @param {*} thisColumn [optional] Current column of selected piece, default to data.column
 * @returns {boolean} true if move is allowed, else false
 * 
 */
function CheckMove(targetRow, targetColumn, thisPlayer = data.player, thisPiece = data.piece, thisRow = data.row, thisColumn = data.column) {
    if (thisPiece == "pawn") {
        if (thisPlayer == "dog") {
            if (thisColumn == targetColumn) {
                if (thisRow == 2) {
                    if (targetRow == 3) {
                        return true;
                    } else if (targetRow == 4 &&
                        ($("[row = \'3\'][column = \'" + targetColumn + "\']").attr("empty") == "true")) {
                        return true;
                    } else { return false; }
                } else if (((parseInt(thisRow)) + 1) == targetRow) {
                    return true;
                } else { return false; }
            } else { return false; }
        } else if (thisPlayer == "cat") {
            if (thisColumn == targetColumn) {
                if (thisRow == 7) {
                    if (targetRow == 6) {
                        return true;
                    } else if (targetRow == 5 &&
                        ($("[row = \'6\'][column = \'" + targetColumn + "\']").attr("empty") == "true")) {
                        return true;
                    } else { return false; }
                } else if (((parseInt(thisRow)) - 1) == targetRow) {
                    return true;
                } else { return false; }
            } else { return false; }
        }
    } else if (thisPiece == "rook") {
        //Vertical travel
        if (targetColumn == thisColumn) {
            return CheckVertical(targetRow, thisRow, thisColumn);
        }
        //Horizontal Travel
        else if (targetRow == thisRow) {
            return CheckHorizontal(targetColumn, thisRow, thisColumn);
        }
    } else if (thisPiece == "knight") {
        let slope = ((Math.abs(parseInt(targetRow) - parseInt(thisRow))) / (Math.abs(parseInt(targetColumn) - parseInt(thisColumn))));
        if (slope == 2 || slope == 0.5) {
            return true;
        }
    } else if (thisPiece == "bishop") {
        let yDist = Math.abs(parseInt(targetRow) - parseInt(thisRow));
        let xDist = Math.abs(parseInt(targetColumn) - parseInt(thisColumn));
        let slope = yDist / xDist;
        if (slope == 1) {
            //Northeast
            if ((thisRow > targetRow) && (thisColumn < targetColumn)) {
                return CheckDiagonalNorthEast(yDist, thisRow, thisColumn);
            }

            //Southeast
            else if ((thisRow < targetRow) && (thisColumn < targetColumn)) {
                return CheckDiagonalSouthEast(yDist, thisRow, thisColumn);
            }

            //Southwest
            else if ((thisRow < targetRow) && (thisColumn > targetColumn)) {
                return CheckDiagonalSouthWest(yDist, thisRow, thisColumn);
            }

            //Northwest
            else if ((thisRow > targetRow) && (thisColumn > targetColumn)) {
                return CheckDiagonalNorthWest(yDist, thisRow, thisColumn);
            }
        } else { return false; }
    } else if (thisPiece == "queen") {
        let yDist = Math.abs(parseInt(targetRow) - parseInt(thisRow));
        let xDist = Math.abs(parseInt(targetColumn) - parseInt(thisColumn));
        let slope = yDist / xDist;
        if (xDist == 0) {
            return CheckVertical(targetRow, thisRow, thisColumn);
        } else if (yDist == 0) {
            return CheckHorizontal(targetColumn, thisRow, thisColumn);
        } else if (slope == 1) {
            //Northeast
            if ((thisRow > targetRow) && (thisColumn < targetColumn)) {
                return CheckDiagonalNorthEast(yDist, thisRow, thisColumn);
            }

            //Southeast
            else if ((thisRow < targetRow) && (thisColumn < targetColumn)) {
                return CheckDiagonalSouthEast(yDist, thisRow, thisColumn);
            }

            //Southwest
            else if ((thisRow < targetRow) && (thisColumn > targetColumn)) {
                return CheckDiagonalSouthWest(yDist, thisRow, thisColumn);
            }

            //Northwest
            else if ((thisRow > targetRow) && (thisColumn > targetColumn)) {
                return CheckDiagonalNorthWest(yDist, thisRow, thisColumn);
            }
        }
    } else if (thisPiece == "king") {
        let xDist = Math.abs(targetColumn - thisColumn);
        let yDist = Math.abs(targetRow - thisRow);
        if (($("[row=\'" + targetRow + "\'][column=\'" + targetColumn + "\']").attr("check") != "true") &&
            (xDist == 1 || xDist == 0) && (yDist == 1 || yDist == 0)) {
            return true;
        } else { return false; }
    }
}

/**
 * Checks when the player has clicked one of their own piece, and is trying to eat a piece of the enemy player.
 * 
 * @param {*} targetRow Row of target position
 * @param {*} targetColumn  Column of target position
 * @param {*} thisPlayer [optional] Whose player is selected piece, default to data.player
 * @param {*} thisPiece [optional] Type of piece selected, default to data.piece
 * @param {*} thisRow [optional] Current row of selected piece, default to data.row
 * @param {*} thisColumn [optional] Current column of selected piece, default to data.column
 * @returns {boolean} true if eat is allowed, else false
 * 
 */
function CheckEat(targetRow, targetColumn, thisPlayer = data.player, thisPiece = data.piece, thisRow = data.row, thisColumn = data.column) {
    if (thisPiece == "pawn") {
        if (thisPlayer == "dog") {
            if (((parseInt(thisRow) + 1) == targetRow) &&
                (((parseInt(thisColumn) - 1) == targetColumn) || ((parseInt(thisColumn) + 1) == targetColumn))) {
                return true;
            } else { return false; }
        } else if (thisPlayer == "cat") {
            if (((parseInt(thisRow) - 1) == targetRow) &&
                (((parseInt(thisColumn) - 1) == targetColumn) || ((parseInt(thisColumn) + 1) == targetColumn))) {
                return true;
            } else { return false; }
        }
    } else if (thisPiece == "rook") {
        //Vertical travel
        if (thisColumn == targetColumn) {
            return CheckVertical(targetRow, thisRow, thisColumn);
        }
        //Horizontal Travel
        else if (thisColumn == targetRow) {
            return CheckHorizontal(targetColumn, thisRow, thisColumn);
        }
    } else if (thisPiece == "knight") {
        let yDist = (Math.abs(parseInt(thisRow) - parseInt(targetRow))),
            xDist = (Math.abs(parseInt(thisColumn) - parseInt(targetColumn))),
            slope = (yDist / xDist);
        if ((slope == 2 || slope == 0.5) && ((xDist == 1 && yDist == 2) || (xDist == 2 && yDist == 1))) {
            return true;
        }
    } else if (thisPiece == "bishop") {
        let yDist = Math.abs(parseInt(thisRow) - parseInt(targetRow));
        let xDist = Math.abs(parseInt(thisColumn) - parseInt(targetColumn));
        let slope = yDist / xDist;
        if (slope == 1) {
            //Northeast
            if ((thisRow > targetRow) && (thisColumn < targetColumn)) {
                return CheckDiagonalNorthEast(yDist, thisRow, thisColumn);
            }

            //Southeast
            else if ((thisRow < targetRow) && (thisColumn < targetColumn)) {
                return CheckDiagonalSouthEast(yDist, thisRow, thisColumn);
            }

            //Southwest
            else if ((thisRow < targetRow) && (thisColumn > targetColumn)) {
                return CheckDiagonalSouthWest(yDist, thisRow, thisColumn);
            }

            //Northwest
            else if ((thisRow > targetRow) && (thisColumn > targetColumn)) {
                return CheckDiagonalNorthWest(yDist, thisRow, thisColumn);
            }
        } else { return false; }
    } else if (thisPiece == "queen") {
        let yDist = Math.abs(parseInt(thisRow) - parseInt(targetRow));
        let xDist = Math.abs(parseInt(thisColumn) - parseInt(targetColumn));
        let slope = yDist / xDist;
        if (xDist == 0) {
            return CheckVertical(targetRow, thisRow, thisColumn);
        } else if (yDist == 0) {
            return CheckHorizontal(targetColumn, thisRow, thisColumn);
        } else if (slope == 1) {
            //Northeast
            if ((thisRow > targetRow) && (thisColumn < targetColumn)) {
                return CheckDiagonalNorthEast(yDist, thisRow, thisColumn);
            }

            //Southeast
            else if ((thisRow < targetRow) && (thisColumn < targetColumn)) {
                return CheckDiagonalSouthEast(yDist, thisRow, thisColumn);
            }

            //Southwest
            else if ((thisRow < targetRow) && (thisColumn > targetColumn)) {
                return CheckDiagonalSouthWest(yDist, thisRow, thisColumn);
            }

            //Northwest
            else if ((thisRow > targetRow) && (thisColumn > targetColumn)) {
                return CheckDiagonalNorthWest(yDist, thisRow, thisColumn);
            }
        } else {
            return false;
        }
    } else if (thisPiece == "king") {
        let yDist = Math.abs(targetRow - thisRow),
            xDist = Math.abs(targetColumn - thisColumn);
        if (($("[row=\'" + targetRow + "\'][column=\'" + targetColumn + "\']").attr("check") != "true") &&
            (yDist == 1 || yDist == 0) && (xDist == 1 || xDist == 0)) {
            return true;
        } else { return false; }
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
        .css("background-size", "80% 90%")
        .css("background-repeat", "no-repeat")
        .css("background-position", "center");
    turnCounter += 1;
}

/** Checks for blockage along path of piece assuming path is straight horizontal.
 * 
 * @param {*} targetColumn The column of target position
 * @param {*} thisRow Current row of the piece
 * @param {*} thisColumn Current column of the piece.
 * @returns {boolean} true if path is clear, else false.
 * 
 */
function CheckHorizontal(targetColumn, thisRow, thisColumn) {
    //Leftwards
    if (thisColumn > targetColumn) {
        for (let i = parseInt(thisColumn) - 1; i > targetColumn; i--) {
            if ($("[row = \'" + thisRow + "\'][column = \'" + i + "\']").attr("empty") == "false") {
                return false;
            }
        }
        return true;
    }
    //Rightwards
    else if (thisColumn < targetColumn) {
        for (let i = parseInt(thisColumn) + 1; i < targetColumn; i++) {
            if ($("[row = \'" + thisRow + "\'][column = \'" + i + "\']").attr("empty") == "false") {
                return false;
            }
        }
        return true;
    }
}

/** Checks for blockage along path of piece assuming path is straight vertical.
 * 
 * @param {*} targetRow The row of target position
 * @param {*} thisRow Current row of the piece.
 * @param {*} thisColumn Current column of the piece.
 * @returns {boolean} true if path is clear, else false.
 * 
 */
function CheckVertical(targetRow, thisRow, thisColumn) {
    //Upwards
    if (thisRow > targetRow) {
        for (let i = parseInt(thisRow) - 1; i > targetRow; i--) {
            if ($("[row = \'" + i + "\'][column = \'" + thisColumn + "\']").attr("empty") == "false") {
                return false;
            }
        }
        return true;
    }
    //Downwards
    else if (thisRow < targetRow) {
        for (let i = parseInt(thisRow) + 1; i < targetRow; i++) {
            if ($("[row = \'" + i + "\'][column = \'" + thisColumn + "\']").attr("empty") == "false") {
                return false;
            }
        }
        return true;
    }
}

/** Checks for blockage along path if target location is NORTH-WEST of current location
 * 
 * @param {*} distance Distance of piece from target location. Can either be X or Y distance
 * @param {*} thisRow Current row of piece.
 * @param {*} thisColumn Current column of piece.
 * 
 */
function CheckDiagonalNorthWest(distance, thisRow, thisColumn) {
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
 * @param {*} thisRow Current row of piece.
 * @param {*} thisColumn Current column of piece.
 * 
 */
function CheckDiagonalNorthEast(distance, thisRow, thisColumn) {
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
 * @param {*} thisRow Current row of piece.
 * @param {*} thisColumn Current column of piece, default to data.column.
 * 
 */
function CheckDiagonalSouthEast(distance, thisRow, thisColumn) {
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
 * @param {*} thisRow Current row of piece.
 * @param {*} thisColumn Current column of piece.
 * 
 */
function CheckDiagonalSouthWest(distance, thisRow, thisColumn) {
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
    console.log("Turn #" + turnCounter + "\t Action: " + action + "\n" +
        "Piece moved: " + data.player + " - " + data.piece +
        "\n\tfrom\t[row : " + data.row + " || column : " + data.column +
        "]\n\tto\t\t[row : " + thisRow + " || column : " + thisColumn + "]\n" +
        "Piece eaten: " + thisPlayer + " - " + thisPiece);
}

function CheckforCheck() {
    //Remove all checks
    $("[check]").each(function () {
        $(this).removeAttr("check");
    });

    $("[piece='king']").each(function () {
        //Get king row and column
        let thisKing = $(this),
            thisKingRow = parseInt($(this).attr("row")),
            thisKingColumn = parseInt($(this).attr("column")),
            thisPlayer = $(this).attr("player");

        //Assess all adjacent cells/pieces
        let adjacentCells = [
            $("[row=\'" + (thisKingRow - 1) + "\'][column=\'" + (thisKingColumn - 1) + "\']"),
            $("[row=\'" + (thisKingRow - 1) + "\'][column=\'" + (thisKingColumn) + "\']"),
            $("[row=\'" + (thisKingRow - 1) + "\'][column=\'" + (thisKingColumn + 1) + "\']"),
            $("[row=\'" + (thisKingRow) + "\'][column=\'" + (thisKingColumn + 1) + "\']"),
            $("[row=\'" + (thisKingRow + 1) + "\'][column=\'" + (thisKingColumn + 1) + "\']"),
            $("[row=\'" + (thisKingRow + 1) + "\'][column=\'" + (thisKingColumn) + "\']"),
            $("[row=\'" + (thisKingRow + 1) + "\'][column=\'" + (thisKingColumn - 1) + "\']"),
            $("[row=\'" + (thisKingRow) + "\'][column=\'" + (thisKingColumn - 1) + "\']"),
        ];

        moves = 0;

        EvalthisCell(thisKing, thisPlayer);

        adjacentCells.forEach(cell => {
            if (cell.length == 1) {
                EvalthisCell(cell, thisPlayer);
            }
        });
        adjacentCells.forEach(cell => {
            if (cell.attr("check") != "true" && cell.attr("empty") == "true") {
                moves += 1;
            }
        });

        console.log(thisPlayer + " king " + "moves: " + moves);

        // if (moves == 0) {
        //     if (thisKing.attr("check") == "true") {
        //         CheckMate();
        //     } else {
        //         let pieceLeft = 0;
        //         $("[empty]").each(function () {
        //             pieceLeft++;
        //         });
        //         if (pieceLeft == 1) {
        //             StaleMate();
        //         }
        //     }
        // }
    });
}



/**
 * This function checks if there are pieces that can access this cell
 * 
 *  @param {*} thisCell The cell to be evaluated
 *  @param {*} thisplayer The player attribute of the adjacent king
 */
function EvalthisCell(thisCell, thisplayer) {
    let thisRow = parseInt(thisCell.attr("row")),
        thisColumn = parseInt(thisCell.attr("column")),
        dist;

    //#region Upwards
    for (let i = parseInt(thisRow) - 1; i >= 1; i--) {
        if ($("[row = \'" + i + "\'][column = \'" + thisColumn + "\']").attr("empty") == "false") {
            if ($("[row = \'" + i + "\'][column = \'" + thisColumn + "\']").attr("player") != thisplayer) {
                let enemy = $("[row = \'" + i + "\'][column = \'" + thisColumn + "\']");
                let enemyPlayer = enemy.attr("player"),
                    enemyPiece = enemy.attr("piece"),
                    enemyRow = enemy.attr("row"),
                    enemyColumn = enemy.attr("column");
                if (CheckEat(thisRow, thisColumn, enemyPlayer, enemyPiece, enemyRow, enemyColumn)) {
                    console.log(enemyPiece + " at [row: " + enemyRow + " | column: " + enemyColumn +
                        "]\nCan Check cell at [row: " + thisRow + " | column: " + thisColumn + "]");
                    thisCell.attr("check", "true");
                } else { break; }
            } else { break; }
        } else { continue; }
    }
    //#endregion

    //#region Downwards
    for (let i = parseInt(thisRow) + 1; i <= 8; i++) {
        if ($("[row = \'" + i + "\'][column = \'" + thisColumn + "\']").attr("empty") == "false") {
            if ($("[row = \'" + i + "\'][column = \'" + thisColumn + "\']").attr("player") != thisplayer) {
                let enemy = $("[row = \'" + i + "\'][column = \'" + thisColumn + "\']");
                let enemyPlayer = enemy.attr("player"),
                    enemyPiece = enemy.attr("piece"),
                    enemyRow = enemy.attr("row"),
                    enemyColumn = enemy.attr("column");
                if (CheckEat(thisRow, thisColumn, enemyPlayer, enemyPiece, enemyRow, enemyColumn)) {
                    console.log(enemyPiece + " at [row: " + enemyRow + " | column: " + enemyColumn +
                        "]\nCan Check cell at [row: " + thisRow + " | column: " + thisColumn + "]");
                    thisCell.attr("check", "true");
                } else { break; }
            } else { break; }
        } else { continue; }
    }
    //#endregion

    //#region Rightwards
    for (let i = parseInt(thisColumn) + 1; i <= 8; i++) {
        if ($("[row = \'" + thisRow + "\'][column = \'" + i + "\']").attr("empty") == "false") {
            if ($("[row = \'" + thisRow + "\'][column = \'" + i + "\']").attr("player") != thisplayer) {
                let enemy = $("[row = \'" + thisRow + "\'][column = \'" + i + "\']");
                let enemyPlayer = enemy.attr("player"),
                    enemyPiece = enemy.attr("piece"),
                    enemyRow = enemy.attr("row"),
                    enemyColumn = enemy.attr("column");
                if (CheckEat(thisRow, thisColumn, enemyPlayer, enemyPiece, enemyRow, enemyColumn)) {
                    console.log(enemyPiece + " at [row: " + enemyRow + " | column: " + enemyColumn +
                        "]\nCan Check cell at [row: " + thisRow + " | column: " + thisColumn + "]");
                    thisCell.attr("check", "true");
                } else { break; }
            } else { break; }
        } else { continue; }
    }
    //#endregion

    //#region Leftwards
    for (let i = parseInt(thisColumn) - 1; i >= 1; i--) {
        if ($("[row = \'" + thisRow + "\'][column = \'" + i + "\']").attr("empty") == "false") {
            if ($("[row = \'" + thisRow + "\'][column = \'" + i + "\']").attr("player") != thisplayer) {
                let enemy = $("[row = \'" + thisRow + "\'][column = \'" + i + "\']");
                let enemyPlayer = enemy.attr("player"),
                    enemyPiece = enemy.attr("piece"),
                    enemyRow = enemy.attr("row"),
                    enemyColumn = enemy.attr("column");
                if (CheckEat(thisRow, thisColumn, enemyPlayer, enemyPiece, enemyRow, enemyColumn)) {
                    console.log(enemyPiece + " at [row: " + enemyRow + " | column: " + enemyColumn +
                        "]\nCan Check cell at [row: " + thisRow + " | column: " + thisColumn + "]");
                    thisCell.attr("check", "true");
                } else { break; }
            } else { break; }
        } else { continue; }
    }
    //#endregion

    //#region From NorthWest
    dist = (Math.abs(thisRow - 1) <= Math.abs(thisColumn - 1)) ? Math.abs(thisRow - 1) : Math.abs(thisColumn - 1);
    for (let i = 1; i <= dist; i++) {
        if ($("[row=\'" + (thisRow - i) + "\'][column=\'" + (thisColumn - i) + "\']").attr("empty") == "false") {
            if ($("[row=\'" + (thisRow - i) + "\'][column=\'" + (thisColumn - i) + "\']").attr("player") != thisplayer) {
                let enemy = $("[row = \'" + (thisRow - i) + "\'][column = \'" + (thisColumn - i) + "\']");
                let enemyPlayer = enemy.attr("player"),
                    enemyPiece = enemy.attr("piece"),
                    enemyRow = enemy.attr("row"),
                    enemyColumn = enemy.attr("column");
                if (CheckEat(thisRow, thisColumn, enemyPlayer, enemyPiece, enemyRow, enemyColumn)) {
                    console.log(enemyPiece + " at [row: " + enemyRow + " | column: " + enemyColumn +
                        "]\nCan Check cell at [row: " + thisRow + " | column: " + thisColumn + "]");
                    thisCell.attr("check", "true");
                } else { break; }
            } else { break; }
        } else { continue; }
    }
    //#endregion

    //#region From Northeast
    dist = (Math.abs(thisRow - 1) <= Math.abs(thisColumn - 8)) ? Math.abs(thisRow - 1) : Math.abs(thisColumn - 8);
    for (let i = 1; i <= dist; i++) {
        if ($("[row=\'" + (thisRow - i) + "\'][column=\'" + (thisColumn + i) + "\']").attr("empty") == "false") {
            if ($("[row=\'" + (thisRow - i) + "\'][column=\'" + (thisColumn + i) + "\']").attr("player") != thisplayer) {
                let enemy = $("[row = \'" + (thisRow - i) + "\'][column = \'" + (thisColumn + i) + "\']");
                let enemyPlayer = enemy.attr("player"),
                    enemyPiece = enemy.attr("piece"),
                    enemyRow = enemy.attr("row"),
                    enemyColumn = enemy.attr("column");
                if (CheckEat(thisRow, thisColumn, enemyPlayer, enemyPiece, enemyRow, enemyColumn)) {
                    console.log(enemyPiece + " at [row: " + enemyRow + " | column: " + enemyColumn +
                        "]\nCan Check cell at [row: " + thisRow + " | column: " + thisColumn + "]");
                    thisCell.attr("check", "true");
                } else { break; }
            } else { break; }
        } else { continue; }
    }
    //#endregion

    //#region From Southeast
    dist = (Math.abs(thisRow - 1) <= Math.abs(thisColumn - 8)) ? Math.abs(thisRow - 1) : Math.abs(thisColumn - 8);
    for (let i = 1; i <= dist; i++) {
        if ($("[row=\'" + (thisRow + i) + "\'][column=\'" + (thisColumn + i) + "\']").attr("empty") == "false") {
            if ($("[row=\'" + (thisRow + i) + "\'][column=\'" + (thisColumn + i) + "\']").attr("player") != thisplayer) {
                let enemy = $("[row = \'" + (thisRow + i) + "\'][column = \'" + (thisColumn + i) + "\']");
                let enemyPlayer = enemy.attr("player"),
                    enemyPiece = enemy.attr("piece"),
                    enemyRow = enemy.attr("row"),
                    enemyColumn = enemy.attr("column");
                if (CheckEat(thisRow, thisColumn, enemyPlayer, enemyPiece, enemyRow, enemyColumn)) {
                    console.log("Attacker = [Row: " + enemyRow + "\tColumn: " + enemyColumn + "]\n" +
                        "Defender = [Row: " + thisRow + "\tColumn: " + thisColumn + "]");
                    thisCell.attr("check", "true");
                } else { break; }
            } else { break; }
        } else { continue; }
    }
    //#endregion

    //#region From Southwest  
    dist = (Math.abs(thisRow - 1) <= Math.abs(thisColumn - 8)) ? Math.abs(thisRow - 1) : Math.abs(thisColumn - 8);
    for (let i = 1; i <= dist; i++) {
        if ($("[row=\'" + (thisRow + i) + "\'][column=\'" + (thisColumn - i) + "\']").attr("empty") == "false") {
            if ($("[row=\'" + (thisRow + i) + "\'][column=\'" + (thisColumn - i) + "\']").attr("player") != thisplayer) {
                let enemy = $("[row = \'" + (thisRow + i) + "\'][column = \'" + (thisColumn - i) + "\']");
                let enemyPlayer = enemy.attr("player"),
                    enemyPiece = enemy.attr("piece"),
                    enemyRow = enemy.attr("row"),
                    enemyColumn = enemy.attr("column");
                if (CheckEat(thisRow, thisColumn, enemyPlayer, enemyPiece, enemyRow, enemyColumn)) {
                    console.log(enemyPiece + " at [row: " + enemyRow + " | column: " + enemyColumn +
                        "]\nCan Check cell at [row: " + thisRow + " | column: " + thisColumn + "]");
                    thisCell.attr("check", "true");
                } else { break; }
            } else { break; }
        } else { continue; }
    }
    //#endregion

    //#region For knight
    //Checks if an enemy knight can access the empty cell
    $("[piece='knight']").each(function () {
        if ($(this).attr("player") != thisplayer) {
            if (CheckEat(thisRow, thisColumn, $(this).attr("player"), "knight", $(this).attr("row"), $(this).attr("column"))) {
                console.log("knight at [row: " + $(this).attr("row") + " | column: " + $(this).attr("column") +
                    "]\nCan Check cell at [row: " + thisRow + " | column: " + thisColumn + "]");
                thisCell.attr("check", "true");
            }
        }
    });
}
//#endregion

function CheckMate() {

}

function StaleMate() {

}



