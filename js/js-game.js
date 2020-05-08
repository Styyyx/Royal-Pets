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
		if ($(this).attr("castle") == "true") {
			cell.castle = "true";
		}
		if ($(this).attr("enpassant") == "true") {
			cell.enpassant = "true";
		}

		previousState.push(cell);
	});

	this.logHistory = [];
	$(".history ul li").each(function () {
		logHistory.push($(this).text());
	});

	this.sessionStorage.setItem("logHistory", this.JSON.stringify(this.logHistory));
	this.sessionStorage.setItem("state", "reloaded");
	this.sessionStorage.setItem("turnPlayer", this.turnPlayer);
	this.sessionStorage.setItem("boardHistory", this.JSON.stringify(this.boardHistory));
	this.sessionStorage.setItem("previousState", this.JSON.stringify(previousState));
	this.sessionStorage.setItem("turnCounter", this.turnCounter.toString());
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
			if (cell.castle == "true") {
				$("[row=\'" + cell.row + "\'][column=\'" + cell.column + "\']").attr("castle", "true");
			}
			if (cell.enpassant == "true") {
				$("[row=\'" + cell.row + "\'][column=\'" + cell.column + "\']").attr("enpassant", "true");
			}
		}
	}

	if (this.sessionStorage.getItem("boardHistory") != null) {
		this.boardHistory = this.JSON.parse(this.sessionStorage.getItem("boardHistory"));
	} else {
		this.boardHistory = [this.JSON.parse(this.sessionStorage.getItem("initialState"))];
		this.sessionStorage.setItem("boardHistory", this.JSON.stringify(this.boardHistory));
	}
	if (this.sessionStorage.getItem("turnCounter") != null) {
		this.turnCounter = this.parseInt(this.sessionStorage.getItem("turnCounter"));
	}

	// $(".history ul li").each(function () {
	// 	$(this).remove();
	// });

	if (this.sessionStorage.getItem("logHistory") != null) {
		this.logHistory = [];
		this.logHistory = this.JSON.parse(this.sessionStorage.getItem("logHistory"));
		this.logHistory.forEach(function (log) {
			$(".history ul").append($("<li></li>").text(log));
		});
	}

	this.LoadPieces();

	this.console.log("state:" + this.sessionStorage.getItem("state"));
	this.CheckforCheck();
	this.ReloadBoard();
});

$(document).on("keydown", function (e) {
	if (e.key == "Enter" && $("#newGame").css("display") != "none") {
		$("#btn-ok").click();
	}
	if (e.key == "Escape" && $("#newGame").css("display") != "none") {
		$("#btn-cancel").click();
	}
	if (e.key == "Escape" && $("#howToPlay").css("display") != "none") {
		$("#btn-exit").click();
	}
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
var columnLegend = ["a", "b", "c", "d", "e", "f", "g", "h"];
var logHistory = [];
//#endregion

//#region Dropdown Menu
$(".burger").on("mouseover", function () {
	// <<<<<<< gamepage-revision
	$(".sidenav").css("width", "15.625vw");
});
$(".sidenav").on("mouseleave", function () {
	$(this).css("width", "0");
});
//#endregion

//#region Buttons

//Home Button Click Event
$("#btnHome").on("click", function () {
	window.location.replace("./home.html");
	window.sessionStorage.removeItem("turnPlayer");
	sessionStorage.removeItem("logHistory");
});

// How to Play Button Click event
$("#btnHowToPlay").on("click", function () {
	$(".overlay#howToPlay").css("display", "flex");
	const slides = $('.slide');
	var activeSlide = 0;

	showSlide(activeSlide);

	function showSlide(n) {
		$(slides[activeSlide]).removeClass('active-slide');
		$(slides[n]).addClass('active-slide');
		activeSlide = n;
		if (activeSlide === 0) {
			$('#previous').css('display', 'none');
		}
		else {
			$('#previous').css('display', 'flex');
		}
		if (activeSlide === slides.length - 1) {
			$('#next').css('display', 'none');
		}
		else {
			$('#next').css('display', 'flex');
		}
	}

	$('#previous').on('click', function () {
		showSlide(activeSlide - 1);
	});
	$('#next').on('click', function () {
		showSlide(activeSlide + 1);
	});
	$('#btn-exit').on('click', function () {
		showSlide(0);
		$(".overlay#howToPlay").css("display", "none");
	});

	$(document).on('keydown', function (event) {
		if (event.which == 37) {
			if (activeSlide === 0) {
				$('#previous').css('display', 'none');
			} else {
				$('#previous').click();
			}
		}
		if (event.which == 39) {
			if (activeSlide === slides.length - 1) {
				$('#next').click(false);
			} else {
				$('#next').click();
			}
		}
	});
});

//#region New Game Interface

//New Game Button Click Event
$("#btnNewGame").on("click", function () {
	$(".overlay#newGame").css("display", "flex");
});

$(".overlay#newGame input").on("click", function () {
	$(this).select();
});

$(".overlay#newGame #btn-ok").on("click", function () {

	let input1 = $("input#input-player1"), input2 = $("input#input-player2");
	if (input1.val() == "" || input2.val() == "") {
		if (input1.val() == "") {
			input1.addClass("error");
			setTimeout(() => {
				input1.removeClass("error");
			}, 300);
		}
		if (input2.val() == "") {
			input2.addClass("error");
			setTimeout(() => {
				input2.removeClass("error");
			}, 300);
		}
	} else {
		$("[empty]").each(function () {
			$(this).attr("empty", "true").removeAttr("piece").removeAttr("player");
		});

		namePlayer1 = $("input#input-player1").val();
		sessionStorage.setItem("player1", namePlayer1);
		namePlayer2 = $("input#input-player2").val();
		sessionStorage.setItem("player2", namePlayer2);

		if (Math.round(Math.random()) == 0) {
			turnPlayer = "dog";
			$("#playerName").text(namePlayer1);
		} else {
			turnPlayer = "cat";
			$("#playerName").text(namePlayer2);
		}
		turnCounter = 0;
		let state = JSON.parse(sessionStorage.getItem("initialState"));
		for (let i = 0; i < state.length; i++) {
			let cell = state[i];
			$("[row=\'" + cell.row + "\'][column=\'" + cell.column + "\']").attr("empty", "false");
			$("[row=\'" + cell.row + "\'][column=\'" + cell.column + "\']").attr("player", cell.player);
			$("[row=\'" + cell.row + "\'][column=\'" + cell.column + "\']").attr("piece", cell.piece);
			if (cell.castle == "true") {
				$("[row=\'" + cell.row + "\'][column=\'" + cell.column + "\']").attr("castle", "true");
			}
		}

		this.logHistory = [];
		$(".history ul li").each(function () {
			$(this).remove();
		});

		sessionStorage.setItem("logHistory", JSON.stringify(logHistory));

		boardHistory = [JSON.parse(sessionStorage.getItem("initialState"))];
		sessionStorage.setItem("boardHistory", JSON.stringify(boardHistory));
		location.reload();
		sessionStorage.setItem("state", "newGame");
	}
});

$(".overlay#newGame #btn-cancel").on("click", function () {
	$(".overlay#newGame").css("display", "none");
});
//#endregion

//End Turn Button (for debugging)
// $("#turn").on("click", function () {
// 	EndTurn();
// 	ReloadBoard();
// }).on("mouseover", function () {
// 	$(this).css("cursor", "url(../res/custom_pointer.cur), pointer");
// });

//Step Back in boardHistory
$("#btnUndo").on("click", function () {
	if (turnCounter != 0) {
		turnCounter -= 1;
		console.log("Turn Counter = " + turnCounter);

		ClearBoard();

		/** [PROBLEM]
		 * 
		 * 	Description: king||rook piece when moved will lose castle viability,
		 * 		but if undo is executed, king||rook piece does not regain castle viability.
		 * 
		 * 	Comment: This fixes it but at the same time, theoretically if a king||rook without castle viability,
		 * 	 	is moved to its initial position, then moved, then undo, it will gain castle viability.
		 * 
		 */
		// let lastMove = logHistory[logHistory.length - 1];
		// if (lastMove.match(/>>/) != null) {
		// 	let lastMoveFrom = lastMove.match(/\w\d(?=\s>>)/),
		// 		lastMoveTo = lastMove.match(/(?<=>>\s)\w\d/),
		// 		lastMovePlayer = lastMove.match(/(dog|cat)/),
		// 		lastMovePiece = lastMove.match(/(?<=-)\w+/);

		// 	if (lastMovePiece == "king") {
		// 		if (lastMovePlayer == "dog" && (lastMoveFrom == "e1" &&
		// 			(lastMoveTo == "f1" || lastMoveTo == "g1" || lastMoveTo == "d1" || lastMoveTo == "c1" ||
		// 				lastMoveTo == "d2" || lastMoveTo == "e2" || lastMoveTo == "f2"))) {
		// 			$("[row='1'][column='5']").attr("castle", "true");
		// 		} else if (lastMovePlayer == "cat" && (lastMoveFrom == "e8" &&
		// 			(lastMoveTo == "f8" || lastMoveTo == "g8" || lastMoveTo == "d8" || lastMoveTo == "c8" ||
		// 				lastMoveTo == "d7" || lastMoveTo == "e7" || lastMoveTo == "f7"))) {
		// 			$("[row='8'][column='5']").attr("castle", "true");
		// 		}
		// 	}
		// }

		boardHistory[turnCounter].forEach(function (cell) {
			thisCell = $("[row=\'" + cell.row + "\'][column=\'" + cell.column + "\']");
			thisCell.attr("empty", "false").attr("piece", cell.piece).attr("player", cell.player);
			if (cell.enpassant == "true") {
				thisCell.attr("enpassant", "true");
			}
			if (cell.castle == "true") {
				thisCell.attr("castle", "true");
			}
		});

		$(".history ul li:last-child").remove();

		if (turnPlayer == "dog") {
			turnPlayer = "cat";
		} else {
			turnPlayer = "dog";
		}

		location.reload();
	}
});

//Music & Sound Buttons
var enableSound = true;
$(".btnGroup #btnMusic").on("click", function () {
	let audio = $("audio#music").get(0);
	if (audio.paused == true) {
		audio.currentTime = 0;
		audio.play();
		$(this).attr("src", "../res/music_on.png");
	} else {
		audio.pause();
		$(this).attr("src", "../res/music_off.png");
	}
});

$(".btnGroup #btnSound").on("click", function () {
	if (enableSound == true) {
		enableSound = false;
		$(this).attr("src", "../res/sound_off.png");
	} else {
		enableSound = true;
		$(this).attr("src", "../res/sound_on.png");
	}
});

$(".sound-btnClick").on("click", function () {
	if (enableSound == true) {
		$("audio#sound-buttonClick").get(0).play();
		$("audio#sound-buttonClick").get(0).currentTime = 0;
	}
}).on("mouseover", function () {
	if (enableSound == true) {
		$("audio#sound-buttonHover").get(0).play();
		$("audio#sound-buttonHover").get(0).currentTime = 0;
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
					ShowMovesSetCursor();
				}

				else if ($(this).attr("canMove") == "true") {
					ReloadBoard();
					$(this).css("background-color", "rgba(0, 128, 0, 0.7)");
					data = { player: thisPlayer, piece: thisPiece, row: thisRow, column: thisColumn };
					ShowMoves();
					ShowMovesSetCursor();
				}
			} else {
				ReloadBoard();
				$(this).css("background-color", "rgba(0, 128, 0, 0.7)");
				data = { player: thisPlayer, piece: thisPiece, row: thisRow, column: thisColumn };
				ShowMoves();
				ShowMovesSetCursor();
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
			turnCounter += 1;
			LogMove(thisRow, thisColumn, data.row, data.column, "eat");
			MovePiece(thisRow, thisColumn);
			if (data.piece == "rook" || data.piece == "king") {
				$("[row=\'" + data.row + "\'][column=\'" + data.column + "\']").removeAttr("castle");
			}
			PlaySound("eat");
			CheckforPromotion();
			TakeSnapShot();
			Debug("EAT", thisPlayer, thisPiece, thisRow, thisColumn);
			data = { player: "", piece: "", row: "", column: "" };
			CheckforCheck();
			EndTurn();
			ReloadBoard();
			CheckforEnPassant();
		}

		//When trying to move
		else if ($(this).attr("empty") == "true" && CheckMove(thisRow, thisColumn)) {
			turnCounter += 1;
			LogMove(thisRow, thisColumn, data.row, data.column);
			MovePiece(thisRow, thisColumn);
			if (data.piece == "rook" || data.piece == "king") {
				$("[row=\'" + data.row + "\'][column=\'" + data.column + "\']").removeAttr("castle");
			}
			PlaySound("move");
			CheckforPromotion();
			TakeSnapShot();
			Debug("MOVE", thisPlayer, thisPiece, thisRow, thisColumn);
			data = { player: "", piece: "", row: "", column: "" };
			CheckforCheck();
			EndTurn();
			ReloadBoard();
			CheckforEnPassant();
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

function LoadPieces() {
	//Load Pieces
	$("[empty='false']").each(function () {
		let piece = $(this).attr("piece"),
			player = $(this).attr("player");

		$(this)
			.css("background-image", "url(\"../res/" + player + "Pieces/" + player + "_" + piece + ".png\"").css("background-size", "70% 90%");
	});
}

function ReloadBoard() {
	$("[empty]").each(function () {
		if ($(this).hasClass("cell-gray")) {
			$(this).css("background-color", "#8A8A8A");
		} else {
			$(this).css("background-color", "#ffffff");
		}
		$(this).css("cursor", "url(../res/custom_default.cur), auto");
	});

	$("[piece=\'king\']").each(function () {
		if ($(this).attr("check") == "true") {
			$(this).css("background-color", "violet");
			if ($(this).attr("player") == turnPlayer) {
				$(this).css("cursor", "url(../res/custom_p.cur), pointer");
			}
			$("[player=\'" + turnPlayer + "\'][canMove=\'true\'").each(function () {
				$(this).css("cursor", "url(../res/custom_pointer.cur), pointer");
			});
			return;
		} else {
			$("[player=\'" + turnPlayer + "\']").each(function () {
				$(this).css("cursor", "url(../res/custom_pointer.cur), pointer");
			});
		}
	});
	if (turnCounter == 0) {
		$("#btnUndo").css("filter", " grayscale(70%)").css("cursor", "url(../res/custom_default.cur), auto");
	} else {
		$("#btnUndo").css("filter", "").css("cursor", "url(../res/custom_pointer.cur), pointer");
	}
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
					} else if (targetRow == 4 && $("[row = \'3\'][column = \'" + targetColumn + "\']").attr("empty") == "true") {
						$("[row=\'" + targetRow + "\'][column=\'" + targetColumn + "\']").attr("enpassant", "true");
						return true;
					}
					else { return false; }
				}
				else if (((parseInt(thisRow)) + 1) == targetRow) {
					return true;
				} else { return false; }
			} else if (thisRow == 5) {
				if ($("[row=\'" + thisRow + "\'][column=\'" + (parseInt(thisColumn) + 1) + "\']").attr("enpassant") == "true" &&
					$("[row=\'" + (parseInt(thisRow) + 1) + "\'][column=\'" + (parseInt(thisColumn) + 1) + "\']").attr("empty") == "true" &&
					targetColumn == (parseInt(thisColumn) + 1)) {
					$("[row=\'" + thisRow + "\'][column=\'" + (parseInt(thisColumn) + 1) + "\']")
						.removeAttr("player")
						.removeAttr("piece")
						.attr("empty", "true")
						.removeAttr("enpassant")
						.css("background-image", "");
					return true;
				}
				if ($("[row=\'" + thisRow + "\'][column=\'" + (parseInt(thisColumn) - 1) + "\']").attr("enpassant") == "true" &&
					$("[row=\'" + (parseInt(thisRow) + 1) + "\'][column=\'" + (parseInt(thisColumn) - 1) + "\']").attr("empty") == "true" &&
					targetColumn == (parseInt(thisColumn) - 1)) {
					$("[row=\'" + thisRow + "\'][column=\'" + (parseInt(thisColumn) - 1) + "\']")
						.removeAttr("player")
						.removeAttr("piece")
						.attr("empty", "true")
						.removeAttr("enpassant")
						.css("background-image", "");
					return true;
				}
			} else { return false; }
		} else if (thisPlayer == "cat") {
			if (thisColumn == targetColumn) {
				if (thisRow == 7) {
					if (targetRow == 6) {
						return true;
					} else if (targetRow == 5 && $("[row = \'6\'][column = \'" + targetColumn + "\']").attr("empty") == "true") {
						$("[row=\'" + targetRow + "\'][column=\'" + targetColumn + "\']").attr("enpassant", "true");
						return true;
					}
					else { return false; }
				} else if (((parseInt(thisRow)) - 1) == targetRow) {
					return true;
				} else { return false; }
			} else if (thisRow == 4) {
				if ($("[row=\'" + thisRow + "\'][column=\'" + (parseInt(thisColumn) + 1) + "\']").attr("enpassant") == "true" &&
					$("[row=\'" + (parseInt(thisRow) - 1) + "\'][column=\'" + (parseInt(thisColumn) + 1) + "\']").attr("empty") == "true" &&
					targetColumn == (parseInt(thisColumn) + 1)) {
					$("[row=\'" + thisRow + "\'][column=\'" + (parseInt(thisColumn) + 1) + "\']")
						.removeAttr("player")
						.removeAttr("piece")
						.attr("empty", "true")
						.removeAttr("enpassant")
						.css("background-image", "");
					return true;
				}
				if ($("[row=\'" + thisRow + "\'][column=\'" + (parseInt(thisColumn) - 1) + "\']").attr("enpassant") == "true" &&
					$("[row=\'" + (parseInt(thisRow) - 1) + "\'][column=\'" + (parseInt(thisColumn) - 1) + "\']").attr("empty") == "true" &&
					targetColumn == (parseInt(thisColumn) - 1)) {
					$("[row=\'" + thisRow + "\'][column=\'" + (parseInt(thisColumn) - 1) + "\']")
						.removeAttr("player")
						.removeAttr("piece")
						.attr("empty", "true")
						.removeAttr("enpassant")
						.css("background-image", "");
					return true;
				}
			} else { return false; }
		}
	} else if (thisPiece == "rook") {
		if ($("[piece='king'][player=\'" + thisPlayer + "\']").attr("check") == "true") {
			if ($("[row=\'" + targetRow + "\'][column=\'" + targetColumn + "\']").attr("checkpath") == "true") {
				if (targetColumn == thisColumn) {
					return CheckVertical(targetRow, thisRow, thisColumn);
				}
				else if (targetRow == thisRow) {
					return CheckHorizontal(targetColumn, thisRow, thisColumn);
				}
			}
		} else {
			if (targetColumn == thisColumn) {
				return CheckVertical(targetRow, thisRow, thisColumn);
			}
			else if (targetRow == thisRow) {
				return CheckHorizontal(targetColumn, thisRow, thisColumn);
			}
		}


	} else if (thisPiece == "knight") {
		let slope = ((Math.abs(parseInt(targetRow) - parseInt(thisRow))) / (Math.abs(parseInt(targetColumn) - parseInt(thisColumn))));
		if ($("[piece='king'][player=\'" + data.player + "\']").attr("check") == "true") {
			if ($("[row=\'" + targetRow + "\'][column=\'" + targetColumn + "\']").attr("checkpath") == "true") {
				return true;
			}
		} else {
			if (slope == 2 || slope == 0.5) {
				return true;
			}
		}
	} else if (thisPiece == "bishop") {
		let yDist = Math.abs(parseInt(targetRow) - parseInt(thisRow));
		let xDist = Math.abs(parseInt(targetColumn) - parseInt(thisColumn));
		let slope = yDist / xDist;
		if ($("[piece='king'][player=\'" + data.player + "\']").attr("check") == "true") {
			if ($("[row=\'" + targetRow + "\'][column=\'" + targetColumn + "\']").attr("checkpath") == "true") {
				return true;
			}
		} else {
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
		}
	} else if (thisPiece == "queen") {
		let yDist = Math.abs(parseInt(targetRow) - parseInt(thisRow));
		let xDist = Math.abs(parseInt(targetColumn) - parseInt(thisColumn));
		let slope = yDist / xDist;
		if ($("[piece='king'][player=\'" + data.player + "\']").attr("check") == "true") {
			if ($("[row=\'" + targetRow + "\'][column=\'" + targetColumn + "\']").attr("checkpath") == "true") {
				return true;
			}
		} else {
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
		}
	} else if (thisPiece == "king") {
		let xDist = Math.abs(targetColumn - thisColumn);
		let yDist = Math.abs(targetRow - thisRow);
		if ($("[row=\'" + targetRow + "\'][column=\'" + targetColumn + "\']").attr("check") != "true") {
			if ((xDist == 1 || xDist == 0) && (yDist == 1 || yDist == 0)) {
				return true;
			} else if (yDist == 0) {
				if (targetColumn == "7" && CheckCastleKingSide(thisPlayer, thisRow)) {
					MovePiece(thisRow, "6", thisRow, "8", thisPlayer, "rook");
					return true;
				} else if (targetColumn == "3" && CheckCastleQueenSide(thisPlayer, thisRow)) {
					MovePiece(thisRow, "4", thisRow, "1", thisPlayer, "rook");
					return true;
				}
			}
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
				$("[row=\'" + targetRow + "\'][column=\'" + targetColumn + "\']").removeAttr("enpassant");
				return true;
			} else { return false; }
		} else if (thisPlayer == "cat") {
			if (((parseInt(thisRow) - 1) == targetRow) &&
				(((parseInt(thisColumn) - 1) == targetColumn) || ((parseInt(thisColumn) + 1) == targetColumn))) {
				$("[row=\'" + targetRow + "\'][column=\'" + targetColumn + "\']").removeAttr("enpassant");
				return true;
			} else { return false; }
		}
	} else if (thisPiece == "rook") {
		//Vertical travel
		if (thisColumn == targetColumn) {
			return CheckVertical(targetRow, thisRow, thisColumn);
		}
		//Horizontal Travel
		else if (thisRow == targetRow) {
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
			if (data.row == 5) {
				if ($("[row=\'" + data.row + "\'][column=\'" + (parseInt(data.column) + 1) + "\']").attr("enpassant") == "true" &&
					$("[row=\'" + (parseInt(data.row) + 1) + "\'][column=\'" + (parseInt(data.column) + 1) + "\']").attr("empty") == "true") {
					$("[row=\'" + (parseInt(data.row) + 1) + "\'][column=\'" + (parseInt(data.column) + 1) + "\']").css("background-color", "red");
				}
				if ($("[row=\'" + data.row + "\'][column=\'" + (parseInt(data.column) - 1) + "\']").attr("enpassant") == "true" &&
					$("[row=\'" + (parseInt(data.row) + 1) + "\'][column=\'" + (parseInt(data.column) - 1) + "\']").attr("empty") == "true") {
					$("[row=\'" + (parseInt(data.row) + 1) + "\'][column=\'" + (parseInt(data.column) - 1) + "\']").css("background-color", "red");
				}
			}

			//Showing possible moves
			if (data.row == "2") {
				if ($("[row = \'3\'][column = \'" + data.column + "\']").attr("checkpath") == "true") {
					$("[row = \'3\'][column = \'" + data.column + "\']").css("background-color", "blue");
					return;
				}

				if ($("[row = \'4\'][column = \'" + data.column + "\']").attr("checkpath") == "true") {
					$("[row = \'4\'][column = \'" + data.column + "\']").css("background-color", "blue");
					return;
				}

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
			if ($("[row=\'" + data.row + "\'][column=\'" + (parseInt(data.column) + 1) + "\']").attr("enpassant") == "true" &&
				$("[row=\'" + (parseInt(data.row) - 1) + "\'][column=\'" + (parseInt(data.column) + 1) + "\']").attr("empty") == "true") {
				$("[row=\'" + (parseInt(data.row) - 1) + "\'][column=\'" + (parseInt(data.column) + 1) + "\']").css("background-color", "red");
			}
			if ($("[row=\'" + data.row + "\'][column=\'" + (parseInt(data.column) - 1) + "\']").attr("enpassant") == "true" &&
				$("[row=\'" + (parseInt(data.row) - 1) + "\'][column=\'" + (parseInt(data.column) - 1) + "\']").attr("empty") == "true") {
				$("[row=\'" + (parseInt(data.row) - 1) + "\'][column=\'" + (parseInt(data.column) - 1) + "\']").css("background-color", "red");
			}

			//Showing possible moves
			if (data.row == "7") {
				if ($("[row = \'6\'][column = \'" + data.column + "\']").attr("checkpath") == "true") {
					$("[row = \'6\'][column = \'" + data.column + "\']").css("background-color", "blue");
					return;
				}

				if ($("[row = \'5\'][column = \'" + data.column + "\']").attr("checkpath") == "true") {
					$("[row = \'5\'][column = \'" + data.column + "\']").css("background-color", "blue");
					return;
				}
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
		ShowMovesStraight(data.row, data.column);
	} else if (data.piece == "knight") {
		let cells = GetKnightCells(data.row, data.column);
		cells.forEach(function (cell) {
			if (cell.attr("checkpath") == "true") {
				cell.css("background-color", "blue");
				return;
			}
		});

		cells.forEach(function (cell) {
			if (cell.attr("empty") == "true") {
				cell.css("background-color", "blue");
			} else if (cell.attr("player") != turnPlayer) {
				cell.css("background-color", "red");
			}
		});
	} else if (data.piece == "bishop") {
		ShowMovesDiagonal(data.row, data.column);
	} else if (data.piece == "queen") {
		ShowMovesStraight(data.row, data.column);
		ShowMovesDiagonal(data.row, data.column);
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

		if (CheckCastleKingSide(data.player, data.row)) {
			$("[row=\'" + data.row + "\'][column='7']").css("background-color", "blue");
		}
		if (CheckCastleQueenSide(data.player, data.row)) {
			$("[row=\'" + data.row + "\'][column='3']").css("background-color", "blue");
		}

	}
}

function ShowMovesSetCursor() {
	$("[empty]").each(function () {
		if ($(this).css("background-color") == "rgb(0, 0, 255)" || $(this).css("background-color") == "rgb(255, 0, 0)") {
			$(this).css("cursor", "url(../res/custom_pointer.cur), pointer");
		}
	});
}

/** Moves piece to target row and column
 * 
 * @param {*} targetRow 
 * @param {*} targetColumn 
 * @param {*} thisRow [Optional] Default to data.row
 * @param {*} thisColumn [Optional] Default to data.column
 * @param {*} thisPlayer [Optional] Default to data.player
 * @param {*} thisPiece [Optional] Default to data.piece
 */
function MovePiece(targetRow, targetColumn, thisRow = data.row, thisColumn = data.column, thisPlayer = data.player, thisPiece = data.piece) {
	$("[row = \'" + thisRow + "\'][column = \'" + thisColumn + "\']")
		.attr("empty", "true")
		.removeAttr("piece")
		.removeAttr("player")
		.css("background-image", "")
		.css("background-size", "");
	$("[row = \'" + targetRow + "\'][column = \'" + targetColumn + "\']")
		.attr("empty", "false")
		.attr("piece", thisPiece)
		.attr("player", thisPlayer)
		.css("background-image", "url(\"../res/" + thisPlayer + "Pieces/" + thisPlayer + "_" + thisPiece + ".png\"")
		.css("background-size", "70% 90%")
		.css("background-repeat", "no-repeat")
		.css("background-position", "center");
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

function ShowMovesStraight(thisRow, thisColumn) {
	thisRow = parseInt(thisRow);
	thisColumn = parseInt(thisColumn);
	if ($("[piece='king'][player=\'" + data.player + "\']").attr("check") == "true") {
		//Horizontal
		for (let i = thisRow - 1; i >= 1; i--) {
			if ($("[row = \'" + i + "\'][column = \'" + thisColumn + "\']").attr("checkpath") == "true") {
				$("[row = \'" + i + "\'][column = \'" + thisColumn + "\']").css("background", "blue");
				return true;
			}
		}
		for (let i = thisRow + 1; i <= 8; i++) {
			if ($("[row = \'" + i + "\'][column = \'" + thisColumn + "\']").attr("checkpath") == "true") {
				$("[row = \'" + i + "\'][column = \'" + thisColumn + "\']").css("background", "blue");
				return true;
			}
		}
		//Vertical
		for (let i = parseInt(thisColumn) - 1; i >= 1; i--) {
			if ($("[row = \'" + thisRow + "\'][column = \'" + i + "\']").attr("checkpath") == "true") {
				$("[row = \'" + thisRow + "\'][column = \'" + i + "\']").css("background", "blue");
				return true;
			}
		}
		for (let i = parseInt(thisColumn) + 1; i <= 8; i++) {
			if ($("[row = \'" + thisRow + "\'][column = \'" + i + "\']").attr("checkpath") == "true") {
				$("[row = \'" + thisRow + "\'][column = \'" + i + "\']").css("background", "blue");
				return true;
			}
		}
	} else {
		//Upwards
		for (let i = thisRow - 1; i >= 1; i--) {
			if ($("[row = \'" + i + "\'][column = \'" + thisColumn + "\']").attr("empty") == "false") {
				if ($("[row = \'" + i + "\'][column = \'" + thisColumn + "\']").attr("player") != turnPlayer) {
					$("[row = \'" + i + "\'][column = \'" + thisColumn + "\']").css("background-color", "red");
				}
				break;
			} else {
				$("[row = \'" + i + "\'][column = \'" + thisColumn + "\']").css("background", "blue");
			}
		}
		//Downwards
		for (let i = thisRow + 1; i <= 8; i++) {
			if ($("[row = \'" + i + "\'][column = \'" + thisColumn + "\']").attr("empty") == "false") {
				if ($("[row = \'" + i + "\'][column = \'" + thisColumn + "\']").attr("player") != turnPlayer) {
					$("[row = \'" + i + "\'][column = \'" + thisColumn + "\']").css("background-color", "red");
				}
				break;
			} else {
				$("[row = \'" + i + "\'][column = \'" + thisColumn + "\']").css("background", "blue");
			}
		}
		//Leftwards
		for (let i = parseInt(thisColumn) - 1; i >= 1; i--) {
			if ($("[row = \'" + thisRow + "\'][column = \'" + i + "\']").attr("empty") == "false") {
				if ($("[row = \'" + thisRow + "\'][column = \'" + i + "\']").attr("player") != turnPlayer) {
					$("[row = \'" + thisRow + "\'][column = \'" + i + "\']").css("background-color", "red");
				}
				break;
			} else {
				$("[row = \'" + thisRow + "\'][column = \'" + i + "\']").css("background", "blue");
			}
		}
		//Rightwards
		for (let i = parseInt(thisColumn) + 1; i <= 8; i++) {
			if ($("[row = \'" + thisRow + "\'][column = \'" + i + "\']").attr("empty") == "false") {
				if ($("[row = \'" + thisRow + "\'][column = \'" + i + "\']").attr("player") != turnPlayer) {
					$("[row = \'" + thisRow + "\'][column = \'" + i + "\']").css("background-color", "red");
				}
				break;
			} else {
				$("[row = \'" + thisRow + "\'][column = \'" + i + "\']").css("background", "blue");
			}
		}
	}
}

function ShowMovesDiagonal(thisRow, thisColumn) {
	thisRow = parseInt(thisRow);
	thisColumn = parseInt(thisColumn);
	let dist;

	if ($("[piece='king'][player=\'" + data.player + "\']").attr("check") == "true") {
		dist = (Math.abs(thisRow - 1) <= Math.abs(thisColumn - 8)) ? Math.abs(thisRow - 1) : Math.abs(thisColumn - 1);
		for (let i = 1; i <= dist; i++) {
			if ($("[row=\'" + (thisRow - i) + "\'][column=\'" + (thisColumn - i) + "\']").attr("checkpath") == "true") {
				$("[row=\'" + (thisRow - i) + "\'][column=\'" + (thisColumn - i) + "\']").css("background-color", "blue");
				return true;
			}
		}
		dist = (Math.abs(thisRow - 1) <= Math.abs(thisColumn - 8)) ? Math.abs(thisRow - 1) : Math.abs(thisColumn - 8);
		for (let i = 1; i <= dist; i++) {
			if ($("[row=\'" + (thisRow - i) + "\'][column=\'" + (thisColumn + i) + "\']").attr("checkpath") == "true") {
				$("[row=\'" + (thisRow - i) + "\'][column=\'" + (thisColumn + i) + "\']").css("background-color", "blue");
				return true;
			}
		}
		dist = (Math.abs(thisRow - 1) <= Math.abs(thisColumn - 8)) ? Math.abs(thisRow - 8) : Math.abs(thisColumn - 8);
		for (let i = 1; i <= dist; i++) {
			if ($("[row=\'" + (thisRow + i) + "\'][column=\'" + (thisColumn + i) + "\']").attr("checkpath") == "true") {
				$("[row=\'" + (thisRow + i) + "\'][column=\'" + (thisColumn + i) + "\']").css("background-color", "blue");
				return true;
			}
		}
		dist = (Math.abs(thisRow - 1) <= Math.abs(thisColumn - 8)) ? Math.abs(thisRow - 8) : Math.abs(thisColumn - 1);
		for (let i = 1; i <= dist; i++) {
			if ($("[row=\'" + (thisRow + i) + "\'][column=\'" + (thisColumn - i) + "\']").attr("checkpath") == "true") {
				$("[row=\'" + (thisRow + i) + "\'][column=\'" + (thisColumn - i) + "\']").css("background-color", "blue");
				return true;
			}
		}
	} else {
		//Northwest
		dist = (Math.abs(thisRow - 1) <= Math.abs(thisColumn - 8)) ? Math.abs(thisRow - 1) : Math.abs(thisColumn - 1);
		for (let i = 1; i <= dist; i++) {
			if ($("[row=\'" + (thisRow - i) + "\'][column=\'" + (thisColumn - i) + "\']").attr("empty") == "false") {
				if ($("[row=\'" + (thisRow - i) + "\'][column=\'" + (thisColumn - i) + "\']").attr("player") != turnPlayer) {
					$("[row=\'" + (thisRow - i) + "\'][column=\'" + (thisColumn - i) + "\']").css("background-color", "red");
					break;
				} else { break; }
			} else {
				$("[row=\'" + (thisRow - i) + "\'][column=\'" + (thisColumn - i) + "\']").css("background-color", "blue");
			}
		}
		//Northeast
		dist = (Math.abs(thisRow - 1) <= Math.abs(thisColumn - 8)) ? Math.abs(thisRow - 1) : Math.abs(thisColumn - 8);
		for (let i = 1; i <= dist; i++) {
			if ($("[row=\'" + (thisRow - i) + "\'][column=\'" + (thisColumn + i) + "\']").attr("empty") == "false") {
				if ($("[row=\'" + (thisRow - i) + "\'][column=\'" + (thisColumn + i) + "\']").attr("player") != turnPlayer) {
					$("[row=\'" + (thisRow - i) + "\'][column=\'" + (thisColumn + i) + "\']").css("background-color", "red");
					break;
				} else { break; }
			} else {
				$("[row=\'" + (thisRow - i) + "\'][column=\'" + (thisColumn + i) + "\']").css("background-color", "blue");
			}
		}

		//Southeast
		dist = (Math.abs(thisRow - 1) <= Math.abs(thisColumn - 8)) ? Math.abs(thisRow - 8) : Math.abs(thisColumn - 8);
		for (let i = 1; i <= dist; i++) {
			if ($("[row=\'" + (thisRow + i) + "\'][column=\'" + (thisColumn + i) + "\']").attr("empty") == "false") {
				if ($("[row=\'" + (thisRow + i) + "\'][column=\'" + (thisColumn + i) + "\']").attr("player") != turnPlayer) {
					$("[row=\'" + (thisRow + i) + "\'][column=\'" + (thisColumn + i) + "\']").css("background-color", "red");
					break;
				} else { break; }
			} else {
				$("[row=\'" + (thisRow + i) + "\'][column=\'" + (thisColumn + i) + "\']").css("background-color", "blue");
			}
		}

		//Southwest
		dist = (Math.abs(thisRow - 1) <= Math.abs(thisColumn - 8)) ? Math.abs(thisRow - 8) : Math.abs(thisColumn - 1);
		for (let i = 1; i <= dist; i++) {
			if ($("[row=\'" + (thisRow + i) + "\'][column=\'" + (thisColumn - i) + "\']").attr("empty") == "false") {
				if ($("[row=\'" + (thisRow + i) + "\'][column=\'" + (thisColumn - i) + "\']").attr("player") != turnPlayer) {
					$("[row=\'" + (thisRow + i) + "\'][column=\'" + (thisColumn - i) + "\']").css("background-color", "red");
					break;
				} else { break; }
			} else {
				$("[row=\'" + (thisRow + i) + "\'][column=\'" + (thisColumn - i) + "\']").css("background-color", "blue");
			}
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

function CheckforCheck() {
	//Refresh check/ers
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

		console.log(thisPlayer + " king moves : " + moves);

		//#region Checkmate
		if ($(this).attr("check") == "true" && moves == 0) {
			CheckMate();
			$("[checker='true']").css("background-color", "red");
			$("[check='true'][piece='king']").css("background-color", "pink");
		}

		//#endregion


	});
}

function CheckforMoves() {
	$("[canMove='true']").each(function () {
		$(this).removeAttr("canmove");
	});

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
		let thisRow = $(this).attr("row"),
			thisColumn = $(this).attr("column"),
			thisPiece = $(this).attr("piece"),
			thisPlayer = $(this).attr("player");
		if (CheckEat(checkerRow, checkerColumn, thisPlayer, thisPiece, thisRow, thisColumn)) {
			console.log(thisPlayer + " - " + thisPiece + " at [row: " + thisRow + "\tcolumn: " + thisColumn +
				" can eat checker: " + checkerPiece + " at [row: " + checkerRow + "\tcolumn: " + checkerColumn);
			$(this).attr("canmove", "true");
			moves += 1;
		}
	});

	//Find position of checker from king and check if a piece can block it
	if (kingRow == checkerRow) {
		// Checker is left of king
		if (kingColumn > checkerColumn) {
			$("[player=\'" + kingPlayer + "\']").each(function () {
				let thisRow = $(this).attr("row"),
					thisColumn = $(this).attr("column"),
					thisPiece = $(this).attr("piece"),
					thisPlayer = $(this).attr("player");
				for (let i = 1; i < xDist; i++) {
					$("[row=\'" + (kingRow) + "\'][column=\'" + (kingColumn - i) + "\']").attr("checkPath", "true");
					if ($(this).attr("piece") != "king" && CheckMove(kingRow, kingColumn - i, thisPlayer, thisPiece, thisRow, thisColumn)) {
						console.log(thisPlayer + " - " + thisPiece +
							" at [row: " + thisRow + "\tcolumn: " + thisColumn +
							"]\tcan move to [row: " + kingRow + "\tcolumn: " + (kingColumn - i) + "]");
						$(this).attr("canmove", "true");
						moves += 1;
					}
				}
			});
		}
		//Checker is right of king
		else if (kingColumn < checkerColumn) {
			$("[player=\'" + kingPlayer + "\']").each(function () {
				let thisRow = $(this).attr("row"),
					thisColumn = $(this).attr("column"),
					thisPiece = $(this).attr("piece"),
					thisPlayer = $(this).attr("player");
				for (let i = 1; i < xDist; i++) {
					$("[row=\'" + (kingRow) + "\'][column=\'" + (kingColumn + i) + "\']").attr("checkPath", "true");
					if ($(this).attr("piece") != "king" && CheckMove(kingRow, kingColumn + i, thisPlayer, thisPiece, thisRow, thisColumn)) {
						console.log(thisPlayer + " - " + thisPiece +
							" at [row: " + thisRow + "\tcolumn: " + thisColumn +
							"]\tcan move to [row: " + kingRow + "\tcolumn: " + (kingColumn + i) + "]");
						$(this).attr("canmove", "true");
						moves += 1;
					}
				}
			});
		}

	} else if (kingRow > checkerRow) {
		//Checker is northwest of king
		if (kingColumn > checkerColumn) {
			$("[player=\'" + kingPlayer + "\']").each(function () {
				let thisRow = $(this).attr("row"),
					thisColumn = $(this).attr("column"),
					thisPiece = $(this).attr("piece"),
					thisPlayer = $(this).attr("player");
				for (let i = 1; i < yDist; i++) {
					$("[row=\'" + (kingRow - i) + "\'][column=\'" + (kingColumn - i) + "\']").attr("checkPath", "true");
					if ($(this).attr("piece") != "king" && CheckMove((kingRow - i), (kingColumn - i), thisPlayer, thisPiece, thisRow, thisColumn)) {
						console.log(thisPlayer + " - " + thisPiece +
							" at [row: " + thisRow + "\tcolumn: " + thisColumn +
							"]\tcan move to [row: " + (kingRow - i) + "\tcolumn: " + (kingColumn - i) + "]");
						$(this).attr("canmove", "true");
						moves += 1;
					}
				}
			});
		}

		//Checker is directly above king
		else if (kingColumn == checkerColumn) {
			$("[player=\'" + kingPlayer + "\']").each(function () {
				let thisRow = $(this).attr("row"),
					thisColumn = $(this).attr("column"),
					thisPiece = $(this).attr("piece"),
					thisPlayer = $(this).attr("player");
				for (let i = 1; i < yDist; i++) {
					$("[row=\'" + (kingRow - i) + "\'][column=\'" + (kingColumn) + "\']").attr("checkPath", "true");
					if ($(this).attr("piece") != "king" && CheckMove((kingRow - i), (kingColumn), thisPlayer, thisPiece, thisRow, thisColumn)) {
						console.log(thisPlayer + " - " + thisPiece +
							" at [row: " + thisRow + "\tcolumn: " + thisColumn +
							"]\tcan move to [row: " + (kingRow - i) + "\tcolumn: " + (kingColumn) + "]");
						$(this).attr("canmove", "true");
						moves += 1;
					}
				}
			});
		}

		//Checker is northeast of king
		else if (kingColumn < checkerColumn) {
			$("[player=\'" + kingPlayer + "\']").each(function () {
				let thisRow = $(this).attr("row"),
					thisColumn = $(this).attr("column"),
					thisPiece = $(this).attr("piece"),
					thisPlayer = $(this).attr("player");
				for (let i = 1; i < yDist; i++) {
					$("[row=\'" + (kingRow - i) + "\'][column=\'" + (kingColumn + i) + "\']").attr("checkPath", "true");
					if ($(this).attr("piece") != "king" && CheckMove((kingRow - i), (kingColumn + i), thisPlayer, thisPiece, thisRow, thisColumn)) {
						console.log(thisPlayer + " - " + thisPiece +
							" at [row: " + thisRow + "\tcolumn: " + thisColumn +
							"]\tcan move to [row: " + (kingRow - i) + "\tcolumn: " + (kingColumn + i) + "]");
						$(this).attr("canmove", "true");
						moves += 1;
					}
				}
			});
		}

	} else if (kingRow < checkerRow) {
		//Checker is southwest of king
		if (kingColumn > checkerColumn) {
			$("[player=\'" + kingPlayer + "\']").each(function () {
				let thisRow = $(this).attr("row"),
					thisColumn = $(this).attr("column"),
					thisPiece = $(this).attr("piece"),
					thisPlayer = $(this).attr("player");
				for (let i = 1; i < yDist; i++) {
					$("[row=\'" + (kingRow + i) + "\'][column=\'" + (kingColumn - i) + "\']").attr("checkPath", "true");
					if ($(this).attr("piece") != "king" && CheckMove((kingRow + i), (kingColumn - i), thisPlayer, thisPiece, thisRow, thisColumn)) {
						console.log(thisPlayer + " - " + thisPiece +
							" at [row: " + thisRow + "\tcolumn: " + thisColumn +
							"]\tcan move to [row: " + (kingRow + i) + "\tcolumn: " + (kingColumn - i) + "]");
						$(this).attr("canmove", "true");
						moves += 1;
					}
				}
			});
		}

		//Checker is directly below king
		else if (kingColumn == checkerColumn) {
			$("[player=\'" + kingPlayer + "\']").each(function () {
				let thisRow = $(this).attr("row"),
					thisColumn = $(this).attr("column"),
					thisPiece = $(this).attr("piece"),
					thisPlayer = $(this).attr("player");
				for (let i = 1; i < yDist; i++) {
					$("[row=\'" + (kingRow + i) + "\'][column=\'" + (kingColumn) + "\']").attr("checkPath", "true");
					if ($(this).attr("piece") != "king" && CheckMove((kingRow + i), (kingColumn), thisPlayer, thisPiece, thisRow, thisColumn)) {
						console.log(thisPlayer + " - " + thisPiece +
							" at [row: " + thisRow + "\tcolumn: " + thisColumn +
							"]\tcan move to [row: " + (kingRow + i) + "\tcolumn: " + (kingColumn) + "]");
						$(this).attr("canmove", "true");
						moves += 1;
					}
				}
			});
		}

		//Checker is southeast of king
		else if (kingColumn < checkerColumn) {
			$("[player=\'" + kingPlayer + "\']").each(function () {
				let thisRow = $(this).attr("row"),
					thisColumn = $(this).attr("column"),
					thisPiece = $(this).attr("piece"),
					thisPlayer = $(this).attr("player");
				for (let i = 1; i < yDist; i++) {
					$("[row=\'" + (kingRow + i) + "\'][column=\'" + (kingColumn + i) + "\']").attr("checkPath", "true");
					if ($(this).attr("piece") != "king" && CheckMove((kingRow + i), (kingColumn + i), thisPlayer, thisPiece, thisRow, thisColumn)) {
						console.log(thisPlayer + " - " + thisPiece +
							" at [row: " + thisRow + "\tcolumn: " + thisColumn +
							"]\tcan move to [row: " + (kingRow + i) + "\tcolumn: " + (kingColumn + i) + "]");
						$(this).attr("canmove", "true");
						moves += 1;
					}
				}
			});
		}
	}
}

function CheckforEnPassant() {
	$("[enpassant='true'][player=\'" + turnPlayer + "\']").each(function () {
		$(this).removeAttr("enpassant");
	});
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

	return false;
}

function CheckMate() {
	alert(usernames[turnPlayer] + " WINS");
	$(".overlay#endGame").css("display", "block");
}

function StaleMate() {
	alert("DRAW!");
}

//#region Pawn Promotion
function CheckforPromotion() {
	if ($("[row='8'][player='dog'][piece='pawn']").length == 1) {
		ShowPawnPromotes();
	} else if ($("[row='1'][player='cat'][piece='pawn']").length == 1) {
		ShowPawnPromotes();
	}
}

function ShowPawnPromotes() {
	$(".overlay#pawnPromotion img.option").each(function () {
		let piece = $(this).attr("id");
		$(this).attr("src", "../res/" + turnPlayer + "Pieces/" + turnPlayer + "_" + piece + ".png");
	});
	$(".overlay#pawnPromotion").css("display", "flex");
}

$(".overlay#pawnPromotion img.option").on("click", function () {
	let pieceSelected = $(this).attr("id");
	if (turnPlayer == "dog") {
		$("[row='1'][piece='pawn']").attr("piece", pieceSelected)
			.css("background-image", "url(\"../res/catPieces/cat_" + pieceSelected + ".png\"")
			.css("background-size", "70% 90%");
	} else {
		$("[row='8'][piece='pawn']").attr("piece", pieceSelected)
			.css("background-image", "url(\"../res/dogPieces/dog_" + pieceSelected + ".png\"")
			.css("background-size", "70% 90%");
	}
	$(".overlay#pawnPromotion").css("display", "none");
	TakeSnapShot();
	setTimeout(CheckforCheck(), 500);
});
//#endregion

//#region Castling
function CheckCastleKingSide(thisPlayer, thisRow) {
	// console.log("row = " + thisRow + "\tplayer = " + thisPlayer);
	let thisKing = $("[piece='king'][player=\'" + thisPlayer + "\']"),
		rightRook = $("[row=\'" + thisRow + "\'][column='8']");
	if (thisKing.attr("castle") == "true" && thisKing.attr("check") != "true" && rightRook.attr("castle") == "true" &&
		!(IsCheck(thisRow, "6", thisPlayer)) && $("[row=\'" + thisRow + "\'][column='6']").attr("empty") == "true" &&
		!(IsCheck(thisRow, "7", thisPlayer)) && $("[row=\'" + thisRow + "\'][column='7']").attr("empty") == "true") {
		return true;
	} else { return false; }
}

function CheckCastleQueenSide(thisPlayer, thisRow) {
	let thisKing = $("[piece='king'][player=\'" + thisPlayer + "\']"),
		leftRook = $("[row=\'" + thisRow + "\'][column='1']");
	if (thisKing.attr("castle") == "true" && thisKing.attr("check") != "true" && leftRook.attr("castle") == "true" &&
		!(IsCheck(thisRow, "4", thisPlayer)) && $("[row=\'" + thisRow + "\'][column='4']").attr("empty") == "true" &&
		!(IsCheck(thisRow, "3", thisPlayer)) && $("[row=\'" + thisRow + "\'][column='3']").attr("empty") == "true" &&
		$("[row=\'" + thisRow + "\'][column='3']").attr("empty") == "true") {
		return true;
	} else { return false; }
}
//#endregion

//#region EndGame
$(".overlay#endGame img#btnOk").on("click", function () {
	if ($(".overlay#endGame").css("display") != "none") {
		location.replace("./home.html");
	}
});
//#endregion

//#region Sound Effects of Pieces
function PlaySound(sound) {
	if (enableSound == true) {
		if (sound == "move") {
			$("audio#sound-pieceMove").get(0).play();
		} else if (sound == "eat") {
			$("audio#sound-pieceEat").get(0).play();
		}
	}
}
//#endregion

//#region Ease of Code
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

function GetKnightCells(thisRow, thisColumn) {
	thisRow = parseInt(thisRow);
	thisColumn = parseInt(thisColumn);
	return [
		$("[row=\'" + (thisRow - 1) + "\'][column=\'" + (thisColumn - 2) + "\']"),
		$("[row=\'" + (thisRow - 2) + "\'][column=\'" + (thisColumn - 1) + "\']"),
		$("[row=\'" + (thisRow - 2) + "\'][column=\'" + (thisColumn + 1) + "\']"),
		$("[row=\'" + (thisRow - 1) + "\'][column=\'" + (thisColumn + 2) + "\']"),
		$("[row=\'" + (thisRow + 1) + "\'][column=\'" + (thisColumn + 2) + "\']"),
		$("[row=\'" + (thisRow + 2) + "\'][column=\'" + (thisColumn + 1) + "\']"),
		$("[row=\'" + (thisRow + 2) + "\'][column=\'" + (thisColumn - 1) + "\']"),
		$("[row=\'" + (thisRow + 1) + "\'][column=\'" + (thisColumn - 2) + "\']")
	];
}
//#endregion

/** Takes a snapshot of the board and stores it in an array
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

		if ($(this).attr("castle") == "true") {
			cell.castle = "true";
		}
		if ($(this).attr("enpassant") == "true") {
			cell.enpassant = "true";
		}
		snapShot.push(cell);
	});
	boardHistory[turnCounter] = snapShot;
	sessionStorage.setItem("boardHistory", JSON.stringify(boardHistory));
	console.log("Snapshot taken and stored into array and sesh storage");
}

//#region For Debugging
function LogMove(targetRow, targetColumn, thisRow, thisColumn, action = "move") {
	if (action == "eat") {
		let pieceMoved = $("[row=\'" + thisRow + "\'][column=\'" + thisColumn + "\']"),
			pieceEaten = $("[row=\'" + targetRow + "\'][column=\'" + targetColumn + "\']");
		let text = "#" + turnCounter + " " + pieceMoved.attr("player") + " - " + pieceMoved.attr("piece") + " [" +
			columnLegend[parseInt(pieceMoved.attr("column")) - 1] + pieceMoved.attr("row") +
			" X " + columnLegend[parseInt(pieceEaten.attr("column")) - 1] + pieceEaten.attr("row") +
			"] " + pieceEaten.attr("player") + "-" + pieceEaten.attr("piece");
		$(".history ul").append($("<li></li>").text(text));
		logHistory.push(text);
	} else {
		let pieceMoved = $("[row=\'" + thisRow + "\'][column=\'" + thisColumn + "\']");
		let text = "#" + turnCounter + " " + pieceMoved.attr("player") + "-" + pieceMoved.attr("piece") + " [" +
			columnLegend[parseInt(pieceMoved.attr("column") - 1)] + pieceMoved.attr("row") +
			" >> " + columnLegend[parseInt(targetColumn) - 1] + targetRow + "]";
		$(".history ul").append($("<li></li>").text(text))
			//This animate function is used so that when the element is added, it will automatically scroll to bottom
			.animate({ scrollTop: $(this).height() }, 100);
		logHistory.push(text);
	}
}

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
