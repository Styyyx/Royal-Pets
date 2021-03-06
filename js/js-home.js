$(document).ready(function () {
    var namePlayer1, namePlayer2;

    $(document).on("keydown", function (event) {
        if (event.key == "Enter" && $("#newGame").css("display") != "none") {
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

    //#region Buttons
    //New Game Button
    $("#btn-newGame").on("click",function(){
        $(".overlay#newGame").css("display","flex");
    });
    $(".overlay#newGame #btn-cancel").on("click",function(){
        $(".overlay#newGame").css("display","none");
    });
    $("#btn-howToPlay").on("click",function(){
        $(".overlay#howToPlay").css("display","flex");
    });
    $(".overlay#howToPlay #btn-exit").on("click",function(){
        $(".overlay#howToPlay").css("display","none");
    });

    //#endregion

    //#region Music Handler
    var enableSound = true;

    $(".audioButtons .toggleBtn#btn-music").on("click", function () {
        let audio = $("audio#music").get(0);
        if (audio.paused == true) {
            audio.currentTime = 0;
            audio.play();
            $(this).attr("src","../res/music_on.png");
        } else {
            audio.pause();
            $(this).attr("src","../res/music_off.png");
        }
    });

    $(".audioButtons .toggleBtn#btn-sound").on("click", function () {
        if (enableSound == true) {
            enableSound = false;
            $(this).attr("src","../res/sound_off.png");
        } else {
            enableSound = true;
            $(this).attr("src","../res/sound_on.png");
        }
    });

    $(".sound-btnClick").on("click", function () {
        if (enableSound == true) {
            $("audio#sound-buttonClick").get(0).play();
            $("audio#sound-buttonClick").get(0).currentTime = 0;
        }
    }).on("mouseover",function(){
        if (enableSound == true){
            $("audio#sound-buttonHover").get(0).play();
            $("audio#sound-buttonHover").get(0).currentTime = 0;
        }
    });
    //#endregion

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
                { piece: "rook", player: "dog", row: "1", column: "1", castle: "true" },
                { piece: "knight", player: "dog", row: "1", column: "2" },
                { piece: "bishop", player: "dog", row: "1", column: "3" },
                { piece: "queen", player: "dog", row: "1", column: "4" },
                { piece: "king", player: "dog", row: "1", column: "5", castle: "true" },
                { piece: "bishop", player: "dog", row: "1", column: "6" },
                { piece: "knight", player: "dog", row: "1", column: "7" },
                { piece: "rook", player: "dog", row: "1", column: "8", castle: "true" },

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

                { piece: "rook", player: "cat", row: "8", column: "1", castle: "true" },
                { piece: "knight", player: "cat", row: "8", column: "2" },
                { piece: "bishop", player: "cat", row: "8", column: "3" },
                { piece: "queen", player: "cat", row: "8", column: "4" },
                { piece: "king", player: "cat", row: "8", column: "5", castle: "true" },
                { piece: "bishop", player: "cat", row: "8", column: "6" },
                { piece: "knight", player: "cat", row: "8", column: "7" },
                { piece: "rook", player: "cat", row: "8", column: "8", castle: "true" },
            ];
            window.sessionStorage.setItem("previousState", JSON.stringify(initialState));
            window.sessionStorage.setItem("initialState", JSON.stringify(initialState));
            window.sessionStorage.setItem("state", "initial");
            window.location.replace("./game.html");
        }
    });

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