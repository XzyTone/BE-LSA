const Question = require("../models/Question");

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
  getSubmittedExamsPromise,
};
