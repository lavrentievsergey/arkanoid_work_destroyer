const LocalizationService = {
    currentLanguage: 'ru', // Russian by default
    
    translations: {
        en: {
            // HTML UI elements
            title: "Arkanoid - Calendar & Jira Edition",
            level: "Level",
            lives: "Lives", 
            score: "Score",
            calendar: "Calendar",
            jira: "Jira",
            language: "Language",
            currentMode: "Current Mode",
            english: "English",
            russian: "Russian",
            
            // Game screens
            startTitle: "Arkanoid",
            startSubtitle: "Break the blocks and clear your schedule!",
            startButton: "Start Game",
            instructionMove: "Move mouse to control paddle",
            instructionLaunch: "Click or press Space to launch ball",
            
            paused: "Paused",
            resumeButton: "Resume",
            
            gameOver: "Game Over",
            finalScore: "Final Score",
            playAgainButton: "Play Again",
            
            victory: "Victory!",
            scheduleCleared: "Schedule cleared! Score",
            
            levelComplete: "Level Complete!",
            nextLevelButton: "Bring It On!",
            
            difficultyWarning: "⚠️ Incoming Workload!",
            difficultyDetails: "More blocks, faster ball!",
            acceptChallengeButton: "I Can Handle It!",
            
            // Settings
            difficulty: "Difficulty:",
            easy: "Easy",
            normal: "Normal", 
            hard: "Hard",
            ballSpeed: "Ball Speed:",
            randomBlocks: "Random Blocks:",
            powerUps: "Power-ups:",
            
            // Power-up names
            multiBall: "Multi-Ball",
            explosion: "Explosion",
            chainReaction: "Chain Reaction", 
            extraBlocks: "Extra Blocks",
            randomDirection: "Chaos Ball",
            smallerBall: "Tiny Ball",
            
            // Jira columns - always English, removed translations
            
            // Level complete messages - Calendar
            levelCompleteCalendar: [
                "This week is done, give me another one!",
                "Meeting marathon completed! Ready for round two?",
                "Calendar cleared! Time for more 'urgent' discussions?",
                "All syncs synced! Bring on the next wave of productivity theater!",
                "Week's schedule demolished! Who's ready for more back-to-back calls?",
                "Meetings: 0, Productivity: Questionable. Next week please!"
            ],
            
            // Level complete messages - Jira
            levelCompleteJira: [
                "Sprint completed! Ready for more 'quick wins'?",
                "Backlog cleared! Time for some new technical debt!",
                "All tasks done! Waiting for the next 'urgent' priority shuffle...",
                "Board cleaned up! Ready for more scope creep?",
                "Stories completed! Time for the PM to add 'just one more feature'?",
                "Done column is full! Bring on the next impossible deadline!"
            ],
            
            // Difficulty warning messages - Calendar
            difficultyWarningCalendar: [
                "I finished your work too fast, take some more meetings!",
                "Hey pal, a new manager assigned you more calls!",
                "Congratulations! You are rewarded with more work to do!",
                "Efficiency detected! Time for some additional 'alignment' sessions!",
                "Great job! Here's your prize: more status updates!",
                "Performance review says you need more collaborative opportunities!",
                "Success! Your reward is a packed calendar next week!"
            ],
            
            // Difficulty warning messages - Jira
            difficultyWarningJira: [
                "I finished your work too fast, take some more tasks!",
                "Hey pal, a new product manager assigned you more tickets!",
                "Congratulations! You are rewarded with more work to do!",
                "Velocity too high! Time for some additional complexity!",
                "Great job! Here's your bonus: more edge cases to handle!",
                "Stand-up feedback: You need more 'challenging' user stories!",
                "Achievement unlocked: Even more technical debt to resolve!"
            ],
            
            // Game over messages - Calendar
            gameOverCalendar: [
                "You are pathetic, AI will do your job.",
                "Maybe stick to playing solitaire during meetings?",
                "Performance review: Needs improvement... in everything.",
                "Don't worry, we'll just hire more consultants.",
                "Your calendar management skills are as bad as your gameplay.",
                "Time to update your LinkedIn - 'Former Meeting Destroyer'."
            ],
            
            // Game over messages - Jira
            gameOverJira: [
                "You are pathetic, AI will do your job.",
                "Maybe coding isn't for you? Try product management.",
                "Error 404: Programming skills not found.",
                "Don't worry, we'll just outsource your tasks.",
                "Your bug-squashing skills need some debugging.",
                "Time to update your resume - 'Former Task Terminator'."
            ],
            
            // Random event messages - Calendar
            randomEventCalendar: [
                "🚨 Oops! HR wants a 1-on-1 ASAP",
                "📞 Emergency! Client called for an 'urgent' 15-min chat",
                "⚡ Breaking: Manager scheduled a quick sync about syncing",
                "🔥 Hot off the press: Another 'brief' status update meeting",
                "📅 Plot twist: Mandatory team building session appeared!",
                "🎯 Surprise! Last-minute demo prep meeting materialized",
                "☕ Alert: Coffee chat turned into strategic planning session",
                "📊 News flash: Stakeholder wants to 'align on priorities'",
                "🤝 Incoming: Cross-team collaboration opportunity (aka more meetings)",
                "🎪 Ta-da! Another 'quick' brainstorming session spawned"
            ],
            
            // Random event messages - Jira
            randomEventJira: [
                "🚨 Oops! Critical bug just crawled out of production",
                "🔥 Breaking: 'Simple' task got 5 new acceptance criteria",
                "⚡ Emergency! Stakeholder remembered one tiny requirement",
                "📈 Plot twist: QA found edge cases in your edge cases",
                "🎯 Surprise! Security review revealed 'minor' concerns",
                "🤔 Alert: Product owner had a 'brilliant' idea at 3 AM",
                "📊 News flash: Designer wants to 'improve user experience'",
                "🔧 Incoming: DevOps needs you to 'quickly' fix the pipeline",
                "🎪 Ta-da! Another 'high priority' ticket appeared",
                "⭐ Magic! Technical debt decided to compound itself"
            ],
            
            // Mock Calendar data
            meetingTypes: {
                "Daily Standup": "Daily Standup",
                "Sprint Planning": "Sprint Planning", 
                "Code Review": "Code Review",
                "Client Demo": "Client Demo",
                "Team Lunch": "Team Lunch",
                "1:1 with Manager": "1:1 with Manager",
                "Architecture Review": "Architecture Review",
                "Bug Triage": "Bug Triage",
                "Release Meeting": "Release Meeting",
                "Team Retrospective": "Team Retrospective"
            },
            
            // Mock Jira data
            taskTypes: {
                "Fix login bug": "Fix login bug",
                "Add dark mode": "Add dark mode",
                "Update API docs": "Update API docs",
                "Optimize queries": "Optimize queries",
                "Write unit tests": "Write unit tests",
                "Refactor components": "Refactor components",
                "Security audit": "Security audit",
                "Performance tuning": "Performance tuning",
                "Mobile responsive": "Mobile responsive",
                "Error handling": "Error handling",
                "Data validation": "Data validation",
                "UI improvements": "UI improvements",
                "Cache optimization": "Cache optimization",
                "Database migration": "Database migration",
                "Third-party integration": "Third-party integration"
            },
            
            // Random event block titles
            emergencyMeetingTypes: ['Emergency Sync', 'Quick Check-in', 'Urgent Review', 'Last-minute Call'],
            urgentTaskTypes: ['Hotfix needed', 'Critical bug', 'Urgent feature', 'Emergency patch'],
            
            // Loading text
            loadingData: "Loading data..."
        },
        
        ru: {
            // HTML UI elements
            title: "Арканоид - Издание Calendar и Jira",
            level: "Уровень",
            lives: "Жизни",
            score: "Счёт", 
            calendar: "Calendar",
            jira: "Jira",
            language: "Язык",
            currentMode: "Текущий режим",
            english: "Английский",
            russian: "Русский",
            
            // Game screens
            startTitle: "Арканоид",
            startSubtitle: "Разбей блоки и очисти своё расписание!",
            startButton: "Начать игру",
            instructionMove: "Управляй платформой мышью",
            instructionLaunch: "Нажми или пробел, чтобы запустить мяч",
            
            paused: "Пауза",
            resumeButton: "Продолжить",
            
            gameOver: "Игра окончена",
            finalScore: "Финальный счёт",
            playAgainButton: "Играть снова",
            
            victory: "Победа!",
            scheduleCleared: "Расписание очищено! Счёт",
            
            levelComplete: "Уровень пройден!",
            nextLevelButton: "Давай ещё!",
            
            difficultyWarning: "⚠️ Входящая рабочая нагрузка!",
            difficultyDetails: "Больше блоков, быстрее мяч!",
            acceptChallengeButton: "Я справлюсь!",
            
            // Settings
            difficulty: "Сложность:",
            easy: "Легко",
            normal: "Нормально",
            hard: "Сложно",
            ballSpeed: "Скорость мяча:",
            randomBlocks: "Случайные блоки:",
            powerUps: "Способности:",
            
            // Power-up names
            multiBall: "Мульти-мяч",
            explosion: "Взрыв",
            chainReaction: "Цепная реакция",
            extraBlocks: "Доп. блоки",
            randomDirection: "Хаос-мяч", 
            smallerBall: "Мини-мяч",
            
            // Jira columns - always English, removed translations
            
            // Level complete messages - Calendar
            levelCompleteCalendar: [
                "Эта неделя закончена, дай мне ещё одну!",
                "Марафон встреч завершён! Готов ко второму раунду?",
                "Календарь очищен! Время для новых 'срочных' обсуждений?",
                "Все синки синхронизированы! Давай новую волну театра продуктивности!",
                "Расписание недели снесено! Кто готов к новым встречам спина к спине?",
                "Встречи: 0, Продуктивность: Сомнительная. Следующую неделю, пожалуйста!"
            ],
            
            // Level complete messages - Jira
            levelCompleteJira: [
                "Спринт завершён! Готов к новым 'быстрым победам'?",
                "Бэклог очищен! Время для нового технического долга!",
                "Все задачи выполнены! Жду следующей 'срочной' перестановки приоритетов...",
                "Доска очищена! Готов к новому расширению скоупа?",
                "Истории завершены! Время ПМу добавить 'ещё одну маленькую фичу'?",
                "Колонка 'Готово' заполнена! Давай следующий невозможный дедлайн!"
            ],
            
            // Difficulty warning messages - Calendar  
            difficultyWarningCalendar: [
                "Я закончил твою работу слишком быстро, бери больше встреч!",
                "Эй, приятель, новый менеджер назначил тебе больше звонков!",
                "Поздравляю! Ты награждён дополнительной работой!",
                "Обнаружена эффективность! Время для дополнительных сессий 'выравнивания'!",
                "Отличная работа! Вот твой приз: больше статус-апдейтов!",
                "Оценка производительности говорит, что тебе нужно больше коллаборативных возможностей!",
                "Успех! Твоя награда - переполненный календарь на следующую неделю!"
            ],
            
            // Difficulty warning messages - Jira
            difficultyWarningJira: [
                "Я закончил твою работу слишком быстро, бери больше задач!",
                "Эй, приятель, новый продакт-менеджер назначил тебе больше тикетов!",
                "Поздравляю! Ты награждён дополнительной работой!",
                "Скорость слишком высокая! Время для дополнительной сложности!",
                "Отличная работа! Вот твой бонус: больше крайних случаев для обработки!",
                "Фидбэк со стендапа: тебе нужны более 'челленджинговые' пользовательские истории!",
                "Ачивка разблокирована: Ещё больше технического долга для решения!"
            ],
            
            // Game over messages - Calendar
            gameOverCalendar: [
                "Ты жалок, ИИ сделает твою работу.",
                "Может, лучше играй в солитёр во время встреч?",
                "Оценка производительности: Требуется улучшение... во всём.",
                "Не волнуйся, мы просто наймём больше консультантов.",
                "Твои навыки управления календарём такие же плохие, как твоя игра.",
                "Время обновить LinkedIn - 'Бывший разрушитель встреч'."
            ],
            
            // Game over messages - Jira
            gameOverJira: [
                "Ты жалок, ИИ сделает твою работу.",
                "Может, кодинг не для тебя? Попробуй продакт-менеджмент.",
                "Ошибка 404: Навыки программирования не найдены.",
                "Не волнуйся, мы просто аутсорсим твои задачи.",
                "Твои навыки давки багов нуждаются в отладке.",
                "Время обновить резюме - 'Бывший терминатор задач'."
            ],
            
            // Random event messages - Calendar
            randomEventCalendar: [
                "🚨 Упс! HR хочет 1-на-1 как можно скорее",
                "📞 Экстренно! Клиент звонил для 'срочного' 15-минутного чата",
                "⚡ Срочно: Менеджер запланировал быстрый синк о синках",
                "🔥 Горячие новости: Ещё одна 'краткая' встреча по статус-апдейту",
                "📅 Поворот сюжета: Появилась обязательная сессия тимбилдинга!",
                "🎯 Сюрприз! Материализовалась встреча подготовки к демо в последнюю минуту",
                "☕ Тревога: Кофе-чат превратился в сессию стратегического планирования",
                "📊 Новости: Стейкхолдер хочет 'выровнять приоритеты'",
                "🤝 Входящее: Возможность межкомандной коллаборации (то есть больше встреч)",
                "🎪 Та-да! Появилась ещё одна 'быстрая' сессия брейнсторминга"
            ],
            
            // Random event messages - Jira
            randomEventJira: [
                "🚨 Упс! Критический баг только что выполз из продакшена",
                "🔥 Срочно: 'Простая' задача получила 5 новых критериев приёмки",
                "⚡ Экстренно! Стейкхолдер вспомнил одно крошечное требование",
                "📈 Поворот сюжета: QA нашло крайние случаи в твоих крайних случаях",
                "🎯 Сюрприз! Ревью безопасности выявило 'незначительные' проблемы",
                "🤔 Тревога: У продакт-оунера была 'гениальная' идея в 3 утра",
                "📊 Новости: Дизайнер хочет 'улучшить пользовательский опыт'",
                "🔧 Входящее: DevOps нужно, чтобы ты 'быстро' починил пайплайн",
                "🎪 Та-да! Появился ещё один тикет 'высокого приоритета'",
                "⭐ Магия! Технический долг решил сам себя накопить"
            ],
            
            // Mock Calendar data
            meetingTypes: {
                "Daily Standup": "Ежедневный стендап",
                "Sprint Planning": "Планирование спринта",
                "Code Review": "Ревью кода",
                "Client Demo": "Демо клиенту",
                "Team Lunch": "Командный обед",
                "1:1 with Manager": "1-на-1 с менеджером",
                "Architecture Review": "Архитектурный ревью",
                "Bug Triage": "Триаж багов",
                "Release Meeting": "Встреча по релизу",
                "Team Retrospective": "Командная ретроспектива"
            },
            
            // Mock Jira data
            taskTypes: {
                "Fix login bug": "Исправить баг логина",
                "Add dark mode": "Добавить тёмную тему",
                "Update API docs": "Обновить API документацию",
                "Optimize queries": "Оптимизировать запросы",
                "Write unit tests": "Написать юнит-тесты",
                "Refactor components": "Рефакторить компоненты",
                "Security audit": "Аудит безопасности",
                "Performance tuning": "Настройка производительности",
                "Mobile responsive": "Мобильная адаптивность",
                "Error handling": "Обработка ошибок",
                "Data validation": "Валидация данных",
                "UI improvements": "Улучшения UI",
                "Cache optimization": "Оптимизация кэша",
                "Database migration": "Миграция базы данных",
                "Third-party integration": "Интеграция с третьими сторонами"
            },
            
            // Random event block titles
            emergencyMeetingTypes: ['Экстренный синк', 'Быстрый чек-ин', 'Срочный ревью', 'Звонок в последнюю минуту'],
            urgentTaskTypes: ['Нужен хотфикс', 'Критический баг', 'Срочная фича', 'Экстренный патч'],
            
            // Loading text
            loadingData: "Загрузка данных..."
        }
    },
    
    setLanguage: function(language) {
        if (this.translations[language]) {
            this.currentLanguage = language;
            this.updateDOM();
            this.updateLanguageSelector();
            
            // Save language preference
            localStorage.setItem('arkanoid_language', language);
            
            // Trigger custom event for components that need to update
            window.dispatchEvent(new CustomEvent('languageChanged', { 
                detail: { language: language } 
            }));
        }
    },
    
    getCurrentLanguage: function() {
        return this.currentLanguage;
    },
    
    t: function(key, context = null) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];
        
        for (let k of keys) {
            if (value && value.hasOwnProperty(k)) {
                value = value[k];
            } else {
                // Fallback to English if key not found
                value = this.translations['en'];
                for (let k of keys) {
                    if (value && value.hasOwnProperty(k)) {
                        value = value[k];
                    } else {
                        return key; // Return key if not found in English either
                    }
                }
                break;
            }
        }
        
        // If it's an array and context is provided, return specific item
        if (Array.isArray(value) && context !== null) {
            return value[context] || value[0];
        }
        
        return value || key;
    },
    
    tArray: function(key) {
        const value = this.t(key);
        return Array.isArray(value) ? value : [value];
    },
    
    updateDOM: function() {
        // Update HTML elements with data-translate attribute
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            if (element.tagName === 'INPUT' && element.type === 'text') {
                element.placeholder = this.t(key);
            } else if (element.hasAttribute('data-translate-content')) {
                element.textContent = this.t(key);
            } else if (element.value !== undefined) {
                element.textContent = this.t(key);
            } else {
                element.innerHTML = this.t(key);
            }
        });
        
        // Update document title
        document.title = this.t('title');
    },
    
    init: function() {
        // Load saved language preference
        const savedLanguage = localStorage.getItem('arkanoid_language');
        if (savedLanguage && this.translations[savedLanguage]) {
            this.currentLanguage = savedLanguage;
        }
        
        // Update DOM on load
        this.updateDOM();
        
        // Set language selector value
        this.updateLanguageSelector();
    },
    
    updateLanguageSelector: function() {
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.value = this.currentLanguage;
        }
    }
};

// Initialize on DOM content loaded
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => LocalizationService.init());
    } else {
        LocalizationService.init();
    }
}