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

const load_data = async () =>
    (await fetch("./quiz/country_by_flag.json")).json();

const reveal = (optionContainer) => {
    optionContainer.classList.add("revealed");
};

const start = async (caller) => {
    caller && (caller.disabled = true);

    const data = await load_data();
    const questions = data.questions.slice(0, 10);

    $("#title").innerText = data.title;
    const optionContainer = $("#option-container");
    const options = shuffle(questions[0].options);
    options.forEach((option, i) => {
        const button = $(`#option-${i + 1}`);
        const className = option.correct ? "correct" : "incorrect";

        button.className = "";
        button.innerText = option.text;
        button.classList.add(className);
        button.onclick = () => reveal(optionContainer);
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
            expired && reveal(optionContainer);
        };

        requestAnimationFrame(tick);
    };
    flag.src = questions[0].flag;
};
