'use client'
import React, { useEffect, useState } from 'react'
import {
  Box, Button, Typography, Paper, Stack, Radio, RadioGroup, FormControlLabel, Divider
} from '@mui/material'

export default function TestPage() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      const res = await fetch('/api/questions');
      const data = await res.json();
      if (data.success) setQuestions(data.questions);
    };
    fetchQuestions();
  }, []);

  const handleChange = (qIdx, optIdx) => {
    setAnswers({ ...answers, [qIdx]: optIdx });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let correct = 0;
    questions.forEach((q, qIdx) => {
      const selected = answers[qIdx];
      if (selected !== undefined && q.options[selected]?.isCorrect) {
        correct += 1;
      }
    });
    setScore(correct);
    setSubmitted(true);
  };

  return (
    <Box maxWidth={700} mx="auto" mt={8} p={2}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" mb={3}>Test</Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            {questions.map((q, qIdx) => (
              <Box key={q._id || qIdx}>
                <Typography fontWeight="bold" mb={1}>{`Q${qIdx + 1}: ${q.question}`}</Typography>
                <RadioGroup
                  value={answers[qIdx] ?? ''}
                  onChange={e => handleChange(qIdx, Number(e.target.value))}
                >
                  {q.options.map((opt, optIdx) => (
                    <FormControlLabel
                      key={optIdx}
                      value={optIdx}
                      control={<Radio />}
                      label={
                        submitted
                          ? (
                            <Typography color={
                              opt.isCorrect
                                ? 'success.main'
                                : (answers[qIdx] == optIdx ? 'error.main' : 'text.primary')
                            }>
                              {opt.text}
                              {opt.isCorrect ? ' (Correct)' : ''}
                              {answers[qIdx] == optIdx && !opt.isCorrect ? ' (Your Answer)' : ''}
                            </Typography>
                          )
                          : opt.text
                      }
                      disabled={submitted}
                    />
                  ))}
                </RadioGroup>
                <Divider sx={{ my: 2 }} />
              </Box>
            ))}
          </Stack>
          {!submitted && (
            <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
              Submit Test
            </Button>
          )}
          {submitted && (
            <Typography variant="h6" color="primary" mt={3}>
              Your Score: {score} / {questions.length}
            </Typography>
          )}
        </form>
      </Paper>
    </Box>
  )
}