import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";

interface CharacterData {
  char: string;
  ucn: string;
  kCantonese: string[];
  big5: string;
}

interface IncorrectAnswer {
  char: string;
  correctJyutping: string[];
  userAnswer: string;
  timestamp: number;
}

interface GameState {
  currentChar: string;
  correctJyutping: string[];
  userAnswer: string;
  showResult: boolean;
  isCorrect: boolean;
  score: number;
  totalQuestions: number;
  isTypingCorrect: boolean | null; // null = no input, true = correct so far, false = incorrect
  questionsPerSession: number;
  currentSession: number;
  isSessionComplete: boolean;
  incorrectAnswers: IncorrectAnswer[];
  currentSessionIncorrectAnswers: IncorrectAnswer[];
  showResultsDialog: boolean;
  realtimeFeedbackEnabled: boolean;
}

interface RangeState {
  startIndex: number;
  endIndex: number;
  isCustomRange: boolean;
  commonWordsCount: number;
}

const STORAGE_KEY = 'jyutping_practice_incorrect_answers';
const CURRENT_SESSION_STORAGE_KEY = 'jyutping_practice_current_session_incorrect_answers';
const SETTINGS_STORAGE_KEY = 'jyutping_practice_settings';

// Load incorrect answers from localStorage
const loadIncorrectAnswersFromStorage = (): IncorrectAnswer[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load incorrect answers from localStorage:', error);
    return [];
  }
};

// Save incorrect answers to localStorage
const saveIncorrectAnswersToStorage = (incorrectAnswers: IncorrectAnswer[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(incorrectAnswers));
  } catch (error) {
    console.error('Failed to save incorrect answers to localStorage:', error);
  }
};

// Clear incorrect answers from localStorage
const clearIncorrectAnswersFromStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear incorrect answers from localStorage:', error);
  }
};

// Load current session incorrect answers from localStorage
const loadCurrentSessionIncorrectAnswersFromStorage = (): IncorrectAnswer[] => {
  try {
    const stored = localStorage.getItem(CURRENT_SESSION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load current session incorrect answers from localStorage:', error);
    return [];
  }
};

// Save current session incorrect answers to localStorage
const saveCurrentSessionIncorrectAnswersToStorage = (incorrectAnswers: IncorrectAnswer[]) => {
  try {
    localStorage.setItem(CURRENT_SESSION_STORAGE_KEY, JSON.stringify(incorrectAnswers));
  } catch (error) {
    console.error('Failed to save current session incorrect answers to localStorage:', error);
  }
};

// Clear current session incorrect answers from localStorage
const clearCurrentSessionIncorrectAnswersFromStorage = () => {
  try {
    localStorage.removeItem(CURRENT_SESSION_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear current session incorrect answers from localStorage:', error);
  }
};

// Load settings from localStorage
const loadSettingsFromStorage = () => {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Failed to load settings from localStorage:', error);
    return {};
  }
};

// Save settings to localStorage
const saveSettingsToStorage = (settings: any) => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error);
  }
};

export default function Home() {
  const [data, setData] = useState<CharacterData[]>([]);
  const [commonWords, setCommonWords] = useState<string[]>([]);
  const [big5Map, setBig5Map] = useState<string[]>([]);
  
  // Load settings from localStorage
  const storedSettings = loadSettingsFromStorage();
  
  const [gameState, setGameState] = useState<GameState>({
    currentChar: "",
    correctJyutping: [],
    userAnswer: "",
    showResult: false,
    isCorrect: false,
    score: 0,
    totalQuestions: 0,
    isTypingCorrect: null,
    questionsPerSession: storedSettings.questionsPerSession || 10,
    currentSession: 0,
    isSessionComplete: false,
    incorrectAnswers: [],
    currentSessionIncorrectAnswers: [],
    showResultsDialog: false,
    realtimeFeedbackEnabled: storedSettings.realtimeFeedbackEnabled !== undefined ? storedSettings.realtimeFeedbackEnabled : true,
  });
  const [rangeState, setRangeState] = useState<RangeState>({
    startIndex: storedSettings.startIndex || 0,
    endIndex: storedSettings.endIndex || 100,
    isCustomRange: storedSettings.isCustomRange || false,
    commonWordsCount: storedSettings.commonWordsCount || 1000,
  });
  const [loading, setLoading] = useState(true);
  const textFieldRef = useRef<HTMLInputElement>(null);

  // Function to save current settings to localStorage
  const saveCurrentSettings = () => {
    const settings = {
      questionsPerSession: gameState.questionsPerSession,
      realtimeFeedbackEnabled: gameState.realtimeFeedbackEnabled,
      startIndex: rangeState.startIndex,
      endIndex: rangeState.endIndex,
      isCustomRange: rangeState.isCustomRange,
      commonWordsCount: rangeState.commonWordsCount,
    };
    saveSettingsToStorage(settings);
  };

  // Function to play success sound
  const playSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Create a pleasant success sound (ascending notes)
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5

      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (error) {
      console.log('Audio not supported or blocked');
    }
  };

  useEffect(() => {
    Promise.all([
      fetch("/jyutping_practice/data.json").then((res) => res.json()),
      fetch("/jyutping_practice/common_words.txt").then((res) => res.text()),
      fetch("/jyutping_practice/big5_map.txt").then((res) => res.text()),
    ]).then(([jsonData, textData, big5MapData]) => {
      setData(jsonData);

      // Parse common words text into array of characters
      const commonWordsArray = textData.split('');
      setCommonWords(commonWordsArray);

      // Parse big5_map data into array (split by newlines)
      const big5MapArray = big5MapData.split('\n').filter(line => line.trim() !== '');
      setBig5Map(big5MapArray);

      // Initialize range state with proper bounds
      setRangeState((prev) => ({
        ...prev,
        endIndex: storedSettings.endIndex || Math.min(storedSettings.commonWordsCount || prev.commonWordsCount, commonWordsArray.length) - 1,
      }));
      // Load incorrect answers from localStorage
      const storedIncorrectAnswers = loadIncorrectAnswersFromStorage();
      const storedCurrentSessionIncorrectAnswers = loadCurrentSessionIncorrectAnswersFromStorage();
      setGameState(prev => ({
        ...prev,
        incorrectAnswers: storedIncorrectAnswers,
        currentSessionIncorrectAnswers: storedCurrentSessionIncorrectAnswers,
      }));
      setLoading(false);
    });
  }, []);

  // Add global keydown event listener for Enter key and Space key
  useEffect(() => {
    const handleGlobalKeyPress = (event: KeyboardEvent) => {
      if ((event.key === "Enter" || event.key === " ") && gameState.showResult && gameState.currentChar) {
        event.preventDefault();
        nextQuestion();
      }
    };

    document.addEventListener("keydown", handleGlobalKeyPress);
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyPress);
    };
  }, [gameState.showResult, gameState.currentChar]);

  // Focus the text field when currentChar changes
  useEffect(() => {
    if (gameState.currentChar && textFieldRef.current) {
      textFieldRef.current.focus();
    }
  }, [gameState.currentChar]);

  // Save settings when they change
  useEffect(() => {
    if (!loading) {
      saveCurrentSettings();
    }
  }, [gameState.questionsPerSession, gameState.realtimeFeedbackEnabled, rangeState.startIndex, rangeState.endIndex, rangeState.isCustomRange, rangeState.commonWordsCount, loading]);

  const getRandomCharacter = () => {
    if (!commonWords.length || !data.length) return;

    // Get the current range of characters to practice
    let practiceRange: string[];

    if (rangeState.isCustomRange) {
      const { startIndex, endIndex } = rangeState;
      practiceRange = commonWords.slice(startIndex, endIndex + 1);
    } else {
      // Use commonWordsCount for non-custom range
      const end = Math.min(rangeState.commonWordsCount, commonWords.length);
      practiceRange = commonWords.slice(0, end);
    }

    if (practiceRange.length === 0) return;

    // Get a random character from the practice range
    const randomIndex = Math.floor(Math.random() * practiceRange.length);
    const selectedChar = practiceRange[randomIndex];

    // Find the character in the data
    const charData = data.find((item) => item.char === selectedChar);

    if (charData && charData.kCantonese) {
      setGameState((prev) => ({
        ...prev,
        currentChar: selectedChar,
        correctJyutping: charData.kCantonese,
        userAnswer: "",
        showResult: false,
        isCorrect: false,
        isTypingCorrect: null,
      }));
    } else {
      // If character not found, try again
      getRandomCharacter();
    }
  };

  const checkAnswer = () => {
    const userAnswerLower = gameState.userAnswer.toLowerCase().trim();
    const isCorrect = gameState.correctJyutping.some((jyutping) =>
      jyutping.toLowerCase() === userAnswerLower
    );

    // Play success sound if correct
    if (isCorrect) {
      playSuccessSound();
    }

    const newTotalQuestions = gameState.totalQuestions + 1;
    const newScore = isCorrect ? gameState.score + 1 : gameState.score;

    let newIncorrectAnswers = gameState.incorrectAnswers;
    let newCurrentSessionIncorrectAnswers = gameState.currentSessionIncorrectAnswers;

    if (!isCorrect) {
      const newIncorrectAnswer = {
        char: gameState.currentChar,
        correctJyutping: gameState.correctJyutping,
        userAnswer: gameState.userAnswer,
        timestamp: Date.now(),
      };

      // Update accumulated incorrect answers
      const existingIndex = gameState.incorrectAnswers.findIndex(
        (item) => item.char === gameState.currentChar
      );

      if (existingIndex >= 0) {
        // Update existing entry with new timestamp and user answer
        newIncorrectAnswers = [
          ...gameState.incorrectAnswers.slice(0, existingIndex),
          newIncorrectAnswer,
          ...gameState.incorrectAnswers.slice(existingIndex + 1),
        ];
      } else {
        // Add new entry
        newIncorrectAnswers = [...gameState.incorrectAnswers, newIncorrectAnswer];
      }

      // Update current session incorrect answers
      const existingSessionIndex = gameState.currentSessionIncorrectAnswers.findIndex(
        (item) => item.char === gameState.currentChar
      );

      if (existingSessionIndex >= 0) {
        // Update existing entry in current session
        newCurrentSessionIncorrectAnswers = [
          ...gameState.currentSessionIncorrectAnswers.slice(0, existingSessionIndex),
          newIncorrectAnswer,
          ...gameState.currentSessionIncorrectAnswers.slice(existingSessionIndex + 1),
        ];
      } else {
        // Add new entry to current session
        newCurrentSessionIncorrectAnswers = [...gameState.currentSessionIncorrectAnswers, newIncorrectAnswer];
      }
    }else {
      // If correct, remove from current session incorrect answers if it exists
      newCurrentSessionIncorrectAnswers = gameState.currentSessionIncorrectAnswers.filter(
        (item) => item.char !== gameState.currentChar
      );
      newIncorrectAnswers = newIncorrectAnswers.filter(
        (item) => item.char !== gameState.currentChar
      );
    }

    // Save both to localStorage
    saveIncorrectAnswersToStorage(newIncorrectAnswers);
    saveCurrentSessionIncorrectAnswersToStorage(newCurrentSessionIncorrectAnswers);

    // Check if session is complete
    const isSessionComplete = newTotalQuestions >= gameState.questionsPerSession;

    setGameState((prev) => ({
      ...prev,
      showResult: true,
      isCorrect,
      score: newScore,
      totalQuestions: newTotalQuestions,
      incorrectAnswers: newIncorrectAnswers,
      currentSessionIncorrectAnswers: newCurrentSessionIncorrectAnswers,
      isSessionComplete,
      showResultsDialog: isSessionComplete,
    }));
  };

  const nextQuestion = () => {
    if (gameState.isSessionComplete) {
      setGameState(prev => ({
        ...prev,
        showResultsDialog: true,
      }));
      return;
    }

    getRandomCharacter();
  };

  const resetGame = () => {
    setGameState({
      currentChar: "",
      correctJyutping: [],
      userAnswer: "",
      showResult: false,
      isCorrect: false,
      score: 0,
      totalQuestions: 0,
      isTypingCorrect: null,
      questionsPerSession: 10,
      currentSession: 0,
      isSessionComplete: false,
      incorrectAnswers: [],
      currentSessionIncorrectAnswers: [],
      showResultsDialog: false,
      realtimeFeedbackEnabled: true,
    });
    setRangeState({
      startIndex: 0,
      endIndex: 100,
      isCustomRange: false,
      commonWordsCount: 1000,
    });
    clearIncorrectAnswersFromStorage();
    clearCurrentSessionIncorrectAnswersFromStorage();
    // Reset settings to default and save to localStorage
    const defaultSettings = {
      questionsPerSession: 10,
      realtimeFeedbackEnabled: true,
      startIndex: 0,
      endIndex: 100,
      isCustomRange: false,
      commonWordsCount: 1000,
    };
    saveSettingsToStorage(defaultSettings);
  };

  const startNewSession = () => {
    setGameState(prev => ({
      ...prev,
      currentChar: "",
      correctJyutping: [],
      userAnswer: "",
      showResult: false,
      isCorrect: false,
      score: 0,
      totalQuestions: 0,
      isTypingCorrect: null,
      currentSession: prev.currentSession + 1,
      isSessionComplete: false,
      incorrectAnswers: prev.incorrectAnswers, // Keep previous incorrect answers
      currentSessionIncorrectAnswers: [], // Clear current session incorrect answers
      showResultsDialog: false,
    }));
    // Clear current session storage but keep accumulated incorrect answers
    clearCurrentSessionIncorrectAnswersFromStorage();
    getRandomCharacter();
  };

  const clearStoredIncorrectAnswers = () => {
    clearIncorrectAnswersFromStorage();
    clearCurrentSessionIncorrectAnswersFromStorage();
    setGameState(prev => ({
      ...prev,
      incorrectAnswers: [],
      currentSessionIncorrectAnswers: [],
    }));
  };

  const handleQuestionsPerSessionChange = (value: number) => {
    setGameState(prev => ({
      ...prev,
      questionsPerSession: value,
    }));
  };

  const closeResultsDialog = () => {
    setGameState(prev => ({
      ...prev,
      showResultsDialog: false,
    }));
  };

  const retryIncorrectAnswers = () => {
    // Start a new session with only the current session incorrect answers
    if (gameState.currentSessionIncorrectAnswers.length === 0) return;

    setGameState(prev => ({
      ...prev,
      currentChar: "",
      correctJyutping: [],
      userAnswer: "",
      showResult: false,
      isCorrect: false,
      score: 0,
      totalQuestions: 0,
      isTypingCorrect: null,
      questionsPerSession: prev.currentSessionIncorrectAnswers.length,
      currentSession: prev.currentSession + 1,
      isSessionComplete: false,
      incorrectAnswers: prev.incorrectAnswers, // Keep the stored incorrect answers
      currentSessionIncorrectAnswers: [], // Clear current session incorrect answers
      showResultsDialog: false,
    }));

    // Clear current session storage but keep accumulated incorrect answers
    clearCurrentSessionIncorrectAnswersFromStorage();
    // Get a random character from the current session incorrect answers
    getRandomCurrentSessionIncorrectCharacter();
  };

  const getRandomIncorrectCharacter = () => {
    if (gameState.incorrectAnswers.length === 0) {
      setGameState(prev => ({
        ...prev,
        showResultsDialog: true,
      }));
      return;
    }

    // Get a random character from the incorrect answers
    const randomIndex = Math.floor(Math.random() * gameState.incorrectAnswers.length);
    const selectedIncorrect = gameState.incorrectAnswers[randomIndex];

    // Find the character in the data
    const charData = data.find((item) => item.char === selectedIncorrect.char);
    if (!charData) {
      console.error("Character data not found for:", selectedIncorrect.char);
      return;
    }

    setGameState((prev) => ({
      ...prev,
      currentChar: selectedIncorrect.char,
      correctJyutping: charData.kCantonese,
      userAnswer: "",
      showResult: false,
      isCorrect: false,
      isTypingCorrect: null,
    }));

  };

  const getRandomCurrentSessionIncorrectCharacter = () => {
    if (gameState.currentSessionIncorrectAnswers.length === 0) {
      setGameState(prev => ({
        ...prev,
        showResultsDialog: true,
      }));
      return;
    }

    // Get a random character from the current session incorrect answers
    const randomIndex = Math.floor(Math.random() * gameState.currentSessionIncorrectAnswers.length);
    const selectedIncorrect = gameState.currentSessionIncorrectAnswers[randomIndex];

    // Find the character in the data
    const charData = data.find((item) => item.char === selectedIncorrect.char);
    if (!charData) {
      console.error("Character data not found for:", selectedIncorrect.char);
      return;
    }

    setGameState((prev) => ({
      ...prev,
      currentChar: selectedIncorrect.char,
      correctJyutping: charData.kCantonese,
      userAnswer: "",
      showResult: false,
      isCorrect: false,
      isTypingCorrect: null,
    }));

  };

  const retryStoredIncorrectAnswers = () => {
    // Start a practice session with all stored incorrect answers
    if (gameState.incorrectAnswers.length === 0) return;

    setGameState(prev => ({
      ...prev,
      currentChar: "",
      correctJyutping: [],
      userAnswer: "",
      showResult: false,
      isCorrect: false,
      score: 0,
      totalQuestions: 0,
      isTypingCorrect: null,
      questionsPerSession: prev.incorrectAnswers.length,
      currentSession: prev.currentSession + 1,
      isSessionComplete: false,
      currentSessionIncorrectAnswers: [], // Clear current session incorrect answers
      showResultsDialog: false,
    }));

    // Clear current session storage but keep accumulated incorrect answers
    clearCurrentSessionIncorrectAnswersFromStorage();
    // Get a random character from the incorrect answers
    getRandomIncorrectCharacter();
  };

  const handleRangeChange = (event: Event, newValue: number | number[]) => {
    const [start, end] = newValue as number[];
    setRangeState((prev) => ({
      ...prev,
      startIndex: start,
      endIndex: end,
    }));
  };

  const handleCustomRangeToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isCustom = event.target.checked;
    setRangeState((prev) => ({
      ...prev,
      isCustomRange: isCustom,
      startIndex: isCustom ? prev.startIndex : 0,
      endIndex: isCustom ? prev.endIndex : Math.min(prev.commonWordsCount, commonWords.length) - 1,
    }));
  };

  const handleCommonWordsCountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newCount = parseInt(event.target.value, 10);
    if (!isNaN(newCount) && newCount > 0) {
      setRangeState((prev) => ({
        ...prev,
        commonWordsCount: newCount,
        endIndex: prev.isCustomRange ? prev.endIndex : Math.min(newCount, commonWords.length) - 1,
      }));
    }
  };

  const getCurrentRangeText = () => {
    if (!commonWords.length) return "";

    if (rangeState.isCustomRange) {
      const { startIndex, endIndex } = rangeState;
      const start = Math.max(0, startIndex);
      const end = Math.min(endIndex, commonWords.length - 1);
      return commonWords.slice(start, end + 1).join('');
    } else {
      // Use commonWordsCount for non-custom range
      const end = Math.min(rangeState.commonWordsCount, commonWords.length);
      return commonWords.slice(0, end).join('');
    }
  };

  const checkTypingCorrectness = (userInput: string) => {
    if (!userInput.trim()) return null;

    const userInputLower = userInput.toLowerCase().trim();

    // Check if the current input matches any correct answer completely
    const isExactMatch = gameState.correctJyutping.some((jyutping) =>
      jyutping.toLowerCase() === userInputLower
    );

    if (isExactMatch) return true;

    // Check if the current input is a valid prefix of any correct answer
    const isValidPrefix = gameState.correctJyutping.some((jyutping) =>
      jyutping.toLowerCase().startsWith(userInputLower)
    );

    return isValidPrefix;
  };

  const handleAnswerChange = (value: string) => {
    const isTypingCorrect = gameState.realtimeFeedbackEnabled ? checkTypingCorrectness(value) : null;

    setGameState((prev) => ({
      ...prev,
      userAnswer: value,
      isTypingCorrect,
    }));
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (gameState.showResult) {
        nextQuestion();
      } else {
        checkAnswer();
      }
    }
  };

  const getScorePercentage = () => {
    if (gameState.totalQuestions === 0) return 0;
    return (gameState.score / gameState.totalQuestions) * 100;
  };

  const openCUHKLexisSearch = () => {
    if (gameState.currentChar && commonWords.length && big5Map.length) {
      // Find the index of the current character in commonWords
      const charIndex = commonWords.indexOf(gameState.currentChar);

      if (charIndex !== -1 && charIndex < big5Map.length) {
        // Get the corresponding Big5 encoding from the big5Map
        const big5Encoding = big5Map[charIndex];
        const searchUrl = `https://humanum.arts.cuhk.edu.hk/Lexis/lexi-can/search.php?q=${big5Encoding}`;
        window.open(searchUrl);
      } else {
        alert("找不到此字符的 Big5 編碼。");
      }
    } else {
      alert("字符資料未載入或 Big5 編碼不可用。");
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
          <Typography variant="h6" sx={{ mt: 2, textAlign: "center" }}>
            載入粵拼練習中...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h2" component="h1" gutterBottom textAlign="center">
        粵拼練習
      </Typography>

      {/* Score Card */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" flexWrap="wrap">
          <Chip
            label={`Question: ${gameState.totalQuestions}/${gameState.questionsPerSession}`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`Score: ${gameState.score}/${gameState.totalQuestions}`}
            color="primary"
            variant="outlined"
          />
          {gameState.totalQuestions > 0 && (
            <Chip
              label={`${getScorePercentage().toFixed(1)}%`}
              color={getScorePercentage() >= 70 ? "success" : "warning"}
              variant="outlined"
            />
          )}
        </Stack>

        {/* Progress Bar */}
        <Box sx={{ mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={(gameState.totalQuestions / gameState.questionsPerSession) * 100}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      </Paper>

      {/* Stored Incorrect Answers */}
      {gameState.incorrectAnswers.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            已儲存的錯誤答案
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" flexWrap="wrap">
            <Typography variant="body2" color="text.secondary">
              已儲存錯誤答案總數: {gameState.incorrectAnswers.length}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={retryStoredIncorrectAnswers}
                sx={{ minWidth: 'auto' }}
              >
                練習這些
              </Button>
              <Button
                variant="outlined"
                color="warning"
                size="small"
                onClick={clearStoredIncorrectAnswers}
                sx={{ minWidth: 'auto' }}
              >
                清除全部
              </Button>
            </Stack>
          </Stack>

          {/* Show stored incorrect answers */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              錯誤答案詳情：
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {gameState.incorrectAnswers.map((incorrect, index) => (
                <Chip
                  key={index}
                  label={`${incorrect.char}: ${incorrect.correctJyutping.join(', ')}`}
                  color="error"
                  variant="outlined"
                  size="small"
                />
              ))}
            </Stack>
          </Box>
        </Paper>
      )}

      {/* Current Session Incorrect Answers */}
      {gameState.currentSessionIncorrectAnswers.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            本次測驗錯誤答案
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" flexWrap="wrap">
            <Typography variant="body2" color="text.secondary">
              本次測驗錯誤答案數: {gameState.currentSessionIncorrectAnswers.length}
            </Typography>
            <Button
              variant="outlined"
              color="warning"
              size="small"
              onClick={retryIncorrectAnswers}
              sx={{ minWidth: 'auto' }}
            >
              重試本次錯誤
            </Button>
          </Stack>

          {/* Show current session incorrect answers */}
          <Box sx={{ mt: 2 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {gameState.currentSessionIncorrectAnswers.map((incorrect, index) => (
                <Chip
                  key={index}
                  label={`${incorrect.char}: ${incorrect.correctJyutping.join(', ')}`}
                  color="error"
                  variant="outlined"
                  size="small"
                />
              ))}
            </Stack>
          </Box>
        </Paper>
      )}

      {/* Quiz Settings */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          測驗設定
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>每次測驗題數</InputLabel>
          <Select
            value={gameState.questionsPerSession}
            onChange={(e) => handleQuestionsPerSessionChange(e.target.value as number)}
            label="每次測驗題數"
          >
            <MenuItem value={5}>5 題</MenuItem>
            <MenuItem value={10}>10 題</MenuItem>
            <MenuItem value={20}>20 題</MenuItem>
            <MenuItem value={30}>30 題</MenuItem>
            <MenuItem value={50}>50 題</MenuItem>
          </Select>
        </FormControl>

        <Typography variant="body2" color="text.secondary">
          每次測驗會有 {gameState.questionsPerSession} 題。
          完成每次測驗後，您會看到結果摘要。
        </Typography>

        <Divider sx={{ my: 2 }} />

        <FormControlLabel
          control={
            <Switch
              checked={gameState.realtimeFeedbackEnabled}
              onChange={(e) => setGameState(prev => ({ ...prev, realtimeFeedbackEnabled: e.target.checked }))}
              color="primary"
            />
          }
          label="即時回饋"
        />
        <Typography variant="body2" color="text.secondary">
          當開啟時，輸入框會顯示顏色提示和即時訊息來幫助您檢查拼寫。
        </Typography>
      </Paper>

      {/* Range Selector */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          字符範圍選擇
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {/* Common Words Count Setting */}
        <Box sx={{ mb: 3 }}>
          <TextField
            label="最常見字符數量"
            type="number"
            value={rangeState.commonWordsCount}
            onChange={handleCommonWordsCountChange}
            inputProps={{
              min: 1,
              max: commonWords.length,
              step: 1,
            }}
            size="small"
            sx={{ width: 200 }}
            disabled={rangeState.isCustomRange}
          />
          <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
            設定要練習的最常見字符數量 (1-{commonWords.length})
          </Typography>
        </Box>

        <FormControlLabel
          control={
            <Switch
              checked={rangeState.isCustomRange}
              onChange={handleCustomRangeToggle}
              color="primary"
            />
          }
          label="自訂範圍"
          sx={{ mb: 2 }}
        />

        {rangeState.isCustomRange && (
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <FormLabel component="legend">
                選擇字符範圍 (位置 {rangeState.startIndex + 1} 到 {rangeState.endIndex + 1})
              </FormLabel>

              {/* Text Input Fields for Direct Entry */}
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2, mb: 2 }}>
                <TextField
                  label="開始位置"
                  type="number"
                  value={rangeState.startIndex + 1}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (!isNaN(value) && value >= 1 && value <= commonWords.length) {
                      const newStart = value - 1;
                      setRangeState(prev => ({
                        ...prev,
                        startIndex: newStart,
                        endIndex: Math.max(newStart, prev.endIndex)
                      }));
                    }
                  }}
                  inputProps={{
                    min: 1,
                    max: commonWords.length,
                    step: 1,
                  }}
                  size="small"
                  sx={{ width: 120 }}
                />
                <Typography variant="body2" color="text.secondary">
                  到
                </Typography>
                <TextField
                  label="結束位置"
                  type="number"
                  value={rangeState.endIndex + 1}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (!isNaN(value) && value >= 1 && value <= commonWords.length) {
                      const newEnd = value - 1;
                      setRangeState(prev => ({
                        ...prev,
                        startIndex: Math.min(prev.startIndex, newEnd),
                        endIndex: newEnd
                      }));
                    }
                  }}
                  inputProps={{
                    min: 1,
                    max: commonWords.length,
                    step: 1,
                  }}
                  size="small"
                  sx={{ width: 120 }}
                />
                <Typography variant="caption" color="text.secondary">
                  (1-{commonWords.length})
                </Typography>
              </Stack>

              <Slider
                value={[rangeState.startIndex, rangeState.endIndex]}
                onChange={handleRangeChange}
                valueLabelDisplay="auto"
                min={0}
                max={commonWords.length - 1}
                step={1}
                marks={[
                  { value: 0, label: '1' },
                  { value: Math.floor(commonWords.length / 4), label: `${Math.floor(commonWords.length / 4) + 1}` },
                  { value: Math.floor(commonWords.length / 2), label: `${Math.floor(commonWords.length / 2) + 1}` },
                  { value: Math.floor(3 * commonWords.length / 4), label: `${Math.floor(3 * commonWords.length / 4) + 1}` },
                  { value: commonWords.length - 1, label: `${commonWords.length}` },
                ]}
                sx={{ mt: 2 }}
              />
            </FormControl>
          </Box>
        )}

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {rangeState.isCustomRange ?
            `練習字符 ${rangeState.startIndex + 1}-${rangeState.endIndex + 1} (${rangeState.endIndex - rangeState.startIndex + 1} 個字符)` :
            `練習最常見的 ${rangeState.commonWordsCount} 個字符 (位置 1-${Math.min(rangeState.commonWordsCount, commonWords.length)})`
          }
        </Typography>

        <Box sx={{
          mt: 2,
          p: 2,
          backgroundColor: 'grey.50',
          borderRadius: 1,
          maxHeight: 100,
          overflow: 'auto'
        }}>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', lineHeight: 1.8 }}>
            {getCurrentRangeText()}
          </Typography>
        </Box>
      </Paper>

      {/* Main Game Card */}
      <Card elevation={4} sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          {!gameState.currentChar ? (
            <Box textAlign="center">
              <Typography variant="h5" gutterBottom>
                準備好練習粵拼了嗎？
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                點擊「開始」開始練習粵語發音。
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={startNewSession}
                sx={{ mt: 2 }}
              >
                開始新測驗
              </Button>
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom textAlign="center">
                這個字符的粵拼是什麼？
              </Typography>

              {/* Character Display */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 120,
                  my: 3,
                }}
              >
                <Typography
                  variant="h1"
                  component="div"
                  sx={{
                    fontSize: "8rem",
                    fontWeight: "bold",
                    color: "primary.main",
                  }}
                >
                  {gameState.currentChar}
                </Typography>
              </Box>

              {/* Input Field */}
              <TextField
                fullWidth
                label="輸入粵拼"
                value={gameState.userAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={gameState.showResult}
                placeholder="例如：jau1"
                inputRef={textFieldRef}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: (!gameState.realtimeFeedbackEnabled || gameState.isTypingCorrect === null) ? 'rgba(0, 0, 0, 0.23)' :
                        gameState.isTypingCorrect ? 'green' : 'red',
                      borderWidth: (gameState.realtimeFeedbackEnabled && gameState.isTypingCorrect !== null) ? '2px' : '1px',
                    },
                  },
                }}
                autoFocus
              />

              {/* Real-time feedback */}
              {gameState.realtimeFeedbackEnabled && gameState.userAnswer && !gameState.showResult && (
                <Box sx={{ mb: 2 }}>
                  {gameState.isTypingCorrect === true ? (
                    <Alert severity="success" sx={{ mb: 1 }}>
                      {gameState.correctJyutping.some(jp => jp.toLowerCase() === gameState.userAnswer.toLowerCase().trim()) ?
                        "完美！" : "好開始！繼續輸入..."}
                    </Alert>
                  ) : gameState.isTypingCorrect === false ? (
                    <Alert severity="warning" sx={{ mb: 1 }}>
                      檢查拼寫...
                    </Alert>
                  ) : null}
                </Box>
              )}

              {/* Result Display */}
              {gameState.showResult && (
                <Box sx={{ mb: 3 }}>
                  <Alert
                    severity={gameState.isCorrect ? "success" : "error"}
                    sx={{ mb: 2 }}
                  >
                    {gameState.isCorrect ? "正確！" : "錯誤。"}
                  </Alert>

                  <Typography variant="h6" gutterBottom>
                    正確粵拼:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {gameState.correctJyutping.map((jyutping, index) => (
                      <Chip
                        key={index}
                        label={jyutping}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Action Buttons */}
              <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" sx={{ gap: 1 }}>
                {!gameState.showResult ? (
                  <Button
                    variant="contained"
                    onClick={checkAnswer}
                    size="large"
                  >
                    檢查答案
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={nextQuestion}
                    size="large"
                  >
                    下一題
                  </Button>
                )}

                <Button
                  variant="outlined"
                  onClick={resetGame}
                  size="large"
                >
                  重新開始
                </Button>

                {/* End Quiz Button - only show during active quiz */}
                {gameState.currentChar && gameState.totalQuestions > 0 && (
                  <Button
                    variant="outlined"
                    onClick={() => setGameState(prev => ({ ...prev, showResultsDialog: true }))}
                    size="large"
                    color="warning"
                  >
                    結束測驗
                  </Button>
                )}

                {/* CUHK Lexis Search Button */}
                {gameState.currentChar && (
                  <Button
                    variant="outlined"
                    onClick={openCUHKLexisSearch}
                    size="large"
                    sx={{ color: 'text.secondary' }}
                  >
                    在中大詞典查詢
                  </Button>
                )}
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Results Dialog */}
      <Dialog
        open={gameState.showResultsDialog}
        onClose={closeResultsDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" component="div" textAlign="center">
            測驗完成！
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            {/* Session Summary */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                測驗摘要
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" flexWrap="wrap">
                <Chip
                  label={`測驗 ${gameState.currentSession || 1}`}
                  color="info"
                  variant="outlined"
                />
                <Chip
                  label={`最終成績: ${gameState.score}/${gameState.totalQuestions}`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={`${getScorePercentage().toFixed(1)}%`}
                  color={getScorePercentage() >= 70 ? "success" : "warning"}
                  variant="outlined"
                />
                <Chip
                  label={`錯誤: ${gameState.currentSessionIncorrectAnswers.length}`}
                  color="error"
                  variant="outlined"
                />
              </Stack>
            </Paper>

            {/* Incorrect Answers Table */}
            {gameState.currentSessionIncorrectAnswers.length > 0 && (
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  本次測驗錯誤答案 ({gameState.currentSessionIncorrectAnswers.length})
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">字符</TableCell>
                        <TableCell align="center">你的答案</TableCell>
                        <TableCell align="center">正確答案</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {gameState.currentSessionIncorrectAnswers.map((incorrect, index) => (
                        <TableRow key={index}>
                          <TableCell align="center">
                            <Typography variant="h4" component="div">
                              {incorrect.char}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body1" color="error">
                              {incorrect.userAnswer || "(沒有答案)"}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                              {incorrect.correctJyutping.map((jyutping, jIndex) => (
                                <Chip
                                  key={jIndex}
                                  label={jyutping}
                                  color="success"
                                  variant="outlined"
                                  size="small"
                                />
                              ))}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}

            {/* Performance Message */}
            <Alert
              severity={getScorePercentage() >= 90 ? "success" : getScorePercentage() >= 70 ? "info" : "warning"}
              sx={{ textAlign: "center" }}
            >
              {getScorePercentage() >= 90 ? "出色的表現！" :
                getScorePercentage() >= 70 ? "幹得好！繼續練習！" :
                  "繼續練習以提高！"}
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", p: 3 }}>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={startNewSession}
              size="large"
            >
              開始新測驗
            </Button>
            {gameState.currentSessionIncorrectAnswers.length > 0 && (
              <Button
                variant="outlined"
                onClick={retryIncorrectAnswers}
                size="large"
                color="warning"
              >
                重試本次錯誤答案 ({gameState.currentSessionIncorrectAnswers.length})
              </Button>
            )}
            <Button
              variant="outlined"
              onClick={closeResultsDialog}
              size="large"
            >
              關閉
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

    </Container>
  );
}
