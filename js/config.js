
function loadJson(file, func) {
	$.getJSON(file, function(data) {
		data.draggable = true;
		func(data);
	}).fail(function(err) {
		console.log(err);
	});
}

function pieceTheme(piece) {
	return ('img/chesspieces/'+(piece.indexOf('w') > -1?cfg.theme.w:cfg.theme.b)+'/'+piece+'.png');
}

function addEatedPiece(piece) {
	var profils = document.getElementsByClassName('piece_'+piece.type.toUpperCase());
	var profil = profils[(piece.color == 'b') * 1];
	profil.style.visibility = 'visible';
	var val = (parseInt(profil.childNodes[0].childNodes[0].innerHTML) + 1);
	if (val == 2)
		profil.childNodes[0].style.visibility = 'visible';
	profil.childNodes[0].childNodes[0].innerHTML = val;
}

function init(cfg) {

	document.getElementsByClassName('victory')[0].style.display = 'none';
	document.getElementsByClassName('pat')[0].style.display = 'none';
	document.getElementsByClassName('defeat')[0].style.display = 'none';
	
	var profils = document.getElementsByClassName('echec');
	profils[0].style.display = 'none';
	profils[1].style.display = 'none';

	var profils = document.getElementsByClassName('popup');
	profils[0].innerHTML = cfg.order;

	var profils = document.getElementsByClassName('profil');
	profils[0].style.background = 'url(\'img/blasons/'+cfg.theme.b+'.png\')';
	profils[1].style.background = 'url(\'img/blasons/'+cfg.theme.w+'.png\')';

	var profils = document.getElementsByClassName('piece_B');
	profils[1].style.cssText = 'background: url(\'img/chesspieces/'+cfg.theme.b+'/bB.png\'); background-size: contain;';
	profils[0].style.cssText = 'background: url(\'img/chesspieces/'+cfg.theme.w+'/wB.png\'); background-size: contain;';
	var profils = document.getElementsByClassName('piece_N');
	profils[1].style.cssText = 'background: url(\'img/chesspieces/'+cfg.theme.b+'/bN.png\'); background-size: contain;';
	profils[0].style.cssText = 'background: url(\'img/chesspieces/'+cfg.theme.w+'/wN.png\'); background-size: contain;';
	var profils = document.getElementsByClassName('piece_R');
	profils[1].style.cssText = 'background: url(\'img/chesspieces/'+cfg.theme.b+'/bR.png\'); background-size: contain;';
	profils[0].style.cssText = 'background: url(\'img/chesspieces/'+cfg.theme.w+'/wR.png\'); background-size: contain;';
	var profils = document.getElementsByClassName('piece_P');
	profils[1].style.cssText = 'background: url(\'img/chesspieces/'+cfg.theme.b+'/bP.png\'); background-size: contain;';
	profils[0].style.cssText = 'background: url(\'img/chesspieces/'+cfg.theme.w+'/wP.png\'); background-size: contain;';
	var profils = document.getElementsByClassName('piece_Q');
	profils[1].style.cssText = 'background: url(\'img/chesspieces/'+cfg.theme.b+'/bQ.png\'); background-size: contain;';
	profils[0].style.cssText = 'background: url(\'img/chesspieces/'+cfg.theme.w+'/wQ.png\'); background-size: contain;';
	
	cfg.pieceTheme = pieceTheme;
	cfg.position =  cfg.position + ' ' + cfg.turn + ' KQkq - 0 1';
	
	var board;
	var boardEl = $('#board');
	game = new Chess(cfg.position);
	var squareToHighlight;

	var removeGreySquares = function() {
		$('#board .square-55d63').css('background', '');
	};

	var greySquare = function(square) {
		var squareEl = $('#board .square-' + square);
  
		var background = 'rgba(169, 169, 169, 0.5)';
		if (squareEl.hasClass('black-3c85d') === true) {
			background = 'rgba(105, 105, 105, 0.5)';
		}

		squareEl.css('background', background);
	};
	
	var removeHighlights = function(color) {
		boardEl.find('.square-55d63').removeClass('highlight-' + color);
	};

	var onDragStart = function(source, piece, position, orientation) {
		onMouseoverSquare(source, piece);
		if (game.in_checkmate() === true || game.in_draw() === true || (cfg.color == 'w' ? piece.search(/^b/) : piece.search(/^w/)) !== -1) {
			return (false);
		}
	};

	var makeRandomMove = function() {
		var possibleMoves = game.moves({
			verbose: true
		});

		// game over
		if (possibleMoves.length === 0) {
			if (game.in_checkmate()) {
				document.getElementsByClassName('victory')[0].style.display = 'block';
				if (parseInt(game.fen().split(' ')[5]) == 4)
					document.getElementById('berger').classList.add('discover');
			} else
				document.getElementsByClassName('pat')[0].style.display = 'block';
			return;
		}

		var randomIndex = Math.floor(Math.random() * possibleMoves.length);
		var move = possibleMoves[randomIndex];
		var piece = game.get(move.to);
		if (piece) addEatedPiece(piece);
		game.move(move.san);

		// highlight black's move
		removeHighlights('black');
		boardEl.find('.square-' + move.from).addClass('highlight-black');
		squareToHighlight = move.to;

		var profils = document.getElementsByClassName('echec');
		profils[0].style.display = (game.in_check() ? 'block' : 'none');
		// update the board to the new position
		board.position(game.fen());
		var possibleMoves = game.moves({
			verbose: true
		});
		// game over
		if (possibleMoves.length === 0) {
			if (game.in_checkmate())
				document.getElementsByClassName('defeat')[0].style.display = 'block';
			else
				document.getElementsByClassName('pat')[0].style.display = 'block';
			return;
		}
	};

	var onDrop = function(source, target) {
		onMouseoutSquare(source, target);
		removeGreySquares();
	
		if (cfg.selectionable == true) {
			if (boardEl.find('.square-' + source)[0].classList.contains("highlighted")) {
				boardEl.find('.square-' + source).removeClass('highlight-white');
				boardEl.find('.square-' + source).removeClass('highlighted');
				selected.splice(selected.indexOf(source), 1);
			} else {
				boardEl.find('.square-' + source).addClass('highlight-white');
				boardEl.find('.square-' + source).addClass('highlighted');
				selected.push(source);
			}
			
			selected.sort();
			
			var print = '';
			var it = 0;
			while (it != selected.length) {
				print = print + selected[it] + ' ';
				++it;
			}
//			document.getElementById('selected').innerHTML = print;
			return ;
		}
		
		var piece = game.get(target);
		if (piece && source != target) addEatedPiece(piece);
		
		// see if the move is legal
		var move = game.move({
			from: source,
			to: target,
			promotion: 'q' // NOTE: always promote to a queen for example simplicity
		});

		// illegal move
		if (move === null) return 'snapback';
		var profils = document.getElementsByClassName('echec');
		profils[0].style.display = (game.in_check() ? 'block' : 'none');

		// highlight white's move
		removeHighlights('white');
		boardEl.find('.square-' + source).addClass('highlight-white');
		boardEl.find('.square-' + target).addClass('highlight-white');

		// make random move for black
		if (cfg.ai == false) {
			game.load(game.fen().replace((cfg.color == 'w'?' b ':' w '), (cfg.color == 'w'?' w ':' b ')));
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
	board = new ChessBoard('board', cfg);
	if (cfg.color == 'b')
		board.orientation('black');
	if ((cfg.color == 'b' && cfg.turn == 'w') || (cfg.color == 'w' && cfg.turn == 'b')) {
		makeRandomMove();
	}
};
