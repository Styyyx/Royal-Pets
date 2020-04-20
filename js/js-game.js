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
	$("[empty='false']").each(function () {
		let cell = {
			piece: $(this).attr("piece"),
			player: $(this).attr("player"),
			row: $(this).attr("row"),
			column: $(this).attr("column")
		};

		previousState.push(cell);
	});
	this.sessionStorage.setItem("state", "reloaded");
	this.sessionStorage.setItem("turnPlayer", this.turnPlayer);
	this.sessionStorage.setItem("boardHistory", this.JSON.stringify(this.boardHistory));
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

	if (this.sessionStorage.getItem("boardHistory") != "null") {
		this.boardHistory = this.JSON.parse(this.sessionStorage.getItem("boardHistory"));
	} else {
		this.boardHistory = [this.JSON.parse(this.sessionStorage.getItem("initialState"))];
		this.sessionStorage.setItem("boardHistory", this.JSON.stringify(this.boardHistory));
	}

	this.LoadBoard();


	this.console.log("state:" + this.sessionStorage.getItem("state"));
	this.CheckforCheck();
	this.ReloadBoard();
});

//#region Randomize First Player
var namePlayer1 = (sessionStorage.getItem("player1") == null) ? "Player 1" : sessionStorage.getItem("player1");
var namePlayer2 = (sessionStorage.getItem("player1") == null) ? "Player 1" : sessionStorage.getItem("player2");
var turnPlayer = "";

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

//#region Variables
var usernames = { dog: namePlayer1, cat: namePlayer2 };
var data = { player: "", piece: "", row: "", column: "" };
var turnCounter = 0, moves = 0;
var boardHistory = [];
//#endregion

//#region Dropdown Menu
$(".burger").on("mouseover", function () {
// <<<<<<< gamepage-revision
    $(".sidenav").css("width", "15.625vw");
});
$(".sidenav").on("mouseleave", function () {
    $(this).css("width", "0");
// =======
// 	$(".menu").css("display", "flex");
// });
// $(".menu").on("mouseleave", function () {
// 	$(".menu").css("display", "none");
// >>>>>>> master
});
//#endregion

//#region Buttons
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

	if (Math.round(Math.random()) == 0) {
		turnPlayer = "dog";
		$("#playerName").text(namePlayer1);
	} else {
		turnPlayer = "cat";
		$("#playerName").text(namePlayer2);
	}

	let state = JSON.parse(sessionStorage.getItem("initialState"));
	for (let i = 0; i < state.length; i++) {
		let cell = state[i];
		$("[row=\'" + cell.row + "\'][column=\'" + cell.column + "\']").attr("empty", "false");
		$("[row=\'" + cell.row + "\'][column=\'" + cell.column + "\']").attr("player", cell.player);
		$("[row=\'" + cell.row + "\'][column=\'" + cell.column + "\']").attr("piece", cell.piece);
	}
	boardHistory = [JSON.parse(sessionStorage.getItem("initialState"))];
	sessionStorage.setItem("boardHistory", JSON.stringify(boardHistory));
	location.reload();
	sessionStorage.setItem("state", "newGame");
});

//End Turn Button (for debugging)
$("#turn").on("click", function () {
	EndTurn();
	ReloadBoard();
}).on("mouseover", function () {
	$(this).css("cursor", "pointer");
});

//Step Back in boardHistory
$("#btnUndo").on("click", function () {
	if (turnCounter != 0) {
		turnCounter -= 1;
		console.log("Turn Counter = " + turnCounter);

		ClearBoard();

		boardHistory[turnCounter].forEach(function (cell) {
			thisCell = $("[row=\'" + cell.row + "\'][column=\'" + cell.column + "\']");
			thisCell.attr("empty", "false").attr("piece", cell.piece).attr("player", cell.player);
		});

		LoadBoard();
		CheckforCheck();
		ReloadBoard();
	}
});
//#endregion

// Prevents highlighting/selecting elements on drag
$("*").attr('unselectable', 'on')
	.css('user-select', 'none')
	.bind('selectstart', function () { return false; });

/** Main Function
 * 
 * 	this is fired every time a cell/piece is clicked
 */
$("[empty]").on("click", function () {
	let thisPlayer = $(this).attr("player"),
		thisPiece = $(this).attr("piece"),
		thisRow = $(this).attr("row"),
		thisColumn = $(this).attr("column");

	if (thisPlayer == turnPlayer) {
		//Unselect currently selected piece
		if (thisRow == thisRow && data.column == thisColumn) {
			ReloadBoard();
			data = { player: "", piece: "", row: "", column: "" };
		}
		//Select (other) piece
		else {
			//If turnPlayer's king is in check
			if ($("[piece = 'king'][player =\'" + turnPlayer + "\']").attr("check") == "true") {
				//If selected piece is the checked king
				if (thisPiece == "king") {
					ReloadBoard();
					$(this).css("background-color", "rgba(0, 128, 0, 0.7)");
					data = { player: thisPlayer, piece: thisPiece, row: thisRow, column: thisColumn };
					ShowMoves();
				}

				else if ($(this).attr("canMove") == "true") {
					ReloadBoard();
					$(this).css("background-color", "rgba(0, 128, 0, 0.7)");
					data = { player: thisPlayer, piece: thisPiece, row: thisRow, column: thisColumn };
					ShowMoves();
				}
			} else {
				ReloadBoard();
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

		//When trying to eat
		if ($(this).attr("empty") == "false" && CheckEat(thisRow, thisColumn)) {
			MovePiece(thisRow, thisColumn);
			TakeSnapShot();
			Debug("EAT", thisPlayer, thisPiece, thisRow, thisColumn);
			data = { player: "", piece: "", row: "", column: "" };
			CheckforCheck();
			// EndTurn();
			ReloadBoard();
		}

		//When trying to move
		else if ($(this).attr("empty") == "true" && CheckMove(thisRow, thisColumn)) {
			MovePiece(thisRow, thisColumn);
			TakeSnapShot();
			Debug("MOVE", thisPlayer, thisPiece, thisRow, thisColumn);
			data = { player: "", piece: "", row: "", column: "" };
			CheckforCheck();
			// EndTurn();
			ReloadBoard();
		}

		else {
			ReloadBoard();
			data = { player: "", piece: "", row: "", column: "" };
		}
	}
});

function ClearBoard() {
	$("[empty]")
		.attr("empty", "true")
		.removeAttr("piece")
		.removeAttr("player")
		.css("background-image", "");
}

function LoadBoard() {
	//Load Pieces
	$("[empty='false']").each(function () {
		let piece = $(this).attr("piece"),
			player = $(this).attr("player");

		$(this)
			.css("background-image", "url(\"../res/" + player + "Pieces/" + player + "_" + piece + ".png\"")
			.css("background-size", "80% 90%");
	});
}

function ReloadBoard() {
	$("[empty]").each(function () {
		if ($(this).hasClass("cell-gray")) {
			$(this).css("background-color", "#8A8A8A");
		} else {
			$(this).css("background-color", "#ffffff");
		}
		$(this).css("cursor", "auto");
	});

	$("[piece=\'king\']").each(function () {
		if ($(this).attr("check") == "true") {
			$(this).css("background-color", "violet");
			if ($(this).attr("player") == turnPlayer) {
				$(this).css("cursor", "pointer");
			}
			$("[player=\'" + $(this).attr("player") + "\'][canMove=\'true\'").each(function () {
				$(this).css("cursor", "pointer");
			});
			return;
		} else {
			$("[player=\'" + turnPlayer + "\']").each(function () {
				$(this).css("cursor", "pointer");
			});
		}
	});
}

/** Checks when the player is trying to move one of their own pieces
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

/** Checks when the player has clicked one of their own piece, and is trying to eat a piece of the enemy player.
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

		let adjacentCells = GetAdjacent(data.row, data.column);
		adjacentCells.forEach(cell => {
			if (cell.attr("check") != "true") {
				if (cell.attr("empty") == "true") {
					cell.css("background-color", "blue");
				} else if (cell.attr("player") != "" && cell.attr("player") != turnPlayer) {
					cell.css("background-color", "red");
				}
			}
		});
	}
	//Set red/blue cell's cursor to pointer
	$("[empty]").each(function () {
		if ($(this).css("background-color") == "rgb(0, 0, 255)" || $(this).css("background-color") == "rgb(255, 0, 0)") {
			$(this).css("cursor", "pointer");
		}
	});
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

function CheckforCheck() {
	//Remove all checks
	$("[check]").each(function () {
		$(this).removeAttr("check");
	});

	$("[checker]").each(function () {
		$(this).removeAttr("checker");
	});

	$("[piece='king']").each(function () {
		//Get king row and column
		let thisKingRow = parseInt($(this).attr("row")),
			thisKingColumn = parseInt($(this).attr("column")),
			thisPlayer = $(this).attr("player");

		moves = 0;

		//Assess all adjacent cells/pieces
		let adjacentCells = GetAdjacent(thisKingRow, thisKingColumn);

		if (IsCheck(thisKingRow, thisKingColumn, thisPlayer)) {
			$(this).attr("check", "true");
		}

		adjacentCells.forEach(cell => {
			if (cell.length == 1) {
				if (IsCheck(cell.attr("row"), cell.attr("column"), thisPlayer)) {
					cell.attr("check", "true");
				}
			}
		});

		adjacentCells.forEach(cell => {
			if (cell.attr("check") != "true" && cell.attr("empty") == "true") {
				moves += 1;
			}
		});

		if ($("[checker]").length == 1) {
			CheckforMoves();
		}

		console.log(thisPlayer + " moves: " + moves);
	});
}

function CheckforMoves() {
	let checkerRow = parseInt($("[checker]").attr("row")),
		checkerColumn = parseInt($("[checker]").attr("column")),
		checkerPiece = $("[checker]").attr("piece"),
		checkerPlayer = $("[checker]").attr("player"),
		kingRow = parseInt($("[piece='king'][check='true']").attr("row")),
		kingColumn = parseInt($("[piece='king'][check='true']").attr("column")),
		kingPlayer = $("[piece='king'][check='true']").attr("player"),
		xDist = Math.abs(parseInt(kingColumn - checkerColumn)),
		yDist = Math.abs(parseInt(kingRow - checkerRow));
	console.log("[CHECKER " + checkerPiece + "] at row: " + checkerRow + "\tcolumn: " + checkerColumn);
	console.log("[CHECKED king] at row: " + kingRow + "\tcolumn: " + kingColumn);

	//If checker can be eaten
	$("[player=\'" + kingPlayer + "\']").each(function () {
		if (CheckEat(checkerRow, checkerColumn, $(this).attr("player"), $(this).attr("piece"), $(this).attr("row"), $(this).attr("column"))) {
			$(this).attr("canMove");
			moves += 1;
		}
	});

	//Find position of checker from king and check if a piece can block it
	if (kingRow == checkerRow) {
		// Checker is left of king
		if (kingColumn > checkerColumn) {
			for (let i = 1; i <= xDist; i++) {

			}
		}
		//Checker is right of king 
		else if (kingColumn < checkerColumn) {

		}

	} else if (kingRow > checkerRow) {
		//Checker is northwest of king
		if (kingColumn > checkerColumn) {

		}
		//Checker is directly above king
		else if (kingColumn == checkerColumn) {

		}
		//Checker is northeast of king 
		else if (kingColumn < checkerColumn) {

		}

	} else if (kingRow < checkerRow) {
		//Checker is southwest of king
		if (kingColumn > checkerColumn) {

		}
		//Checker is directly below king
		else if (kingColumn == checkerColumn) {

		}
		//Checker is southeast of king 
		else if (kingColumn < checkerColumn) {

		}
	}
}

/** This function evaluates the cell if it is accessible by other pieces of the opposite player
 * 
 * @param {*} thisRow 
 * @param {*} thisColumn 
 * @param {*} thisPlayer 
 */
function IsCheck(thisRow, thisColumn, thisPlayer) {
	let dist;
	thisRow = parseInt(thisRow);
	thisColumn = parseInt(thisColumn);

	//#region Upwards
	for (let i = parseInt(thisRow) - 1; i >= 1; i--) {
		if ($("[row = \'" + i + "\'][column = \'" + thisColumn + "\']").attr("empty") == "false") {
			if ($("[row = \'" + i + "\'][column = \'" + thisColumn + "\']").attr("player") != thisPlayer) {
				let enemy = $("[row = \'" + i + "\'][column = \'" + thisColumn + "\']");
				let enemyPlayer = enemy.attr("player"),
					enemyPiece = enemy.attr("piece"),
					enemyRow = enemy.attr("row"),
					enemyColumn = enemy.attr("column");
				if (CheckEat(thisRow, thisColumn, enemyPlayer, enemyPiece, enemyRow, enemyColumn)) {
					console.log(enemyPiece + " at [row: " + enemyRow + " | column: " + enemyColumn +
						"]\nCan Check cell at [row: " + thisRow + " | column: " + thisColumn + "]");
					if ($("[row = \'" + thisRow + "\'][column = \'" + thisColumn + "\']").attr("piece") == "king") {
						console.log(thisPlayer + " king is checked from north");
						enemy.attr("checker", "true");
						if ($("[row=\'" + (thisRow + 1) + "\'][column=\'" + thisColumn + "\']").attr("empty") == "true") {
							$("[row=\'" + (thisRow + 1) + "\'][column=\'" + thisColumn + "\']").attr("check", "true");
						}
					}
					return true;
				} else { break; }
			} else { break; }
		} else { continue; }
	}
	//#endregion

	//#region Downwards
	for (let i = parseInt(thisRow) + 1; i <= 8; i++) {
		if ($("[row = \'" + i + "\'][column = \'" + thisColumn + "\']").attr("empty") == "false") {
			if ($("[row = \'" + i + "\'][column = \'" + thisColumn + "\']").attr("player") != thisPlayer) {
				let enemy = $("[row = \'" + i + "\'][column = \'" + thisColumn + "\']");
				let enemyPlayer = enemy.attr("player"),
					enemyPiece = enemy.attr("piece"),
					enemyRow = enemy.attr("row"),
					enemyColumn = enemy.attr("column");
				if (CheckEat(thisRow, thisColumn, enemyPlayer, enemyPiece, enemyRow, enemyColumn)) {
					console.log(enemyPiece + " at [row: " + enemyRow + " | column: " + enemyColumn +
						"]\nCan Check cell at [row: " + thisRow + " | column: " + thisColumn + "]");
					if ($("[row = \'" + thisRow + "\'][column = \'" + thisColumn + "\']").attr("piece") == "king") {
						enemy.attr("checker", "true");
						console.log(thisPlayer + " king is checked from south");
						if ($("[row=\'" + (thisRow - 1) + "\'][column=\'" + thisColumn + "\']").attr("empty") == "true") {
							$("[row=\'" + (thisRow - 1) + "\'][column=\'" + thisColumn + "\']").attr("check", "true");
						}
					}
					return true;
				} else { break; }
			} else { break; }
		} else { continue; }
	}
	//#endregion

	//#region Rightwards
	for (let i = parseInt(thisColumn) + 1; i <= 8; i++) {
		if ($("[row = \'" + thisRow + "\'][column = \'" + i + "\']").attr("empty") == "false") {
			if ($("[row = \'" + thisRow + "\'][column = \'" + i + "\']").attr("player") != thisPlayer) {
				let enemy = $("[row = \'" + thisRow + "\'][column = \'" + i + "\']");
				let enemyPlayer = enemy.attr("player"),
					enemyPiece = enemy.attr("piece"),
					enemyRow = enemy.attr("row"),
					enemyColumn = enemy.attr("column");
				if (CheckEat(thisRow, thisColumn, enemyPlayer, enemyPiece, enemyRow, enemyColumn)) {
					console.log(enemyPiece + " at [row: " + enemyRow + " | column: " + enemyColumn +
						"]\nCan Check cell at [row: " + thisRow + " | column: " + thisColumn + "]");
					if ($("[row = \'" + thisRow + "\'][column = \'" + thisColumn + "\']").attr("piece") == "king") {
						enemy.attr("checker", "true");
						console.log(thisPlayer + " king is checked from east");
						if ($("[row=\'" + thisRow + "\'][column=\'" + (thisColumn - 1) + "\']").attr("empty") == "true") {
							$("[row=\'" + thisRow + "\'][column=\'" + (thisColumn - 1) + "\']").attr("check", "true");
						}
					}
					return true;
				} else { break; }
			} else { break; }
		} else { continue; }
	}
	//#endregion

	//#region Leftwards
	for (let i = parseInt(thisColumn) - 1; i >= 1; i--) {
		if ($("[row = \'" + thisRow + "\'][column = \'" + i + "\']").attr("empty") == "false") {
			if ($("[row = \'" + thisRow + "\'][column = \'" + i + "\']").attr("player") != thisPlayer) {
				let enemy = $("[row = \'" + thisRow + "\'][column = \'" + i + "\']");
				let enemyPlayer = enemy.attr("player"),
					enemyPiece = enemy.attr("piece"),
					enemyRow = enemy.attr("row"),
					enemyColumn = enemy.attr("column");
				if (CheckEat(thisRow, thisColumn, enemyPlayer, enemyPiece, enemyRow, enemyColumn)) {
					console.log(enemyPiece + " at [row: " + enemyRow + " | column: " + enemyColumn +
						"]\nCan Check cell at [row: " + thisRow + " | column: " + thisColumn + "]");
					if ($("[row = \'" + thisRow + "\'][column = \'" + thisColumn + "\']").attr("piece") == "king") {
						enemy.attr("checker", "true");
						console.log(thisPlayer + " king is checked from west");
						if ($("[row=\'" + (thisRow) + "\'][column=\'" + (thisColumn + 1) + "\']").attr("empty") == "true") {
							$("[row=\'" + (thisRow) + "\'][column=\'" + (thisColumn + 1) + "\']").attr("check", "true");
						}
					}
					return true;
				} else { break; }
			} else { break; }
		} else { continue; }
	}
	//#endregion

	//#region From NorthWest
	dist = (Math.abs(thisRow - 1) <= Math.abs(thisColumn - 1)) ? Math.abs(thisRow - 1) : Math.abs(thisColumn - 1);
	for (let i = 1; i <= dist; i++) {
		if ($("[row=\'" + (thisRow - i) + "\'][column=\'" + (thisColumn - i) + "\']").attr("empty") == "false") {
			if ($("[row=\'" + (thisRow - i) + "\'][column=\'" + (thisColumn - i) + "\']").attr("player") != thisPlayer) {
				let enemy = $("[row = \'" + (thisRow - i) + "\'][column = \'" + (thisColumn - i) + "\']");
				let enemyPlayer = enemy.attr("player"),
					enemyPiece = enemy.attr("piece"),
					enemyRow = enemy.attr("row"),
					enemyColumn = enemy.attr("column");
				if (CheckEat(thisRow, thisColumn, enemyPlayer, enemyPiece, enemyRow, enemyColumn)) {
					console.log(enemyPiece + " at [row: " + enemyRow + " | column: " + enemyColumn +
						"]\nCan Check cell at [row: " + thisRow + " | column: " + thisColumn + "]");
					if ($("[row = \'" + thisRow + "\'][column = \'" + thisColumn + "\']").attr("piece") == "king") {
						enemy.attr("checker", "true");
						console.log(thisPlayer + " king is checked from northwest");
						if ($("[row=\'" + (thisRow + 1) + "\'][column=\'" + (thisColumn + 1) + "\']").attr("empty") == "true") {
							$("[row=\'" + (thisRow + 1) + "\'][column=\'" + (thisColumn + 1) + "\']").attr("check", "true");
						}
					}
					return true;
				} else { break; }
			} else { break; }
		} else { continue; }
	}
	//#endregion

	//#region From Northeast
	dist = (Math.abs(thisRow - 1) <= Math.abs(thisColumn - 8)) ? Math.abs(thisRow - 1) : Math.abs(thisColumn - 8);
	for (let i = 1; i <= dist; i++) {
		if ($("[row=\'" + (thisRow - i) + "\'][column=\'" + (thisColumn + i) + "\']").attr("empty") == "false") {
			if ($("[row=\'" + (thisRow - i) + "\'][column=\'" + (thisColumn + i) + "\']").attr("player") != thisPlayer) {
				let enemy = $("[row = \'" + (thisRow - i) + "\'][column = \'" + (thisColumn + i) + "\']");
				let enemyPlayer = enemy.attr("player"),
					enemyPiece = enemy.attr("piece"),
					enemyRow = enemy.attr("row"),
					enemyColumn = enemy.attr("column");
				if (CheckEat(thisRow, thisColumn, enemyPlayer, enemyPiece, enemyRow, enemyColumn)) {
					console.log(enemyPiece + " at [row: " + enemyRow + " | column: " + enemyColumn +
						"]\nCan Check cell at [row: " + thisRow + " | column: " + thisColumn + "]");
					if ($("[row = \'" + thisRow + "\'][column = \'" + thisColumn + "\']").attr("piece") == "king") {
						enemy.attr("checker", "true");
						console.log(thisPlayer + " king is checked from northeast");
						if ($("[row=\'" + (thisRow + 1) + "\'][column=\'" + (thisColumn - 1) + "\']").attr("empty") == "true") {
							$("[row=\'" + (thisRow + 1) + "\'][column=\'" + (thisColumn - 1) + "\']").attr("check", "true");
						}
					}
					return true;
				} else { break; }
			} else { break; }
		} else { continue; }
	}
	//#endregion

	//#region From Southeast
	dist = (Math.abs(thisRow - 8) <= Math.abs(thisColumn - 8)) ? Math.abs(thisRow - 8) : Math.abs(thisColumn - 8);
	for (let i = 1; i <= dist; i++) {
		if ($("[row=\'" + (thisRow + i) + "\'][column=\'" + (thisColumn + i) + "\']").attr("empty") == "false") {
			if ($("[row=\'" + (thisRow + i) + "\'][column=\'" + (thisColumn + i) + "\']").attr("player") != thisPlayer) {
				let enemy = $("[row = \'" + (thisRow + i) + "\'][column = \'" + (thisColumn + i) + "\']");
				let enemyPlayer = enemy.attr("player"),
					enemyPiece = enemy.attr("piece"),
					enemyRow = enemy.attr("row"),
					enemyColumn = enemy.attr("column");
				if (CheckEat(thisRow, thisColumn, enemyPlayer, enemyPiece, enemyRow, enemyColumn)) {
					console.log("Attacker = [Row: " + enemyRow + "\tColumn: " + enemyColumn + "]\n" +
						"Defender = [Row: " + thisRow + "\tColumn: " + thisColumn + "]");
					if ($("[row = \'" + thisRow + "\'][column = \'" + thisColumn + "\']").attr("piece") == "king") {
						enemy.attr("checker", "true");
						console.log(thisPlayer + " king is checked from southeast");
						if ($("[row=\'" + (thisRow - 1) + "\'][column=\'" + (thisColumn - 1) + "\']").attr("empty") == "true") {
							$("[row=\'" + (thisRow - 1) + "\'][column=\'" + (thisColumn - 1) + "\']").attr("check", "true");
						}
					}
					return true;
				} else { break; }
			} else { break; }
		} else { continue; }
	}
	//#endregion

	//#region From Southwest  
	dist = (Math.abs(thisRow - 8) <= Math.abs(thisColumn - 1)) ? Math.abs(thisRow - 8) : Math.abs(thisColumn - 1);
	for (let i = 1; i <= dist; i++) {
		if ($("[row=\'" + (thisRow + i) + "\'][column=\'" + (thisColumn - i) + "\']").attr("empty") == "false") {
			if ($("[row=\'" + (thisRow + i) + "\'][column=\'" + (thisColumn - i) + "\']").attr("player") != thisPlayer) {
				let enemy = $("[row = \'" + (thisRow + i) + "\'][column = \'" + (thisColumn - i) + "\']");
				let enemyPlayer = enemy.attr("player"),
					enemyPiece = enemy.attr("piece"),
					enemyRow = enemy.attr("row"),
					enemyColumn = enemy.attr("column");
				if (CheckEat(thisRow, thisColumn, enemyPlayer, enemyPiece, enemyRow, enemyColumn)) {
					console.log(enemyPiece + " at [row: " + enemyRow + " | column: " + enemyColumn +
						"]\nCan Check cell at [row: " + thisRow + " | column: " + thisColumn + "]");
					if ($("[row = \'" + thisRow + "\'][column = \'" + thisColumn + "\']").attr("piece") == "king") {
						enemy.attr("checker", "true");
						console.log(thisPlayer + " king is checked from southwest");
						if ($("[row=\'" + (thisRow - 1) + "\'][column=\'" + (thisColumn + 1) + "\']").attr("empty") == "true") {
							$("[row=\'" + (thisRow - 1) + "\'][column=\'" + (thisColumn + 1) + "\']").attr("check", "true");
						}
					}
					return true;
				} else { break; }
			} else { break; }
		} else { continue; }
	}
	//#endregion

	//#region For knight
	//Checks if an enemy knight can access the empty cell
	$("[piece='knight']").each(function () {
		if ($(this).attr("player") != thisPlayer) {
			if (CheckEat(thisRow, thisColumn, $(this).attr("player"), "knight", $(this).attr("row"), $(this).attr("column"))) {
				console.log("knight at [row: " + $(this).attr("row") + " | column: " + $(this).attr("column") +
					"]\nCan Check cell at [row: " + thisRow + " | column: " + thisColumn + "]");
				if ($("[row = \'" + thisRow + "\'][column = \'" + thisColumn + "\']").attr("piece") == "king") {
					$(this).attr("checker", "true");
				}
				return true;
			}
		}
	});
}
//#endregion

function CheckMate() {

}

function StaleMate() {

}

/**	Returns an array of the adjacent cells of the selected cell
 * 
 * @param {*} thisRow 
 * @param {*} thisColumn 
 */
function GetAdjacent(thisRow, thisColumn) {
	//Safe for NaN
	thisRow = parseInt(thisRow);
	thisColumn = parseInt(thisColumn);
	let adjacentCells = [
		$("[row=\'" + (thisRow - 1) + "\'][column=\'" + (thisColumn - 1) + "\']"), 	//Northwest
		$("[row=\'" + (thisRow - 1) + "\'][column=\'" + (thisColumn) + "\']"),			//North
		$("[row=\'" + (thisRow - 1) + "\'][column=\'" + (thisColumn + 1) + "\']"),	//Northeast
		$("[row=\'" + (thisRow) + "\'][column=\'" + (thisColumn + 1) + "\']"),			//East
		$("[row=\'" + (thisRow + 1) + "\'][column=\'" + (thisColumn + 1) + "\']"),	//Southeast
		$("[row=\'" + (thisRow + 1) + "\'][column=\'" + (thisColumn) + "\']"),			//South
		$("[row=\'" + (thisRow + 1) + "\'][column=\'" + (thisColumn - 1) + "\']"),	//Southwest
		$("[row=\'" + (thisRow) + "\'][column=\'" + (thisColumn - 1) + "\']"),			//West
	];
	return adjacentCells;
}

/** Takes a snapshot of the board and stores it in an array
 * 
 */
function TakeSnapShot() {
	let snapShot = [];
	$("[empty='false']").each(function () {
		let cell = {
			row: $(this).attr("row"),
			column: $(this).attr("column"),
			piece: $(this).attr("piece"),
			player: $(this).attr("player"),
		};
		snapShot.push(cell);
	});
	boardHistory[turnCounter] = snapShot;
	sessionStorage.setItem("boardHistory", JSON.stringify(boardHistory));
	console.log("Snapshot taken and stored into array and sesh storage");
}

//#region For Debugging

function ShowBoardHistory() {
	for (let i = 0; i < boardHistory.length; i++) {
		console.log(boardHistory[i]);
	}
}

function Debug(action, thisPlayer, thisPiece, thisRow, thisColumn) {
	console.log("Turn #" + turnCounter + "\t Action: " + action + "\n" +
		"Piece moved: " + data.player + " - " + data.piece +
		"\n\tfrom\t[row : " + data.row + " || column : " + data.column +
		"]\n\tto\t\t[row : " + thisRow + " || column : " + thisColumn + "]\n" +
		"Piece eaten: " + thisPlayer + " - " + thisPiece);
}
//#endregion
