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
