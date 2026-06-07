const $ = (query) => document.body.querySelector(query);
const shuffle = (array) =>
    ((array) =>
        array.reduceRight(
            (acc, _, i) =>
                ((j) => (([acc[i], acc[j]] = [acc[j], acc[i]]), acc))(
                    Math.floor(Math.random() * (i + 1)),
                ),
            array,
        ))([...array]);

const loadData = async () =>
    (await fetch("./quiz/country_by_flag.json")).json();

const showModal = (title, message) => {
    $("#modal-title").innerText = title;
    $("#modal-message").innerText = message;
    $("#modal").showModal();
};

const hideModal = () => $("#modal").close();

const reveal = (optionContainer, correct, answer) => {
    optionContainer.classList.add("revealed");

    setTimeout(() => {
        const title = correct ? "Congrates" : "Oops";
        const message = `The country is ${answer}`;
        showModal(title, message);
    }, 100);
};

const useStorage = (key, defaultValue) => [
    (value) => localStorage.setItem(key, JSON.stringify(value)),
    () => JSON.parse(localStorage.getItem(key)) || defaultValue,
];

const [setQuestions, getQuestions] = useStorage("questions");
const [setLevel, getLevel] = useStorage("level", 0);

const nextQuestion = () => {
    const nextLevel = Math.min(getLevel() + 1, getQuestions().length - 1);
    console.log(nextLevel);
    setLevel(nextLevel);
    loadQuestion();
};

const loadQuestion = () => {
    const optionContainer = $("#option-container");
    optionContainer.classList.remove("revealed");

    const level = getLevel();
    const questions = getQuestions();
    const question = questions[level];

    const answer = question.options.find((option) => option.correct)?.text;
    const options = shuffle(question.options);
    options.forEach((option, i) => {
        const button = $(`#option-${i + 1}`);
        const className = option.correct ? "correct" : "incorrect";

        button.className = "";
        button.innerText = option.text;
        button.classList.add(className);
        button.onclick = () => reveal(optionContainer, option.correct, answer);
    });

    const flag = $("#flag");
    flag.onload = () => {
        $("#start-container").style.display = "none";
        $("#game").style.display = "block";

        const countdownBar = $("#countdown-bar");
        const timerCount = $("#timer-count");

        const duration = 5_000;
        const startTime = performance.now();
        const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Progress bar
            countdownBar.style.transform = `scaleX(${1 - progress})`;

            // Countdown text
            const remaining = Math.max(
                0,
                Math.ceil((duration - elapsed) / 1000),
            );
            timerCount.innerText !== String(remaining) &&
                (timerCount.innerText = remaining);

            const expired = progress >= 1;
            const revealed = optionContainer.classList.contains("revealed");
            !expired && !revealed && requestAnimationFrame(tick);
            expired && reveal(optionContainer, false, answer);
        };

        requestAnimationFrame(tick);
        hideModal();
    };
    flag.src = question.flag;
};

const start = async (caller) => {
    caller && (caller.disabled = true);

    const data = await loadData();
    const questions = data.questions;

    $("#title").innerText = data.title;
    setQuestions(questions);
    getLevel() < questions.length && loadQuestion();
};
