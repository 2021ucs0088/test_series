// ...existing code...
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
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
  ListItemText,
  Radio,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export default function Page() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([""]);
  const [correctOption, setCorrectOption] = useState(null); // index of correct option
  const [loading, setLoading] = useState(false);
  const [examType, setExamType] = useState("SEBI");

  // savedQuestions = already persisted in DB
  const [savedQuestions, setSavedQuestions] = useState([]);
  // stagedQuestions = locally "saved" by the user, not yet persisted
  const [stagedQuestions, setStagedQuestions] = useState([]);

  // Fetch all questions from DB
  const fetchQuestions = async () => {
    try {
      const { data } = await axios.get("/api/questions");
      if (data?.success) {
        setSavedQuestions(data.questions || []);
      }
    } catch (err) {
      console.error("Failed to fetch questions", err);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Add new empty option
  const addMoreOption = () => {
    setOptions((prev) => [...prev, ""]);
  };

  // Handle option text change
  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // Save question locally (stage), do NOT call API here
  const handleSave = () => {
    const trimmedOptions = options.map((o) =>
      typeof o === "string" ? o.trim() : "",
    );
    const nonEmptyCount = trimmedOptions.filter(Boolean).length;

    if (!question.trim()) {
      alert("Question is required.");
      return;
    }

    if (nonEmptyCount < 2) {
      alert("Please provide at least 2 options.");
      return;
    }

    if (
      correctOption === null ||
      correctOption < 0 ||
      correctOption >= options.length ||
      !trimmedOptions[correctOption]
    ) {
      alert("Please select the correct option.");
      return;
    }

    // Build option objects and filter empties
    const payloadOptions = trimmedOptions
      .map((text, i) => ({ text, isCorrect: i === correctOption }))
      .filter((o) => o.text);

    const stagedItem = {
      examType,
      question: question.trim(),
      options: payloadOptions,
    };

    // Add to staged list (display only)
    setStagedQuestions((prev) => [...prev, stagedItem]);

    // Reset form (keep examType)
    setQuestion("");
    setOptions([""]);
    setCorrectOption(null);
  };

  // Persist all staged questions to DB when user clicks "create Test"
  // Creates a new testName (test1, test2, ...) on server and assigns that testName to all staged questions
  const handleCreateTest = async () => {
    if (stagedQuestions.length === 0) {
      alert("No staged questions to save.");
      return;
    }

    setLoading(true);
    try {
      // 1) Create a new test on server (atomic counter) -> returns testName (test1, test2, ...)
      const createRes = await axios.post("/api/tests", {
        examType: stagedQuestions[0]?.examType || examType,
        count: stagedQuestions.length,
      });

      if (!createRes?.data?.success || !createRes.data.testName) {
        throw new Error("Failed to create test on server");
      }

      const testName = createRes.data.testName;

      // 2) Send all staged questions to server with the same testName
      const requests = stagedQuestions.map((q) =>
        axios.post("/api/questions", {
          testName,
          examType: q.examType,
          question: q.question,
          options: q.options,
        }),
      );

      const results = await Promise.allSettled(requests);

      const failed = results.filter(
        (r) =>
          r.status === "rejected" ||
          (r.status === "fulfilled" && r.value?.data?.success === false),
      );

      if (failed.length > 0) {
        console.error("Some saves failed:", failed);
        alert("Some questions failed to save. Check console for details.");
      } else {
        // Clear staged list and refresh saved questions from DB
        setStagedQuestions([]);
        await fetchQuestions();
        alert(`All staged questions saved as ${testName}.`);
      }
    } catch (err) {
      console.error(err);
      alert(
        "Error saving questions: " + (err.response?.data || err.message || err),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" gap={4} mt={8} px={2} flexWrap="wrap">
      {/* LEFT: FORM */}
      <Box flex={1} maxWidth={500}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="exam-type-label">Exam</InputLabel>
            <Select
              labelId="exam-type-label"
              id="exam-type"
              value={examType}
              label="Exam"
              onChange={(e) => setExamType(e.target.value)}
            >
              <MenuItem value="SEBI">SEBI</MenuItem>
              <MenuItem value="GATE">GATE</MenuItem>
              <MenuItem value="RBI GRADE B">RBI GRADE B</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="h5" mb={3}>
            Create Test / Exam Question
          </Typography>

          <Stack spacing={3}>
            {/* Question Input */}
            <TextField
              label="Question"
              multiline
              rows={4}
              fullWidth
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />

            {/* Options */}
            <Box>
              <Typography variant="subtitle1" mb={1}>
                Options
              </Typography>

              <Stack spacing={2}>
                {options.map((option, idx) => (
                  <Stack
                    key={idx}
                    direction="row"
                    alignItems="center"
                    spacing={1}
                  >
                    {/* Radio for correct answer */}
                    <Radio
                      checked={correctOption === idx}
                      onChange={() => setCorrectOption(idx)}
                      value={idx}
                      color="primary"
                    />

                    {/* Option text input */}
                    <TextField
                      label={`Option ${idx + 1}`}
                      fullWidth
                      value={option}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                    />
                  </Stack>
                ))}

                {/* Add more option button */}
                <IconButton
                  color="primary"
                  onClick={addMoreOption}
                  sx={{ alignSelf: "flex-start" }}
                >
                  <AddIcon />
                </IconButton>
              </Stack>
            </Box>

            {/* Save button (stages locally) */}
            <Button variant="contained" onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Question"}
            </Button>
          </Stack>
        </Paper>
      </Box>

      {/* RIGHT: STAGED + SAVED QUESTIONS */}
      <Box flex={1} minWidth={350}>
        <Paper elevation={3} sx={{ p: 4, height: "100%" }}>
          <Typography variant="h6" mb={2}>
            Staged Questions
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <List>
            {stagedQuestions.length === 0 && (
              <Typography color="text.secondary">
                No staged questions yet.
              </Typography>
            )}

            {stagedQuestions.map((q, idx) => (
              <ListItem
                key={`staged-${idx}`}
                alignItems="flex-start"
                sx={{ flexDirection: "column", alignItems: "flex-start" }}
              >
                <ListItemText
                  primary={
                    <Typography fontWeight="bold" component="div">
                      {`[${q.examType}] Q${idx + 1}: ${q.question}`}
                    </Typography>
                  }
                  secondary={
                    <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                      {q.options.map((opt, i) => (
                        <li key={i}>
                          <Typography
                            variant="body2"
                            component="span"
                            sx={{
                              fontWeight: opt.isCorrect ? "bold" : "normal",
                            }}
                          >
                            {opt.text}
                            {opt.isCorrect ? " ✅" : ""}
                          </Typography>
                        </li>
                      ))}
                    </Box>
                  }
                  secondaryTypographyProps={{ component: "div" }}
                />

                <Divider sx={{ width: "100%", mt: 2 }} />
              </ListItem>
            ))}
          </List>
        </Paper>

        <Button
          variant="contained"
          color="secondary"
          sx={{ mt: 2 }}
          onClick={handleCreateTest}
          disabled={loading || stagedQuestions.length === 0}
        >
          {loading ? "Creating..." : "create Test"}
        </Button>
      </Box>
    </Box>
  );
}
// ...existing code...
