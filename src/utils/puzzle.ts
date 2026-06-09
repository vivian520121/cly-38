import type { PuzzlePiece } from '@/types'

export function createPuzzle(size: number): PuzzlePiece[] {
  const pieces: PuzzlePiece[] = []
  const totalPieces = size * size

  for (let i = 0; i < totalPieces; i++) {
    const correctIndex = i
    const x = i % size
    const y = Math.floor(i / size)
    const isEmpty = i === totalPieces - 1

    pieces.push({
      id: i,
      currentIndex: i,
      correctIndex,
      x,
      y,
      isEmpty
    })
  }

  return pieces
}

export function shufflePuzzle(pieces: PuzzlePiece[], size: number): PuzzlePiece[] {
  const shuffled = [...pieces]
  const emptyPiece = shuffled.find(p => p.isEmpty)!
  const emptyIndex = shuffled.indexOf(emptyPiece)

  let indices = shuffled.map((_, i) => i)
  indices.splice(emptyIndex, 1)

  do {
    indices = fisherYatesShuffle(indices)
  } while (!isSolvable(indices, size, emptyPiece.y))

  const fullIndices = [...indices, emptyIndex]

  return shuffled.map((piece, newIndex) => {
    const currentIndex = fullIndices.indexOf(newIndex)
    return {
      ...piece,
      currentIndex,
      x: currentIndex % size,
      y: Math.floor(currentIndex / size)
    }
  })
}

function fisherYatesShuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function countInversions(indices: number[]): number {
  let inversions = 0
  for (let i = 0; i < indices.length; i++) {
    for (let j = i + 1; j < indices.length; j++) {
      if (indices[i] > indices[j]) {
        inversions++
      }
    }
  }
  return inversions
}

function isSolvable(indices: number[], size: number, emptyRowFromTop: number): boolean {
  const inversions = countInversions(indices)

  if (size % 2 === 1) {
    return inversions % 2 === 0
  } else {
    const emptyRowFromBottom = size - emptyRowFromTop
    return (inversions + emptyRowFromBottom) % 2 === 1
  }
}

export function isAdjacent(piece1: PuzzlePiece, piece2: PuzzlePiece): boolean {
  const dx = Math.abs(piece1.x - piece2.x)
  const dy = Math.abs(piece1.y - piece2.y)
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1)
}

export function swapPieces(pieces: PuzzlePiece[], pieceId1: number, pieceId2: number, size: number): PuzzlePiece[] {
  return pieces.map(piece => {
    if (piece.id === pieceId1) {
      const otherPiece = pieces.find(p => p.id === pieceId2)!
      return {
        ...piece,
        currentIndex: otherPiece.currentIndex,
        x: otherPiece.x,
        y: otherPiece.y
      }
    }
    if (piece.id === pieceId2) {
      const otherPiece = pieces.find(p => p.id === pieceId1)!
      return {
        ...piece,
        currentIndex: otherPiece.currentIndex,
        x: otherPiece.x,
        y: otherPiece.y
      }
    }
    return piece
  })
}

export function checkCompletion(pieces: PuzzlePiece[]): boolean {
  return pieces.every(piece => piece.currentIndex === piece.correctIndex)
}

export function getMovablePieces(pieces: PuzzlePiece[]): PuzzlePiece[] {
  const emptyPiece = pieces.find(p => p.isEmpty)!
  return pieces.filter(piece => !piece.isEmpty && isAdjacent(piece, emptyPiece))
}

interface SearchState {
  pieces: PuzzlePiece[]
  emptyId: number
  moves: number
  path: number[][]
}

function manhattanDistance(pieces: PuzzlePiece[], size: number): number {
  let distance = 0
  for (const piece of pieces) {
    if (piece.isEmpty) continue
    const correctX = piece.correctIndex % size
    const correctY = Math.floor(piece.correctIndex / size)
    distance += Math.abs(piece.x - correctX) + Math.abs(piece.y - correctY)
  }
  return distance
}

function linearConflict(pieces: PuzzlePiece[], size: number): number {
  let conflict = 0

  for (let row = 0; row < size; row++) {
    const rowPieces = pieces.filter(p => !p.isEmpty && p.y === row && Math.floor(p.correctIndex / size) === row)
    for (let i = 0; i < rowPieces.length; i++) {
      for (let j = i + 1; j < rowPieces.length; j++) {
        if (rowPieces[i].correctIndex > rowPieces[j].correctIndex) {
          conflict += 2
        }
      }
    }
  }

  for (let col = 0; col < size; col++) {
    const colPieces = pieces.filter(p => !p.isEmpty && p.x === col && p.correctIndex % size === col)
    for (let i = 0; i < colPieces.length; i++) {
      for (let j = i + 1; j < colPieces.length; j++) {
        if (colPieces[i].correctIndex > colPieces[j].correctIndex) {
          conflict += 2
        }
      }
    }
  }

  return conflict
}

function heuristic(pieces: PuzzlePiece[], size: number): number {
  return manhattanDistance(pieces, size) + linearConflict(pieces, size)
}

function getStateKey(pieces: PuzzlePiece[]): string {
  return pieces.map(p => p.currentIndex).join(',')
}

function applyMove(pieces: PuzzlePiece[], pieceId: number, emptyId: number, size: number): PuzzlePiece[] {
  return swapPieces(pieces, pieceId, emptyId, size)
}

function greedySolve(initialPieces: PuzzlePiece[], size: number): number[][] {
  const path: number[][] = []
  let pieces = JSON.parse(JSON.stringify(initialPieces))
  const maxSteps = size * size * 200
  const visitedStates = new Set<string>()
  let stuckCount = 0

  for (let step = 0; step < maxSteps; step++) {
    if (checkCompletion(pieces)) break

    const stateKey = getStateKey(pieces)
    if (visitedStates.has(stateKey)) {
      stuckCount++
    } else {
      stuckCount = 0
      visitedStates.add(stateKey)
    }

    const movablePieces = getMovablePieces(pieces)
    const emptyPiece = pieces.find((p: PuzzlePiece) => p.isEmpty)!

    let bestMove: PuzzlePiece | null = null
    let bestHeuristic = Infinity

    for (const piece of movablePieces) {
      const newPieces = applyMove(pieces, piece.id, emptyPiece.id, size)
      const newStateKey = getStateKey(newPieces)

      if (stuckCount > 10 && !visitedStates.has(newStateKey)) {
        bestMove = piece
        break
      }

      const h = heuristic(newPieces, size)
      const visitedPenalty = visitedStates.has(newStateKey) ? 100 : 0

      if (h + visitedPenalty < bestHeuristic) {
        bestHeuristic = h + visitedPenalty
        bestMove = piece
      }
    }

    if (stuckCount > 20) {
      const randomIndex = Math.floor(Math.random() * movablePieces.length)
      bestMove = movablePieces[randomIndex]
      stuckCount = 0
      visitedStates.clear()
    }

    if (bestMove) {
      path.push([bestMove.id, emptyPiece.id])
      pieces = applyMove(pieces, bestMove.id, emptyPiece.id, size)
    } else {
      break
    }
  }

  return checkCompletion(pieces) ? path : []
}

export function solvePuzzle(pieces: PuzzlePiece[], size: number): number[][] {
  const piecesCopy = JSON.parse(JSON.stringify(pieces))

  if (checkCompletion(piecesCopy)) {
    return []
  }

  const startTime = Date.now()
  const timeLimit = size === 3 ? 3000 : size === 4 ? 5000 : 8000

  function idaStarSearchWithTimeout(
    initialPieces: PuzzlePiece[],
    size: number,
    timeLimit: number
  ): number[][] {
    const emptyPiece = initialPieces.find(p => p.isEmpty)!
    const emptyId = emptyPiece.id
    let threshold = heuristic(initialPieces, size)
    const visited = new Set<string>()

    function dfs(
      state: SearchState,
      g: number,
      threshold: number,
      visited: Set<string>,
      maxDepth: number
    ): { found: boolean; newThreshold: number; path: number[][] } {
      if (Date.now() - startTime > timeLimit) {
        return { found: false, newThreshold: Infinity, path: [] }
      }

      const h = heuristic(state.pieces, size)
      const f = g + h

      if (f > threshold) {
        return { found: false, newThreshold: f, path: [] }
      }

      if (h === 0) {
        return { found: true, newThreshold: threshold, path: state.path }
      }

      if (g >= maxDepth) {
        return { found: false, newThreshold: Infinity, path: [] }
      }

      const stateKey = getStateKey(state.pieces)
      if (visited.has(stateKey)) {
        return { found: false, newThreshold: Infinity, path: [] }
      }
      visited.add(stateKey)

      let minThreshold = Infinity
      const movablePieces = getMovablePieces(state.pieces)

      movablePieces.sort((a, b) => {
        const stateA = applyMove(state.pieces, a.id, state.emptyId, size)
        const stateB = applyMove(state.pieces, b.id, state.emptyId, size)
        return heuristic(stateA, size) - heuristic(stateB, size)
      })

      for (const piece of movablePieces) {
        const newPieces = applyMove(state.pieces, piece.id, state.emptyId, size)
        const newPath = [...state.path, [piece.id, state.emptyId]]
        const newState: SearchState = {
          pieces: newPieces,
          emptyId: piece.id,
          moves: state.moves + 1,
          path: newPath
        }

        const result = dfs(newState, g + 1, threshold, visited, maxDepth)

        if (result.found) {
          return result
        }

        if (result.newThreshold < minThreshold) {
          minThreshold = result.newThreshold
        }
      }

      visited.delete(stateKey)
      return { found: false, newThreshold: minThreshold, path: [] }
    }

    const maxDepth = size === 3 ? 50 : size === 4 ? 80 : 120

    while (Date.now() - startTime < timeLimit) {
      const initialState: SearchState = {
        pieces: [...initialPieces],
        emptyId,
        moves: 0,
        path: []
      }

      visited.clear()
      const result = dfs(initialState, 0, threshold, visited, maxDepth)

      if (result.found) {
        return result.path
      }

      if (result.newThreshold === Infinity) {
        break
      }

      threshold = result.newThreshold
    }

    return []
  }

  let solution = idaStarSearchWithTimeout(piecesCopy, size, timeLimit)

  if (solution.length === 0) {
    for (let attempt = 0; attempt < 3 && solution.length === 0; attempt++) {
      solution = greedySolve(piecesCopy, size)
    }
  }

  return solution
}
