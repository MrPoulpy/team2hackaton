
var game;
var cfg = {
	draggable: true,
	position: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
	ai: true,
	highlight: true,
	selectionable: true
};
var selected = [];

var init = function() {
	
	var board;
	var boardEl = $('#board');
	game = new Chess(cfg.position);
	var squareToHighlight;

	var removeGreySquares = function() {
		$('#board .square-55d63').css('background', '');
	};

	var greySquare = function(square) {
		var squareEl = $('#board .square-' + square);
  
		var background = '#a9a9a9';
		if (squareEl.hasClass('black-3c85d') === true) {
			background = '#696969';
		}

		squareEl.css('background', background);
	};
	
	var removeHighlights = function(color) {
		boardEl.find('.square-55d63').removeClass('highlight-' + color);
	};

	var onDragStart = function(source, piece, position, orientation) {
		if (game.in_checkmate() === true || game.in_draw() === true || piece.search(/^b/) !== -1) {
			return (false);
		}
	};

	var makeRandomMove = function() {
		var possibleMoves = game.moves({
			verbose: true
		});

		// game over
		if (possibleMoves.length === 0) {
			if (game.in_checkmate())
				console.log("win");
			else
				console.log("pat");
			return;
		}

		var randomIndex = Math.floor(Math.random() * possibleMoves.length);
		var move = possibleMoves[randomIndex];
		game.move(move.san);

		// highlight black's move
		removeHighlights('black');
		boardEl.find('.square-' + move.from).addClass('highlight-black');
		squareToHighlight = move.to;

		// update the board to the new position
		board.position(game.fen());
		var possibleMoves = game.moves({
			verbose: true
		});

		// game over
		if (possibleMoves.length === 0) {
			if (game.in_checkmate())
				console.log("lose");
			else
				console.log("pat");
			return;
		}
	};

	var onDrop = function(source, target) {
		 removeGreySquares();
	
		if (cfg.selectionable == true) {
			if (boardEl.find('.square-' + source)[0].classList.contains(".highlighted")) {
				boardEl.find('.square-' + source).removeClass('highlight-white');
				boardEl.find('.square-' + source).removeClass('.highlighted');
				array.splice(array.indexOf(item), 1);
			} else {
				boardEl.find('.square-' + source).addClass('highlight-white');
				boardEl.find('.square-' + source).addClass('.highlighted');
				selected.push(source);
			}
			
			selected.sort();
			
			var print = '';
			var it = 0;
			while (it != selected.length) {
				print = print + selected[it] + ' ';
				++it;
			}
			document.getElementById('selected').innerHTML = print;
			return ;
		}
		// see if the move is legal
		var move = game.move({
			from: source,
			to: target,
			promotion: 'q' // NOTE: always promote to a queen for example simplicity
		});

		// illegal move
		if (move === null) return 'snapback';

		// highlight white's move
		removeHighlights('white');
		boardEl.find('.square-' + source).addClass('highlight-white');
		boardEl.find('.square-' + target).addClass('highlight-white');

		// make random move for black
		if (cfg.ai == false) {
			game.load(game.fen().replace(' b ', ' w '));
			removeHighlights('black');
		} else
			window.setTimeout(makeRandomMove, 250);
		
	};
	
	var onMouseoverSquare = function(square, piece) {
		if (cfg.highlight == false)
			return ;
		// get list of possible moves for this square
		var moves = game.moves({
			square: square,
			verbose: true
		});

		// exit if there are no moves available for this square
		if (moves.length === 0) return;

		// highlight the square they moused over
		greySquare(square);

		// highlight the possible squares for this piece
		for (var i = 0; i < moves.length; i++) {
			greySquare(moves[i].to);
		}
	};
	
	var onMouseoutSquare = function(square, piece) {
		removeGreySquares();
	};

	var onMoveEnd = function() {
		boardEl.find('.square-' + squareToHighlight).addClass('highlight-black');
	};

	// update the board position after the piece snap
	// for castling, en passant, pawn promotion
	var onSnapEnd = function() {
		board.position(game.fen());
	};

	cfg.onDragStart = onDragStart;
	cfg.onDrop = onDrop;
	cfg.onMoveEnd = onMoveEnd;
	cfg.onSnapEnd = onSnapEnd;
	cfg.onMouseoutSquare = onMouseoutSquare;
	cfg.onMouseoverSquare = onMouseoverSquare;
	board = new ChessBoard('board', cfg);
};
