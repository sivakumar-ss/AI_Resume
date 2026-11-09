"""MCQ question bank for skill assessments.

Correct answers stay in this backend module. The API never returns them before
submission, and scoring is performed server-side.
"""

ASSESSMENT_CATEGORIES = [
    {"id": "python", "name": "Python", "time_limit_seconds": 600},
    {"id": "java", "name": "Java", "time_limit_seconds": 600},
    {"id": "sql", "name": "SQL", "time_limit_seconds": 600},
    {"id": "web", "name": "HTML/CSS/JavaScript", "time_limit_seconds": 600},
    {"id": "react", "name": "React", "time_limit_seconds": 600},
    {"id": "aptitude", "name": "Aptitude", "time_limit_seconds": 480},
    {"id": "logical_reasoning", "name": "Logical Reasoning", "time_limit_seconds": 480},
]

QUESTIONS = {
    "python": [
        {"id": "python-1", "prompt": "Which keyword defines a function?", "options": ["func", "def", "function", "lambda"], "correct_index": 1, "explanation": "Python uses def."},
        {"id": "python-2", "prompt": "Output of len([1, 2, 3])?", "options": ["2", "3", "4", "Error"], "correct_index": 1, "explanation": "Three elements."},
        {"id": "python-3", "prompt": "Which type is immutable?", "options": ["list", "dict", "set", "tuple"], "correct_index": 3, "explanation": "Tuples are immutable."},
        {"id": "python-4", "prompt": "How do you start a comment?", "options": ["//", "#", "/*", "--"], "correct_index": 1, "explanation": "Use #."},
        {"id": "python-5", "prompt": "Method to add to end of list?", "options": ["add()", "append()", "insert()", "push()"], "correct_index": 1, "explanation": "append() adds to the end."},
    ],
    "java": [
        {"id": "java-1", "prompt": "Entry point method?", "options": ["start()", "main()", "run()", "init()"], "correct_index": 1, "explanation": "main() is the entry point."},
        {"id": "java-2", "prompt": "Keyword to inherit a class?", "options": ["implements", "extends", "inherits", "super"], "correct_index": 1, "explanation": "extends inherits a class."},
        {"id": "java-3", "prompt": "Collection without duplicates?", "options": ["List", "ArrayList", "Set", "LinkedList"], "correct_index": 2, "explanation": "Set stores unique values."},
        {"id": "java-4", "prompt": "Default int value?", "options": ["null", "0", "1", "undefined"], "correct_index": 1, "explanation": "Default is 0."},
        {"id": "java-5", "prompt": "Package for Scanner?", "options": ["java.io", "java.util", "java.lang", "java.net"], "correct_index": 1, "explanation": "Scanner is in java.util."},
    ],
    "sql": [
        {"id": "sql-1", "prompt": "Statement to retrieve data?", "options": ["GET", "SELECT", "FETCH", "READ"], "correct_index": 1, "explanation": "SELECT retrieves rows."},
        {"id": "sql-2", "prompt": "Clause to filter rows?", "options": ["WHERE", "GROUP BY", "ORDER BY", "HAVING"], "correct_index": 0, "explanation": "WHERE filters rows."},
        {"id": "sql-3", "prompt": "Join returning matches in both tables?", "options": ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL JOIN"], "correct_index": 2, "explanation": "INNER JOIN matches both."},
        {"id": "sql-4", "prompt": "Function to count rows?", "options": ["SUM()", "COUNT()", "AVG()", "MAX()"], "correct_index": 1, "explanation": "COUNT() counts rows."},
        {"id": "sql-5", "prompt": "Keyword to remove duplicates?", "options": ["UNIQUE", "DISTINCT", "DIFFERENT", "GROUP"], "correct_index": 1, "explanation": "DISTINCT removes duplicates."},
    ],
    "web": [
        {"id": "web-1", "prompt": "Tag for hyperlink?", "options": ["<link>", "<a>", "<href>", "<url>"], "correct_index": 1, "explanation": "Use <a>."},
        {"id": "web-2", "prompt": "CSS property for text color?", "options": ["font-color", "text-color", "color", "foreground"], "correct_index": 2, "explanation": "Use color."},
        {"id": "web-3", "prompt": "Select element by ID?", "options": ["querySelectorAll", "getElementById", "getElementsByName", "selectById"], "correct_index": 1, "explanation": "getElementById selects by ID."},
        {"id": "web-4", "prompt": "CSS two-dimensional layout?", "options": ["Flexbox", "Grid", "Float", "Position"], "correct_index": 1, "explanation": "Grid is two-dimensional."},
        {"id": "web-5", "prompt": "Strict equality operator?", "options": ["==", "===", "=", "!="], "correct_index": 1, "explanation": "=== checks value and type."},
    ],
    "react": [
        {"id": "react-1", "prompt": "Hook for state?", "options": ["useEffect", "useState", "useMemo", "useRef"], "correct_index": 1, "explanation": "useState manages state."},
        {"id": "react-2", "prompt": "Hook for side effects?", "options": ["useState", "useCallback", "useEffect", "useMemo"], "correct_index": 2, "explanation": "useEffect runs side effects."},
        {"id": "react-3", "prompt": "Component return value?", "options": ["A string", "A number", "JSX or null", "An object"], "correct_index": 2, "explanation": "Return JSX or null."},
        {"id": "react-4", "prompt": "Data passed to child?", "options": ["state", "props", "context", "ref"], "correct_index": 1, "explanation": "Props pass data."},
        {"id": "react-5", "prompt": "Render list with keys?", "options": ["for loop", "map", "while", "forEach"], "correct_index": 1, "explanation": "map creates elements."},
    ],
    "aptitude": [
        {"id": "aptitude-1", "prompt": "20% of a number is 50. Number?", "options": ["200", "250", "300", "150"], "correct_index": 1, "explanation": "20% of 250 is 50."},
        {"id": "aptitude-2", "prompt": "60 km/h for 2.5 hours?", "options": ["120 km", "150 km", "180 km", "100 km"], "correct_index": 1, "explanation": "60 * 2.5 = 150."},
        {"id": "aptitude-3", "prompt": "15% of 200?", "options": ["20", "25", "30", "35"], "correct_index": 2, "explanation": "15% of 200 is 30."},
        {"id": "aptitude-4", "prompt": "8 workers in 6 days; 12 workers take?", "options": ["4", "5", "6", "8"], "correct_index": 0, "explanation": "8*6 = 12*4."},
        {"id": "aptitude-5", "prompt": "Average of 10, 20, 30?", "options": ["15", "20", "25", "30"], "correct_index": 1, "explanation": "(10+20+30)/3 = 20."},
    ],
    "logical_reasoning": [
        {"id": "logical-1", "prompt": "All roses are flowers; some flowers red. Valid?", "options": ["All roses red", "Some roses may be red", "No roses red", "All red are roses"], "correct_index": 1, "explanation": "Only possibility follows."},
        {"id": "logical-2", "prompt": "Series 2, 4, 8, 16, ?", "options": ["24", "32", "18", "20"], "correct_index": 1, "explanation": "Each term doubles."},
        {"id": "logical-3", "prompt": "A>B>C. Shortest?", "options": ["A", "B", "C", "Cannot tell"], "correct_index": 2, "explanation": "C is shortest."},
        {"id": "logical-4", "prompt": "Which does not belong: 3,5,7,9,12?", "options": ["3", "5", "7", "12"], "correct_index": 3, "explanation": "12 is even."},
        {"id": "logical-5", "prompt": "Day after tomorrow is Wednesday. Today?", "options": ["Monday", "Tuesday", "Sunday", "Thursday"], "correct_index": 0, "explanation": "Wednesday minus two days is Monday."},
    ],
}
