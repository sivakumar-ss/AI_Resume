
"""Curated learning resources used by the personalized roadmap.

URLs are public learning pages. Durations are planning estimates, not promises.
"""

ROADMAP_RESOURCES = {
    "python": [
        {"difficulty": "beginner", "title": "Python Tutorial", "provider": "Python.org", "resource_type": "article", "url": "https://docs.python.org/3/tutorial/", "estimated_hours": 12},
        {"difficulty": "intermediate", "title": "Scientific Computing with Python", "provider": "freeCodeCamp", "resource_type": "course", "url": "https://www.freecodecamp.org/learn/scientific-computing-with-python/", "estimated_hours": 20},
        {"difficulty": "advanced", "title": "Real Python Tutorials", "provider": "Real Python", "resource_type": "article", "url": "https://realpython.com/", "estimated_hours": 25},
    ],
    "java": [
        {"difficulty": "beginner", "title": "Java Tutorial", "provider": "Oracle", "resource_type": "article", "url": "https://docs.oracle.com/javase/tutorial/", "estimated_hours": 15},
        {"difficulty": "intermediate", "title": "Java Programming and Software Engineering Fundamentals", "provider": "Coursera", "resource_type": "course", "url": "https://www.coursera.org/specializations/java-programming", "estimated_hours": 30},
        {"difficulty": "advanced", "title": "Effective Java", "provider": "Oracle", "resource_type": "book", "url": "https://www.oracle.com/java/technologies/javase-downloads.html", "estimated_hours": 20},
    ],
    "javascript": [
        {"difficulty": "beginner", "title": "JavaScript Guide", "provider": "MDN", "resource_type": "article", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", "estimated_hours": 12},
        {"difficulty": "intermediate", "title": "JavaScript Algorithms and Data Structures", "provider": "freeCodeCamp", "resource_type": "course", "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/", "estimated_hours": 30},
        {"difficulty": "advanced", "title": "JavaScript Info", "provider": "javascript.info", "resource_type": "article", "url": "https://javascript.info/", "estimated_hours": 25},
    ],
    "typescript": [
        {"difficulty": "beginner", "title": "TypeScript Handbook", "provider": "TypeScript", "resource_type": "article", "url": "https://www.typescriptlang.org/docs/handbook/intro.html", "estimated_hours": 10},
        {"difficulty": "intermediate", "title": "TypeScript Deep Dive", "provider": "GitBook", "resource_type": "book", "url": "https://basarat.gitbook.io/typescript/", "estimated_hours": 20},
        {"difficulty": "advanced", "title": "TypeScript Reference", "provider": "TypeScript", "resource_type": "article", "url": "https://www.typescriptlang.org/docs/", "estimated_hours": 15},
    ],
    "sql": [
        {"difficulty": "beginner", "title": "SQLBolt", "provider": "SQLBolt", "resource_type": "course", "url": "https://sqlbolt.com/", "estimated_hours": 8},
        {"difficulty": "intermediate", "title": "SQL Tutorial", "provider": "Mode", "resource_type": "article", "url": "https://mode.com/sql-tutorial/", "estimated_hours": 15},
        {"difficulty": "advanced", "title": "PostgreSQL Tutorial", "provider": "PostgreSQL", "resource_type": "article", "url": "https://www.postgresql.org/docs/current/tutorial.html", "estimated_hours": 20},
    ],
    "postgresql": [
        {"difficulty": "beginner", "title": "PostgreSQL Tutorial", "provider": "PostgreSQL", "resource_type": "article", "url": "https://www.postgresql.org/docs/current/tutorial.html", "estimated_hours": 10},
        {"difficulty": "intermediate", "title": "PostgreSQL Exercises", "provider": "pgExercises", "resource_type": "course", "url": "https://pgexercises.com/", "estimated_hours": 12},
        {"difficulty": "advanced", "title": "PostgreSQL Documentation", "provider": "PostgreSQL", "resource_type": "article", "url": "https://www.postgresql.org/docs/", "estimated_hours": 25},
    ],
    "mysql": [
        {"difficulty": "beginner", "title": "MySQL Tutorial", "provider": "MySQL", "resource_type": "article", "url": "https://dev.mysql.com/doc/refman/8.0/en/tutorial.html", "estimated_hours": 10},
        {"difficulty": "intermediate", "title": "MySQL Practice", "provider": "SQLZoo", "resource_type": "course", "url": "https://sqlzoo.net/", "estimated_hours": 12},
        {"difficulty": "advanced", "title": "MySQL Reference Manual", "provider": "MySQL", "resource_type": "article", "url": "https://dev.mysql.com/doc/", "estimated_hours": 20},
    ],
    "mongodb": [
        {"difficulty": "beginner", "title": "MongoDB University", "provider": "MongoDB", "resource_type": "course", "url": "https://learn.mongodb.com/", "estimated_hours": 12},
        {"difficulty": "intermediate", "title": "MongoDB Manual", "provider": "MongoDB", "resource_type": "article", "url": "https://www.mongodb.com/docs/manual/", "estimated_hours": 18},
        {"difficulty": "advanced", "title": "MongoDB Performance", "provider": "MongoDB", "resource_type": "article", "url": "https://www.mongodb.com/docs/manual/administration/analyzing-mongodb-performance/", "estimated_hours": 15},
    ],
    "redis": [
        {"difficulty": "beginner", "title": "Redis University", "provider": "Redis", "resource_type": "course", "url": "https://university.redis.com/", "estimated_hours": 8},
        {"difficulty": "intermediate", "title": "Redis Commands", "provider": "Redis", "resource_type": "article", "url": "https://redis.io/commands/", "estimated_hours": 10},
        {"difficulty": "advanced", "title": "Redis Architecture", "provider": "Redis", "resource_type": "article", "url": "https://redis.io/docs/latest/", "estimated_hours": 15},
    ],
    "html": [
        {"difficulty": "beginner", "title": "HTML Tutorial", "provider": "MDN", "resource_type": "article", "url": "https://developer.mozilla.org/en-US/docs/Learn/HTML", "estimated_hours": 8},
        {"difficulty": "intermediate", "title": "HTML Forms and Semantics", "provider": "MDN", "resource_type": "article", "url": "https://developer.mozilla.org/en-US/docs/Learn/Forms", "estimated_hours": 8},
        {"difficulty": "advanced", "title": "HTML Reference", "provider": "MDN", "resource_type": "article", "url": "https://developer.mozilla.org/en-US/docs/Web/HTML", "estimated_hours": 10},
    ],
    "css": [
        {"difficulty": "beginner", "title": "CSS Tutorial", "provider": "MDN", "resource_type": "article", "url": "https://developer.mozilla.org/en-US/docs/Learn/CSS", "estimated_hours": 10},
        {"difficulty": "intermediate", "title": "CSS Layout", "provider": "MDN", "resource_type": "article", "url": "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout", "estimated_hours": 10},
        {"difficulty": "advanced", "title": "CSS Reference", "provider": "MDN", "resource_type": "article", "url": "https://developer.mozilla.org/en-US/docs/Web/CSS", "estimated_hours": 12},
    ],
    "react": [
        {"difficulty": "beginner", "title": "React Learn", "provider": "React", "resource_type": "article", "url": "https://react.dev/learn", "estimated_hours": 12},
        {"difficulty": "intermediate", "title": "Front-End Development Libraries", "provider": "freeCodeCamp", "resource_type": "course", "url": "https://www.freecodecamp.org/learn/front-end-development-libraries/", "estimated_hours": 30},
        {"difficulty": "advanced", "title": "React Reference", "provider": "React", "resource_type": "article", "url": "https://react.dev/reference/react", "estimated_hours": 15},
    ],
    "node.js": [
        {"difficulty": "beginner", "title": "Node.js Getting Started", "provider": "Node.js", "resource_type": "article", "url": "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs", "estimated_hours": 8},
        {"difficulty": "intermediate", "title": "Node.js Guides", "provider": "Node.js", "resource_type": "article", "url": "https://nodejs.org/en/learn", "estimated_hours": 15},
        {"difficulty": "advanced", "title": "Node.js API", "provider": "Node.js", "resource_type": "article", "url": "https://nodejs.org/api/", "estimated_hours": 20},
    ],
    "express": [
        {"difficulty": "beginner", "title": "Express Getting Started", "provider": "Express", "resource_type": "article", "url": "https://expressjs.com/en/starter/installing.html", "estimated_hours": 6},
        {"difficulty": "intermediate", "title": "Express Guide", "provider": "Express", "resource_type": "article", "url": "https://expressjs.com/en/guide/routing.html", "estimated_hours": 10},
        {"difficulty": "advanced", "title": "Express Advanced Topics", "provider": "Express", "resource_type": "article", "url": "https://expressjs.com/en/advanced/best-practice-security.html", "estimated_hours": 12},
    ],
    "flask": [
        {"difficulty": "beginner", "title": "Flask Quickstart", "provider": "Flask", "resource_type": "article", "url": "https://flask.palletsprojects.com/en/stable/quickstart/", "estimated_hours": 8},
        {"difficulty": "intermediate", "title": "Flask Tutorial", "provider": "Flask", "resource_type": "article", "url": "https://flask.palletsprojects.com/en/stable/tutorial/", "estimated_hours": 15},
        {"difficulty": "advanced", "title": "Flask Documentation", "provider": "Flask", "resource_type": "article", "url": "https://flask.palletsprojects.com/en/stable/", "estimated_hours": 20},
    ],
    "django": [
        {"difficulty": "beginner", "title": "Django Getting Started", "provider": "Django", "resource_type": "article", "url": "https://docs.djangoproject.com/en/stable/intro/", "estimated_hours": 10},
        {"difficulty": "intermediate", "title": "Django Tutorial", "provider": "Django", "resource_type": "article", "url": "https://docs.djangoproject.com/en/stable/intro/tutorial01/", "estimated_hours": 20},
        {"difficulty": "advanced", "title": "Django Documentation", "provider": "Django", "resource_type": "article", "url": "https://docs.djangoproject.com/en/stable/", "estimated_hours": 25},
    ],
    "fastapi": [
        {"difficulty": "beginner", "title": "FastAPI First Steps", "provider": "FastAPI", "resource_type": "article", "url": "https://fastapi.tiangolo.com/tutorial/first-steps/", "estimated_hours": 6},
        {"difficulty": "intermediate", "title": "FastAPI Tutorial", "provider": "FastAPI", "resource_type": "article", "url": "https://fastapi.tiangolo.com/tutorial/", "estimated_hours": 15},
        {"difficulty": "advanced", "title": "FastAPI Advanced User Guide", "provider": "FastAPI", "resource_type": "article", "url": "https://fastapi.tiangolo.com/advanced/", "estimated_hours": 15},
    ],
    "git": [
        {"difficulty": "beginner", "title": "Git Handbook", "provider": "GitHub", "resource_type": "article", "url": "https://docs.github.com/en/get-started/using-git", "estimated_hours": 4},
        {"difficulty": "intermediate", "title": "Pro Git Book", "provider": "Git", "resource_type": "book", "url": "https://git-scm.com/book/en/v2", "estimated_hours": 15},
        {"difficulty": "advanced", "title": "Git Reference", "provider": "Git", "resource_type": "article", "url": "https://git-scm.com/docs", "estimated_hours": 10},
    ],
    "docker": [
        {"difficulty": "beginner", "title": "Docker Get Started", "provider": "Docker", "resource_type": "article", "url": "https://docs.docker.com/get-started/", "estimated_hours": 8},
        {"difficulty": "intermediate", "title": "Docker Compose", "provider": "Docker", "resource_type": "article", "url": "https://docs.docker.com/compose/", "estimated_hours": 10},
        {"difficulty": "advanced", "title": "Docker Engine", "provider": "Docker", "resource_type": "article", "url": "https://docs.docker.com/engine/", "estimated_hours": 15},
    ],
    "kubernetes": [
        {"difficulty": "beginner", "title": "Kubernetes Basics", "provider": "Kubernetes", "resource_type": "article", "url": "https://kubernetes.io/docs/tutorials/kubernetes-basics/", "estimated_hours": 10},
        {"difficulty": "intermediate", "title": "Kubernetes Tasks", "provider": "Kubernetes", "resource_type": "article", "url": "https://kubernetes.io/docs/tasks/", "estimated_hours": 20},
        {"difficulty": "advanced", "title": "Kubernetes Concepts", "provider": "Kubernetes", "resource_type": "article", "url": "https://kubernetes.io/docs/concepts/", "estimated_hours": 25},
    ],
    "aws": [
        {"difficulty": "beginner", "title": "AWS Getting Started", "provider": "AWS", "resource_type": "article", "url": "https://aws.amazon.com/getting-started/", "estimated_hours": 10},
        {"difficulty": "intermediate", "title": "AWS Training", "provider": "AWS", "resource_type": "course", "url": "https://aws.amazon.com/training/", "estimated_hours": 25},
        {"difficulty": "advanced", "title": "AWS Documentation", "provider": "AWS", "resource_type": "article", "url": "https://docs.aws.amazon.com/", "estimated_hours": 30},
    ],
    "azure": [
        {"difficulty": "beginner", "title": "Azure Fundamentals", "provider": "Microsoft Learn", "resource_type": "course", "url": "https://learn.microsoft.com/en-us/training/paths/azure-fundamentals/", "estimated_hours": 10},
        {"difficulty": "intermediate", "title": "Azure Documentation", "provider": "Microsoft", "resource_type": "article", "url": "https://learn.microsoft.com/en-us/azure/", "estimated_hours": 20},
        {"difficulty": "advanced", "title": "Azure Architecture", "provider": "Microsoft", "resource_type": "article", "url": "https://learn.microsoft.com/en-us/azure/architecture/", "estimated_hours": 20},
    ],
    "gcp": [
        {"difficulty": "beginner", "title": "Google Cloud Fundamentals", "provider": "Google Cloud", "resource_type": "course", "url": "https://cloud.google.com/learn/training", "estimated_hours": 10},
        {"difficulty": "intermediate", "title": "Google Cloud Documentation", "provider": "Google Cloud", "resource_type": "article", "url": "https://cloud.google.com/docs", "estimated_hours": 20},
        {"difficulty": "advanced", "title": "Google Cloud Architecture", "provider": "Google Cloud", "resource_type": "article", "url": "https://cloud.google.com/architecture", "estimated_hours": 20},
    ],
    "linux": [
        {"difficulty": "beginner", "title": "Linux Journey", "provider": "Linux Journey", "resource_type": "course", "url": "https://linuxjourney.com/", "estimated_hours": 8},
        {"difficulty": "intermediate", "title": "Linux Command Line", "provider": "Ubuntu", "resource_type": "article", "url": "https://ubuntu.com/tutorials/command-line-for-beginners", "estimated_hours": 8},
        {"difficulty": "advanced", "title": "Linux Documentation", "provider": "Linux", "resource_type": "article", "url": "https://www.kernel.org/doc/html/latest/", "estimated_hours": 20},
    ],
    "bash": [
        {"difficulty": "beginner", "title": "Bash Scripting Tutorial", "provider": "LinuxConfig", "resource_type": "article", "url": "https://linuxconfig.org/bash-scripting-tutorial-for-beginners", "estimated_hours": 6},
        {"difficulty": "intermediate", "title": "Advanced Bash-Scripting Guide", "provider": "TLDP", "resource_type": "book", "url": "https://tldp.org/LDP/abs/html/", "estimated_hours": 15},
        {"difficulty": "advanced", "title": "Bash Reference Manual", "provider": "GNU", "resource_type": "article", "url": "https://www.gnu.org/software/bash/manual/bash.html", "estimated_hours": 15},
    ],
    "rest api": [
        {"difficulty": "beginner", "title": "REST API Tutorial", "provider": "REST API Tutorial", "resource_type": "article", "url": "https://restfulapi.net/", "estimated_hours": 6},
        {"difficulty": "intermediate", "title": "HTTP and REST", "provider": "MDN", "resource_type": "article", "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP", "estimated_hours": 10},
        {"difficulty": "advanced", "title": "OpenAPI Specification", "provider": "OpenAPI", "resource_type": "article", "url": "https://swagger.io/specification/", "estimated_hours": 12},
    ],
    "graphql": [
        {"difficulty": "beginner", "title": "GraphQL Learn", "provider": "GraphQL", "resource_type": "article", "url": "https://graphql.org/learn/", "estimated_hours": 8},
        {"difficulty": "intermediate", "title": "Apollo GraphQL Docs", "provider": "Apollo", "resource_type": "article", "url": "https://www.apollographql.com/docs/", "estimated_hours": 15},
        {"difficulty": "advanced", "title": "GraphQL Specification", "provider": "GraphQL", "resource_type": "article", "url": "https://spec.graphql.org/", "estimated_hours": 15},
    ],
    "machine learning": [
        {"difficulty": "beginner", "title": "Machine Learning Crash Course", "provider": "Google", "resource_type": "course", "url": "https://developers.google.com/machine-learning/crash-course", "estimated_hours": 20},
        {"difficulty": "intermediate", "title": "Intro to Machine Learning", "provider": "Kaggle", "resource_type": "course", "url": "https://www.kaggle.com/learn/intro-to-machine-learning", "estimated_hours": 15},
        {"difficulty": "advanced", "title": "Machine Learning Specialization", "provider": "Coursera", "resource_type": "course", "url": "https://www.coursera.org/specializations/machine-learning-introduction", "estimated_hours": 60},
    ],
    "deep learning": [
        {"difficulty": "beginner", "title": "Deep Learning", "provider": "fast.ai", "resource_type": "course", "url": "https://www.fast.ai/", "estimated_hours": 25},
        {"difficulty": "intermediate", "title": "Deep Learning Specialization", "provider": "Coursera", "resource_type": "course", "url": "https://www.coursera.org/specializations/deep-learning", "estimated_hours": 60},
        {"difficulty": "advanced", "title": "Dive into Deep Learning", "provider": "D2L", "resource_type": "book", "url": "https://d2l.ai/", "estimated_hours": 80},
    ],
    "natural language processing": [
        {"difficulty": "beginner", "title": "NLP Course", "provider": "Hugging Face", "resource_type": "course", "url": "https://huggingface.co/learn/nlp-course/chapter1/1", "estimated_hours": 20},
        {"difficulty": "intermediate", "title": "spaCy Usage", "provider": "spaCy", "resource_type": "article", "url": "https://spacy.io/usage", "estimated_hours": 12},
        {"difficulty": "advanced", "title": "Transformers Documentation", "provider": "Hugging Face", "resource_type": "article", "url": "https://huggingface.co/docs/transformers/index", "estimated_hours": 30},
    ],
    "data analysis": [
        {"difficulty": "beginner", "title": "Data Analysis with Python", "provider": "freeCodeCamp", "resource_type": "course", "url": "https://www.freecodecamp.org/learn/data-analysis-with-python/", "estimated_hours": 30},
        {"difficulty": "intermediate", "title": "Kaggle Data Cleaning", "provider": "Kaggle", "resource_type": "course", "url": "https://www.kaggle.com/learn/data-cleaning", "estimated_hours": 12},
        {"difficulty": "advanced", "title": "Pandas Documentation", "provider": "pandas", "resource_type": "article", "url": "https://pandas.pydata.org/docs/", "estimated_hours": 20},
    ],
    "pandas": [
        {"difficulty": "beginner", "title": "Pandas Getting Started", "provider": "pandas", "resource_type": "article", "url": "https://pandas.pydata.org/docs/getting_started/index.html", "estimated_hours": 8},
        {"difficulty": "intermediate", "title": "Pandas User Guide", "provider": "pandas", "resource_type": "article", "url": "https://pandas.pydata.org/docs/user_guide/index.html", "estimated_hours": 20},
        {"difficulty": "advanced", "title": "Pandas API Reference", "provider": "pandas", "resource_type": "article", "url": "https://pandas.pydata.org/docs/reference/index.html", "estimated_hours": 15},
    ],
    "numpy": [
        {"difficulty": "beginner", "title": "NumPy Quickstart", "provider": "NumPy", "resource_type": "article", "url": "https://numpy.org/doc/stable/user/quickstart.html", "estimated_hours": 6},
        {"difficulty": "intermediate", "title": "NumPy User Guide", "provider": "NumPy", "resource_type": "article", "url": "https://numpy.org/doc/stable/user/index.html", "estimated_hours": 15},
        {"difficulty": "advanced", "title": "NumPy Reference", "provider": "NumPy", "resource_type": "article", "url": "https://numpy.org/doc/stable/reference/index.html", "estimated_hours": 15},
    ],
    "scikit-learn": [
        {"difficulty": "beginner", "title": "scikit-learn Getting Started", "provider": "scikit-learn", "resource_type": "article", "url": "https://scikit-learn.org/stable/getting_started.html", "estimated_hours": 8},
        {"difficulty": "intermediate", "title": "scikit-learn User Guide", "provider": "scikit-learn", "resource_type": "article", "url": "https://scikit-learn.org/stable/user_guide.html", "estimated_hours": 25},
        {"difficulty": "advanced", "title": "scikit-learn API", "provider": "scikit-learn", "resource_type": "article", "url": "https://scikit-learn.org/stable/api/index.html", "estimated_hours": 20},
    ],
    "tensorflow": [
        {"difficulty": "beginner", "title": "TensorFlow Tutorials", "provider": "TensorFlow", "resource_type": "article", "url": "https://www.tensorflow.org/tutorials", "estimated_hours": 20},
        {"difficulty": "intermediate", "title": "TensorFlow Guide", "provider": "TensorFlow", "resource_type": "article", "url": "https://www.tensorflow.org/guide", "estimated_hours": 30},
        {"difficulty": "advanced", "title": "TensorFlow API", "provider": "TensorFlow", "resource_type": "article", "url": "https://www.tensorflow.org/api_docs", "estimated_hours": 25},
    ],
    "pytorch": [
        {"difficulty": "beginner", "title": "PyTorch Tutorials", "provider": "PyTorch", "resource_type": "article", "url": "https://pytorch.org/tutorials/", "estimated_hours": 20},
        {"difficulty": "intermediate", "title": "PyTorch Recipes", "provider": "PyTorch", "resource_type": "article", "url": "https://pytorch.org/tutorials/recipes/recipes_index.html", "estimated_hours": 20},
        {"difficulty": "advanced", "title": "PyTorch Documentation", "provider": "PyTorch", "resource_type": "article", "url": "https://pytorch.org/docs/stable/", "estimated_hours": 25},
    ],
    "power bi": [
        {"difficulty": "beginner", "title": "Power BI Guided Learning", "provider": "Microsoft", "resource_type": "course", "url": "https://learn.microsoft.com/en-us/training/powerplatform/power-bi", "estimated_hours": 12},
        {"difficulty": "intermediate", "title": "Power BI Documentation", "provider": "Microsoft", "resource_type": "article", "url": "https://learn.microsoft.com/en-us/power-bi/", "estimated_hours": 20},
        {"difficulty": "advanced", "title": "DAX Reference", "provider": "Microsoft", "resource_type": "article", "url": "https://learn.microsoft.com/en-us/dax/", "estimated_hours": 20},
    ],
    "tableau": [
        {"difficulty": "beginner", "title": "Tableau Training", "provider": "Tableau", "resource_type": "course", "url": "https://www.tableau.com/learn/training", "estimated_hours": 12},
        {"difficulty": "intermediate", "title": "Tableau Help", "provider": "Tableau", "resource_type": "article", "url": "https://help.tableau.com/current/pro/desktop/en-us/", "estimated_hours": 20},
        {"difficulty": "advanced", "title": "Tableau Server", "provider": "Tableau", "resource_type": "article", "url": "https://help.tableau.com/current/server/en-us/", "estimated_hours": 20},
    ],
    "excel": [
        {"difficulty": "beginner", "title": "Excel Training", "provider": "Microsoft", "resource_type": "course", "url": "https://support.microsoft.com/en-us/office/excel-training-9bc05390-e94c-46af-a5b3-d7c22f6990bb", "estimated_hours": 8},
        {"difficulty": "intermediate", "title": "Excel Functions", "provider": "Microsoft", "resource_type": "article", "url": "https://support.microsoft.com/en-us/office/excel-functions-by-category-5f91f4e9-7b42-46d2-9bd1-63f26a86c0eb", "estimated_hours": 10},
        {"difficulty": "advanced", "title": "Excel Power Query", "provider": "Microsoft", "resource_type": "article", "url": "https://support.microsoft.com/en-us/office/power-query-overview-and-learning-guide-49904443-380a-4757-8726-41d600807fc3", "estimated_hours": 15},
    ],
    "figma": [
        {"difficulty": "beginner", "title": "Figma Learn", "provider": "Figma", "resource_type": "article", "url": "https://help.figma.com/hc/en-us", "estimated_hours": 8},
        {"difficulty": "intermediate", "title": "Figma Tutorials", "provider": "Figma", "resource_type": "article", "url": "https://help.figma.com/hc/en-us/categories/360002051613-Get-started", "estimated_hours": 10},
        {"difficulty": "advanced", "title": "Figma Best Practices", "provider": "Figma", "resource_type": "article", "url": "https://help.figma.com/hc/en-us/sections/4405269443991-Best-practices", "estimated_hours": 12},
    ],
    "testing": [
        {"difficulty": "beginner", "title": "Software Testing", "provider": "Guru99", "resource_type": "article", "url": "https://www.guru99.com/software-testing.html", "estimated_hours": 8},
        {"difficulty": "intermediate", "title": "PyTest Documentation", "provider": "pytest", "resource_type": "article", "url": "https://docs.pytest.org/en/stable/", "estimated_hours": 12},
        {"difficulty": "advanced", "title": "Testing Best Practices", "provider": "Google", "resource_type": "article", "url": "https://testing.googleblog.com/", "estimated_hours": 15},
    ],
    "ci/cd": [
        {"difficulty": "beginner", "title": "GitHub Actions", "provider": "GitHub", "resource_type": "article", "url": "https://docs.github.com/en/actions", "estimated_hours": 8},
        {"difficulty": "intermediate", "title": "CI/CD Concepts", "provider": "GitLab", "resource_type": "article", "url": "https://docs.gitlab.com/ee/ci/", "estimated_hours": 15},
        {"difficulty": "advanced", "title": "Jenkins Documentation", "provider": "Jenkins", "resource_type": "article", "url": "https://www.jenkins.io/doc/", "estimated_hours": 20},
    ],
    "java spring": [
        {"difficulty": "beginner", "title": "Spring Boot", "provider": "Spring", "resource_type": "article", "url": "https://spring.io/guides/gs/spring-boot/", "estimated_hours": 10},
        {"difficulty": "intermediate", "title": "Spring Guides", "provider": "Spring", "resource_type": "article", "url": "https://spring.io/guides", "estimated_hours": 25},
        {"difficulty": "advanced", "title": "Spring Documentation", "provider": "Spring", "resource_type": "article", "url": "https://docs.spring.io/spring-boot/docs/current/reference/html/", "estimated_hours": 30},
    ],
    "bootstrap": [
        {"difficulty": "beginner", "title": "Bootstrap", "provider": "Bootstrap", "resource_type": "article", "url": "https://getbootstrap.com/docs/5.3/getting-started/introduction/", "estimated_hours": 6},
        {"difficulty": "intermediate", "title": "Bootstrap Components", "provider": "Bootstrap", "resource_type": "article", "url": "https://getbootstrap.com/docs/5.3/components/", "estimated_hours": 10},
        {"difficulty": "advanced", "title": "Bootstrap Customize", "provider": "Bootstrap", "resource_type": "article", "url": "https://getbootstrap.com/docs/5.3/customize/overview/", "estimated_hours": 10},
    ],
    "tailwind css": [
        {"difficulty": "beginner", "title": "Tailwind CSS", "provider": "Tailwind", "resource_type": "article", "url": "https://tailwindcss.com/docs/installation", "estimated_hours": 6},
        {"difficulty": "intermediate", "title": "Tailwind Utility-First", "provider": "Tailwind", "resource_type": "article", "url": "https://tailwindcss.com/docs/utility-first", "estimated_hours": 8},
        {"difficulty": "advanced", "title": "Tailwind Configuration", "provider": "Tailwind", "resource_type": "article", "url": "https://tailwindcss.com/docs/configuration", "estimated_hours": 10},
    ],
    "c": [
        {"difficulty": "beginner", "title": "C Tutorial", "provider": "W3Schools", "resource_type": "article", "url": "https://www.w3schools.com/c/", "estimated_hours": 15},
        {"difficulty": "intermediate", "title": "C Programming", "provider": "GeeksforGeeks", "resource_type": "article", "url": "https://www.geeksforgeeks.org/c-programming-language/", "estimated_hours": 25},
        {"difficulty": "advanced", "title": "C Reference", "provider": "cppreference", "resource_type": "article", "url": "https://en.cppreference.com/w/c", "estimated_hours": 20},
    ],
    "c++": [
        {"difficulty": "beginner", "title": "C++ Tutorial", "provider": "W3Schools", "resource_type": "article", "url": "https://www.w3schools.com/cpp/", "estimated_hours": 20},
        {"difficulty": "intermediate", "title": "C++ Reference", "provider": "cppreference", "resource_type": "article", "url": "https://en.cppreference.com/w/", "estimated_hours": 30},
        {"difficulty": "advanced", "title": "Modern C++", "provider": "cppreference", "resource_type": "article", "url": "https://en.cppreference.com/w/cpp", "estimated_hours": 30},
    ],
    "c#": [
        {"difficulty": "beginner", "title": "C# Tutorial", "provider": "Microsoft Learn", "resource_type": "article", "url": "https://learn.microsoft.com/en-us/dotnet/csharp/tour-of-csharp/", "estimated_hours": 15},
        {"difficulty": "intermediate", "title": "C# Documentation", "provider": "Microsoft", "resource_type": "article", "url": "https://learn.microsoft.com/en-us/dotnet/csharp/", "estimated_hours": 25},
        {"difficulty": "advanced", "title": ".NET Documentation", "provider": "Microsoft", "resource_type": "article", "url": "https://learn.microsoft.com/en-us/dotnet/", "estimated_hours": 30},
    ],
}
