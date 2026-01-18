// ...existing code...
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  Paper,
  Stack,
  Radio,
  RadioGroup,
  FormControlLabel,
  Divider,
} from "@mui/material";

type Option = {
  text: string;
  isCorrect: boolean;
};

type Question = {
  _id?: string;
  question: string;
  options: Option[];
};

export default function TestPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data } = await axios.get("/api/questions");
        if (data?.success) {
          setQuestions(data.questions || []);
        }
      } catch (err) {
        console.error("Failed to fetch questions", err);
      }
    };

    fetchQuestions();
  }, []);

  const handleChange = (qIdx: number, optIdx: number) => {
    if (!submitted) {
      setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let correctCount = 0;
    questions.forEach((q, qIdx) => {
      const selected = answers[qIdx];
      if (selected !== undefined && q.options[selected]?.isCorrect) {
        correctCount += 1;
      }
    });

    setScore(correctCount);
    setSubmitted(true);
  };

  return (
    <Box maxWidth={700} mx="auto" mt={8} p={2}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" mb={3}>
          Test
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            {questions.map((q, qIdx) => (
              <Box key={q._id || qIdx}>
                <Typography fontWeight="bold" mb={1}>
                  {`Q${qIdx + 1}: ${q.question}`}
                </Typography>

                <RadioGroup
                  value={answers[qIdx]?.toString() ?? ""}
                  onChange={(e) => handleChange(qIdx, Number(e.target.value))}
                >
                  {q.options.map((opt, optIdx) => (
                    <FormControlLabel
                      key={optIdx}
                      value={optIdx.toString()}
                      control={<Radio />}
                      disabled={submitted}
                      label={
                        submitted ? (
                          <Typography
                            component="span"
                            color={
                              opt.isCorrect
                                ? "success.main"
                                : answers[qIdx] === optIdx
                                ? "error.main"
                                : "text.primary"
                            }
                          >
                            {opt.text}
                            {opt.isCorrect && " (Correct)"}
                            {answers[qIdx] === optIdx && !opt.isCorrect && " (Your Answer)"}
                          </Typography>
                        ) : (
                          <Typography component="span">{opt.text}</Typography>
                        )
                      }
                    />
                  ))}
                </RadioGroup>

                <Divider sx={{ my: 2 }} />
              </Box>
            ))}
          </Stack>

          {!submitted && (
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
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
  );
}
// ...existing code...