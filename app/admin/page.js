'use client'
import React, { useState } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Stack,
  Paper
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

export default function Page() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['']);

  const addMoreOption = () => {
    setOptions([...options, '']);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <Box maxWidth={500} mx="auto" mt={8}>
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
          <Button variant="contained" color="primary">
            Save Question
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}