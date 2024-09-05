import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  Paper,
  Box,
  Alert,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Grow,
  Slide,
  LinearProgress
} from '@mui/material';
import { blue, orange, green, purple, yellow } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: blue,
    secondary: orange,
    player1: green,
    player2: purple,
    highlight: yellow,
  },
});

const ScoreBoard = ({ player1Score, player2Score, largestWord, winner }) => {
  return (
    <Grow in={true}>
      <Card sx={{ mb: 2, backgroundColor: 'primary.light' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom color="primary.contrastText">Score Board 📊</Typography>
          <Typography color="primary.contrastText">Largest Word: {largestWord}</Typography>
          <Typography color="primary.contrastText">Player 1 Score: {player1Score}</Typography>
          <Typography color="primary.contrastText">Player 2 Score: {player2Score}</Typography>
          {winner && (
            <Typography variant="h6" color="secondary.main">
              Current Leader: Player {winner} 🏆
            </Typography>
          )}
        </CardContent>
      </Card>
    </Grow>
  );
};

const ChainCard = ({ chain, player, roundNumber, isHighlighted }) => {
  return (
    <Card sx={{ 
      mb: 2, 
      backgroundColor: isHighlighted ? 'highlight.light' : `player${player}.light`,
      border: isHighlighted ? '2px solid' : 'none',
      borderColor: 'highlight.main'
    }}>
      <CardContent>
        <Typography variant="h6" color={`player${player}.contrastText`}>
          Round {roundNumber}: Player {player}'s Chain {isHighlighted && '🌟'}
        </Typography>
        <Typography color={`player${player}.contrastText`}>
          {chain.join(' → ')}
        </Typography>
        <Typography variant="body2" color={`player${player}.contrastText`}>
          Chain length: {chain.length} | Total letters: {chain.join('').length}
        </Typography>
      </CardContent>
    </Card>
  );
};

const WordChainGame = () => {
  const [rounds, setRounds] = useState([]);
  const [currentRound, setCurrentRound] = useState({ 
    player1Chain: [], 
    player2Chain: [], 
    activeChain: [], 
    usedWords: new Set(),
    winner: null 
  });
  const [currentWord, setCurrentWord] = useState('');
  const [error, setError] = useState('');
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [largestWord, setLargestWord] = useState('');
  const [timer, setTimer] = useState(10);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [winner, setWinner] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let interval;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      handleTimeUp();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  useEffect(() => {
    if (player1Score > player2Score) {
      setWinner(1);
    } else if (player2Score > player1Score) {
      setWinner(2);
    } else {
      setWinner(null);
    }
  }, [player1Score, player2Score]);

  const handleTimeUp = () => {
    setIsTimerRunning(false);
    setError(`Time's up! Player ${currentPlayer} loses this round. 😅`);
    endRound();
  };

  const isValidWord = (word) => {
    const lowerCaseWord = word.toLowerCase();
    if (currentRound.usedWords.has(lowerCaseWord)) {
      return false;
    }
    if (currentRound.activeChain.length === 0) return true;
    const lastWord = currentRound.activeChain[currentRound.activeChain.length - 1];
    return lowerCaseWord.charAt(0) === lastWord.toLowerCase().charAt(lastWord.length - 1);
  };

  const switchPlayer = () => {
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    setTimer(10);
    setIsTimerRunning(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const endRound = () => {
    const player1Letters = currentRound.player1Chain.join('').length;
    const player2Letters = currentRound.player2Chain.join('').length;
    const roundWinner = player1Letters > player2Letters ? 1 : (player2Letters > player1Letters ? 2 : null);
    
    setRounds([...rounds, {...currentRound, winner: roundWinner}]);
    setCurrentRound({ 
      player1Chain: [], 
      player2Chain: [], 
      activeChain: [], 
      usedWords: new Set(),
      winner: null 
    });
    switchPlayer();
  };

  const updateLargestWord = (word) => {
    if (word.length > largestWord.length) {
      setLargestWord(word);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedWord = currentWord.trim();
    if (trimmedWord === '') {
      setError('Please enter a word 🙏');
      return;
    }
    
    if (isValidWord(trimmedWord)) {
      const updatedRound = { ...currentRound };
      updatedRound[`player${currentPlayer}Chain`].push(trimmedWord);
      updatedRound.activeChain.push(trimmedWord);
      updatedRound.usedWords.add(trimmedWord.toLowerCase());
      setCurrentRound(updatedRound);
      updateLargestWord(trimmedWord);
      if (currentPlayer === 1) {
        setPlayer1Score(prevScore => prevScore + trimmedWord.length);
      } else {
        setPlayer2Score(prevScore => prevScore + trimmedWord.length);
      }
      setCurrentWord('');
      setError('');
      switchPlayer();
    } else {
      if (currentRound.usedWords.has(trimmedWord.toLowerCase())) {
        setError(`"${trimmedWord}" has already been used in this round. Try a different word! 🔄`);
      } else {
        setError(`Invalid word. It must start with '${getCurrentLastLetter()}'. Round ends! 🔄`);
        endRound();
      }
    }
    setIsTimerRunning(false);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const getCurrentLastLetter = () => {
    if (currentRound.activeChain.length > 0) {
      return currentRound.activeChain[currentRound.activeChain.length - 1].slice(-1);
    }
    return 'any letter';
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
            Word Chain Game 🔤
          </Typography>
          <ScoreBoard
            player1Score={player1Score}
            player2Score={player2Score}
            largestWord={largestWord}
            winner={winner}
          />
          <Box sx={{ width: '100%', mb: 2 }}>
            <LinearProgress variant="determinate" value={(timer / 10) * 100} color="secondary" />
            <Typography variant="body2" color="text.secondary" align="center">
              Time left: {timer} seconds ⏳
            </Typography>
          </Box>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={9}>
                <TextField
                  fullWidth
                  inputRef={inputRef}
                  value={currentWord}
                  onChange={(e) => setCurrentWord(e.target.value)}
                  onFocus={() => {
                    if (!isTimerRunning) {
                      setTimer(10);
                      setIsTimerRunning(true);
                    }
                  }}
                  placeholder="Enter your word"
                  variant="outlined"
                  sx={{ backgroundColor: 'background.paper' }}
                />
              </Grid>
              <Grid item xs={3}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  fullWidth
                  sx={{ height: '56px' }}
                >
                  Submit 🚀
                </Button>
              </Grid>
            </Grid>
          </form>
          {error && (
            <Grow in={true}>
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            </Grow>
          )}
          <Typography variant="h6" sx={{ mt: 2 }} color="primary">
            Current Player: Player {currentPlayer} 🎭
          </Typography>
          <Typography variant="h5" sx={{ mt: 4, mb: 2 }} color="primary">
            Current Round
          </Typography>
          <Paper sx={{ p: 2, mb: 4, backgroundColor: 'secondary.light' }}>
            <Typography color="secondary.contrastText">
              Active Chain: {currentRound.activeChain.join(' → ')}
            </Typography>
          </Paper>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <ChainCard chain={currentRound.player1Chain} player={1} roundNumber={rounds.length + 1} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ChainCard chain={currentRound.player2Chain} player={2} roundNumber={rounds.length + 1} />
            </Grid>
          </Grid>
          {rounds.length > 0 && (
            <>
              <Typography variant="h5" sx={{ mt: 4, mb: 2 }} color="primary">
                Previous Rounds
              </Typography>
              {rounds.map((round, index) => (
                <Grid container spacing={2} key={index}>
                  <Grid item xs={12} sm={6}>
                    <ChainCard 
                      chain={round.player1Chain} 
                      player={1} 
                      roundNumber={index + 1}
                      isHighlighted={round.winner === 1}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <ChainCard 
                      chain={round.player2Chain} 
                      player={2} 
                      roundNumber={index + 1}
                      isHighlighted={round.winner === 2}
                    />
                  </Grid>
                </Grid>
              ))}
            </>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default WordChainGame;