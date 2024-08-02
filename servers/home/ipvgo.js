import * as db from 'database.js'
/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL')
    var iterations = 1
    if(ns.args.length > 0) 
        iterations = ns.args[0]

    var durations = []
    for(var n = 0; n < iterations; n++) {
        ns.printf("Game %i of %i", n, iterations)
        var tStart = ns.getTimeSinceLastAug()
        var [percent, description] = await playAGame(ns)
        var tEnd = ns.getTimeSinceLastAug()
        durations.push(tEnd - tStart)
        var average = durations.reduce( (A, B) => (A + B), 0) / durations.length

        var record = {
            iteration: n,
            avgTime: average,
            percent: percent,
            description: description
        }
        db.dbWrite(ns, "ipvgo", record)
    }
}


async function playAGame(ns) {
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
    return [stats.Daedalus.bonusPercent, stats.Daedalus.bonusDescription]
}


const getRandomMove = (board, validMoves, move) => {
    const moveOptions = [];
    const size = board[0].length;
    var score = [];

    // Look through all the points on the board
    // and build out a Score for each cell

    // The funny looking X loop is to restrict the first few moves to 
    // one side of the board
    for (let x = 0; x < (move < 5 ? 2 : size); x++) {
      score.push( [] )
      for (let y = 0; y < size; y++) {
        // Make sure the point is a valid move
        const isValidMove = validMoves[x][y] === true;
        score[x][y] = 0

        // Leave some spaces to make it harder to capture our pieces.
        // We don't want to run out of empty node connections!
        const isNotReservedSpace = x % 2 === 1 || y % 2 === 1;

        if (isValidMove && isNotReservedSpace) 
            score[x][y] = 1

        // If this move is valid, is it connecting to an existing node
        if (score[x][y] > 0) {
            var nbr = [board[x+1]?.[y  ] == 'X',
                       board[x-1]?.[y  ] == 'X',
                       board[x  ][y+1] == 'X',
                       board[x  ][y-1] == 'X']
            if(nbr.includes(true))
                score[x][y] = 2
         }
      }
    }

    var maxScore = 0
    var movex = 0
    var movey = 0
    for (let x = 0; x < (move < 5 ? 2 : size); x++) {
        for (let y = 0; y < size; y++) { 
            if(score[x][y] > 0)
                moveOptions.push([x, y]);
        }
    } 

    // Sort the move options from Highest to Lowest
    moveOptions.sort( (B, A) => (score[A[0]][A[1]] - score[B[0]][B[1]]) )
    // Trim to the top 5
    var goodOptions = moveOptions.slice(0, 5)

    // Choose one of the found moves at random
    const randomIndex = Math.floor(Math.random() * goodOptions.length);
    return goodOptions[randomIndex] ?? [];
  };