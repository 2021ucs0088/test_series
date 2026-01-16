'use client'
import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Stack,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

export default function Page() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);

  // Fetch all questions from the API
  const fetchQuestions = async () => {
    const res = await fetch('/api/questions');
    const data = await res.json();
    if (data.success) {
      setQuestions(data.questions);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const addMoreOption = () => {
    setOptions([...options, '']);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          options: options.filter(opt => opt.trim() !== '')
        })
      });
      const data = await res.json();
      if (data.success) {
        setQuestion('');
        setOptions(['']);
        fetchQuestions(); // Refresh the list
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <Box display="flex" gap={4} mt={8} px={2}>
      {/* Left: Form */}
      <Box flex={1} maxWidth={500}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" mb={3}>
            Create Test/Exam Question
          </Typography>
          <Stack spacing={3}>
            <TextField    
              label="Question"
              variant="outlined"
              fullWidth
              value={question}
              onChange={e => setQuestion(e.target.value)}
              multiline
              rows={4}
              sx={{
                '& .MuiInputBase-input': {
                  resize: 'both'
                }
              }}
            />
            <Box>
              <Typography variant="subtitle1" mb={1}>
                Options
              </Typography>
              <Stack spacing={2}>
                {options.map((option, idx) => (
                  <TextField
                    key={idx}
                    label={`Option ${idx + 1}`}
                    variant="outlined"
                    value={option}
                    onChange={e => handleOptionChange(idx, e.target.value)}
                    fullWidth
                  />
                ))}
                <IconButton
                  color="primary"
                  onClick={addMoreOption}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  <AddIcon />
                </IconButton>
              </Stack>
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Question"}
            </Button>
          </Stack>
        </Paper>
      </Box>
      {/* Right: List of Questions */}
      <Box flex={1} minWidth={350}>
        <Paper elevation={3} sx={{ p: 4, height: '100%' }}>
          <Typography variant="h6" mb={2}>
            Saved Questions
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <List>
            {questions.length === 0 && (
              <Typography color="text.secondary">No questions saved yet.</Typography>
            )}
            {questions.map((q, idx) => (
              <ListItem key={q._id || idx} alignItems="flex-start" sx={{ mb: 2, flexDirection: 'column', alignItems: 'flex-start' }}>
                <ListItemText
                  primary={
                    <Typography fontWeight="bold">{`Q${idx + 1}: ${q.question}`}</Typography>
                  }
                  secondary={
                    <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                      {q.options.map((opt, i) => (
                        <li key={i}>
                          <Typography variant="body2">{opt}</Typography>
                        </li>
                      ))}
                    </Box>
                  }
                />
                <Divider sx={{ width: '100%', mt: 2 }} />
              </ListItem>
            ))}
          </List>
        </Paper>
        <Button
  variant="contained"
  color="secondary"
  sx={{ mt: 2 }}
  onClick={() => window.location.href = '/launchtest'}
>
  Launch Test
</Button>
      </Box>
      
    </Box>
  )
}