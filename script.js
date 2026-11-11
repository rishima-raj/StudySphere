/* =========================================================
   STUDYSPHERE
   Main JavaScript
========================================================= */


/* ================= DATA ================= */

let subjects =
    JSON.parse(localStorage.getItem("studysphereSubjects")) || [];

let tasks =
    JSON.parse(localStorage.getItem("studysphereTasks")) || [];

let sessions =
    JSON.parse(localStorage.getItem("studysphereSessions")) || [];

let settings =
    JSON.parse(localStorage.getItem("studysphereSettings")) || {
        name: "Student",
        dailyGoal: 3,
        theme: "dark"
    };

let currentTaskFilter = "all";

let selectedSubjectIcon = "📐";

let selectedPriority = "Medium";


/* ================= HELPERS ================= */

function saveData() {

    localStorage.setItem(
        "studysphereSubjects",
        JSON.stringify(subjects)
    );

    localStorage.setItem(
        "studysphereTasks",
        JSON.stringify(tasks)
    );

    localStorage.setItem(
        "studysphereSessions",
        JSON.stringify(sessions)
    );

    localStorage.setItem(
        "studysphereSettings",
        JSON.stringify(settings)
    );

}


function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;

}


function todayString() {

    const date = new Date();

    const year = date.getFullYear();

    const month =
        String(date.getMonth() + 1).padStart(2, "0");

    const day =
        String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function formatDate(dateString) {

    if (!dateString)
        return "No deadline";

    const date =
        new Date(dateString + "T00:00:00");

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short"
        }
    );

}


function showToast(message) {

    const toast =
        document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show-toast");

    setTimeout(() => {

        toast.classList.remove("show-toast");

    }, 2200);

}


/* ================= PAGE NAVIGATION ================= */

const pages = {

    dashboard:
        document.getElementById("dashboardPage"),

    subjects:
        document.getElementById("subjectsPage"),

    tasks:
        document.getElementById("tasksPage"),

    schedule:
        document.getElementById("schedulePage"),

    progress:
        document.getElementById("progressPage"),

    settings:
        document.getElementById("settingsPage")

};


const navButtons =
    document.querySelectorAll(".nav-item");


function openPage(pageName) {

    Object.values(pages).forEach(page => {

        page.classList.remove("active-page");

    });


    pages[pageName].classList.add("active-page");


    navButtons.forEach(button => {

        button.classList.remove("active");

        if (button.dataset.page === pageName) {

            button.classList.add("active");

        }

    });


    if (pageName === "progress") {

        renderProgress();

    }


    if (pageName === "schedule") {

        renderSchedule();

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


navButtons.forEach(button => {

    button.addEventListener("click", () => {

        openPage(button.dataset.page);

    });

});


document
    .querySelectorAll("[data-go]")
    .forEach(button => {

        button.addEventListener("click", () => {

            openPage(button.dataset.go);

        });

    });


/* ================= GREETING ================= */

function updateGreeting() {

    const hour =
        new Date().getHours();

    let greeting = "Evening";

    if (hour < 12)
        greeting = "Morning";

    else if (hour < 17)
        greeting = "Afternoon";


    document.getElementById(
        "greetingTime"
    ).textContent = greeting;

}


/* ================= MODALS ================= */

function openModal(id) {

    document
        .getElementById(id)
        .classList.add("show-modal");

}


function closeModal(id) {

    document
        .getElementById(id)
        .classList.remove("show-modal");

}


document
    .querySelectorAll("[data-close]")
    .forEach(button => {

        button.addEventListener("click", () => {

            closeModal(button.dataset.close);

        });

    });


document
    .querySelectorAll(".modal-overlay")
    .forEach(modal => {

        modal.addEventListener("click", event => {

            if (event.target === modal) {

                modal.classList.remove("show-modal");

            }

        });

    });


/* ================= SUBJECT MODAL ================= */

document
    .getElementById("addSubjectButton")
    .addEventListener("click", () => {

        openModal("subjectModal");

    });


document
    .querySelectorAll(".icon-choice")
    .forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll(".icon-choice")
                .forEach(item =>
                    item.classList.remove("selected-icon")
                );


            button.classList.add("selected-icon");

            selectedSubjectIcon =
                button.textContent.trim();

        });

    });


document
    .getElementById("saveSubjectButton")
    .addEventListener("click", addSubject);


function addSubject() {

    const name =
        document
            .getElementById("subjectNameInput")
            .value
            .trim();

    const short =
        document
            .getElementById("subjectShortInput")
            .value
            .trim();


    if (!name) {

        showToast("Enter a subject name.");

        return;

    }


    const colors = [
        "#8a5cff",
        "#ef5f9a",
        "#45a6ff",
        "#f1a84b",
        "#53d69a",
        "#db6cff"
    ];


    subjects.push({

        id: Date.now(),

        name,

        short:
            short ||
            name.substring(0, 8).toUpperCase(),

        icon: selectedSubjectIcon,

        color:
            colors[
                subjects.length %
                colors.length
            ]

    });


    saveData();

    renderEverything();


    document.getElementById(
        "subjectNameInput"
    ).value = "";

    document.getElementById(
        "subjectShortInput"
    ).value = "";


    closeModal("subjectModal");

    showToast("Subject added successfully ✨");

}


/* ================= SUBJECT RENDER ================= */

function getSubjectTasks(subjectId) {

    return tasks.filter(task =>
        String(task.subjectId) ===
        String(subjectId)
    );

}


function getSubjectProgress(subjectId) {

    const subjectTasks =
        getSubjectTasks(subjectId);


    if (subjectTasks.length === 0)
        return 0;


    const completed =
        subjectTasks.filter(task =>
            task.completed
        ).length;


    return Math.round(
        completed /
        subjectTasks.length *
        100
    );

}


function renderSubjects() {

    const grid =
        document.getElementById("subjectGrid");


    if (subjects.length === 0) {

        grid.innerHTML = `

            <div class="glass-card empty-state"
                 style="grid-column:1/-1">

                <div class="empty-icon">📚</div>

                <h3>No subjects yet</h3>

                <p>
                    Add your first subject and begin building
                    your StudySphere.
                </p>

            </div>

        `;

        return;

    }


    grid.innerHTML =
        subjects.map(subject => {

            const subjectTasks =
                getSubjectTasks(subject.id);

            const completed =
                subjectTasks.filter(task =>
                    task.completed
                ).length;

            const progress =
                getSubjectProgress(subject.id);


            return `

                <article
                    class="subject-card"
                    style="--subject-color:${subject.color}"
                >

                    <div class="subject-icon">
                        ${subject.icon}
                    </div>

                    <h3>
                        ${escapeHTML(subject.name)}
                    </h3>

                    <div class="subject-short">
                        ${escapeHTML(subject.short)}
                    </div>

                    <div class="subject-task-count">

                        ${completed} /
                        ${subjectTasks.length}
                        tasks completed

                    </div>

                    <div class="subject-progress-track">

                        <div
                            class="subject-progress-fill"
                            style="width:${progress}%">
                        </div>

                    </div>

                    <div class="subject-bottom">

                        <span>
                            ${progress}% complete
                        </span>

                        <button
                            class="delete-subject"
                            onclick="deleteSubject(${subject.id})"
                            title="Delete subject">
                            ✕
                        </button>

                    </div>

                </article>

            `;

        }).join("");

}


function deleteSubject(id) {

    const hasTasks =
        tasks.some(task =>
            String(task.subjectId) ===
            String(id)
        );


    let message =
        "Delete this subject?";


    if (hasTasks) {

        message =
            "This subject has tasks. Deleting it will also delete those tasks. Continue?";

    }


    if (!confirm(message))
        return;


    subjects =
        subjects.filter(subject =>
            subject.id !== id
        );


    tasks =
        tasks.filter(task =>
            String(task.subjectId) !==
            String(id)
        );


    saveData();

    renderEverything();

    showToast("Subject deleted.");

}


/* ================= TASK MODAL ================= */

function openTaskModal() {

    if (subjects.length === 0) {

        showToast(
            "Add a subject before creating a task."
        );

        openPage("subjects");

        return;

    }


    updateSubjectOptions();


    document.getElementById(
        "taskDateInput"
    ).value = todayString();


    openModal("taskModal");

}


document
    .getElementById("heroTaskButton")
    .addEventListener(
        "click",
        openTaskModal
    );


document
    .getElementById("dashboardAddTask")
    .addEventListener(
        "click",
        openTaskModal
    );


document
    .getElementById("taskPageAddButton")
    .addEventListener(
        "click",
        openTaskModal
    );


function updateSubjectOptions() {

    const select =
        document.getElementById(
            "taskSubjectInput"
        );


    select.innerHTML =
        subjects.map(subject => `

            <option value="${subject.id}">
                ${escapeHTML(subject.name)}
            </option>

        `).join("");

}


/* PRIORITY */

document
    .querySelectorAll(".priority-choice")
    .forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll(".priority-choice")
                .forEach(item =>
                    item.classList.remove(
                        "selected-priority"
                    )
                );


            button.classList.add(
                "selected-priority"
            );


            selectedPriority =
                button.dataset.priority;

        });

    });


document
    .getElementById("saveTaskButton")
    .addEventListener("click", addTask);


function addTask() {

    const name =
        document
            .getElementById("taskNameInput")
            .value
            .trim();

    const subjectId =
        document
            .getElementById("taskSubjectInput")
            .value;

    const deadline =
        document
            .getElementById("taskDateInput")
            .value;

    const notes =
        document
            .getElementById("taskNotesInput")
            .value
            .trim();


    if (!name) {

        showToast("Enter a task name.");

        return;

    }


    tasks.push({

        id: Date.now(),

        name,

        subjectId,

        deadline,

        priority:
            selectedPriority,

        notes,

        completed: false,

        completedDate: null,

        createdDate:
            todayString()

    });


    saveData();

    renderEverything();


    document.getElementById(
        "taskNameInput"
    ).value = "";

    document.getElementById(
        "taskNotesInput"
    ).value = "";


    closeModal("taskModal");

    showToast("New task created 🚀");

}


/* ================= TASK FUNCTIONS ================= */

function getSubject(subjectId) {

    return subjects.find(subject =>
        String(subject.id) ===
        String(subjectId)
    );

}


function toggleTask(id) {

    const task =
        tasks.find(task =>
            task.id === id
        );


    if (!task)
        return;


    task.completed =
        !task.completed;


    task.completedDate =
        task.completed
            ? todayString()
            : null;


    saveData();

    renderEverything();


    if (task.completed) {

        showToast(
            "Task completed! Nice work 🔥"
        );

    }

}


function deleteTask(id) {

    if (!confirm("Delete this task?"))
        return;


    tasks =
        tasks.filter(task =>
            task.id !== id
        );


    saveData();

    renderEverything();

    showToast("Task deleted.");

}


/* ================= TASK HTML ================= */

function createTaskHTML(task) {

    const subject =
        getSubject(task.subjectId);


    const subjectName =
        subject
            ? subject.name
            : "No Subject";


    return `

        <div class="
            task-item
            ${task.completed
                ? "completed-task"
                : ""}
        ">

            <button
                class="
                    task-check
                    ${task.completed
                        ? "checked"
                        : ""}
                "
                onclick="toggleTask(${task.id})"
            >
                ${task.completed ? "✓" : ""}
            </button>


            <div class="task-info">

                <strong>
                    ${escapeHTML(task.name)}
                </strong>

                <small>

                    ${escapeHTML(subjectName)}

                    •

                    ${task.completed
                        ? "Completed"
                        : formatDate(task.deadline)}

                </small>

            </div>


            <span class="
                priority-badge
                priority-${task.priority.toLowerCase()}
            ">

                ${task.completed
                    ? "Completed"
                    : task.priority}

            </span>


            <button
                class="delete-task"
                onclick="deleteTask(${task.id})"
                title="Delete task"
            >
                ⋮
            </button>

        </div>

    `;

}


/* ================= ALL TASKS PAGE ================= */

function renderTasks() {

    let visibleTasks =
        [...tasks];


    if (currentTaskFilter === "today") {

        visibleTasks =
            visibleTasks.filter(task =>
                task.deadline === todayString()
            );

    }


    if (currentTaskFilter === "pending") {

        visibleTasks =
            visibleTasks.filter(task =>
                !task.completed
            );

    }


    if (currentTaskFilter === "completed") {

        visibleTasks =
            visibleTasks.filter(task =>
                task.completed
            );

    }


    const search =
        document
            .getElementById("taskSearch")
            .value
            .trim()
            .toLowerCase();


    if (search) {

        visibleTasks =
            visibleTasks.filter(task => {

                const subject =
                    getSubject(task.subjectId);

                return (
                    task.name
                        .toLowerCase()
                        .includes(search)

                    ||

                    (
                        subject &&
                        subject.name
                            .toLowerCase()
                            .includes(search)
                    )
                );

            });

    }


    visibleTasks.sort((a,b) => {

        if (a.completed !== b.completed)
            return a.completed ? 1 : -1;

        return (
            a.deadline || "9999"
        ).localeCompare(
            b.deadline || "9999"
        );

    });


    const list =
        document.getElementById(
            "allTasksList"
        );


    if (visibleTasks.length === 0) {

        list.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">✓</div>

                <h3>No tasks here</h3>

                <p>
                    Your study list is looking peaceful.
                </p>

            </div>

        `;

        return;

    }


    list.innerHTML =
        visibleTasks
            .map(createTaskHTML)
            .join("");

}


/* FILTERS */

document
    .querySelectorAll(".filter")
    .forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll(".filter")
                .forEach(item =>
                    item.classList.remove(
                        "active-filter"
                    )
                );


            button.classList.add(
                "active-filter"
            );


            currentTaskFilter =
                button.dataset.filter;


            renderTasks();

        });

    });


document
    .getElementById("taskSearch")
    .addEventListener(
        "input",
        renderTasks
    );


/* ================= DASHBOARD TASKS ================= */

function renderDashboardTasks() {

    const container =
        document.getElementById(
            "dashboardTasks"
        );


    const priorityOrder = {
        High: 1,
        Medium: 2,
        Low: 3
    };


    const dashboardTasks =
        [...tasks]

        .sort((a,b) => {

            if (a.completed !== b.completed)
                return a.completed ? 1 : -1;

            return (
                priorityOrder[a.priority] -
                priorityOrder[b.priority]
            );

        })

        .slice(0, 5);


    if (dashboardTasks.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">🎯</div>

                <h3>Nothing planned yet</h3>

                <p>
                    Create your first task and
                    start making progress.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        dashboardTasks
            .map(createTaskHTML)
            .join("");

}


/* ================= DASHBOARD COUNTS ================= */

function calculateOverallProgress() {

    if (tasks.length === 0)
        return 0;


    const completed =
        tasks.filter(task =>
            task.completed
        ).length;


    return Math.round(
        completed /
        tasks.length *
        100
    );

}


function updateDashboardStats() {

    const completed =
        tasks.filter(task =>
            task.completed
        ).length;


    const pending =
        tasks.length -
        completed;


    const progress =
        calculateOverallProgress();


    document.getElementById(
        "subjectCount"
    ).textContent =
        subjects.length;


    document.getElementById(
        "completedCount"
    ).textContent =
        completed;


    document.getElementById(
        "pendingCount"
    ).textContent =
        pending;


    document.getElementById(
        "dashboardProgress"
    ).textContent =
        `${progress}%`;


    document.getElementById(
        "dashboardProgressRing"
    ).style.setProperty(
        "--progress",
        `${progress}%`
    );

}


/* ================= DEADLINES ================= */

function renderDeadlines() {

    const container =
        document.getElementById(
            "deadlineList"
        );


    const pendingTasks =
        tasks

        .filter(task =>
            !task.completed &&
            task.deadline
        )

        .sort((a,b) =>
            a.deadline.localeCompare(
                b.deadline
            )
        )

        .slice(0, 4);


    if (pendingTasks.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">📅</div>

                <h3>No upcoming deadlines</h3>

                <p>
                    You're all clear for now.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        pendingTasks.map(task => {

            const date =
                new Date(
                    task.deadline +
                    "T00:00:00"
                );

            const subject =
                getSubject(task.subjectId);


            return `

                <div class="deadline-item">

                    <div class="deadline-date">

                        <span>
                            ${date
                                .toLocaleDateString(
                                    "en-US",
                                    {month:"short"}
                                )
                                .toUpperCase()}
                        </span>

                        <strong>
                            ${date.getDate()}
                        </strong>

                    </div>


                    <div class="deadline-details">

                        <strong>
                            ${escapeHTML(task.name)}
                        </strong>

                        <small>
                            ${subject
                                ? escapeHTML(subject.name)
                                : "No Subject"}
                        </small>

                    </div>


                    <span class="
                        priority-badge
                        priority-${task.priority.toLowerCase()}
                    ">
                        ${task.priority}
                    </span>

                </div>

            `;

        }).join("");

}


/* ================= STREAK ================= */

function calculateStreak() {

    const completionDates =
        new Set(

            tasks
                .filter(task =>
                    task.completedDate
                )
                .map(task =>
                    task.completedDate
                )

        );


    let streak = 0;

    let date = new Date();


    /*
       If nothing was completed today,
       start checking from yesterday.
    */

    if (!completionDates.has(
        todayString()
    )) {

        date.setDate(
            date.getDate() - 1
        );

    }


    while (true) {

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2,"0");

        const day =
            String(
                date.getDate()
            ).padStart(2,"0");

        const key =
            `${year}-${month}-${day}`;


        if (
            completionDates.has(key)
        ) {

            streak++;

            date.setDate(
                date.getDate() - 1
            );

        }

        else {

            break;

        }

    }


    return streak;

}


function renderStreak() {

    const streak =
        calculateStreak();


    document.getElementById(
        "streakCount"
    ).textContent =
        streak;


    document.getElementById(
        "largeStreak"
    ).textContent =
        streak;


    const dots =
        document.getElementById(
            "weekDots"
        );


    const completedDates =
        new Set(

            tasks
                .filter(task =>
                    task.completedDate
                )
                .map(task =>
                    task.completedDate
                )

        );


    let html = "";


    for (let i = 6; i >= 0; i--) {

        const date =
            new Date();

        date.setDate(
            date.getDate() - i
        );


        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2,"0");

        const day =
            String(
                date.getDate()
            ).padStart(2,"0");

        const key =
            `${year}-${month}-${day}`;


        const dayName =
            date.toLocaleDateString(
                "en-US",
                {weekday:"short"}
            ).charAt(0);


        html += `

            <div class="
                day-dot
                ${completedDates.has(key)
                    ? "done"
                    : ""}
            ">
                ${completedDates.has(key)
                    ? "✓"
                    : dayName}
            </div>

        `;

    }


    dots.innerHTML = html;

}


/* ================= WEEKLY CHART ================= */

function getLastSevenDays() {

    const days = [];


    for (let i = 6; i >= 0; i--) {

        const date =
            new Date();

        date.setDate(
            date.getDate() - i
        );


        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2,"0");

        const day =
            String(
                date.getDate()
            ).padStart(2,"0");


        const key =
            `${year}-${month}-${day}`;


        const count =
            tasks.filter(task =>
                task.completedDate === key
            ).length;


        days.push({

            label:
                date.toLocaleDateString(
                    "en-US",
                    {weekday:"short"}
                ),

            count

        });

    }


    return days;

}


function createChartHTML(days) {

    const max =
        Math.max(
            ...days.map(day =>
                day.count
            ),
            1
        );


    return days.map(day => {

        const height =
            day.count === 0
                ? 3
                : Math.max(
                    15,
                    day.count / max * 150
                );


        return `

            <div class="chart-column">

                <span class="chart-value">
                    ${day.count}
                </span>

                <div
                    class="chart-bar"
                    style="height:${height}px">
                </div>

                <span class="chart-day">
                    ${day.label}
                </span>

            </div>

        `;

    }).join("");

}


function renderCharts() {

    const days =
        getLastSevenDays();


    document.getElementById(
        "weeklyChart"
    ).innerHTML =
        createChartHTML(days);


    document.getElementById(
        "largeWeeklyChart"
    ).innerHTML =
        createChartHTML(days);

}


/* ================= SCHEDULE ================= */

document
    .getElementById("addSessionButton")
    .addEventListener("click", () => {

        openModal("sessionModal");

    });


document
    .getElementById("saveSessionButton")
    .addEventListener(
        "click",
        addSession
    );


function addSession() {

    const title =
        document
            .getElementById("sessionTitle")
            .value
            .trim();

    const day =
        document
            .getElementById("sessionDay")
            .value;

    const time =
        document
            .getElementById("sessionTime")
            .value;


    if (!title || !time) {

        showToast(
            "Enter the activity and time."
        );

        return;

    }


    sessions.push({

        id: Date.now(),

        title,

        day,

        time

    });


    sessions.sort(
        (a,b) =>
            a.time.localeCompare(b.time)
    );


    saveData();

    renderSchedule();


    document.getElementById(
        "sessionTitle"
    ).value = "";


    document.getElementById(
        "sessionTime"
    ).value = "";


    closeModal("sessionModal");

    showToast("Added to your schedule 🗓️");

}


function deleteSession(id) {

    sessions =
        sessions.filter(session =>
            session.id !== id
        );


    saveData();

    renderSchedule();

}


function renderSchedule() {

    const grid =
        document.getElementById(
            "scheduleGrid"
        );


    const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ];


    const times =
        [...new Set(
            sessions.map(session =>
                session.time
            )
        )].sort();


    if (times.length === 0) {

        grid.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">🗓️</div>

                <h3>Your schedule is empty</h3>

                <p>
                    Add study sessions to build
                    your weekly routine.
                </p>

            </div>

        `;

        return;

    }


    grid.innerHTML =
        times.map(time => {

            let row = `

                <div class="schedule-row">

                    <div class="schedule-time">
                        ${formatTime(time)}
                    </div>

            `;


            days.forEach(day => {

                const matching =
                    sessions.filter(
                        session =>
                            session.day === day &&
                            session.time === time
                    );


                row += `<div>`;


                matching.forEach(session => {

                    row += `

                        <div class="session-chip">

                            <button
                                class="session-delete"
                                onclick="
                                    deleteSession(
                                        ${session.id}
                                    )
                                ">
                                ×
                            </button>

                            <strong>
                                ${escapeHTML(
                                    session.title
                                )}
                            </strong>

                            <small>
                                ${formatTime(
                                    session.time
                                )}
                            </small>

                        </div>

                    `;

                });


                row += `</div>`;

            });


            row += `</div>`;

            return row;

        }).join("");

}


function formatTime(time) {

    if (!time)
        return "";


    const [hour, minute] =
        time.split(":");


    const date =
        new Date();


    date.setHours(
        Number(hour),
        Number(minute)
    );


    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


/* ================= PROGRESS ================= */

function renderProgress() {

    const completed =
        tasks.filter(task =>
            task.completed
        ).length;

    const pending =
        tasks.length -
        completed;

    const overall =
        calculateOverallProgress();


    document.getElementById(
        "largeProgress"
    ).textContent =
        `${overall}%`;


    document.getElementById(
        "largeProgressRing"
    ).style.setProperty(
        "--progress",
        `${overall}%`
    );


    document.getElementById(
        "progressTotal"
    ).textContent =
        tasks.length;


    document.getElementById(
        "progressCompleted"
    ).textContent =
        completed;


    document.getElementById(
        "progressPending"
    ).textContent =
        pending;


    document.getElementById(
        "progressSubjects"
    ).textContent =
        subjects.length;


    renderSubjectProgress();

}


function renderSubjectProgress() {

    const container =
        document.getElementById(
            "subjectProgressList"
        );


    if (subjects.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <h3>No progress to show yet</h3>

                <p>
                    Add subjects and tasks first.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        subjects.map(subject => {

            const progress =
                getSubjectProgress(
                    subject.id
                );


            return `

                <div class="subject-progress-row">

                    <strong>
                        ${subject.icon}
                        ${escapeHTML(
                            subject.name
                        )}
                    </strong>

                    <div class="progress-track">

                        <div
                            class="progress-fill"
                            style="
                                width:${progress}%
                            ">
                        </div>

                    </div>

                    <span>
                        ${progress}%
                    </span>

                </div>

            `;

        }).join("");

}


/* ================= SETTINGS ================= */

function renderSettings() {

    document.getElementById(
        "nameSetting"
    ).value =
        settings.name;


    document.getElementById(
        "dailyGoal"
    ).value =
        settings.dailyGoal;


    document.getElementById(
        "dashboardName"
    ).textContent =
        settings.name;


    document.getElementById(
        "topName"
    ).textContent =
        settings.name;


    document.getElementById(
        "topAvatar"
    ).textContent =
        settings.name
            .charAt(0)
            .toUpperCase();


    if (settings.theme === "light") {

        document.body.classList.add(
            "light-theme"
        );

    }

    else {

        document.body.classList.remove(
            "light-theme"
        );

    }

}


document
    .getElementById("saveNameButton")
    .addEventListener("click", () => {

        const name =
            document
                .getElementById("nameSetting")
                .value
                .trim();


        if (!name)
            return;


        settings.name = name;

        saveData();

        renderSettings();

        showToast("Profile updated ✨");

    });


document
    .getElementById("saveGoalButton")
    .addEventListener("click", () => {

        settings.dailyGoal =
            Number(
                document
                    .getElementById("dailyGoal")
                    .value
            );


        saveData();

        showToast("Daily goal updated 🎯");

    });


document
    .getElementById("themeButton")
    .addEventListener("click", () => {

        settings.theme =
            settings.theme === "dark"
                ? "light"
                : "dark";


        saveData();

        renderSettings();

        showToast("Theme changed.");

    });


/* ================= RESET ================= */

document
    .getElementById("resetButton")
    .addEventListener("click", () => {

        const confirmed =
            confirm(
                "This will permanently delete all StudySphere subjects, tasks and schedule sessions. Continue?"
            );


        if (!confirmed)
            return;


        subjects = [];

        tasks = [];

        sessions = [];


        saveData();

        renderEverything();

        openPage("dashboard");

        showToast("StudySphere has been reset.");

    });


/* ================= GLOBAL SEARCH ================= */

document
    .getElementById("globalSearch")
    .addEventListener("input", event => {

        const value =
            event.target.value
                .trim()
                .toLowerCase();


        if (!value)
            return;


        const taskMatch =
            tasks.find(task =>
                task.name
                    .toLowerCase()
                    .includes(value)
            );


        const subjectMatch =
            subjects.find(subject =>
                subject.name
                    .toLowerCase()
                    .includes(value)
            );


        if (taskMatch) {

            openPage("tasks");

            document.getElementById(
                "taskSearch"
            ).value = value;

            renderTasks();

        }

        else if (subjectMatch) {

            openPage("subjects");

        }

    });


/* CTRL + K SEARCH SHORTCUT */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "k"
        ) {

            event.preventDefault();

            document
                .getElementById("globalSearch")
                .focus();

        }


        if (event.key === "Escape") {

            document
                .querySelectorAll(
                    ".modal-overlay"
                )
                .forEach(modal =>
                    modal.classList.remove(
                        "show-modal"
                    )
                );

        }

    }
);


/* ================= RENDER EVERYTHING ================= */

function renderEverything() {

    renderSubjects();

    renderTasks();

    renderDashboardTasks();

    updateDashboardStats();

    renderDeadlines();

    renderStreak();

    renderCharts();

    renderSchedule();

    renderProgress();

    renderSettings();

}


/* ================= START APPLICATION ================= */

updateGreeting();

renderEverything();