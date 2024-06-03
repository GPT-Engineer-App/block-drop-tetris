import React, { useState, useEffect, useCallback } from "react";
import { Box, Button, Container, Grid, GridItem, VStack, Text } from "@chakra-ui/react";
import { FaArrowLeft, FaArrowRight, FaArrowDown, FaArrowUp } from "react-icons/fa";

const ROWS = 20;
const COLS = 10;
const TETROMINOES = {
  I: [[1, 1, 1, 1]],
  J: [
    [1, 0, 0],
    [1, 1, 1],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
  ],
};

const randomTetromino = () => {
  const keys = Object.keys(TETROMINOES);
  const randKey = keys[Math.floor(Math.random() * keys.length)];
  return TETROMINOES[randKey];
};

const createBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const Index = () => {
  const [board, setBoard] = useState(createBoard());
  const [tetromino, setTetromino] = useState(randomTetromino());
  const [position, setPosition] = useState({ row: 0, col: Math.floor(COLS / 2) - 1 });
  const [gameOver, setGameOver] = useState(false);

  const mergeTetromino = useCallback((board, tetromino, position) => {
    const newBoard = board.map((row) => row.slice());
    tetromino.forEach((row, rIdx) => {
      row.forEach((cell, cIdx) => {
        if (cell) {
          newBoard[position.row + rIdx][position.col + cIdx] = cell;
        }
      });
    });
    return newBoard;
  }, []);

  const isValidMove = useCallback((board, tetromino, position) => {
    return tetromino.every((row, rIdx) => {
      return row.every((cell, cIdx) => {
        if (!cell) return true;
        const newRow = position.row + rIdx;
        const newCol = position.col + cIdx;
        return newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS && !board[newRow][newCol];
      });
    });
  }, []);

  const rotateTetromino = useCallback((tetromino) => {
    return tetromino[0].map((_, idx) => tetromino.map((row) => row[idx]).reverse());
  }, []);

  const moveTetromino = useCallback(
    (dir) => {
      const newPosition = { ...position, col: position.col + dir };
      if (isValidMove(board, tetromino, newPosition)) {
        setPosition(newPosition);
      }
    },
    [board, tetromino, position, isValidMove],
  );

  const dropTetromino = useCallback(() => {
    const newPosition = { ...position, row: position.row + 1 };
    if (isValidMove(board, tetromino, newPosition)) {
      setPosition(newPosition);
    } else {
      const newBoard = mergeTetromino(board, tetromino, position);
      setBoard(newBoard);
      setTetromino(randomTetromino());
      setPosition({ row: 0, col: Math.floor(COLS / 2) - 1 });
      if (!isValidMove(newBoard, randomTetromino(), { row: 0, col: Math.floor(COLS / 2) - 1 })) {
        setGameOver(true);
      }
    }
  }, [board, tetromino, position, isValidMove, mergeTetromino]);

  const rotateCurrentTetromino = useCallback(() => {
    const rotatedTetromino = rotateTetromino(tetromino);
    if (isValidMove(board, rotatedTetromino, position)) {
      setTetromino(rotatedTetromino);
    }
  }, [board, tetromino, position, isValidMove, rotateTetromino]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(dropTetromino, 1000);
    return () => clearInterval(interval);
  }, [dropTetromino, gameOver]);

  const handleKeyPress = useCallback(
    (e) => {
      if (gameOver) return;
      if (e.key === "ArrowLeft") moveTetromino(-1);
      if (e.key === "ArrowRight") moveTetromino(1);
      if (e.key === "ArrowDown") dropTetromino();
      if (e.key === "ArrowUp") rotateCurrentTetromino();
    },
    [moveTetromino, dropTetromino, rotateCurrentTetromino, gameOver],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  const getDisplayBoard = useCallback(() => {
    return mergeTetromino(board, tetromino, position);
  }, [board, tetromino, position, mergeTetromino]);

  return (
    <Container centerContent maxW="container.md" height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
      <VStack spacing={4}>
        <Text fontSize="2xl">Tetris</Text>
        <Grid templateColumns={`repeat(${COLS}, 20px)`} gap={1}>
          {getDisplayBoard().map((row, rIdx) => row.map((cell, cIdx) => <GridItem key={`${rIdx}-${cIdx}`} w="20px" h="20px" bg={cell ? "blue.500" : "gray.200"} border="1px solid" />))}
        </Grid>
        {gameOver && (
          <Text fontSize="xl" color="red.500">
            Game Over
          </Text>
        )}
        <Box>
          <Button onClick={() => moveTetromino(-1)} leftIcon={<FaArrowLeft />} m={1}>
            Left
          </Button>
          <Button onClick={() => moveTetromino(1)} rightIcon={<FaArrowRight />} m={1}>
            Right
          </Button>
          <Button onClick={dropTetromino} leftIcon={<FaArrowDown />} m={1}>
            Down
          </Button>
          <Button onClick={rotateCurrentTetromino} leftIcon={<FaArrowUp />} m={1}>
            Rotate
          </Button>
        </Box>
      </VStack>
    </Container>
  );
};

export default Index;
