const Question = require("../models/Question");
const stringComparison = require("string-comparison");
const { twoStrings: diceSimilarity } = require("dice-similarity-coeff");

// similiarity
const evaluateWithCosine = async (participant, answerKey, exam) => {
  const cosine = stringComparison.cosine;

  return await Promise.all(
    participant.answers.map(async (answer, index) => {
      const score = cosine.similarity(answerKey[index], answer.answer); // Access the answer using answer.answer

      const question = await Question.findById(exam.questions[index]);
      const questionWeight = question.score;

      return score * questionWeight;
    })
  );
};

const evaluateWithDice = async (participant, answerKey, exam) => {
  return participant.answers.map(async (answer, index) => {
    const similarityScore = diceSimilarity(
      answerKey[index].toLowerCase(),
      answer.answer.toLowerCase()
    );
    const question = await Question.findById(exam.questions[index]);
    const questionWeight = question.score;
    return similarityScore * questionWeight;
  });
};

// promises
const getAnswersDetail = async (answers) => {
  return answers.map(async (answerObj) => {
    const question = await Question.findOne({
      _id: answerObj.questionId,
    });

    const answer = answerObj.answer.trim();

    return {
      question: question?.question,
      answer,
    };
  });
};

const getSubmittedExamsPromise = async (exams, submittedExams) => {
  return submittedExams.map(async (test) => {
    if (test) {
      const exam = exams.find((exam) => exam.examToken === test.examToken);

      if (exam) {
        const { score, answers } = test;
        const answersPromises = await getAnswersDetail(answers);

        return {
          subject: exam.subject,
          score: score ?? null,
          detail: await Promise.all(answersPromises),
        };
      }
    }
  });
};

module.exports = {
  evaluateWithCosine,
  evaluateWithDice,
  getSubmittedExamsPromise,
};
