document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    let board = null; // Initialize the chessboard
    console.log('Board initialized:', board);

    let game = new Chess(); // Create a new Chess.js game instance
    console.log('New Chess game instance created:', game);

    const moveHistory = document.getElementById('move-history'); // Get move history container
    console.log('Move history element:', moveHistory);

    let moveCount = 1; // Initialize the move count
    console.log('Move count initialized:', moveCount);

    let userColor = 'w'; // Initialize the user's color as white
    console.log('User color set to:', userColor);

    // Initialize Speech Recognition
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    console.log('Speech recognition initialized:', recognition);

    recognition.lang = 'en-US';
    console.log('Speech recognition language set to en-US');

    recognition.interimResults = false;
    console.log('Speech recognition interim results set to false');

    recognition.maxAlternatives = 1;
    console.log('Speech recognition max alternatives set to 1');

    recognition.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        console.log(`Recognition result received: You said "${command}"`);
        processCommand(command);
    };
    console.log('Speech recognition onresult event listener added');

    recognition.onspeechend = () => {
        console.log('Speech ended');
        recognition.stop();
    };
    console.log('Speech recognition onspeechend event listener added');

    recognition.onerror = (event) => {
        console.error(`Error occurred in recognition: ${event.error}`);
    };
    console.log('Speech recognition onerror event listener added');

    const startListening = () => {
        console.log('Starting speech recognition');
        recognition.start();
    };
    console.log('Start listening function defined');

    // Function to make a random move for the computer
    const makeRandomMove = () => {
        console.log('Making random move for the computer');
        const possibleMoves = game.moves();
        console.log('Possible moves for computer:', possibleMoves);

        if (game.game_over()) {
            console.log("Game over: Checkmate!");
            alert("Checkmate!");
        } else {
            const randomIdx = Math.floor(Math.random() * possibleMoves.length);
            console.log('Random index for computer move:', randomIdx);

            const move = possibleMoves[randomIdx];
            console.log(`Computer chose move: ${move}`);

            game.move(move);
            console.log('Computer move executed:', move);

            board.position(game.fen());
            console.log('Board position updated to:', game.fen());

            recordMove(move, moveCount); // Record and display the move with move count
            console.log('Move recorded:', move);

            moveCount++; // Increment the move count
            console.log('Move count incremented to:', moveCount);
        }
    };
    console.log('Make random move function defined');

    // Function to record and display a move in the move history
    const recordMove = (move, count) => {
        const formattedMove = count % 2 === 1 ? `${Math.ceil(count / 2)}. ${move}` : `${move} -`;
        console.log(`Formatted move: ${formattedMove}`);

        moveHistory.textContent += formattedMove + ' ';
        console.log('Move history updated:', moveHistory.textContent);

        moveHistory.scrollTop = moveHistory.scrollHeight; // Auto-scroll to the latest move
        console.log('Move history auto-scrolled to the latest move');
    };
    console.log('Record move function defined');

    // Function to handle the start of a drag position
    const onDragStart = (source, piece) => {
        console.log(`Drag start: piece ${piece} from ${source}`);

        const canDrag = !game.game_over() && piece.search(userColor) === 0;
        console.log('Can drag:', canDrag);

        return canDrag;
    };
    console.log('onDragStart function defined');

    // Function to handle a piece drop on the board
    const onDrop = (source, target) => {
        console.log(`Piece dropped from ${source} to ${target}`);

        const move = game.move({
            from: source,
            to: target,
            promotion: 'q',
        });
        console.log('Move object:', move);

        if (move === null) {
            console.log('Invalid move: snapback');
            return 'snapback';
        }

        console.log(`Valid move: ${move.san}`);
        window.setTimeout(makeRandomMove, 250);

        recordMove(move.san, moveCount); // Record and display the move with move count
        console.log('Move recorded:', move.san);

        moveCount++;
        console.log('Move count incremented to:', moveCount);
    };
    console.log('onDrop function defined');

    // Function to handle the end of a piece snap animation
    const onSnapEnd = () => {
        console.log('Snap end: updating board position');
        board.position(game.fen());
        console.log('Board position updated to:', game.fen());
    };
    console.log('onSnapEnd function defined');

    // Function to process voice commands
    const processCommand = (command) => {
        console.log(`Processing command: "${command}"`);
        const words = command.split(' ');
        console.log('Split command into words:', words);

        // Define a helper function to handle moves
        const handleMoveCommand = (pieceType, targetSquare) => {
            // Trim any punctuation or whitespace from target square
            targetSquare = targetSquare.replace(/[^a-z0-9]/gi, '').toLowerCase();
            
            console.log('Piece:', pieceType, 'Target Square:', targetSquare);
    
            const possibleMoves = game.moves({ verbose: true });
            console.log('Possible moves:', possibleMoves); // Log all possible moves
    
            const filteredMoves = possibleMoves.filter(move => move.piece === pieceType && move.to === targetSquare);
            console.log('Filtered moves:', filteredMoves); // Log filtered moves
    
            if (filteredMoves.length > 0) {
                const move = filteredMoves[0];
                console.log(`Executing move: ${move.san}`);
    
                const result = game.move({
                    from: move.from,
                    to: move.to,
                    promotion: 'q' // Default promotion to queen for simplicity
                });
                console.log('Move result:', result);
    
                if (result !== null) {
                    board.position(game.fen()); // Update the board position
                    recordMove(result.san, moveCount); // Record and display the move with move count
                    moveCount++;
                    window.setTimeout(makeRandomMove, 250); // Make random move after user's move
                }
            } else {
                console.log('Invalid move command');
            }
        };
    
        if (words.length >= 4 && words[0] === 'move' && words[2] === 'to') {
            const piece = words[1];
            const targetSquare = words[3].toLowerCase(); // Ensure target square is in uppercase (e.g., E4)
            
            switch (piece) {
                case 'pawn':
                    handleMoveCommand('p', targetSquare);
                    break;
                case 'knight':
                    handleMoveCommand('n', targetSquare);
                    break;
                case 'rook':
                    handleMoveCommand('r', targetSquare);
                    break;
                case 'bishop':
                    handleMoveCommand('b', targetSquare);
                    break;
                case 'queen':
                    handleMoveCommand('q', targetSquare);
                    break;
                case 'king':
                    handleMoveCommand('k', targetSquare);
                    break;
                default:
                    console.log('Invalid piece type');
            }
        } else {
            console.log('Invalid command format');
        }
    };  
    console.log('processCommand function defined');

    // Function to reset the game
    const resetGame = () => {
        console.log('Resetting game');
        game = new Chess(); // Reset Chess.js game instance
        console.log('New Chess game instance created:', game);

        board.position('start'); // Reset board position
        console.log('Board position reset to start');

        moveHistory.textContent = ''; // Clear move history
        console.log('Move history cleared');

        moveCount = 1; // Reset move count
        console.log('Move count reset to:', moveCount);
    };
    console.log('resetGame function defined');

    // Initialize the chessboard with Chessboard.js
    console.log('Initializing chessboard');
    board = Chessboard('board', {
        draggable: true,
        position: 'start',
        onDragStart,
        onDrop,
        onSnapEnd
    });
    console.log('Chessboard initialized:', board);

    // Add event listener for the "Play Again" button
    document.querySelector('.play-again').addEventListener('click', resetGame);
    console.log('Play Again button event listener added');

    // Add an event listener to start listening for voice commands
    document.getElementById('start-voice').addEventListener('click', startListening);
    console.log('Start voice button event listener added');

    console.log('Event listeners added');
});
