// TutorX AI Curriculum & Glossary Database

const chapterMasteryQuestions = {
  1: [
    {
      text: "Let A = {1, 2} and B = {3, 4}. Which set is A x B?",
      options: ["{(1,3), (1,4), (2,3), (2,4)}", "{(1,2), (3,4)}", "{(3,1), (4,1), (3,2), (4,2)}", "{1, 2, 3, 4}"],
      answer: 0,
      explanation: "A x B contains every ordered pair whose first element is from A and second element is from B.",
      difficulty: "easy",
      skill: "application",
      weakArea: "Cartesian product",
      recommendation: "Practise forming ordered pairs from two finite sets."
    },
    {
      text: "Which relation from A = {1, 2, 3} to B = {4, 5, 6} is a function?",
      options: ["{(1,4), (2,5), (3,6)}", "{(1,4), (1,5), (2,6)}", "{(1,4), (2,4), (2,5)}", "{(1,4), (3,5)}"],
      answer: 0,
      explanation: "A function assigns each input exactly one output.",
      difficulty: "medium",
      skill: "concept",
      weakArea: "Function rule",
      recommendation: "Review the rule that one input cannot have two different images."
    },
    {
      text: "If f(x) = 2x - 3 and g(x) = x + 5, what is f(g(4))?",
      options: ["15", "13", "10", "6"],
      answer: 0,
      explanation: "g(4) = 9, then f(9) = 2(9) - 3 = 15.",
      difficulty: "hard",
      skill: "problem_solving",
      weakArea: "Composition of functions",
      recommendation: "Practise evaluating inner functions first, then outer functions."
    },
    {
      text: "The graph y = x^2 is best described as which type of function graph?",
      options: ["Quadratic", "Linear", "Cubic", "Reciprocal"],
      answer: 0,
      explanation: "A function with x squared as the highest power has a quadratic graph.",
      difficulty: "medium",
      skill: "concept",
      weakArea: "Graph identification",
      recommendation: "Compare the shapes of linear, quadratic, cubic, and reciprocal graphs."
    }
  ],
  2: [
    {
      text: "Using Euclid's division lemma, if a = 47 and b = 5, what are q and r?",
      options: ["q = 9, r = 2", "q = 8, r = 7", "q = 10, r = -3", "q = 7, r = 12"],
      answer: 0,
      explanation: "47 = 5 x 9 + 2, and the remainder must satisfy 0 <= r < 5.",
      difficulty: "easy",
      skill: "formula",
      weakArea: "Euclid's division lemma",
      recommendation: "Practise writing a = bq + r with a valid remainder."
    },
    {
      text: "Find the 12th term of the AP 7, 11, 15, ...",
      options: ["51", "48", "55", "44"],
      answer: 0,
      explanation: "a = 7, d = 4. a12 = a + 11d = 7 + 44 = 51.",
      difficulty: "medium",
      skill: "numerical",
      weakArea: "AP nth term",
      recommendation: "Revise a_n = a + (n - 1)d and identify d first."
    },
    {
      text: "What is the sum of the first 10 terms of the AP 3, 6, 9, ...?",
      options: ["165", "150", "135", "180"],
      answer: 0,
      explanation: "S10 = 10/2[2(3) + 9(3)] = 5(33) = 165.",
      difficulty: "medium",
      skill: "problem_solving",
      weakArea: "AP sum",
      recommendation: "Practise choosing between nth-term and sum formulas."
    },
    {
      text: "For the GP 2, 6, 18, ..., what is the 5th term?",
      options: ["162", "54", "108", "216"],
      answer: 0,
      explanation: "The common ratio is 3. The 5th term is ar^(4) = 2 x 3^4 = 162.",
      difficulty: "hard",
      skill: "application",
      weakArea: "GP nth term",
      recommendation: "Review how common ratio controls each term of a GP."
    }
  ],
  3: [
    {
      text: "Solve x^2 - 5x + 6 = 0.",
      options: ["x = 2, 3", "x = -2, -3", "x = 1, 6", "x = 0, 5"],
      answer: 0,
      explanation: "x^2 - 5x + 6 = (x - 2)(x - 3), so x = 2 or x = 3.",
      difficulty: "easy",
      skill: "problem_solving",
      weakArea: "Quadratic factorisation",
      recommendation: "Practise finding two numbers whose sum and product match the quadratic."
    },
    {
      text: "For 2x^2 + 3x - 2 = 0, what is the discriminant?",
      options: ["25", "7", "-7", "13"],
      answer: 0,
      explanation: "D = b^2 - 4ac = 3^2 - 4(2)(-2) = 9 + 16 = 25.",
      difficulty: "medium",
      skill: "formula",
      weakArea: "Discriminant",
      recommendation: "Revise D = b^2 - 4ac and sign handling."
    },
    {
      text: "Which condition shows that two linear equations in two variables have no solution?",
      options: ["a1/a2 = b1/b2 not equal to c1/c2", "a1/a2 not equal to b1/b2", "a1/a2 = b1/b2 = c1/c2", "Both equations are identical only"],
      answer: 0,
      explanation: "Parallel distinct lines have equal coefficient ratios but a different constant ratio.",
      difficulty: "hard",
      skill: "higher_order",
      weakArea: "Linear equation consistency",
      recommendation: "Practise comparing coefficient ratios for pairs of linear equations."
    },
    {
      text: "If A is a 2 x 3 matrix and B is a 3 x 2 matrix, what is the order of AB?",
      options: ["2 x 2", "3 x 3", "2 x 3", "3 x 2"],
      answer: 0,
      explanation: "For matrix multiplication, outer dimensions give the result order: 2 x 2.",
      difficulty: "medium",
      skill: "concept",
      weakArea: "Matrix order",
      recommendation: "Review when matrix multiplication is possible and how to find result order."
    }
  ],
  4: [
    {
      text: "In a right triangle, if the legs are 6 cm and 8 cm, what is the hypotenuse?",
      options: ["10 cm", "12 cm", "14 cm", "7 cm"],
      answer: 0,
      explanation: "By Pythagoras theorem, h^2 = 6^2 + 8^2 = 100, so h = 10 cm.",
      difficulty: "easy",
      skill: "numerical",
      weakArea: "Pythagoras theorem",
      recommendation: "Practise identifying hypotenuse and applying a^2 + b^2 = c^2."
    },
    {
      text: "A tangent touches a circle at P and OP is the radius. What is the angle between OP and the tangent?",
      options: ["90 degrees", "45 degrees", "60 degrees", "180 degrees"],
      answer: 0,
      explanation: "The radius to the point of contact is perpendicular to the tangent.",
      difficulty: "easy",
      skill: "concept",
      weakArea: "Tangent-radius theorem",
      recommendation: "Revise circle tangent properties with diagrams."
    },
    {
      text: "If two triangles are similar and the ratio of corresponding sides is 2:3, what is the ratio of their areas?",
      options: ["4:9", "2:3", "8:27", "3:2"],
      answer: 0,
      explanation: "Areas of similar triangles are in the square of the side ratio: 2^2:3^2 = 4:9.",
      difficulty: "hard",
      skill: "higher_order",
      weakArea: "Similarity and area ratio",
      recommendation: "Practise converting side ratio into area ratio for similar triangles."
    },
    {
      text: "The medians of a triangle meet at which point?",
      options: ["Centroid", "Incentre", "Circumcentre", "Orthocentre"],
      answer: 0,
      explanation: "The three medians of a triangle are concurrent at the centroid.",
      difficulty: "medium",
      skill: "concept",
      weakArea: "Concurrency points",
      recommendation: "Revise centroid, incentre, circumcentre, and orthocentre."
    }
  ],
  5: [
    {
      text: "Find the distance between (2, 3) and (5, 7).",
      options: ["5", "7", "25", "4"],
      answer: 0,
      explanation: "Distance = sqrt((5 - 2)^2 + (7 - 3)^2) = sqrt(9 + 16) = 5.",
      difficulty: "easy",
      skill: "numerical",
      weakArea: "Distance formula",
      recommendation: "Practise substituting coordinates carefully in the distance formula."
    },
    {
      text: "What is the area of the triangle with vertices (0,0), (4,0), and (0,3)?",
      options: ["6 square units", "7 square units", "12 square units", "3 square units"],
      answer: 0,
      explanation: "The base is 4 and height is 3, so area = 1/2 x 4 x 3 = 6.",
      difficulty: "medium",
      skill: "application",
      weakArea: "Area using coordinates",
      recommendation: "Practise identifying base and height from coordinate points."
    },
    {
      text: "Which is the slope of the line joining (1, 2) and (3, 8)?",
      options: ["3", "2", "1/3", "6"],
      answer: 0,
      explanation: "Slope = (8 - 2)/(3 - 1) = 6/2 = 3.",
      difficulty: "medium",
      skill: "formula",
      weakArea: "Slope/inclination",
      recommendation: "Review slope as change in y divided by change in x."
    },
    {
      text: "Which point lies on the line 2x + y - 5 = 0?",
      options: ["(2, 1)", "(1, 1)", "(0, 4)", "(3, 2)"],
      answer: 0,
      explanation: "For (2,1), 2(2) + 1 - 5 = 0, so the point lies on the line.",
      difficulty: "hard",
      skill: "problem_solving",
      weakArea: "Straight line equation",
      recommendation: "Practise substituting points into ax + by + c = 0."
    }
  ],
  6: [
    {
      text: "If sin A = 3/5 in a right triangle, what is cos A when the adjacent side is 4?",
      options: ["4/5", "3/4", "5/4", "5/3"],
      answer: 0,
      explanation: "sin A = opposite/hypotenuse = 3/5, so adjacent is 4 and cos A = 4/5.",
      difficulty: "easy",
      skill: "concept",
      weakArea: "Trigonometric ratios",
      recommendation: "Practise identifying opposite, adjacent, and hypotenuse."
    },
    {
      text: "Which identity is always true?",
      options: ["sin^2 A + cos^2 A = 1", "sin A + cos A = 1", "tan A = sin A + cos A", "sec A = cos A"],
      answer: 0,
      explanation: "The fundamental identity is sin^2 A + cos^2 A = 1.",
      difficulty: "medium",
      skill: "formula",
      weakArea: "Trigonometric identities",
      recommendation: "Memorise and apply the standard identities."
    },
    {
      text: "A pole casts a 20 m shadow when the angle of elevation is 45 degrees. What is the height of the pole?",
      options: ["20 m", "10 m", "40 m", "20sqrt(3) m"],
      answer: 0,
      explanation: "tan 45 = height/shadow = h/20. Since tan 45 = 1, h = 20 m.",
      difficulty: "medium",
      skill: "application",
      weakArea: "Heights and distances",
      recommendation: "Draw the right triangle before choosing sin, cos, or tan."
    },
    {
      text: "If tan A = 1 and A is acute, what is A?",
      options: ["45 degrees", "30 degrees", "60 degrees", "90 degrees"],
      answer: 0,
      explanation: "For an acute angle, tan A = 1 when A = 45 degrees.",
      difficulty: "hard",
      skill: "problem_solving",
      weakArea: "Standard trigonometric values",
      recommendation: "Revise standard values for 0, 30, 45, 60, and 90 degrees."
    }
  ],
  7: [
    {
      text: "Find the volume of a cylinder with radius 7 cm and height 10 cm. Use pi = 22/7.",
      options: ["1540 cubic cm", "440 cubic cm", "770 cubic cm", "220 cubic cm"],
      answer: 0,
      explanation: "Volume = pi r^2 h = 22/7 x 7 x 7 x 10 = 1540 cubic cm.",
      difficulty: "easy",
      skill: "numerical",
      weakArea: "Cylinder volume",
      recommendation: "Practise selecting correct mensuration formulas before substituting."
    },
    {
      text: "What is the total surface area of a cube of side 5 cm?",
      options: ["150 square cm", "125 square cm", "100 square cm", "25 square cm"],
      answer: 0,
      explanation: "Total surface area of a cube is 6a^2 = 6 x 25 = 150 square cm.",
      difficulty: "easy",
      skill: "formula",
      weakArea: "Surface area",
      recommendation: "Revise curved surface area, total surface area, and volume separately."
    },
    {
      text: "A solid is melted and recast without loss. Which quantity remains unchanged?",
      options: ["Volume", "Surface area", "Radius", "Height"],
      answer: 0,
      explanation: "During conversion of solids without loss, volume remains the same.",
      difficulty: "medium",
      skill: "concept",
      weakArea: "Conversion of solids",
      recommendation: "Practise equating volumes when one solid is converted into another."
    },
    {
      text: "A cone and cylinder have the same radius and height. What is the ratio of cone volume to cylinder volume?",
      options: ["1:3", "3:1", "1:2", "2:3"],
      answer: 0,
      explanation: "Cone volume = 1/3 pi r^2 h, while cylinder volume = pi r^2 h.",
      difficulty: "hard",
      skill: "higher_order",
      weakArea: "Comparing solid volumes",
      recommendation: "Practise comparing formulas by cancelling common terms."
    }
  ],
  8: [
    {
      text: "Find the probability of getting an even number when one fair die is rolled.",
      options: ["1/2", "1/3", "2/3", "1/6"],
      answer: 0,
      explanation: "Even outcomes are 2, 4, 6. Probability = 3/6 = 1/2.",
      difficulty: "easy",
      skill: "concept",
      weakArea: "Basic probability",
      recommendation: "Practise listing total outcomes and favourable outcomes."
    },
    {
      text: "For data 4, 6, 8, 10, what is the mean?",
      options: ["7", "8", "6", "28"],
      answer: 0,
      explanation: "Mean = (4 + 6 + 8 + 10) / 4 = 28 / 4 = 7.",
      difficulty: "easy",
      skill: "numerical",
      weakArea: "Mean",
      recommendation: "Review mean, range, and measures of dispersion."
    },
    {
      text: "If A and B are mutually exclusive events, then P(A union B) equals",
      options: ["P(A) + P(B)", "P(A)P(B)", "P(A) - P(B)", "P(A) + P(B) - P(A)P(B)"],
      answer: 0,
      explanation: "Mutually exclusive events cannot occur together, so P(A intersection B) = 0.",
      difficulty: "medium",
      skill: "formula",
      weakArea: "Addition theorem of probability",
      recommendation: "Practise identifying whether events overlap."
    },
    {
      text: "Two data sets have the same mean. Which measure helps compare their consistency?",
      options: ["Coefficient of variation", "Total frequency", "Median only", "Mode only"],
      answer: 0,
      explanation: "Coefficient of variation compares relative dispersion and consistency.",
      difficulty: "hard",
      skill: "higher_order",
      weakArea: "Coefficient of variation",
      recommendation: "Revise how standard deviation and coefficient of variation measure spread."
    }
  ]
};

function buildMasteryQuestions(subjectPrefix, chapterNo, sectionNo, title) {
  const chapterQuestions = chapterMasteryQuestions[chapterNo] ?? [];
  return chapterQuestions.map((question, index) => ({
    id: `${subjectPrefix}-ch${chapterNo}-sec-${sectionNo.replace('.', '-')}-m${index + 1}`,
    sectionNo,
    topicTitle: title,
    ...question
  }));
}

function createTopic(subjectPrefix, chapterNo, sectionNo, title, summary) {
  const safeTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return {
    id: `${subjectPrefix}-ch${chapterNo}-sec-${sectionNo.replace('.', '-')}-${safeTitle}`,
    chapterNo,
    sectionNo,
    title,
    summary,
    questions: buildMasteryQuestions(subjectPrefix, chapterNo, sectionNo, title),
    dialogue: [
      {
        sender: "tutor",
        content: `Let's study **${title}** from **Section ${sectionNo}**.

${summary}

Ask me **"Explain ${title}"** or type any doubt. When the backend is online, I will use the stored textbook PDF knowledge base.`
      }
    ]
  };
}

const math = (chapterNo, sectionNo, title, summary) =>
  createTopic("mat", chapterNo, sectionNo, title, summary);

export const curriculumData = {
  maths: {
    title: "Class 10 Mathematics",
    chapters: [
      {
        id: "mat-ch1",
        title: "Chapter 1: Relations and Functions",
        topics: [
          math(1, "1.1", "Introduction", "Understand how sets lead into relations and functions."),
          math(1, "1.2", "Ordered Pair", "Learn why order matters in pairs such as row-seat positions."),
          math(1, "1.3", "Cartesian Product", "Form all ordered pairs from two sets A and B."),
          math(1, "1.4", "Relations", "Study relations as subsets of Cartesian products."),
          math(1, "1.5", "Functions", "Understand functions as relations with exactly one output for each input."),
          math(1, "1.6", "Representation of Functions", "Represent functions using arrow diagrams, ordered pairs, tables, rules and graphs."),
          math(1, "1.7", "Types of Functions", "Classify one-one, many-one, onto, into and bijective functions."),
          math(1, "1.8", "Special Cases of Functions", "Study identity, constant and other special functions."),
          math(1, "1.9", "Composition of Functions", "Combine functions and evaluate composite mappings."),
          math(1, "1.10", "Identifying Graphs of Linear, Quadratic, Cubic and Reciprocal Functions", "Recognize common functions from their graph shapes.")
        ]
      },
      {
        id: "mat-ch2",
        title: "Chapter 2: Numbers and Sequences",
        topics: [
          math(2, "2.1", "Introduction", "Begin number theory and sequence concepts."),
          math(2, "2.2", "Euclid's Division Lemma", "Use a = bq + r for integer division."),
          math(2, "2.3", "Euclid's Division Algorithm", "Find HCF using repeated division."),
          math(2, "2.4", "Fundamental Theorem of Arithmetic", "Express numbers uniquely as products of primes."),
          math(2, "2.5", "Modular Arithmetic", "Work with remainders and congruence."),
          math(2, "2.6", "Sequences", "Identify ordered number patterns."),
          math(2, "2.7", "Arithmetic Progression", "Use common difference and nth-term formulas."),
          math(2, "2.8", "Series", "Add sequence terms using standard methods."),
          math(2, "2.9", "Geometric Progression", "Study sequences with a common ratio."),
          math(2, "2.10", "Sum to n terms of a Geometric Progression", "Calculate finite GP sums."),
          math(2, "2.11", "Special Series", "Use formulas for special sums and patterns.")
        ]
      },
      {
        id: "mat-ch3",
        title: "Chapter 3: Algebra",
        topics: [
          math(3, "3.1", "Introduction", "Begin algebraic methods for equations, polynomials and matrices."),
          math(3, "3.2", "Simultaneous Linear Equations in Three Variables", "Solve three-variable linear systems."),
          math(3, "3.3", "GCD and LCM of Polynomials", "Find polynomial common factors and multiples."),
          math(3, "3.4", "Rational Expressions", "Simplify algebraic fractions."),
          math(3, "3.5", "Square Root of Polynomials", "Find square roots of polynomial expressions."),
          math(3, "3.6", "Quadratic Equations", "Solve ax^2 + bx + c = 0."),
          math(3, "3.7", "Graph of Variations", "Interpret direct, inverse and joint variations."),
          math(3, "3.8", "Quadratic Graphs", "Draw and understand parabolic graphs."),
          math(3, "3.9", "Matrices", "Learn matrix order, operations and applications.")
        ]
      },
      {
        id: "mat-ch4",
        title: "Chapter 4: Geometry",
        topics: [
          math(4, "4.1", "Introduction", "Begin geometry theorems involving similarity, circles and concurrency."),
          math(4, "4.2", "Similarity", "Understand similar triangles and proportional sides."),
          math(4, "4.3", "Thales Theorem and Angle Bisector Theorem", "Apply proportionality theorems in triangles."),
          math(4, "4.4", "Pythagoras Theorem", "Use right-triangle side relationships."),
          math(4, "4.5", "Circles and Tangents", "Study tangents, radii and circle angle properties."),
          math(4, "4.6", "Concurrency Theorems", "Learn concurrence of medians, altitudes and bisectors.")
        ]
      },
      {
        id: "mat-ch5",
        title: "Chapter 5: Coordinate Geometry",
        topics: [
          math(5, "5.1", "Introduction", "Connect algebra and geometry through coordinates."),
          math(5, "5.2", "Area of a Triangle", "Find triangle area from coordinates."),
          math(5, "5.3", "Area of a Quadrilateral", "Calculate quadrilateral area using coordinate methods."),
          math(5, "5.4", "Inclination of a Line", "Understand slope and angle of inclination."),
          math(5, "5.5", "Straight Line", "Study equations and properties of straight lines."),
          math(5, "5.6", "General Form of a Straight Line", "Work with ax + by + c = 0.")
        ]
      },
      {
        id: "mat-ch6",
        title: "Chapter 6: Trigonometry",
        topics: [
          math(6, "6.1", "Introduction", "Begin trigonometric ratios and identities."),
          math(6, "6.2", "Trigonometric Identities", "Prove and apply standard identities."),
          math(6, "6.3", "Heights and Distances", "Solve real-world right-triangle problems.")
        ]
      },
      {
        id: "mat-ch7",
        title: "Chapter 7: Mensuration",
        topics: [
          math(7, "7.1", "Introduction", "Begin surface area and volume of solids."),
          math(7, "7.2", "Surface Area", "Find curved and total surface areas."),
          math(7, "7.3", "Volume", "Calculate volumes of solids."),
          math(7, "7.4", "Volume and Surface Area of Combined Solids", "Handle shapes made from multiple solids."),
          math(7, "7.5", "Conversion of Solids from one Shape to another with no change in Volume", "Solve conversion problems where volume is preserved.")
        ]
      },
      {
        id: "mat-ch8",
        title: "Chapter 8: Statistics and Probability",
        topics: [
          math(8, "8.1", "Introduction", "Begin data analysis and probability."),
          math(8, "8.2", "Measures of Dispersion", "Study range, mean deviation and spread."),
          math(8, "8.3", "Coefficient of Variation", "Compare consistency using coefficient of variation."),
          math(8, "8.4", "Probability", "Find probability using favourable and total outcomes."),
          math(8, "8.5", "Algebra of Events", "Understand union, intersection and complement of events."),
          math(8, "8.6", "Addition Theorem of Probability", "Use addition rules for event probabilities.")
        ]
      }
    ]
  }
};

export const glossaryData = [
  {
    english: "Cartesian Product",
    tamil: "Carteesian Perukkal",
    phonetic: "Carteesian Perukkal",
    category: "maths",
    definition: "The set of all ordered pairs formed from two sets.",
    example: "If A = {1, 2} and B = {x, y}, then A x B = {(1,x), (1,y), (2,x), (2,y)}."
  },
  {
    english: "Function",
    tamil: "Saarbu",
    phonetic: "Saarbu",
    category: "maths",
    definition: "A relation where each input has exactly one output.",
    example: "f(x) = x^2 maps each x to its square."
  },
  {
    english: "Arithmetic Progression",
    tamil: "Enkanitha Thodar",
    phonetic: "Enkanitha Thodar",
    category: "maths",
    definition: "A sequence where consecutive terms have a constant difference.",
    example: "3, 7, 11, 15 is an AP with common difference 4."
  },
  {
    english: "Probability",
    tamil: "Nigalthagavu",
    phonetic: "Nigalthagavu",
    category: "maths",
    definition: "A measure of the chance that an event will occur.",
    example: "Probability of getting heads in a coin toss is 1/2."
  },
  {
    english: "Quadratic Equation",
    tamil: "Irupadi Samanpadu",
    phonetic: "Irupadi Samanpadu",
    category: "maths",
    definition: "An equation in which the highest power of the variable is 2.",
    example: "x^2 - 5x + 6 = 0 is a quadratic equation."
  },
  {
    english: "Trigonometric Identity",
    tamil: "Trikonamiti Adaiyalam",
    phonetic: "Trikonamiti Adaiyalam",
    category: "maths",
    definition: "An equation involving trigonometric ratios that is true for all valid angle values.",
    example: "sin^2 A + cos^2 A = 1."
  },
  {
    english: "Coefficient of Variation",
    tamil: "Verupadu Gunagam",
    phonetic: "Verupadu Gunagam",
    category: "maths",
    definition: "A percentage measure used to compare variation between data sets.",
    example: "Lower coefficient of variation means the data set is more consistent."
  }
];
