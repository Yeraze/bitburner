/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL')
    var iterations = 1
    if(ns.args.length > 0) 
        iterations = ns.args[0]

    for(var n = 0; n < iterations; n++) {
        ns.printf("Game %i of %i", n, iterations)
        await playAGame(ns)
    }
}


async function playAGame(ns) {
    ns.tail()
    ns.go.resetBoardState("Daedalus", 7)
    let result;
    var move = 0
    do {
        var gameState = ns.go.getBoardState()
        var moves = ns.go.analysis.getValidMoves()
        var [x,y] = getRandomMove(gameState, moves, move)

        if (x === undefined) {
            // Pass turn if no moves are found
            result = await ns.go.passTurn();
        } else {
            // Play the selected move
            result = await ns.go.makeMove(x, y);
        }
    
        // Log opponent's next move, once it happens
        await ns.go.opponentNextTurn();   
        await ns.sleep(10)
        move++
    } while (result?.type !== "gameOver");

    var stats = ns.go.analysis.getStats()
    ns.printf("Game over: Result of %s %s", stats.Daedalus.bonusPercent, stats.Daedalus.bonusDescription)

}


const getRandomMove = (board, validMoves, move) => {
    const moveOptions = [];
    const size = board[0].length;
    var score = [];

    // Look through all the points on the board
    // and build out a Score for each cell
    for (let x = 0; x < (move < 2 ? 2 : size); x++) {
      score.push( [] )
      for (let y = 0; y < size; y++) {
        // Make sure the point is a valid move
        const isValidMove = validMoves[x][y] === true;
        score[x][y] = 0

        // Leave some spaces to make it harder to capture our pieces.
        // We don't want to run out of empty node connections!
        const isNotReservedSpace = x % 2 === 1 || y % 2 === 1;

        if (isValidMove && isNotReservedSpace) {
            score[x][y] = 1

            var nbr = [validMoves[x+1]?.[y  ],
            validMoves[x-1]?.[y  ],
            validMoves[x  ]?.[y+1],
            validMoves[x  ]?.[y-1]]
            if(nbr.includes(true))
                score[x][y] = 2
         }
      }
    }

    var maxScore = 0
    var movex = 0
    var movey = 0
    for (let x = 0; x < (move < 2 ? 2 : size); x++) {
        for (let y = 0; y < size; y++) { 
            if(score[x][y] > 0)
                moveOptions.push([x, y]);
        }
    } 

    moveOptions.sort( (B, A) => (score[A[0]][A[1]] - score[B[0]][B[1]]) )
    var goodOptions = moveOptions.slice(0, 5)

    // Choose one of the found moves at random
    const randomIndex = Math.floor(Math.random() * goodOptions.length);
    return goodOptions[randomIndex] ?? [];
  };