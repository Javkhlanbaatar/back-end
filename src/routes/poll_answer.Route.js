const { getPollAnswers, getAnswernames} = require("../controllers/poll_answer.Contoller");
const {createPollAnswer} = require("../controllers/poll_answer.Contoller");
 
const { protect } = require("../middleware/protect");
const router = require("express").Router();
router.route("/createAnswer/opinion/:id").post(protect,createPollAnswer);
router.route("/:id").get(getPollAnswers);
router.route("/:id/ans").get(getAnswernames);
// router.route("/:id/createPollAnswers").post(createPollAnswers);
module.exports = router;
